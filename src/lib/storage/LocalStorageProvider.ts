import { Dispatch } from "redux";
import { IAppState } from "../../reducers";
import * as fromActions from "../../reducers/actions";
import { initialCard } from "../../reducers/card";
import * as fromSet from "../../reducers/set";
import IFlashCard, { ExportFlashCard } from "../flashcard/flashcard";
import IFlashCardSet, { IFlashCardSetMeta } from "../flashcard/FlashCardSet";
import { SetParser } from "../flashcard/parsers/SetParserV1";
import { ICardStudyData, ISetStudyData, ISetStudyDataMeta } from "../flashcard/StudyData";
import * as Utils from "../utils";
import IStorageProvider from "./StorageProvider";

/**
 * A storage provider that stores all data in the browser local storage
 */
export class LocalStorageProvider implements IStorageProvider {
    private idDelimiter = ".";

    public loadSetMetaAll(dispatch: Dispatch) {
        dispatch(fromActions.Action.loadSetMetaAllBegin());

        const setIds = this.getSetIds();
        const meta = setIds.reduce((result: {[id: string]: IFlashCardSetMeta}, item, index, array) => {
            const setMeta = this.getSetMeta(item);
            result[setMeta.id] = setMeta;
            return result;
        }, {});

        dispatch(fromActions.Action.loadSetMetaAllComplete(meta));
    }

    public addCard(dispatch: Dispatch, setId: string, afterCardId?: string) {
        const cardId = Utils.guid();
        dispatch(fromActions.Action.addNewCardBegin(cardId, setId, afterCardId));

        // Save the added card
        this.saveCard({
            ...initialCard,
            setId,
            id: cardId,
        });

        // Update the set meta table
        const setMeta = this.getSetMeta(setId);
        let cardOrder = setMeta.cardOrder;
        if (afterCardId !== undefined) {
            const afterIndex = cardOrder.indexOf(afterCardId);
            cardOrder = [...cardOrder.slice(0, afterIndex + 1), cardId, ...cardOrder.slice(afterIndex + 1)];
        } else {
            cardOrder = setMeta.cardOrder.concat(cardId);
        }
        this.saveSetMeta({ ...setMeta, cardOrder });

        dispatch(fromActions.Action.addNewCardComplete(setId, cardId));

        return cardId;
    }

    public addSet(dispatch: Dispatch, set?: IFlashCardSet) {
        if (set === undefined || set.id === undefined) {
            set = {
                ...fromSet.initialState,
                id: Utils.guid(),
            };
        }

        this.saveSet(set, true);
        this.saveSetStudyData({
            setId: set.id,
            cardData: { },
        }, set.cardOrder);

        dispatch(fromActions.Action.addSetBegin(set.id!, set));
        dispatch(fromActions.Action.addSetComplete(set.id!));
        return set.id!;
    }

    public loadSetStudyData(dispatch: Dispatch, setId: string) {
        dispatch(fromActions.Action.loadSetStudyDataBegin(setId));

        const setStudyMetaData = localStorage.getItem(this.setStudyDataKey(setId));
        if (setStudyMetaData === null) {
            throw new Error("No study metadata is available for set with id " + setId);
        }
        const setStudyMeta: ISetStudyDataMeta = JSON.parse(setStudyMetaData);
        const setMeta = this.getSetMeta(setId);
        const result = {
            ...setStudyMeta,
            cardData: Utils.arrayToObject(
                setMeta.cardOrder.map(cardId => this.getCardStudyData(setId, cardId)),
                val => [val.cardId, val]),
        };

        dispatch(fromActions.Action.loadSetStudyDataComplete(result));
    }

    public loadCards(dispatch: Dispatch, setId: string, cardIds: string[]) {
        dispatch(fromActions.Action.loadCardsBegin(setId, cardIds));

        const cards: IFlashCard[] = [];
        const setMeta = this.getSetMeta(setId);
        for (const cardId of setMeta.cardOrder) {
            cards.push(this.getCard(setId, cardId));
        }

        dispatch(fromActions.Action.loadCardsComplete(setId, Utils.arrayToObject(cards, c => [c.id, c])));
    }

    private getCardStudyData(setId: string, cardId: string): ICardStudyData {
        const data = localStorage.getItem(this.cardStudyDataKey(setId, cardId));
        if (data === null) {
            // Return an empty study data object instead
            return {
                setId,
                cardId,
                dueDate: new Date(),
                redrawTime: null,
                removeFromSession: false,
            };
        }
        return JSON.parse(data);
    }

    private getCard(setId: string, cardId: string): IFlashCard {
        const data = localStorage.getItem(this.cardKey(setId, cardId));
        if (data === null) {
            throw new Error("Card does not exist");
        }
        const exportCard = JSON.parse(data) as ExportFlashCard;
        const card = new SetParser().parseCard(exportCard, setId);

        return card as IFlashCard;
    }

    private getSetMeta(setId: string): IFlashCardSetMeta {
        const data = localStorage.getItem(this.setKey(setId));
        if (data === null) {
            throw new Error("No metadata is available for set with id " + setId);
        }
        return JSON.parse(data);
    }

    private saveSet(set: IFlashCardSet, saveCards: boolean) {
        const {cards, ...rest} = set;
        const setMeta: IFlashCardSetMeta = rest;

        this.saveSetMeta(setMeta);

        if (saveCards) {
            // Save the cards
            for (const cardId of set.cardOrder) {
                const cardValue = cards[cardId].value;
                if (cardValue === undefined) {
                    // Just save a generic cardstudydata
                    this.saveCardStudyData({
                        setId: set.id,
                        cardId,
                        dueDate: new Date(),
                        redrawTime: null,
                        removeFromSession: false,
                    });
                } else {
                    this.saveCard(cardValue);
                }
            }
        }
    }

    private saveSetMeta(setMeta: IFlashCardSetMeta) {
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

    private saveCardStudyData(card: ICardStudyData) {
        localStorage.setItem(this.cardStudyDataKey(card.setId, card.cardId), JSON.stringify(card));
    }

    /**
     * Saves all data associated with a single flashcard
     */
    private saveCard(card: IFlashCard) {
        localStorage.setItem(this.cardKey(card.setId, card.id), JSON.stringify(new ExportFlashCard(card)));
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
}
