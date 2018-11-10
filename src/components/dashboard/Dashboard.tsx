import { History } from "history";
import * as React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Dispatch } from "redux";
import IFlashCardSet from "../../lib/flashcard/FlashCardSet";
import IRemote from "../../lib/remote";
import IStorageProvider, { Storage } from "../../lib/storage/StorageProvider";
import { IAppState } from "../../reducers";
import { Action } from "../../reducers/actions";
import { SetService } from "../../services/set.service";
import CreateSetModal from "./CreateSetModal";
import SetTile from "./SetTile";

interface IDashboardOwnProps {
    history: History<any>;
}

interface IDashboardStateProps {
    sets: IRemote<{ [id: string]: IRemote<IFlashCardSet> }>;
}

interface IDashboardDispatchProps {
    addSet: (set?: Partial<IFlashCardSet>) => string;
    loadSetMetaAll: () => void;
}

interface IDashboardProps extends IDashboardStateProps, IDashboardDispatchProps, IDashboardOwnProps { }

interface IDashboardState {
    creatingSet: boolean;
}

export class Dashboard extends React.Component<IDashboardProps, IDashboardState> {
    constructor(props: IDashboardProps) {
        super(props);
        // Set initial state
        this.state = { creatingSet: false };

        props.loadSetMetaAll();
    }

    public render() {
        return <div>
            <section className="hero is-primary">
                <div className="hero-body">
                    <div className="container">
                        <h1 className="title is-1">Your StudyCards Sets</h1>
                        <nav className="breadcrumb subtitle is-6" aria-label="breadcrumbs">
                            <ul>
                            <li className="is-active"><a href="#" aria-current="page">My Sets</a></li>
                         </ul>
                        </nav>
                    </div>
                </div>
            </section>
            <nav className="navbar is-primary" role="navigation" aria-label="main navigation">
                <div className="navbar-menu container">
                    <div className="navbar-start">
                    <a className="navbar-item" onClick={() => this.setState({ creatingSet: true })}>
                        Create new
                    </a>
                    <Link className="navbar-item" to="/import">
                        Import
                    </Link>
                    </div>
                </div>
            </nav>
            <section className="section">
                <div className="container">
                    { this.renderContent() }
                </div>
            </section>
            { this.state.creatingSet &&
                <CreateSetModal closeModal={() => this.setState({ creatingSet: false }) }
                    createSet={ this.handleAddSet.bind(this)} /> }
        </div>;
    }

    private renderContent() {
        if (this.props.sets.value !== undefined) {
            return <div className="columns is-multiline">
                { this.getSetTiles(this.props.sets.isFetching, this.props.sets.value) }
            </div>;
        } else {
            return <p>Loading sets</p>;
        }
    }

    private handleAddSet(set?: Partial<IFlashCardSet>) {
        const newSetId = this.props.addSet(set);
        this.props.history.push("/set/" + newSetId + "/edit");
    }

    private getSetTiles(isFetching: boolean, sets: { [id: string]: IRemote<IFlashCardSet> }) {
        const result: React.ReactElement<SetTile>[] = [];
        for (const setId of Object.keys(sets)) {
            // If the global metadata is being fetched, represent that the individual sets are as well
            const set = {
                isFetching,
                value: sets[setId].value,
            };
            result.push(<SetTile key={setId} set={set} setId={setId}/>);
        }

        return result;
    }
}

function mapStateToProps(state: IAppState): IDashboardStateProps {
    return {
        sets: state.sets,
    };
}

function mapDispatchToProps(dispatch: Dispatch): IDashboardDispatchProps {
    return {
        addSet: (set?: Partial<IFlashCardSet>) => dispatch<any>(Storage.addSet(set)),
        loadSetMetaAll: () => dispatch<any>(SetService.list()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
