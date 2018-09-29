import * as React from "react";
import IFlashCard from "../../lib/flashcard/flashcard";
import PresentedCardFace from "./PresentedCardFace";

interface IPresentedCardProps {
    showBack: boolean;
    card: IFlashCard;
}

export default class PresentedCard extends React.Component<IPresentedCardProps> {
    constructor(props: IPresentedCardProps) {
        super(props);
    }

    public render() {
        return <div className="card">
            <div className="card-content">
                <PresentedCardFace face={this.props.card.faces.front}/>
            </div>
            { this.props.showBack && <div className="card-content">
                <PresentedCardFace face={this.props.card.faces.back}/>
            </div> }
        </div>;
    }
}
