import { CompositeDecorator, Editor, EditorState, RichUtils } from "draft-js";
import * as React from "react";
import { FlashCardFaceType, IFlashCardFace } from "../../lib/flashcard/FlashCardFace";
import DropDown from "../rich-text-editor/DropDown";
import { RevealDecorator, RevealEntity } from "../rich-text-editor/RevealEntity";
import { BlockStyle, InlineStyle } from "../rich-text-editor/styles";
import { ToolbarButton, ToolbarButtonBlock, ToolbarButtonInline } from "../rich-text-editor/ToolbarButton";

type ICardFaceEditorState = IRichTextCardFaceEditorState;

interface IRichTextCardFaceEditorState {
    faceType: FlashCardFaceType.RichText;
    editorState: EditorState;
}

export interface ICardFaceEditorProps {
    face: IFlashCardFace;
    cardId: string;
    updateCardFace: (cardId: string, face: IFlashCardFace) => void;
    swapCardFaces: (cardId: string) => void;
}

export default class CardFaceEditor extends React.Component<ICardFaceEditorProps, ICardFaceEditorState> {
    private editor: Editor | null = null;

    constructor(props: ICardFaceEditorProps) {
        super(props);

        if (props.face.type === FlashCardFaceType.RichText) {
            const editorState = props.face.richTextContent != null
            ? EditorState.createWithContent(props.face.richTextContent, new CompositeDecorator([
                RevealDecorator,
            ]))
            : EditorState.createEmpty();

            this.state = {
                faceType: props.face.type,
                editorState,
            };
        }
    }

    public componentWillReceiveProps(newProps: ICardFaceEditorProps) {
        if (newProps.face.type === FlashCardFaceType.RichText) {
            const editorState = newProps.face.richTextContent != null
            ? EditorState.createWithContent(newProps.face.richTextContent, new CompositeDecorator([
                RevealDecorator,
            ]))
            : EditorState.createEmpty();

            this.setState({
                faceType: newProps.face.type,
                editorState,
            });
        }
    }

    public render() {
        return <div className="card flashcard-face">
            <header className="card-header flashcard-face-toolbar">
                <div className="field">
                    <ToolbarButton editorState={this.state.editorState}
                        onClick={this.swapFaces.bind(this)}>
                        {this.props.face.id === "front" ? "F" : "B"}
                    </ToolbarButton>
                </div>
                <div className="field has-addons">
                    <p className="control">
                        <a className="button is-active">
                            <span className="icon">
                                <i className="fas fa-pen-square"></i>
                            </span>
                        </a>
                    </p>

                    <p className="control">
                        <a className="button">
                            <span className="icon">
                                <i className="fas fa-image"></i>
                            </span>
                        </a>
                    </p>

                    <p className="control">
                        <a className="button">
                            <span className="icon is-danger">
                                <i className="fas fa-minus-circle"></i>
                            </span>
                        </a>
                    </p>
                </div>
                <div className="field has-addons">
                    <ToolbarButtonInline icon="bold" type={InlineStyle.BOLD}
                        editorState={this.state.editorState} toggleStyle={this.toggleInlineStyle.bind(this)} />
                    <ToolbarButtonInline icon="italic" type={InlineStyle.ITALIC}
                        editorState={this.state.editorState} toggleStyle={this.toggleInlineStyle.bind(this)} />
                    <ToolbarButtonInline icon="underline" type={InlineStyle.UNDERLINE}
                        editorState={this.state.editorState} toggleStyle={this.toggleInlineStyle.bind(this)} />
                    <ToolbarButtonInline icon="strikethrough" type={InlineStyle.STRIKETHROUGH}
                        editorState={this.state.editorState} toggleStyle={this.toggleInlineStyle.bind(this)} />
                </div>
                <div className="field">
                    <DropDown>
                    {/*<a href="#" className="dropdown-item"
                        onClick={this.toggleBlockStyle(BlockStyle.HEADER_ONE)}>
                        Title
                    </a>
                    <a className="dropdown-item"
                        onClick={this.toggleBlockStyle(BlockStyle.HEADER_TWO)}>
                        Subtitle
                    </a>
                    <a href="#" className="dropdown-item is-active"
                        onClick={this.toggleBlockStyle(BlockStyle.PARAGRAPH)}>
                        Body
                    </a>*/}
                    </DropDown>
                </div>
                <div className="field has-addons">
                    <ToolbarButtonBlock icon="list-ul" type={BlockStyle.UNORDERED_LIST_ITEM}
                        editorState={this.state.editorState} toggleStyle={this.toggleBlockStyle.bind(this)}/>
                    <ToolbarButtonBlock icon="list-ol" type={BlockStyle.ORDERED_LIST_ITEM}
                        editorState={this.state.editorState} toggleStyle={this.toggleBlockStyle.bind(this)}/>
                </div>
                <div className="field">
                    <ToolbarButton icon="low-vision" editorState={this.state.editorState}
                        onClick={this.toggleReveal.bind(this)} />
                </div>
            </header>

            <div className="card-content content" onClick={this.focusEditor.bind(this)}>
                <Editor
                    editorState={this.state.editorState}
                    onChange={this.onChange.bind(this)}
                    ref={editor => this.editor = editor}
                    onBlur={this.onBlur.bind(this)}
                />
            </div>

            <footer className="card-footer">
                <p>This is a list of tags</p>
            </footer>
        </div>;
    }

    private focusEditor(e: React.MouseEvent) {
        e.preventDefault();
        if (this.editor) {
            this.editor.focus();
        }
    }

    private toggleReveal() {
        new RevealEntity().toggle(this.state.editorState, (newEditorState: EditorState) => {
            this.onChange(newEditorState);
        });
    }

    private toggleInlineStyle(style: InlineStyle) {
        if (this.editor != null) {
            this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, style));
        }
    }

    private toggleBlockStyle(style: BlockStyle) {
        if (this.editor != null) {
            this.onChange(RichUtils.toggleBlockType(this.state.editorState, style));
        }
    }

    private onChange(editorState: EditorState) {
        this.setState({ editorState });
    }

    private swapFaces() {
        this.updateGlobalState();
        this.props.swapCardFaces(this.props.cardId);
    }

    private onBlur() {
        this.updateGlobalState();
    }

    private updateGlobalState() {
        if (this.props.face.type === FlashCardFaceType.RichText) {
            this.props.updateCardFace(this.props.cardId, {
                ...this.props.face,
                richTextContent: this.state.editorState.getCurrentContent(),
            });
        }
    }
}
