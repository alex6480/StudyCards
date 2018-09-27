import { ExportFlashCardFace, IFlashCardFace } from "./FlashCardFace";

export default interface IFlashCard {
    id: string;
    setId: string;
    faces: {
        front: IFlashCardFace,
        back: IFlashCardFace,
    };
}

export class ExportFlashCard {
    public readonly id: string;
    public readonly faces: {
        front: ExportFlashCardFace,
        back: ExportFlashCardFace,
    };

    constructor(flashcard: IFlashCard) {
        this.id = flashcard.id;
        this.faces = {
            front: new ExportFlashCardFace(flashcard.faces.front),
            back: new ExportFlashCardFace(flashcard.faces.back),
        };
    }
}
