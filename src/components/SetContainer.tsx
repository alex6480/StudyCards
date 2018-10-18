import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import IFlashCard from "../lib/flashcard/flashcard";
import { IFlashCardFace } from "../lib/flashcard/FlashCardFace";
import IFlashCardSet, { IFlashCardSetMeta } from "../lib/flashcard/FlashCardSet";
import { ICardStudyData, ISetStudyData } from "../lib/flashcard/StudyData";
import IRemote from "../lib/remote";
import IStorageProvider, { Storage } from "../lib/storage/StorageProvider";
import { IAppState } from "../reducers";
import { Action } from "../reducers/actions";
import EditableText from "./rich-text-editor/EditableText";
import SetCardEditor from "./set-card-editor/SetCardEditor";
import SetExporter from "./SetExporter";
import SetHeader from "./SetHeader";
import StudySection from "./study/StudySection";

interface ISetContainerOwnProps {
    goToDashboard: () => void;
    section?: SetSection;
    setId: string;
}

interface ISetContainerStateProps extends ISetContainerOwnProps {
    set: IRemote<IFlashCardSet>;
    studyData: IRemote<ISetStudyData>;
}

interface ISetContainerDispatchProps {
    saveSetMeta: (setMeta: Partial<IFlashCardSetMeta>) => void;
    resetStudySessionData: () => void;
    updateCardStudyData: (studyData: ICardStudyData) => void;
    getSetStudyData: (setId: string) => void;
    loadCards: (setId: string, cardIds: string[]) => void;
}

interface ISetContainerProps extends ISetContainerStateProps, ISetContainerDispatchProps { }

interface ISetContainerState {
    section: SetSection;
}

export enum SetSection {
    Study,
    Edit,
    Export,
    Properties,
}

class SetContainer extends React.Component<ISetContainerProps, ISetContainerState> {
    constructor(props: ISetContainerProps) {
        super(props);

        // Set initial state
        this.state = {
            section: props.section !== undefined ? props.section : SetSection.Study,
        };
    }

    public render() {
        let page: React.ReactElement<any>;
        if (this.props.set.value === undefined || this.props.set === undefined) {
            return <p>Loading set</p>;
        }

        switch (this.state.section) {
            /* case SetSection.Edit:
                page = <SetCardEditor setId={this.props.setId} />;
                break;*/
            /*case SetSection.Export:
                page = <SetExporter set={this.props.set.value} getExportUri={this.getSetExportUri.bind(this)}/>;
                break;*/
            /*case SetSection.Study:
                page = <StudySection set={this.props.set}
                        resetSessionStudyData={this.props.resetStudySessionData}
                        updateCardStudyData={this.props.updateCardStudyData}
                        studyData={this.props.studyData}
                        goToSection={this.goToSection.bind(this)}
                        loadCards={this.loadCards.bind(this)}
                        loadStudyData={() => this.props.getSetStudyData(this.props.setId)}/>;
                break;*/
            default:
                throw new Error("Unknown section");
        }

        return <div>
            <SetHeader setId="fisk" />
            <section className="section">
                {page}
            </section>
        </div>;
    }

    private getSetExportUri(setId: string) {
        return Storage.getExportUri(setId);
    }

    private loadCards(cardIds: string[]) {
        return this.props.loadCards(this.props.setId, cardIds);
    }

    private goToSection(newPage: SetSection) {
        this.setState({section: newPage});
    }

    private updateSetName(newName: string) {
        if (newName !== this.props.set.value!.name) {
            this.props.saveSetMeta({ id: this.props.setId, name: newName });
        }
    }
}

function mapStateToProps(state: IAppState, ownProps: ISetContainerOwnProps): ISetContainerStateProps {
    return {
        ...ownProps,
        set: state.sets.value![ownProps.setId],
        studyData: state.studyData[ownProps.setId],
    };
}

function mapDispatchToProps(dispatch: Dispatch): ISetContainerDispatchProps {
    return {
        getSetStudyData: (setId: string) => dispatch<any>(Storage.loadSetStudyData(setId)),
        saveSetMeta: (setMeta: Partial<IFlashCardSetMeta>) => dispatch<any>(Storage.saveSetMeta(setMeta)),
        resetStudySessionData: () => dispatch(Action.resetSessionStudyData()),
        updateCardStudyData: (studyData: ICardStudyData) => dispatch(Action.updateCardStudyData(studyData)),
        loadCards: (setId: string, cardIds: string[]) => dispatch<any>(Storage.loadCards(setId, cardIds)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SetContainer);
