import * as React from "react";
import IFlashCard from "../../lib/flashcard/flashcard";
import IFlashCardSet, { ExportFlashCardSet } from "../../lib/flashcard/FlashCardSet";
import { ICardStudyData, ISetStudyData } from "../../lib/flashcard/StudyData";
import * as Study from "../../lib/study";
import PresentedCard from "./PresentedCard";
import StudyOverview from "./StudyOverview";

interface IStudySectionProps {
    set: IFlashCardSet;
    studyData: ISetStudyData;
    resetSessionStudyData: () => void;
    updateCardStudyData: (studyData: ICardStudyData) => void;
}

interface IStudySectionState {
    studyDeck?: string[];
    currentCardId?: string;
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
        if (this.state.currentCardId === undefined) {
            return <div className="container">
                <StudyOverview set={this.props.set}
                    studyData={this.props.studyData}
                    maxNewCards={this.StudyMaxNewCards}
                    maxTotalCards={this.StudyMaxTotalCards}
                    startStudy={this.startStudy.bind(this)} />
            </div>;
        } else {
            const card = this.props.set.cards[this.state.currentCardId];
            return <PresentedCard
                        studyData={this.props.studyData.cardData[this.state.currentCardId]}
                        card={card}
                        updateStudyData={this.updateCardStudyData.bind(this)}
                        nextCard={this.nextCard.bind(this)} />;
        }
    }

    private startStudy(deck: string[]) {
        const currentCardId = Study.drawCard(deck, this.props.studyData);
        this.setState({
            studyDeck: deck,
            currentCardId,
        });
        // Make sure no temporary data is left from previous study session
        this.props.resetSessionStudyData();
    }

    private updateCardStudyData(studyData: ICardStudyData, nextCard: boolean) {
        let newDeck: string[] | undefined = this.state.studyDeck;
        if (this.state.studyDeck !== undefined && studyData.removeFromDeck) {
            // Remove the card from the deck, if it the due date has been increased
            newDeck = this.state.studyDeck.filter(d => d !== studyData.cardId);

            if (newDeck.length > 0) {
                this.setState({ studyDeck: newDeck });
            } else {
                // Stop the study session if the deck is empty
                this.setState({
                    studyDeck: undefined,
                    currentCardId: undefined,
                });
            }
        }
        this.props.updateCardStudyData(studyData);

        if (nextCard) {
            this.nextCard(studyData, newDeck);
        }
    }

    private nextCard(updatedCardStudyData?: ICardStudyData, deck: string[] | undefined = this.state.studyDeck) {
        if (deck === undefined) {
            throw new Error("Cannot show the next card, when no deck is active");
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
            currentCardId: Study.drawCard(deck, studyData),
        });
    }
}
