import { EditorState } from "draft-js";
import IFlashCard from "./flashcard/flashcard";
import IRemote from "./remote";

/**
 * Go through every key/value-pair of the object and return a new object
 * where the values are determined by the mapping function.
 * @param object The object which key/value-pairs to go through. Key must be string.
 * @param func A function that processes the object key/value-pairs and returns a new value
 */
export function objectMapString<V, R>(object: { [key: string]: V},
                                      func: (key: string, value: V) => R): {[key: string]: R} {
    return Object.assign({},
        ...Object.keys(object).map(
            key => ({ [key]: func(key, object[key]) }),
        ),
    );
}

/**
 * Go through every key/value-pair of the object and return a new object
 * where the values are determined by the mapping function.
 * @param object The object which key/value-pairs to go through. Key must be number.
 * @param func A function that processes the object key/value-pairs and returns a new value
 */
export function objectMapNumber<V, R>(object: { [key: number]: V},
                                      func: (key: number, value: V) => R): {[key: number]: R} {
    return Object.assign({},
        ...Object.keys(object).map(
            key => ({ [key]: func(Number(key), object[Number(key)]) }),
        ),
    );
}

/**
 * Converts an array into an object by using the function to select the key and value for each entry
 */
export function arrayToObject<OV, AV>(array: AV[], fn: (value: AV) => [string, OV]) {
    const kvps = array.map(fn);
    const output: {[key: string]: OV} = { };
    for (const kvp of kvps) {
        output[kvp[0]] = kvp[1];
    }
    return output;
}

/**
 * Returns a pseudorandom ID that is likely to be unique
 */
export function guid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Returns a new array with the items from deck in a random order
 * @param deck The deck to be shuffled
 * @param limit The maximum number of items in the return array
 */
export function shuffle<T>(deck: T[], limit?: number): T[] {
    const result: T[] = [];
    while (deck.length > 0) {
        // Swap the first element with a random element in the deck
        // (the element can be swapped with itself to keep it's position)
        const replacementIndex = Math.floor(Math.random() * deck.length);
        result.push(deck[replacementIndex]);
        deck[replacementIndex] = deck[0];
        deck = deck.slice(1);
    }
    return result;
}

/**
 * Returns the plural form of the word
 * @param word Word for which to return the plural
 * @param count The count that determines whether the word is plural.
 * If none is supplied, the word is always pluralized.
 */
export function plural(word: string, count?: number) {
    return count === undefined || count !== 1 ? word + "s" : word;
}

/**
 * This function either filters a string-array or filters the keys of an object, if an object is passed
 * @param keys Either a string array or the keys of an object to be filtered
 * @param filter A function that returns true for all items that should be included in the result
 */
export function selectKeys<T>(keys: string[] | {[key: string]: T}, filter: (key: string) => boolean) {
    if (! Array.isArray(keys)) {
        keys = Object.keys(keys);
    }
    const result: string[] = keys.filter(filter);
    return result;
}

/**
 * Returns true if the block that the cursor is in has the specified block style
 * @param state The state of the editor
 * @param type The block type to check for
 */
export function isBlockTypeAtCursor(editorState: EditorState | undefined, type: string) {
    if (editorState === undefined) {
        return false;
    }

    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();
    const selectionStartBlockKey = selection.getStartKey();
    if (selectionStartBlockKey == null) {
        return false;
    }
    const block = content.getBlockForKey(selectionStartBlockKey);
    return block.getType() === type;
}

/**
 * Counts the occurences for every single tag in the set of cards
 */
export function countTags(cards: { [id: string]: IFlashCard }) {
    // Create an array containing all tags in the set
    const cardTags = Object.keys(cards)
        .map(card => cards[card].tags)
        .reduce((acc, val) => acc.concat(val), []);

    // Count the tags
    const cardTagCounts: { [tag: string]: number } = { };
    for (const tag of cardTags) {
        if (cardTagCounts[tag] === undefined) {
            cardTagCounts[tag] = 1;
        } else {
            cardTagCounts[tag]++;
        }
    }

    return cardTagCounts;
}

/**
 * Calculates an updated tagcount after the tags for a card are changed
 * @param oldTagCounts The tag count before the tags where updated for a card
 * @param oldCardTags The tags for the card before the change
 * @param newCardTags The tags for the card after the change
 */
export function calculateNewTagCount(oldTagCounts: { [tag: string]: number } = { },
                                     oldCardTags: string[], newCardTags: string[]) {
    // Calculate which tags where added or removed
    const oldTags = arrayToObject(oldCardTags, tag => [tag, true]);
    const newTags = arrayToObject(newCardTags, tag => [tag, true]);
    const addedTags = arrayToObject(
        newCardTags.filter(tag => oldTags[tag] === undefined), tag => [tag, true]);
    const removedTags = arrayToObject(
        oldCardTags.filter(tag => newTags[tag] === undefined), tag => [tag, true]);

    // Update the count for all tags that where present before
    const updatedCount = objectMapString(oldTagCounts, (tag, count) => {
        if (addedTags[tag] === true) {
            return count + 1;
        } else if (removedTags[tag] === true) {
            return count - 1;
        } else { return count; }
    });

    // Add any new tags
    for (const tag of Object.keys(addedTags)) {
        if (oldTagCounts[tag] === undefined) {
            updatedCount[tag] = 1;
        }
    }

    // Remoe any tags with a count < 1
    return arrayToObject(
        Object.keys(updatedCount).filter(tag => updatedCount[tag] > 0),
        tag => [tag, updatedCount[tag]],
    );
}
