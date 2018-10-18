import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Dispatch } from "redux";
import IFlashCardSet, { IFlashCardSetCardFilter, IFlashCardSetMeta } from "../../lib/flashcard/FlashCardSet";
import IRemote from "../../lib/remote";
import IStorageProvider, { Storage } from "../../lib/storage/StorageProvider";
import * as Utils from "../../lib/utils";
import { IAppState } from "../../reducers";
import SetHeader from "../SetHeader";
import SetLoader from "../SetLoader";
import SetNav from "../SetNav";
import SetNotFound from "../SetNotFound";
import { CardDivider } from "./CardDivider";
import CardEditor from "./CardEditor";
import { TagFilter } from "./TagFilter";

interface ISetCardEditorOwnProps {
    setId: string;
}

interface ISetCardEditorStateProps extends RouteComponentProps<ISetCardEditorOwnProps> {
    set?: IRemote<IFlashCardSet>;
    setId: string;
}

interface ISetCardEditorDispatchProps {
    addNewCard: (afterCardId?: string) => string;
    loadCards: (cardIds: string[]) => void;
    filterCards: (filter: IFlashCardSetCardFilter) => void;
    loadSetMetaAll: () => void;
}

interface ISetCardEditorProps extends ISetCardEditorStateProps, ISetCardEditorDispatchProps { }

interface ISetCardEditorState {
    cardDisplayData: {
        [cardId: string]: {
            // Whether the card is visible on screen, to prevent drops in local performance
            visible: boolean,
            // Whether the card has been fetched this session. Each card will only be loaded once to limit server load
            loaded: boolean },
    };
}

class SetCardEditor extends React.Component<ISetCardEditorProps, ISetCardEditorState> {
    /**
     * How many cards to load every time more cards are loaded
     */
    private cardsToLoadAtOnce = 10;
    /**
     * The number of pixels from the bottom of the screen until more cards are loaded
     */
    private loadNextCardsAt = 1500;
    private scrollListener = this.updateVisibleCards.bind(this);

    /**
     * Indicates whether the current render is the first one taking place
     * Used to prevent card animations when they are first added in
     */
    private newlyAddedCards: {[id: string]: boolean} = {};

    constructor(props: ISetCardEditorProps) {
        super(props);
        // Set initial state
        this.state = {
            cardDisplayData: this.props.set !== undefined && this.props.set.value !== undefined
                            && this.props.set.value.filteredCardOrder.value !== undefined
                ? Utils.arrayToObject(
                    this.props.set.value.filteredCardOrder.value,
                    cardId => [cardId, { visible: false, loaded: false }])
                : { },
        };
    }

    public componentWillReceiveProps(newProps: ISetCardEditorProps) {
        if (this.props.set === undefined || newProps.set === undefined) {
            // Do nothing, until proper data is available
            return;
        }

        if (this.props.set.isFetching && newProps.set.isFetching === false) {
            // After set metadata has been updated, cards always need to be updated
            this.updateVisibleCards();
        }

        if (newProps.set.value !== undefined) {
            const oldFilter = this.props.set.value !== undefined ? this.props.set.value.filter : undefined;
            const newFilter = newProps.set.value !== undefined ? newProps.set.value.filter : undefined;
            if (newFilter !== oldFilter) {
                // Filter has been changed.
                // Since filter can only be changed at the top of the page, it's safe to set all cards to invisible
                this.setState({
                    cardDisplayData: Utils.arrayToObject(newProps.set.value.filteredCardOrder.value!,
                        cardId => [cardId, {
                            visible: false,
                            loaded: this.state.cardDisplayData[cardId] !== undefined
                                ? this.state.cardDisplayData[cardId].loaded
                                : false,
                        }],
                    ),
                }, () => {
                    // Make sure that some cards are visible
                    this.updateVisibleCards();
                });
            }
        }
    }

