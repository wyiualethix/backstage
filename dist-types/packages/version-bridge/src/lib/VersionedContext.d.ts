import { Context } from 'react';
import { VersionedValue } from './VersionedValue';
/**
 * Get the existing or create a new versioned React context that's
 * stored inside a global singleton.
 *
 * @param key - A key that uniquely identifies the context.
 * @public
 * @example
 *
 * ```ts
 * const MyContext = createVersionedContext<{ 1: string }>('my-context');
 *
 * const MyContextProvider = ({children}) => (
 *   <MyContext.Provider value={createVersionedValueMap({ 1: 'value-for-version-1' })}>
 *     {children}
 *   <MyContext.Provider>
 * )
 * ```
 */
export declare function createVersionedContext<Versions extends {
    [version in number]: unknown;
}>(key: string): Context<VersionedValue<Versions> | undefined>;
/**
 * A hook that simplifies the consumption of a versioned contexts that's
 * stored inside a global singleton.
 *
 * @param key - A key that uniquely identifies the context.
 * @public
 * @example
 *
 * ```ts
 * const versionedHolder = useVersionedContext<{ 1: string }>('my-context');
 *
 * if (!versionedHolder) {
 *   throw new Error('My context is not available!')
 * }
 *
 * const myValue = versionedHolder.atVersion(1);
 *
 * // ...
 * ```
 */
export declare function useVersionedContext<Versions extends {
    [version in number]: unknown;
}>(key: string): VersionedValue<Versions> | undefined;
/**
 * Creates a helper for writing tests towards multiple different
 * combinations of versions provided from a context.
 *
 * @param key - A key that uniquely identifies the context.
 * @public
 * @example
 *
 * ```ts
 * const context = createVersionedContextForTesting('my-context');
 *
 * afterEach(() => {
 *   context.reset();
 * });
 *
 * it('should work when provided with version 1', () => {
 *   context.set({1: 'value-for-version-1'})
 *
 *   // ...
 * })
 * ```
 */
export declare function createVersionedContextForTesting(key: string): {
    set(versions: {
        [x: number]: unknown;
    }): void;
    reset(): void;
};
