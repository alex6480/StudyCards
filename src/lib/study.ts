import { ISetStudyData } from "../lib/flashcard/StudyData";
import IFlashCard from "./flashcard/flashcard";
import * as Utils from "./utils";

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
    const studyDeck  = Utils.shuffle(newCards.concat(knownCards));

    return studyDeck;
}

export function getKnownCardIds(cards: {[id: string]: IFlashCard} | string[], studyData: ISetStudyData) {
    return Utils.selectKeys(cards, cardId => studyData.cardData[cardId] !== undefined);
}

export function getNewCardIds(cards: {[id: string]: IFlashCard} | string[], studyData: ISetStudyData) {
    return Utils.selectKeys(cards, cardId => studyData.cardData[cardId] === undefined);
}

/**
 * Returns the id of cards that have never been studied before.
 * Cards are returned in a random order
 * @param limit The maximum number of cards that should be returned. The cards returned are random.
 */
function selectNewCardsForStudy(newCards: string[] | {[id: string]: IFlashCard},
                                studyData: ISetStudyData, limit?: number): string[] {
    // Make sure newCardIds is actually an array of strings, even if an object was passed
    if (typeof newCards === "object") {
        newCards = Object.keys(newCards);
    }

    // Create a list of the id's of all new cards
    const result: string[] = [];
    for (const cardId of newCards) {
        if (studyData.cardData[cardId] !== undefined) {
            throw new Error("Only cards that have not been studied can be passed to this function.");
        }
        result.push(cardId);
    }

    // Shuffle the deck and only return cards up to the limit
    const shuffledResult: string[] = (limit === undefined || result.length <= limit)
                                      ? result
                                      : Utils.shuffle(result, limit);

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

    if (typeof knownCards === "object") {
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
