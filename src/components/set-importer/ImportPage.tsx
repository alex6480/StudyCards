import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import IFlashCardSet, { ExportFlashCardSet } from "../../lib/flashcard/FlashCardSet";
import IRemote from "../../lib/remote";
import IStorageProvider from "../../lib/storage/StorageProvider";
import { IAppState } from "../../reducers";
import SetCardEditor from "../set-card-editor/SetCardEditor";
import SetExporter from "../SetExporter";
import SetFilePicker from "./SetFilePicker";

interface ISetImporterOwnProps {
    goToDashboard: () => void;
}

interface ISetImporterStateProps {
    storage: IStorageProvider;
}

interface ISetImporterDispatchProps {
    addSet: (storage: IStorageProvider, set: IFlashCardSet) => void;
    setExists: (stroage: IStorageProvider, setId: string, callback: (exists: boolean) => void) => void;
}

interface ISetImporterProps extends ISetImporterStateProps, ISetImporterDispatchProps, ISetImporterOwnProps { }

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
        this.props.setExists(this.props.storage, set.id, (exists) => {
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
        this.props.addSet(this.props.storage, this.state.importedSet);
        this.props.goToDashboard();
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

function mapStateToProps(state: IAppState): ISetImporterStateProps {
    return {
        storage: state.storageProvider,
    };
}

function mapDispatchToProps(dispatch: Dispatch): ISetImporterDispatchProps {
    return {
        addSet: (storage: IStorageProvider, set: IFlashCardSet) => storage.addSet(dispatch, set),
        setExists: (storage: IStorageProvider, setId: string, callback: (exists: boolean) => void) =>
            storage.setExists(setId, callback),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SetImporter);
