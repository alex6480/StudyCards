import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Dispatch } from "redux";
import IFlashCardSet, { ExportFlashCardSet } from "../../lib/flashcard/FlashCardSet";
import { ICardStudyData, ISetStudyData } from "../../lib/flashcard/StudyData";
import IRemote from "../../lib/remote";
import { Storage } from "../../lib/storage/StorageProvider";
import * as Study from "../../lib/study";
import * as Utils from "../../lib/utils";
import { IAppState } from "../../reducers";
import { Action } from "../../reducers/actions";
import SetHeader from "../SetHeader";
import SetLoader from "../SetLoader";
import SetNav from "../SetNav";
import SetNotFound from "../SetNotFound";
import PresentedCard from "./PresentedCard";
import StudyOverview from "./StudyOverview";

interface IStudySectionOwnProps {
    setId: string;
}

interface IStudySectionStateProps extends RouteComponentProps<IStudySectionOwnProps> {
    setId: string;
    set?: IRemote<IFlashCardSet>;
    studyData: IRemote<ISetStudyData>;
}

interface IStudySectionDispatchProps {
    resetSessionStudyData: () => void;
    updateCardStudyData: (studyData: ICardStudyData) => void;
    getSetStudyData: (setId: string) => void;
    loadCards: (setId: string, cardIds: string[]) => void;
    loadSetMetaAll: () => void;
}

interface IStudySectionProps extends IStudySectionOwnProps, IStudySectionStateProps, IStudySectionDispatchProps { }

interface IStudySession {
    deck: string[];
    currentCardId: string;
}

interface IStudySectionState {
    currentSession?: IStudySession;
}

class StudySection extends React.Component<IStudySectionProps, IStudySectionState> {
    // TODO: Make these parameters variable
    private StudyMaxNewCards: number = 20;
    private StudyMaxTotalCards: number = 40;

    constructor(props: IStudySectionProps) {
        super(props);
        this.state = { };
    }

    public componentWillMount() {
        // Refresh study data
        try {
            this.props.getSetStudyData(this.props.setId);
        } catch (err) {
            // Could not get study data for the set.
            // This is ignored, since it means the set doesn't exist, which is handled elsewhere
        }
        if (this.props.set === undefined) {
            this.props.loadSetMetaAll();
        }
    }

    public render() {
        return <div>
            <SetHeader setId={this.props.setId} />
            <SetNav setId={this.props.setId} activePage="edit" />
            <section className="section">
                {this.renderContent()}
            </section>
        </div>;
    }

    private renderContent() {
        if (this.props.set === undefined) {
            // No set with the specified id exists
            return <SetNotFound setId={this.props.setId} />;
        } else if (this.props.set.value === undefined
                || this.props.studyData.value === undefined
                || this.state.currentSession === undefined) {
            // A session can never be started when set or studydata is unavailable
            // The extra parts to the if statement are just to satisfy the type checker
            return <div className="container">
                <StudyOverview set={this.props.set}
                    studyData={this.props.studyData}
                    maxNewCards={this.StudyMaxNewCards}
                    maxTotalCards={this.StudyMaxTotalCards}
                    startStudy={this.startStudy.bind(this)} />
            </div>;
        } else {
            const card = this.props.set.value.cards[this.state.currentSession.currentCardId];
            return <div className="container">
                <p>{this.state.currentSession.deck.length}&#32;
                    {Utils.plural("card", this.state.currentSession.deck.length)} left</p>
                <PresentedCard
                        studyData={this.props.studyData.value.cardData[this.state.currentSession.currentCardId]}
                        card={card}
                        updateStudyData={this.updateCardStudyData.bind(this)}
                        nextCard={this.nextCard.bind(this)} />
            </div>;
        }
    }

    private startStudy(deck: string[]) {
        if (this.props.studyData.isFetching || this.props.studyData.value === undefined) {
            throw new Error("Study can only be started when an up to date study data is available");
        }

        const currentCardId = Study.drawCard(deck, this.props.studyData.value);
        this.setState({
            currentSession: {
                deck,
                currentCardId,
            },
        });

        // Fetch the deck from the remote source
        this.props.loadCards(this.props.setId, deck);

        // Make sure no temporary data is left from previous study session
        this.props.resetSessionStudyData();
    }

    private updateCardStudyData(studyData: ICardStudyData, nextCard: boolean) {
        let newSession: IStudySession | undefined = this.state.currentSession;
        if (this.state.currentSession !== undefined && studyData.removeFromSession) {
            // Remove the card from the deck, if it the due date has been increased
            newSession = {
                ...this.state.currentSession,
                deck: this.state.currentSession.deck.filter(d => d !== studyData.cardId),
            };

            if (newSession.deck.length > 0) {
                this.setState({ currentSession: newSession });
            } else {
                // Stop the study session if the deck is empty
                this.setState({ currentSession: undefined });
            }
        }
        this.props.updateCardStudyData(studyData);

        if (nextCard) {
            if (newSession === undefined) {
                throw new Error("nextCard cannot be true when a study session is not active");
            }
            this.nextCard(studyData, newSession);
        }
    }

    private nextCard(updatedCardStudyData?: ICardStudyData,
                     session: IStudySession | undefined = this.state.currentSession) {
        if (session === undefined) {
            throw new Error("Cannot show the next card, when no study session is active");
        }

        let studyData = this.props.studyData;
        if (studyData.value === undefined || studyData.isFetching === true) {
            throw new Error("Cannot get next card when study data is not up to date");
        }

        if (updatedCardStudyData !== undefined) {
            studyData = {
                ...studyData,
                value: {
                    ...studyData.value,
                    cardData: {
                        ...studyData.value.cardData,
                        [updatedCardStudyData.cardId]: updatedCardStudyData,
                    },
                },
            };
        }
        this.setState({
            currentSession: {
                ...session,
                currentCardId: Study.drawCard(session.deck, studyData.value!, session.currentCardId),
            },
        });
    }
}

function mapStateToProps(state: IAppState, ownProps: RouteComponentProps<IStudySectionOwnProps>):
    IStudySectionStateProps {

    const setId = ownProps.match.params.setId;
    let set: IRemote<IFlashCardSet> | undefined;
    if (state.sets.isFetching === false && state.sets.value === undefined) {
        // Return an undefined set, so the component will attempt to fetch it
        set = undefined;
    } else {
        set = state.sets.value === undefined
            ? { isFetching: true, value: undefined }
            : state.sets.value[setId];
    }

    return {
        ...ownProps,
        setId,
        set,
        studyData: state.studyData[setId] !== undefined
                    ? state.studyData[setId]
                    : { isFetching: false, value: undefined },
    };
}

function mapDispatchToProps(dispatch: Dispatch): IStudySectionDispatchProps {
    return {
        getSetStudyData: (setId: string) => dispatch<any>(Storage.loadSetStudyData(setId)),
        resetSessionStudyData: () => dispatch(Action.resetSessionStudyData()),
        updateCardStudyData: (studyData: ICardStudyData) => dispatch(Action.updateCardStudyData(studyData)),
        loadCards: (setId: string, cardIds: string[]) => dispatch<any>(Storage.loadCards(setId, cardIds)),
        loadSetMetaAll: () => dispatch<any>(Storage.loadSetMetaAll()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(StudySection);

