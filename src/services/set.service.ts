import { Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import conf from "../conf";
import { IFlashCardSetMeta } from "../lib/flashcard/FlashCardSet";
import { IUser } from "../lib/User";
import * as Utils from "../lib/utils";
import { Action, TAction } from "../reducers/actions";

const URL_LIST = "/set/";

export const SetService = {
    list,
};

function list(): TAction<Promise<{ [id: string]: IFlashCardSetMeta }>, void> {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open("GET", conf.remote_url + URL_LIST);
            request.send();

            request.onload = ev => {
                if (request.status === 200) {
                    const response = request.responseText;
                    const setMeta = Utils.arrayToObject(JSON.parse(response) as IFlashCardSetMeta[],
                                                        meta => [meta.id.toString(), meta]);
                    resolve(setMeta);
                    dispatch(Action.loadSetMetaAllComplete(setMeta));
                } else {
                    reject(); // Probably a server error
                    dispatch(Action.loadSetMetaAllError());
                }
            };

            request.onerror = ev => {
                // Some kind of error occured
                reject();
                dispatch(Action.loadSetMetaAllError());
            };
        });
    };
}
