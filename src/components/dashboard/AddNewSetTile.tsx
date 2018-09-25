import * as React from 'react';

interface AddNewSetTileProps {
    goToImport: () => void;
    addSet: () => void;
}

export default class AddNewSetTile extends React.Component<AddNewSetTileProps> {
    constructor (props: AddNewSetTileProps) {
        super(props);
        // Set initial state
        this.state = { }
    }

    render () {
        return <div className="column is-2">
            <div className="tile is-vertical">
                <a className="tile button is-primary is-child" onClick={this.props.addSet.bind(this)}>
                    Create new
                </a>
                <a className="tile button is-info is-child" onClick={this.props.goToImport.bind(this)}>
                    Import
                </a>
            </div>
        </div>
    }
}