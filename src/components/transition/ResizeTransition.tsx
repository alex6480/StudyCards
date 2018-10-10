import * as React from "react";

interface IResizeTransitionProps {
    onResizeComplete?: () => void;
    /**
     * When set to false, the element will skip directly to the next state without any transition.
     */
    doTransition?: boolean;
}

interface IResizeTransitionState {
    targetHeight?: number;
    transitionComplete: boolean;
}

export default class ResizeTransition extends React.Component<IResizeTransitionProps, IResizeTransitionState> {
    private transitionElement: HTMLDivElement | null = null;
    private transitionsCompleted = {
        height: false,
        opacity: false,
    };

    constructor(props: IResizeTransitionProps) {
        super(props);
        this.state = {
            targetHeight: undefined,
            transitionComplete: false,
        };
    }

    public render() {
        return <div className={this.props.doTransition === false ? "" : "transition slide"}
            ref={this.updateTransitionElement.bind(this)}
            style={{ height: this.state.transitionComplete ? undefined : this.state.targetHeight }}
            onTransitionEnd={this.handleTransitionEnd.bind(this)}>
            {this.props.children}
        </div>;
    }

    private handleTransitionEnd(e: TransitionEvent) {
        if (e.propertyName !== "height" && e.propertyName !== "opacity") {
            throw new Error("Unknown property " + e.propertyName);
        }
        this.transitionsCompleted[e.propertyName] = true;
        for (const transition of Object.keys(this.transitionsCompleted)) {
            if (this.transitionsCompleted[transition as "height" | "opacity"] === false) {
                return;
            }
        }

        // Allow auto height in the future
        this.setState({ transitionComplete: true });

        if (this.props.onResizeComplete !== undefined) {
            this.props.onResizeComplete();
        }
    }

    private updateTransitionElement(e: HTMLDivElement) {
        this.transitionElement = e;
        if (this.transitionElement !== null) {
            let targetHeight = 0;
            for (const child of this.transitionElement.children) {
                targetHeight += (child as HTMLElement).offsetHeight;
            }

            if (targetHeight !== this.state.targetHeight) {
                this.setState({
                    targetHeight,
                    transitionComplete: false,
                });
            }
        }
    }
}
