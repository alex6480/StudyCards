import { Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import { IAppState } from "../../reducers";
import * as fromActions from "../../reducers/actions";
import { initialCard } from "../../reducers/card";
import * as fromSet from "../../reducers/set";
import IFlashCard, { ExportFlashCard, IFlashCardMeta } from "../flashcard/flashcard";
import { IFlashCardFace, IRichTextFlashCardFace } from "../flashcard/FlashCardFace";
import IFlashCardSet, { ExportFlashCardSet, IFlashCardFilter,
    IFlashCardSetMeta } from "../flashcard/FlashCardSet";
import parseCard from "../flashcard/parsers/parseCard";
import { ICardStudyData, ISetStudyData, ISetStudyDataMeta } from "../flashcard/StudyData";
import { IStudySession, IStudyState } from "../flashcard/StudyState";
import * as Study from "../study";
import * as Utils from "../utils";
import IStorageProvider from "./StorageProvider";

/**
 * A storage provider that stores all data in the browser local storage
 */
export class LocalStorageProvider implements IStorageProvider {
    private idDelimiter = ".";
    private virtualDelay: number;

    /**
     * Stores all data in the local storage so it is persistant between sessions
     * @param virtualDelay A simulated latency in ms that is added to all storage operations.
     * Used to emulate the experience with a remote storage source
     */
    constructor(virtualDelay: number = 0) {
        this.virtualDelay = virtualDelay;
    }

    public loadSetMetaAll(): ThunkAction<void, IAppState, void, fromActions.Action> {
        return (dispatch, getState) => {
            dispatch(fromActions.Action.loadSetMetaAllBegin());

            const setIds = this.getSetIds();
            const meta = setIds.reduce((result: {[id: string]: IFlashCardSetMeta}, item, index, array) => {
                // Assume that set meta exists since it's in the set id table
                const setMeta = this.getSetMeta(item)!;
                result[setMeta.id] = setMeta;
                return result;
            }, {});

            this.result(() => dispatch(fromActions.Action.loadSetMetaAllComplete(meta)));
        };
    }

    public addCard(setId: string, afterCard?: IFlashCard): ThunkAction<string, IAppState, void, fromActions.Action> {
        return (dispatch, getState) => {
            const cardId = Utils.guid();
            dispatch(fromActions.Action.addNewCardBegin(cardId, setId, afterCard));

            // Save the added card
            this.saveCard({
                ...initialCard,
                setId,
                id: cardId,
                tags: afterCard !== undefined ? afterCard.tags : [],
            });

            // Update the set meta table
            const setMeta = this.getSetMeta(setId);
            if (setMeta === null) {
                throw new Error("Set " + setId + " does not exist");
            }

            const newTagCount = Utils.calculateNewTagCount(setMeta.availableTags,
                                                            [],
                                                            afterCard !== undefined ? afterCard.tags : []);
            let cardOrder = setMeta.cardOrder;
            const afterIndex = afterCard !== undefined ? cardOrder.indexOf(afterCard.id) : -1;
            cardOrder = [...cardOrder.slice(0, afterIndex + 1), cardId, ...cardOrder.slice(afterIndex + 1)];
            this.saveSetMetaLocal({
                ...setMeta,
                cardOrder,
                availableTags: newTagCount,
            });

            this.result(() => dispatch(fromActions.Action.addNewCardComplete(setId, cardId)));

            return cardId;
        };
    }

    public deleteCard(setId: string, cardId: string): ThunkAction<void, IAppState, void, fromActions.Action> {
        return (dispatch, getState) => {
            dispatch(fromActions.Action.deleteCardBegin(setId, cardId));

            // Remove it from the card order and update the tags for the set
            const setMeta = this.getSetMeta(setId);
            const cardMeta = this.getCard(setId, cardId);
            if (setMeta !== null) {
                this.saveSetMetaLocal({
                    ...setMeta,
                    cardOrder: setMeta.cardOrder.filter(c => c !== cardId),
                    availableTags: Utils.calculateNewTagCount(setMeta.availableTags, cardMeta.tags, []),
                });
            }
            // Remove the card data
            localStorage.removeItem(this.cardKey(setId, cardId));

            console.log("DELETE STUDY DATA AS WELL");

            this.result(() => dispatch(fromActions.Action.deleteCardComplete(setId, cardId)));
        };
    }

    public addSet(set?: IFlashCardSet): ThunkAction<string, IAppState, void, fromActions.Action> {
        return (dispatch, getState) => {
            if (set === undefined || set.id === undefined) {
                set = {
                    ...fromSet.initialState,
                    id: Utils.guid(),
                };
            }
            const setId = set.id!;

            this.saveSet(set, true);
            this.saveSetStudyData({
                setId,
                cardData: {},
            }, []);

            dispatch(fromActions.Action.addSetBegin(setId, set));
            this.result(() => dispatch(fromActions.Action.addSetComplete(setId)));
            return setId;
        };
    }

    public setExists(setId: string, callback: (setExists: boolean) => void) {
        callback(this.getSetIds().indexOf(setId) !== -1);
    }

    public loadCards(setId: string, cardIds: string[]): ThunkAction<void, IAppState, void, fromActions.Action> {
        return (dispatch, getState) => {
            dispatch(fromActions.Action.loadCardsBegin(setId, cardIds));

            const cards: IFlashCard[] = [];
            const setMeta = this.getSetMeta(setId);
            if (setMeta === null) {
                throw new Error("Set " + setId + " does not exist");
            }
            for (const cardId of cardIds) {
                cards.push(this.getCard(setId, cardId));
            }

            this.result(() =>
                dispatch(fromActions.Action.loadCardsComplete(setId, Utils.arrayToObject(cards, c => [c.id, c]))));
        };
    }

    public loadStudyState(setId: string): ThunkAction<void, IAppState, void, fromActions.Action> {
        return (dispatch, getState) => {
            const setStudyData = this.getSetStudyData(setId);
            if (setStudyData === null) {
                throw new Error("No study data available for this set");
            }

            const result: IStudyState = {
                setId,
                newCardIds: Study.getNewCardIds(Object.keys(setStudyData.cardData), setStudyData),
                knownCardIds: Study.getKnownCardIds(Object.keys(setStudyData.cardData), setStudyData),
                currentSession: null,
            };

            dispatch(fromActions.Action.setStudyStateBegin());
            this.result(() => dispatch(fromActions.Action.setStudyStateComplete(result)));
        };
    }

    public saveCardFace(setId: string, cardId: string, face: IFlashCardFace):
            ThunkAction<void, IAppState, void, fromActions.Action> {
        return (dispatch, getState) => {
            dispatch(fromActions.Action.saveCardFaceBegin(setId, cardId, face));

            // Save the card face
            const card = this.getCard(setId, cardId);
            this.saveCard({
                ...card,
                setId,
                id: cardId,
                faces: {
                    ...card.faces,
                    [face.id]: face,
                },
            });

            this.result(() =>
                dispatch(fromActions.Action.saveCardFaceComplete(setId, cardId)));
        };
    }

    public saveCardMeta(setId: string, cardId: string, cardMeta: Partial<IFlashCardMeta>):
        ThunkAction<void, IAppState, void, fromActions.Action>  {
        return (dispatch, getState) => {
            const previousAvailableTags = getState().sets.value![setId].value!.availableTags;

            dispatch(fromActions.Action.saveCardMetaBegin(setId, cardId, cardMeta));

            const card = this.getCard(setId, cardId);
            const newMeta = {
                ...card,
                setId,
                id: cardId,
                ...cardMeta,
            };
            this.saveCard(newMeta);

            // If the card tags have changed we need to save the set meta as well
            if (cardMeta.tags !== undefined && card.tags !== cardMeta.tags) {
                const oldSetMeta = this.getSetMeta(setId)!;
                const tagCount = oldSetMeta.availableTags;
                const newTagCount = Utils.calculateNewTagCount(tagCount, card.tags, cardMeta.tags);

                // If any tags where deleted, we may need to update the filter to not include these tags
                const deletedTags = Object.keys(previousAvailableTags)
                .filter(tag => newTagCount[tag] === undefined);
                if (deletedTags.find(tag => oldSetMeta.filter.tags[tag] === undefined)) {
                    const newTags = Utils.arrayToObject(
                        Object.keys(oldSetMeta.filter.tags).filter(tag => deletedTags.indexOf(tag) === -1),
                        tag => [tag, true],
                    );
                    const newFilter = {
                        ...oldSetMeta.filter,
                        tags: {
                            ...newTags,
                        },
                    };
                    dispatch<any>(this.filterCards(setId, newFilter));
                }

                this.saveSetMetaLocal({ ...oldSetMeta, availableTags: newTagCount });
            }

            this.result(() => dispatch(fromActions.Action.saveCardMetaComplete(setId, cardId, newMeta)));
        };
    }

    public saveSetMeta(setMeta: Partial<IFlashCardSetMeta>): ThunkAction<void, IAppState, void, fromActions.Action> {
        return (dispatch, getState) => {
            if (setMeta.id === undefined) {
                throw new Error("Set id must be provided");
            }

            dispatch(fromActions.Action.saveSetMetaBegin(setMeta));

            const previousSetMeta = this.getSetMeta(setMeta.id);
            const {cards, ...initialMeta} = fromSet.initialState;
            this.saveSetMetaLocal({
                ...initialMeta,
                ...previousSetMeta,
                ...setMeta,
                availableTags: previousSetMeta !== null ? previousSetMeta.availableTags : initialMeta.availableTags,
            });

            const setId = setMeta.id;
            this.result(() => dispatch(fromActions.Action.saveSetMetaComplete(setId)));
        };
    }

    public filterCards(setId: string, filter: IFlashCardFilter):
        ThunkAction<void, IAppState, void, fromActions.Action> {
        return (dispatch, getState) => {
            dispatch(fromActions.Action.filterCardsBegin(setId, filter));

            const setMeta = this.getSetMeta(setId)!;
            const result = setMeta.cardOrder.filter(cardId => this.cardMatchesFilter(setId, cardId, filter));

            // Also make sure to update the study state if the current set is being filtered
            const studyState = getState().studyState.value;
            if (studyState !== undefined && studyState.setId === setId) {
                const setStudyData = this.getSetStudyData(setId)!;
                const studyStateResult: IStudyState = {
                    setId,
                    newCardIds: Study.getNewCardIds(result, setStudyData),
                    knownCardIds: Study.getKnownCardIds(result, setStudyData),
                    currentSession: null,
                };

                this.result(() => {
                    console.log("Merge these into one action");
                    dispatch(fromActions.Action.setStudyStateComplete(studyStateResult));
                    dispatch(fromActions.Action.filterCardsComplete(setId, filter, result));
                });
            } else {
                this.result(() => dispatch(fromActions.Action.filterCardsComplete(setId, filter, result)));
            }
        };
    }

    public getExportUri(setId: string) {
        // Load the appropriate data
        const setMeta = this.getSetMeta(setId);
        if (setMeta === null) {
            throw new Error("Set " + setId + " does not exist");
        }
        const cards = setMeta.cardOrder.map(cardId => this.getCard(setId, cardId));
        const set: IFlashCardSet = {
            ...setMeta,
            cards: Utils.arrayToObject(cards, card =>
            [card.id, {
                isFetching: false,
                requestId: null,
                value: card,
            }]),
        };
        // Serialize the set correctly
        const dataStr = "data:text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(new ExportFlashCardSet(set)));

        return dataStr;
    }

    public beginStudySession(options: Study.IStudySessionOptions):
        ThunkAction<void, IAppState, void, fromActions.Action> {
        return (dispatch, getState) => {
            const setId = getState().studyState.value!.setId;
            const setMeta = this.getSetMeta(setId);
            const studyData = this.getSetStudyData(setId);
            if (studyData === null || setMeta === null) {
                throw new Error("Could not start a study session for set " + setId);
            }

            const filteredCards = options.filter === undefined
                ? setMeta.cardOrder
                : setMeta.cardOrder.filter(c => this.cardMatchesFilter(setId, c, options.filter!));

            const deck = Study.selectStudyDeck(studyData, options.countNewCards,
                options.countKnownCards + options.countNewCards, filteredCards);
            const cardData = Utils.arrayToObject(deck, cardId => [cardId, {
                evaluations: [],
                redrawTime: null,
            }]);
            const currentCardId = Study.drawCard(deck, studyData, cardData);

            // Set an empty deck so the user can see progress
            dispatch(fromActions.Action.setStudyStateBegin({
                currentSession: {
                    deck: Array(deck.length).map(a => "loading"),
                    currentCardId: "loading",
                    cardData: {},
                    updating: false,
                },
            }));
            this.result(() => {
                // Update the study state
                dispatch(fromActions.Action.setStudyStateComplete({
                    currentSession: {
                        deck,
                        currentCardId,
                        cardData,
                        updating: false,
                    },
                }));

                // Load all cards in the deck
                dispatch(fromActions.Action.loadCardsComplete(
                    setId,
                    Utils.arrayToObject(deck, cardId => [cardId, this.getCard(setId, cardId)]),
                ));
            });
        };
    }

    public evaluateCard(cardId: string, evaluation: Study.CardEvaluation):
        ThunkAction<void, IAppState, void, fromActions.Action> {
        const self = this;
        return (dispatch, getState) => {
            if (getState().studyState.value === undefined) {
                throw new Error("Cannot evaluate a card when no study state data is available");
            }
            const studyState = getState().studyState.value!;
            const setId = studyState.setId;
            let studyData = this.getSetStudyData(setId);
            if (studyData === null) {
                throw new Error("No study data exists for set " + setId);
            }
            if (studyState.currentSession === null) {
                throw new Error("A session must have been started");
            }
            const setMeta = this.getSetMeta(setId)!;

            const cardData: ICardStudyData = studyData.cardData[cardId];
            let redrawTime: Date | null;
            switch (evaluation) {
                case Study.CardEvaluation.Good:
                    // Redraw time doesn't matter anymore since the card will be removed fomr the deck
                    redrawTime = null;
                    // Update the due date for the card
                    const newCardStudyData = {
                        ...cardData,
                        understandingLevel: Study.getNewUnderstandingLevel(cardData,
                            studyState.currentSession.cardData[cardId].evaluations),
                        dueDate: Study.getDueTimeIncrease(cardData, evaluation),
                    };
                    studyData.cardData = { ...studyData.cardData, [cardId]: newCardStudyData };
                    this.saveCardStudyData(newCardStudyData);
                    break;
                case Study.CardEvaluation.Decent:
                case Study.CardEvaluation.Poor:
                    // Just increase the redraw time
                    redrawTime = Study.getDueTimeIncrease(cardData, evaluation);
                    break;
            }

            const nextCardId = Study.drawCard(studyState.currentSession.deck,
                studyData,
                studyState.currentSession.cardData,
                studyState.currentSession.currentCardId);
            dispatch(fromActions.Action.evaluateCardBegin(setId, cardId, evaluation));
            this.result(() => dispatch(fromActions.Action.evaluateCardComplete(setId,
                cardId,
                evaluation,
                redrawTime,
                nextCardId,
                {
                    setId,
                    newCardIds: Study.getNewCardIds(setMeta.cardOrder, studyData!),
                    knownCardIds: Study.getKnownCardIds(setMeta.cardOrder, studyData!),
                    // Currentsession can be null as it is ignored
                    currentSession: null,
                },
            )));
        };
    }

    private getCard(setId: string, cardId: string): IFlashCard {
        const exportCard = this.getCardRaw(setId, cardId);
        const card = parseCard(exportCard, setId);

        return card as IFlashCard;
    }

    private getCardRaw(setId: string, cardId: string): ExportFlashCard {
        const data = localStorage.getItem(this.cardKey(setId, cardId));
        if (data === null) {
            throw new Error("Card does not exist");
        }
        return JSON.parse(data) as ExportFlashCard;
    }

    /**
     * Attemps to retrieve metadata for the specified set. Returns null if none is available
     * @param setId The id of the set for which to fetch metadata
     */
    private getSetMeta(setId: string): IFlashCardSetMeta | null {
        const data = localStorage.getItem(this.setKey(setId));
        if (data === null) {
            return null;
        }
        const dataObject: IFlashCardSetMeta = JSON.parse(data);
        return {
            ...dataObject,
            filteredCardOrder: {
                isFetching: false,
                value: dataObject.cardOrder,
            },
            filter: { tags: { } },
        };
    }

    private saveSet(set: IFlashCardSet, saveCards: boolean) {
        const {cards, ...rest} = set;
        const setMeta: IFlashCardSetMeta = rest;
        const oldMeta = this.getSetMeta(set.id);

        this.saveSetMetaLocal(setMeta);

        if (saveCards) {
            // Delete old cards
            if (oldMeta !== null) {
                for (const cardId of oldMeta.cardOrder) {
                    this.removeCard(set.id, cardId);
                }
            }

            // Save the cards
            for (const cardId of set.cardOrder) {
                const cardValue = cards[cardId].value;
                if (cardValue !== undefined) {
                    this.saveCard(cardValue);
                }
            }
        }
    }

    private saveSetMetaLocal(setMeta: IFlashCardSetMeta) {
        // Make sure the set index contains the specified set
        const setIds = this.getSetIds();
        if (setIds.indexOf(setMeta.id) === -1) {
            localStorage.setItem("sets", setIds.concat(setMeta.id).join(this.idDelimiter));
        }

        // Save the set
        localStorage.setItem(this.setKey(setMeta.id), JSON.stringify(setMeta));
    }

    private saveSetStudyData(studyData: ISetStudyData, saveCards: string[]) {
        const {cardData, ...rest} = studyData;
        const setMeta = rest as ISetStudyDataMeta;

        // Save the set data meta
        localStorage.setItem(this.setStudyDataKey(studyData.setId), JSON.stringify(setMeta));

        // Save the cards
        for (const cardId of saveCards) {
            const cardValue = cardData[cardId];
            if (cardValue === undefined) {
                throw new Error("Card data value cannot be undefined");
            } else {
                this.saveCardStudyData(cardValue);
            }
        }
    }

    private getSetStudyData(setId: string): ISetStudyData | null {
        const setMeta: IFlashCardSetMeta | null = this.getSetMeta(setId);
        if (setMeta === null) {
            return null;
        }

        const setStudyMetaJsonData = localStorage.getItem(this.setStudyDataKey(setId));
        if (setStudyMetaJsonData === null) {
            return null;
        }

        const setStudyMeta: ISetStudyDataMeta = JSON.parse(setStudyMetaJsonData);
        const cards = Utils.arrayToObject(setMeta.cardOrder, cardId => [
            cardId,
            this.getCardStudyData(setId, cardId),
        ]);

        return {
            ...setStudyMeta,
            cardData: cards,
        };
    }

    private saveCardStudyData(card: ICardStudyData) {
        localStorage.setItem(this.cardStudyDataKey(card.setId, card.cardId), JSON.stringify(card));
    }

    private getCardStudyData(setId: string, cardId: string): ICardStudyData {
        const data = localStorage.getItem(this.cardStudyDataKey(setId, cardId));
        if (data === null) {
            // If no study data is present, just generate a default study data
            return {
                setId,
                cardId,
                dueDate: new Date(),
                understandingLevel: 0,
            };
        }
        const card: ICardStudyData = JSON.parse(data);
        card.dueDate = new Date(card.dueDate.toString());

        return card;
    }

    /**
     * Saves all data associated with a single flashcard
     */
    private saveCard(card: IFlashCard) {
        localStorage.setItem(this.cardKey(card.setId, card.id), JSON.stringify(new ExportFlashCard(card)));
    }

    private removeCard(setId: string, cardId: string) {
        localStorage.removeItem(this.cardKey(setId, cardId));
    }

    /**
     * Returns all stored set ids
     */
    private getSetIds() {
        const setIdData = localStorage.getItem("sets");
        const setIds = setIdData === null ? [] : setIdData.split(this.idDelimiter);
        return setIds;
    }

    /**
     * Return the localstorage key for a set with the specified id
     */
    private setKey(setId: string) {
        return "sets" + this.idDelimiter + setId;
    }

    /**
     * Return the localstorage key for a card with the specified id
     */
    private cardKey(setId: string, cardId: string) {
        return "cards" + this.idDelimiter + setId + this.idDelimiter + cardId;
    }

    private setStudyDataKey(setId: string) {
        return "setStudyData" + this.idDelimiter + setId;
    }

    private cardStudyDataKey(setId: string, cardId: string) {
        return "cardStudyData" + this.idDelimiter + setId + this.idDelimiter + cardId;
    }

    private result(fn: () => void) {
        if (this.virtualDelay === 0) {
            fn();
        } else {
            setTimeout(fn, this.virtualDelay);
        }
    }

    private cardMatchesFilter(setId: string, cardId: string, filter: IFlashCardFilter) {
        // Don't parse the card because rich text content is slow to parse
        const card = this.getCardRaw(setId, cardId);

        // If no filter is applied, the card matches the filter
        if (Object.keys(filter.tags).length === 0) { return true; }

        // Make a list of all the tags on the card that match the filter
        const matchingTags = card.tags.filter(tag => filter.tags[tag] === true);
        return matchingTags.length > 0;
    }
}
