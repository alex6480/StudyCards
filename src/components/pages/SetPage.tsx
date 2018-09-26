import * as React from "react";
import { connect } from 'react-redux'
import FlashCardSet from "../../lib/flashcard/FlashCardSet";
import SetCardEditor from "../set-card-editor/SetCardEditor";
import SetExporter from "../SetExporter";
import { AppState } from "../../reducers";
import FlashCard from "../../lib/flashcard/flashcard";
import { FlashCardFace } from "../../lib/flashcard/FlashCardFace";
import EditableText from "../rich-text-editor/EditableText";

interface SetPageProps {
    set: FlashCardSet;
    addNewCard: (setId: string) => void;
    deleteCard: (card: FlashCard) => void;
    updateCardFace: (cardId: string, face: FlashCardFace) => void;
    updateSetName: (set: FlashCardSet, newName: string) => void;
    goToDashboard: () => void;
}

interface SetPageState {
    section: SetPageSection
}

enum SetPageSection {
    Study,
    Edit,
    Export,
    Properties,
}

export default class SetPage extends React.Component<SetPageProps, SetPageState> {
    constructor (props: SetPageProps) {
        super(props);
        // Set initial state
        this.state = {
            section: SetPageSection.Study
        }
    }

    render () {
        var page:React.ReactElement<any>;
        switch (this.state.section) {
            case SetPageSection.Edit:
                page = <SetCardEditor set={this.props.set}
                            addNewCard={this.props.addNewCard}
                            deleteCard={this.props.deleteCard}
                            updateCardFace={this.props.updateCardFace} />
                break;
            case SetPageSection.Export:
                page = <SetExporter set={this.props.set}/>
                break;
            case SetPageSection.Study:
            default:
                page = <SetCardEditor set={this.props.set}
                            addNewCard={this.props.addNewCard}
                            deleteCard={this.props.deleteCard}
                            updateCardFace={this.props.updateCardFace} />
                break;
        }

        return <div>
            <section className="hero is-primary">
                <div className="hero-body">
                    <div className="container">
                        <h1 className="title is-1">
                            <span className="icon icon-small">
                                <i className="fas fa-pen"></i>
                            </span>&nbsp;
                            <EditableText maxLength={30} value={this.props.set.name} onChange={this.updateSetName.bind(this)}/>
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
                        <a className="navbar-item" onClick={() => this.goToSection(SetPageSection.Study)}>Study</a> 
                        <a className="navbar-item" onClick={() => this.goToSection(SetPageSection.Edit)}>Edit Cards</a>
                        <a className="navbar-item" onClick={() => this.goToSection(SetPageSection.Properties)}>Set Properties</a>
                        <a className="navbar-item" onClick={() => this.goToSection(SetPageSection.Export)}>Export</a>
                    </div>
                </div>
            </nav>
            <section className="section">
                {page}
            </section>
        </div>;
    }

    private goToSection (newPage: SetPageSection) {
        this.setState({section: newPage});
    }

    private updateSetName (newName: string) {
        this.props.updateSetName(this.props.set, newName);
    }
}