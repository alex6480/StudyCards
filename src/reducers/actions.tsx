import FlashCard from "../lib/flashcard/flashcard";
import FlashCardSet from "../lib/flashcard/FlashCardSet";
import { FlashCardFace } from "../lib/flashcard/FlashCardFace";

/*
    Boilerplate stuff used to get typesafety within Redux
*/
export interface Action<T extends string> {
    type: T;
}
export interface ActionWithPayload<T extends string, P> extends Action<T> {
    payload: P;
}

export function createAction<T extends string> (type: T): Action<T>
export function createAction<T extends string, P> (type: T, payload: P): ActionWithPayload<T, P>
export function createAction<T extends string, P> (type: T, payload?: P) {
    return payload == undefined ? { type } : { type, payload };
}

type FunctionType = (...args: any[]) => any;
type ActionsCreatorMapObject = { [actionCreator: string]: FunctionType };

export type ActionsUnion<A extends ActionsCreatorMapObject> = ReturnType<A[keyof A]>;

export const ADD_NEW_CARD = "add new card";
export const UPDATE_SET_NAME = "update set name";
export const DELETE_CARD = "delete card";
export const UPDATE_CARD_FACE = "update card face";
export const ADD_NEW_SET = "add new set";

export const Actions = {
    addNewCard: (setId: string) => createAction(ADD_NEW_CARD, { setId: setId }),
    updateSetName: (set: FlashCardSet, newName: string) => createAction(UPDATE_SET_NAME, { set: set, name: newName }),
    deleteCard: (card: FlashCard) => createAction(DELETE_CARD, card),
    updateCardFace: (cardId: string, face: FlashCardFace) => createAction(UPDATE_CARD_FACE, {
        cardId: cardId,
        face: face
    }),
    addSet: (set?: FlashCardSet) => createAction(ADD_NEW_SET, { set: set })
}

export type Actions = ActionsUnion<typeof Actions>;