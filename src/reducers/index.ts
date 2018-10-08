import IFlashCardSet from "../lib/flashcard/FlashCardSet";
import { ISetStudyData } from "../lib/flashcard/StudyData";
import Remote from "../lib/remote";
import { LocalStorageProvider } from "../lib/storage/LocalStorageProvider";
import IStorageProvider from "../lib/storage/StorageProvider";
import * as Utils from "../lib/utils";
import * as fromActions from "./actions";
import set, * as fromSet from "./set";
import setStudyData from "./studyData";

export interface IAppState {
    storageProvider: IStorageProvider;
    sets: Remote<{ [id: string]: IFlashCardSet }>;
    studyData: { [id: string]: ISetStudyData };
}

const initialState: IAppState = {
    storageProvider: new LocalStorageProvider(),
    sets: Remote.default(),
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
            if (action.payload.callback !== undefined) { action.payload.callback(newSet.id); }

            return {
                ...state,
                sets: state.sets.withValue({
                    ...state.sets.value(),
                    [newSet.id]: newSet,
                }),
                studyData: {
                    ...state.studyData,
                    [newSet.id]: newStudyData,
                },
            };
        case fromActions.LOAD_SET_META_ALL_BEGIN:
            return {
                ...state,
                sets: new Remote(true, state.sets.lastValue()),
            };
        case fromActions.LOAD_SET_META_ALL_COMPLETE:
            return {
                ...state,
                sets: new Remote(false, Utils.objectMapString(action.payload, (k, v) => {
                    const previousSets = state.sets.lastValue();
                    let previousSet;
                    if (previousSets === undefined || previousSets[v.id] === undefined) {
                        previousSet = undefined;
                    } else {
                        previousSet = previousSets[v.id];
                    }
                    // Get cards from the old state
                    let previousCards;
                    if (previousSet === undefined || previousSet.cards[v.id] === undefined) {
                        previousCards = undefined;
                    } else {
                        previousCards = previousSet.cards;
                    }
                    return {
                        ...v,
                        cards: previousCards === undefined ? { } : previousCards,
                    };
                })),
            };
        case fromActions.LOAD_SET_META_ALL_ERROR:
            return {
                ...state,
                sets: Remote.error(action.payload.message),
            };
        default:
            return {
                ...state,
                sets: state.sets.updateIfValue(value => Utils.objectMapString(value, (k, v) => set(v, action))),
                studyData: Utils.objectMapString(state.studyData, (k, v) => setStudyData(v, action)),
            };
    }
}
