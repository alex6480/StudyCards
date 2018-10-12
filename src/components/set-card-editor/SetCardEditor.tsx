import * as React from "react";
import IFlashCard from "../../lib/flashcard/flashcard";
import { IFlashCardFace } from "../../lib/flashcard/FlashCardFace";
import IFlashCardSet from "../../lib/flashcard/FlashCardSet";
import { CardDivider } from "./CardDivider";
import CardEditor from "./CardEditor";

interface ISetCardEditorProps {
    onChange?: (newSet: IFlashCardSet) => void;
    addNewCard: (afterCardId?: string) => void;
    deleteCard: (card: IFlashCard) => void;
    loadCards: (cardIds: string[]) => void;
    set: IFlashCardSet;
}

interface ISetCardEditorState {
    loadedCards: number;
}

export default class SetCardEditor extends React.Component<ISetCardEditorProps, ISetCardEditorState> {
    /**
     * How many cards to load every time more cards are loaded
     */
    private cardsToLoadAtOnce = 10;
    /**
     * The number of pixels from the bottom of the screen until more cards are loaded
     */
    private loadNextCardsAt = 500;
    private scrollListener = this.onScroll.bind(this);

    /**
     * Indicates whether the current render is the first one taking place
     * Used to prevent card animations when they are first added in
     */
    private isFirstRender: boolean = true;

    constructor(props: ISetCardEditorProps) {
        super(props);
        // Set initial state
        this.state = {
            loadedCards: this.cardsToLoadAtOnce,
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
                addCard={this.props.addNewCard}
            />
        </div>;

        // Make sure future card transitions will be shown
        this.isFirstRender = false;

        return content;
    }

    public componentWillMount() {
        window.addEventListener("scroll", this.scrollListener);
    }

    public componentWillUnmount() {
        window.removeEventListener("scroll", this.scrollListener);
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
            for (let i = 0; i < this.state.loadedCards; i++) {
                const cardId = this.props.set.cardOrder[i];
                const card = this.props.set.cards[cardId];
                // Add the actual card editor
                cardsWithDividers.push(
                    <CardEditor key={cardId} setId={this.props.set.id} cardId={cardId} slideIn={!this.isFirstRender}/>,
                );

                // Add a divider / add card button as long as the card is not the last
                if (index !== this.props.set.cardOrder.length - 1) {
                    cardsWithDividers.push(<CardDivider
                        afterCardId={cardId}
                        key={"divider-" + cardId}
                        isSubtle={true}
                        addCard={this.props.addNewCard}
                    />);
                }

                index++;
            }

            return <ul>
                { cardsWithDividers }
            </ul>;
        }
    }

    private onScroll() {
        const scrollPos = window.scrollY;
        const docHeight = document.body.scrollHeight;
        const screenHeight = window.innerHeight;

        if (docHeight - (scrollPos + screenHeight) < this.loadNextCardsAt) {
            const newLoadedCards = Math.min(this.state.loadedCards + this.cardsToLoadAtOnce,
                                            this.props.set.cardOrder.length);
            this.setState({ loadedCards:  newLoadedCards});
        }
    }
}
