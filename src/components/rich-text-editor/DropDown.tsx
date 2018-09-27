import * as React from "react";

interface IDropDownState {
    isDown: boolean;
    toggleBlockStyle?: () => void;
}

export default class DropDown extends React.Component<{}, IDropDownState> {
    private rootElement: HTMLElement | null = null;
    private clickHandler = this.handleClick.bind(this);

    constructor(props: {}) {
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

        return <div className={"dropdown " + (this.state.isDown ? "is-active " : "")}
                    onMouseDown={e => e.preventDefault()} onClick={this.toggle.bind(this)}>
                <div className="dropdown-trigger">
                    <button className="button" aria-haspopup="true" aria-controls="dropdown-menu">
                        <span>Body</span>
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
