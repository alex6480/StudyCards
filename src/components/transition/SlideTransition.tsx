import * as React from "react";

interface ISlideTransitionProps {
    targetState: "collapsed" | "expanded";
    onSlideComplete?: () => void;
}

interface ISlideTransitionState {
    targetHeight?: number;
    isCollapsed: boolean;
}

export default class SlideTransition extends React.Component<ISlideTransitionProps, ISlideTransitionState> {
    private transitionElement: HTMLDivElement | null = null;
    private transitionsCompleted = {
        height: false,
        opacity: false,
    };

    constructor(props: ISlideTransitionProps) {
        super(props);
        let targetHeight: number | undefined;
        if (props.targetState === "collapsed") {
            // The initial height is not set and will be fetched from the object itself
            targetHeight = undefined;
        } else {
            // If the element expanding, the initial height will be 0
            targetHeight = 0;
        }
        this.state = {
            targetHeight,
            isCollapsed: props.targetState !== "collapsed",
        };
    }

    public render() {
        return <div className={"transition slide"}
            ref={this.updateTransitionElement.bind(this)}
            style={{ height: this.state.targetHeight, opacity: this.state.isCollapsed ? 0 : 1 }}
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

        if (this.props.onSlideComplete !== undefined) {
            this.props.onSlideComplete();
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
                if (this.props.targetState === "expanded") {
                    // Begin expanding straight away
                    this.setState({
                        targetHeight,
                        isCollapsed: false,
                    });
                } else {
                    // We need to update the height first before we begin collapsing
                    this.setState({ targetHeight });
                }
            }
        }
    }
}
