import IFlashCard from "../lib/flashcard/flashcard";
import IFlashCardSet from "../lib/flashcard/FlashCardSet";
import IRemote from "../lib/remote";
import * as Utils from "../lib/utils";
import * as fromActions from "./actions";
import card, * as fromCard from "./card";

export const initialState: IFlashCardSet = {
    cards: {},
    name: "New Set",
    cardOrder: [],
    id: "",
};

export function id(state: string = initialState.id, action: fromActions.Action) {
    if (state === undefined || state === initialState.id) {
        return Utils.guid();
    } else {
        return state;
    }
}

function cards(state: { [id: string]: IRemote<IFlashCard>; } = initialState.cards,
               setId: string,
               action: fromActions.Action): { [id: string]: IRemote<IFlashCard>; } {
    switch (action.type) {
        case fromActions.LOAD_SET_META_ALL_COMPLETE:
            return Utils.arrayToObject(action.payload[setId].cardOrder, v => {
                return state[v] !== undefined ? [v, state[v]] : [v, { isFetching: true, value: undefined }];
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
                ...Utils.arrayToObject(action.payload.cardIds, cardId => [cardId, card(state[cardId], cardId, action)]),
            };
        case fromActions.LOAD_CARDS_COMPLETE:
            return {
                ...state,
                ...Utils.objectMapString(action.payload.cards,
                    (cardId, value) => card(state[cardId], cardId, action)),
            };
        case fromActions.SAVE_CARD_FACE_BEGIN:
        case fromActions.SAVE_CARD_FACE_COMPLETE:
            return {
                ...state,
                [action.payload.cardId]: card(state[action.payload.cardId], setId, action),
            };
        default:
            return state;
    }
}

function name(state: string = initialState.name, setId: string, action: fromActions.Action): string {
    switch (action.type) {
        case fromActions.SAVE_SET_META_BEGIN:
            return action.payload.setMeta.name !== undefined ? action.payload.setMeta.name : state;
        default:
            return state;
    }
}

function cardOrder(state: string[] = initialState.cardOrder, action: fromActions.Action) {
    switch (action.type) {
        case fromActions.ADD_NEW_CARD_BEGIN:
            if (action.payload.afterCardId !== undefined) {
                const afterIndex = state.indexOf(action.payload.afterCardId);
                return [...state.slice(0, afterIndex + 1), action.payload.cardId, ...state.slice(afterIndex + 1)];
            } else {
                return state.concat(action.payload.cardId);
            }
        default:
            return state;
    }
}

export function setValue(state: Partial<IFlashCardSet> = initialState, action: fromActions.Action): IFlashCardSet {
    // Generate a new id if none has been supplied
    const stateId = id(state.id, action);

    switch (action.type) {
        default:
            return {
                cards: cards(state.cards, stateId, action),
                name: name(state.name, stateId, action),
                cardOrder: cardOrder(state.cardOrder, action),
                id: stateId,
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
                error: action.payload.message,
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
