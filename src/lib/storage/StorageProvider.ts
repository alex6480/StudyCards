import { Dispatch } from "redux";
import { IAppState } from "../../reducers";
import * as fromActions from "../../reducers/actions";
import { IFlashCardMeta } from "../flashcard/flashcard";
import { IFlashCardFace } from "../flashcard/FlashCardFace";
import IFlashCardSet, { IFlashCardSetCardFilter, IFlashCardSetMeta } from "../flashcard/FlashCardSet";

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
     * Deletes the specified card
     */
    deleteCard: (dispatch: Dispatch, setId: string, cardId: string) => void;

    /**
     * Saves everything about a card except for its faces
     */
    saveCardMeta: (dispatch: Dispatch, setId: string, cardId: string, cardMeta: Partial<IFlashCardMeta>) => void;

    /**
     * Adds the specified set. A set with the same id cannot exist
     * Returns the id of the newly added set
     */
    addSet: (dispatch: Dispatch, set?: IFlashCardSet) => string;

    /**
     * Saves the card face on the remote host
     */
    saveCardFace: (dispatch: Dispatch, setId: string, cardId: string, face: IFlashCardFace) => void;

    /**
     * Returns a URI where an exported version of this set can be downloaded
     */
    getExportUri: (setId: string) => string;

    /**
     * Checks whether the specified set exists
     */
    setExists: (setId: string, callback: (setExists: boolean) => void) => void;

    /**
     * Updates the filtered cards for the specified set
     */
    filterCards: (dispatch: Dispatch, setId: string, filter: IFlashCardSetCardFilter) => void;
}
