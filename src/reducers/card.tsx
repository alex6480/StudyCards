import * as fromActions from './actions';
import FlashCard from '../lib/flashcard/flashcard';
import { EditorState, ContentState } from 'draft-js';
import * as utils from '../lib/utils';
import { FlashCardFaceType } from '../lib/flashcard/FlashCardFace';

export const initialState: FlashCard = {
    id: "",
    setId: "",
    faces: {
        front: {
            id: "front",
            cardId: "",
            setId: "",
            type: FlashCardFaceType.RichText,
            richTextContent: ContentState.createFromText("")
        },
        back: {
            id: "back",
            cardId: "",
            setId: "",
            type: FlashCardFaceType.RichText,
            richTextContent: ContentState.createFromText("")
        }
    }
};

export default (state: FlashCard = initialState, action: fromActions.Actions): FlashCard => {
    switch (action.type) {
        case fromActions.ADD_NEW_CARD:
            if (state.id == initialState.id) {
                return { ...state,
                    id: utils.guid(),
                    setId: action.payload.setId };
            }
            break;
        case fromActions.UPDATE_CARD_FACE:
            if (action.payload.cardId == state.id) {
                return { ...state,
                    faces: {...state.faces,
                        [action.payload.face.id]: action.payload.face
                    }
                }
            }
            break;
        default:
            return state;
    }
    return state;
}