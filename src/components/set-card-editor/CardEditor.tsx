import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import IFlashCard, { IFlashCardMeta } from "../../lib/flashcard/flashcard";
import { FlashCardFaceId, IFlashCardFace } from "../../lib/flashcard/FlashCardFace";
import IRemote from "../../lib/remote";
import IStorageProvider, { Storage } from "../../lib/storage/StorageProvider";
import { IAppState } from "../../reducers";
import { Action } from "../../reducers/actions";
import FadeTransition from "../transition/FadeTransition";
import ResizeTransition from "../transition/ResizeTransition";
import SlideTransition from "../transition/SlideTransition";
import { CardDivider } from "./CardDivider";
import CardFaceEditor from "./CardFaceEditor";
import { CardFaceEditorToolbar } from "./CardFaceEditorToolbar";
import { CardSidebar } from "./CardSidebar";
import { TagEditor } from "./TagEditor";

interface ICardEditorState {
    transitionState: TransitionState;
}

interface ICardEditorOwnProps {
    setId: string;
    cardId: string;

    /**
     * Whether or not this card should have an animated transition when it is added to the DOM
     * Default: true
     */
    slideIn?: boolean;

    addNewCard: (afterCardId?: string) => string;
    onDeleted: (cardId: string) => void;
    /**
     * Callback is called whenever this card is below the screen
     * Delta is the number of pixels that this card is below the screen
     */
    onBelowScreen?: (cardId: string, delta: number) => void;
}

interface ICardEditorStateProps extends ICardEditorOwnProps {
    card: IRemote<IFlashCard>;
}

interface ICardEditorDispatchProps {
    deleteCard: (setId: string, cardId: string) => void;
    saveCardFace: (setId: string, cardId: string, face: IFlashCardFace) => void;
    swapCardFaces: (setId: string, cardId: string) => void;
    loadCards: (setId: string, cardIds: string[]) => void;
    saveCardMeta: (setId: string, cardId: string, cardMeta: Partial<IFlashCardMeta>) => void;
}

interface ICardEditorProps extends ICardEditorStateProps, ICardEditorDispatchProps { }

enum TransitionState {
    SlideIn,
    None,
    Collapsing,
    PlaceholderLoad,
}

/**
 * A card that is part of a cardlist
 */
class CardEditor extends React.Component<ICardEditorProps, ICardEditorState> {
    private onScroll?: () => void;
    private cardElement: HTMLElement | null = null;

    constructor(props: ICardEditorProps) {
        super(props);

        const slideIn = props.slideIn === undefined || props.slideIn === true;
        this.state = {
            transitionState: slideIn ? TransitionState.SlideIn : TransitionState.PlaceholderLoad,
        };
    }

    public componentWillReceiveProps(newProps: ICardEditorProps) {
        // Go back to placeholder-load if the card value becomes undefined
        if (newProps.card.value === undefined && this.state.transitionState !== TransitionState.PlaceholderLoad) {
            this.setState({ transitionState: TransitionState.PlaceholderLoad });
        }
    }

    public shouldComponentUpdate(newProps: ICardEditorProps, newState: ICardEditorState) {
        return newProps.card !== this.props.card || newState.transitionState !== this.state.transitionState;
    }

    public componentWillMount() {
        if (this.props.onBelowScreen) {
            // Add a scroll listener if the leave screen handler is bound
            this.onScroll = this.onLeaveScreen.bind(this);
            window.addEventListener("scroll", this.onScroll!);
        }
    }

    public componentWillUnmount() {
        window.removeEventListener("scroll", this.onScroll!);
    }

