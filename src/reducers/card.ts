import { ContentState } from "draft-js";
import IFlashCard from "../lib/flashcard/flashcard";
import { FlashCardFaceType } from "../lib/flashcard/FlashCardFace";
import Remote from "../lib/remote";
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
export const initialState = new Remote(false, initialCard);

export default function card(state: Remote<IFlashCard> = initialState,
                             action: fromActions.Actions): Remote<IFlashCard> {
    // switch (action.type) {
        /*case fromActions.ADD_NEW_CARD:
            if (state.isFetching === initialState.id) {
                const cardId = Utils.guid();
                if (state.faces.back.id !== "back") { throw Error("Invalid ID for card face back"); }
                if (state.faces.front.id !== "front") { throw Error("Invalid ID for card face front"); }
                return { ...state,
                    id: cardId,
                    setId: action.payload.setId,
                    faces: {
                        front: {
                            ...state.faces.front,
                            cardId,
                            setId: action.payload.setId,
                        },
                        back: {
                            ...state.faces.back,
                            cardId,
                            setId: action.payload.setId,
                        },
                    },
                };
            }
            break;
        case fromActions.UPDATE_CARD_FACE:
            if (action.payload.cardId === state.id) {
                return { ...state,
                    faces: {...state.faces,
                        [action.payload.face.id]: {
                            ...action.payload.face,
                            cardId: action.payload.cardId,
                            setId: action.payload.setId,
                        },
                    },
                };
            }
            break;
        case fromActions.SWAP_CARD_FACES:
            if (action.payload.cardId === state.id) {
                return {
                    ...state,
                    faces: {
                        front: {
                            ...state.faces.back,
                            id: "front",
                        },
                        back: {
                            ...state.faces.front,
                            id: "back",
                        },
                    },
                };
            }
            break;
    }*/
    return state;
}
