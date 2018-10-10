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
    storage: IStorageProvider;
}

interface ICardEditorDispatchProps {
    deleteCard: (card: IFlashCard) => void;
    saveCardFace: (storage: IStorageProvider, setId: string, cardId: string, face: IFlashCardFace) => void;
    swapCardFaces: (setId: string, cardId: string) => void;
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
        const fetching = this.props.card.isFetching;
        if (this.props.card.value === undefined) {
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
                <div className={"card " + (fetching ? "saving " : "")}>
                    <div className="columns is-gapless is-marginless flashcard-faces same-height">
                        <div className="column is-half flashcard-face">
                            <CardFaceEditor cardId={card.id}
                                face={card.faces.front}
                                saveCardFace={this.saveCardFace.bind(this)}
                                swapCardFaces={this.swapCardFaces.bind(this)}
                                readOnly={fetching} />
                        </div>
                        <div className="column is-half flashcard-face">
                            <CardFaceEditor cardId={card.id}
                                face={card.faces.back}
                                saveCardFace={this.saveCardFace.bind(this)}
                                swapCardFaces={this.swapCardFaces.bind(this)}
                                readOnly={fetching} />
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

    private saveCardFace(face: IFlashCardFace) {
        this.props.saveCardFace(this.props.storage, this.props.setId, this.props.cardId, face);
    }

    private swapCardFaces() {
        this.props.swapCardFaces(this.props.setId, this.props.cardId);
    }

    private introComplete() {
        this.setState({ transitionState: CardEditorTransitionState.None });
    }

    private updateTags(newTags: string[]) {
        this.setState({tags: newTags});
    }
}

function mapStateToProps(state: IAppState, ownProps: ICardEditorOwnProps): ICardEditorStateProps {
    const card = state.sets.value![ownProps.setId].value!.cards[ownProps.cardId];
    return {
        ...ownProps,
        card: card !== undefined ? card : {
            isFetching: true,
            value: undefined,
        },
        storage: state.storageProvider,
    };
}

function mapDispatchToProps(dispatch: Dispatch): ICardEditorDispatchProps {
    return {
        deleteCard: (card: IFlashCard) => dispatch(Action.deleteCard(card)),
        saveCardFace: (storage: IStorageProvider, setId: string, cardId: string, face: IFlashCardFace) =>
            storage.saveCardFace(dispatch, setId, cardId, face),
        swapCardFaces: (setId: string, cardId: string) => dispatch(Action.swapCardFaces(setId, cardId)),
        loadCards: (storage: IStorageProvider, setId: string, cardIds: string[]) =>
            storage.loadCards(dispatch, setId, cardIds),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CardEditor);
