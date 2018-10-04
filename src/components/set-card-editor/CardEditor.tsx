import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import IFlashCard from "../../lib/flashcard/flashcard";
import { FlashCardFaceId, IFlashCardFace } from "../../lib/flashcard/FlashCardFace";
import { IAppState } from "../../reducers";
import { Actions } from "../../reducers/actions";
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
}

interface ICardEditorStateProps extends ICardEditorOwnProps {
    card: IFlashCard;
}

interface ICardEditorDispatchProps {
    deleteCard: (card: IFlashCard) => void;
    updateCardFace: (cardId: string, face: IFlashCardFace) => void;
    swapCardFaces: (cardId: string) => void;
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
        this.state = {
            activeFace: "front",
            tags: [],
            transitionState: CardEditorTransitionState.Expanding,
        };
    }

    public render() {
        const editor = <li className="listed-flashcard">
            <div className="card">
                <div className="columns is-gapless is-marginless">
                    <div className="column is-half ">
                        <CardFaceEditor cardId={this.props.card.id}
                            face={this.props.card.faces.front}
                            updateCardFace={this.props.updateCardFace}
                            swapCardFaces={this.props.swapCardFaces} />
                    </div>
                    <div className="column is-half ">
                        <CardFaceEditor cardId={this.props.card.id}
                            face={this.props.card.faces.back}
                            updateCardFace={this.props.updateCardFace}
                            swapCardFaces={this.props.swapCardFaces} />
                    </div>
                </div>
                <div className="card-footer">
                    <TagEditor tags={this.state.tags} onChange={this.updateTags.bind(this)} />
                </div>
            </div>
        </li>;

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
    return {
        ...ownProps,
        card: state.sets[ownProps.setId].cards[ownProps.cardId],
    };
}

function mapDispatchToProps(dispatch: Dispatch, props: ICardEditorOwnProps): ICardEditorDispatchProps {
    return {
        deleteCard: (card: IFlashCard) => dispatch(Actions.deleteCard(card)),
        updateCardFace: (cardId: string, face: IFlashCardFace) =>
            dispatch(Actions.updateCardFace(props.setId, cardId, face)),
        swapCardFaces: (cardId: string) => dispatch(Actions.swapCardFaces(props.setId, cardId)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CardEditor);
