import { Duration } from 'luxon';
import { AbortController, AbortSignal } from 'node-abort-controller';
import { Context } from './types';
/**
 * Common context decorators.
 *
 * @alpha
 */
export declare class Contexts {
    /**
     * Creates a root context.
     *
     * @remarks
     *
     * This should normally only be called near the root of an application. The
     * created context is meant to be passed down into deeper levels, which may or
     * may not make derived contexts out of it.
     */
    static root(): Context;
    /**
     * Creates a derived context, which signals to abort operations either when
     * any parent context signals, or when the given source is aborted.
     *
     * @remarks
     *
     * If the parent context was already aborted, then it is returned as-is.
     *
     * If the given source was already aborted, then a new already-aborted context
     * is returned.
     *
     * @param parentCtx - A parent context that shall be used as a base
     * @param source - An abort controller or signal that you intend to perhaps
     *                 trigger at some later point in time.
     * @returns A new {@link Context}
     */
    static withAbort(parentCtx: Context, source: AbortController | AbortSignal): Context;
    /**
     * Creates a derived context, which signals to abort operations either when
     * any parent context signals, or when the given amount of time has passed.
     * This may affect the deadline.
     *
     * @param parentCtx - A parent context that shall be used as a base
     * @param timeout - The duration of time, after which the derived context will
     *                  signal to abort.
     * @returns A new {@link Context}
     */
    static withTimeoutDuration(parentCtx: Context, timeout: Duration): Context;
    /**
     * Creates a derived context, which signals to abort operations either when
     * any parent context signals, or when the given amount of time has passed.
     * This may affect the deadline.
     *
     * @param parentCtx - A parent context that shall be used as a base
     * @param timeout - The number of milliseconds, after which the derived
     *                  context will signal to abort.
     * @returns A new {@link Context}
     */
    static withTimeoutMillis(parentCtx: Context, timeout: number): Context;
    /**
     * Creates a derived context, which has a specific key-value pair set as well
     * as all key-value pairs that were set in the original context.
     *
     * @param parentCtx - A parent context that shall be used as a base
     * @param key - The key of the value to set
     * @param value - The value, or a function that accepts the previous value (or
     *                undefined if not set yet) and computes the new value
     * @returns A new {@link Context}
     */
    static withValue(parentCtx: Context, key: string, value: unknown | ((previous: unknown | undefined) => unknown)): Context;
}
