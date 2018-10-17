import { Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import { IAppState } from "../../reducers";
import { Action } from "../../reducers/actions";
import { IFlashCardMeta } from "../flashcard/flashcard";
import { IFlashCardFace } from "../flashcard/FlashCardFace";
import IFlashCardSet, { IFlashCardSetCardFilter, IFlashCardSetMeta } from "../flashcard/FlashCardSet";
import { LocalStorageProvider } from "./LocalStorageProvider";

export let Storage: IStorageProvider = new LocalStorageProvider();
export function setStorageProvider(storageProvider: IStorageProvider) {
    Storage = storageProvider;
}

export default interface IStorageProvider {
    /**
     * Used to get meta data for all sets
     */
    loadSetMetaAll: () => ThunkAction<void, IAppState, void, Action>;

    /**
     * Saves the metadata for the specified set on the remote source
     */
    saveSetMeta: (setMeta: Partial<IFlashCardSetMeta>) => ThunkAction<void, IAppState, void, Action>;

    /**
     * Fetches the studydata for the specified set
     */
    loadSetStudyData: (setId: string) => ThunkAction<void, IAppState, void, Action>;

    /**
     * Fetches card data for the specified card ids
     */
    loadCards: (setId: string, cardIds: string[]) => ThunkAction<void, IAppState, void, Action>;

    /**
     * Adds a new card to the deck
     * Returns the id of the newly added card
     */
    addCard: (setId: string, afterCardId?: string) => ThunkAction<string, IAppState, void, Action>;

    /**
     * Deletes the specified card
     */
    deleteCard: (setId: string, cardId: string) => ThunkAction<void, IAppState, void, Action>;

    /**
     * Saves everything about a card except for its faces
     */
    saveCardMeta: (setId: string, cardId: string, cardMeta: Partial<IFlashCardMeta>) =>
        ThunkAction<void, IAppState, void, Action>;

    /**
     * Adds the specified set. A set with the same id cannot exist
     * Returns the id of the newly added set
     */
    addSet: (set?: IFlashCardSet) => ThunkAction<string, IAppState, void, Action>;

    /**
     * Saves the card face on the remote host
     */
    saveCardFace: (setId: string, cardId: string, face: IFlashCardFace) =>
        ThunkAction<void, IAppState, void, Action>;

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
    filterCards: (setId: string, filter: IFlashCardSetCardFilter) => ThunkAction<void, IAppState, void, Action>;
}
