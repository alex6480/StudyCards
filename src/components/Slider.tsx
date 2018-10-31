import * as React from "react";

interface ISliderProps {
    currentPosition: number;
    onDrag?: (newPosition: number) => void;
    showDirectInput?: boolean;
    sections: ISliderSection[];
}

interface ISliderSection {
    color: string;
    from: number;
    to: number;
}

export class Slider extends React.PureComponent<ISliderProps> {
    private sliderElement: HTMLDivElement | null = null;
    private mouseMoveHandler = this.updatePosition.bind(this);
    private mouseUpHandler = this.onMouseUp.bind(this);

    constructor(props: ISliderProps) {
        super(props);

        // Force the current position into a section (if it is between sections)
        this.updateValue(props.currentPosition);
    }

    public componentWillReceiveProps(newProps: ISliderProps) {
        if (newProps.sections.length === 0) {
            throw new Error("At least one section expected");
        }

        // Force the current position into a section (if it is between sections)
        const newPosition = this.moveToNearestRange(newProps.currentPosition, newProps.sections);
        if (newProps.onDrag !== undefined && newPosition !== this.props.currentPosition) {
            newProps.onDrag(newPosition);
        }
    }

    public render() {
        // Determine the interval of values that can be selected in this slider
        const {from, to} = this.getGlobalFromTo(this.props.sections);
        const range = to - from;

        return <div className="control slider-control">
            {this.props.showDirectInput === true &&
                <input className="input" type="number" value={this.props.currentPosition}
                    onChange={e => this.updateValue(Number(e.target.value))}></input>}
            <div className="slider"
                ref={e => this.sliderElement = e}
                onPointerDown={this.beginDrag.bind(this)}>
                <div className="slider-sections">
                    {this.props.sections.map(s =>
                        <div className="slider-section"
                            key={s.from}
                            style={{
                                left: (s.from / range * 100) + "%",
                                right: (100 - s.to / range * 100) + "%",
                                backgroundColor: s.color,
                            }}></div>,
                    )}
                </div>
                <div className="slider-pointer"
                    style={{ left: (this.props.currentPosition / range * 100) + "%" }}></div>
            </div>
        </div>;
    }

    private beginDrag() {
        window.addEventListener("pointerup", this.mouseUpHandler);
        window.addEventListener("pointermove", this.mouseMoveHandler);
    }

    private onMouseUp() {
        window.removeEventListener("pointerup", this.mouseUpHandler);
        window.removeEventListener("pointermove", this.mouseMoveHandler);
    }

    private updateValue(newValue: number) {
        if (this.props.onDrag !== undefined) {
            newValue = this.moveToNearestRange(newValue, this.props.sections);
            if (newValue !== this.props.currentPosition) {
                this.props.onDrag(newValue);
            }
        }
    }

    private updatePosition(e: MouseEvent) {
        if (this.sliderElement === null) {
            return;
        }

        const rect = this.sliderElement.getBoundingClientRect();
        // The mouse x position relative to the element
        const mouseX = (e.clientX - rect.left) / rect.width;
        const {from, to} = this.getGlobalFromTo(this.props.sections);
        const newValue = mouseX * (to - from) + from;
        this.updateValue(newValue);
    }

    private moveToNearestRange(position: number, ranges: { from: number, to: number}[]) {
        if (ranges.length === 0) {
            throw new Error("At least one range expected");
        }

        let nearestInRange: number | null = null;
        for (const range of ranges) {
            if (position >= range.from && position <= range.to) {
                return position;
            } else {
                const distanceStart = Math.abs(range.from - position);
                const distanceEnd = Math.abs(range.to - position);
                if (nearestInRange === null) {
                    nearestInRange = distanceStart <= distanceEnd ? range.from : range.to;
                } else {
                    const oldDistance = Math.abs(nearestInRange - position);
                    if (oldDistance > distanceStart) {
                        nearestInRange = range.from;
                    } else if (oldDistance > distanceEnd) {
                        nearestInRange = range.to;
                    }
                }
            }
        }

        // Assuming that there is at least one range in the array, this will never be null
        return nearestInRange!;
    }

    /**
     * Returns the beginning of the first range in the set and the end of the last
     */
    private getGlobalFromTo(ranges: { from: number, to: number }[]) {
        return ranges.reduce((p, c) => ({
            from: Math.min(c.from, p.from),
            to: Math.max(c.to, p.to),
        }), {
            from: ranges[0].from,
            to: ranges[0].to,
        });
    }
}
