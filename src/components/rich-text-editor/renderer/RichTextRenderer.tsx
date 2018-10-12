import { ContentBlock, ContentState } from "draft-js";
import * as React from "react";

interface IRichTextRendererProps {
    content: ContentState;
}

const RichTextRenderer: React.SFC<IRichTextRendererProps> = (props) => {
    const blocks = props.content.getBlocksAsArray();
    return <div>
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

interface IRichTextBlockRendererProps {
    block: ContentBlock;
}

const RichTextBlockRenderer: React.SFC<IRichTextBlockRendererProps> = (props) => {
    switch (props.block.getType()) {
        case "unstyled":
            return <div>{ props.block.getText() }</div>;
        case "ordered-list-item":
        case "unordered-list-item":
            return <li>{ props.block.getText() }</li>;
        default:
            return <div style={{color: "red"}}>test</div>;
    }
};

interface IRichTextBlockGroupRendererProps {
    group: IBlockGroup;
}

const RichTextBlockGroupRenderer: React.SFC<IRichTextBlockGroupRendererProps> = (props) => {
    switch (props.group.type) {
        case "plain":
            const block = props.group.blocks[0];
            return <RichTextBlockRenderer block={block} key={block.getKey()} />;
        case "ordered-list":
            return <ol>{props.group.blocks.map(b => <RichTextBlockRenderer block={b} key={b.getKey()} />)}</ol>;
        case "unordered-list":
            return <ul>{props.group.blocks.map(b => <RichTextBlockRenderer block={b} key={b.getKey()}/>)}</ul>;
    }
};

export default RichTextRenderer;
