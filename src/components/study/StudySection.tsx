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
                    startStudy={this.startStudy.bind(this)}/>
            </div>;
        } else {
            const card = this.props.set.cards[this.state.currentCardId];
            return <PresentedCard
                        studyData={this.props.studyData.cardData[this.state.currentCardId]}
                        card={card}
                        updateStudyData={this.updateCardStudyData.bind(this)}
                        nextCard={this.nextCard.bind(this)}/>;
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

    private updateCardStudyData(studyData: ICardStudyData) {
        if (this.props.studyData.cardData[studyData.cardId] !== undefined
            && this.props.studyData.cardData[studyData.cardId].dueDate !== studyData.dueDate
            && this.state.studyDeck !== undefined) {
            // Remove the card from the deck, if it the due date has been increased
            this.setState({ studyDeck: this.state.studyDeck.filter(d => d !== studyData.cardId) });
        }
        this.props.updateCardStudyData(studyData);
    }

    private nextCard() {
        if (this.state.studyDeck === undefined) {
            throw new Error("Cannot show the next card, when no deck is active");
        }
        this.setState({
            currentCardId: Study.drawCard(this.state.studyDeck, this.props.studyData),
        });
    }
}
