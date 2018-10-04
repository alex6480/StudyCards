import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import SetContainer from "../containers/SetContainer";
import IFlashCard from "../lib/flashcard/flashcard";
import { IFlashCardFace } from "../lib/flashcard/FlashCardFace";
import IFlashCardSet from "../lib/flashcard/FlashCardSet";
import { ICardStudyData } from "../lib/flashcard/StudyData";
import { IAppState } from "../reducers";
import { Actions } from "../reducers/actions";
import Dashboard from "./dashboard/Dashboard";
import SetImporter from "./set-importer/ImportPage";

interface IStudyCardsAppStateProps {
    sets: { [id: string]: IFlashCardSet };
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
            return <SetImporter sets={this.props.sets}
                        goToDashboard={this.goToDashboard.bind(this)}
                        addSet={this.props.addSet}/>;
        } else if (this.state.currentSetId == null) {
            return <Dashboard sets={this.props.sets}
                        addSet={callback => this.props.addSet(undefined, callback )}
                        goToImport={this.goToImport.bind(this)}
                        goToSet={this.goToSet.bind(this)}/>;
        } else {
            return <SetContainer set={this.props.sets[this.state.currentSetId] as IFlashCardSet}
                        goToDashboard={this.goToDashboard.bind(this)} />;
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

function mapStateToProps(state: IAppState): IStudyCardsAppStateProps {
    return {
        sets: state.sets,
    };
}

function mapDispatchToProps(dispatch: Dispatch): IStudyCardsAppDispatchProps {
    return {
        addSet: (set, callback) => dispatch(Actions.addSet(set, callback)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(StudyCardsApp);
