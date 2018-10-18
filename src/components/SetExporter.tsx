import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import IFlashCardSet, { ExportFlashCardSet } from "../lib/flashcard/FlashCardSet";
import IRemote from "../lib/remote";
import { Storage } from "../lib/storage/StorageProvider";
import { IAppState } from "../reducers";
import SetHeader from "./SetHeader";
import SetNav from "./SetNav";

interface ISetExplorerOwnProps {
    setId: string;
}

interface ISetExplorerStateProps extends RouteComponentProps<ISetExplorerOwnProps> {
    setId: string;
    set: IRemote<IFlashCardSet>;
}

interface ISetExporterState {
    filename: string;
}

class SetExporter extends React.Component<ISetExplorerStateProps, ISetExporterState> {
    public constructor(props: ISetExplorerStateProps) {
        super(props);

        this.state = {
            filename: "",
        };
    }

    public render() {
        const set = this.props.set.value!;
        let content: JSX.Element;
        content =  <div className="container">
            <h3 className="title is-3">Export Set</h3>
            <p className="subtitle is-4">Exports the set '{set.name}' into
                a study cards set file (*.scset).</p>
            <div className="box">
                <div className="field">
                    <label className="label">File Name</label>
                    <div className="control has-icons-left">
                        <input className="input" type="text" placeholder="Name of the file"
                            onChange={(e) => this.setState({ filename: e.target.value })}/>
                        <span className="icon is-small is-left">
                            <i className="fas fa-file"></i>
                        </span>
                    </div>
                </div>

                <div className="field">
                    <div className="control">
                        <a className="button is-primary" onClick={this.export.bind(this)}>Export</a>
                    </div>
                </div>
            </div>
        </div>;

        return <div>
            <div>
                <SetHeader setId={this.props.setId} />
                <SetNav setId={this.props.setId} activePage="edit" />
                <section className="section">
                    {content}
                </section>
            </div>;
        </div>;
    }

    private export() {
        const downloadUri = Storage.getExportUri(this.props.setId);
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href",     downloadUri);
        downloadAnchorNode.setAttribute("download", this.state.filename + ".json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
}

function mapStateToProps(state: IAppState, ownProps: RouteComponentProps<ISetExplorerOwnProps>):
    ISetExplorerStateProps {
    return {
        ...ownProps,
        setId: ownProps.match.params.setId,
        set: state.sets.value![ownProps.match.params.setId],
    };
}

export default connect(mapStateToProps)(SetExporter);
