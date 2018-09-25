import * as React from 'react';
import FlashCardSet from '../../lib/flashcard/FlashCardSet';

interface SetTileProps {
    set: FlashCardSet,
    goToSet: (set: FlashCardSet) => void
}

export default class SetTile extends React.Component<SetTileProps> {
    constructor (props: SetTileProps) {
        super(props);
        // Set initial state
        this.state = { }
    }

    private goToSetDashboard () {
        this.props.goToSet(this.props.set);
    }

    render () {
        let cardCount = Object.keys(this.props.set.cards).length;
        return <div className="column is-3">
            <div className="card">
                <header className="card-header">
                    <p className="card-header-title">{this.props.set.name}</p>
                </header>
                <div className="card-content">
                    <p className="subtitle is-6">{cardCount} {cardCount == 1 ? "card" : "cards"} (26 due today)</p>
                    <p>Last studied <time>September 5th 2018</time></p>
                </div>
                <footer className="card-footer">
                    <div className="card-footer-item">
                        <div className="field has-addons">
                            <p className="control">
                                <a href="#" className="button is-primary" onClick={this.goToSetDashboard.bind(this)}>Study</a>
                            </p>
                            <p className="control">
                                <a href="#" className="button" onClick={this.goToSetDashboard.bind(this)}>Edit</a>
                            </p>
                            <p className="control">
                                <a href="#" className="button is-danger" >Delete</a>
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    }
}