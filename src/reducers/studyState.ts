import { IStudySession, IStudyState } from "../lib/flashcard/StudyState";
import IRemote, { EmptyRemote } from "../lib/remote";
import * as fromActions from "./actions";

const initialState: IStudyState = {
    setId: "",
    newCardIds: [],
    knownCardIds: [],
    currentSession: null,
};

export function studyState(state: IRemote<IStudyState> = EmptyRemote(),
                           action: fromActions.Action): IRemote<IStudyState> {
    switch (action.type) {
        case fromActions.UPDATE_STUDY_STATE_BEGIN:
            return {
                ...state,
                isFetching: true,
                value: studyStateValue(state.value, action),
            };
        case fromActions.UPDATE_STUDY_STATE_COMPLETE:
            return {
                ...state,
                isFetching: false,
                value: studyStateValue(state.value, action),
            };
        default:
            return {
                ...state,
                value: studyStateValue(state.value, action),
            };
    }
}

export function studyStateValue(state: IStudyState | undefined, action: fromActions.Action): IStudyState | undefined {
    switch (action.type) {
        case fromActions.UPDATE_STUDY_STATE_BEGIN:
        case fromActions.UPDATE_STUDY_STATE_COMPLETE:
            if (action.payload.state === undefined) {
                return undefined;
            }
            return {
                setId: setId(state !== undefined ? state.setId : undefined, action),
                newCardIds: newCardIds(state !== undefined ? state.newCardIds : undefined, action),
                knownCardIds: knownCardIds(state !== undefined ? state.knownCardIds : undefined, action),
                currentSession: currentSession(state !== undefined ? state.currentSession : undefined, action),
            };
        default:
            return state;
    }
}

function setId(state: string = initialState.setId, action: fromActions.Action): string {
    switch (action.type) {
        case fromActions.UPDATE_STUDY_STATE_BEGIN:
        case fromActions.UPDATE_STUDY_STATE_COMPLETE:
            const newSetId = action.payload.state!.setId;
            if (newSetId !== undefined) {
                return newSetId;
            }
            return state;
        default:
            return state;
    }
}

function newCardIds(state: string[] = initialState.newCardIds, action: fromActions.Action): string[] {
    switch (action.type) {
        case fromActions.UPDATE_STUDY_STATE_BEGIN:
        case fromActions.UPDATE_STUDY_STATE_COMPLETE:
            const newNewCardIds = action.payload.state!.newCardIds;
            if (newNewCardIds !== undefined) {
                return newNewCardIds;
            }
            return state;
        default:
            return state;
    }
}

function knownCardIds(state: string[] = initialState.knownCardIds, action: fromActions.Action): string[] {
    switch (action.type) {
        case fromActions.UPDATE_STUDY_STATE_BEGIN:
        case fromActions.UPDATE_STUDY_STATE_COMPLETE:
            const newKnownCardIds = action.payload.state!.knownCardIds;
            if (newKnownCardIds !== undefined) {
                return newKnownCardIds;
            }
            return state;
        default:
            return state;
    }
}

function currentSession(state: IStudySession | null = initialState.currentSession,
                        action: fromActions.Action): IStudySession | null {
    switch (action.type) {
        case fromActions.UPDATE_STUDY_STATE_BEGIN:
        case fromActions.UPDATE_STUDY_STATE_COMPLETE:
            const newSession = action.payload.state!.currentSession;
            if (newSession !== undefined) {
                return newSession;
            }
            return state;
        default:
            return state;
    }
}