    public render() {
        let editor: JSX.Element;
        let divider: JSX.Element;
        const isFetching = this.props.card.isFetching;
        const isPlaceholder = this.props.card.value === undefined;
        if (isPlaceholder) {
            // No up to date card is currently available
            editor = <div className="card">
                    { /* Show empty div instead of toolbar */ }
                    <div style={{height: "56px", borderBottom: "2px solid #dbdbdb"}}></div>
                    <div className="columns is-gapless is-marginless flashcard-faces same-height">
                        <div className="column is-half flashcard-face">
                            <div className="card-content">
                                <p><span className="placeholder-text" style={{width: "64%"}}></span></p>
                                <p><span className="placeholder-text"></span></p>
                                <p><span className="placeholder-text" style={{width: "32%"}}></span></p>
                            </div>
                        </div>
                        <div className="column is-half flashcard-face">
                            <div className="card-content">
                                <p><span className="placeholder-text"></span></p>
                                <p><span className="placeholder-text" style={{width: "70%"}}></span></p>
                                <p><span className="placeholder-text" style={{width: "54%"}}></span></p>
                            </div>
                        </div>
                    </div>
                    { /* Show empty div instead of footer */ }
                    <div style={{height: "41px"}}></div>
                </div>;
            divider = <CardDivider
                    isSubtle={true}
                />;
        } else {
            const card = this.props.card.value!;
            editor = <div className={"card"}>
                    <div className="main">
                        <div className="columns is-gapless is-marginless flashcard-faces same-height">
                            <div className="column is-half flashcard-face">
                                { <CardFaceEditor cardId={card.id}
                                    face={card.faces.front}
                                    saveCardFace={this.saveCardFace.bind(this)}
                                    swapCardFaces={this.swapCardFaces.bind(this)}
                                    readOnly={isFetching} /> }
                            </div>
                            <div className="column is-half flashcard-face">
                            { <CardFaceEditor cardId={card.id}
                                    face={card.faces.back}
                                    saveCardFace={this.saveCardFace.bind(this)}
                                    swapCardFaces={this.swapCardFaces.bind(this)}
                                    readOnly={isFetching} /> }
                            </div>
                        </div>
                        <div className="card-footer">
                            <TagEditor tags={card.tags} onChange={this.updateTags.bind(this)} />
                        </div>
                    </div>
                    <CardSidebar onDelete={this.delete.bind(this)}/>
                </div>;
            divider = <CardDivider
                afterCardId={this.props.cardId}
                isSubtle={true}
                addCard={() => this.props.addNewCard(this.props.cardId)}
            />;
        }

        switch (this.state.transitionState) {
            case (TransitionState.SlideIn):
                return <SlideTransition targetState="expanded" onSlideComplete={this.introComplete.bind(this)}>
                    <li className="listed-flashcard is-clearfix">
                        {editor}
                        {divider}
                    </li>
                </SlideTransition>;
            case (TransitionState.None):
                return <li className="listed-flashcard is-clearfix" ref={el => this.cardElement = el}>
                    {editor}
                    {divider}
                </li>;
            case (TransitionState.PlaceholderLoad):
                // Placeholders just pop into place, while the real content animates
                return <li className={"is-clearfix" + (isPlaceholder ? "" : " listed-flashcard")}>
                    <ResizeTransition doTransition={! isPlaceholder}>
                        <div style={{ background: "white" }} >
                            { isPlaceholder
                                ? editor
                                : <FadeTransition from="hidden" to={"visible"}
                                            onFadeComplete={this.introComplete.bind(this)}>
                                    {editor}
                                </FadeTransition>
                            }
                        </div>
                    </ResizeTransition>
                    {divider}
                </li>;
            case (TransitionState.Collapsing):
                return <SlideTransition targetState="collapsed" onSlideComplete={this.deleteFinal.bind(this)}>
                    <li className="listed-flashcard is-clearfix">
                        {editor}
                        {divider}
                    </li>
                </SlideTransition>;
        }
    }

    private saveCardFace(face: IFlashCardFace) {
        this.props.saveCardFace(this.props.setId, this.props.cardId, face);
    }

    private swapCardFaces() {
        this.props.swapCardFaces(this.props.setId, this.props.cardId);
    }

    private introComplete() {
        this.setState({ transitionState: TransitionState.None });
    }

    private updateTags(newTags: string[]) {
        this.props.saveCardMeta(this.props.setId, this.props.cardId, { tags: newTags });
    }

    private delete() {
        this.setState({ transitionState: TransitionState.Collapsing });
    }

    private deleteFinal() {
        this.props.deleteCard(this.props.setId, this.props.cardId);
        this.props.onDeleted(this.props.cardId);
    }

    private onLeaveScreen() {
        if (this.cardElement !== null && this.props.onBelowScreen !== undefined) {
            const scrollPos = window.scrollY;
            const screenHeight = window.innerHeight;
            const elementPos = this.cardElement.offsetTop;

            if (elementPos > scrollPos + screenHeight) {
                this.props.onBelowScreen(this.props.cardId, elementPos - (scrollPos + screenHeight));
            }
        }
    }
}

function mapStateToProps(state: IAppState, ownProps: ICardEditorOwnProps): ICardEditorStateProps {
    const card = state.sets.value![ownProps.setId].value!.cards[ownProps.cardId];
    return {
        ...ownProps,
        card: card !== undefined ? card : {
            isFetching: true,
            value: undefined,
        },
    };
}

function mapDispatchToProps(dispatch: Dispatch): ICardEditorDispatchProps {
    return {
        deleteCard: (setId: string, cardId: string) =>
            dispatch<any>(Storage.deleteCard(setId, cardId)),
        saveCardFace: (setId: string, cardId: string, face: IFlashCardFace) =>
            dispatch<any>(Storage.saveCardFace(setId, cardId, face)),
        swapCardFaces: (setId: string, cardId: string) => dispatch(Action.swapCardFaces(setId, cardId)),
        loadCards: (setId: string, cardIds: string[]) =>
            dispatch<any>(Storage.loadCards(setId, cardIds)),
        saveCardMeta: (setId: string, cardId: string, cardMeta: Partial<IFlashCardMeta>) =>
            dispatch<any>(Storage.saveCardMeta(setId, cardId, cardMeta)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CardEditor);
