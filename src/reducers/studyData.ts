import { ICardStudyData, ISetStudyData } from "../lib/flashcard/StudyData";
import * as Utils from "../lib/utils";
import * as fromActions from "./actions";

const initialSetStudyDataState: ISetStudyData = {
    setId: "",
    cardData: {},
};

const initialCardStudyDataState: ICardStudyData = {
    cardId: "",
    dueDate: new Date(),
    redrawTime: null,
    removeFromDeck: false,
};

export default function studyData(state: ISetStudyData = initialSetStudyDataState,
                                  action: fromActions.Actions): ISetStudyData {
    switch (action.type) {
        case fromActions.RESET_SESSION_STUDY_DATA:
            return {
                ...state,
                cardData: Utils.objectMapString(state.cardData, (cardId, cardData) => cardStudyData(cardData, action)),
            };
        case fromActions.UPDATE_CARD_STUDY_DATA:
            return {
                ...state,
                cardData: {
                    ...state.cardData,
                    [action.payload.cardId]: cardStudyData(state.cardData[action.payload.cardId], action),
                },
            };
        default:
            return state;
    }
}

function cardStudyData(state: ICardStudyData = initialCardStudyDataState,
                       action: fromActions.Actions): ICardStudyData {
    switch (action.type) {
        case fromActions.RESET_SESSION_STUDY_DATA:
            return {
                ...state,
                redrawTime: null,
                removeFromDeck: false,
            };
        case fromActions.UPDATE_CARD_STUDY_DATA:
            return {
                cardId: cardStudyDataCardId(state.cardId, action),
                dueDate: state.dueDate !== undefined ? state.dueDate : new Date(),
                redrawTime: cardStudyDataCardRedrawTime(state.redrawTime, action),
                removeFromDeck: state.removeFromDeck !== undefined ? state.removeFromDeck : false,
            };
        default:
            return state;
    }
}

function cardStudyDataCardId(state: string = initialCardStudyDataState.cardId, action: fromActions.Actions): string {
    switch (action.type) {
        case fromActions.UPDATE_CARD_STUDY_DATA:
            return action.payload.cardId;
        default:
            return state;
    }
}

function cardStudyDataCardRedrawTime(state: Date | null = initialCardStudyDataState.redrawTime,
                                     action: fromActions.Actions): Date | null {
    switch (action.type) {
        case fromActions.RESET_SESSION_STUDY_DATA:
            return null;
        case fromActions.UPDATE_CARD_STUDY_DATA:
            return action.payload.redrawTime !== undefined ? action.payload.redrawTime : null;
        default:
            return state !== undefined ? state : null;
    }
}


