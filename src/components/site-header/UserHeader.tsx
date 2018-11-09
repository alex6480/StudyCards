import * as React from "react";
import { Link } from "react-router-dom";
import { IUser } from "../../lib/User";

interface IUserHeaderProps {
    user: IUser;
    logOut: () => void;
}

const UserHeader: React.SFC<IUserHeaderProps> = (props) => {
    return <>
        <Link to="/dashboard" className="navbar-item">
            My Sets
        </Link>
        <div className="navbar-item has-dropdown is-hoverable">
            <a className="navbar-link">
                <span className="icon">
                    <i className="fas fa-user"></i>
                </span>&nbsp;
                { props.user.nickName }
            </a>
            <div className="navbar-dropdown">
                <a className="navbar-item">
                    Account
                </a>
                <hr className="navbar-divider" />
                <a className="navbar-item" onClick={props.logOut}>
                    Log Out
                </a>
            </div>
        </div>
    </>;
};
export default UserHeader;
