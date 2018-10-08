import IFlashCardSet from "../lib/flashcard/FlashCardSet";
import { ISetStudyData } from "../lib/flashcard/StudyData";
import IRemote from "../lib/remote";
import { LocalStorageProvider } from "../lib/storage/LocalStorageProvider";
import IStorageProvider from "../lib/storage/StorageProvider";
import * as Utils from "../lib/utils";
import * as fromActions from "./actions";
import sets, * as fromSet from "./set";
import studyData from "./setStudyData";

export interface IAppState {
    storageProvider: IStorageProvider;
    sets: IRemote<{ [id: string]: IFlashCardSet }>;
    studyData: { [id: string]: IRemote<ISetStudyData> };
}

const initialState: IAppState = {
    storageProvider: new LocalStorageProvider(),
    sets: { isFetching: false, value: undefined },
    studyData: { },
};

export default function studyCardsStore(state: IAppState = initialState, action: fromActions.Action): IAppState {
    switch (action.type) {
        case fromActions.ADD_NEW_SET_BEGIN:
            // Make sure the action has a set id
            action.payload.set.id = fromSet.id(action.payload.set.id, action);
        default:
            return {
                ...state,
                sets: sets(state.sets, action),
                studyData: studyData(state.studyData, action),
            };
    }
}
