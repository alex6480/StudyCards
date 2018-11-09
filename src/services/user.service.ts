import { Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import conf from "../conf";
import { IUser } from "../lib/User";
import { Action, TAction } from "../reducers/actions";

const URL_AUTH = "/user/authenticate";

export const UserService = {
    logIn,
    logOut,
};

function logIn(email: string, password: string): TAction<Promise<IUser>, void> {
    return (dispatch, getState) => {
        return new Promise((resolve, reject: (reason: "unknown" | "invalid_user") => void) => {
            const request = new XMLHttpRequest();
            request.open("POST", conf.remote_url + URL_AUTH);

            request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            request.send(JSON.stringify({
                Email: email,
                Password: password,
            }));

            request.onload = ev => {
                if (request.status === 204) {
                    reject("invalid_user");
                } else {
                    const response = request.responseText;
                    const user = JSON.parse(response) as IUser;
                    resolve(user);
                    dispatch(Action.authenticate(user));
                }
            };

            request.onerror = ev => {
                // Some kind of error occured
                reject("unknown");
            };
        });
    };
}

function logOut(): TAction<void, void> {
    return (dispatch, getState) => {
        localStorage.removeItem("user-token");
        sessionStorage.removeItem("user-token");

        dispatch(Action.logOut());
    };
}
