import { ContentState, convertToRaw } from "draft-js";

export type FlashCardFaceId = "back" | "front";

export enum FlashCardFaceType {
    None,
    Image,
    RichText,
}

export interface IFlashCardFace {
    id: FlashCardFaceId;
    setId: string;
    cardId: string;
    type: FlashCardFaceType;
    richTextContent: ContentState;
}

export interface IRichTextFlashCardFace extends IFlashCardFace {
    type: FlashCardFaceType.RichText;
}

export interface INoFlashCardFace extends IFlashCardFace {
    type: FlashCardFaceType.None;
}

export interface IImageFlashCardFace extends IFlashCardFace {
    type: FlashCardFaceType.Image;
}

export type ExportFlashCardFace = ExportRichTextFlashCardFace | ExportNoFlashCardFace | ExportImageFlashCardFace;

export class ExportRichTextFlashCardFace {
    public readonly id: string;
    public readonly type: FlashCardFaceType.RichText;
    public readonly richTextContent: string;

    constructor(face: IRichTextFlashCardFace) {
        this.id = face.id;
        this.type = face.type;
        const rawContent = face.richTextContent != null ? convertToRaw(face.richTextContent) : null;
        this.richTextContent = JSON.stringify(rawContent);
        // this.richTextContent = draftToMarkdown(rawContent, {})
    }
}

export class ExportNoFlashCardFace {
    public readonly id: string;
    public readonly type: FlashCardFaceType.None;

    constructor(face: INoFlashCardFace) {
        this.id = face.id;
        this.type = face.type;
    }
}

export class ExportImageFlashCardFace {
    public readonly id: string;
    public readonly type: FlashCardFaceType.Image;

    constructor(face: IImageFlashCardFace) {
        this.id = face.id;
        this.type = face.type;
    }
}
