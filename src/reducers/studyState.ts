import { IStudySession, IStudySessionCardData, IStudyState } from "../lib/flashcard/StudyState";
import IRemote, { EmptyRemote } from "../lib/remote";
import { CardEvaluation } from "../lib/study";
import * as Study from "../lib/study";
import * as fromActions from "./actions";

const initialState: IStudyState = {
    setId: 0,
    newCardIds: [],
    knownCardIds: [],
    currentSession: null,
};

const initialCardData: IStudySessionCardData = {
    evaluations: [],
    redrawTime: null,
};

export function studyState(state: IRemote<IStudyState> = EmptyRemote(),
                           action: fromActions.Action): IRemote<IStudyState> {
    switch (action.type) {
        case fromActions.SET_STUDY_STATE_BEGIN:
            return {
                ...state,
                isFetching: true,
                value: studyStateValue(state.value, action),
            };
        case fromActions.SET_STUDY_STATE_COMPLETE:
        case fromActions.EVALUATE_CARD_COMPLETE:
            return {
                ...state,
                isFetching: false,
                value: studyStateValue(state.value, action),
            };
        default:
            return {
                ...state,
                value: studyStateValue(state.value, action),
            };
    }
}

export function studyStateValue(state: IStudyState | undefined, action: fromActions.Action): IStudyState | undefined {
    switch (action.type) {
        case fromActions.SET_STUDY_STATE_BEGIN:
        case fromActions.SET_STUDY_STATE_COMPLETE:
        case fromActions.EVALUATE_CARD_COMPLETE:
            if (action.payload.studyState === undefined) {
                return undefined;
            }
            return {
                setId: setId(state !== undefined ? state.setId : undefined, action),
                newCardIds: newCardIds(state !== undefined ? state.newCardIds : undefined, action),
                knownCardIds: knownCardIds(state !== undefined ? state.knownCardIds : undefined, action),
                currentSession: currentSession(state !== undefined ? state.currentSession : undefined, action),
            };
        default:
            return {
                setId: setId(state !== undefined ? state.setId : undefined, action),
                newCardIds: newCardIds(state !== undefined ? state.newCardIds : undefined, action),
                knownCardIds: knownCardIds(state !== undefined ? state.knownCardIds : undefined, action),
                currentSession: currentSession(state !== undefined ? state.currentSession : undefined, action),
            };
    }
}

function setId(state: number = initialState.setId, action: fromActions.Action): number {
    switch (action.type) {
        case fromActions.SET_STUDY_STATE_BEGIN:
        case fromActions.SET_STUDY_STATE_COMPLETE:
        case fromActions.EVALUATE_CARD_COMPLETE:
            const newSetId = action.payload.studyState!.setId;
            if (newSetId !== undefined) {
                return newSetId;
            }
            return state;
        default:
            return state;
    }
}

function newCardIds(state: string[] = initialState.newCardIds, action: fromActions.Action): string[] {
    switch (action.type) {
        case fromActions.SET_STUDY_STATE_BEGIN:
        case fromActions.SET_STUDY_STATE_COMPLETE:
        case fromActions.EVALUATE_CARD_COMPLETE:
            const newNewCardIds = action.payload.studyState!.newCardIds;
            if (newNewCardIds !== undefined) {
                return newNewCardIds;
            }
            return state;
        default:
            return state;
    }
}

function knownCardIds(state: string[] = initialState.knownCardIds, action: fromActions.Action): string[] {
    switch (action.type) {
        case fromActions.SET_STUDY_STATE_BEGIN:
        case fromActions.SET_STUDY_STATE_COMPLETE:
        case fromActions.EVALUATE_CARD_COMPLETE:
            const newKnownCardIds = action.payload.studyState!.knownCardIds;
            if (newKnownCardIds !== undefined) {
                return newKnownCardIds;
            }
            return state;
        default:
            return state;
    }
}

function currentSession(state: IStudySession | null = initialState.currentSession,
                        action: fromActions.Action): IStudySession | null {
    let updating: boolean = true;
    switch (action.type) {
        case fromActions.SET_STUDY_STATE_BEGIN:
        case fromActions.SET_STUDY_STATE_COMPLETE:
            const newSession = action.payload.studyState!.currentSession;
            if (newSession !== undefined) {
                return newSession;
            }
            return state;
        case fromActions.EVALUATE_CARD_COMPLETE:
            if (action.payload.evaluation === CardEvaluation.Good && state!.deck.length === 0) {
                // Session is over, when the last card is removed from the deck
                return null;
            }
            updating = false;
        case fromActions.EVALUATE_CARD_BEGIN:
            return {
                ...state!,
                updating,
                currentCardId: sessionCurrentCardId(state!.currentCardId, action),
                deck: sessionDeck(state!.deck, action),
                cardData: {
                    ...state!.cardData,
                    [action.payload.cardId]: sessionCardData(state!.cardData[action.payload.cardId], action),
                },
            };
        default:
            return state;
    }
}

function sessionCurrentCardId(state: string, action: fromActions.Action): string {
    switch (action.type) {
        case fromActions.EVALUATE_CARD_COMPLETE:
            return action.payload.nextCardId;
        default:
            return state;
    }
}

function sessionDeck(state: string[], action: fromActions.Action): string[] {
    switch (action.type) {
        case fromActions.EVALUATE_CARD_BEGIN:
            if (action.payload.evaluation === CardEvaluation.Good) {
                // Remove the card from the deck
                return state.filter(cardId => cardId !== action.payload.cardId);
            }
            return state;
        default:
            return state;
    }
}

function sessionCardData(state: IStudySessionCardData = initialCardData,
                         action: fromActions.Action): IStudySessionCardData {
    switch (action.type) {
        case fromActions.EVALUATE_CARD_COMPLETE:
            return {
                ...state,
                evaluations: state.evaluations.concat(action.payload.evaluation),
                redrawTime: action.payload.redrawTime,
            };
        default:
            return state;
    }
}
