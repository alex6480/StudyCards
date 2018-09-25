import * as React from "react";
import { ConfirmButton } from "../ConfirmButton";
import FlashCard from "../../lib/flashcard/flashcard";
import { Dispatch } from "redux";
import { Actions } from "../../reducers/actions";
import { connect } from "react-redux";
import CardFaceEditor from "./CardFaceEditor";
import { AppState } from "../../reducers";
import { FlashCardFace } from "../../lib/flashcard/FlashCardFace";

interface CardEditorProps {
    card: FlashCard,
    deleteCard: (card:FlashCard) => void
    updateCardFace: (cardId: string, face: FlashCardFace) => void
}

/**
 * A card that is part of a cardlist
 */
export default class CardEditor extends React.PureComponent<CardEditorProps> {
    render() {
        return <li>
            <div className="columns listed-flashcard">
                <div className="column is-half ">
                    <CardFaceEditor cardId={this.props.card.id} face={this.props.card.faces.front} updateCardFace={this.props.updateCardFace}/>
                </div>
                <div className="column is-half ">
                    <CardFaceEditor cardId={this.props.card.id} face={this.props.card.faces.back} updateCardFace={this.props.updateCardFace}/>
                </div>
            </div>
        </li>
    }
}