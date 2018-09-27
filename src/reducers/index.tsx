import { combineReducers } from 'redux';
import card, * as fromCard from './card';
import set, * as fromSet from './set';
import FlashCardSet from '../lib/flashcard/FlashCardSet';
import FlashCard from '../lib/flashcard/flashcard';
import * as fromActions from './actions';
import * as utils from '../lib/utils';
import { SetStudyData } from '../lib/flashcard/StudyData';
import setStudyData from './studyData';

export type AppState = {
    sets: { [id: string]: FlashCardSet },
    studyData: { [id: string]: SetStudyData }
};

const initialState: AppState = {
    sets: { },
    studyData: { }
}

let reducer = (state: AppState = initialState, action: fromActions.Actions): AppState => {
    switch (action.type) {
        case fromActions.ADD_NEW_SET:
            let newSet = action.payload.set != undefined ? action.payload.set : set(undefined, action);
            let newStudyData: SetStudyData = {
                setId: newSet.id,
                cardData: {}
            };
            return {
                sets: {
                    [newSet.id]: newSet,
                    ...state.sets
                },
                studyData: {
                    [newSet.id]: newStudyData,
                    ...state.studyData
                }
            }
        default:
            return {
                sets: utils.objectMapString(state.sets, (k, v) => set(v, action)),
                studyData: utils.objectMapString(state.studyData, (k, v) => setStudyData(v, action))
            };
    }
}

const studyCardsStore = reducer;
export default studyCardsStore;