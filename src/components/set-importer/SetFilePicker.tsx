import * as React from 'react';
import FlashCardSet, { ExportFlashCardSet } from '../../lib/flashcard/FlashCardSet';
import * as utils from '../../lib/utils';
import { ParseError } from '../../lib/flashcard/parsers/SetParser';
import { SetParser } from '../../lib/flashcard/parsers/SetParserV1';

interface SetFilePickerProps {
    onChange?: (set: FlashCardSet | null) => void
}

interface SetFilePickerState {
    set: FlashCardSet | null,
    filename: string
}

export default class SetFilePicker extends React.Component<SetFilePickerProps, SetFilePickerState> {
    constructor (props: SetFilePickerProps) {
        super(props);
        this.state = {
            set: null,
            filename: ""
        };
    }

    private handleFileChange (e: React.ChangeEvent<HTMLInputElement>) {
        let files = e.target.files;
        if (files != null && files.length > 0) {
            let reader = new FileReader();
            let file = files[0];
            let self = this;

            reader.onload = (function(){
                var text = reader.result as string;
                self.parseSet(text, result => {
                    self.setState({
                        filename: file.name + " (" + file.size + ")",
                        set: result
                    });
                    if (self.props.onChange) {
                        self.props.onChange(result);
                    }
                }, errors => {
                    console.log(errors);
                });
            });
            reader.readAsText(files[0]);
        } else {
            this.setState({
                filename: ""
            })
        }
    }

    private parseSet (data: string, onSuccess: (result: FlashCardSet) => void, onError: (errors: ParseError[]) => void): void {
        let set = JSON.parse(data) as ExportFlashCardSet;
        // Verify the integrity of the set
        switch (set.exportVersion) {
            case "1":
                new SetParser().parse(set, onSuccess, onError);
            default:
                onError(["Unknown set format"]);
        }
    }
    
    render () {
        return <div className="file has-name">
            <label className="file-label">
                <input className="file-input" type="file" name="flashcardset" onChange={this.handleFileChange.bind(this)} />
                <span className="file-cta">
                    <span className="file-icon">
                        <i className="fas fa-upload"></i>
                    </span>
                    <span className="file-label">
                        Choose a file…
                    </span>
                </span>
                { this.state.set != null && <span className="file-name">
                    { this.state.filename }
                </span> }
            </label>
        </div>
    }
}