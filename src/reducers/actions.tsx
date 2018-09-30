import IFlashCard from "../lib/flashcard/flashcard";
import { IFlashCardFace } from "../lib/flashcard/FlashCardFace";
import IFlashCardSet from "../lib/flashcard/FlashCardSet";
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

export const ADD_NEW_CARD = "add new card";
export const UPDATE_SET_NAME = "update set name";
export const DELETE_CARD = "delete card";
export const UPDATE_CARD_FACE = "update card face";
export const ADD_NEW_SET = "add new set";
export const RESET_SESSION_STUDY_DATA = "reset session study data";
export const UPDATE_CARD_STUDY_DATA = "update card study data";

export const Actions = {
    addNewCard: (setId: string) => createAction(ADD_NEW_CARD, { setId }),
    updateSetName: (set: IFlashCardSet, newName: string) => createAction(UPDATE_SET_NAME, { set, name: newName }),
    deleteCard: (card: IFlashCard) => createAction(DELETE_CARD, card),
    updateCardFace: (cardId: string, face: IFlashCardFace) => createAction(UPDATE_CARD_FACE, { cardId, face }),
    addSet: (set?: IFlashCardSet) => createAction(ADD_NEW_SET, { set }),
    updateCardStudyData: (studyData: ICardStudyData) => createAction(UPDATE_CARD_STUDY_DATA, studyData),

    /**
     * Resets the parts of the studydata that are temporary for a single study session
     */
    resetSessionStudyData: () => createAction(RESET_SESSION_STUDY_DATA),
};

export type Actions = ActionsUnion<typeof Actions>;
