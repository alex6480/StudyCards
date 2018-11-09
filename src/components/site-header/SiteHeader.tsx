import * as React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Dispatch } from "redux";
import { IUser } from "../../lib/User";
import { IAppState } from "../../reducers";
import LoggedOutHeader from "./LoggedOutHeader";
import UserHeader from "./UserHeader";

interface ISiteHeaderStateProps {
    user: IUser | null;
}

class SiteHeader extends React.Component<ISiteHeaderStateProps> {
    public render() {
        return <header className="header site-header">
            <nav className="navbar is-white" role="navigation" aria-label="main navigation">
                <div className="container">
                    <div className="navbar-brand">
                        <Link to="/" className="navbar-item">
                            <img src="/assets/logo.svg" width="150" height="28" />
                        </Link>

                        <a role="button" className="navbar-burger burger" aria-label="menu"
                            aria-expanded="false" data-target="navbarBasicExample">
                            <span aria-hidden="true"></span>
                            <span aria-hidden="true"></span>
                            <span aria-hidden="true"></span>
                        </a>
                    </div>
                    <div className="navbar-menu">
                        <div className="navbar-start">
                            <a className="navbar-item">
                                Browse
                            </a>
                            <a className="navbar-item">
                                Study Guide
                            </a>
                            <a className="navbar-item">
                                Blog
                            </a>
                        </div>

                        <div className="navbar-end">
                            { this.props.user !== null
                                ? <UserHeader user={this.props.user} />
                                : <LoggedOutHeader />
                            }
                        </div>
                    </div>
                </div>
            </nav>
        </header>;
    }
}

function mapStateToProps(state: IAppState): ISiteHeaderStateProps {
    return {
        user: state.user,
    };
}

function mapDispatchToProps(dispatch: Dispatch): {} {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(SiteHeader);
