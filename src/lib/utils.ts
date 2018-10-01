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
    if (typeof keys === "object") {
        keys = Object.keys(keys);
    }
    const result: string[] = [];
    for (const key of keys) {
        if (filter(key)) {
            result.push(key);
        }
    }

    return result;
}
