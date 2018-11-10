import IFlashCard from "../lib/flashcard/flashcard";
import IFlashCardSet, { IFlashCardFilter } from "../lib/flashcard/FlashCardSet";
import IRemote from "../lib/remote";
import * as Utils from "../lib/utils";
import * as fromActions from "./actions";
import card, * as fromCard from "./card";

export const initialState: IFlashCardSet = {
    cards: {},
    name: "New Set",
    cardOrder: [],
    id: 0,
    availableTags: {},
    filter: { tags: { } },
    filteredCardOrder: { isFetching: false, value: [] },
};

export function id(state: number = initialState.id, action: fromActions.Action) {
    return state;
}

function cards(state: { [id: string]: IRemote<IFlashCard>; } = initialState.cards,
               setId: number,
               action: fromActions.Action): { [id: string]: IRemote<IFlashCard>; } {
    switch (action.type) {
        case fromActions.LOAD_SET_META_ALL_COMPLETE:
            return Utils.arrayToObject(action.payload[setId].cardOrder, v => {
                return state[v] !== undefined ? [v, state[v]] : [v, { isFetching: false, value: undefined }];
            });
        case fromActions.ADD_NEW_CARD_BEGIN:
            return {
                    ...state,
                    [action.payload.cardId]: card({
                        isFetching: false,
                        value: {
                            setId: action.payload.setId,
                        },
                    }, action.payload.cardId, action),
                };
        case fromActions.ADD_NEW_CARD_COMPLETE:
            return {
                ...state,
                [action.payload.cardId]: card(state[action.payload.cardId], action.payload.cardId, action),
            };
        case fromActions.LOAD_CARDS_BEGIN:
            return {
                ...state,
                ...Utils.arrayToObject(action.payload.cardIds,
                    cardId => [cardId, card(state[cardId], cardId, action)]),
            };
        case fromActions.LOAD_CARDS_COMPLETE:
            return {
                ...state,
                ...Utils.objectMapString(action.payload.cards,
                    (cardId, value) => card(state[cardId], cardId, action)),
            };
        case fromActions.DELETE_CARD_COMPLETE:
            const {[action.payload.cardId]: deletedCard, ...rest} = state;
            return {
                ...rest,
            };
        case fromActions.SAVE_CARD_FACE_BEGIN:
        case fromActions.SAVE_CARD_FACE_COMPLETE:
        case fromActions.SAVE_CARD_META_BEGIN:
        case fromActions.SAVE_CARD_META_COMPLETE:
            const cId = action.payload.cardId;
            return {
                ...state,
                [cId]: card(state[action.payload.cardId], cId, action),
            };
        default:
            return state;
    }
}

function name(state: string = initialState.name, setId: number, action: fromActions.Action): string {
    switch (action.type) {
        case fromActions.ADD_NEW_SET_BEGIN:
            return action.payload.set.name !== undefined ? action.payload.set.name : state;
        case fromActions.SAVE_SET_META_BEGIN:
            return action.payload.setMeta.name !== undefined ? action.payload.setMeta.name : state;
        default:
            return state;
    }
}

function cardOrder(state: string[] = initialState.cardOrder, action: fromActions.Action) {
    switch (action.type) {
        case fromActions.ADD_NEW_CARD_BEGIN:
            const afterIndex = action.payload.afterCard !== undefined
                               ? state.indexOf(action.payload.afterCard.id) : -1;
            return [...state.slice(0, afterIndex + 1), action.payload.cardId, ...state.slice(afterIndex + 1)];
        case fromActions.DELETE_CARD_COMPLETE:
        case fromActions.DELETE_CARD_BEGIN:
            return state.filter(cardId => cardId !== action.payload.cardId);
        default:
            return state;
    }
}

function filter(state: IFlashCardFilter = initialState.filter, action: fromActions.Action) {
    switch (action.type) {
        case fromActions.SET_FILTER_CARDS_BEGIN:
            return action.payload.filter;
        default:
            return state;
    }
}

function filteredCardOrder(filteredCards: IRemote<string[]> | undefined,
                           setCards: string[],
                           currentFilter: IFlashCardFilter,
                           action: fromActions.Action): IRemote<string[]> {
    switch (action.type) {
        case fromActions.SET_FILTER_CARDS_BEGIN:
        case fromActions.SET_FILTER_CARDS_COMPLETE:
            if (Object.keys(action.payload.filter.tags).length === 0) {
                // If the filter is removed, we don't need to poll the server and can apply the filter immediately
                return { isFetching: false, value: setCards };
            }
            return {
                isFetching: action.type === fromActions.SET_FILTER_CARDS_BEGIN,
                value: filteredCardsValue(filteredCards!.value, setCards, currentFilter, action),
            };
        default:
            if (filteredCards === undefined) {
                return { isFetching: false, value: setCards };
            }
            return {
                isFetching: filteredCards.isFetching,
                value: filteredCardsValue(filteredCards.value, setCards, currentFilter, action),
            };
    }
}

