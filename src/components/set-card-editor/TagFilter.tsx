import * as React from "React";
import * as Utils from "../../lib/utils";

interface ITagFilterProps {
    tags: { [tag: string]: number };
    activeTags: { [tag: string]: boolean };
    toggleTag: (tag: string) => void;
}

export class TagFilter extends React.PureComponent<ITagFilterProps> {
    constructor(props: ITagFilterProps) {
        super(props);
    }

    public render() {
        const tagElements = Object.keys(this.props.tags).map(tag =>
            <span className={"tag" + (this.props.activeTags[tag] === true ? " is-primary" : " is-white")}
                onClick={() => this.props.toggleTag(tag)}
                key={tag}>
                {tag} ({this.props.tags[tag]})
            </span>,
        );

        return<div>
            <p>Only show cards with the following tags:</p>
            <div className="tags">{tagElements}</div>
        </div>;
    }
}
