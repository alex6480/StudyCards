import IRemote from "../remote";
import { objectMapString } from "../utils";
import IFlashCard, { ExportFlashCard } from "./flashcard";

export interface IFlashCardSetMeta {
    id: number;
    name: string;

    cardOrder: string[];
    filter: IFlashCardFilter;
    filteredCardOrder: IRemote<string[]>;

    availableTags: { [tag: string]: number };
}

export interface IFlashCardFilter {
    tags: { [tag: string]: boolean };
}

export default interface IFlashCardSet extends IFlashCardSetMeta {
    cards: { [id: string]: IRemote<IFlashCard>; };
}

export class ExportFlashCardSet {
    public readonly cards: { [id: string]: ExportFlashCard; };
    public readonly name: string;
    public readonly id: number;
    public readonly exportVersion: string = "1";

    constructor(set: IFlashCardSet) {
        this.cards = objectMapString(set.cards, (k, v) => {
            if (v.value === undefined) {
                throw new Error("Flashcards must be fetched from the server prior to creating an export set");
            }
            return new ExportFlashCard(v.value);
        });
        this.name = set.name;
        this.id = set.id;
    }
}
