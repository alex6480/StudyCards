import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import IFlashCardSet from "../../lib/flashcard/FlashCardSet";
import Remote from "../../lib/remote";
import IStorageProvider from "../../lib/storage/StorageProvider";
import { IAppState } from "../../reducers";
import { Actions } from "../../reducers/actions";
import AddNewSetTile from "./AddNewSetTile";
import SetTile from "./SetTile";

interface IDashboardOwnProps {
    goToImport: () => void;
    goToSet: (setId: string) => void;
}

interface IDashboardStateProps {
    sets: Remote<{ [id: string]: IFlashCardSet }>;
    storage: IStorageProvider;
}

interface IDashboardDispatchProps {
    addSet: (set?: IFlashCardSet, callback?: (id: string) => void) => void;
    loadSetMetaAll: (storageProvider: IStorageProvider) => void;
}

interface IDashboardProps extends IDashboardStateProps, IDashboardDispatchProps, IDashboardOwnProps { }

export class Dashboard extends React.Component<IDashboardProps> {
    constructor(props: IDashboardProps) {
        super(props);
        // Set initial state
        this.state = { };

        props.loadSetMetaAll(props.storage);
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
            <section className="section">
                <div className="container">
                    { this.renderContent() }
                </div>
            </section>
        </div>;
    }

    private renderContent() {
        if (this.props.sets.isUpToDate) {
            return <div className="columns is-multiline">
                { this.getSetTiles(this.props.sets.value()) }
                <AddNewSetTile addSet={this.handleAddSet.bind(this)} goToImport={this.props.goToImport}/>
            </div>;
        } else {
            return <p>Loading sets</p>;
        }
    }

    private handleAddSet() {
        this.props.addSet(undefined, id => {
            this.props.goToSet(id);
        });
    }

    private getSetTiles(sets: { [id: string]: IFlashCardSet }) {
        const result: React.ReactElement<SetTile>[] = [];
        for (const setId of Object.keys(sets)) {
            result.push(<SetTile key={setId} set={sets[setId]} goToSet={this.props.goToSet}/>);
        }

        return result;
    }
}

function mapStateToProps(state: IAppState): IDashboardStateProps {
    return {
        sets: state.sets,
        storage: state.storageProvider,
    };
}

function mapDispatchToProps(dispatch: Dispatch): IDashboardDispatchProps {
    return {
        addSet: (set, callback) => dispatch(Actions.addSet(set, callback)),
        loadSetMetaAll: (storageProvider: IStorageProvider) => storageProvider.getSetMetaAll(dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
