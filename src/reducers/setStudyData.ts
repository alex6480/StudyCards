import { ICardStudyData, ISetStudyData } from "../lib/flashcard/StudyData";
import IRemote from "../lib/remote";
import * as Utils from "../lib/utils";
import * as fromActions from "./actions";
import cardData from "./cardStudyData";

const initialState: ISetStudyData = {
    setId: "",
    cardData: {},
};

export default function studyData(state: { [id: string]: IRemote<ISetStudyData> } = { },
                                  action: fromActions.Action): { [id: string]: IRemote<ISetStudyData> } {
    switch (action.type) {
        case fromActions.ADD_NEW_SET_BEGIN:
        case fromActions.LOAD_SET_STUDY_DATA_BEGIN:
            return {
                ...state,
                [action.payload.setId]: {
                    isFetching: true,
                    value: setStudyDataValue({ setId: action.payload.setId }, action),
                },
            };
        case fromActions.ADD_NEW_SET_COMPLETE:
            return {
                ...state,
                [action.payload.setId]: {
                    isFetching: false,
                    value: setStudyDataValue({ setId: action.payload.setId }, action),
                },
            };
        case fromActions.LOAD_SET_STUDY_DATA_COMPLETE:
            return {
                ...state,
                [action.payload.setId]: {
                    isFetching: false,
                    value: setStudyDataValue(action.payload.result, action),
                },
            };
        default:
            return state;
    }
}

function setStudyDataValue(state: Partial<ISetStudyData> = initialState,
                           action: fromActions.Action): ISetStudyData {
    switch (action.type) {
        default:
            return {
                setId: state.setId!,
                lastStudied: state.lastStudied,
                cardData: cardData(state.cardData, action),
            };
    }
}
