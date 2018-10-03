import * as React from "react";
import IFlashCardSet from "../../lib/flashcard/FlashCardSet";

interface ISetTileProps {
    set: IFlashCardSet;
    goToSet: (setId: string) => void;
}

export default class SetTile extends React.Component<ISetTileProps> {
    constructor(props: ISetTileProps) {
        super(props);
        // Set initial state
        this.state = { };
    }

    public render() {
        const cardCount = Object.keys(this.props.set.cards).length;
        return <div className="column is-3">
            <div className="card">
                <div className="card-content">
                    <p className="title is-4">{this.props.set.name}</p>
                    <p className="subtitle is-6">{cardCount} {cardCount === 1 ? "card" : "cards"} (26 due today)</p>
                    <p>Last studied <time>September 5th 2018</time></p>
                </div>
                <footer className="card-footer">
                    <div className="card-footer-item">
                        <div className="field has-addons">
                            <p className="control">
                                <a href="#" className="button is-primary" onClick={this.goToSetDashboard.bind(this)}>
                                    <span className="icon is-small">
                                        <i className="fas fa-book"></i>
                                    </span>&nbsp;
                                    Study
                                </a>
                            </p>
                            <p className="control">
                                <a href="#" className="button" onClick={this.goToSetDashboard.bind(this)}>
                                    <span className="icon is-small">
                                        <i className="fas fa-pen"></i>
                                    </span>&nbsp;
                                    Edit
                                </a>
                            </p>
                            <p className="control">
                                <a href="#" className="button">
                                    <span className="icon is-small">
                                        <i className="fas fa-trash"></i>
                                    </span>&nbsp;
                                    Delete
                                </a>
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>;
    }

    private goToSetDashboard() {
        this.props.goToSet(this.props.set.id);
    }
}
