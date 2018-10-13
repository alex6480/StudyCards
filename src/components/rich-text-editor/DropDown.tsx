import * as React from "react";

interface IDropDownState {
    isDown: boolean;
    toggleBlockStyle?: () => void;
}

interface IDropDownProps {
    children: React.ReactElement<DropDownItem>[];
}

export default class DropDown extends React.Component<IDropDownProps, IDropDownState> {
    private rootElement: HTMLElement | null = null;
    private clickHandler = this.handleClick.bind(this);

    constructor(props: IDropDownProps) {
        super(props);
        this.state = {
            isDown: false,
        };
    }

    public componentWillUpdate(nextProps: {}, nextState: IDropDownState) {
        // Listen for clicks outside the dropdown when it is down
        if (nextState.isDown !== this.state.isDown) {
            if (nextState.isDown) {
                document.addEventListener("click", this.clickHandler);
            } else {
                document.removeEventListener("click", this.clickHandler);
            }
        }
    }

    public render() {
        const options = <div className="dropdown-menu" id="dropdown-menu" role="menu" ref={e => this.rootElement = e}>
            <div className="dropdown-content">
                {this.props.children}
            </div>
        </div>;

        // Any is used because for some reason the typings are incorrect here
        const activeChild: any = this.props.children.find((c: any) => c.props !== undefined && c.props.isActive);
        const activeChildChildren = activeChild === undefined
            ? undefined
            : activeChild.props.children;

        return <div className={"dropdown " + (this.state.isDown ? "is-active " : "")}
                    onMouseDown={e => e.preventDefault()} onClick={this.toggle.bind(this)}>
                <div className="dropdown-trigger">
                    <button className="button" aria-haspopup="true" aria-controls="dropdown-menu">
                        <span>{activeChildChildren}</span>
                        <span className="icon is-small">
                            <i className="fas fa-angle-down" aria-hidden="true"></i>
                        </span>
                    </button>
                </div>
                { this.state.isDown && options}
            </div>;
    }

    private drop() {
        this.setState({isDown: true});
    }

    private toggle() {
        this.setState({isDown: ! this.state.isDown});
    }

    private collapse() {
        this.setState({isDown: false});
    }

    private handleClick(e: MouseEvent) {
        if (this.rootElement != null && e.target != null && this.rootElement.contains(e.target as Node)) {
            // Clicked inside of the dropdown
        } else {
            // Clicked outside of the dropdown
            this.collapse();
        }
    }
}

interface IDropDownItemProps {
    onClick?: () => void;
    isActive: boolean;
}

export class DropDownItem extends React.Component<IDropDownItemProps> {
    public render() {
        const className = this.props.isActive ? "dropdown-item is-active" : "dropdown-item";
        return <a className={className} onClick={this.props.onClick}>{this.props.children}</a>;
    }
}
