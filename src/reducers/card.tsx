import { ContentState } from "draft-js";
import IFlashCard from "../lib/flashcard/flashcard";
import { FlashCardFaceType } from "../lib/flashcard/FlashCardFace";
import * as Utils from "../lib/utils";
import * as fromActions from "./actions";

export const initialState: IFlashCard = {
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

export default function card(state: IFlashCard = initialState, action: fromActions.Actions): IFlashCard {
    switch (action.type) {
        case fromActions.ADD_NEW_CARD:
            if (state.id === initialState.id) {
                return { ...state,
                    id: Utils.guid(),
                    setId: action.payload.setId };
            }
            break;
        case fromActions.UPDATE_CARD_FACE:
            if (action.payload.cardId === state.id) {
                return { ...state,
                    faces: {...state.faces,
                        [action.payload.face.id]: action.payload.face,
                    },
                };
            }
            break;
        default:
            return state;
    }
    return state;
}
