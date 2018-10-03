import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import IFlashCard from "../../lib/flashcard/flashcard";
import { FlashCardFaceId, IFlashCardFace } from "../../lib/flashcard/FlashCardFace";
import SlideTransition from "../transition/SlideTransition";
import CardFaceEditor from "./CardFaceEditor";
import { CardFaceEditorToolbar } from "./CardFaceEditorToolbar";
import { TagEditor } from "./TagEditor";

interface ICardEditorState {
    activeFace: FlashCardFaceId;
    tags: string[];
    transitionState: CardEditorTransitionState;
}

interface ICardEditorProps {
    card: IFlashCard;
    deleteCard: (card: IFlashCard) => void;
    updateCardFace: (cardId: string, face: IFlashCardFace) => void;
    swapCardFaces: (cardId: string) => void;
}

enum CardEditorTransitionState {
    Expanding,
    None,
    Collapsing,
}

/**
 * A card that is part of a cardlist
 */
export default class CardEditor extends React.PureComponent<ICardEditorProps, ICardEditorState> {
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
