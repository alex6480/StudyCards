import * as React from "react";
import { IUser } from "../../lib/User";

interface IUserHeaderProps {
    user: IUser;
}

const UserHeader: React.SFC<IUserHeaderProps> = (props) => {
    return <>
        <a className="navbar-item">
            My Sets
        </a>
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
                <a className="navbar-item">
                    Sign Out
                </a>
            </div>
        </div>
    </>;
};
export default UserHeader;
