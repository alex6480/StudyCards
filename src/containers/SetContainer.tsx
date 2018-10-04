import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import EditableText from "../components/rich-text-editor/EditableText";
import SetCardEditor from "../components/set-card-editor/SetCardEditor";
import SetExporter from "../components/SetExporter";
import StudySection from "../components/study/StudySection";
import IFlashCard from "../lib/flashcard/flashcard";
import { IFlashCardFace } from "../lib/flashcard/FlashCardFace";
import IFlashCardSet from "../lib/flashcard/FlashCardSet";
import { ICardStudyData, ISetStudyData } from "../lib/flashcard/StudyData";
import { IAppState } from "../reducers";
import { Actions } from "../reducers/actions";

interface ISetContainerOwnProps {
    set: IFlashCardSet;
    goToDashboard: () => void;
}

interface ISetContainerStateProps extends ISetContainerOwnProps {
    studyData: ISetStudyData;
}

interface ISetContainerDispatchProps {
    addNewCard: (setId: string, afterCardId?: string) => void;
    deleteCard: (card: IFlashCard) => void;
    updateSetName: (set: IFlashCardSet, newName: string) => void;
    resetStudySessionData: () => void;
    updateCardStudyData: (studyData: ICardStudyData) => void;
}

interface ISetContainerProps extends ISetContainerStateProps, ISetContainerDispatchProps { }

interface ISetContainerState {
    section: SetSection;
}

export enum SetSection {
    Study,
    Edit,
    Export,
    Properties,
}

class SetContainer extends React.Component<ISetContainerProps, ISetContainerState> {
    constructor(props: ISetContainerProps) {
        super(props);
        // Set initial state
        this.state = {
            section: SetSection.Study,
        };
    }

    public render() {
        let page: React.ReactElement<any>;
        switch (this.state.section) {
            case SetSection.Edit:
                page = <SetCardEditor set={this.props.set}
                            addNewCard={this.props.addNewCard}
                            deleteCard={this.props.deleteCard} />;
                break;
            case SetSection.Export:
                page = <SetExporter set={this.props.set}/>;
                break;
            case SetSection.Study:
                page = <StudySection set={this.props.set}
                        resetSessionStudyData={this.props.resetStudySessionData}
                        updateCardStudyData={this.props.updateCardStudyData}
                        studyData={this.props.studyData}
                        goToSection={this.goToSection.bind(this)}/>;
                break;
            default:
                throw new Error("Unknown section");
        }

        return <div>
            <section className="hero is-primary">
                <div className="hero-body">
                    <div className="container">
                        <h1 className="title is-1">
                            <EditableText maxLength={30}
                                value={this.props.set.name}
                                onChange={this.updateSetName.bind(this)}/>
                        </h1>
                        <nav className="breadcrumb subtitle is-6" aria-label="breadcrumbs">
                            <ul>
                                <li><a href="#" onClick={this.props.goToDashboard}>My Sets</a></li>
                                <li className="is-active"><a href="#" aria-current="page">{this.props.set.name}</a></li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </section>
            <nav className="navbar" role="navigation" aria-label="main navigation">
                <div className="navbar-menu container">
                    <div className="navbar-start">
                        <a className="navbar-item" onClick={this.props.goToDashboard}>
                            <span className="icon icon-small">
                                <i className="fas fa-arrow-left"></i>
                            </span>&nbsp;
                            Back
                        </a>
                        <a className="navbar-item" onClick={() => this.goToSection(SetSection.Study)}>Study</a>
                        <a className="navbar-item" onClick={() => this.goToSection(SetSection.Edit)}>Edit Cards</a>
                        <a className="navbar-item"
                            onClick={() => this.goToSection(SetSection.Properties)}>Set Properties</a>
                        <a className="navbar-item" onClick={() => this.goToSection(SetSection.Export)}>Export</a>
                    </div>
                </div>
            </nav>
            <section className="section">
                {page}
            </section>
        </div>;
    }

    private goToSection(newPage: SetSection) {
        this.setState({section: newPage});
    }

    private updateSetName(newName: string) {
        this.props.updateSetName(this.props.set, newName);
    }
}

function mapStateToProps(state: IAppState, ownProps: ISetContainerOwnProps): ISetContainerStateProps {
    if (state.studyData[ownProps.set.id] === undefined) {
        throw new Error("Studydata object does not exist for set " + ownProps.set.id);
    }
    return {
        ...ownProps,
        studyData: state.studyData[ownProps.set.id],
    };
}

function mapDispatchToProps(dispatch: Dispatch): ISetContainerDispatchProps {
    return {
        addNewCard: (setId: string, afterCardId?: string) => dispatch(Actions.addNewCard(setId, afterCardId)),
        deleteCard: (card: IFlashCard) => dispatch(Actions.deleteCard(card)),
        updateSetName: (set: IFlashCardSet, newName: string) => dispatch(Actions.updateSetName(set, newName)),
        resetStudySessionData: () => dispatch(Actions.resetSessionStudyData()),
        updateCardStudyData: (studyData: ICardStudyData) => dispatch(Actions.updateCardStudyData(studyData)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SetContainer);
