import * as React from "react";
import IFlashCardSet, { ExportFlashCardSet } from "../../lib/flashcard/FlashCardSet";
import parseSet, { ParseError } from "../../lib/flashcard/parsers/parseSet";

interface ISetFilePickerProps {
    onChange?: (set: IFlashCardSet | null) => void;
}

interface ISetFilePickerState {
    set: IFlashCardSet | null;
    filename: string;
}

export default class SetFilePicker extends React.Component<ISetFilePickerProps, ISetFilePickerState> {
    constructor(props: ISetFilePickerProps) {
        super(props);
        this.state = {
            set: null,
            filename: "",
        };
    }

    public render() {
        return <div className="file has-name">
            <label className="file-label">
                <input className="file-input" type="file" name="flashcardset"
                    onChange={this.handleFileChange.bind(this)} />
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
        </div>;
    }

    private handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (files != null && files.length > 0) {
            const reader = new FileReader();
            const file = files[0];
            const self = this;

            reader.onload = (() => {
                const text = reader.result as string;
                self.parseSet(text, result => {
                    self.setState({
                        filename: file.name + " (" + file.size + ")",
                        set: result,
                    });
                    if (self.props.onChange) {
                        self.props.onChange(result);
                    }
                }, errors => {
                    throw new Error(errors.join(","));
                });
            });
            reader.readAsText(files[0]);
        } else {
            this.setState({
                filename: "",
            });
        }
    }

    private parseSet(data: string, onSuccess: (result: IFlashCardSet) => void,
                     onError: (errors: ParseError[]) => void): void {
        const set = JSON.parse(data) as ExportFlashCardSet;
        // Verify the integrity of the set
        switch (set.exportVersion) {
            case "1":
                parseSet(set, onSuccess, onError);
            default:
                onError(["Unknown set format"]);
        }
    }
}
