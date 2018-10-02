import * as React from "react";
import * as ReactDOM from "react-dom";

interface ITagEditorProps {
    tags: string[];
    onChange: (tags: string[]) => void;
}

interface ITagEditorState {
    partialTag: string;
}

export class TagEditor extends React.Component<ITagEditorProps, ITagEditorState> {
    private tagInput: HTMLSpanElement | null = null;

    constructor(props: ITagEditorProps) {
        super(props);
        this.state = {
            partialTag: "",
        };
    }

    public render() {
        return <div className="tags tag-editor" onClick={this.focusTagInput.bind(this)}>
            { this.props.tags.map(this.renderTag.bind(this)) }
            <input type="text"
                className="tag tag-input"
                onChange={this.onChange.bind(this)}
                onKeyDown={this.onKeyDown.bind(this)}
                ref={i => this.tagInput = i}
                placeholder={"Add tag"}
                maxLength={30}
                value={this.state.partialTag} />
        </div>;
    }

    private renderTag(tag: string) {
        return <span className="tag is-info" key={tag}>
            {tag}
            <button className="delete is-small" onClick={this.tagDeleteClicked.bind(this)}></button>
        </span>;
    }

    private tagDeleteClicked(event: React.MouseEvent) {
        const tagElement = (event.target as HTMLElement).parentElement;
        if (tagElement !== null) {
            const tag = tagElement.innerText;
            this.props.onChange(this.props.tags.filter(t => t !== tag));
        }
    }

    private onChange(event: React.ChangeEvent<HTMLInputElement>) {
        let partialTag = event.target.value;
        // Only allow alphanummerical, hyphens and underscores
        partialTag = partialTag.replace(/[^a-z0-9-\_ ]/gi, "");

        const spaceIndex = partialTag.indexOf(" ");
        if (spaceIndex === -1) {
            // No space. Just update the text
            this.setState({ partialTag: event.target.value });
        } else {
            // Space. Add a new tag
            const newTag = partialTag.substr(0, spaceIndex);
            this.updateTags(this.props.tags.concat(newTag));
            this.setState({ partialTag: "" });
        }
    }

    private onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Backspace") {
            if (this.state.partialTag === "" && this.props.tags.length > 0) {
                this.updateTags(this.props.tags.slice(0, this.props.tags.length - 1));
            }
        }
    }

    private focusTagInput() {
        if (this.tagInput !== null && document.activeElement !== ReactDOM.findDOMNode(this.tagInput)) {
            this.tagInput.focus();
        }
    }

    private updateTags(newTags: string[]) {
        newTags = newTags.filter((v, i, a) => a.indexOf(v) === i);
        this.props.onChange(newTags);
    }
}
