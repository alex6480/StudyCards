import { createAction } from ".";
import { IFlashCardSetMeta } from "../../lib/flashcard/FlashCardSet";

export const LIST_SETS_BEGIN = "LIST_SETS_BEGIN";
export const LIST_SETS_COMPLETE = "LIST_SETS_COMPLETE";
export const LIST_SETS_ERROR = "LIST_SETS_ERROR";

export const setActions = {
    loadSetMetaAllBegin: () => createAction(LIST_SETS_BEGIN),
    loadSetMetaAllComplete: (setMeta: {[id: string]: IFlashCardSetMeta}) =>
        createAction(LIST_SETS_COMPLETE, setMeta),
    loadSetMetaAllError: () => createAction(LIST_SETS_ERROR, { }),
};
