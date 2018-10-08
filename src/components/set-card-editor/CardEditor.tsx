import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import IFlashCard from "../../lib/flashcard/flashcard";
import { FlashCardFaceId, IFlashCardFace } from "../../lib/flashcard/FlashCardFace";
import IRemote from "../../lib/remote";
import IStorageProvider from "../../lib/storage/StorageProvider";
import { IAppState } from "../../reducers";
import { Action } from "../../reducers/actions";
import SlideTransition from "../transition/SlideTransition";
import CardFaceEditor from "./CardFaceEditor";
import { CardFaceEditorToolbar } from "./CardFaceEditorToolbar";
import { TagEditor } from "./TagEditor";

interface ICardEditorState {
    activeFace: FlashCardFaceId;
    tags: string[];
    transitionState: CardEditorTransitionState;
}

interface ICardEditorOwnProps {
    setId: string;
    cardId: string;

    /**
     * Whether or not this card should have an animated transition when it is added to the DOM
     * Default: true
     */
    doTransition?: boolean;
}

interface ICardEditorStateProps extends ICardEditorOwnProps {
    card: IRemote<IFlashCard>;
}

interface ICardEditorDispatchProps {
    deleteCard: (card: IFlashCard) => void;
    updateCardFace: (cardId: string, face: IFlashCardFace) => void;
    swapCardFaces: (cardId: string) => void;
    loadCards: (storage: IStorageProvider, setId: string, cardIds: string[]) => void;
}

interface ICardEditorProps extends ICardEditorStateProps, ICardEditorDispatchProps { }

enum CardEditorTransitionState {
    Expanding,
    None,
    Collapsing,
}

/**
 * A card that is part of a cardlist
 */
class CardEditor extends React.Component<ICardEditorProps, ICardEditorState> {
    private faceEditors: {
        front: CardFaceEditor | null,
        back: CardFaceEditor | null,
    } = {
        front: null,
        back: null,
    };

    constructor(props: ICardEditorProps) {
        super(props);

        const doTransition = props.doTransition === undefined || props.doTransition === true;
        this.state = {
            activeFace: "front",
            tags: [],
            transitionState: doTransition ? CardEditorTransitionState.Expanding : CardEditorTransitionState.None,
        };
    }

    public render() {
        let editor: JSX.Element;
        if (this.props.card.isFetching === true || this.props.card.value === undefined) {
            // No up to date card is currently available
            editor = <li className="listed-flashcard">
                <div className="card">
                    <div className="card-content">
                        <p>Loading</p>
                    </div>
                </div>
            </li>;
        } else {
            const card = this.props.card.value;
            editor = <li className="listed-flashcard">
                <div className="card">
                    <div className="columns is-gapless is-marginless">
                        <div className="column is-half">
                            <CardFaceEditor cardId={card.id}
                                face={card.faces.front}
                                updateCardFace={this.props.updateCardFace}
                                swapCardFaces={this.props.swapCardFaces} />
                        </div>
                        <div className="column is-half">
                            <CardFaceEditor cardId={card.id}
                                face={card.faces.back}
                                updateCardFace={this.props.updateCardFace}
                                swapCardFaces={this.props.swapCardFaces} />
                        </div>
                    </div>
                    <div className="card-footer">
                        <TagEditor tags={this.state.tags} onChange={this.updateTags.bind(this)} />
                    </div>
                </div>
            </li>;
        }

        switch (this.state.transitionState) {
            case (CardEditorTransitionState.Expanding):
                return <SlideTransition targetState="expanded" onSlideComplete={this.introComplete.bind(this)}>
                    {editor}
                </SlideTransition>;
            case (CardEditorTransitionState.None):
                return editor;
            case (CardEditorTransitionState.Collapsing):
                return <SlideTransition targetState="collapsed">{editor}</SlideTransition>;
        }
    }

    private introComplete() {
        this.setState({ transitionState: CardEditorTransitionState.None });
    }

    private updateTags(newTags: string[]) {
        this.setState({tags: newTags});
    }
}

function mapStateToProps(state: IAppState, ownProps: ICardEditorOwnProps): ICardEditorStateProps {
    const card = state.sets.value![ownProps.setId].cards[ownProps.cardId];
    return {
        ...ownProps,
        card: card !== undefined ? card : {
            isFetching: true,
            value: undefined,
        },
    };
}

function mapDispatchToProps(dispatch: Dispatch, props: ICardEditorOwnProps): ICardEditorDispatchProps {
    return {
        deleteCard: (card: IFlashCard) => dispatch(Action.deleteCard(card)),
        updateCardFace: (cardId: string, face: IFlashCardFace) =>
            dispatch(Action.updateCardFace(props.setId, cardId, face)),
        swapCardFaces: (cardId: string) => dispatch(Action.swapCardFaces(props.setId, cardId)),
        loadCards: (storage: IStorageProvider, setId: string, cardIds: string[]) =>
            storage.loadCards(dispatch, setId, cardIds),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CardEditor);
