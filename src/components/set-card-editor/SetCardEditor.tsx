import * as React from "react";
import IFlashCard from "../../lib/flashcard/flashcard";
import { IFlashCardFace } from "../../lib/flashcard/FlashCardFace";
import IFlashCardSet from "../../lib/flashcard/FlashCardSet";
import { CardDivider } from "./CardDivider";
import CardEditor from "./CardEditor";

interface ISetCardEditorProps {
    onChange?: (newSet: IFlashCardSet) => void;
    addNewCard: (afterCardId?: string) => string;
    deleteCard: (card: IFlashCard) => void;
    loadCards: (cardIds: string[]) => void;
    set: IFlashCardSet;
}

interface ISetCardEditorState {
    shownCards: number;
}

export default class SetCardEditor extends React.Component<ISetCardEditorProps, ISetCardEditorState> {
    /**
     * How many cards to load every time more cards are loaded
     */
    private cardsToLoadAtOnce = 10;
    /**
     * The number of pixels from the bottom of the screen until more cards are loaded
     */
    private loadNextCardsAt = 1500;
    private scrollListener = this.onScroll.bind(this);

    /**
     * Indicates whether the current render is the first one taking place
     * Used to prevent card animations when they are first added in
     */
    private newlyAddedCards: {[id: string]: boolean} = {};

    constructor(props: ISetCardEditorProps) {
        super(props);
        // Set initial state
        this.state = {
            shownCards: this.cardsToLoadAtOnce,
        };

        // Load the cards to be edited
        props.loadCards(props.set.cardOrder.slice(0, this.cardsToLoadAtOnce));
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
            const unloadedCards = this.props.set.cardOrder.filter(c => this.props.set.cards[c].isFetching === false
                                                                        && this.props.set.cards[c].value !== undefined);
            const maxCards = Math.min(this.state.shownCards, // Don't show more of the set than the limit
                                      this.props.set.cardOrder.length, // Cap at deck size
                                      unloadedCards.length + 2); // Never show more than 2 placeholders
            let index = 0;
            for (let i = 0; i < maxCards; i++) {
                const cardId = this.props.set.cardOrder[i];
                const card = this.props.set.cards[cardId];
                // Add the actual card editor
                cardsWithDividers.push(
                    <CardEditor key={cardId}
                                setId={this.props.set.id}
                                cardId={cardId}
                                slideIn={this.newlyAddedCards[cardId] === true}/>,
                );

                // Add a divider / add card button as long as the card is not the last
                if (index !== this.props.set.cardOrder.length - 1) {
                    cardsWithDividers.push(<CardDivider
                        afterCardId={cardId}
                        key={"divider-" + cardId}
                        isSubtle={true}
                        addCard={this.addNewCard.bind(this)}
                    />);
                }

                // Make sure the card doesn't show a slide transition in the future
                delete this.newlyAddedCards[cardId];

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
            this.showMoreCards(this.cardsToLoadAtOnce);
        }
    }

    private addNewCard(afterCardId?: string) {
        const newCardId = this.props.addNewCard(afterCardId);
        // Load one extra card to ensure that the newly added card can be shown
        this.setState({ shownCards: this.state.shownCards + 1 });
        this.newlyAddedCards[newCardId] = true;
    }

    /**
     * Renders more cards
     * @param cardNumber The number of new cards to show
     * @param loadCards Whether or not to syncronize the latest cards with the remote server
     */
    private showMoreCards(cardNumber: number, loadCards: boolean = true) {
        const loadingCards = this.props.set.cardOrder.filter(c => this.props.set.cards[c].isFetching === true);
        // Only load more cards if the cards from the last loading have actually been loaded
        if (loadCards === false || loadingCards.length < this.cardsToLoadAtOnce) {
            const newLoadedCards = Math.min(this.state.shownCards + cardNumber,
            this.props.set.cardOrder.length);

            if (loadCards) {
                this.props.loadCards(this.props.set.cardOrder.slice(this.state.shownCards, newLoadedCards));
            }
            this.setState({ shownCards:  newLoadedCards});
        }
    }
}
