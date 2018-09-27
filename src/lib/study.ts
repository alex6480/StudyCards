import { SetStudyData } from "../lib/flashcard/StudyData";
import FlashCard from "./flashcard/flashcard";
import * as Utils from "./utils";

export function selectStudyDeck (studyData: SetStudyData, maxNewCards: number, maxTotalCards: number, cardIds: string[]): string[];
export function selectStudyDeck (studyData: SetStudyData, maxNewCards: number, maxTotalCards: number, cards: {[id: string]: FlashCard}): string[];
export function selectStudyDeck (studyData: SetStudyData, maxNewCards: number, maxTotalCards: number, newCardIds: string[], knownCardIds: string[]): string[];
export function selectStudyDeck (studyData: SetStudyData, maxNewCards: number, maxTotalCards: number, a: string[] | {[id: string]: FlashCard}, b?: string[] | {[id: string]: FlashCard}) {
    // Automatically extract new and known cards, if it has not already been done
    let newCardIds = b == undefined ? getNewCardIds(a, studyData) : b;
    let knownCardIds = b == undefined ? getKnownCardIds(a, studyData) : a;
    
    let newCards = selectNewCardsForStudy(newCardIds, studyData, maxNewCards);
    let knownCards = selectKnownCardsForStudy(knownCardIds, studyData, maxTotalCards - newCards.length);
    let studyDeck = Utils.shuffle(newCards.concat(knownCards));
    
    return studyDeck;
}

export function getKnownCardIds (cards: {[id: string]: FlashCard} | string[], studyData: SetStudyData) {
    let result = [];
    for (var cardId in cards) {
        if (studyData.cardData[cardId] != undefined) {
            result.push(cardId);
        }
    }
    return result;
}

export function getNewCardIds (cards: {[id: string]: FlashCard} | string[], studyData: SetStudyData) {
    let result = [];
    for (var cardId in cards) {
        if (studyData.cardData[cardId] == undefined) {
            result.push(cardId);
        }
    }
    return result;
}

/**
 * Returns the id of cards that have never been studied before.
 * Cards are returned in a random order
 * @param limit The maximum number of cards that should be returned. The cards returned are random.
 */
function selectNewCardsForStudy (newCardIds: string[] | {[id: string]: FlashCard}, studyData: SetStudyData, limit?: number): string[] {
    // Create a list of the id's of all new cards
    let result: string[] = [];
    for ( var cardId in newCardIds) {
        if (studyData.cardData[cardId] != undefined) {
            throw "Only cards that have not been studied can be passed to this function.";
        }
        result.push(cardId);
    }

    // Shuffle the deck and only return cards up to the limit
    let shuffledResult: string[] = (limit === undefined || result.length <= limit) ? result : Utils.shuffle(result, limit);

    return shuffledResult;
}

/**
 * Returns the id of cards that have been studied before.
 * Cards are selected randomly, but cards with an early due date have a higher likelyhood of being selected
 * If not enough cards are due to fill the set, cards that are not yet due, will be included too
 * @param limit The maximum number of cards that should be returned. The cards returned are random.
 */
function selectKnownCardsForStudy (knownCardIds: string[] | {[id: string]: FlashCard}, studyData: SetStudyData, limit?: number): string[] {
    let cardScoresDue: {score: number, id: string}[] = [];
    let cardScoresNotDue: {score: number, id: string}[] = [];

    // Assign a score to each card
    for (var cardId in knownCardIds) {
        let cardData = studyData.cardData[cardId];
        if (cardData != undefined) {
            let dueInMS = (new Date(cardData.dueDate.getFullYear(), cardData.dueDate.getMonth(), cardData.dueDate.getDay()).getTime() - new Date().getTime());
            let dueInDays = Math.ceil(dueInMS / (1000 * 3600 * 24));
            let score = dueInDays + Math.random() * 10 - 5;

            if (dueInDays <= 0) {
                cardScoresDue.push({score: score, id: cardId});
            } else {
                cardScoresNotDue.push({score: score, id: cardId});
            }
        }
    }

    let result: string[] = []
    cardScoresDue = cardScoresDue.sort((a, b) => a.score - b.score);
    cardScoresNotDue = cardScoresNotDue.sort((a, b) => a.score - b.score);

    // Pick out the due cards
    for (var i = 0; i < cardScoresDue.length && (limit == undefined || i < limit); i++) {
        result.push(cardScoresDue[i].id);
    }

    // Pick out the cards not due (if no limit is provided, these cards will not be included)
    for (var i = 0; i < cardScoresNotDue.length && limit != undefined && i < limit - cardScoresDue.length; i++) {
        result.push(cardScoresNotDue[i].id);
    }

    return result;
}