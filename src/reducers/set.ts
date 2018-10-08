import IFlashCard from "../lib/flashcard/flashcard";
import IFlashCardSet from "../lib/flashcard/FlashCardSet";
import Remote from "../lib/remote";
import * as Utils from "../lib/utils";
import * as fromActions from "./actions";
import card, * as fromCard from "./card";

const initialState: IFlashCardSet = {
    cards: {},
    name: "New Set",
    cardOrder: [],
    id: "",
};

function cards(state: { [id: string]: Remote<IFlashCard>; } = initialState.cards,
               setId: string,
               action: fromActions.Actions): { [id: string]: Remote<IFlashCard>; } {
    switch (action.type) {
        case fromActions.ADD_NEW_CARD_BEGIN:
            const newCardId = Utils.guid();
            if (action.payload.callback !== undefined) { action.payload.callback(newCardId); }
            return {
                    ...state,
                    [newCardId]: new Remote<IFlashCard>(true),
                };
        case fromActions.ADD_NEW_CARD_COMPLETE:
            return {
                ...state,
                [action.payload.cardId]: new Remote<IFlashCard>(false, {
                    ...fromCard.initialCard,
                    setId: action.payload.setId,
                    id: action.payload.cardId,
                }),
            };
        default:
            return state;
    }
}

function name(state: string = initialState.name, setId: string, action: fromActions.Actions): string {
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

function cardOrder(state: string[] = initialState.cardOrder, action: fromActions.Actions) {
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

export default function set(state: IFlashCardSet = initialState, action: fromActions.Actions): IFlashCardSet {
    // Generate a new id if none has been supplied
    if (state.id === initialState.id) {
        state.id = Utils.guid();
    }

    switch (action.type) {
        case fromActions.ADD_NEW_CARD_BEGIN:
            if (state.id !== state.id) {
                return {
                    cards: cards(state.cards, state.id, action),
                    name: name(state.name, state.id, action),
                    cardOrder: cardOrder(state.cardOrder, action),
                    id: state.id,
                };
            }
        default:
            return state;
    }
}
