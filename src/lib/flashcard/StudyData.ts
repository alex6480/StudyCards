import IFlashCard from "./flashcard";

export interface ICardStudyData {
    setId: string;
    cardId: string;
    dueDate: Date;

    /**
     * A numeric score indicating how well the user understands this card
     * New cards have understanding level 0
     */
    understandingLevel: number;

    /**
     * The time when this card should be prioritized to be redrawn from the study deck during a study session
     * This is temporary and will be reset at the beginning of every study session
     */
    redrawTime: Date | null;

    /**
     * Whether or not this card should be removed from the current study deck
     * This is temporary and set to false at the beginning of each study session
     */
    removeFromSession: boolean;
}

export interface ISetStudyData extends ISetStudyDataMeta {
    cardData: { [cardId: string]: ICardStudyData };
}

export interface ISetStudyDataMeta {
    setId: string;
    lastStudied?: Date;
}
