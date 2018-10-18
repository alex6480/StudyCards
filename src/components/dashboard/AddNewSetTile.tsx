import * as React from "react";
import { Link } from "react-router-dom";

interface IAddNewSetTileProps {
    addSet: () => void;
}

export default class AddNewSetTile extends React.Component<IAddNewSetTileProps> {
    constructor(props: IAddNewSetTileProps) {
        super(props);
        // Set initial state
        this.state = { };
    }

    public render() {
        return <div className="column is-2">
            <div className="tile is-vertical">
                <a className="tile button is-primary is-child" onClick={this.props.addSet}>
                    Create new
                </a>
                <Link className="tile button is-info is-child" to="/import">
                    Import
                </Link>
            </div>
        </div>;
    }
}
