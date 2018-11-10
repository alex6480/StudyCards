import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Dispatch } from "redux";
import IFlashCardSet, { ExportFlashCardSet } from "../lib/flashcard/FlashCardSet";
import IRemote from "../lib/remote";
import { Storage } from "../lib/storage/StorageProvider";
import { IAppState } from "../reducers";
import { SetService } from "../services/set.service";
import SetHeader from "./SetHeader";
import SetLoader from "./SetLoader";
import SetNav from "./SetNav";
import SetNotFound from "./SetNotFound";

interface ISetExplorerOwnProps {
    setId: string;
}

interface ISetExplorerStateProps extends RouteComponentProps<ISetExplorerOwnProps> {
    setId: number;
    set?: IRemote<IFlashCardSet>;
}

interface ISetExplorerDispatchProps {
    loadSetMetaAll: () => void;
}

interface ISetExplorerProps extends ISetExplorerStateProps, ISetExplorerDispatchProps { }

interface ISetExporterState {
    filename: string;
}

class SetExporter extends React.Component<ISetExplorerProps, ISetExporterState> {
    public constructor(props: ISetExplorerProps) {
        super(props);

        this.state = {
            filename: "",
        };
    }

    public componentWillMount() {
        if (this.props.set === undefined) {
            this.props.loadSetMetaAll();
        }
    }

    public render() {
        let content: JSX.Element;

        if (this.props.set === undefined) {
            content = <SetNotFound setId={this.props.setId} />;
        } else if (this.props.set.isFetching || this.props.set.value === undefined) {
            content = <SetLoader />;
        } else {
            const set = this.props.set.value;
            content =  <div className="container">
                <h3 className="title is-3">Export Set</h3>
                <p className="subtitle is-4">Exports the set '{set.setName}' into
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
        }

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

    const setId = Number(ownProps.match.params.setId);
    let set: IRemote<IFlashCardSet> | undefined;
    if (state.sets.isFetching === false && state.sets.value === undefined) {
        // Return an undefined set, so the component will attempt to fetch it
        set = undefined;
    } else {
        set = state.sets.value === undefined
            ? { isFetching: true, value: undefined }
            : state.sets.value[setId];
    }

    return {
        ...ownProps,
        setId,
        set,
    };
}

function mapDispatchToProps(dispatch: Dispatch): ISetExplorerDispatchProps {
    return {
        loadSetMetaAll: () => dispatch<any>(SetService.list()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SetExporter);
