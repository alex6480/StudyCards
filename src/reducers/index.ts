import IFlashCardSet from "../lib/flashcard/FlashCardSet";
import { ISetStudyData } from "../lib/flashcard/StudyData";
import { IStudyState } from "../lib/flashcard/StudyState";
import IRemote, { EmptyRemote } from "../lib/remote";
import { LocalStorageProvider } from "../lib/storage/LocalStorageProvider";
import IStorageProvider from "../lib/storage/StorageProvider";
import * as Utils from "../lib/utils";
import * as fromActions from "./actions";
import sets, * as fromSet from "./set";
import { studyState } from "./studyState";

export interface IAppState {
    sets: IRemote<{ [id: string]: IRemote<IFlashCardSet> }>;
    studyState: IRemote<IStudyState>;
}

const initialState: IAppState = {
    sets: EmptyRemote(),
    studyState: EmptyRemote(),
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
                studyState: studyState(state.studyState, action),
            };
    }
}
