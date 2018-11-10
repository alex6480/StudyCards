import IFlashCard from "./flashcard";

export interface ICardStudyData {
    setId: number;
    cardId: string;
    dueDate: Date;

    /**
     * A numeric score indicating how well the user understands this card
     * New cards have understanding level 0
     */
    understandingLevel: number;
}

export interface ISetStudyData extends ISetStudyDataMeta {
    cardData: { [cardId: string]: ICardStudyData };
}

export interface ISetStudyDataMeta {
    setId: string;
    lastStudied?: Date;
}
