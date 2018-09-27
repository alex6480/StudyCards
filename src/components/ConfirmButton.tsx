import * as React from "react";

interface IConfirmButtonProps {
    children: React.ReactNode;
    onConfirmed?: () => void;
    /**
     * A space separated list of bulma modifiers
     */
    buttonModifiers: string;
    confirmDuration?: number;
}

interface IConfirmButtonState {
    secondsUntilConfirmed: number | undefined;
}

// State is never set so we use the '{}' type.
export class ConfirmButton extends React.Component<IConfirmButtonProps, IConfirmButtonState> {
    private static readonly defaultConfirmDuration: number = 3;
    private intervalHandle: NodeJS.Timer | undefined = undefined;

    constructor(props: IConfirmButtonProps) {
        super(props);
        this.state = {
            secondsUntilConfirmed: undefined,
        };
    }

    public render() {
        if (this.state.secondsUntilConfirmed === undefined) {
            return <a className={"button " + this.props.buttonModifiers}
                    onMouseDown={() => this.beginConfirm()}
                    draggable={false}>
                        {this.props.children}
                    </a>;
        } else {
            return <a className={"button " + this.props.buttonModifiers}
                        onMouseUp={() => this.stopConfirm()}
                        onMouseLeave={() => this.stopConfirm()}
                        draggable={false}>
                            Hold for {this.state.secondsUntilConfirmed} seconds to confirm
                    </a>;
        }
    }

    private get confirmDuration() {
        return this.props.confirmDuration ? this.props.confirmDuration : ConfirmButton.defaultConfirmDuration;
    }

    private updateTimer() {
        // Just in case secondsUntilConfirmed is undefined (to prevent TypeScript from complaining)
        if (this.state.secondsUntilConfirmed === undefined) {
            this.stopConfirm();
            return;
        }

        const secondsUntilConfirmed = this.state.secondsUntilConfirmed - 1;
        if (secondsUntilConfirmed === 0) {
            if (this.props.onConfirmed) {
                this.props.onConfirmed();
            }
            this.stopConfirm();
        } else {
            this.setState({ secondsUntilConfirmed });
        }
    }

    private beginConfirm() {
        this.setState({secondsUntilConfirmed: this.confirmDuration});
        this.intervalHandle = setInterval(() => this.updateTimer(), 1000);
    }

    private stopConfirm() {
        // Destroy the timer
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
        }
        this.setState({secondsUntilConfirmed: undefined});
    }
}
