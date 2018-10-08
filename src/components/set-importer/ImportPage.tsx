import * as React from "react";
import IFlashCardSet, { ExportFlashCardSet } from "../../lib/flashcard/FlashCardSet";
import Remote from "../../lib/remote";
import IStorageProvider from "../../lib/storage/StorageProvider";
import SetCardEditor from "../set-card-editor/SetCardEditor";
import SetExporter from "../SetExporter";
import SetFilePicker from "./SetFilePicker";

interface ISetImporterProps {
    storageProvider: IStorageProvider;
    goToDashboard: () => void;
    addSet: (set?: IFlashCardSet) => void;
}

interface ISetImporterState {
    importedSet: IFlashCardSet | null;
    mergingSet: Remote<IFlashCardSet | null>;
}

export default class SetImporter extends React.Component<ISetImporterProps, ISetImporterState> {
    constructor(props: ISetImporterProps) {
        super(props);
        // Set initial state
        this.state = {
            importedSet: null,
            mergingSet: new Remote<IFlashCardSet | null>(false),
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

                    { /* Allow the user to decide whether or not the set can be merged */ }
                    { this.state.importedSet && this.renderMergeBox() }
                    { this.state.importedSet && <a href="#" className="button is-primary"
                        onClick={this.import.bind(this)}>Import</a> }
                </div>
            </section>
        </div>;
    }

    private fileChanged(set: IFlashCardSet) {
        this.setState({ importedSet: set });
    }

    private import() {
        if (this.state.importedSet == null) {
            throw new Error("Imported set cannot be null when importing");
        }
        this.props.addSet(this.state.importedSet);
        this.props.goToDashboard();
    }

    private renderMergeBox() {
        if (this.state.importedSet == null) {
            throw new Error("Set must have been imported in order to merge with it");
        }

        if (this.state.mergingSet.isFetching) {
            return <p>Fetching set to merge with.</p>;
        }

        const mergingSet = this.state.mergingSet.value();
        if (mergingSet === null) {
            return <div>
                <h3 className="title is-3">Merge with preexisting set</h3>
                <div className="box">The imported set will be imported as a new set as
                    no suitable set was found to merge it with.</div>
            </div>;
        } else {
            return <div>
                <h3 className="title is-3">Merge with preexisting set</h3>
                <div className="box">
                    <p>The imported set can be merged with the set '{mergingSet.name}'.
                        Do you want to merge the sets or import it as a new set?</p>
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
            </div>;
        }
    }
}
