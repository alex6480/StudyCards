import * as React from "react";

interface IFadeTransitionProps {
    targetState: "visible" | "hidden";
    onFadeComplete?: () => void;
}

interface IFadeTransitionState {
    isVisible: boolean;
}

export default class FadeTransition extends React.Component<IFadeTransitionProps, IFadeTransitionState> {
    private transitionElement: HTMLDivElement | null = null;

    constructor(props: IFadeTransitionProps) {
        super(props);
        this.state = {
            isVisible: props.targetState !== "visible",
        };
    }

    public render() {
        return <div className={"transition fade" + (this.state.isVisible ? " is-visible" : "")}
            onTransitionEnd={this.handleTransitionEnd.bind(this)}
            ref={this.updateTransitionElement.bind(this)}>
            {this.props.children}
        </div>;
    }

    private updateTransitionElement(e: HTMLDivElement) {
        this.transitionElement = e;
        if (this.props.targetState === "visible" && this.state.isVisible === false) {
            // Begin fading in
            // The timeout is used to prevent React from skipping a render
            setTimeout(() => this.setState({
                isVisible: true,
            }), 10);
        } else if (this.props.targetState === "hidden" && this.state.isVisible === true) {
            // Begin hiding
            // The timeout is used to prevent React from skipping a render
            setTimeout(() => this.setState({
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
