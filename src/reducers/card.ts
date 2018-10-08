import { ContentState } from "draft-js";
import IFlashCard from "../lib/flashcard/flashcard";
import { FlashCardFaceType } from "../lib/flashcard/FlashCardFace";
import IRemote from "../lib/remote";
import * as Utils from "../lib/utils";
import * as fromActions from "./actions";

export const initialCard: IFlashCard = {
    id: "",
    setId: "",
    faces: {
        front: {
            id: "front",
            cardId: "",
            setId: "",
            type: FlashCardFaceType.RichText,
            richTextContent: ContentState.createFromText(""),
        },
        back: {
            id: "back",
            cardId: "",
            setId: "",
            type: FlashCardFaceType.RichText,
            richTextContent: ContentState.createFromText(""),
        },
    },
};
export const initialState = { isFetching: true, lastUpdated: Date.now(), value: initialCard };

function value(state: Partial<IFlashCard> = initialState.value,
               cardId: string, action: fromActions.Action): IFlashCard {
    switch (action.type) {
        default:
            return {
                id: cardId,
                setId: state.setId as string,
                faces: state.faces !== undefined ? state.faces : initialCard.faces,
            };
    }
}

export default function card(state: IRemote<Partial<IFlashCard>> = initialState,
                             cardId: string,
                             action: fromActions.Action): IRemote<IFlashCard> {
    switch (action.type) {
        case fromActions.LOAD_CARDS_BEGIN:
            return {
                ...state,
                value: value(state.value, cardId, action),
                isFetching: true,
            };
        case fromActions.LOAD_CARDS_COMPLETE:
            return {
                ...state,
                value: action.payload.cards[cardId],
                isFetching: false,
            };
        default:
            return {
                ...state,
                value: value(state.value, cardId, action),
            };
    }
}
