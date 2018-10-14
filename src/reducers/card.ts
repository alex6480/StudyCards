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
        case fromActions.SAVE_CARD_FACE_BEGIN:
            return {
                ...state,
                [action.payload.face.id]: action.payload.face,
            };
        default:
            return state;
    }
}

function tags(state: string[] = initialCard.tags, action: fromActions.Action) {
    switch (action.type) {
        case fromActions.SAVE_CARD_META_BEGIN:
            return action.payload.cardMeta.tags !== undefined ? action.payload.cardMeta.tags : state;
        default:
            return state;
    }
}

export default function card(state: IRemote<Partial<IFlashCard>> = initialState,
                             cardId: string,
                             action: fromActions.Action): IRemote<IFlashCard> {
    switch (action.type) {
        case fromActions.LOAD_CARDS_BEGIN:
            if (cardId in action.payload.cardIds) {
                return {
                    ...state,
                    value: undefined, // Don't show default cards while the real cards are being loaded
                    isFetching: true,
                };
            }
            return { ...state, value: value(state.value, cardId, action) };
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
