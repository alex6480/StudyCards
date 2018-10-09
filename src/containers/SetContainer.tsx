import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import EditableText from "../components/rich-text-editor/EditableText";
import SetCardEditor from "../components/set-card-editor/SetCardEditor";
import SetExporter from "../components/SetExporter";
import StudySection from "../components/study/StudySection";
import IFlashCard from "../lib/flashcard/flashcard";
import { IFlashCardFace } from "../lib/flashcard/FlashCardFace";
import IFlashCardSet, { IFlashCardSetMeta } from "../lib/flashcard/FlashCardSet";
import { ICardStudyData, ISetStudyData } from "../lib/flashcard/StudyData";
import IRemote from "../lib/remote";
import IStorageProvider from "../lib/storage/StorageProvider";
import { IAppState } from "../reducers";
import { Action } from "../reducers/actions";

interface ISetContainerOwnProps {
    goToDashboard: () => void;
    setId: string;
}

interface ISetContainerStateProps extends ISetContainerOwnProps {
    storage: IStorageProvider;
    set: IRemote<IFlashCardSet>;
    studyData: IRemote<ISetStudyData>;
}

interface ISetContainerDispatchProps {
    addNewCard: (store: IStorageProvider, setId: string, afterCardId?: string) => void;
    deleteCard: (card: IFlashCard) => void;
    saveSetMeta: (storage: IStorageProvider, setMeta: Partial<IFlashCardSetMeta>) => void;
    resetStudySessionData: () => void;
    updateCardStudyData: (studyData: ICardStudyData) => void;
    getSetStudyData: (storage: IStorageProvider, setId: string) => void;
    loadCards: (storage: IStorageProvider, setId: string, cardIds: string[]) => void;
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
        if (this.props.set.value === undefined || this.props.set === undefined) {
            return <p>Loading set</p>;
        }

        switch (this.state.section) {
            case SetSection.Edit:
                page = <SetCardEditor set={this.props.set.value}
                            addNewCard={this.addNewCard.bind(this)}
                            deleteCard={this.props.deleteCard}
                            loadCards={this.loadCards.bind(this)} />;
                break;
            case SetSection.Export:
                page = <SetExporter set={this.props.set.value} getExportUri={this.getSetExportUri.bind(this)}/>;
                break;
            case SetSection.Study:
                page = <StudySection set={this.props.set.value}
                        resetSessionStudyData={this.props.resetStudySessionData}
                        updateCardStudyData={this.props.updateCardStudyData}
                        studyData={this.props.studyData}
                        goToSection={this.goToSection.bind(this)}
                        loadCards={this.loadCards.bind(this)}
                        loadStudyData={() => this.props.getSetStudyData(this.props.storage, this.props.setId)}/>;
                break;
            default:
                throw new Error("Unknown section");
        }

        return <div>
            <section className="hero is-primary">
                <div className="hero-body">
                    <div className="container">
                        <h1 className="title is-1">
                            { this.props.set.isFetching &&
                                <span className="icon is-large">
                                    <i className=" fas fa-spinner fa-pulse "></i>
                                </span>
                            }
                            <EditableText maxLength={30}
                                readOnly={this.props.set.isFetching}
                                value={this.props.set.value.name}
                                onBlur={this.updateSetName.bind(this)}/>
                        </h1>
                        <nav className="breadcrumb subtitle is-6" aria-label="breadcrumbs">
                            <ul>
                                <li><a href="#" onClick={this.props.goToDashboard}>My Sets</a></li>
                                <li className="is-active"><a href="#" aria-current="page">
                                    {this.props.set.value.name}
                                </a></li>
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

    private getSetExportUri(setId: string) {
        return this.props.storage.getExportUri(setId);
    }

    private addNewCard(afterCardId?: string) {
        return this.props.addNewCard(this.props.storage, this.props.setId, afterCardId);
    }

    private loadCards(cardIds: string[]) {
        return this.props.loadCards(this.props.storage, this.props.setId, cardIds);
    }

    private goToSection(newPage: SetSection) {
        this.setState({section: newPage});
    }

    private updateSetName(newName: string) {
        if (newName !== this.props.set.value!.name) {
            this.props.saveSetMeta(this.props.storage, { id: this.props.setId, name: newName });
        }
    }
}

function mapStateToProps(state: IAppState, ownProps: ISetContainerOwnProps): ISetContainerStateProps {
    return {
        ...ownProps,
        set: state.sets.value![ownProps.setId],
        studyData: state.studyData[ownProps.setId],
        storage: state.storageProvider,
    };
}

function mapDispatchToProps(dispatch: Dispatch): ISetContainerDispatchProps {
    return {
        addNewCard: (store: IStorageProvider, setId: string, afterCardId?: string) =>
            store.addCard(dispatch, setId, afterCardId),
        getSetStudyData: (storage: IStorageProvider, setId: string) => storage.loadSetStudyData(dispatch, setId),
        deleteCard: (card: IFlashCard) => dispatch(Action.deleteCard(card)),
        saveSetMeta: (storage: IStorageProvider, setMeta: Partial<IFlashCardSetMeta>) =>
            storage.saveSetMeta(dispatch, setMeta),
        resetStudySessionData: () => dispatch(Action.resetSessionStudyData()),
        updateCardStudyData: (studyData: ICardStudyData) => dispatch(Action.updateCardStudyData(studyData)),
        loadCards: (storage: IStorageProvider, setId: string, cardIds: string[]) =>
            storage.loadCards(dispatch, setId, cardIds),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SetContainer);
