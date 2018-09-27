import * as React from 'react';
import SetImporter from './set-importer/ImportPage'
import FlashCardSet from '../lib/flashcard/FlashCardSet';
import { AppState } from '../reducers';
import { connect } from 'react-redux';
import SetPage from './pages/SetPage';
import { Actions } from '../reducers/actions';
import { Dispatch } from 'redux';
import FlashCard from '../lib/flashcard/flashcard';
import { FlashCardFace } from '../lib/flashcard/FlashCardFace';
import Dashboard from './dashboard/Dashboard';

interface StudyCardsAppStateProps {
    sets: { [id:string]: FlashCardSet }
}

interface StudyCardsAppDispatchProps {
    addSet: (set?: FlashCardSet) => void;
    addNewCard: (setId: string) => void;
    deleteCard: (card: FlashCard) => void;
    updateCardFace: (cardId: string, face: FlashCardFace) => void;
    updateSetName: (set: FlashCardSet, newName: string) => void;
    resetStudySessionData: () => void
}

interface StudyCardsAppProps extends StudyCardsAppStateProps, StudyCardsAppDispatchProps {}

interface StudyCardsAppState {
    currentSetId: string | null;
    setBeingImported: boolean;
}

class StudyCardsApp extends React.Component<StudyCardsAppProps, StudyCardsAppState> {
    constructor (props: StudyCardsAppProps) {
        super(props);

        this.state = {
            currentSetId: null,
            setBeingImported: false,
        }
    }
    
    private goToImport () {
        this.setState({
            setBeingImported: true,
            currentSetId: null
        });
    }

    private goToSet (set: FlashCardSet) {
        this.setState({
            currentSetId: set.id,
            setBeingImported: false,
        });
    }

    private goToDashboard () {
        this.setState({
            currentSetId: null,
            setBeingImported: false
        });
    }

    render () {
        if (this.state.setBeingImported) {
            return <SetImporter sets={this.props.sets} goToDashboard={this.goToDashboard.bind(this)} addSet={this.props.addSet}/>
        } else if (this.state.currentSetId == null) {
            return <Dashboard sets={this.props.sets}
                        addSet={this.props.addSet}
                        goToImport={this.goToImport.bind(this)}
                        goToSet={this.goToSet.bind(this)}/>
        } else {
            return <SetPage set={this.props.sets[this.state.currentSetId] as FlashCardSet}
                        addNewCard={this.props.addNewCard}
                        deleteCard={this.props.deleteCard}
                        updateCardFace={this.props.updateCardFace}
                        goToDashboard={this.goToDashboard.bind(this)}
                        updateSetName={this.props.updateSetName}
                        resetStudySessionData={this.props.resetStudySessionData} />
        }
    }
}

function mapStateToProps (state: AppState): StudyCardsAppStateProps {
    return {
        sets: state.sets
    };
}

function mapDispatchToProps (dispatch: Dispatch): StudyCardsAppDispatchProps {
    return {
        addSet: (set?: FlashCardSet) => dispatch(Actions.addSet(set)),
        addNewCard: (setId: string) => dispatch(Actions.addNewCard(setId)),
        deleteCard: (card: FlashCard) => dispatch(Actions.deleteCard(card)),
        updateCardFace: (cardId: string, face: FlashCardFace) => dispatch(Actions.updateCardFace(cardId, face)),        
        updateSetName: (set: FlashCardSet, newName: string) => dispatch(Actions.updateSetName(set, newName)),
        resetStudySessionData: () => dispatch(Actions.resetSessionStudyData()),      
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(StudyCardsApp);