    public render() {
        let content: JSX.Element;

        if (this.props.set === undefined) {
            content = <SetNotFound setId={this.props.setId} />;
        } else if (this.props.set.value === undefined) {
            content = <SetLoader />;
        } else {
            const set = this.props.set.value!;
            content = <div className="container card-editor">
                { /* Set name */ }
                <h2 className="title is-4">Edit cards in {set.name}</h2>
                <h3 className="subtitle is-6">{set.cardOrder.length === 0
                    ? "This set contains no cards."
                    : "Showing " + set.filteredCardOrder.value!.length + " cards out of "
                        + set.cardOrder.length }</h3>

                <TagFilter tags={set.availableTags}
                    activeTags={set.filter.tags || { }}
                    toggleTag={this.toggleTag.bind(this)} />

                { /* Button for adding new card to the set. Dummy button is shown if filter is updating */ }
                <CardDivider
                    isSubtle={set.filteredCardOrder.value!.length !== 0}
                    addCard={! set.filteredCardOrder.isFetching ? this.addNewCard.bind(this) : undefined}
                />

                { /* Set content */ }
                {this.renderCards(set)}
            </div>;
        }

        return <div>
            <SetHeader setId={this.props.setId} />
            <SetNav setId={this.props.setId} activePage="edit" />
            <section className="section">
                {content}
            </section>
        </div>;
    }

    public componentWillMount() {
        if (this.props.set === undefined) {
            // Load the set
            this.props.loadSetMetaAll();
        }

        if (this.props.set !== undefined && this.props.set.value !== undefined) {
            const set = this.props.set.value;
            if (set.filteredCardOrder.value === undefined) {
                throw new Error("Filtered card order should never be undefined");
            }
            this.updateVisibleCards();
        }

        window.addEventListener("scroll", this.scrollListener);
    }

    public componentWillUnmount() {
        window.removeEventListener("scroll", this.scrollListener);
    }

    private renderCards(set: IFlashCardSet) {
        const cards: JSX.Element[] = [];
        if (set.filteredCardOrder.isFetching || set.filteredCardOrder.value === undefined) {
            // If currently filtering cards, show two placeholders
            for (let i = 0; i < 2; i++) {
                cards.push(
                    <CardEditor key={i}
                                setId={this.props.setId}
                                cardId={"PLACEHOLDER"}
                                slideIn={false}
                                addNewCard={this.addNewCard.bind(this)}
                                onDeleted={this.cardDeleted.bind(this)} />,
                );
            }
        } else if (set.filteredCardOrder.value.length === 0) {
            // No cards match the filter
        } else {
            // This deck contains cards and they should be rendered
            let loadingCards: number = 0;
            for (const cardId of set.filteredCardOrder.value!) {
                if (! this.state.cardDisplayData[cardId].visible) { continue; }

                const card = set.cards[cardId];
                if (card === undefined) {
                    continue;
                }

                // Never show more than two cards loading at once
                if (card.isFetching) {
                    loadingCards++;
                    if (loadingCards > 2) {
                        continue;
                    }
                }
                // Add the actual card editor
                cards.push(
                    <CardEditor key={cardId}
                                setId={this.props.setId}
                                cardId={cardId}
                                slideIn={this.newlyAddedCards[cardId] === true}
                                addNewCard={this.addNewCard.bind(this)}
                                onDeleted={this.cardDeleted.bind(this)}
                                onBelowScreen={this.cardBelowScreen.bind(this)}/>,
                );

                // Make sure the card doesn't show a slide transition in the future
                delete this.newlyAddedCards[cardId];
            }
        }

        return <ul>
            { cards }
        </ul>;
    }

    private updateVisibleCards() {
        const scrollPos = window.scrollY;
        const docHeight = document.body.scrollHeight;
        const screenHeight = window.innerHeight;

        if (docHeight - (scrollPos + screenHeight) < this.loadNextCardsAt) {
            // This can only be done once the set has been loaded
            if (this.props.set !== undefined && this.props.set.value !== undefined) {
                this.showMoreCards(this.cardsToLoadAtOnce, this.props.set.value);
            }
        }
    }

