import * as React  from 'react';
import { EntityType, EditorEntity, MutabilityType, DraftDecorator } from './entity';
import { ContentBlock, ContentState, Entity } from 'draft-js';

export class RevealEntity extends EditorEntity<{}> {
    constructor () {
        super(EntityType.Reveal, MutabilityType.Mutable, {});
    }
}

export class Reveal extends React.Component {
    render () {
        return <span className="reveal-editor-field">
            {this.props.children}
        </span>
    }
}

let revealStrategy = function (block: ContentBlock, callback: (start: number, end: number) => void, contentState: ContentState) {
    block.findEntityRanges((value) => {
        const entityKey = value.getEntity();
        return entityKey != null && contentState.getEntity(entityKey).getType() == EntityType.Reveal
    }, callback);
}

let RevealDecorator: DraftDecorator = {
    strategy: revealStrategy,
    component: Reveal,
}
export { RevealDecorator}