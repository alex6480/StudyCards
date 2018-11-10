import { CardEvaluation } from "../study";

export interface IStudyState {
    setId: number;
    newCardIds: string[];
    knownCardIds: string[];
    currentSession: IStudySession | null;
}

export interface IStudySession {
    deck: string[];
    currentCardId: string;
    cardData: {[cardId: string]: IStudySessionCardData};
    updating: boolean;
}

export interface IStudySessionCardData {
    /**
     * The time at which this card will be prioritized drawn
     */
    redrawTime: Date | null;

    /**
     * A list of the prior evaluations of this card.
     * Used when determining the new understanding level
     */
    evaluations: CardEvaluation[];
}
