import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import IFlashCard from "../../lib/flashcard/flashcard";
import { IFlashCardFace } from "../../lib/flashcard/FlashCardFace";
import CardFaceEditor from "./CardFaceEditor";

interface ICardEditorProps {
    card: IFlashCard;
    deleteCard: (card: IFlashCard) => void;
    updateCardFace: (cardId: string, face: IFlashCardFace) => void;
    swapCardFaces: (cardId: string) => void;
}

/**
 * A card that is part of a cardlist
 */
export default class CardEditor extends React.PureComponent<ICardEditorProps> {
    public render() {
        return <li>
            <div className="columns listed-flashcard">
                <div className="column is-half ">
                    <CardFaceEditor cardId={this.props.card.id}
                        face={this.props.card.faces.front}
                        updateCardFace={this.props.updateCardFace}
                        swapCardFaces={this.props.swapCardFaces}/>
                </div>
                <div className="column is-half ">
                    <CardFaceEditor cardId={this.props.card.id}
                        face={this.props.card.faces.back}
                        updateCardFace={this.props.updateCardFace}
                        swapCardFaces={this.props.swapCardFaces}/>
                </div>
            </div>
        </li>;
    }
}
