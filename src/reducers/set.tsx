import IFlashCard from "../lib/flashcard/flashcard";
import IFlashCardSet from "../lib/flashcard/FlashCardSet";
import * as utils from "../lib/utils";
import * as fromActions from "./actions";
import card, * as fromCard from "./card";

const initialState: IFlashCardSet = {
    cards: {},
    name: "New Set",
    id: "",
};

function cards(state: { [id: number]: IFlashCard; } = initialState.cards,
               action: fromActions.Actions): { [id: number]: IFlashCard; } {
    switch (action.type) {
        case fromActions.ADD_NEW_CARD:
        case fromActions.UPDATE_CARD_FACE:
            // Propagate to the individual cards, so only the correct card is being edited
            return utils.objectMapString(state, (k: string, c: IFlashCard) => card(c, action));
        default:
            return state;
    }
}

function name(state: string = initialState.name, action: fromActions.Actions): string {
    switch (action.type) {
        case fromActions.UPDATE_SET_NAME:
            return action.payload.name;
        default:
            return state;
    }
}

export default function set(state: IFlashCardSet = initialState, action: fromActions.Actions): IFlashCardSet {
    // Generate a new id if none has been supplied
    const setId = state.id === initialState.id ? utils.guid() : state.id;
    switch (action.type) {
        case fromActions.UPDATE_SET_NAME:
            return {
                cards: state.cards,
                name: action.payload.set.id === state.id ? name(state.name, action) : state.name,
                id: setId,
            };
        case fromActions.ADD_NEW_CARD:
            if (action.payload.setId === state.id) {
                const newCard = card(undefined, action);
                return {
                    cards: { ...cards(state.cards, action),
                        [newCard.id]: newCard },
                    name: name(state.name, action),
                    id: setId,
                };
            }
        default:
            return {
                cards: cards(state.cards, action),
                name: name(state.name, action),
                id: setId,
            };
    }
}
