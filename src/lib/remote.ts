export default interface IRemote<T> {
    /**
     * Whether a new value is currently being fetched from the remote source
     */
    isFetching: boolean;

    error?: string;

    /**
     * The latest value. Value can only be undefined while it is fetching for the first time.
     * If isFetching is false, this value is up to date.
     * If isFetching is true, a newer value is being received from the remote source.
     */
    value?: T;
}

export function EmptyRemote<T>(): IRemote<T> {
    return {
        isFetching: false,
        error: undefined,
        value: undefined,
    };
}
