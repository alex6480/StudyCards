import { ContentState, convertFromRaw, RawDraftContentState } from "draft-js";
import * as Utils from "../../utils";
import IFlashCard, { ExportFlashCard } from "../flashcard";
import { ExportFlashCardFace, ExportRichTextFlashCardFace, FlashCardFaceId,
    FlashCardFaceType, IFlashCardFace } from "../FlashCardFace";
import { onErrorHandler, ParseError } from "./parseSet";
// import remarkableRevealPlugin from "./remarkableRevealPlugin";

export default function parse(card: ExportFlashCard, setId: string): IFlashCard | ParseError[] {
    const errors: ParseError[] = [];
    const err = (error: ParseError) => { errors.push(error); };

    const result = parseCard(card, setId, err);
    if (errors.length === 0) {
        return result;
    } else {
        return errors;
    }
}

export function parseCard(card: ExportFlashCard, setId: string, onError: onErrorHandler): IFlashCard {
    const id = parseId(card, onError);
    const result: IFlashCard = {
        id,
        setId,
        tags: parseTags(card, onError),
        faces: parseFaces(card, id, setId, onError),
    };
    return result;
}

function parseId(card: ExportFlashCard, onError: onErrorHandler) {
    if (card.id === undefined || card.id == null || card.id.trim() === "") {
        return Utils.guid();
    } else {
        return card.id;
    }
}

function parseFaces(card: ExportFlashCard, cardId: string,
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
            faces.front = parseFace(face, "front", cardId, setId, onError);
        } else if (faceId === "back") {
            face = card.faces.back;
            if (faces.back !== undefined) {
                onError("More than one back face exists for card " + cardId + " in set " + setId);
                break;
            }
            faces.back = parseFace(face, "back", cardId, setId, onError);
        } else {
            onError("Unknown flash card face on card " + cardId + " in set " + setId);
            continue;
        }
    }

    return faces as { [id in FlashCardFaceId]: IFlashCardFace };
}

function parseFace(face: ExportFlashCardFace, faceId: FlashCardFaceId,
                   cardId: string, setId: string, onError: onErrorHandler): IFlashCardFace {
    const cardFaceType = parseFaceType(face, onError);
    switch (cardFaceType) {
        case FlashCardFaceType.RichText:
            return {
                id: faceId,
                cardId,
                setId,
                type: cardFaceType,
                richTextContent: parseRichTextContent(face as ExportRichTextFlashCardFace, onError),
            };
        case FlashCardFaceType.Image:
            return {
                id: faceId,
                cardId,
                setId,
                type: FlashCardFaceType.None,
                richTextContent: ContentState.createFromText(""),
            };
        case FlashCardFaceType.None:
            return {
                id: faceId,
                cardId,
                setId,
                type: FlashCardFaceType.None,
                richTextContent: ContentState.createFromText(""),
            };
        default:
            onError("Unknown face type");
            return {
                id: faceId,
                cardId,
                setId,
                type: FlashCardFaceType.None,
                richTextContent: ContentState.createFromText(""),
            };
    }
}

function parseTags(card: ExportFlashCard, onError: onErrorHandler): string[] {
    if (card.tags === undefined) {
        return [];
    } else {
        return card.tags;
    }
}

function parseFaceType(face: ExportFlashCardFace, onError: onErrorHandler) {
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

function parseRichTextContent(face: ExportRichTextFlashCardFace, onError: onErrorHandler) {
    try {
        const raw = JSON.parse(face.richTextContent) as RawDraftContentState;
        return convertFromRaw(raw);
    } catch (e) {
        onError("Unable to parse richTextContent for a face");
        return ContentState.createFromText("");
    }
}
