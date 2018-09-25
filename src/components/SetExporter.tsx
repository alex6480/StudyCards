import * as React from "react";
import FlashCardSet, { ExportFlashCardSet } from "../lib/flashcard/FlashCardSet";

interface SetExporterProps {
    set: FlashCardSet;
}

interface SetExporterState {
    filename: string;
}

export default class SetExporter extends React.Component<SetExporterProps, SetExporterState> {
    render () {
        return <div className="container">
            <h3 className="title is-3">Export Set</h3>
            <p className="subtitle is-4">Exports the set '{this.props.set.name}' into a study cards set file (*.scset).</p>
            <div className="box">
                <div className="field">
                    <label className="label">File Name</label>
                    <div className="control has-icons-left">
                        <input className="input" type="text" placeholder="Name of the file" onChange={(e) => this.setState({ filename: e.target.value })}/>
                        <span className="icon is-small is-left">
                            <i className="fas fa-file"></i>
                        </span>
                    </div>
                </div>

                <div className="field">
                    <div className="control">
                        <a className="button is-primary" onClick={this.export.bind(this)}>Export</a>
                    </div>
                </div>
            </div>
        </div>
    }

    private export () {
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(new ExportFlashCardSet(this.props.set)));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", this.state.filename + ".json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
}