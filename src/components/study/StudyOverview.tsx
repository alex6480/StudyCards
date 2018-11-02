import * as React from "react";
import { Link } from "react-router-dom";
import IFlashCardSet, { IFlashCardFilter } from "../../lib/flashcard/FlashCardSet";
import { ISetStudyData } from "../../lib/flashcard/StudyData";
import { IStudyState } from "../../lib/flashcard/StudyState";
import IRemote from "../../lib/remote";
import * as Study from "../../lib/study";
import * as Utils from "../../lib/utils";
import { TagFilter } from "../set-card-editor/TagFilter";
import { Slider } from "../Slider";
import Tooltip from "../Tooltip";
import FadeTransition from "../transition/FadeTransition";
import ResizeTransition from "../transition/ResizeTransition";

interface IStudyOverviewProps {
    set: IRemote<IFlashCardSet>;
    studyState: IRemote<IStudyState>;
    startStudySession: (options: Study.IStudySessionOptions) => void;
    filterCards: (filter: IFlashCardFilter) => void;
}

interface IStudyOverviewState {
    countNewCards: number;
    countKnownCards: number;
}

export default class StudyOverview extends React.Component<IStudyOverviewProps, IStudyOverviewState> {
    public constructor(props: IStudyOverviewProps) {
        super(props);
        this.state = {
            countNewCards: Study.MAX_NEW_CARDS,
            countKnownCards: Study.MAX_TOTAL_CARDS - Study.MAX_NEW_CARDS,
        };
    }

    public render() {
        if (this.props.set.value === undefined || this.props.set.isFetching
            || this.props.studyState.value === undefined || this.props.studyState.isFetching) {
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

        const newCardIds = this.props.studyState.value.newCardIds;
        const knownCardIds = this.props.studyState.value.knownCardIds;
        const newCardsInStudy = Math.min(newCardIds.length, Study.MAX_NEW_CARDS);
        const knownCardsInStudy = Math.min(knownCardIds.length, Study.MAX_TOTAL_CARDS - newCardsInStudy);
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
                                <Link className="button is-info" to={"/set/" + this.props.set.value.id + "/edit"}>
                                    Add cards
                                </Link>
                            </div>
                        </> : <>
                            { /* The set contains cards*/ }

                            { /* Filter which cards will be in the set*/ }
                            <div className="field">
                                <label className="label">Only include cards with the following tags:</label>
                                <div className="control">
                                    <TagFilter tags={this.props.set.value!.availableTags}
                                        activeTags={this.props.set.value!.filter.tags}
                                        toggleTag={this.toggleTag.bind(this)}
                                        offStyle="" />
                                </div>
                            </div>

                            { /* Chose the number of cards*/ }
                            <div className="field">
                                <label className="label">New Cards</label>
                                <Slider currentPosition={this.state.countNewCards}
                                    showDirectInput={true}
                                    onDrag={newPos => this.setState({countNewCards: Math.round(newPos)})}
                                    sections={[{ from: 0, to: newCardIds.length, color: "#1B82C3"}]}>
                                </Slider>
                            </div>
                            <div className="field">
                                <label className="label">Known Cards</label>
                                <Slider currentPosition={this.state.countKnownCards}
                                    showDirectInput={true}
                                    onDrag={newPos => this.setState({countKnownCards: Math.round(newPos)})}
                                    sections={[{ from: 0, to: knownCardIds.length * 0.5, color: "#1B82C3"},
                                    { from: knownCardIds.length * 0.5, to: knownCardIds.length, color: "#2854bc"}]}>
                                </Slider>
                            </div>

                            {/* Summary of the study session */}
                            <p>
                                This study session will include {this.state.countNewCards} new
                                &#32;{p("card", newCardsInStudy)} and {this.state.countKnownCards}&#32;
                                known {p("card", knownCardsInStudy)}.
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
                        <p>Last studied <time>never</time></p>
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

    private toggleTag(tag: string) {
        const set = this.props.set!.value!;
        let newTags: { [tag: string]: boolean };
        if (set.filter.tags[tag] === true) {
            // Create a new object where this tag is not present
            const { [tag]: removedTagValue, ...tagsWithTagRemoved} = set.filter.tags;
            newTags = tagsWithTagRemoved;
        } else {
            newTags = {...set.filter.tags, [tag]: true };
        }

        this.props.filterCards({
            ...set.filter,
            tags: newTags,
        });
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
        this.props.startStudySession({
            countNewCards: this.state.countNewCards,
            countKnownCards: this.state.countKnownCards,
            filter: this.props.set.value!.filter,
        });
    }
}
