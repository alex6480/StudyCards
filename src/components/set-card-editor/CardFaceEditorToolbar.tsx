import { EditorState, RichUtils } from "draft-js";
import * as React from "react";
import { FlashCardFaceType, IFlashCardFace } from "../../lib/flashcard/FlashCardFace";
import DropDown from "../rich-text-editor/DropDown";
import { RevealEntity } from "../rich-text-editor/RevealEntity";
import { BlockStyle, InlineStyle } from "../rich-text-editor/styles";
import { ToolbarButton, ToolbarButtonBlock, ToolbarButtonInline } from "../rich-text-editor/ToolbarButton";
import CardFaceTypeSelect from "./CardFaceTypeSelect";

export interface ICardFaceEditorToolbarProps {
    editorState: EditorState;
    face: IFlashCardFace;
    swapFaces: () => void;
    onChange: (newState: EditorState) => void;
    setType: (type: FlashCardFaceType) => void;
}

export class CardFaceEditorToolbar extends React.Component<ICardFaceEditorToolbarProps, {}> {
    public render() {
        return <div className="card-header flashcard-face-toolbar">
            <div className="field">
                <ToolbarButton editorState={this.props.editorState}
                    onClick={this.props.swapFaces.bind(this)}>
                    {this.props.face.id === "front" ? "F" : "B"}
                </ToolbarButton>
            </div>
            <CardFaceTypeSelect currentType={this.props.face.type} setType={this.props.setType} />
            <div className="field has-addons">
                <ToolbarButtonInline icon="bold" type={InlineStyle.BOLD}
                    editorState={this.props.editorState} toggleStyle={this.toggleInlineStyle.bind(this)} />
                <ToolbarButtonInline icon="italic" type={InlineStyle.ITALIC}
                    editorState={this.props.editorState} toggleStyle={this.toggleInlineStyle.bind(this)} />
                <ToolbarButtonInline icon="underline" type={InlineStyle.UNDERLINE}
                    editorState={this.props.editorState} toggleStyle={this.toggleInlineStyle.bind(this)} />
                <ToolbarButtonInline icon="strikethrough" type={InlineStyle.STRIKETHROUGH}
                    editorState={this.props.editorState} toggleStyle={this.toggleInlineStyle.bind(this)} />
            </div>
            <div className="field">
                <DropDown>
                {/*<a href="#" className="dropdown-item"
                    onClick={this.toggleBlockStyle(BlockStyle.HEADER_ONE)}>
                    Title
                </a>
                <a className="dropdown-item"
                    onClick={this.toggleBlockStyle(BlockStyle.HEADER_TWO)}>
                    Subtitle
                </a>
                <a href="#" className="dropdown-item is-active"
                    onClick={this.toggleBlockStyle(BlockStyle.PARAGRAPH)}>
                    Body
                </a>*/}
                </DropDown>
            </div>
            <div className="field has-addons">
                <ToolbarButtonBlock icon="list-ul" type={BlockStyle.UNORDERED_LIST_ITEM}
                    editorState={this.props.editorState} toggleStyle={this.toggleBlockStyle.bind(this)}/>
                <ToolbarButtonBlock icon="list-ol" type={BlockStyle.ORDERED_LIST_ITEM}
                    editorState={this.props.editorState} toggleStyle={this.toggleBlockStyle.bind(this)}/>
            </div>
            <div className="field">
                <ToolbarButton icon="low-vision" editorState={this.props.editorState}
                    onClick={this.toggleReveal.bind(this)} />
            </div>
        </div>;
    }

    private toggleReveal() {
        new RevealEntity().toggle(this.props.editorState, (newEditorState: EditorState) => {
            this.props.onChange(newEditorState);
        });
    }

    private toggleInlineStyle(style: InlineStyle) {
        this.props.onChange(RichUtils.toggleInlineStyle(this.props.editorState, style));
    }

    private toggleBlockStyle(style: BlockStyle) {
        this.props.onChange(RichUtils.toggleBlockType(this.props.editorState, style));
    }
}
