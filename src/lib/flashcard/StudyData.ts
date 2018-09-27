import FlashCard from "./flashcard";

export interface CardStudyData {
    cardId: string;
    dueDate: Date;
    reshuffleTime?: Date;
}

export interface SetStudyData {
    setId: string;
    lastStudied?: Date;
    cardData: { [cardId: string]: CardStudyData }
}