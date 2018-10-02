import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import IFlashCard from "../../lib/flashcard/flashcard";
import { FlashCardFaceId, IFlashCardFace } from "../../lib/flashcard/FlashCardFace";
import CardFaceEditor from "./CardFaceEditor";
import { CardFaceEditorToolbar } from "./CardFaceEditorToolbar";

interface ICardEditorState {
    activeFace: FlashCardFaceId;
}

interface ICardEditorProps {
    card: IFlashCard;
    deleteCard: (card: IFlashCard) => void;
    updateCardFace: (cardId: string, face: IFlashCardFace) => void;
    swapCardFaces: (cardId: string) => void;
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
        };
    }

    public render() {
        return <li>
            <div className="card listed-flashcard">
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
                    <p>This is a list of tags</p>
                </div>
            </div>
        </li>;
    }
}
