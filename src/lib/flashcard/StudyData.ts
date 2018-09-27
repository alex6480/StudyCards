import FlashCard from "./flashcard";

export interface CardStudyData {
    cardId: string;
    dueDate: Date;

    /**
     * The time when this card should be prioritized to be reshuffled back into the study deck during a study session
     * This is temporary and will be reset at the beginning of every study session
     */
    reshuffleTime?: Date;
}

export interface SetStudyData {
    setId: string;
    lastStudied?: Date;
    cardData: { [cardId: string]: CardStudyData }
}