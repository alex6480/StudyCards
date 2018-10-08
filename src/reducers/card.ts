import { ContentState } from "draft-js";
import IFlashCard from "../lib/flashcard/flashcard";
import { FlashCardFaceType } from "../lib/flashcard/FlashCardFace";
import IRemote from "../lib/remote";
import * as Utils from "../lib/utils";
import * as Actions from "./actions";

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

function value(state: Partial<IFlashCard> = initialState.value, action: Actions.Action): IFlashCard {
    switch (action.type) {
        default:
            return {
                id: state.id !== undefined ? state.id : Utils.guid(),
                setId: state.setId as string,
                faces: state.faces !== undefined ? state.faces : initialCard.faces,
            };
    }
}

function id(state: string | undefined, action: Actions.Action): string {
    switch (action.type) {
        default:
            return state === undefined ? Utils.guid() : state;
    }
}

export default function card(state: IRemote<Partial<IFlashCard>> = initialState,
                             action: Actions.Action): IRemote<IFlashCard> {
    return {
        ...state,
        value: value(state.value, action),
    };
}
