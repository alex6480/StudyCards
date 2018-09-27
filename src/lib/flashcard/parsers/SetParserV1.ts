import { convertFromRaw, RawDraftContentState } from "draft-js";
import * as Utils from "../../utils";
import IFlashCard, { ExportFlashCard } from "../flashcard";
import { ExportFlashCardFace, FlashCardFaceId, FlashCardFaceType, IFlashCardFace } from "../FlashCardFace";
import IFlashCardSet, { ExportFlashCardSet } from "../FlashCardSet";
import { ISetParser, ParseError } from "./SetParser";

type onErrorHandler = (err: ParseError) => void;

export class SetParser implements ISetParser {
    get exportVersion() { return "1"; }

    public parse(set: ExportFlashCardSet,
                 onSucces: (set: IFlashCardSet) => void,
                 onError: (errors: ParseError[]) => void) {
        const errors: ParseError[] = [];
        const err = (error: ParseError) => { errors.push(error); };

        if (set.exportVersion === undefined || set.exportVersion !== this.exportVersion) {
            err("The parser used does not support this set file version");
        } else {
            const result = this.Set(set, err);
            if (errors.length === 0) {
                onSucces(result);
            } else {
                onError(errors);
            }
        }
    }

    private Set(set: ExportFlashCardSet, onError: onErrorHandler): IFlashCardSet {
        const id = this.SetId(set, onError);
        const result: IFlashCardSet = {
            id,
            name: this.SetName(set, onError),
            cards: this.SetCards(set, id, onError),
        };
        return result;
    }

    private SetId(set: ExportFlashCardSet, onError: onErrorHandler): string {
        if (set.id === undefined || set.id == null || set.id.trim() === "") {
            return Utils.guid();
        } else {
            return set.id;
        }
    }

    private SetName(set: ExportFlashCardSet, onError: onErrorHandler): string {
        if (set.name === undefined || set.name == null) {
            return "Unnamed Set";
        } else if (set.name.trim() === "") {
            return "Unnamed Set";
        }
        return set.name;
    }

    private SetCards(set: ExportFlashCardSet, setId: string, onError: onErrorHandler): { [id: string]: IFlashCard } {
        const cards: { [id: string]: IFlashCard } = {};

        for (const cardId of Object.keys(set.cards)) {
            const card = set.cards[cardId];
            if (card.id !== cardId || card.id === undefined || card.id == null || card.id.trim() === "") {
                const id = Utils.guid();
                cards[id] = this.Card({ ...card, [id]: id}, setId, onError);
            } else {
                cards[card.id] = this.Card(card, setId, onError);
            }
        }

        return cards;
    }

    private Card(card: ExportFlashCard, setId: string, onError: onErrorHandler): IFlashCard {
        const id = this.CardId(card, onerror);
        const result: IFlashCard = {
            id,
            setId,
            faces: this.CardFaces(card, id, setId, onerror),
        };
        return result;
    }

    private CardId(card: ExportFlashCard, onError: onErrorHandler) {
        if (card.id === undefined || card.id == null || card.id.trim() === "") {
            return Utils.guid();
        } else {
            return card.id;
        }
    }

    private CardFaces(card: ExportFlashCard, cardId: string,
                      setId: string, onError: onErrorHandler): { [id in FlashCardFaceId]: IFlashCardFace } {
        const faces: { [id: string]: IFlashCardFace } = {};

        for (const faceId of Object.keys(card.faces)) {
            let face: ExportFlashCardFace | undefined;
            if (faceId === "front") {
                face = card.faces.front;
                if (faces.front !== undefined) {
                    onError("More than one front face exists for card " + cardId + " in set " + setId);
                    break;
                }
                faces.front = this.CardFace(face, "front", cardId, setId, onError);
            } else if (faceId === "back") {
                face = card.faces.back;
                if (faces.back !== undefined) {
                    onError("More than one back face exists for card " + cardId + " in set " + setId);
                    break;
                }
                faces.back = this.CardFace(face, "front", cardId, setId, onError);
            } else {
                onError("Unknown flash card face on card " + cardId + " in set " + setId);
                continue;
            }
        }

        return faces as { [id in FlashCardFaceId]: IFlashCardFace };
    }

    private CardFace(face: ExportFlashCardFace, faceId: FlashCardFaceId,
                     cardId: string, setId: string, onError: onErrorHandler): IFlashCardFace {
        return {
            id: faceId,
            cardId,
            setId,
            type: this.CardFaceType(face, onError),
            richTextContent: this.RichTextContent(face, onError),
        };
    }

    private CardFaceType(face: ExportFlashCardFace, onError: onErrorHandler) {
        switch (face.type) {
            case FlashCardFaceType.Image:
                return FlashCardFaceType.Image;
            case FlashCardFaceType.RichText:
                return FlashCardFaceType.RichText;
            case FlashCardFaceType.None:
                return FlashCardFaceType.None;
            default:
                onError("Unknown flash card face type");
                return FlashCardFaceType.None;
        }
    }

    private RichTextContent(face: ExportFlashCardFace, onError: onErrorHandler) {
        if (face.richTextContent == null) {
            return null;
        }

        const raw = JSON.parse(face.richTextContent) as RawDraftContentState;
        try {
            return convertFromRaw(raw);
        } catch (e) {
            onError("Unable to parse richTextContent for a face");
            return null;
        }
    }
}
