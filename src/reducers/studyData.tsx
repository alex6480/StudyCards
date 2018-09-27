import { SetStudyData, CardStudyData } from "../lib/flashcard/StudyData";
import * as fromActions from "./actions";
import * as Utils from "../lib/utils";

const initialSetStudyDataState: SetStudyData = {
    setId: "",
    cardData: {}
}

const initialCardStudyDataState: CardStudyData = {
    cardId: "",
    dueDate: new Date()
}

export default (state: SetStudyData = initialSetStudyDataState, action: fromActions.Actions): SetStudyData => {
    switch (action.type) {
        case fromActions.RESET_SESSION_STUDY_DATA:
            return {
                cardData: Utils.objectMapString(state.cardData, (cardId, cardData) => cardStudyData(cardData, action)),
                ...state
            }
        default:
            return state;
    }
}

function cardStudyData (state: CardStudyData = initialCardStudyDataState, action: fromActions.Actions): CardStudyData {
    switch (action.type) {
        case fromActions.RESET_SESSION_STUDY_DATA:
            return {
                reshuffleTime: undefined,
                ...state
            }
        default:
            return state;
    }
}