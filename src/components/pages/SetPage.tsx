import * as React from "react";
import IFlashCard from "../../lib/flashcard/flashcard";
import { IFlashCardFace } from "../../lib/flashcard/FlashCardFace";
import IFlashCardSet from "../../lib/flashcard/FlashCardSet";
import { ICardStudyData } from "../../lib/flashcard/StudyData";
import EditableText from "../rich-text-editor/EditableText";
import SetCardEditor from "../set-card-editor/SetCardEditor";
import SetExporter from "../SetExporter";
import StudySection from "../study/StudySection";

interface ISetPageProps {
    set: IFlashCardSet;
    addNewCard: (setId: string) => void;
    deleteCard: (card: IFlashCard) => void;
    updateCardFace: (cardId: string, face: IFlashCardFace) => void;
    updateSetName: (set: IFlashCardSet, newName: string) => void;
    resetStudySessionData: () => void;
    goToDashboard: () => void;
    updateCardStudyData: (studyData: ICardStudyData) => void;
}

interface ISetPageState {
    section: ISetPageSection;
}

enum ISetPageSection {
    Study,
    Edit,
    Export,
    Properties,
}

export default class SetPage extends React.Component<ISetPageProps, ISetPageState> {
    constructor(props: ISetPageProps) {
        super(props);
        // Set initial state
        this.state = {
            section: ISetPageSection.Study,
        };
    }

    public render() {
        let page: React.ReactElement<any>;
        switch (this.state.section) {
            case ISetPageSection.Edit:
                page = <SetCardEditor set={this.props.set}
                            addNewCard={this.props.addNewCard}
                            deleteCard={this.props.deleteCard}
                            updateCardFace={this.props.updateCardFace} />;
                break;
            case ISetPageSection.Export:
                page = <SetExporter set={this.props.set}/>;
                break;
            case ISetPageSection.Study:
                page = <StudySection set={this.props.set}
                        resetSessionStudyData={this.props.resetStudySessionData}
                        updateCardStudyData={this.props.updateCardStudyData}
                        studyData={{
                            setId: this.props.set.id,
                            cardData: {},
                        }}/>;
                break;
            default:
                page = <SetCardEditor set={this.props.set}
                            addNewCard={this.props.addNewCard}
                            deleteCard={this.props.deleteCard}
                            updateCardFace={this.props.updateCardFace} />;
                break;
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
                        <a className="navbar-item" onClick={() => this.goToSection(ISetPageSection.Study)}>Study</a>
                        <a className="navbar-item" onClick={() => this.goToSection(ISetPageSection.Edit)}>Edit Cards</a>
                        <a className="navbar-item"
                            onClick={() => this.goToSection(ISetPageSection.Properties)}>Set Properties</a>
                        <a className="navbar-item" onClick={() => this.goToSection(ISetPageSection.Export)}>Export</a>
                    </div>
                </div>
            </nav>
            <section className="section">
                {page}
            </section>
        </div>;
    }

    private goToSection(newPage: ISetPageSection) {
        this.setState({section: newPage});
    }

    private updateSetName(newName: string) {
        this.props.updateSetName(this.props.set, newName);
    }
}
