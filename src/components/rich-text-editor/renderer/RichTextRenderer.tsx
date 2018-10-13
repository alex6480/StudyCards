import { ContentBlock, ContentState } from "draft-js";
import * as React from "react";

interface IRichTextRendererProps {
    content: ContentState;
    onMouseEnter?: () => void;
}

const RichTextRenderer: React.SFC<IRichTextRendererProps> = (props) => {
    const blocks = props.content.getBlocksAsArray();
    return <div className="DraftEditor-editorContainer" onMouseEnter={props.onMouseEnter}>
        { groupBlocks(blocks).map(g => <RichTextBlockGroupRenderer group={g} key={g.key}/>) }
    </div>;
};

interface IBlockGroup {
    key: number;
    type: "plain" | "ordered-list" | "unordered-list";
    blocks: ContentBlock[];
}

function groupBlocks(blocks: ContentBlock[]) {
    const output: IBlockGroup[] = [];
    let currentGroup: IBlockGroup | null = null;

    for (const block of blocks) {
        switch (block.getType()) {
            case "ordered-list-item":
                if (currentGroup !== null && currentGroup.type !== "ordered-list") {
                    output.push(currentGroup);
                    currentGroup = { key: output.length, type: "ordered-list", blocks: [block] };
                }
                if (currentGroup === null) {
                    currentGroup = { key: output.length, type: "ordered-list", blocks: [block] };
                }
                currentGroup.blocks.push(block);
                break;
            case "unordered-list-item":
                if (currentGroup !== null && currentGroup.type !== "unordered-list") {
                    output.push(currentGroup);
                    currentGroup = { key: output.length, type: "unordered-list", blocks: [block] };
                }
                if (currentGroup === null) {
                    currentGroup = { key: output.length, type: "unordered-list", blocks: [block] };
                }
                currentGroup.blocks.push(block);
                break;
            default:
                if (currentGroup !== null) {
                    output.push(currentGroup);
                }
                currentGroup = { key: output.length, type: "plain", blocks: [block] };
        }
    }

    if (currentGroup !== null) {
        output.push(currentGroup);
    }

    return output;
}

interface IRichTextBlockGroupRendererProps {
    group: IBlockGroup;
}

const RichTextBlockGroupRenderer: React.SFC<IRichTextBlockGroupRendererProps> = (props) => {
    switch (props.group.type) {
        case "plain":
            const block = props.group.blocks[0];
            return <RichTextBlockRenderer block={block} key={block.getKey() + "-b0"} />;
        case "ordered-list":
            return <ol className="public-DraftStyleDefault-ol">{props.group.blocks.map((b, index) =>
            <RichTextBlockRenderer block={b} key={b.getKey() + "-b" + index} />)}</ol>;
        case "unordered-list":
            return <ul className="public-DraftStyleDefault-ul">{props.group.blocks.map((b, index) =>
            <RichTextBlockRenderer block={b} key={b.getKey() + "-b" + index}/>)}</ul>;
    }
};

interface IRichTextBlockRendererProps {
    block: ContentBlock;
}

const RichTextBlockRenderer: React.SFC<IRichTextBlockRendererProps> = (props) => {
    const output = [];
    const characterMeta = props.block.getCharacterList();
    const blockText = props.block.getText();
    let cursor: number = 0;
    for (let i = 0; i < characterMeta.count() - 2; i++) {
        const value = characterMeta.get(i);
        const nextValue = characterMeta.get(i + 1);

        if (value.getEntity() !== nextValue.getEntity()) {
            const text = blockText.substr(cursor, i);
            output.push(<RichTextLineRenderer
                            key={props.block.getKey() + "l" + cursor + "-" + i}
                            from={cursor}
                            to={i} block={props.block} />);
            cursor = i;
        }
    }
    output.push(<RichTextLineRenderer
                    key={props.block.getKey() + "l" + cursor + "-" + (characterMeta.count() - 1)}
                    from={cursor}
                    to={characterMeta.count()}
                    block={props.block} />);

    const type = props.block.getType();
    switch (props.block.getType()) {
        case "unstyled":
            return <div className="public-DraftStyleDefault-block">{output}</div>;
        case "ordered-list-item":
        case "unordered-list-item":
            const className = "public-DraftStyleDefault-" + type + " public-DraftStyleDefault-reset "
                + "public-DraftStyleDefault-depth0 public-DraftStyleDefault-listLTR";
            return <li className={className}>{output}</li>;
        default:
            return <div style={{color: "red"}}>UNKNOWN BLOCK</div>;
    }
};

interface IRichTextLineRendererProps {
    from: number;
    to: number;
    block: ContentBlock;
}

const RichTextLineRenderer: React.SFC<IRichTextLineRendererProps> = (props) => {
    const output: JSX.Element[] = [];
    const characterMeta = props.block.getCharacterList();
    const blockText = props.block.getText();
    let cursor: number = props.from;
    for (let i = props.from; i < props.to - 1; i++) {
        const value = characterMeta.get(i);
        const nextValue = characterMeta.get(i + 1);

        if (value.getStyle() !== nextValue.getStyle()) {
            const text = blockText.substr(cursor, i);
            output.push(<RichTextStyleRenderer
                            key={props.block.getKey() + "s" + cursor + "-" + i}
                            text={text}
                            styles={value.getStyle().toArray()} />);
            cursor = i;
        }
    }
    output.push(<RichTextStyleRenderer
                    key={props.block.getKey() + "s" + cursor + "-" + props.to}
                    text={blockText.substr(cursor, props.to)}
                    styles={props.block.getInlineStyleAt(cursor + 1).toArray()} />);

    return <>{output}</>;
};

interface IRichTextStyleRendererProps {
    text: string;
    styles: string[];
}

const RichTextStyleRenderer: React.SFC<IRichTextStyleRendererProps> = (props) => {
    let output: JSX.Element = <>{props.text}</>;
    for (const style of props.styles) {
        switch (style) {
            case "BOLD":
                output = <b>{output}</b>;
                break;
            case "ITALIC":
                output = <em>{output}</em>;
                break;
            case "STRIKETHROUGH":
                output = <s>{output}</s>;
                break;
            case "UNDERLINE":
                output = <u>{output}</u>;
                break;
        }
    }

    return output;
};

export default RichTextRenderer;
