import * as React from "React";
import * as Utils from "../../lib/utils";

interface ITagFilterProps {
    availableTags: { [tag: string]: number };
}

interface ITagFilterState {
    tags: { [tag: string]: boolean };
}

export class TagFilter extends React.PureComponent<ITagFilterProps, ITagFilterState> {
    constructor(props: ITagFilterProps) {
        super(props);

        this.state = {
            tags: Utils.arrayToObject(Object.keys(props.availableTags), tag => [tag, false]),
        };
    }

    public componentWillReceiveProps(newProps: ITagFilterProps) {
        this.setState({
            tags: Utils.arrayToObject(Object.keys(newProps.availableTags), tag => {
                return [tag, this.state.tags[tag] === true];
            }),
        });
    }

    public render() {
        const tagElements = Object.keys(this.props.availableTags).map(tag =>
            <span className={"tag" + (this.state.tags[tag] === true ? " is-primary" : " is-white")}
                onClick={() => this.toggleTag(tag)}>
                {tag} ({this.props.availableTags[tag]})
            </span>,
        );

        return<div>
            <p>Only show cards with the following tags:</p>
            <div className="tags">{tagElements}</div>
        </div>;
    }

    private toggleTag(tag: string) {
        if (this.props.availableTags[tag] !== undefined) {
            this.setState({
                tags: {
                    ...this.state.tags,
                    [tag]: ! this.state.tags[tag],
                },
            });
        }
    }
}
