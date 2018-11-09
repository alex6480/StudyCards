import { Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import { Action, TAction } from "../reducers/actions";

export class UserService {
    public logOut(): TAction<void, void> {
        return (dispatch, getState) => {
            localStorage.removeItem("user-token");
            sessionStorage.removeItem("user-token");

            dispatch(Action.logOut());
        };
    }
}
