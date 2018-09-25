import { combineReducers } from 'redux';
import card, * as fromCard from './card';
import set, * as fromSet from './set';
import FlashCardSet from '../lib/flashcard/FlashCardSet';
import FlashCard from '../lib/flashcard/flashcard';
import * as fromActions from './actions';
import * as utils from '../lib/utils';

export type AppState = {
    sets: { [id: string]: FlashCardSet }
};

const initialState: AppState = {
    sets: { }
}

let reducer = (state: AppState = initialState, action: fromActions.Actions): AppState => {
    switch (action.type) {
        case fromActions.ADD_NEW_SET:
            let newSet = action.payload.set != undefined ? action.payload.set : set(undefined, action);
            return {
                sets: {
                    [newSet.id]: newSet,
                    ...state.sets
                }
            }
        default:
            return { sets: utils.objectMapString(state.sets, (k, v) => set(v, action)) };
    }
}

const studyCardsStore = reducer;
export default studyCardsStore;