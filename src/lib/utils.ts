/**
 * Go through every key/value-pair of the object and return a new object where the values are determined by the mapping function.
 * @param object The object which key/value-pairs to go through. Key must be string.
 * @param func A function that processes the object key/value-pairs and returns a new value
 */
export function objectMapString<V, R>(object:{ [key: string]: V}, func:(key:string, value:V) => R): {[key: string]: R} {
    return Object.assign({},
        ...Object.keys(object).map(
            key => ({ [key]: func(key, object[key]) })
        )
    );
}

/**
 * Go through every key/value-pair of the object and return a new object where the values are determined by the mapping function.
 * @param object The object which key/value-pairs to go through. Key must be number.
 * @param func A function that processes the object key/value-pairs and returns a new value
 */
export function objectMapNumber<V, R>(object:{ [key: number]: V}, func:(key:number, value:V) => R): {[key: number]: R} {
    return Object.assign({},
        ...Object.keys(object).map(
            key => ({ [key]: func(Number(key), object[Number(key)]) })
        )
    );
}

/**
 * Returns a pseudorandom ID that is likely to be unique
 */
export function guid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
}

/**
 * Returns a new array with the items from deck in a random order
 * @param deck The deck to be shuffled
 * @param limit The maximum number of items in the return array
 */
export function shuffle<T> (deck:T[], limit?: number): T[] {
    let result: T[] = [];
    for (var i = 0; i < (limit != undefined ? limit : deck.length); i++) {
        // Swap this card with a random card in the deck (the card can be swapped with itself to keep it's position)
        let replacementIndex = Math.round(Math.random() * (deck.length - 1));
        result.push(deck[replacementIndex]);
        deck[replacementIndex] = deck[i];
    }
    return result;
}
