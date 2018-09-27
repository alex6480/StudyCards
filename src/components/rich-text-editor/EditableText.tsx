import * as React from "react";

interface IEditableTextProps {
    value: string;
    onChange?: (newValue: string) => void;
    maxLength?: number;
}

interface IEditableTextState {
    updateSelection?: UpdateSelection;
}

enum UpdateSelection {
    None,
    Start,
    End,
}

export default class EditableText extends React.Component<IEditableTextProps, IEditableTextState> {
    private contentSpan: HTMLSpanElement | null = null;
    private caretPosition?: number = undefined;

    constructor(props: IEditableTextProps) {
        super(props);

        this.state = {
            updateSelection: undefined,
        };
    }

    public render() {
        return <input className="editable-text"
                    onChange={this.handleChange.bind(this)}
                    ref={s => this.contentSpan = s} value={this.props.value} />;
    }

    private handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (this.props.onChange !== undefined && this.contentSpan != null) {
            const text = e.target.value;
            if (text != null && this.props.maxLength !== undefined) {
                this.props.onChange(text.substr(0, Math.min(text.length, this.props.maxLength)));
            }
        }
    }
}
