import * as React from "react";
import IFlashCard from "../../lib/flashcard/flashcard";
import { IFlashCardFace } from "../../lib/flashcard/FlashCardFace";
import IFlashCardSet from "../../lib/flashcard/FlashCardSet";
import { CardDivider } from "./CardDivider";
import CardEditor from "./CardEditor";

interface ISetCardEditorProps {
    onChange?: (newSet: IFlashCardSet) => void;
    addNewCard: (setId: string, afterCardId?: string) => void;
    deleteCard: (card: IFlashCard) => void;
    loadCards: (cardIds: string[]) => void;
    set: IFlashCardSet;
}

export default class SetCardEditor extends React.Component<ISetCardEditorProps> {
    /**
     * Indicates whether the current render is the first one taking place
     * Used to prevent card animations when they are first added in
     */
    private isFirstRender: boolean = true;

    constructor(props: ISetCardEditorProps) {
        super(props);
        // Set initial state
        this.state = {
            cardBeingEdited: undefined,
        };

        // Load the cards to be edited
        props.loadCards(props.set.cardOrder);
    }

    public render() {
        const content = <div className="container card-editor">
            { /* Set name */ }
            <h2 className="title is-4">Edit cards in {this.props.set.name}</h2>
            <h3 className="subtitle is-6">{this.cardCount === 0
                ? "This set contains no cards."
                : "This set contains " + this.cardCount + " card" + (this.cardCount === 1 ? "" : "s") + "." }</h3>

            { /* Set content */ }
            {this.renderCards()}

            { /* Button for adding new card to the set*/ }
            <CardDivider
                isSubtle={false}
                addCard={this.addNewCard.bind(this)}
            />
        </div>;

        // Make sure future card transitions will be shown
        this.isFirstRender = false;

        return content;
    }

    private addNewCard(afterCardId?: string) {
        this.props.addNewCard(this.props.set.id, afterCardId);
    }

    private get cardCount(): number {
        return this.props.set.cardOrder.length;
    }

    private renderCards() {
        if (this.cardCount === 0) {
            // In case no cards currently exist
        } else {
            // This deck contains cards and they should be rendered
            const cardsWithDividers: JSX.Element[] = [];
            let index = 0;
            for (const id of this.props.set.cardOrder) {
                const card = this.props.set.cards[id];
                // Add the actual card editor
                cardsWithDividers.push(
                    <CardEditor key={id} setId={this.props.set.id} cardId={id} doTransition={!this.isFirstRender}/>,
                );

                // Add a divider / add card button as long as the card is not the last
                if (index !== this.props.set.cardOrder.length - 1) {
                    cardsWithDividers.push(<CardDivider
                        afterCardId={id}
                        key={"divider-" + id}
                        isSubtle={true}
                        addCard={after => this.props.addNewCard(this.props.set.id, after)}
                    />);
                }

                index++;
            }

            return <ul>
                { cardsWithDividers }
            </ul>;
        }
    }
}
