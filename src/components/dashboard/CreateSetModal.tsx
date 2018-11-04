import * as React from "react";
import IFlashCardSet from "../../lib/flashcard/FlashCardSet";

interface ICreateSetModalProps {
    closeModal: () => void;
    createSet: (set?: Partial<IFlashCardSet>) => void;
}

interface ICreateSetModalState {
    name: string;
}

export default class CreateSetModal extends React.Component<ICreateSetModalProps, ICreateSetModalState> {
    constructor(props: ICreateSetModalProps) {
        super(props);
        this.state = {
            name: "",
        };
    }

    public render() {
        return <div className="modal is-active">
            <div className="modal-background" onClick={this.props.closeModal}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Create new study set</p>
                    <button className="delete"
                        onClick={this.props.closeModal}
                        aria-label="close"></button>
                </header>
                <section className="modal-card-body">
                    { /* Set Name */ }
                    <div className="field">
                        <label className="label">Name</label>
                        <div className="control">
                            <input className="input"
                                value={this.state.name}
                                onChange={e => this.setState({ name: e.target.value })}
                                type="text"
                                placeholder="Set Name" />
                        </div>
                    </div>
                </section>
                <footer className="modal-card-foot">
                <button className="button is-success" onClick={this.createSet.bind(this)}>Create</button>
                <button className="button" onClick={this.props.closeModal}>Cancel</button>
                </footer>
            </div>
        </div>;
    }

    private createSet() {
        this.props.createSet({ name: this.state.name });
    }
}
