/**
 * Observer interface for consuming an Observer, see TC39.
 *
 * @public
 */
export declare type Observer<T> = {
    next?(value: T): void;
    error?(error: Error): void;
    complete?(): void;
};
/**
 * Subscription returned when subscribing to an Observable, see TC39.
 *
 * @public
 */
export declare type Subscription = {
    /**
     * Cancels the subscription
     */
    unsubscribe(): void;
    /**
     * Value indicating whether the subscription is closed.
     */
    readonly closed: boolean;
};
declare global {
    interface SymbolConstructor {
        readonly observable: symbol;
    }
}
/**
 * Observable sequence of values and errors, see TC39.
 *
 * https://github.com/tc39/proposal-observable
 *
 * This is used as a common return type for observable values and can be created
 * using many different observable implementations, such as zen-observable or RxJS 5.
 *
 * @public
 */
export declare type Observable<T> = {
    [Symbol.observable](): Observable<T>;
    /**
     * Subscribes to this observable to start receiving new values.
     */
    subscribe(observer: Observer<T>): Subscription;
    subscribe(onNext?: (value: T) => void, onError?: (error: Error) => void, onComplete?: () => void): Subscription;
};
