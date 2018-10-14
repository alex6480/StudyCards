import * as React from "react";
import IFlashCard from "../../lib/flashcard/flashcard";
import { IFlashCardFace } from "../../lib/flashcard/FlashCardFace";
import IFlashCardSet from "../../lib/flashcard/FlashCardSet";
import { CardDivider } from "./CardDivider";
import CardEditor from "./CardEditor";
import { TagFilter } from "./TagFilter";

interface ISetCardEditorProps {
    onChange?: (newSet: IFlashCardSet) => void;
    addNewCard: (afterCardId?: string) => string;
    loadCards: (cardIds: string[]) => void;
    set: IFlashCardSet;
}

interface ISetCardEditorState {
    shownCards: string[];
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
            shownCards: props.set.cardOrder.slice(0, this.cardsToLoadAtOnce),
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

            <TagFilter availableTags={this.props.set.availableTags} />

            { /* Button for adding new card to the set*/ }
            <CardDivider
                isSubtle={this.props.set.cardOrder.length !== 0}
                addCard={this.addNewCard.bind(this)}
            />

            { /* Set content */ }
            {this.renderCards()}
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
            const cards: JSX.Element[] = [];
            let loadingCards: number = 0;
            for (const cardId of this.state.shownCards) {
                const card = this.props.set.cards[cardId];
                if (card === undefined) {
                    continue;
                }

                // Never show more than two cards loading at once
                if (card.isFetching) {
                    loadingCards++;
                    if (loadingCards > 2) {
                        break;
                    }
                }
                // Add the actual card editor
                cards.push(
                    <CardEditor key={cardId}
                                setId={this.props.set.id}
                                cardId={cardId}
                                slideIn={this.newlyAddedCards[cardId] === true}
                                addNewCard={this.addNewCard.bind(this)}
                                onDeleted={this.cardDeleted.bind(this)}/>,
                );

                // Make sure the card doesn't show a slide transition in the future
                delete this.newlyAddedCards[cardId];
            }

            return <ul>
                { cards }
            </ul>;
        }
    }

    private onScroll() {
        const scrollPos = window.scrollY;
        const docHeight = document.body.scrollHeight;
        const screenHeight = window.innerHeight;

        if (docHeight - (scrollPos + screenHeight) < this.loadNextCardsAt) {
            this.loadMoreCards(this.cardsToLoadAtOnce);
        }
    }

    private addNewCard(afterCardId?: string) {
        const newCardId = this.props.addNewCard(afterCardId);
        // Load one extra card to ensure that the newly added card can be shown
        const afterIndex = afterCardId !== undefined ? this.state.shownCards.indexOf(afterCardId) : -1;
        const newShownCards = [
            ...this.state.shownCards.slice(0, afterIndex + 1),
            newCardId,
            ...this.state.shownCards.slice(afterIndex + 1)];
        this.setState({ shownCards: newShownCards });
        this.newlyAddedCards[newCardId] = true;
    }

    private cardDeleted(cardId: string) {
        this.setState({ shownCards: this.state.shownCards.filter(c => c !== cardId) });
        // Run the scroll listener in case more cards need to be loaded
        this.onScroll();
    }

    /**
     * Loads more cards
     */
    private loadMoreCards(count: number) {
        const loadingCards = this.state.shownCards
                                .filter(c => this.props.set.cards[c] !== undefined
                                          && this.props.set.cards[c].isFetching === true);
        // Only load more cards if the cards from the last loading have actually been loaded
        if (loadingCards.length < this.cardsToLoadAtOnce) {
            let addedCards: number = 0;
            const cardsToLoad: string[] = [];
            for (const cardId of this.props.set.cardOrder) {
                // Only add the specified amount of cards
                if (addedCards === count) { break; }

                if (this.state.shownCards.indexOf(cardId) === -1) {
                    cardsToLoad.push(cardId);
                    addedCards++;
                }
            }

            if (cardsToLoad.length === 0) {
                return;
            }
            this.props.loadCards(cardsToLoad);
            this.setState({ shownCards:  this.state.shownCards.concat(cardsToLoad)});
        }
    }
}
