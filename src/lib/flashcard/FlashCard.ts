import { ExportFlashCardFace, ExportImageFlashCardFace, ExportNoFlashCardFace, ExportRichTextFlashCardFace,
    FlashCardFaceType, IFlashCardFace } from "./FlashCardFace";

export default interface IFlashCard {
    id: string;
    setId: string;
    faces: {
        front: IFlashCardFace,
        back: IFlashCardFace,
    };
}

export class ExportFlashCard {
    private static getExportFace(face: IFlashCardFace): ExportFlashCardFace {
        switch (face.type) {
            case FlashCardFaceType.RichText:
                return new ExportRichTextFlashCardFace(face);
            case FlashCardFaceType.None:
                return new ExportNoFlashCardFace(face);
            case FlashCardFaceType.Image:
                return new ExportImageFlashCardFace(face);
        }
    }

    public readonly id: string;
    public readonly faces: {
        front: ExportFlashCardFace,
        back: ExportFlashCardFace,
    };

    constructor(flashcard: IFlashCard) {
        this.id = flashcard.id;
        this.faces = {
            front: ExportFlashCard.getExportFace(flashcard.faces.front),
            back: ExportFlashCard.getExportFace(flashcard.faces.back),
        };
    }
}
