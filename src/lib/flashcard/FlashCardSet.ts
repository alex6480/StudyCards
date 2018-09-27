import { objectMapString } from "./../utils";
import IFlashCard, { ExportFlashCard } from "./flashcard";

export default interface IFlashCardSet {
    cards: { [id: string]: IFlashCard; };
    name: string;
    id: string;
}

export class ExportFlashCardSet {
    public readonly cards: { [id: string]: ExportFlashCard; };
    public readonly name: string;
    public readonly id: string;
    public readonly exportVersion: string = "1";

    constructor(set: IFlashCardSet) {
        this.cards = objectMapString(set.cards, (k, v) => new ExportFlashCard(v));
        this.name = set.name;
        this.id = set.id;
    }
}
