import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import SetContainer from "../containers/SetContainer";
import IFlashCard from "../lib/flashcard/flashcard";
import { IFlashCardFace } from "../lib/flashcard/FlashCardFace";
import IFlashCardSet from "../lib/flashcard/FlashCardSet";
import { ICardStudyData } from "../lib/flashcard/StudyData";
import IStorageProvider from "../lib/storage/StorageProvider";
import { IAppState } from "../reducers";
import { Actions } from "../reducers/actions";
import Dashboard from "./dashboard/Dashboard";
import SetImporter from "./set-importer/ImportPage";

interface IStudyCardsAppStateProps {
    storageProvider: IStorageProvider;
}

interface IStudyCardsAppDispatchProps {
    addSet: (set?: IFlashCardSet, callback?: (id: string) => void) => void;
}

interface IStudyCardsAppProps extends IStudyCardsAppStateProps, IStudyCardsAppDispatchProps {}

interface IStudyCardsAppState {
    currentSetId: string | null;
    setBeingImported: boolean;
}

class StudyCardsApp extends React.Component<IStudyCardsAppProps, IStudyCardsAppState> {
    constructor(props: IStudyCardsAppProps) {
        super(props);

        this.state = {
            currentSetId: null,
            setBeingImported: false,
        };
    }

    public render() {
        if (this.state.setBeingImported) {
            return <SetImporter goToDashboard={this.goToDashboard.bind(this)}
                        addSet={this.props.addSet}
                        storageProvider={this.props.storageProvider}/>;
        } else if (this.state.currentSetId === null) {
            return <Dashboard goToImport={this.goToImport.bind(this)}
                        goToSet={this.goToSet.bind(this)}/>;
        } else {
            return <SetContainer setId={this.state.currentSetId} goToDashboard={this.goToDashboard.bind(this)} />;
        }
    }

    private goToImport() {
        this.setState({
            setBeingImported: true,
            currentSetId: null,
        });
    }

    private goToSet(setId: string) {
        this.setState({
            currentSetId: setId,
            setBeingImported: false,
        });
    }

    private goToDashboard() {
        this.setState({
            currentSetId: null,
            setBeingImported: false,
        });
    }
}

function mapStateToProps(state: IAppState) {
    return {
        storageProvider: state.storageProvider,
    };
}

function mapDispatchToProps(dispatch: Dispatch): IStudyCardsAppDispatchProps {
    return {
        addSet: (set, callback) => dispatch(Actions.addSet(set, callback)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(StudyCardsApp);
