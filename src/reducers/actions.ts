import { Dispatch } from "redux";
import IFlashCard from "../lib/flashcard/flashcard";
import { IFlashCardFace } from "../lib/flashcard/FlashCardFace";
import IFlashCardSet, { IFlashCardSetMeta } from "../lib/flashcard/FlashCardSet";
import { ICardStudyData } from "../lib/flashcard/StudyData";

/*
    Boilerplate stuff used to get typesafety within Redux
*/
export interface IAction<T extends string> {
    type: T;
}
export interface IActionWithPayload<T extends string, P> extends IAction<T> {
    payload: P;
}

export function createAction<T extends string>(type: T): IAction<T>;
export function createAction<T extends string, P>(type: T, payload: P): IActionWithPayload<T, P>;
export function createAction<T extends string, P>(type: T, payload?: P) {
    return payload === undefined ? { type } : { type, payload };
}

type FunctionType = (...args: any[]) => any;
interface IActionsCreatorMapObject {
    [actionCreator: string]: FunctionType;
}

export type ActionsUnion<A extends IActionsCreatorMapObject> = ReturnType<A[keyof A]>;

export const UPDATE_SET_NAME = "update set name";
export const DELETE_CARD = "delete card";
export const UPDATE_CARD_FACE = "update card face";
export const ADD_NEW_SET = "add new set";
export const RESET_SESSION_STUDY_DATA = "reset session study data";
export const UPDATE_CARD_STUDY_DATA = "update card study data";
export const SWAP_CARD_FACES = "swap card faces";

// Remote actions
export const ADD_NEW_CARD_BEGIN = "add new card begin";
export const ADD_NEW_CARD_COMPLETE = "add new card complete";
export const ADD_NEW_CARD_ERROR = "add new card error";

export const LOAD_SET_META_ALL_BEGIN = "load meta data for all sets begin";
export const LOAD_SET_META_ALL_COMPLETE = "load meta data for all sets complete";
export const LOAD_SET_META_ALL_ERROR = "load meta data for all sets error";

export const Actions = {
    loadSetMetaAllBegin: () => createAction(LOAD_SET_META_ALL_BEGIN),
    loadSetMetaAllComplete: (setMeta: {[id: string]: IFlashCardSetMeta}) =>
        createAction(LOAD_SET_META_ALL_COMPLETE, setMeta),
    loadSetMetaAllError: (message: string) => createAction(LOAD_SET_META_ALL_ERROR, { message }),

    addNewCardBegin: (setId: string, afterCardId?: string, callback?: (id: string) => void) =>
        createAction(ADD_NEW_CARD_BEGIN, { setId, callback, afterCardId, cardId: "" }),
    addNewCardComplete: (setId: string, cardId: string) =>
        createAction(ADD_NEW_CARD_COMPLETE, { setId, cardId }),

    updateSetName: (setId: string, newName: string) => createAction(UPDATE_SET_NAME, { setId, name: newName }),
    deleteCard: (card: IFlashCard) => createAction(DELETE_CARD, card),
    updateCardFace: (setId: string, cardId: string, face: IFlashCardFace) =>
        createAction(UPDATE_CARD_FACE, { setId, cardId, face }),
    addSet: (set?: IFlashCardSet, callback?: (id: string) => void) =>
        createAction(ADD_NEW_SET, { set, callback }),
    updateCardStudyData: (studyData: ICardStudyData) => createAction(UPDATE_CARD_STUDY_DATA, studyData),
    swapCardFaces: (setId: string, cardId: string) => createAction(SWAP_CARD_FACES, { cardId, setId }),

    /**
     * Resets the parts of the studydata that are temporary for a single study session
     */
    resetSessionStudyData: () => createAction(RESET_SESSION_STUDY_DATA),
};

export type Actions = ActionsUnion<typeof Actions>;
