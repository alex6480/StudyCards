import FlashCard, { ExportFlashCard } from "./flashcard";
import { objectMapString } from "./../utils";

export default interface FlashCardSet {
    cards: { [id: string] : FlashCard; };
    name: string;
    id: string;
}

export class ExportFlashCardSet {
    public readonly cards: { [id: string] : ExportFlashCard; };
    public readonly name: string;
    public readonly id: string;
    public readonly exportVersion: string = "1";

    constructor (set: FlashCardSet) {
        this.cards = objectMapString(set.cards, (k, v) => new ExportFlashCard(v))
        this.name = set.name;
        this.id = set.id;
    }
}