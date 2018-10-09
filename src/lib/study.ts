import { ICardStudyData, ISetStudyData } from "../lib/flashcard/StudyData";
import IFlashCard from "./flashcard/flashcard";
import * as Utils from "./utils";

/**
 * A score indicating how well the user remembered the presented card
 */
export enum CardEvaluation {
    Poor,
    Decent,
    Good,
}

export function selectStudyDeck(studyData: ISetStudyData, maxNewCards: number,
                                maxTotalCards: number, cardIds: string[]): string[];
export function selectStudyDeck(studyData: ISetStudyData, maxNewCards: number,
                                maxTotalCards: number, cards: {[id: string]: IFlashCard}): string[];
export function selectStudyDeck(studyData: ISetStudyData, maxNewCards: number,
                                maxTotalCards: number, newCardIds: string[], knownCardIds: string[]): string[];
export function selectStudyDeck(studyData: ISetStudyData, maxNewCards: number, maxTotalCards: number,
                                a: string[] | {[id: string]: IFlashCard}, b?: string[] | {[id: string]: IFlashCard}) {
    // Automatically extract new and known cards, if it has not already been done
    const newCardIds   = b === undefined ? getNewCardIds(a, studyData) : b;
    const knownCardIds = b === undefined ? getKnownCardIds(a, studyData) : a;

    const newCards   = selectNewCardsForStudy(newCardIds, studyData, maxNewCards);
    const knownCards = selectKnownCardsForStudy(knownCardIds, studyData, maxTotalCards - newCards.length);
    const studyDeck  = newCards.concat(knownCards);

    return studyDeck;
}

export function getKnownCardIds(cards: {[id: string]: IFlashCard} | string[], studyData: ISetStudyData) {
    return Utils.selectKeys(cards, cardId => studyData.cardData[cardId] !== undefined
                                            && studyData.cardData[cardId].understandingLevel !== 0);
}

export function getNewCardIds(cards: {[id: string]: IFlashCard} | string[], studyData: ISetStudyData) {
    return Utils.selectKeys(cards, cardId => studyData.cardData[cardId] === undefined
                                            || studyData.cardData[cardId].understandingLevel === 0);
}

/**
 * Returns the id of cards that have never been studied before.
 * Cards are returned in a random order
 * @param limit The maximum number of cards that should be returned. The cards returned are random.
 */
function selectNewCardsForStudy(newCards: string[] | {[id: string]: IFlashCard},
                                studyData: ISetStudyData, limit?: number): string[] {
    // Make sure newCardIds is actually an array of strings, even if an object was passed
    if (! Array.isArray(newCards)) {
        newCards = Object.keys(newCards);
    }

    // Create a list of the id's of all new cards
    const result: string[] = [];
    for (const cardId of newCards) {
        if (studyData.cardData[cardId] !== undefined && studyData.cardData[cardId].understandingLevel !== 0) {
            throw new Error("Only cards that have not been studied can be passed to this function.");
        }
        result.push(cardId);
    }

    // Shuffle the deck and only return cards up to the limit
    const shuffledResult: string[] = (limit === undefined || result.length <= limit)
                                      ? result
                                      : result.slice(0, limit);

    return shuffledResult;
}

/**
 * Returns the id of cards that have been studied before.
 * Cards are selected randomly, but cards with an early due date have a higher likelyhood of being selected
 * If not enough cards are due to fill the set, cards that are not yet due, will be included too
 * @param limit The maximum number of cards that should be returned. The cards returned are random.
 */
