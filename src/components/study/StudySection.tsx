import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Dispatch } from "redux";
import IFlashCardSet, { ExportFlashCardSet, IFlashCardFilter } from "../../lib/flashcard/FlashCardSet";
import { ICardStudyData, ISetStudyData } from "../../lib/flashcard/StudyData";
import { IStudyState } from "../../lib/flashcard/StudyState";
import IRemote, { EmptyRemote } from "../../lib/remote";
import { Storage } from "../../lib/storage/StorageProvider";
import * as Study from "../../lib/study";
import * as Utils from "../../lib/utils";
import { IAppState } from "../../reducers";
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
    setId: number;
    set?: IRemote<IFlashCardSet>;
    studyState: IRemote<IStudyState>;
}

interface IStudySectionDispatchProps {
    loadCards: (setId: number, cardIds: string[]) => void;
    loadSetMetaAll: () => void;
    loadStudyState: (setId: number) => void;
    beginStudy: (options: Study.IStudySessionOptions) => void;
    evaluateCard: (cardId: string, evaluation: Study.CardEvaluation) => void;
    filterCards: (setId: number, filter: IFlashCardFilter) => void;
}

interface IStudySectionProps extends IStudySectionStateProps, IStudySectionDispatchProps { }

class StudySection extends React.Component<IStudySectionProps, {}> {
    constructor(props: IStudySectionProps) {
        super(props);
        this.state = { };
    }

    public componentWillMount() {
        // Refresh set data
        if (this.props.set === undefined) {
            this.props.loadSetMetaAll();
        }

        // Fetch the study state for the specified set
        this.props.loadStudyState(this.props.setId);
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
                || this.props.studyState.value === undefined
                || this.props.studyState.value.currentSession === null) {
            // The study overview handles missing data
            return <div className="container">
                <StudyOverview set={this.props.set}
                    studyState={this.props.studyState}
                    startStudySession={this.startStudy.bind(this)}
                    filterCards={filter => this.props.filterCards(this.props.setId, filter)}/>
            </div>;
        } else {
            const currentSession = this.props.studyState.value.currentSession;
            const card = this.props.set.value.cards[currentSession.currentCardId];
            return <div className="container">
                <p>{currentSession.deck.length}&#32;
                    {Utils.plural("card", currentSession.deck.length)} left</p>
                { currentSession.updating
                    ? <PresentedCard card={EmptyRemote()} />
                    : <PresentedCard card={card} evaluateCard={this.evaluateCard.bind(this)}/>
                }
            </div>;
        }
    }

    private startStudy(options: Study.IStudySessionOptions) {
        if (this.props.studyState.isFetching || this.props.studyState.value === undefined) {
            throw new Error("Study can only be started when an up to date study data is available");
        }

        this.props.beginStudy(options);
    }

    private evaluateCard(evaluation: Study.CardEvaluation) {
        this.props.evaluateCard(this.props.studyState.value!.currentSession!.currentCardId, evaluation);
    }
}

function mapStateToProps(state: IAppState, ownProps: RouteComponentProps<IStudySectionOwnProps>):
    IStudySectionStateProps {

    const setId = Number(ownProps.match.params.setId);
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
        studyState: state.studyState,
    };
}

function mapDispatchToProps(dispatch: Dispatch): IStudySectionDispatchProps {
    return {
        loadCards: (setId: number, cardIds: string[]) => dispatch<any>(Storage.loadCards(setId, cardIds)),
        loadSetMetaAll: () => dispatch<any>(Storage.loadSetMetaAll()),
        loadStudyState: (setId: number) => dispatch<any>(Storage.loadStudyState(setId)),
        beginStudy: (options: Study.IStudySessionOptions) => dispatch<any>(Storage.beginStudySession(options)),
        evaluateCard: (cardId: string, evaluation: Study.CardEvaluation) =>
            dispatch<any>(Storage.evaluateCard(cardId, evaluation)),
        filterCards: (setId: number, filter: IFlashCardFilter) =>
            dispatch<any>(Storage.filterCards(setId, filter)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(StudySection);

