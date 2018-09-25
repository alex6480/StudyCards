import * as React from "react";
import { Editor, EditorState, RichUtils, Entity, Modifier, CompositeDecorator } from 'draft-js';
import { RevealEntity, RevealDecorator } from "./RevealEntity";

type RichTextEditorProps = {
    className?: string,
    entityTypes?: Entity[],
    editorState: EditorState,
    onChange?: (editorState: EditorState) => void
};


export default class RichTextEditor extends React.Component<RichTextEditorProps, {}> {
    private editor: Editor | null = null;

    constructor(props: RichTextEditorProps) {
        super(props);
    }

    private onChange (state: EditorState) {
        this.setState({ editorState: state });
        if (this.props.onChange) {
            this.props.onChange(state);
        }
    }

    public toggleInlineStyle (inlineStyle: string) {
        this.onChange(RichUtils.toggleInlineStyle(this.props.editorState, inlineStyle));
    }

    public toggleBlockStyle (blockStyle: string) {
        this.onChange(RichUtils.toggleBlockType(this.props.editorState, blockStyle));
    }

    public toggleReveal () {
        debugger;
        new RevealEntity().toggle(this.props.editorState, (newEditorState: EditorState) => {
            this.onChange(newEditorState);
        });
    }

    render() {
        return (
            <div className="card-content content" onClick={e => {e.preventDefault(); this.editor && this.editor.focus()}}>
                <Editor
                    editorState={this.props.editorState}
                    onChange={this.onChange.bind(this)}
                    ref={editor => this.editor = editor}
                />
            </div>
        );
    }
};