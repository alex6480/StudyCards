import * as React from "react";
import { connect } from "react-redux";
import { Route, Switch  } from "react-router";
import Dashboard from "./dashboard/Dashboard";
import Logo from "./logo";
import SetCardEditor from "./set-card-editor/SetCardEditor";
import SetImporter from "./set-importer/ImportPage";
import SetExporter from "./SetExporter";
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
        return <>
            <header className="header">
                <nav>
                    <Logo />
                </nav>
            </header>
            <Switch>
                <Route exact path="/" render={({history}) => <Dashboard history={history} />}/>
                <Route exact path="/import" component={SetImporter} />
                <Route path="/set/:setId/study" component={StudySection} />
                <Route path="/set/:setId/edit" component={SetCardEditor} />
                <Route path="/set/:setId/export" component={SetExporter} />
            </Switch>
        </>;
    }
}
