import { ICardStudyData, ISetStudyData } from "../lib/flashcard/StudyData";
import * as Utils from "../lib/utils";
import * as fromActions from "./actions";

const initialState: ICardStudyData = {
    setId: "",
    cardId: "",
    dueDate: new Date(),
    redrawTime: null,
    removeFromSession: false,
};

export default function cardData(state: {[id: string]: ICardStudyData} = { },
                                 action: fromActions.Action) {
    switch (action.type) {
        case fromActions.RESET_SESSION_STUDY_DATA:
            return Utils.objectMapString(state, (cardId, data) => cardStudyData(data, action));
        case fromActions.UPDATE_CARD_STUDY_DATA:
            return {
                ...state,
                [action.payload.cardId]: cardStudyData(state[action.payload.cardId], action),
            };
        default:
            return state;
    }
}

function cardStudyData(state: ICardStudyData = initialState,
                       action: fromActions.Action): ICardStudyData {
    switch (action.type) {
        case fromActions.RESET_SESSION_STUDY_DATA:
            return {
                ...state,
                redrawTime: null,
                removeFromSession: false,
            };
        case fromActions.UPDATE_CARD_STUDY_DATA:
            return {
                setId: cardStudyDataSetId(state.setId, action),
                cardId: cardStudyDataCardId(state.cardId, action),
                dueDate: state.dueDate !== undefined ? state.dueDate : new Date(),
                redrawTime: cardStudyDataCardRedrawTime(state.redrawTime, action),
                removeFromSession: state.removeFromSession !== undefined ? state.removeFromSession : false,
            };
        default:
            return state;
    }
}

function cardStudyDataCardId(state: string = initialState.cardId, action: fromActions.Action): string {
    switch (action.type) {
        case fromActions.UPDATE_CARD_STUDY_DATA:
            return action.payload.cardId;
        default:
            return state;
    }
}

function cardStudyDataSetId(state: string = initialState.cardId, action: fromActions.Action): string {
    switch (action.type) {
        case fromActions.UPDATE_CARD_STUDY_DATA:
            return action.payload.setId;
        default:
            return state;
    }
}

function cardStudyDataCardRedrawTime(state: Date | null = initialState.redrawTime,
                                     action: fromActions.Action): Date | null {
    switch (action.type) {
        case fromActions.RESET_SESSION_STUDY_DATA:
            return null;
        case fromActions.UPDATE_CARD_STUDY_DATA:
            return action.payload.redrawTime !== undefined ? action.payload.redrawTime : null;
        default:
            return state !== undefined ? state : null;
    }
}


