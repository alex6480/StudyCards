import * as React from "react";

interface IEditableTextProps {
    value: string;
    onChange?: (newValue: string) => void;
    onBlur?: (newValue: string) => void;
    maxLength?: number;
    readOnly?: boolean;
}

interface IEditableTextState {
    updateSelection?: UpdateSelection;
    value: string;
}

enum UpdateSelection {
    None,
    Start,
    End,
}

export default class EditableText extends React.Component<IEditableTextProps, IEditableTextState> {
    private contentSpan: HTMLSpanElement | null = null;

    constructor(props: IEditableTextProps) {
        super(props);

        this.state = {
            updateSelection: undefined,
            value: props.value,
        };
    }

    public componentWillReceiveProps(newProps: IEditableTextProps) {
        if (newProps.value !== this.props.value) {
            this.setState({value: newProps.value});
        }
    }

    public render() {
        return <input className="editable-text"
                    readOnly={this.props.readOnly}
                    onChange={this.handleChange.bind(this)}
                    onBlur={this.handleBlur.bind(this)}
                    maxLength={this.props.maxLength}
                    ref={s => this.contentSpan = s} value={this.state.value} />;
    }

    private handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (this.contentSpan != null) {
            const text = e.target.value;
            if (text != null) {
                this.setState({ value: text });
                if (this.props.onChange !== undefined) { this.props.onChange(text); }
            }
        }
    }

    private handleBlur() {
        if (this.props.onBlur !== undefined) {
            this.props.onBlur(this.state.value);
        }
    }
}
