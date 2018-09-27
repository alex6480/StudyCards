/// <reference types="node" />

declare module "react-rte" {
    interface RichTextEditorProps {
        value: EditorValue,
        onChange: (value:EditorValue) => void
    }

    interface RichTextEditorState {

    }

    export default class RichTextEditor extends React.Component<RichTextEditorProps, RichTextEditorState>{
        createEmptyValue(): EditorValue;
    }

    export class EditorValue {
        static createFromString(markup: string, format: string): EditorValue;
        static createEmpty(): EditorValue;
        setContentFromString(markup: string, format: string): EditorValue;
        toString(format: string): string;
    }
}