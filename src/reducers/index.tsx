import IFlashCardSet from "../lib/flashcard/FlashCardSet";
import { ISetStudyData } from "../lib/flashcard/StudyData";
import * as utils from "../lib/utils";
import * as fromActions from "./actions";
import set, * as fromSet from "./set";
import setStudyData from "./studyData";

export interface IAppState {
    sets: { [id: string]: IFlashCardSet };
    studyData: { [id: string]: ISetStudyData };
}

const initialState: IAppState = {
    sets: { },
    studyData: { },
};

export default function studyCardsStore(state: IAppState = initialState, action: fromActions.Actions): IAppState {
    switch (action.type) {
        case fromActions.ADD_NEW_SET:
            const newSet = action.payload.set !== undefined ? action.payload.set : set(undefined, action);
            const newStudyData: ISetStudyData = {
                setId: newSet.id,
                cardData: {},
            };
            return {
                sets: {
                    [newSet.id]: newSet,
                    ...state.sets,
                },
                studyData: {
                    [newSet.id]: newStudyData,
                    ...state.studyData,
                },
            };
        default:
            return {
                sets: utils.objectMapString(state.sets, (k, v) => set(v, action)),
                studyData: utils.objectMapString(state.studyData, (k, v) => setStudyData(v, action)),
            };
    }
}
