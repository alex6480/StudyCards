import * as React from "React";
import * as Utils from "../../lib/utils";

interface ITagFilterProps {
    tags: { [tag: string]: number };
    activeTags: { [tag: string]: boolean };
    onStyle?: string;
    offStyle?: string;
    toggleTag: (tag: string) => void;
}

export class TagFilter extends React.PureComponent<ITagFilterProps> {
    constructor(props: ITagFilterProps) {
        super(props);
    }

    public render() {
        const onStyle = this.props.onStyle !== undefined ? this.props.onStyle : "is-primary";
        const offStyle = this.props.offStyle !== undefined ? this.props.offStyle : "is-white";
        const tagElements = Object.keys(this.props.tags).map(tag =>
            <span className={"tag " + (this.props.activeTags[tag] === true ? onStyle : offStyle)}
                onClick={() => this.props.toggleTag(tag)}
                key={tag}>
                {tag} ({this.props.tags[tag]})
            </span>,
        );

        return <div className="tags">{tagElements}</div>;
    }
}
