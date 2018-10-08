import * as React from "react";
import { SetSection } from "../../containers/SetContainer";
import IFlashCardSet, { ExportFlashCardSet } from "../../lib/flashcard/FlashCardSet";
import { ICardStudyData, ISetStudyData } from "../../lib/flashcard/StudyData";
import * as Study from "../../lib/study";
import * as Utils from "../../lib/utils";
import PresentedCard from "./PresentedCard";
import StudyOverview from "./StudyOverview";

interface IStudySectionProps {
    set: IFlashCardSet;
    studyData: ISetStudyData;
    resetSessionStudyData: () => void;
    updateCardStudyData: (studyData: ICardStudyData) => void;
    goToSection: (section: SetSection) => void;
}

interface IStudySession {
    deck: string[];
    currentCardId: string;
}

interface IStudySectionState {
    currentSession?: IStudySession;
}

export default class StudySection extends React.Component<IStudySectionProps, IStudySectionState> {
    // TODO: Make these parameters variable
    private StudyMaxNewCards: number = 20;
    private StudyMaxTotalCards: number = 40;

    constructor(props: IStudySectionProps) {
        super(props);
        this.state = { };
    }

    public render() {
        if (this.state.currentSession === undefined) {
            return <div className="container">
                <StudyOverview set={this.props.set}
                    studyData={this.props.studyData}
                    maxNewCards={this.StudyMaxNewCards}
                    maxTotalCards={this.StudyMaxTotalCards}
                    startStudy={this.startStudy.bind(this)}
                    goToSetEditor={() => this.props.goToSection(SetSection.Edit)}/>
            </div>;
        } else {
            const card = this.props.set.cards[this.state.currentSession.currentCardId];
            return <div className="container">
                <p>{this.state.currentSession.deck.length}&#32;
                    {Utils.plural("card", this.state.currentSession.deck.length)} left</p>
                <PresentedCard
                        studyData={this.props.studyData.cardData[this.state.currentSession.currentCardId]}
                        card={card.value()}
                        updateStudyData={this.updateCardStudyData.bind(this)}
                        nextCard={this.nextCard.bind(this)} />
            </div>;
        }
    }

    private startStudy(deck: string[]) {
        const currentCardId = Study.drawCard(deck, this.props.studyData);
        this.setState({
            currentSession: {
                deck,
                currentCardId,
            },
        });
        // Make sure no temporary data is left from previous study session
        this.props.resetSessionStudyData();
    }

    private updateCardStudyData(studyData: ICardStudyData, nextCard: boolean) {
        let newSession: IStudySession | undefined = this.state.currentSession;
        if (this.state.currentSession !== undefined && studyData.removeFromDeck) {
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
        if (updatedCardStudyData !== undefined) {
            studyData = {
                ...studyData,
                cardData: {
                    ...studyData.cardData,
                    [updatedCardStudyData.cardId]: updatedCardStudyData,
                },
            };
        }
        this.setState({
            currentSession: {
                ...session,
                currentCardId: Study.drawCard(session.deck, studyData, session.currentCardId),
            },
        });
    }
}