    private addNewCard(afterCardId?: string) {
        const newCardId = this.props.addNewCard(afterCardId);
        // The newly added card will always be shown
        this.setState({ cardDisplayData: {
            ...this.state.cardDisplayData,
            [newCardId]: { visible: true, loaded: true },
        }});
        this.newlyAddedCards[newCardId] = true;
    }

    private cardDeleted(cardId: string) {
        const {[cardId]: deletedCard, ...rest} = this.state.cardDisplayData;
        this.setState({ cardDisplayData: rest });
        // Run the scroll listener in case more cards need to be loaded
        this.updateVisibleCards();
    }

    /**
     * Makes more cards visible on the screen
     * If the cards have not been loaded before, they will be
     */
    private showMoreCards(count: number, set: IFlashCardSet) {
        const loadingCards = Object.keys(this.state.cardDisplayData)
                                .filter(c => set.cards[c] !== undefined
                                          && set.cards[c].isFetching === true);
        // Only load more cards if the cards from the last loading have actually been loaded
        if (loadingCards.length < this.cardsToLoadAtOnce) {
            let addedCards: number = 0;
            const cardsToShow: string[] = [];
            for (const cardId of set.filteredCardOrder.value!) {
                // Only add the specified amount of cards
                if (addedCards === count) { break; }

                if (this.state.cardDisplayData[cardId].visible !== true) {
                    cardsToShow.push(cardId);
                    addedCards++;
                }
            }

            if (cardsToShow.length === 0) {
                return;
            }
            // Load all the newly shown cards, that have not been loaded before
            this.props.loadCards(cardsToShow.filter(cardId => this.state.cardDisplayData[cardId].loaded === false));
            // Update state to include the newly shown cards
            this.setState({ cardDisplayData: {
                    ...this.state.cardDisplayData,
                    ...Utils.arrayToObject(cardsToShow, cardId => [cardId, { visible: true, loaded: true }]),
                },
            });
        }
    }

    private toggleTag(tag: string) {
        const set = this.props.set!.value!;
        let newTags: { [tag: string]: boolean };
        if (set.filter.tags[tag] === true) {
            // Create a new object where this tag is not present
            const { [tag]: removedTagValue, ...tagsWithTagRemoved} = set.filter.tags;
            newTags = tagsWithTagRemoved;
        } else {
            newTags = {...set.filter.tags, [tag]: true };
        }

        this.props.filterCards({
            ...set.filter,
            tags: newTags,
        });
    }

    private cardBelowScreen(cardId: string, delta: number) {
        if (delta > this.loadNextCardsAt + 1000) {
            this.setState({
                cardDisplayData: {
                    ...this.state.cardDisplayData,
                    [cardId]: { visible: false, loaded: this.state.cardDisplayData[cardId].loaded },
                },
            });
        }
    }
}

function mapStateToProps(state: IAppState, ownProps: RouteComponentProps<ISetCardEditorOwnProps>):
    ISetCardEditorStateProps {
    const setId = ownProps.match.params.setId;
    let set: IRemote<IFlashCardSet> | undefined;
    if (state.sets.isFetching === false && state.sets.value === undefined) {
        // Return an undefined set, so the component will attempt to fetch it
        set = undefined;
    } else {
        set = state.sets.value === undefined
            ? { isFetching: true, value: undefined }
            : state.sets.value[setId];
    }
    return {
        ...ownProps,
        setId,
        set,
    };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: RouteComponentProps<ISetCardEditorOwnProps>):
    ISetCardEditorDispatchProps {
    const setId = ownProps.match.params.setId;
    return {
        addNewCard: (afterCardId?: string) =>
            dispatch<any>(Storage.addCard(setId, afterCardId)),
        loadCards: (cardIds: string[]) =>
            dispatch<any>(Storage.loadCards(setId, cardIds)),
        filterCards: (filter: IFlashCardSetCardFilter) =>
            dispatch<any>(Storage.filterCards(setId, filter)),
        loadSetMetaAll: () => dispatch<any>(Storage.loadSetMetaAll()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SetCardEditor);
