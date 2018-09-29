import { ContentState, Editor, EditorState } from "draft-js";
import * as React from "react";
import { FlashCardFaceType, IFlashCardFace } from "../../lib/flashcard/FlashCardFace";

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
                return <div className="card-content content">
                    <Editor
                        editorState={EditorState.createWithContent(this.props.face.richTextContent)}
                        onChange={() => { /* Do nothing */ }}
                        readOnly={true}
                        ref={editor => this.editor = editor}
                    />
                </div>;
            case FlashCardFaceType.None:
                return <div></div>;
        }
    }
}
