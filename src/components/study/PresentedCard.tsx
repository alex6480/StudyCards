import * as React from "react";
import IFlashCard from "../../lib/flashcard/flashcard";
import { ICardStudyData } from "../../lib/flashcard/StudyData";
import IRemote from "../../lib/remote";
import * as Study from "../../lib/study";
import Tooltip from "../Tooltip";
import PresentedCardFace from "./PresentedCardFace";

interface IPresentedCardProps {
    card?: IRemote<IFlashCard>;
    evaluateCard: (evaluation: Study.CardEvaluation) => void;
}

interface IPresentedCardState {
    showBack: boolean;
}

export default class PresentedCard extends React.Component<IPresentedCardProps, IPresentedCardState> {
    constructor(props: IPresentedCardProps) {
        super(props);

        this.state = {
            showBack: false,
        };
    }

    public render() {
        if (this.props.card === undefined || this.props.card.value === undefined) {
            return <div className="card">
                <div className="card-content content">
                    <p>Loading</p>
                </div>
            </div>;
        }

        return <React.Fragment>
                <div className="card">
                    <div className="card-content content">
                        <PresentedCardFace face={this.props.card.value.faces.front}/>
                    </div>
                    { this.state.showBack && <hr className="is-marginless" />}
                    { this.state.showBack && <div className="card-content content">
                        <PresentedCardFace face={this.props.card.value.faces.back}/>
                    </div> }
            </div>

            { /* Button below card */ }
            { this.state.showBack
            ? <div>
                <br />
                <p className="title is-5">How good is your memory of this card?</p>
                <div className="buttons">
                    <a className="button" onClick={() => this.evaluateCard(Study.CardEvaluation.Poor)}>
                        Poor
                    </a>
                    <a className="button" onClick={() => this.evaluateCard(Study.CardEvaluation.Decent)}>
                        Decent
                    </a>
                    <a className="button" onClick={() => this.evaluateCard(Study.CardEvaluation.Good)}>
                        Good
                    </a>
                </div>
                <p>
                    <strong>Poor:</strong> You did not remember this card at all,
                    or missed important details of the card. You will be shown the card again this session.
                </p>
                <p>
                    <strong>Decent:</strong> You mostly know this card, but would like to study it again this session.
                </p>
                <p>
                    <strong>Good:</strong> You know everything on the card. When you select this option,
                    you will not see this card again this study session.
                </p>
            </div>
            : <div className="buttons">
                <a className="button" onClick={this.flipCard.bind(this)}>Flip Card</a>
            </div>
             }
        </React.Fragment>;
    }

    private flipCard() {
        this.setState({ showBack: !this.state.showBack });
    }

    private evaluateCard(evaluation: Study.CardEvaluation) {
        this.props.evaluateCard(evaluation);
    }
}
