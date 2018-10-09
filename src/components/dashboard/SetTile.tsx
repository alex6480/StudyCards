import * as React from "react";
import IFlashCardSet from "../../lib/flashcard/FlashCardSet";
import IRemote from "../../lib/remote";
import FadeTransition from "../transition/FadeTransition";

interface ISetTileProps {
    set: IRemote<IFlashCardSet>;
    setId: string;
    goToSet: (setId: string) => void;
}

export default class SetTile extends React.Component<ISetTileProps> {
    private doTransition = false;
    constructor(props: ISetTileProps) {
        super(props);
        // Set initial state
        this.state = { };
    }

    public render() {
        if (this.props.set.isFetching || this.props.set.value === undefined) {
            // Only do a transition if a card has been loading
            this.doTransition = true;
            return <div className="column is-3">
                <div className="card">
                    <div className="card-content">
                        Loading
                    </div>
                </div>
            </div>;
        }

        const cardCount = this.props.set.value.cardOrder.length;
        const cardContent = <>
            <div className="card-content">
                <p className="title is-4">{this.props.set.value.name}</p>
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
        </>;

        if (this.doTransition) {
            return <div className="column is-3 set-tile">
                <div className="card">
                    <FadeTransition targetState={"visible"}>{cardContent}</FadeTransition>
                </div>
            </div>;
        } else {
            return <div className="column is-3 set-tile">
                <div className="card">
                    {cardContent}
                </div>
            </div>;
        }
    }

    private goToSetDashboard() {
        this.props.goToSet(this.props.setId);
    }
}
