import { CompositeDecorator, ContentState, Editor, EditorState, getDefaultKeyBinding, RichUtils } from "draft-js";
import * as React from "react";
import "../../../node_modules/draft-js/dist/Draft.css";
import { FlashCardFaceType, IFlashCardFace } from "../../lib/flashcard/FlashCardFace";
import { RevealEditorDecorator } from "../rich-text-editor/RevealEntity";
import { CardFaceEditorToolbar } from "./CardFaceEditorToolbar";

type ICardFaceEditorState = IRichTextCardFaceEditorState;

interface IRichTextCardFaceEditorState {
    faceType: FlashCardFaceType;
    editorState?: EditorState;
}

export interface ICardFaceEditorProps {
    face: IFlashCardFace;
    cardId: string;
    readOnly?: boolean;
    saveCardFace: (face: IFlashCardFace) => void;
    swapCardFaces: (cardId: string) => void;
}

export default class CardFaceEditor extends React.PureComponent<ICardFaceEditorProps, ICardFaceEditorState> {
    private editor: Editor | null = null;

    constructor(props: ICardFaceEditorProps) {
        super(props);

        this.state = { faceType: props.face.type };

        if (props.face.type === FlashCardFaceType.RichText) {
            const editorState = props.face.richTextContent != null
            ? EditorState.createWithContent(props.face.richTextContent, new CompositeDecorator([
                RevealEditorDecorator,
            ]))
            : EditorState.createEmpty();

            this.state = {
                faceType: props.face.type,
                editorState,
            };
        } else {
            this.state = {
                faceType: props.face.type,
                editorState: undefined,
            };
        }
    }

    public componentWillReceiveProps(newProps: ICardFaceEditorProps) {
        if (newProps.face.type === FlashCardFaceType.RichText) {
            const decorator = new CompositeDecorator([ RevealEditorDecorator ]);
            const editorState = newProps.face.richTextContent != null
                                ? EditorState.createWithContent(newProps.face.richTextContent, decorator)
                                : EditorState.createEmpty(decorator);

            this.setState({
                faceType: newProps.face.type,
                // editorState,
            });
        }
    }

    public render() {
        const toolbar = <CardFaceEditorToolbar
            editorState={this.state.editorState}
            face={this.props.face}
            swapFaces={this.swapFaces.bind(this)}
            setType={this.setType.bind(this)}
            onChange={this.onRichTextChange.bind(this)}
        />;

        let content: JSX.Element;
        switch (this.props.face.type) {
            case FlashCardFaceType.RichText:
                content = <div className="flashcard-face-content card-content content"
                            onClick={this.focusEditor.bind(this)}>
                    <Editor
                        readOnly={this.props.readOnly}
                        editorState={this.state.editorState!}
                        onChange={this.onRichTextChange.bind(this)}
                        ref={editor => this.editor = editor}
                        handleKeyCommand={this.handleKeyCommand.bind(this)}
                        keyBindingFn={this.mapKeyToEditorCommand.bind(this)}
                        onTab={e => this.onRichTextChange(RichUtils.onTab(e, this.state.editorState!, 4))}
                        spellCheck={true}
                        onBlur={this.onBlur.bind(this)}
                        placeholder={this.props.face.id === "front" ? "Front" : "Back"}
                    />
                </div>;
                break;
            case FlashCardFaceType.None:
                content = <div className="flashcard-face-content no-content"></div>;
                break;
            case FlashCardFaceType.Image:
                content = <div className="flashcard-face-content image"></div>;
                break;
            default:
                throw new Error("Unknown face type");
        }

        return <>
            {toolbar}
            {content}
        </>;
    }

    private focusEditor(e: React.MouseEvent) {
        e.preventDefault();
        if (this.editor) {
            this.editor.focus();
        }
    }

    private onRichTextChange(editorState: EditorState) {
        this.setState({ editorState });
    }

    private swapFaces() {
        // this.updateGlobalState();
        // this.props.swapCardFaces(this.props.cardId);
    }

    private setType(newType: FlashCardFaceType) {
        this.props.saveCardFace({
            ...this.props.face,
            type: newType,
        });
    }

    private onBlur() {
        this.updateGlobalState();
    }

    private handleKeyCommand(command: string, editorState: EditorState) {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            this.onRichTextChange(newState);
            return true;
        }
        return false;
    }

    private mapKeyToEditorCommand(e: React.KeyboardEvent<{}>) {
        if (e.keyCode === 9 /* TAB */) {
            const newEditorState = RichUtils.onTab(e,
                this.state.editorState!,
                4, /* maxDepth */
                );
            if (newEditorState !== this.state.editorState) {
                this.onRichTextChange(newEditorState);
            }
            return "";
        }
        return getDefaultKeyBinding(e);
    }

    private updateGlobalState() {
        if (this.props.face.type === FlashCardFaceType.RichText && this.state.editorState !== undefined) {
            this.props.saveCardFace({
                ...this.props.face,
                richTextContent: this.state.editorState.getCurrentContent(),
            });
        }
    }
}
