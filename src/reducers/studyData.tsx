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
};

export default function studyData(state: ISetStudyData = initialSetStudyDataState,
                                  action: fromActions.Actions): ISetStudyData {
    switch (action.type) {
        case fromActions.RESET_SESSION_STUDY_DATA:
            return {
                cardData: Utils.objectMapString(state.cardData, (cardId, cardData) => cardStudyData(cardData, action)),
                ...state,
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
                reshuffleTime: undefined,
                ...state,
            };
        default:
            return state;
    }
}
