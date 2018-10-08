import { Dispatch } from "redux";
import { IAppState } from "../../reducers";
import * as fromActions from "../../reducers/actions";
import IFlashCardSet, { IFlashCardSetMeta } from "../flashcard/FlashCardSet";

export default interface IStorageProvider {
    /**
     * This function is called when or more meta data properties of this set was modified
     * However, if the set is new, the cards can have any value
     */
    updateSet: (setIsNew: boolean, set: IFlashCardSet, dispatch: Dispatch) => void;

    /**
     * Used to get meta data for all sets
     */
    getSetMetaAll: (dispatch: Dispatch) => void;

    /**
     * Adds a new card to the deck
     */
    addCard: (dispatch: Dispatch, setId: string, afterCardId?: string) => void;
}
