import { CompositeDecorator, Editor, EditorState } from "draft-js";
import * as React from "react";
import { FlashCardFaceType, IFlashCardFace } from "../../lib/flashcard/FlashCardFace";
import { RevealDecorator } from "../rich-text-editor/RevealEntity";

interface IPresentedCardFaceProps {
    face: IFlashCardFace;
}

export default class PresentedCardFace extends React.Component<IPresentedCardFaceProps> {
    private editor: Editor | null = null;
    constructor(props: IPresentedCardFaceProps) {
        super(props);
    }

    public render() {
        switch (this.props.face.type) {
            case FlashCardFaceType.RichText:
                const decorator = new CompositeDecorator([ RevealDecorator ]);
                return <Editor
                        editorState={EditorState.createWithContent(this.props.face.richTextContent, decorator)}
                        onChange={() => { /* Do nothing */ }}
                        readOnly={true}
                        ref={editor => this.editor = editor}
                    />;
            case FlashCardFaceType.None:
                return <div></div>;
        }
    }
}
