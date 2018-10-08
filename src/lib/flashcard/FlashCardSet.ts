import IRemote from "../remote";
import { objectMapString } from "../utils";
import IFlashCard, { ExportFlashCard } from "./flashcard";

export interface IFlashCardSetMeta {
    cardOrder: string[];
    name: string;
    id: string;
}

export default interface IFlashCardSet extends IFlashCardSetMeta {
    cards: { [id: string]: IRemote<IFlashCard>; };
}

export class ExportFlashCardSet {
    public readonly cards: { [id: string]: ExportFlashCard; };
    public readonly name: string;
    public readonly id: string;
    public readonly exportVersion: string = "1";

    constructor(set: IFlashCardSet) {
        throw new Error("CAnnot export at the moment");
        // this.cards = objectMapString(set.cards, (k, v) => new ExportFlashCard(v));
        this.name = set.name;
        this.id = set.id;
    }
}
