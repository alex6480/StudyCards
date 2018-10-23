import { ContentState } from "draft-js";
import IFlashCard from "../lib/flashcard/flashcard";
import { FlashCardFaceType, IFlashCardFace } from "../lib/flashcard/FlashCardFace";
import IRemote from "../lib/remote";
import * as Utils from "../lib/utils";
import * as fromActions from "./actions";

export const initialCard: IFlashCard = {
    id: "",
    setId: "",
    tags: [],
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
export const initialState = { isFetching: false, lastUpdated: Date.now(), value: undefined };

function value(state: Partial<IFlashCard> | undefined,
               cardId: string, action: fromActions.Action): IFlashCard | undefined {
    switch (action.type) {
        case fromActions.ADD_NEW_CARD_BEGIN:
            return {
                id: cardId,
                setId: action.payload.setId,
                tags: tags(undefined, action),
                faces: faces(undefined, action),
            };
        default:
            return state === undefined ? undefined : {
                id: cardId,
                setId: state.setId!,
                tags: tags(state.tags, action),
                faces: faces(state.faces, action),
            };
    }
}

function faces(state: {front: IFlashCardFace, back: IFlashCardFace} = initialCard.faces, action: fromActions.Action) {
    switch (action.type) {
        case fromActions.ADD_NEW_CARD_BEGIN:
            return {
                front: face({ id: "front" }, action),
                back: face({ id: "back" }, action),
            };
        case fromActions.SAVE_CARD_FACE_BEGIN:
            return {
                ...state,
                [action.payload.face.id]: action.payload.face,
            };
        default:
            return state;
    }
}

function face(state: Partial<IFlashCardFace>, action: fromActions.Action): IFlashCardFace {
    switch (action.type) {
        case fromActions.SAVE_CARD_FACE_BEGIN:
            return action.payload.face;
        case fromActions.ADD_NEW_CARD_BEGIN:
            return {
                id: state.id!,
                setId: action.payload.setId,
                cardId: action.payload.cardId,
                type: FlashCardFaceType.RichText,
                richTextContent: initialCard.faces[state.id!].richTextContent,
            };
        default:
            if (state.id === undefined || state.cardId === undefined
                || state.setId === undefined || state.type === undefined) {
                throw new Error("Properties for card face do not match");
            }
            return {
                id: state.id,
                setId: state.setId,
                cardId: state.cardId,
                type: state.type,
                richTextContent: state.richTextContent !== undefined
                    ? state.richTextContent : initialCard.faces[state.id].richTextContent,
            };
    }
}

function tags(state: string[] = initialCard.tags, action: fromActions.Action) {
    switch (action.type) {
        case fromActions.SAVE_CARD_META_BEGIN:
            return action.payload.cardMeta.tags !== undefined ? action.payload.cardMeta.tags : state;
        case fromActions.ADD_NEW_CARD_BEGIN:
            return action.payload.afterCard !== undefined ? action.payload.afterCard.tags : state;
        default:
            return state;
    }
}

export default function card(state: IRemote<Partial<IFlashCard>> = initialState,
                             cardId: string,
                             action: fromActions.Action): IRemote<IFlashCard> {
    switch (action.type) {
        case fromActions.LOAD_CARDS_BEGIN:
            return {
                ...state,
                value: undefined, // Don't show default cards while the real cards are being loaded
                isFetching: true,
            };
        case fromActions.LOAD_CARDS_COMPLETE:
            return {
                ...state,
                value: action.payload.cards[cardId],
                isFetching: false,
            };
        case fromActions.SAVE_CARD_FACE_BEGIN:
        case fromActions.SAVE_CARD_META_BEGIN:
            return {
                ...state,
                value: value(state.value, cardId, action),
                isFetching: false,
            };
        default:
            return {
                ...state,
                value: value(state.value, cardId, action),
            };
    }
}
