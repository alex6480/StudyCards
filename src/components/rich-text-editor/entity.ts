import { ContentBlock, ContentState, EditorState, Modifier, SelectionState } from "draft-js";
import * as React from "react";
import "react-dom";
import { RevealEntity } from "./RevealEntity";

export enum EntityType {
    Reveal = "reveal",
}

export enum MutabilityType {
    Mutable = "MUTABLE",
    Immutable = "IMMUTABLE",
    Segmented = "SEGMENTED",
}

export class EditorEntity<D> {
    private readonly type: EntityType;
    private readonly mutability: MutabilityType;
    private readonly data: D;

    constructor(type: EntityType, mutability: MutabilityType, data: D) {
        this.type = type;
        this.mutability = mutability;
        this.data = data;
    }

    /**
     * Returns a new contentstate where a new entity has been created
     */
    public create(contentState: ContentState): ContentState {
        const contentStateWithEntity = contentState.createEntity(this.type, this.mutability, this.data);
        return contentStateWithEntity;
    }

    /**
     * Returns a new contenstate where this entity has been toggled for the current
     * selection (similar to the build in inline styles)
     * 4 possibilities
     * 1. Selection is empty, cursor not in reveal     -> Word is turned into reveal
     * 2. Selection is empty, cursor in reveal         -> Reveal is removed
     * 3. Selection is not empty, cursor not in reveal -> Selection is made to reveal
     * 4. Seleciton is not empty, cursor is in reveal  -> Reveal is removed from selection
     */
    public toggle(editorState: EditorState, callback: (editorState: EditorState) => void) {
        // Create a new reveal entity
        const contentState = editorState.getCurrentContent();
        const selection = editorState.getSelection();
        const endKey = selection.getEndKey();
        const startOffset = selection.getStartOffset();
        const endOffset = selection.getEndOffset();
        const blockKey = selection.getStartKey();
        const block: ContentBlock = contentState.getBlockForKey(blockKey);

        // If the selection start and end are in the same block and the offset is the same, then nothing is selected
        let newContentState: ContentState;
        if (endKey === blockKey && startOffset === endOffset) {
            // Nothing is selected. Just toggle at the cursor
            const entityKey = block.getEntityAt(selection.getStartOffset());
            if (entityKey == null) {
                // Find the selection and create an entity
                const text = block.getText();
                const prevSpace = text.lastIndexOf(" ", startOffset - 1);
                const nextSpace = text.indexOf(" ", startOffset);

                const nextContentState = this.create(contentState);
                const newEntityKey = nextContentState.getLastCreatedEntityKey();
                const wordSelection = selection.merge({
                    anchorKey: blockKey,
                    anchorOffset: prevSpace !== -1 ? prevSpace + 1 : 0,
                    focusOffset: nextSpace !== -1 ? nextSpace : text.length,
                    focusKey: blockKey,
                }) as SelectionState;
                newContentState = Modifier.applyEntity(nextContentState, wordSelection, newEntityKey);
                return callback(EditorState.push(editorState, newContentState, "apply-entity"));
            } else {
                // Remove the entity
                block.findEntityRanges((value) => {
                    const key = value.getEntity();
                    return key != null && contentState.getEntity(key).getType() === this.type;
                }, (start: number, stop: number) => {
                    if (start <= startOffset && stop >= endOffset) {
                        const entitySelection = selection.merge({
                            anchorKey: blockKey,
                            anchorOffset: start,
                            focusKey: blockKey,
                            focusOffset: stop,
                        }) as SelectionState;
                        newContentState = Modifier.applyEntity(contentState, entitySelection, null);
                        return callback(EditorState.push(editorState, newContentState, "apply-entity"));
                    }
                });
            }
        } else {
            // Figure out whether to toggle the entity on or off based on the entity at the start of the selection
            const selectedEntityKey = block.getEntityAt(startOffset);
            const toggleOn = selectedEntityKey == null ||
                            contentState.getEntity(selectedEntityKey).getType() !== this.type;
            if (toggleOn) {
                // Toggle the entity on
                const contentStateWithEntity = this.create(contentState);
                const newEntityKey = contentStateWithEntity.getLastCreatedEntityKey();
                newContentState = Modifier.applyEntity(contentStateWithEntity, selection, newEntityKey);
            } else {
                // Toggle the entity off
                newContentState = Modifier.applyEntity(contentState, selection, null);
            }
            return callback(EditorState.push(editorState, newContentState, "apply-entity"));
        }
    }
}

export type DraftDecoratorStrategy = (
    block: ContentBlock,
    callback: (start: number, end: number) => void,
    contentState: ContentState,
) => void;

export interface IDraftDecorator {
    strategy: DraftDecoratorStrategy;
    component: typeof React.Component;
    props?: object;
}
