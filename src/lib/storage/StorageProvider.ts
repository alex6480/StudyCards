import { Dispatch } from "redux";
import { IAppState } from "../../reducers";
import * as fromActions from "../../reducers/actions";
import IFlashCardSet, { IFlashCardSetMeta } from "../flashcard/FlashCardSet";

export default interface IStorageProvider {
    /**
     * Used to get meta data for all sets
     */
    getSetMetaAll: (dispatch: Dispatch) => void;

    /**
     * Adds a new card to the deck
     * Returns the id of the newly added card
     */
    addCard: (dispatch: Dispatch, setId: string, afterCardId?: string) => string;

    /**
     * Adds the specified set. A set with the same id cannot exist
     * Returns the id of the newly added set
     */
    addSet: (dispatch: Dispatch, set?: IFlashCardSet) => string;
}
