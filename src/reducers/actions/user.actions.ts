import { createAction } from ".";
import { IUser } from "../../lib/User";

export const LOG_OUT = "LOG_OUT";
export const AUTHENTICATE = "AUTHENTICATE";

export const userActions = {
    logOut: () => createAction(LOG_OUT),
    authenticate: (user: IUser) => createAction(AUTHENTICATE, { user }),
};
