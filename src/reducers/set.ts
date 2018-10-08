import IFlashCard from "../lib/flashcard/flashcard";
import IFlashCardSet from "../lib/flashcard/FlashCardSet";
import Remote from "../lib/remote";
import * as utils from "../lib/utils";
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
        case fromActions.SWAP_CARD_FACES:
        /*case fromActions.UPDATE_CARD_FACE:
            if (action.payload.setId === setId) {
                return {
                    ...state,
                    [action.payload.cardId]: card(state[action.payload.cardId], action),
                };
            }*/
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
        case fromActions.ADD_NEW_CARD:
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
    const setId = state.id === initialState.id ? utils.guid() : state.id;
    switch (action.type) {
        case fromActions.ADD_NEW_CARD:
            if (action.payload.setId === state.id) {
                const newCard = card(undefined, action);
                action.payload.cardId = newCard.value().id;
                if (action.payload.callback !== undefined) { action.payload.callback(newCard.value().id); }
                return {
                    cards: {
                        ...cards(state.cards, state.id, action),
                        [newCard.value().id]: newCard,
                    },
                    name: name(state.name, state.id, action),
                    cardOrder: cardOrder(state.cardOrder, action),
                    id: setId,
                };
            }
        default:
            return {
                cards: cards(state.cards, state.id, action),
                name: name(state.name, state.id, action),
                cardOrder: cardOrder(state.cardOrder, action),
                id: setId,
            };
    }
}
