import { ContentState, convertToRaw } from "draft-js";

export type FlashCardFaceId = "back" | "front";

export enum FlashCardFaceType {
    None,
    Image,
    RichText,
}

export interface FlashCardFace {
    id: FlashCardFaceId;
    setId: string;
    cardId: string;
    type: FlashCardFaceType;
    richTextContent: ContentState | null;
}

export class ExportFlashCardFace {
    public readonly id: string;
    public readonly type: FlashCardFaceType;
    public readonly richTextContent: string |null;

    constructor (face: FlashCardFace) {
        this.id = face.id;
        this.type = face.type;

        let rawContent = face.richTextContent != null ? convertToRaw(face.richTextContent) : null;
        this.richTextContent = JSON.stringify(rawContent); 
        //this.richTextContent = draftToMarkdown(rawContent, {}) 
    }
}