function selectKnownCardsForStudy(knownCards: string[] | {[id: string]: IFlashCard},
                                  studyData: ISetStudyData, limit?: number): string[] {
    let cardScoresDue: {score: number, id: string}[] = [];
    let cardScoresNotDue: {score: number, id: string}[] = [];

    if (! Array.isArray(knownCards)) {
        knownCards = Object.keys(knownCards);
    }

    // Assign a score to each card
    for (const cardId of knownCards) {
        const cardData = studyData.cardData[cardId];
        if (cardData !== undefined) {
            const dueInMS = (new Date(cardData.dueDate.getFullYear(),
                                      cardData.dueDate.getMonth(),
                                      cardData.dueDate.getDay()).getTime() - new Date().getTime());
            const dueInDays = Math.ceil(dueInMS / (1000 * 3600 * 24));
            const score = dueInDays + Math.random() * 10 - 5;

            if (dueInDays <= 0) {
                cardScoresDue.push({score, id: cardId});
            } else {
                cardScoresNotDue.push({score, id: cardId});
            }
        }
    }

    const result: string[] = [];
    cardScoresDue = cardScoresDue.sort((a, b) => a.score - b.score);
    cardScoresNotDue = cardScoresNotDue.sort((a, b) => a.score - b.score);

    // Pick out the due cards
    for (let i = 0; i < cardScoresDue.length && (limit === undefined || i < limit); i++) {
        result.push(cardScoresDue[i].id);
    }

    // Pick out the cards not due (if no limit is provided, these cards will not be included)
    for (let i = 0; i < cardScoresNotDue.length && limit !== undefined && i < limit - cardScoresDue.length; i++) {
        result.push(cardScoresNotDue[i].id);
    }

    return result;
}

/**
 * Returns an updated studyData for the card based on the given evaluation
 * @param studyData The study data to update
 * @param evaluation The evaluation of the card
 */
export function updateCardStudyData(cardId: string,
                                    studyData: ICardStudyData,
                                    evaluation: CardEvaluation): ICardStudyData {
    switch (evaluation) {
        case CardEvaluation.Good:
            return {
                ...studyData,
                cardId,
                dueDate: getDueTimeIncrease(studyData, evaluation),
                redrawTime: null,
                removeFromSession: true,
            };
        case CardEvaluation.Decent:
        case CardEvaluation.Poor:
            return {
                ...studyData,
                cardId,
                redrawTime: getDueTimeIncrease(studyData, evaluation),
            };
    }
}

/**
 * Returns the time when this card will be presented again. Either in the same study session or in a future one
 */
export function getDueTimeIncrease(studyData: ICardStudyData, evaluation: CardEvaluation) {
    const due: Date = new Date();
    switch (evaluation) {
        case CardEvaluation.Good:
            due.setDate(due.getDate() + 2);
            return due;
        case CardEvaluation.Decent:
            due.setMinutes(due.getMinutes() + 10);
            return due;
        case CardEvaluation.Poor:
            due.setMinutes(due.getMinutes() + 3);
            return due;
    }
}

/**
 * Draws a card during a study session.
 * 1. It picks a random card from the cards with a redraw time earlier than now
 * 2. If no cards with a redraw time earlier than now, it picks a random card without a redraw time
 * 3. If no cards have no redraw time, it picks a card with a redraw time in the future. Cards with an earlier
 * redraw time are more likely to be drawn.
 * @param possibleCards The ids of the cards that can be drawn
 * @param StudyData Study data for the cards in the deck
 */
export function drawCard(deck: string[], studyData: ISetStudyData, currentCardId?: string): string {
    if (deck.length === 0) {
        throw new Error("Deck cannot be empty");
    }
    if (deck.length === 1) {
        // If only one item is left, there isn't much to draw from
        return deck[0];
    }

    let possibleCards = deck;
    if (currentCardId !== undefined) {
        // The same card cannot be drawn twice
        possibleCards = deck.filter(cardId => cardId !== currentCardId);
    }

    // 1. Try to return a card with a redraw time earlier than now
    const dueCards = possibleCards.filter(id => {
        const card = studyData.cardData[id];
        return card !== undefined && card.redrawTime !== null && card.redrawTime.getTime() <= new Date().getTime();
    });
    if (dueCards.length > 0) { return dueCards[Math.floor(Math.random() * dueCards.length)]; }

    // 2. Try to return a card with no redraw time
    const cardWithoutRedraw = possibleCards.filter(id =>
        studyData.cardData[id] === undefined || studyData.cardData[id].redrawTime === null);
    if (cardWithoutRedraw.length > 0) {
        return cardWithoutRedraw[Math.floor(Math.random() * cardWithoutRedraw.length)];
    }

    // 3. Return a card with a future redraw time
    const futureCards = possibleCards.map(id => {
        const card = studyData.cardData[id];
        return {
            card,
            score: (card.redrawTime as Date).getTime(),
        };
    });
    return futureCards.sort((a, b) => a.score - b.score)[0].card.cardId;
}
