import { ContentBlock, ContentState } from "draft-js";
import * as React from "react";
import { EditorEntity, EntityType, IDraftDecorator, MutabilityType } from "./entity";

class RevealEntity extends EditorEntity<{}> {
    constructor() {
        super(EntityType.Reveal, MutabilityType.Mutable, {});
    }
}

class RevealEditor extends React.Component {
    public render() {
        return <span className="reveal-field editor">
            {this.props.children}
        </span>;
    }
}

interface IRevealState {
    isRevealed: boolean;
}

class Reveal extends React.Component<{}, IRevealState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            isRevealed: false,
        };
    }

    public toggleReveal() {
        this.setState({ isRevealed: ! this.state.isRevealed });
    }

    public render() {
        const className = "reveal-field" + (this.state.isRevealed ? " is-revealed" : "");
        return <span className={className} onClick={this.toggleReveal.bind(this)}>
            {this.state.isRevealed ? this.props.children : "..."}
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

const RevealEditorDecorator: IDraftDecorator = {
    strategy: revealStrategy,
    component: RevealEditor,
};
const RevealDecorator: IDraftDecorator = {
    strategy: revealStrategy,
    component: Reveal,
};
export { RevealEditorDecorator, RevealDecorator, RevealEntity };
