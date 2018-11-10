import { History } from "history";
import * as React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Dispatch } from "redux";
import IFlashCardSet, { ExportFlashCardSet } from "../../lib/flashcard/FlashCardSet";
import IRemote from "../../lib/remote";
import IStorageProvider, { Storage } from "../../lib/storage/StorageProvider";
import { IAppState } from "../../reducers";
import SetCardEditor from "../set-card-editor/SetCardEditor";
import SetExporter from "../SetExporter";
import SetFilePicker from "./SetFilePicker";

interface ISetImporterOwnProps {
    history: History<any>;
}

interface ISetImporterDispatchProps {
    addSet: (set: IFlashCardSet) => void;
    setExists: (setId: number, callback: (exists: boolean) => void) => void;
}

interface ISetImporterProps extends ISetImporterOwnProps, ISetImporterDispatchProps { }

interface ISetImporterState {
    importedSet: IFlashCardSet | null;
    existingSetExists: boolean;
}

class SetImporter extends React.Component<ISetImporterProps, ISetImporterState> {
    constructor(props: ISetImporterProps) {
        super(props);
        // Set initial state
        this.state = {
            importedSet: null,
            existingSetExists: false,
        };
    }

    public render() {
        return <div>
            <section className="hero is-primary">
                <div className="hero-body">
                    <div className="container">
                        <h1 className="title is-1">Import set</h1>
                        <nav className="breadcrumb subtitle is-6" aria-label="breadcrumbs">
                            <ul>
                                <li><Link to="/">My Sets</Link></li>
                                <li className="is-active"><a href="#" aria-current="page">Import</a></li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </section>
            <nav className="navbar is-primary" role="navigation" aria-label="main navigation">
                <div className="navbar-menu container">
                    <div className="navbar-start">
                    <Link className="navbar-item" to="/">
                        <span className="icon icon-small">
                            <i className="fas fa-arrow-left"></i>
                        </span>&nbsp;
                        Back
                    </Link>
                    </div>
                </div>
            </nav>
            <section className="section">
                <div className="container">
                    <h3 className="title is-3">Select file</h3>
                    <p className="subtitle is-4">Select a file to import. You will be given options about whether
                        to merge this set with existing sets or whether to import it as a new set.</p>
                    <div className="box">
                        <SetFilePicker onChange={this.fileChanged.bind(this)}/>
                    </div>

                    { /* Allow the user to decide whether or not the set wille replace an existing set */ }
                    { this.state.importedSet && this.renderReplaceBox() }
                    { this.state.importedSet && <a href="#" className="button is-primary"
                        onClick={this.import.bind(this)}>Import</a> }
                </div>
            </section>
        </div>;
    }

    private fileChanged(set: IFlashCardSet) {
        this.props.setExists(set.id, (exists) => {
            this.setState({
                importedSet: set,
                existingSetExists: exists,
            });
        });
    }

    private import() {
        if (this.state.importedSet == null) {
            throw new Error("Imported set cannot be null when importing");
        }
        this.props.addSet(this.state.importedSet);
        this.props.history.replace("/");
    }

    private renderReplaceBox() {
        if (this.state.importedSet == null) {
            throw new Error("Set must have been imported in order to merge with it");
        }

        if (this.state.existingSetExists === false) {
            return <></>;
        } else {
            return <div>
                <h3 className="title is-3">A version of this set already exists</h3>
                <div className="box">
                    <p>Do you want to overwrite the existing set or import it as a new set?</p>
                    <div className="tabs is-toggle">
                        <ul>
                            <li className="is-active">
                                <a className="button">
                                    <span>Overwrite</span>
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
            </div>;
        }
    }
}

function mapStateToProps(state: IAppState): { } {
    return { };
}

function mapDispatchToProps(dispatch: Dispatch): ISetImporterDispatchProps {
    return {
        addSet: (set: IFlashCardSet) => dispatch<any>(Storage.addSet(set)),
        setExists: (setId: number, callback: (exists: boolean) => void) => Storage.setExists(setId, callback),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SetImporter);
