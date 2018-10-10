import * as React from "react";

interface IFadeTransitionProps {
    from: "visible" | "hidden";
    to: "visible" | "hidden";
    onFadeComplete?: () => void;
}

interface IFadeTransitionState {
    isVisible: boolean;
    doTransition: boolean;
}

export default class FadeTransition extends React.Component<IFadeTransitionProps, IFadeTransitionState> {
    private transitionElement: HTMLDivElement | null = null;

    constructor(props: IFadeTransitionProps) {
        super(props);
        this.state = {
            isVisible: props.from === "visible",
            doTransition: props.from !== props.to,
        };
    }

    public componentWillReceiveProps(newProps: IFadeTransitionProps) {
        if (this.props.from !== newProps.from) {
            this.setState({
                isVisible: newProps.from === "visible",
                // Quickly transition to the from state
                doTransition: false,
            });
        }
    }

    public render() {
        const className = this.state.doTransition ? "transition fade" : "";
        return <div className={className}
            onTransitionEnd={this.handleTransitionEnd.bind(this)}
            ref={this.updateTransitionElement.bind(this)}
            style={{ opacity: this.state.isVisible ? 1 : 0 }}>
            {this.props.children}
        </div>;
    }

    private updateTransitionElement(e: HTMLDivElement) {
        this.transitionElement = e;
        if (this.props.to === "visible" && this.state.isVisible === false) {
            // Begin fading in
            // The timeout is used to prevent React from skipping a render
            setTimeout(() => this.setState({
                doTransition: this.props.from !== this.props.to,
                isVisible: true,
            }), 10);
        } else if (this.props.to === "hidden" && this.state.isVisible === true) {
            // Begin hiding
            // The timeout is used to prevent React from skipping a render
            setTimeout(() => this.setState({
                doTransition: this.props.from !== this.props.to,
                isVisible: false,
            }), 10);
        }
    }

    private handleTransitionEnd(e: TransitionEvent) {
        if (this.props.onFadeComplete !== undefined) {
            this.props.onFadeComplete();
        }
    }
}
