import * as React from "react";
import { EditorState, DraftBlockType } from "draft-js";
import { BlockStyle, InlineStyle } from "./styles";

interface ToolbarButtonProps {
    onClick?: (e: React.MouseEvent) => void;
    editorState: EditorState,
    icon: string;
}

interface ToolbarButtonState {
    isActive: boolean;
}

export class ToolbarButton<P extends ToolbarButtonProps> extends React.Component<P, ToolbarButtonState> {
    private mouseUpHandler: (e: MouseEvent) => void = this.handleMouseUp.bind(this);
    
    constructor (props: P) {
        super(props);

        this.state = {
            isActive: false,
        };
    }

    private handleMouseDown(e: MouseEvent) {
        e.preventDefault();
        if (! this.state.isActive) {
            this.setState({ isActive: true });
            document.addEventListener("mouseup", this.mouseUpHandler);
        }
    }

    private handleMouseUp() {
        document.removeEventListener("mouseup", this.mouseUpHandler);
        this.setState({ isActive: false })
    }

    protected onClick (e: React.MouseEvent) {
        if (this.props.onClick) {
            this.props.onClick(e);
        }
    }

    render() {
        return <p className="control">
            <a className={"button " + (this.state.isActive ? "is-active" : "")} onMouseDown={this.handleMouseDown.bind(this)} onClick={this.onClick.bind(this)}>
                <span className="icon">
                    <i className={"fas fa-" + this.props.icon}></i>
                </span>
            </a>
        </p>
    }
}








interface ToolbarButtonInlineProps extends ToolbarButtonProps {
    type: InlineStyle
    toggleStyle: (style: InlineStyle) => void
}

export class ToolbarButtonInline extends ToolbarButton<ToolbarButtonInlineProps> {
    public componentWillReceiveProps(newProps: ToolbarButtonInlineProps) {
        this.setState({ isActive: this.isActive(newProps) });
    }

    private isActive (props: ToolbarButtonInlineProps) {
        let currentStyle = props.editorState.getCurrentInlineStyle();
        return currentStyle.has(this.props.type);
    }

    protected onClick (e: React.MouseEvent) {
        if (this.props.onClick) {
            this.props.onClick(e);
        } else {
            this.props.toggleStyle(this.props.type);
            this.setState({ isActive: ! this.state.isActive });
        }
    }
}











interface ToolbarButtonBlockProps extends ToolbarButtonProps {
    type: BlockStyle
    toggleStyle: (style: BlockStyle) => void
}

export class ToolbarButtonBlock extends ToolbarButton<ToolbarButtonBlockProps> {
    public componentWillReceiveProps(newProps: ToolbarButtonProps) {
        this.setState({ isActive: this.isActive(newProps) });
    }

    private isActive (props: ToolbarButtonProps) {
        let selection = props.editorState.getSelection();
        let content = props.editorState.getCurrentContent();
        let selectionStartBlockKey = selection.getStartKey();
        if (selectionStartBlockKey == null) {
            return false;
        }
        let block = content.getBlockForKey(selectionStartBlockKey);
        return block.getType() == this.props.type;
    }
    
    protected onClick (e: React.MouseEvent) {
        if (this.props.onClick) {
            this.props.onClick(e);
        } else {
            this.props.toggleStyle(this.props.type);
            this.setState({ isActive: ! this.state.isActive });
        }
    }
}