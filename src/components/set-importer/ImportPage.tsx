import * as React from "react";
import { connect } from 'react-redux'
import FlashCardSet, { ExportFlashCardSet } from "../../lib/flashcard/FlashCardSet";
import SetCardEditor from "../set-card-editor/SetCardEditor";
import SetExporter from "../SetExporter";
import SetFilePicker from "./SetFilePicker";

interface SetImporterProps {
    sets: { [id: string]: FlashCardSet };
    goToDashboard: () => void;
    addSet: (set?: FlashCardSet) => void;
}

interface SetImporterState {
    importedSet: FlashCardSet | null
}

export default class SetImporter extends React.Component<SetImporterProps, SetImporterState> {
    constructor (props: SetImporterProps) {
        super(props);
        // Set initial state
        this.state = {
            importedSet: null
        }
    }

    private fileChanged (set: FlashCardSet) {
        this.setState({ importedSet: set });
    }

    private import () {
        if (this.state.importedSet == null) {
            throw "Imported set cannot be null when importing";
        }
        this.props.addSet(this.state.importedSet);
        this.props.goToDashboard();
    }

    private renderMergeBox () {
        if (this.state.importedSet == null) {
            throw "Set must have been imported in order to merge with it";
        }

        let mergeSet = this.props.sets[this.state.importedSet.id];
        if (mergeSet == undefined)
        {
            return <div>
                <h3 className="title is-3">Merge with preexisting set</h3>
                <div className="box">The imported set will be imported as a new set as no suitable set was found to merge it with.</div>
            </div>
        } else {
            return <div>
                <h3 className="title is-3">Merge with preexisting set</h3>
                <div className="box">
                    <p>The imported set can be merged with the set 'TEMP'. Do you want to merge the sets or import it as a new set?</p>
                    <div className="tabs is-toggle">
                        <ul>
                            <li className="is-active">
                                <a className="button">
                                    <span>Merge with existing set</span>
                                </a>
                            </li>
                            <li>
                                <a className="button">
                                    <span>Create new set</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        }
    }

    render () {
        return <div>
            <section className="hero is-primary">
                <div className="hero-body">
                    <div className="container">
                        <h1 className="title is-1">Import set</h1>
                        <nav className="breadcrumb subtitle is-6" aria-label="breadcrumbs">
                            <ul>
                                <li><a href="#" onClick={this.props.goToDashboard}>My Sets</a></li>
                                <li className="is-active"><a href="#" aria-current="page">Import</a></li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </section>
            <section className="section">
                <div className="container">
                    <h3 className="title is-3">Select file</h3>
                    <p className="subtitle is-4">Select a file to import. You will be given options about whether to merge this set with existing sets or whether to import it as a new set.</p>
                    <div className="box">
                        <SetFilePicker onChange={this.fileChanged.bind(this)}/>
                    </div>

                    { /* Allow the user to decide whether or not the set can be merged */ }
                    { this.state.importedSet && this.renderMergeBox() }
                    { this.state.importedSet && <a href="#" className="button is-primary" onClick={this.import.bind(this)}>Import</a> }
                </div>
            </section>
        </div>
    }
}