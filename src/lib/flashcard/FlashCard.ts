import { ExportFlashCardFace, FlashCardFace } from "./FlashCardFace";

export default interface FlashCard {
    id: string;
    setId: string;
    faces: {
        front: FlashCardFace,
        back: FlashCardFace
    }
}

export class ExportFlashCard {
    public readonly id: string;
    public readonly faces: {
        front: ExportFlashCardFace,
        back: ExportFlashCardFace
    }

    constructor (flashcard: FlashCard) {
        this.id = flashcard.id;
        this.faces = {
            front: new ExportFlashCardFace(flashcard.faces.front),
            back: new ExportFlashCardFace(flashcard.faces.back),
        }
    }
}