function filteredCardsValue(state: string[] | undefined,
                            setCards: string[],
                            currentFilter: IFlashCardFilter,
                            action: fromActions.Action) {
    switch (action.type) {
        case fromActions.DELETE_CARD_BEGIN:
        case fromActions.DELETE_CARD_COMPLETE:
            // The card is removed from the results
            return state !== undefined ? state.filter(c => c !== action.payload.cardId) : setCards;
        case fromActions.SET_FILTER_CARDS_COMPLETE:
            return action.payload.result;
        case fromActions.ADD_NEW_CARD_BEGIN:
            // The new card is shown no matter if it matches the filter or not
            const afterIndex = action.payload.afterCard !== undefined
                               ? state!.indexOf(action.payload.afterCard.id) : -1;
            return [...state!.slice(0, afterIndex + 1), action.payload.cardId, ...state!.slice(afterIndex + 1)];
        default:
            return state !== undefined ? state : setCards;
    }
}

function availableTags(state: { [tag: string]: number } = initialState.availableTags,
                       setCards: {[id: string]: IRemote<IFlashCard>} | undefined, action: fromActions.Action) {
    switch (action.type) {
        case fromActions.SAVE_CARD_META_BEGIN:
            if (action.payload.cardMeta.tags === undefined) {
                return state;
            }
            return Utils.calculateNewTagCount(state,
                                              setCards![action.payload.cardId].value!.tags,
                                              action.payload.cardMeta.tags);
        case fromActions.ADD_NEW_CARD_BEGIN:
            return action.payload.afterCard !== undefined
                ? Utils.calculateNewTagCount(state, [], action.payload.afterCard.tags)
                : state;
        case fromActions.DELETE_CARD_BEGIN:
            return Utils.calculateNewTagCount(state,
                                              setCards![action.payload.cardId].value!.tags,
                                              []);
        default:
            return state;
    }
}

export function setValue(state: Partial<IFlashCardSet> = initialState, action: fromActions.Action): IFlashCardSet {
    // Generate a new id if none has been supplied
    const stateId = id(state.id, action);

    switch (action.type) {
        default:
            const newCardOrder = cardOrder(state.cardOrder, action);
            const newFilter = filter(state.filter, action);
            return {
                id: stateId,
                cardOrder: newCardOrder,
                name: name(state.name, stateId, action),
                availableTags: availableTags(state.availableTags, state.cards, action),
                cards: cards(state.cards, stateId, action),
                filter: newFilter,
                filteredCardOrder: filteredCardOrder(state.filteredCardOrder, newCardOrder, newFilter, action),
            };
    }
}

export function set(state: IRemote<Partial<IFlashCardSet>> = { isFetching: true, value: initialState },
                    action: fromActions.Action): IRemote<IFlashCardSet> {
    switch (action.type) {
        case fromActions.LOAD_SET_META_ALL_COMPLETE:
        case fromActions.SAVE_SET_META_COMPLETE:
        case fromActions.ADD_NEW_SET_COMPLETE:
            return {
                ...state,
                isFetching: false,
                value: setValue(state.value, action),
            };
        case fromActions.SAVE_SET_META_BEGIN:
            return {
                ...state,
                isFetching: true,
                value: setValue(state.value, action),
            };
        default:
            return {
                ...state,
                isFetching: state.isFetching !== undefined ? state.isFetching : true,
                value: setValue(state.value, action),
            };
    }
}

export default function sets(state: IRemote<{ [id: string]: IRemote<IFlashCardSet> }>,
                             action: fromActions.Action): IRemote<{ [id: string]: IRemote<IFlashCardSet> }> {
    switch (action.type) {
        case fromActions.LOAD_SET_META_ALL_BEGIN:
            return { ...state, isFetching: true };
        case fromActions.LOAD_SET_META_ALL_COMPLETE:
            return {
                ...state,
                isFetching: false,
                value: Utils.objectMapString(action.payload, (k, remoteSet) =>
                    set({ isFetching: false, value: remoteSet }, action)),
            };
        case fromActions.LOAD_SET_META_ALL_ERROR:
            return {
                ...state,
                error: "ERROR",
            };
        case fromActions.SAVE_SET_META_BEGIN:
        case fromActions.SAVE_SET_META_COMPLETE:
        case fromActions.ADD_NEW_CARD_BEGIN:
        case fromActions.ADD_NEW_SET_BEGIN:
        case fromActions.ADD_NEW_SET_COMPLETE:
        case fromActions.LOAD_CARDS_BEGIN:
        case fromActions.LOAD_CARDS_COMPLETE:
        case fromActions.SAVE_CARD_FACE_BEGIN:
        case fromActions.SAVE_CARD_FACE_COMPLETE:
        case fromActions.DELETE_CARD_COMPLETE:
        case fromActions.DELETE_CARD_BEGIN:
        case fromActions.SAVE_CARD_META_BEGIN:
        case fromActions.SAVE_CARD_META_COMPLETE:
        case fromActions.SET_FILTER_CARDS_BEGIN:
        case fromActions.SET_FILTER_CARDS_COMPLETE:
            const setId = id(action.payload.setId, action);
            const previousSet = state.value === undefined || state.value[setId] === undefined
                                ? { isFetching: true, value: undefined } : state.value[setId];
            return {
                ...state,
                value: {
                    ...state.value,
                    [setId]: set({ ...previousSet, value: { ...previousSet.value, id: setId } }, action),
                },
            };
        default:
            return state;
    }
}
