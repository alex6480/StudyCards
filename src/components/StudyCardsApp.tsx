import * as React from "react";
import { connect } from "react-redux";
import { Route, Switch  } from "react-router";
import Dashboard from "./dashboard/Dashboard";
import SetCardEditor from "./set-card-editor/SetCardEditor";
import SetImporter from "./set-importer/ImportPage";
import SetExporter from "./SetExporter";
import SetProperties from "./SetProperties";
import StudySection from "./study/StudySection";

export default class StudyCardsApp extends React.Component {
    constructor(props: {}) {
        super(props);

        this.state = {
            currentSetId: null,
            setBeingImported: false,
        };
    }

    public render() {
        return <section>
            <header className="header">
                <nav className="navbar" role="navigation" aria-label="main navigation">
                    <div className="container">
                        <div className="navbar-brand">
                            <a className="navbar-item" href="https://bulma.io">
                                <img src="/assets/logo.png" width="150" height="28" />
                            </a>

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
                                <a className="navbar-item">
                                    My Sets
                                </a>
                                <div className="navbar-item has-dropdown is-hoverable">
                                    <a className="navbar-link">
                                        <span className="icon">
                                            <i className="fas fa-user"></i>
                                        </span>&nbsp;
                                        Alexander
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
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
            <Switch>
                <Route exact path="/" render={({history}) => <Dashboard history={history} />}/>
                <Route exact path="/import" component={SetImporter} />
                <Route path="/set/:setId/study" component={StudySection} />
                <Route path="/set/:setId/edit" component={SetCardEditor} />
                <Route path="/set/:setId/export" component={SetExporter} />
                <Route path="/set/:setId/properties" component={SetProperties} />
            </Switch>
        </section>;
    }
}
