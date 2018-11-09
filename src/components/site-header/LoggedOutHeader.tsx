import * as React from "react";
import { Link } from "react-router-dom";
import { IUser } from "../../lib/User";

const LoggedOutHeader: React.SFC<{}> = (props) => {
    return <>
        <Link to="login" className="navbar-item">
            Sign In
        </Link>
        <div className="navbar-item">
            <p className="control">
                <a className="button is-inverted">
                    Sign Up
                </a>
            </p>
        </div>
    </>;
};
export default LoggedOutHeader;
