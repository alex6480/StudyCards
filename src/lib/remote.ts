export default class Remote<T> {
    /**
     * Returns a remote without a value that is not fetching.
     */
    public static default<T>() {
        return new Remote<T>(false);
    }

    /**
     * Returns a remote with an error
     */
    public static error<T>(errorMessage: string) {
        const output = new Remote<T>(false, undefined);
        output.errorMessage = errorMessage;
        return output;
    }

    /**
     * Whether or not the remote value is currently being fetched from the remote source
     */
    public isFetching: boolean = true;

    /**
     * The time when this value was last updated with the remote source
     */
    public lastUpdated: number = -1;

    public errorMessage?: string;
    public get error() {
        return this.errorMessage !== undefined;
    }

    /**
     * The latest value. Value can only be undefined while it is fetching for the first time.
     * If isFetching is false, this value is up to date.
     * If isFetching is true, a newer value is being received from the remote source.
     */
    protected val?: T;

    constructor(isFetching: boolean, value?: T, errorMessage?: string) {
        this.isFetching = isFetching;
        this.val = value;
        this.lastUpdated = Date.now();
        this.errorMessage = errorMessage;
    }

    /**
     * Returns the latest value
     */
    public lastValue() {
        return this.val;
    }

    public get isUpToDate() {
        return this.isFetching === false && this.val !== undefined;
    }

    /**
     * Returns the value of the remote
     * Throws an error if the value is undefined
     */
    public value(): T {
        if (this.val === undefined) {
            throw new Error("Value is undefined");
        }
        return this.val;
    }

    /**
     * Returns a new remote with the specified value.
     * All other properties are kept the same
     */
    public withValue(value: T) {
        return new Remote(this.isFetching, value);
    }

    /**
     * returns itself if value is undefined
     * Otherwise returns a new remote with the update value
     */
    public updateIfValue(fn: (value: T) => T): Remote<T> {
        if (this.val === undefined) {
            return this;
        } else {
            return this.withValue(fn(this.val));
        }
    }
}
