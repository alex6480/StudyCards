import IFlashCardSet from "../lib/flashcard/FlashCardSet";
import { ISetStudyData } from "../lib/flashcard/StudyData";
import IRemote from "../lib/remote";
import { LocalStorageProvider } from "../lib/storage/LocalStorageProvider";
import IStorageProvider from "../lib/storage/StorageProvider";
import * as Utils from "../lib/utils";
import * as fromActions from "./actions";
import set, * as fromSet from "./set";
import setStudyData from "./studyData";

export interface IAppState {
    storageProvider: IStorageProvider;
    sets: IRemote<{ [id: string]: IFlashCardSet }>;
    studyData: { [id: string]: ISetStudyData };
}

const initialState: IAppState = {
    storageProvider: new LocalStorageProvider(),
    sets: { isFetching: false, value: undefined, lastUpdated: Date.now() },
    studyData: { },
};

export default function studyCardsStore(state: IAppState = initialState, action: fromActions.Action): IAppState {
    switch (action.type) {
        case fromActions.ADD_NEW_SET_BEGIN:
            const newSet = action.payload.set !== undefined ? action.payload.set : set(undefined, action);
            const newStudyData: ISetStudyData = {
                setId: newSet.id,
                cardData: {},
            };
            if (action.payload.callback !== undefined) { action.payload.callback(newSet.id); }

            return {
                ...state,
                sets: {
                    ...state.sets,
                    value: {
                        ...state.sets.value,
                        [newSet.id]: newSet,
                    },
                },
                studyData: {
                    ...state.studyData,
                    [newSet.id]: newStudyData,
                },
            };
        case fromActions.LOAD_SET_META_ALL_BEGIN:
            return {
                ...state,
                sets: { ...state.sets, isFetching: true },
            };
        case fromActions.LOAD_SET_META_ALL_COMPLETE:
            return {
                ...state,
                sets: {
                    ...state.sets,
                    isFetching: false,
                    value: Utils.objectMapString(action.payload, (k, loadedSet) => ({
                        ...loadedSet,
                        cards: state.sets.value !== undefined
                            && state.sets.value[loadedSet.id] !== undefined
                            ? state.sets.value[loadedSet.id].cards
                            : { },
                    })),
                },
            };
        case fromActions.LOAD_SET_META_ALL_ERROR:
            return {
                ...state,
                sets: {
                    ...state.sets,
                    error: action.payload.message,
                },
            };
        default:
            return {
                ...state,
                sets: {
                    ...state.sets,
                    value: state.sets.value !== undefined
                        ? Utils.objectMapString(state.sets.value, (k, v) => set(v, action))
                        : undefined,
                },
                studyData: Utils.objectMapString(state.studyData, (k, v) => setStudyData(v, action)),
            };
    }
}
