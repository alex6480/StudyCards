import { EditorState } from "draft-js";
import * as React from "react";
import { BlockStyle, InlineStyle } from "./styles";

interface IToolbarButtonProps {
    onClick?: (e: React.MouseEvent) => void;
    editorState?: EditorState;
    icon?: string;
}

interface IToolbarButtonState {
    isActive: boolean;
}

export class ToolbarButton<P extends IToolbarButtonProps> extends React.Component<P, IToolbarButtonState> {
    private mouseUpHandler: (e: MouseEvent) => void = this.handleMouseUp.bind(this);

    constructor(props: P) {
        super(props);

        this.state = {
            isActive: false,
        };
    }

    public render() {
        return <p className="control">
            <a className={"button " + (this.state.isActive ? "is-active" : "")}
                onMouseDown={this.handleMouseDown.bind(this)} onClick={this.onClick.bind(this)}>
                { this.props.icon !== undefined && <span className="icon">
                    <i className={"fas fa-" + this.props.icon}></i>
                </span> }
                {this.props.children}
            </a>
        </p>;
    }

    protected onClick(e: React.MouseEvent) {
        if (this.props.onClick) {
            this.props.onClick(e);
        }
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
        this.setState({ isActive: false });
    }
}








interface IToolbarButtonInlineProps extends IToolbarButtonProps {
    type: InlineStyle;
    toggleStyle: (style: InlineStyle) => void;
}

export class ToolbarButtonInline extends ToolbarButton<IToolbarButtonInlineProps> {
    public componentWillReceiveProps(newProps: IToolbarButtonInlineProps) {
        this.setState({ isActive: this.isActive(newProps) });
    }

    protected onClick(e: React.MouseEvent) {
        if (this.props.onClick) {
            this.props.onClick(e);
        } else {
            this.props.toggleStyle(this.props.type);
            this.setState({ isActive: ! this.state.isActive });
        }
    }

    private isActive(props: IToolbarButtonInlineProps) {
        if (props.editorState === undefined) {
            return false;
        }
        const currentStyle = props.editorState.getCurrentInlineStyle();
        return currentStyle.has(this.props.type);
    }
}











interface IToolbarButtonBlockProps extends IToolbarButtonProps {
    type: BlockStyle;
    toggleStyle: (style: BlockStyle) => void;
}

export class ToolbarButtonBlock extends ToolbarButton<IToolbarButtonBlockProps> {
    public componentWillReceiveProps(newProps: IToolbarButtonProps) {
        this.setState({ isActive: this.isActive(newProps) });
    }

    protected onClick(e: React.MouseEvent) {
        if (this.props.onClick) {
            this.props.onClick(e);
        } else {
            this.props.toggleStyle(this.props.type);
            this.setState({ isActive: ! this.state.isActive });
        }
    }

    private isActive(props: IToolbarButtonProps) {
        if (props.editorState === undefined) {
            return false;
        }

        const selection = props.editorState.getSelection();
        const content = props.editorState.getCurrentContent();
        const selectionStartBlockKey = selection.getStartKey();
        if (selectionStartBlockKey == null) {
            return false;
        }
        const block = content.getBlockForKey(selectionStartBlockKey);
        return block.getType() === this.props.type;
    }
}
