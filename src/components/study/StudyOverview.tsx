import * as React from "react";
import IFlashCardSet from "../../lib/flashcard/FlashCardSet";
import { ISetStudyData } from "../../lib/flashcard/StudyData";
import * as Study from "../../lib/study";
import * as Utils from "../../lib/utils";

interface IStudyOverviewProps {
    set: IFlashCardSet;
    studyData: ISetStudyData;
    maxNewCards: number;
    maxTotalCards: number;

    startStudy?: (deck: string[]) => void;
}

export default class StudyOverview extends React.Component<IStudyOverviewProps> {
    public render() {
        const newCardIds = Study.getNewCardIds(this.props.set.cards, this.props.studyData);
        const knownCardIds = Study.getKnownCardIds(this.props.set.cards, this.props.studyData);
        const newCardsInStudy = Math.min(newCardIds.length, this.props.maxNewCards);
        const knownCardsInStudy = Math.min(knownCardIds.length, this.props.maxTotalCards - newCardsInStudy);
        const p = Utils.plural;

        return <div className="columns">
            <div className="column">
                <h1 className="title is-3">Study {this.props.set.name} now</h1>

                <p className="subtitle is-6">Last studied <time>never</time></p>
                <p>
                    This study section will include {newCardsInStudy} new {p("card", newCardsInStudy)}&#32;
                    and {knownCardsInStudy} known {p("card", knownCardsInStudy)}.
                </p>
                <a href="#" className="button is-large is-primary" onClick={this.handleStartClick.bind(this)}>
                    Study Now
                </a>
            </div>

            <div className="column">
                <h2 className="title is-3">Current progress:</h2>
                <p>{newCardIds.length} cards are <span title="These cards have not been studied before">new</span></p>
                <p>{knownCardIds.length} cards are ready for <span className="title is-1" title="REPL">review</span></p>
            </div>
        </div>;
    }

    private handleStartClick() {
        const deck = Study.selectStudyDeck(this.props.studyData,
            this.props.maxNewCards,
            this.props.maxTotalCards,
            this.props.set.cards);

        if (this.props.startStudy !== undefined) {
            this.props.startStudy(deck);
        }
    }
}
