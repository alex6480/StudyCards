import { Dispatch } from "redux";
import { IAppState } from "../../reducers";
import * as fromActions from "../../reducers/actions";
import { IFlashCardFace } from "../flashcard/FlashCardFace";
import IFlashCardSet, { IFlashCardSetMeta } from "../flashcard/FlashCardSet";

export default interface IStorageProvider {
    /**
     * Used to get meta data for all sets
     */
    loadSetMetaAll: (dispatch: Dispatch) => void;

    /**
     * Saves the metadata for the specified set on the remote source
     */
    saveSetMeta: (dispatch: Dispatch, setMeta: Partial<IFlashCardSetMeta>) => void;

    /**
     * Fetches the studydata for the specified set
     */
    loadSetStudyData: (dispatch: Dispatch, setId: string) => void;

    /**
     * Fetches card data for the specified card ids
     */
    loadCards: (dispatch: Dispatch, setId: string, cardIds: string[]) => void;

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

    /**
     * Saves the card face on the remote host
     */
    saveCardFace: (dispatch: Dispatch, setId: string, cardId: string, face: IFlashCardFace) => void;
}
