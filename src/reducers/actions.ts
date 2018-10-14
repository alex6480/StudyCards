import { Dispatch } from "redux";
import IFlashCard, { IFlashCardMeta } from "../lib/flashcard/flashcard";
import { IFlashCardFace } from "../lib/flashcard/FlashCardFace";
import IFlashCardSet, { IFlashCardSetMeta } from "../lib/flashcard/FlashCardSet";
import { ICardStudyData, ISetStudyData } from "../lib/flashcard/StudyData";

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

export const RESET_SESSION_STUDY_DATA = "reset session study data";
export const UPDATE_CARD_STUDY_DATA = "update card study data";
export const SWAP_CARD_FACES = "swap card faces";

// Remote actions
export const DELETE_CARD_BEGIN = "delete card begin";
export const DELETE_CARD_COMPLETE = "delete card complete";

export const SAVE_CARD_FACE_BEGIN = "save card face begin";
export const SAVE_CARD_FACE_COMPLETE = "save card face complete";

export const ADD_NEW_SET_BEGIN = "add new set begin";
export const ADD_NEW_SET_COMPLETE = "add new set complete";

export const ADD_NEW_CARD_BEGIN = "add new card begin";
export const ADD_NEW_CARD_COMPLETE = "add new card complete";
export const ADD_NEW_CARD_ERROR = "add new card error";

export const LOAD_SET_META_ALL_BEGIN = "load meta data for all sets begin";
export const LOAD_SET_META_ALL_COMPLETE = "load meta data for all sets complete";
export const LOAD_SET_META_ALL_ERROR = "load meta data for all sets error";

export const LOAD_SET_STUDY_DATA_BEGIN = "load set study data begin";
export const LOAD_SET_STUDY_DATA_COMPLETE = "load set study data complete";

export const LOAD_CARDS_BEGIN = "load cards begin";
export const LOAD_CARDS_COMPLETE = "load cards complete";

export const SAVE_CARD_META_BEGIN = "save card meta begin";
export const SAVE_CARD_META_COMPLETE = "save card meta complete";

export const SAVE_SET_META_BEGIN = "save set meta begin";
export const SAVE_SET_META_COMPLETE = "save set meta complete";

export const Action = {
    loadSetMetaAllBegin: () => createAction(LOAD_SET_META_ALL_BEGIN),
    loadSetMetaAllComplete: (setMeta: {[id: string]: IFlashCardSetMeta}) =>
        createAction(LOAD_SET_META_ALL_COMPLETE, setMeta),
    loadSetMetaAllError: (message: string) => createAction(LOAD_SET_META_ALL_ERROR, { message }),

    loadSetStudyDataBegin: (setId: string) => createAction(LOAD_SET_STUDY_DATA_BEGIN, { setId }),
    loadSetStudyDataComplete: (result: ISetStudyData) =>
        createAction(LOAD_SET_STUDY_DATA_COMPLETE, { setId: result.setId, result }),

    loadCardsBegin: (setId: string, cardIds: string[]) => createAction(LOAD_CARDS_BEGIN, { setId, cardIds }),
    loadCardsComplete: (setId: string, cards: {[id: string]: IFlashCard }) =>
        createAction(LOAD_CARDS_COMPLETE, { setId, cards }),

    addNewCardBegin: (cardId: string, setId: string, afterCardId?: string) =>
        createAction(ADD_NEW_CARD_BEGIN, { cardId, setId, afterCardId }),
    addNewCardComplete: (setId: string, cardId: string) =>
        createAction(ADD_NEW_CARD_COMPLETE, { setId, cardId }),

    addSetBegin: (setId: string, set: Partial<IFlashCardSet>) =>
        createAction(ADD_NEW_SET_BEGIN, { setId, set }),
    addSetComplete: (setId: string) => createAction(ADD_NEW_SET_COMPLETE, { setId }),

    saveCardFaceBegin: (setId: string, cardId: string, face: IFlashCardFace) =>
        createAction(SAVE_CARD_FACE_BEGIN, { setId, cardId, face }),
    saveCardFaceComplete: (setId: string, cardId: string) =>
        createAction(SAVE_CARD_FACE_COMPLETE, { setId, cardId }),

    saveCardMetaBegin: (setId: string, cardId: string, cardMeta: Partial<IFlashCardMeta>) =>
        createAction(SAVE_CARD_META_BEGIN, { setId, cardId, cardMeta }),
    saveCardMetaComplete: (setId: string, cardId: string, cardMeta: IFlashCardMeta) =>
        createAction(SAVE_CARD_META_COMPLETE, { setId, cardId, cardMeta }),

    saveSetMetaBegin: (setMeta: Partial<IFlashCardSetMeta>) =>
        createAction(SAVE_SET_META_BEGIN, { setId: setMeta.id, setMeta }),
    saveSetMetaComplete: (setId: string) =>
        createAction(SAVE_SET_META_COMPLETE, { setId }),

    deleteCardBegin: (setId: string, cardId: string) => createAction(DELETE_CARD_BEGIN, { cardId, setId }),
    deleteCardComplete: (setId: string, cardId: string) => createAction(DELETE_CARD_COMPLETE, { cardId, setId }),

    updateCardStudyData: (studyData: ICardStudyData) => createAction(UPDATE_CARD_STUDY_DATA, studyData),
    swapCardFaces: (setId: string, cardId: string) => createAction(SWAP_CARD_FACES, { cardId, setId }),

    /**
     * Resets the parts of the studydata that are temporary for a single study session
     */
    resetSessionStudyData: () => createAction(RESET_SESSION_STUDY_DATA),
};

export type Action = ActionsUnion<typeof Action>;
