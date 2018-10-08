import { Dispatch } from "redux";
import { IAppState } from "../../reducers";
import * as fromActions from "../../reducers/actions";
import IFlashCard from "../flashcard/flashcard";
import IFlashCardSet, { IFlashCardSetMeta } from "../flashcard/FlashCardSet";
import IStorageProvider from "./StorageProvider";

/**
 * A storage provider that stores all data in the browser local storage
 */
export class LocalStorageProvider implements IStorageProvider {
    private idDelimiter = ".";

    public updateSet(setIsNew: boolean, set: IFlashCardSet, dispatch: Dispatch) {
        const {cards, ...rest} = set;
        const setMeta: IFlashCardSetMeta = rest;

        // Make sure the set index contains the specified set
        const setIds = this.getSetIds();
        if (setIds.indexOf(set.id) === -1) {
            localStorage.setItem("sets", setIds.concat(set.id).join(this.idDelimiter));
        }

        // Save the set
        localStorage.setItem(this.setKey(set.id), JSON.stringify(setMeta));

        if (setIsNew) {
            // Save the cards
            for (const cardId of set.cardOrder) {
                this.saveCard(cards[cardId].value());
            }
        }
    }

    public getSetMetaAll(dispatch: Dispatch) {
        dispatch(fromActions.Actions.loadSetMetaAllBegin());

        const setIds = this.getSetIds();
        const meta = setIds.reduce((result: {[id: string]: IFlashCardSetMeta}, item, index, array) => {
            result[index] = this.getSetMeta(item);
            return result;
        }, {});

        dispatch(fromActions.Actions.loadSetMetaAllComplete(meta));
    }

    private getSetMeta(setId: string): IFlashCardSetMeta {
        const data = localStorage.getItem(this.setKey(setId));
        if (data === null) {
            throw new Error("No metadata is available for set with id " + setId);
        }
        return JSON.parse(data);
    }

    /**
     * Saves all data associated with a single flashcard
     */
    private saveCard(card: IFlashCard) {
        localStorage.setItem(this.cardKey(card.setId, card.id), JSON.stringify(card));
    }

    /**
     * Return the localstorage key for a set with the specified id
     */
    private setKey(setId: string) {
        return "sets" + this.idDelimiter + setId;
    }

    /**
     * Return the localstorage key for a card with the specified id
     */
    private cardKey(setId: string, cardId: string) {
        return "cards" + this.idDelimiter + setId + this.idDelimiter + cardId;
    }

    /**
     * Returns all stored set ids
     */
    private getSetIds() {
        const setIdData = localStorage.getItem("sets");
        const setIds = setIdData === null ? [] : setIdData.split(this.idDelimiter);
        return setIds;
    }
}
