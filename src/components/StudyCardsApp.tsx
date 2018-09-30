import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import IFlashCard from "../lib/flashcard/flashcard";
import { IFlashCardFace } from "../lib/flashcard/FlashCardFace";
import IFlashCardSet from "../lib/flashcard/FlashCardSet";
import { ICardStudyData } from "../lib/flashcard/StudyData";
import { IAppState } from "../reducers";
import { Actions } from "../reducers/actions";
import Dashboard from "./dashboard/Dashboard";
import SetPage from "./pages/SetPage";
import SetImporter from "./set-importer/ImportPage";

interface IStudyCardsAppStateProps {
    sets: { [id: string]: IFlashCardSet };
}

interface IStudyCardsAppDispatchProps {
    addSet: (set?: IFlashCardSet) => void;
    addNewCard: (setId: string) => void;
    deleteCard: (card: IFlashCard) => void;
    updateCardFace: (cardId: string, face: IFlashCardFace) => void;
    updateSetName: (set: IFlashCardSet, newName: string) => void;
    updateCardStudyData: (studyData: ICardStudyData) => void;
    resetStudySessionData: () => void;
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
                        addSet={this.props.addSet}
                        goToImport={this.goToImport.bind(this)}
                        goToSet={this.goToSet.bind(this)}/>;
        } else {
            return <SetPage set={this.props.sets[this.state.currentSetId] as IFlashCardSet}
                        addNewCard={this.props.addNewCard}
                        deleteCard={this.props.deleteCard}
                        updateCardFace={this.props.updateCardFace}
                        goToDashboard={this.goToDashboard.bind(this)}
                        updateSetName={this.props.updateSetName}
                        resetStudySessionData={this.props.resetStudySessionData}
                        updateCardStudyData={this.props.updateCardStudyData} />;
        }
    }

    private goToImport() {
        this.setState({
            setBeingImported: true,
            currentSetId: null,
        });
    }

    private goToSet(set: IFlashCardSet) {
        this.setState({
            currentSetId: set.id,
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
        addSet: (set?: IFlashCardSet) => dispatch(Actions.addSet(set)),
        addNewCard: (setId: string) => dispatch(Actions.addNewCard(setId)),
        deleteCard: (card: IFlashCard) => dispatch(Actions.deleteCard(card)),
        updateCardFace: (cardId: string, face: IFlashCardFace) => dispatch(Actions.updateCardFace(cardId, face)),
        updateSetName: (set: IFlashCardSet, newName: string) => dispatch(Actions.updateSetName(set, newName)),
        resetStudySessionData: () => dispatch(Actions.resetSessionStudyData()),
        updateCardStudyData: (studyData: ICardStudyData) => dispatch(Actions.updateCardStudyData(studyData)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(StudyCardsApp);
