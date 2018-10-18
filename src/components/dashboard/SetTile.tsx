import { History } from "history";
import * as React from "react";
import { Link } from "react-router-dom";
import IFlashCardSet from "../../lib/flashcard/FlashCardSet";
import IRemote from "../../lib/remote";
import { SetSection } from "../SetContainer";
import FadeTransition from "../transition/FadeTransition";
import ResizeTransition from "../transition/ResizeTransition";
import SlideTransition from "../transition/SlideTransition";

interface ISetTileProps {
    set: IRemote<IFlashCardSet>;
    setId: string;
}

export default class SetTile extends React.Component<ISetTileProps> {
    constructor(props: ISetTileProps) {
        super(props);
        // Set initial state
        this.state = { };
    }

    public render() {
        let content: JSX.Element;
        let isPlaceholder: boolean;
        if (this.props.set.isFetching || this.props.set.value === undefined) {
            isPlaceholder = true;
            content = <>
                <div className="card-content">
                    <p className="title is-4"><span className="placeholder-text" style={{width: "60%"}}></span></p>
                    <p className="subtitle is-6"><span className="placeholder-text"></span></p>
                    <p>
                        <span className="placeholder-text"></span>
                        <span className="placeholder-text"></span>
                    </p>
                    <div style={{height: "61px"}}></div>
                </div>
            </>;
        } else {
            const cardCount = this.props.set.value.cardOrder.length;
            isPlaceholder = false;
            content = <>
                <div className="card-content">
                    <p className="title is-4">{this.props.set.value.name}</p>
                    <p className="subtitle is-6">{cardCount} {cardCount === 1 ? "card" : "cards"} (26 due today)</p>
                    <p>Last studied <time>September 5th 2018</time></p>
                </div>
                <footer className="card-footer">
                    <div className="card-footer-item">
                        <div className="field has-addons">
                            <p className="control">
                                <Link href="#" className="button is-primary" to={"/set/" + this.props.setId + "/study"}>
                                    <span className="icon is-small">
                                        <i className="fas fa-book"></i>
                                    </span>&nbsp;
                                    Study
                                </Link>
                            </p>
                            <p className="control">
                                <Link href="#" className="button" to={"/set/" + this.props.setId + "/edit"}>
                                    <span className="icon is-small">
                                        <i className="fas fa-pen"></i>
                                    </span>&nbsp;
                                    Edit
                                </Link>
                            </p>
                        </div>
                    </div>
                </footer>
            </>;
        }

        return <div className="column is-3-desktop is-6-tablet set-tile">
            <div className="card">
                { /* Pause transition for placeholders*/ }
                <ResizeTransition doTransition={! isPlaceholder}>
                    <FadeTransition from={isPlaceholder ? "visible" : "hidden"} to={"visible"}>
                        {content}
                    </FadeTransition>
                </ResizeTransition>
            </div>
        </div>;
    }
}
