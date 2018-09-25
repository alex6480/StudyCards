import * as React from 'react';

interface EditableTextProps {
    value?: string;
    onChange?: (newValue: string) => void;
}

export default class EditableText extends React.Component<EditableTextProps> {
    private contentSpan: HTMLSpanElement | null = null;

    constructor (props: {}) {
        super(props);
    }

    private handleInput () {
        if (this.props.onChange != undefined && this.contentSpan != null) {
            let text = this.contentSpan.textContent;
            if (text != null) {
                this.props.onChange(text);
            }
        }
    }

    render () {
        return <div className="editable-text"
                    suppressContentEditableWarning={true}
                    contentEditable={true}
                    onInput={this.handleInput.bind(this)}
                    ref={s => this.contentSpan = s}>{this.props.value}</div>
    }

    shouldComponentUpdate (nextProps: EditableTextProps, nextState: {}){
        return this.contentSpan != undefined && nextProps.value !== this.contentSpan.textContent;
    }
}