import * as React from "react";
import { ConfirmButton } from "../ConfirmButton";
import CardEditor from "./CardEditor";
import FlashCardSet from "../../lib/flashcard/FlashCardSet";
import FlashCard from "../../lib/flashcard/flashcard";
import { connect } from 'react-redux'
import { Dispatch } from "redux";
import { AppState } from "../../reducers";
import { Actions } from "../../reducers/actions";
import { FlashCardFace } from "../../lib/flashcard/FlashCardFace";

interface SetCardEditorProps {
    onChange?: (newSet: FlashCardSet) => void;
    addNewCard: (setId: string) => void;
    deleteCard: (card: FlashCard) => void;
    updateCardFace: (cardId: string, face: FlashCardFace) => void;
    set: FlashCardSet;
}

export default class SetCardEditor extends React.Component<SetCardEditorProps> {
    constructor (props: SetCardEditorProps) {
        super(props);
        // Set initial state
        this.state = {
            cardBeingEdited: undefined,
        }
    }
    
    private addNewCard () {
        this.props.addNewCard(this.props.set.id);
    }

    render() {
        return <div className="container">
            { /* Set name */ }
            <h2 className="title is-3">Cards in {this.props.set.name}</h2>
            <h3 className="subtitle is-4">{this.cardCount == 0
                ? "This set contains no cards."
                : "This set contains " + this.cardCount + " card" + (this.cardCount == 1 ? "" : "s") + "." }</h3>

            { /* Set content */ }
            {this.renderCards()}

            { /* Button for adding new card to the set*/ }
            <a className="button is-primary" onClick={this.addNewCard.bind(this)}>Add new card</a>
        </div>;
    }

    private get cardCount (): number {
        return Object.keys(this.props.set.cards).length;
    }

    private renderCards() {
        if (this.cardCount == 0) {
            // In case no cards currently exist
        } else {
            // This deck contains cards and they should be rendered
            var cards: JSX.Element[] = [];
            for (var id in this.props.set.cards) {
                var card = this.props.set.cards[id];
                cards.push(<CardEditor key={id} card={card} deleteCard={this.props.deleteCard} updateCardFace={this.props.updateCardFace}/>);
            }
            return <div>
                <div className="columns">
                    <div className="column">
                        <h4 className="title is-4">Front</h4>
                    </div>
                    <div className="column">
                        <h4 className="title is-4">Back</h4>
                    </div>
                </div>
                <ul>
                    {cards}
                </ul>
            </div>;
        }
    }
}