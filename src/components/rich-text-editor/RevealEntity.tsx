import { ContentBlock, ContentState } from "draft-js";
import * as React from "react";
import { EditorEntity, EntityType, IDraftDecorator, MutabilityType } from "./entity";

export class RevealEntity extends EditorEntity<{}> {
    constructor() {
        super(EntityType.Reveal, MutabilityType.Mutable, {});
    }
}

export class Reveal extends React.Component {
    public render() {
        return <span className="reveal-editor-field">
            {this.props.children}
        </span>;
    }
}

function revealStrategy(block: ContentBlock,
                        callback: (start: number, end: number) => void,
                        contentState: ContentState) {
    block.findEntityRanges((value) => {
        const entityKey = value.getEntity();
        return entityKey != null && contentState.getEntity(entityKey).getType() === EntityType.Reveal;
    }, callback);
}

const RevealDecorator: IDraftDecorator = {
    strategy: revealStrategy,
    component: Reveal,
};
export { RevealDecorator };
