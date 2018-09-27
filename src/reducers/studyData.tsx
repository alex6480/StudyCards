import { SetStudyData } from "../lib/flashcard/StudyData";
import * as fromActions from "./actions";

const initialState: SetStudyData = {
    setId: "",
    cardData: {}
}

export default (state: SetStudyData = initialState, action: fromActions.Actions) => {
    switch (action) {
        default:
            return state;
    }
}