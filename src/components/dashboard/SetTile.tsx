import * as React from "react";
import { SetSection } from "../../containers/SetContainer";
import IFlashCardSet from "../../lib/flashcard/FlashCardSet";
import IRemote from "../../lib/remote";
import FadeTransition from "../transition/FadeTransition";
import SlideTransition from "../transition/SlideTransition";

interface ISetTileProps {
    set: IRemote<IFlashCardSet>;
    setId: string;
    goToSet: (setId: string, section: SetSection) => void;
}

export default class SetTile extends React.Component<ISetTileProps> {
    private transition: "slide" | "fade" = "fade";
    constructor(props: ISetTileProps) {
        super(props);
        // Set initial state
        this.state = { };
    }

    public render() {
        if (this.props.set.isFetching || this.props.set.value === undefined) {
            // Do a slide transition if a loader was shown
            this.transition = "slide";
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
                            <a href="#" className="button is-primary" onClick={this.goToStudy.bind(this)}>
                                <span className="icon is-small">
                                    <i className="fas fa-book"></i>
                                </span>&nbsp;
                                Study
                            </a>
                        </p>
                        <p className="control">
                            <a href="#" className="button" onClick={this.goToEdit.bind(this)}>
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

        if (this.transition === "slide") {
            return <div className="column is-3-desktop is-6-tablet set-tile">
                <div className="card">
                    <SlideTransition targetState={"expanded"}>{cardContent}</SlideTransition>
                </div>
            </div>;
        } else {
            return <div className="column is-3-desktop is-6-tablet set-tile">
                <div className="card">
                    <FadeTransition targetState={"visible"}>{cardContent}</FadeTransition>
                </div>
            </div>;
        }
    }

    private goToStudy() {
        this.props.goToSet(this.props.setId, SetSection.Study);
    }

    private goToEdit() {
        this.props.goToSet(this.props.setId, SetSection.Edit);
    }
}
