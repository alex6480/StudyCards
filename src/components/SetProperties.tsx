import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Dispatch } from "redux";
import IFlashCardSet, { ExportFlashCardSet, IFlashCardSetMeta } from "../lib/flashcard/FlashCardSet";
import IRemote from "../lib/remote";
import { Storage } from "../lib/storage/StorageProvider";
import { IAppState } from "../reducers";
import SetHeader from "./SetHeader";
import SetLoader from "./SetLoader";
import SetNav from "./SetNav";
import SetNotFound from "./SetNotFound";

interface ISetPropertiesOwnProps {
    setId: string;
}

interface ISetPropertiesStateProps extends RouteComponentProps<ISetPropertiesOwnProps> {
    setId: string;
    set?: IRemote<IFlashCardSet>;
}

interface ISetPropertiesDispatchProps {
    loadSetMetaAll: () => void;
    saveSetMeta: (setMeta: Partial<IFlashCardSetMeta>) => void;
}

interface ISetPropertiesProps extends ISetPropertiesStateProps, ISetPropertiesDispatchProps { }

interface ISetExporterState {
    setName: string;
    isDeleting: boolean;
}

class SetExporter extends React.Component<ISetPropertiesProps, ISetExporterState> {
    public constructor(props: ISetPropertiesProps) {
        super(props);

        this.state = {
            setName: props.set !== undefined ? (props.set.value !== undefined ? props.set.value.name : "") : "",
            isDeleting: false,
        };
    }

    public componentWillReceiveProps(newProps: ISetPropertiesProps) {
        // When we get set data, set the name of the set
        if ((this.props.set === undefined || this.props.set.value === undefined)
            && newProps.set !== undefined && newProps.set.value !== undefined) {
            this.setState({ setName: newProps.set.value.name });
        }
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
        } else if (this.props.set.value === undefined) {
            content = <SetLoader />;
        } else {
            const set = this.props.set.value;
            content =  <div className="container">
                <h3 className="title is-3">Properties</h3>
                <div className="box">

                    <div className="field">
                        <label className="label">Name</label>
                        <div className="control">
                            <input className="input"
                                value={this.state.setName}
                                onChange={e => this.setState({ setName: e.target.value })}
                                onBlur={this.updateSetName.bind(this)}
                                type="text"
                                placeholder="Set Name" />
                        </div>
                    </div>
                </div>

                <h3 className="title is-3">Delete Set</h3>
                <div className="box">
                    <p>Click the button below to delete the set.</p>
                    <p>Sets are permanently deleted. This action is irreversible!</p>
                    <button className="button is-danger" onClick={() => this.setState({ isDeleting: true})}>
                        Delete Set
                    </button>

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

            { this.state.isDeleting &&
            <div className="modal is-active">
                <div className="modal-background"
                    onClick={() => this.setState({ isDeleting: false })}></div>
                <div className="modal-card confirm-set-delete">
                    <header className="modal-card-head">
                        <p className="modal-card-title">Delete Set</p>
                        <button className="delete"
                            onClick={() => this.setState({ isDeleting: false })}
                            aria-label="close"></button>
                    </header>
                    <section className="modal-card-body">
                        <p>Are you sure you want to delete this set?</p>
                        <p>This action is irreversible. There is no way to recover any cards from the set
                            or information about your study after the set has been deleted.</p>
                    </section>
                    <footer className="modal-card-foot">
                    <button className="button is-danger" onClick={() => alert("Test")}>Delete</button>
                    <button className="button" onClick={() => this.setState({ isDeleting: false })}>Cancel</button>
                    </footer>
                </div>
            </div>
            }
        </div>;
    }

    private updateSetName() {
        if (this.state.setName !== this.props.set!.value!.name) {
            this.props.saveSetMeta({ id: this.props.setId, name: this.state.setName });
        }
    }
}

function mapStateToProps(state: IAppState, ownProps: RouteComponentProps<ISetPropertiesOwnProps>):
    ISetPropertiesStateProps {

    const setId = ownProps.match.params.setId;
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

function mapDispatchToProps(dispatch: Dispatch): ISetPropertiesDispatchProps {
    return {
        loadSetMetaAll: () => dispatch<any>(Storage.loadSetMetaAll()),
        saveSetMeta: (setMeta: Partial<IFlashCardSetMeta>) => dispatch<any>(Storage.saveSetMeta(setMeta)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SetExporter);
