import * as React from "react";
import FlashCardSet, { ExportFlashCardSet } from "../../lib/flashcard/FlashCardSet";
import { CardStudyData, SetStudyData } from "../../lib/flashcard/StudyData";
import FlashCard from "../../lib/flashcard/flashcard";
import StudyOverview from "./StudyOverview";
import * as Study from "../../lib/study";

interface StudySectionProps {
    set: FlashCardSet;
    studyData: SetStudyData;
}

interface StudySectionState {
    studyDeck?: string[];
    currentCardId?: string;
}

export default class StudySection extends React.Component<StudySectionProps, StudySectionState> {
    // TODO: Make these parameters variable
    private StudyMaxNewCards: number = 20;
    private StudyMaxTotalCards: number = 40;

    constructor (props: StudySectionProps) {
        super(props);
        this.state = { };
    }

    private startStudy (deck: string[]) {
        let currentCardId = deck.pop();
        this.setState({
            studyDeck: deck,
            currentCardId: currentCardId
        });
    }

    render () {
        if (this.state.currentCardId == undefined) {
            return <div className="container">
                <StudyOverview set={this.props.set}
                    studyData={this.props.studyData}
                    maxNewCards={this.StudyMaxNewCards} 
                    maxTotalCards={this.StudyMaxTotalCards}
                    startStudy={this.startStudy.bind(this)}/>
            </div>
        } else {
            return <div>I am studying</div>
        }
    }
}