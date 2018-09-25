import { ISetParser, ParseError } from "./SetParser";
import FlashCardSet, { ExportFlashCardSet } from "../FlashCardSet";
import * as utils from '../../utils';
import FlashCard, { ExportFlashCard } from "../flashcard";
import { FlashCardFace, ExportFlashCardFace, FlashCardFaceId, FlashCardFaceType } from "../FlashCardFace";
import { RawDraftContentState, convertFromRaw } from "draft-js";

type onError = (err: ParseError) => void;

export class SetParser implements ISetParser {
    get exportVersion () { return "1" }

    public parse (set: ExportFlashCardSet, onSucces: (set: FlashCardSet) => void, onError: (errors: ParseError[]) => void) {
        var errors: ParseError[] = [];
        let err = (err: ParseError) => { errors.push(err); }

        if (set.exportVersion == undefined || set.exportVersion != this.exportVersion) {
            err("The parser used does not support this set file version");
        } else {
            var result = this.Set(set, err);
            if (errors.length == 0) {
                onSucces(result);
            } else {
                onError(errors);
            }
        }
    }

    private Set (set: ExportFlashCardSet, onError: onError): FlashCardSet {
        let id = this.SetId(set, onError);
        var result: FlashCardSet = {
            id: id,
            name: this.SetName(set, onError),
            cards: this.SetCards(set, id, onError),
        }
        return result;
    }

    private SetId (set: ExportFlashCardSet, onError: onError): string {
        if (set.id == undefined || set.id == null || set.id.trim() == "") {
            return utils.guid()
        } else {
            return set.id;
        }
    }

    private SetName (set: ExportFlashCardSet, onError: onError): string {
        if (set.name == undefined || set.name == null) {
            return "Unnamed Set";
        } else if (set.name.trim() == "") {
            return "Unnamed Set";
        }
        return set.name;
    }

    private SetCards (set: ExportFlashCardSet, setId: string, onError: onError): { [id: string]: FlashCard } {
        let cards: { [id: string]: FlashCard } = {};

        for (var cardId in set.cards) {
            var card = set.cards[cardId];
            if (card.id != cardId || card.id == undefined || card.id == null || card.id.trim() == "") {
                let id = utils.guid();
                cards[id] = this.Card({ ...card, [id]: id}, setId, onError);
            } else {
                cards[card.id] = this.Card(card, setId, onError);
            }
        }

        return cards;
    }

    private Card (card: ExportFlashCard, setId: string, onError: onError): FlashCard {
        let id = this.CardId(card, onerror); 
        var result: FlashCard = {
            id: id,
            setId: setId,
            faces: this.CardFaces(card, id, setId, onerror),
        }
        return result;
    }

    private CardId (card: ExportFlashCard, onError: onError) {
        if (card.id == undefined || card.id == null || card.id.trim() == "") {
            return utils.guid()
        } else {
            return card.id;
        }
    }

    private CardFaces (card: ExportFlashCard, cardId: string, setId: string, onError: onError): { [id in FlashCardFaceId]: FlashCardFace } {
        let faces: { [id: string]: FlashCardFace } = {};

        for (var faceId in card.faces) {
            let face: ExportFlashCardFace | undefined = undefined;
            if (faceId == "front") {
                face = card.faces.front;
                if (faces["front"] != undefined) {
                    onError("More than one front face exists for card " + cardId + " in set " + setId);
                    break;
                }
                faces.front = this.CardFace(face, "front", cardId, setId, onError);
            } else if (faceId == "back") {
                face = card.faces.back;
                if (faces["back"] != undefined) {
                    onError("More than one back face exists for card " + cardId + " in set " + setId);
                    break;
                }
                faces.back = this.CardFace(face, "front", cardId, setId, onError);
            } else {
                onError("Unknown flash card face on card " + cardId + " in set " + setId);
                continue;
            }
        }

        return faces as { [id in FlashCardFaceId]: FlashCardFace };
    }

    private CardFace (face: ExportFlashCardFace, faceId: FlashCardFaceId, cardId: string, setId: string, onError: onError): FlashCardFace {
        return {
            id: faceId,
            cardId: cardId,
            setId: setId,
            type: this.CardFaceType(face, onError),
            richTextContent: this.RichTextContent(face, onError)
        }
    }

    private CardFaceType (face: ExportFlashCardFace, onError: onError) {
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

    private RichTextContent (face: ExportFlashCardFace, onError: onError) {
        if (face.richTextContent == null) {
            return null;
        }
        
        let raw = JSON.parse(face.richTextContent) as RawDraftContentState;
        try
        {
            return convertFromRaw(raw);
        } catch (e) {
            onError("Unable to parse richTextContent for a face");
            return null;
        }
    }
}