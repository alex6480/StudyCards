import * as React from "react";
import IFlashCardSet from "../../lib/flashcard/FlashCardSet";
import { ISetStudyData } from "../../lib/flashcard/StudyData";
import IRemote from "../../lib/remote";
import * as Study from "../../lib/study";
import * as Utils from "../../lib/utils";
import Tooltip from "../Tooltip";
import FadeTransition from "../transition/FadeTransition";
import ResizeTransition from "../transition/ResizeTransition";

interface IStudyOverviewProps {
    set: IRemote<IFlashCardSet>;
    studyData?: IRemote<ISetStudyData>;
    maxNewCards: number;
    maxTotalCards: number;

    startStudy?: (deck: string[]) => void;
    goToSetEditor: () => void;
}

export default class StudyOverview extends React.Component<IStudyOverviewProps> {
    public render() {
        if (this.props.set.value === undefined || this.props.set.isFetching
            || this.props.studyData === undefined || this.props.studyData.value === undefined
            || this.props.studyData.isFetching) {
            return <div className="columns">
                <div className="column">
                    <div className="card">
                    {this.animateCardContent(true,
                        <div className="card-content">
                            Loading
                        </div>,
                    )}
                    </div>
                </div>
                <div className="column">
                    <div className="card">
                    {this.animateCardContent(true,
                        <div className="card-content">
                            Loading
                        </div>,
                    )}
                    </div>
                </div>
            </div>;
        }

        const newCardIds = Study.getNewCardIds(this.props.set.value.cardOrder, this.props.studyData.value);
        const knownCardIds = Study.getKnownCardIds(this.props.set.value.cardOrder, this.props.studyData.value);
        const newCardsInStudy = Math.min(newCardIds.length, this.props.maxNewCards);
        const knownCardsInStudy = Math.min(knownCardIds.length, this.props.maxTotalCards - newCardsInStudy);
        const p = Utils.plural;

        return <div className="columns same-height">
            <div className="column">
                <div className="card">
                {this.animateCardContent(false,
                    <div className="card-content">
                        <p className="title is-4">Begin Study</p>
                        {this.props.set.value.cardOrder.length === 0  ? <>
                            { /* There are no cards in this set */ }
                            <p className="subtitle is-6">This set contains no cards.</p>
                            <div className="buttons">
                                <button className="button is-primary" disabled>
                                    Study Now
                                </button>
                                <a className="button is-info" onClick={this.props.goToSetEditor}>
                                    Add cards
                                </a>
                            </div>
                        </> : <>
                            { /* The set contains cards*/ }
                            <p className="subtitle is-6">Last studied <time>never</time></p>
                            <p>
                                This study section will include {newCardsInStudy} new {p("card", newCardsInStudy)}&#32;
                                and {knownCardsInStudy} known {p("card", knownCardsInStudy)}.
                            </p>
                            <a href="#" className="button is-primary" onClick={this.handleStartClick.bind(this)}>
                                Study Now
                            </a>
                        </> }
                    </div>,
                )}
                </div>
            </div>

            <div className="column">
                <div className="card">
                {this.animateCardContent(false,
                    <div className="card-content">
                        <h2 className="title is-4">Current progress:</h2>
                        <p>{newCardIds.length} cards are&#32;
                            <Tooltip message="These cards have never been studied before">
                                <span className="tag">new</span>
                            </Tooltip>
                        </p>
                        <p>{knownCardIds.length} cards are ready for&#32;
                            <Tooltip message="It's been some time since you've last studied these cards">
                                <span className="tag">review</span>
                            </Tooltip>
                        </p>
                    </div>,
                )}
                </div>
            </div>
        </div>;
    }

    private animateCardContent(isPlaceholder: boolean, content: JSX.Element) {
        // Placeholders just pop into place, while the real content animates
        return <ResizeTransition doTransition={! isPlaceholder}>
            <FadeTransition from={isPlaceholder ? "visible" : "hidden"} to={"visible"}>
                {content}
            </FadeTransition>
        </ResizeTransition>;
    }

    private handleStartClick() {
        const deck = Study.selectStudyDeck(this.props.studyData!.value!,
            this.props.maxNewCards,
            this.props.maxTotalCards,
            this.props.set.value!.cardOrder);

        if (this.props.startStudy !== undefined) {
            this.props.startStudy(deck);
        }
    }
}
