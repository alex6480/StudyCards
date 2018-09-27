import * as React from 'react';
import FlashCardSet from '../../lib/flashcard/FlashCardSet';
import { SetStudyData } from '../../lib/flashcard/StudyData';
import * as Study from '../../lib/study';

interface StudyOverviewProps {
    set: FlashCardSet,
    studyData: SetStudyData,
    maxNewCards: number,
    maxTotalCards: number,

    startStudy?: (deck: string[]) => void
}

export default class StudyOverview extends React.Component<StudyOverviewProps> {
    private handleStartClick () {
        let deck = Study.selectStudyDeck(this.props.studyData, this.props.maxNewCards, this.props.maxTotalCards, this.props.set.cards);
        if (this.props.startStudy != undefined) {
            this.props.startStudy(deck);
        }
    }

    render () {
        let newCardIds = Study.getNewCardIds(this.props.set.cards, this.props.studyData);
        let knownCardIds = Study.getKnownCardIds(this.props.set.cards, this.props.studyData);
        let newCardsInStudy = Math.min(newCardIds.length, this.props.maxNewCards);
        let knownCardsInStudy = Math.min(knownCardIds.length, this.props.maxTotalCards - newCardsInStudy);

        return <div className="columns">
            <div className="column">
                <h1 className="title is-3">Study {this.props.set.name} now</h1>

                <p className="subtitle is-6">Last studied <time>never</time></p>
                <p>
                    This study section will include {newCardsInStudy} new
                    card{newCardsInStudy == 1 ? "" : "s"} and {knownCardsInStudy} known card{knownCardsInStudy == 1 ? "" : "s"}.
                </p>
                <a href="#" className="button is-primary" onClick={this.handleStartClick.bind(this)}>Study Now</a>
            </div>

            <div className="column">
                <h2 className="title is-3">Current progress:</h2>
                <p>{newCardIds.length} cards are <span title="These cards have not been studied before">new</span></p>
                <p>{knownCardIds.length} cards are ready for <span title="You've seen these cards before, but they might need refreshing">review</span></p>
            </div>
        </div>
    }
}