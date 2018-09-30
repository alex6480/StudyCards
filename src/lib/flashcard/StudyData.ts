import IFlashCard from "./flashcard";

export interface ICardStudyData {
    cardId: string;
    dueDate: Date;

    /**
     * The time when this card should be prioritized to be redrawn from the study deck during a study session
     * This is temporary and will be reset at the beginning of every study session
     */
    redrawTime: Date | null;
}

export interface ISetStudyData {
    setId: string;
    lastStudied?: Date;
    cardData: { [cardId: string]: ICardStudyData };
}
