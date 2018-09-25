export function objectMapString<V, R>(object:{ [key: string]: V}, func:(key:string, value:V) => R): {[key: string]: R} {
    return Object.assign({},
        ...Object.keys(object).map(
            key => ({ [key]: func(key, object[key]) })
        )
    );
}

export function objectMapNumber<V, R>(object:{ [key: number]: V}, func:(key:number, value:V) => R): {[key: number]: R} {
    return Object.assign({},
        ...Object.keys(object).map(
            key => ({ [key]: func(Number(key), object[Number(key)]) })
        )
    );
}

export function guid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
}
