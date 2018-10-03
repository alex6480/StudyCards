import * as React from "react";
import IFlashCardSet from "../../lib/flashcard/FlashCardSet";
import AddNewSetTile from "./AddNewSetTile";
import SetTile from "./SetTile";

interface IDashboardProps {
    sets: { [id: string]: IFlashCardSet };
    goToImport: () => void;
    goToSet: (setId: string) => void;
    addSet: (callback?: (id: string) => void) => void;
}

export default class Dashboard extends React.Component<IDashboardProps> {
    constructor(props: IDashboardProps) {
        super(props);
        // Set initial state
        this.state = { };
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
                    <div className="columns is-multiline">
                        { this.getSetTiles(this.props.sets) }
                        <AddNewSetTile addSet={this.handleAddSet.bind(this)} goToImport={this.props.goToImport}/>
                    </div>
                </div>
            </section>
        </div>;
    }

    private handleAddSet() {
        this.props.addSet(id => {
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
