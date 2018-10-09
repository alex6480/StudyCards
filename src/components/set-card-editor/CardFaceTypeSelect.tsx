import * as React from "react";
import { FlashCardFaceType } from "../../lib/flashcard/FlashCardFace";

export interface ICardFaceTypeSelectProps {
    currentType: FlashCardFaceType;
    setType: (type: FlashCardFaceType) => void;
}

export default class CardFaceTypeSelect extends React.Component<ICardFaceTypeSelectProps, {}> {
    public render() {
        return <div className="field has-addons">
            <p className="control">
                <a className={"button" + this.active(FlashCardFaceType.RichText)}
                    onClick={() => this.props.setType(FlashCardFaceType.RichText)}>
                    <span className="icon">
                        <i className="fas fa-pen-square"></i>
                    </span>
                </a>
            </p>

            <p className="control">
                <a className={"button" + this.active(FlashCardFaceType.Image)}
                    onClick={() => this.props.setType(FlashCardFaceType.Image)}>
                    <span className="icon">
                        <i className="fas fa-image"></i>
                    </span>
                </a>
            </p>

            <p className="control">
                <a className={"button" + this.active(FlashCardFaceType.None)}
                    onClick={() => this.props.setType(FlashCardFaceType.None)}>
                    <span className="icon is-danger">
                        <i className="fas fa-minus-circle"></i>
                    </span>
                </a>
            </p>
        </div>;
    }

    private active(type: FlashCardFaceType) {
        return type === this.props.currentType ? " is-active" : "";
    }
}
