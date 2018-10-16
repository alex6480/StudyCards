import { ContentState, convertFromRaw, RawDraftContentState } from "draft-js";
import IRemote from "../../remote";
import * as Utils from "../../utils";
import IFlashCard, { ExportFlashCard } from "../flashcard";
import { ExportFlashCardFace, ExportImageFlashCardFace, ExportRichTextFlashCardFace,
    FlashCardFaceId, FlashCardFaceType, IFlashCardFace } from "../FlashCardFace";
import IFlashCardSet, { ExportFlashCardSet } from "../FlashCardSet";
import { parseCard } from "./parseCard";

export type onErrorHandler = (err: ParseError) => void;
export type ParseError = string;

export default function parse(set: ExportFlashCardSet,
                              onSucces: (set: IFlashCardSet) => void,
                              onError: (errors: ParseError[]) => void) {
    const errors: ParseError[] = [];
    const err = (error: ParseError) => { errors.push(error); };

    if (set.exportVersion === undefined || set.exportVersion !== "1") {
        err("The parser used does not support this set file version");
    } else {
        const result = parseSet(set, err);
        if (errors.length === 0) {
            onSucces(result);
        } else {
            onError(errors);
        }
    }
}

function parseSet(set: ExportFlashCardSet, onError: onErrorHandler): IFlashCardSet {
    const id = parseId(set, onError);
    const cards = parseCards(set, id, onError);
    const cardOrder = parseCardOrder(set, cards, onError);

    const result: IFlashCardSet = {
        id,
        name: parseName(set, onError),
        cards: Utils.objectMapString(cards, (k, v) => ({ isFetching: false, value: v, lastUpdated: Date.now() })),
        cardOrder: parseCardOrder(set, cards, onError),
        availableTags: Utils.countTags(cards),
        filter: { tags: { } },
        filteredCardOrder: { isFetching: false, value: cardOrder },
    };

    return result;
}

function parseId(set: ExportFlashCardSet, onError: onErrorHandler): string {
    if (set.id === undefined || set.id == null || set.id.trim() === "") {
        return Utils.guid();
    } else {
        return set.id;
    }
}

function parseName(set: ExportFlashCardSet, onError: onErrorHandler): string {
    if (set.name === undefined || set.name == null || set.name.trim() === "") {
        return "Unnamed Set";
    }
    return set.name;
}

function parseCardOrder(set: ExportFlashCardSet,
                        cards: {[id: string]: IFlashCard},
                        onError: onErrorHandler): string[] {
    return Object.keys(cards).sort();
}

function parseCards(set: ExportFlashCardSet, setId: string, onError: onErrorHandler): { [id: string]: IFlashCard } {
    const cards: { [id: string]: IFlashCard } = {};

    for (const cardId of Object.keys(set.cards)) {
        const card = set.cards[cardId];
        if (card.id !== cardId || card.id === undefined || card.id == null || card.id.trim() === "") {
            const id = Utils.guid();
            cards[id] = parseCard({ ...card, [id]: id}, setId, onError);
        } else {
            cards[card.id] = parseCard(card, setId, onError);
        }
    }

    return cards;
}
