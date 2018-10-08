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
        case fromActions.ADD_NEW_CARD_BEGIN:
            return {
                    ...state,
                    [action.payload.cardId]: card({
                        isFetching: false,
                        lastUpdated: Date.now(),
                        value: {
                            setId: action.payload.setId,
                            id: action.payload.cardId,
                        },
                    }, action),
                };
        case fromActions.ADD_NEW_CARD_COMPLETE:
            return {
                ...state,
                [action.payload.cardId]: card(state[action.payload.cardId], action),
            };
        default:
            return state;
    }
}

function name(state: string = initialState.name, setId: string, action: fromActions.Action): string {
    switch (action.type) {
        case fromActions.UPDATE_SET_NAME:
            if (action.payload.setId !== setId) {
                return state;
            }
            return action.payload.name;
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

export function set(state: Partial<IFlashCardSet> = initialState, action: fromActions.Action): IFlashCardSet {
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

export default function sets(state: IRemote<{ [id: string]: IFlashCardSet }>,
                             action: fromActions.Action): IRemote<{ [id: string]: IFlashCardSet }> {

    switch (action.type) {
        case fromActions.LOAD_SET_META_ALL_BEGIN:
            return { ...state, isFetching: true };
        case fromActions.LOAD_SET_META_ALL_COMPLETE:
            return {
                ...state,
                isFetching: false,
                value: Utils.objectMapString(action.payload, (k, loadedSet) => ({
                    ...loadedSet,
                    cards: state.value !== undefined
                        && state.value[loadedSet.id] !== undefined
                        ? state.value[loadedSet.id].cards
                        : { },
                })),
            };
        case fromActions.LOAD_SET_META_ALL_ERROR:
            return {
                ...state,
                error: action.payload.message,
            };
        case fromActions.ADD_NEW_SET_BEGIN:
        case fromActions.ADD_NEW_SET_COMPLETE:
            const setId = id(action.payload.setId, action);
            return {
                ...state,
                value: {
                    [setId]: set({ id: setId }, action),
                },
            };
        default:
            return state;
    }
}
