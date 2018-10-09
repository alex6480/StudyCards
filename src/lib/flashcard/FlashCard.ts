import { ExportFlashCardFace, ExportImageFlashCardFace, ExportNoFlashCardFace, ExportRichTextFlashCardFace,
    FlashCardFaceType, IFlashCardFace, IImageFlashCardFace, INoFlashCardFace,
    IRichTextFlashCardFace } from "./FlashCardFace";

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
        // Even though all information is kept in the base flashcard, on export only
        // the information for the current type is saved.
        // This prevents loss of information when user switches between card types until
        // the user resets the session
        switch (face.type) {
            case FlashCardFaceType.RichText:
                return new ExportRichTextFlashCardFace(face as IRichTextFlashCardFace);
            case FlashCardFaceType.None:
                return new ExportNoFlashCardFace(face as INoFlashCardFace);
            case FlashCardFaceType.Image:
                return new ExportImageFlashCardFace(face as IImageFlashCardFace);
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
