export interface IStudyState {
    setId: string;
    newCardIds: string[];
    knownCardIds: string[];
    currentSession: IStudySession | null;
}

export interface IStudySession {
    deck: string[];
    currentCardId: string;
    cardData: {[cardId: string]: IStudySessionCardData};
}

export interface IStudySessionCardData {
    /**
     * The time at which this card will be prioritized drawn
     */
    redrawTime: Date | null;
}
