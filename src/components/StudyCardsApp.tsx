import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import SetContainer, { SetSection } from "../containers/SetContainer";
import IFlashCard from "../lib/flashcard/flashcard";
import { IFlashCardFace } from "../lib/flashcard/FlashCardFace";
import IFlashCardSet from "../lib/flashcard/FlashCardSet";
import { ICardStudyData } from "../lib/flashcard/StudyData";
import IStorageProvider from "../lib/storage/StorageProvider";
import { IAppState } from "../reducers";
import { Action } from "../reducers/actions";
import Dashboard from "./dashboard/Dashboard";
import SetImporter from "./set-importer/ImportPage";

interface IStudyCardsAppState {
    currentSetId: string | null;
    setSection?: SetSection;
    setBeingImported: boolean;
}

export default class StudyCardsApp extends React.Component<{}, IStudyCardsAppState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            currentSetId: null,
            setBeingImported: false,
        };
    }

    public render() {
        if (this.state.setBeingImported) {
            return <SetImporter goToDashboard={this.goToDashboard.bind(this)} />;
        } else if (this.state.currentSetId === null) {
            return <Dashboard goToImport={this.goToImport.bind(this)}
                        goToSet={this.goToSet.bind(this)}/>;
        } else {
            return <SetContainer
                        setId={this.state.currentSetId}
                        goToDashboard={this.goToDashboard.bind(this)}
                        section={this.state.setSection} />;
        }
    }

    private goToImport() {
        this.setState({
            setBeingImported: true,
            currentSetId: null,
        });
    }

    private goToSet(setId: string, section: SetSection = SetSection.Study) {
        this.setState({
            currentSetId: setId,
            setBeingImported: false,
            setSection: section,
        });
    }

    private goToDashboard() {
        this.setState({
            currentSetId: null,
            setBeingImported: false,
        });
    }
}
