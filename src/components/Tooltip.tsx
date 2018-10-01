import * as React from "react";

interface ITooltipProps {
    message: string;
}

interface ITooltipState {
    active: boolean;
}

export default class Tooltip extends React.Component<ITooltipProps, ITooltipState> {
    constructor(props: ITooltipProps) {
        super(props);

        this.state = {
            active: false,
        };
    }

    public render() {
        return <span className="tooltip">
            <span className="tag is-dark"
                onMouseEnter={() => this.setState({active: true})}
                onMouseLeave={() => this.setState({active: false})}>
                {this.props.children}
            </span>
            { this.state.active && <span className="tooltip-tip">{this.props.message}</span> }
        </span>;
    }
}
