import * as React from "react";
import IFlashCard from "../../lib/flashcard/flashcard";
import { ICardStudyData } from "../../lib/flashcard/StudyData";
import * as Study from "../../lib/study";
import PresentedCardFace from "./PresentedCardFace";

interface IPresentedCardProps {
    card: IFlashCard;
    studyData: ICardStudyData;
    updateStudyData: (data: ICardStudyData, nextCard: boolean) => void;
    nextCard: () => void;
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

    public componentWillReceiveProps(newProps: IPresentedCardProps) {
        if (newProps.card.id !== this.props.card.id) {
            // Hide the back whenever the card is changed
            this.setState({ showBack: false });
        }
    }

    public render() {
        return <div className="container">
                <div className="card">
                <div className="card-content content">
                    <PresentedCardFace face={this.props.card.faces.front}/>
                </div>
                { this.state.showBack && <hr className="is-marginless" />}
                { this.state.showBack && <div className="card-content content">
                    <PresentedCardFace face={this.props.card.faces.back}/>
                </div> }
            </div>

            { /* Button below card */ }
            { this.state.showBack
            ? <div>
                <p>How well did you remember this card?</p>
                <div className="buttons">
                    <a className="button" onClick={this.evaluateCard(Study.CardEvaluation.Poor).bind(this)}>
                        Poor (3 min)
                    </a>
                    <a className="button" onClick={this.evaluateCard(Study.CardEvaluation.Decent).bind(this)}>
                        Decent (10 min)
                    </a>
                    <a className="button" onClick={this.evaluateCard(Study.CardEvaluation.Good).bind(this)}>
                        Good (2 days)
                    </a>
                    <a className="button" onClick={this.evaluateCard(Study.CardEvaluation.VeryGood).bind(this)}>
                        Very Good (4 days)
                    </a>
                </div>
            </div>
            : <div className="buttons">
                <a className="button" onClick={this.flipCard.bind(this)}>Flip Card</a>
            </div>
             }
        </div>;
    }

    private flipCard() {
        this.setState({ showBack: !this.state.showBack });
    }

    private evaluateCard(evaluation: Study.CardEvaluation) {
        return (() => {
            const newData = Study.updateCardStudyData(this.props.card.id, this.props.studyData, evaluation);
            this.props.updateStudyData(newData, true);
        }).bind(this);
    }
}
