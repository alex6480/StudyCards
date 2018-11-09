import { IUser } from "../lib/User";
import * as Actions from "./actions";
import * as UserActions from "./actions/user.actions";

export default function user(state: IUser | null, action: Actions.Action): IUser | null {
    switch (action.type) {
        case UserActions.LOG_OUT:
            return null;
        case UserActions.AUTHENTICATE:
            return action.payload.user;
        default:
            return state;
    }
}
