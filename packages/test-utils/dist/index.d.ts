import { AnalyticsApi, AnalyticsEvent, ConfigApi, ErrorApiError, ErrorApiErrorContext, ErrorApi, DiscoveryApi, IdentityApi, FetchApi, StorageApi, StorageValueSnapshot, RouteRef, ExternalRouteRef, ApiHolder, ApiRef } from '@backstage/core-plugin-api';
import { Config } from '@backstage/config';
import { JsonObject, JsonValue, Observable } from '@backstage/types';
import crossFetch from 'cross-fetch';
import { PermissionApi } from '@backstage/plugin-permission-react';
import { EvaluatePermissionRequest, AuthorizeResult, EvaluatePermissionResponse } from '@backstage/plugin-permission-common';
import { ReactNode, ComponentType, ReactElement } from 'react';
import { RenderResult, RenderOptions } from '@testing-library/react';

/**
 * Mock implementation of {@link core-plugin-api#AnalyticsApi} with helpers to ensure that events are sent correctly.
 * Use getEvents in tests to verify captured events.
 *
 * @public
 */
declare class MockAnalyticsApi implements AnalyticsApi {
    private events;
    captureEvent(event: AnalyticsEvent): void;
    getEvents(): AnalyticsEvent[];
}

/**
 * MockConfigApi is a thin wrapper around {@link @backstage/config#ConfigReader}
 * that can be used to mock configuration using a plain object.
 *
 * @public
 * @example
 * ```tsx
 * const mockConfig = new MockConfigApi({
 *   app: { baseUrl: 'https://example.com' },
 * });
 *
 * const rendered = await renderInTestApp(
 *   <TestApiProvider apis={[[configApiRef, mockConfig]]}>
 *     <MyTestedComponent />
 *   </TestApiProvider>,
 * );
 * ```
 */
declare class MockConfigApi implements ConfigApi {
    private readonly config;
    constructor(data: JsonObject);
    /** {@inheritdoc @backstage/config#Config.has} */
    has(key: string): boolean;
    /** {@inheritdoc @backstage/config#Config.keys} */
    keys(): string[];
    /** {@inheritdoc @backstage/config#Config.get} */
    get<T = JsonValue>(key?: string): T;
    /** {@inheritdoc @backstage/config#Config.getOptional} */
    getOptional<T = JsonValue>(key?: string): T | undefined;
    /** {@inheritdoc @backstage/config#Config.getConfig} */
    getConfig(key: string): Config;
    /** {@inheritdoc @backstage/config#Config.getOptionalConfig} */
    getOptionalConfig(key: string): Config | undefined;
    /** {@inheritdoc @backstage/config#Config.getConfigArray} */
    getConfigArray(key: string): Config[];
    /** {@inheritdoc @backstage/config#Config.getOptionalConfigArray} */
    getOptionalConfigArray(key: string): Config[] | undefined;
    /** {@inheritdoc @backstage/config#Config.getNumber} */
    getNumber(key: string): number;
    /** {@inheritdoc @backstage/config#Config.getOptionalNumber} */
    getOptionalNumber(key: string): number | undefined;
    /** {@inheritdoc @backstage/config#Config.getBoolean} */
    getBoolean(key: string): boolean;
    /** {@inheritdoc @backstage/config#Config.getOptionalBoolean} */
    getOptionalBoolean(key: string): boolean | undefined;
    /** {@inheritdoc @backstage/config#Config.getString} */
    getString(key: string): string;
    /** {@inheritdoc @backstage/config#Config.getOptionalString} */
    getOptionalString(key: string): string | undefined;
    /** {@inheritdoc @backstage/config#Config.getStringArray} */
    getStringArray(key: string): string[];
    /** {@inheritdoc @backstage/config#Config.getOptionalStringArray} */
    getOptionalStringArray(key: string): string[] | undefined;
}

/**
 * Constructor arguments for {@link MockErrorApi}
 * @public
 */
declare type MockErrorApiOptions = {
    collect?: boolean;
};
/**
 * ErrorWithContext contains error and ErrorApiErrorContext
 * @public
 */
declare type ErrorWithContext = {
    error: ErrorApiError;
    context?: ErrorApiErrorContext;
};
/**
 * Mock implementation of the {@link core-plugin-api#ErrorApi} to be used in tests.
 * Includes withForError and getErrors methods for error testing.
 * @public
 */
declare class MockErrorApi implements ErrorApi {
    private readonly options;
    private readonly errors;
    private readonly waiters;
    constructor(options?: MockErrorApiOptions);
    post(error: ErrorApiError, context?: ErrorApiErrorContext): void;
    error$(): Observable<{
        error: ErrorApiError;
        context?: ErrorApiErrorContext;
    }>;
    getErrors(): ErrorWithContext[];
    waitForError(pattern: RegExp, timeoutMs?: number): Promise<ErrorWithContext>;
}

/**
 * The options given when constructing a {@link MockFetchApi}.
 *
 * @public
 */
interface MockFetchApiOptions {
    /**
     * Define the underlying base `fetch` implementation.
     *
     * @defaultValue undefined
     * @remarks
     *
     * Leaving out this parameter or passing `undefined`, makes the API use the
     * global `fetch` implementation to make real network requests.
     *
     * `'none'` swallows all calls and makes no requests at all.
     *
     * You can also pass in any `fetch` compatible callback, such as a
     * `jest.fn()`, if you want to use a custom implementation or to just track
     * and assert on calls.
     */
    baseImplementation?: undefined | 'none' | typeof crossFetch;
    /**
     * Add translation from `plugin://` URLs to concrete http(s) URLs, basically
     * simulating what
     * {@link @backstage/core-app-api#FetchMiddlewares.resolvePluginProtocol}
     * does.
     *
     * @defaultValue undefined
     * @remarks
     *
     * Leaving out this parameter or passing `undefined`, disables plugin protocol
     * translation.
     *
     * To enable the feature, pass in a discovery API which is then used to
     * resolve the URLs.
     */
    resolvePluginProtocol?: undefined | {
        discoveryApi: Pick<DiscoveryApi, 'getBaseUrl'>;
    };
    /**
     * Add token based Authorization headers to requests, basically simulating
     * what {@link @backstage/core-app-api#FetchMiddlewares.injectIdentityAuth}
     * does.
     *
     * @defaultValue undefined
     * @remarks
     *
     * Leaving out this parameter or passing `undefined`, disables auth injection.
     *
     * To enable the feature, pass in either a static token or an identity API
     * which is queried on each request for a token.
     */
    injectIdentityAuth?: undefined | {
        token: string;
    } | {
        identityApi: Pick<IdentityApi, 'getCredentials'>;
    };
}
/**
 * A test helper implementation of {@link @backstage/core-plugin-api#FetchApi}.
 *
 * @public
 */
declare class MockFetchApi implements FetchApi {
    private readonly implementation;
    /**
     * Creates a mock {@link @backstage/core-plugin-api#FetchApi}.
     */
    constructor(options?: MockFetchApiOptions);
    /** {@inheritdoc @backstage/core-plugin-api#FetchApi.fetch} */
    get fetch(): typeof crossFetch;
}

/**
 * Mock implementation of
 * {@link @backstage/plugin-permission-react#PermissionApi}. Supply a
 * requestHandler function to override the mock result returned for a given
 * request.
 * @public
 */
declare class MockPermissionApi implements PermissionApi {
    private readonly requestHandler;
    constructor(requestHandler?: (request: EvaluatePermissionRequest) => AuthorizeResult.ALLOW | AuthorizeResult.DENY);
    authorize(request: EvaluatePermissionRequest): Promise<EvaluatePermissionResponse>;
}

/**
 * Type for map holding data in {@link MockStorageApi}
 * @public
 */
declare type MockStorageBucket = {
    [key: string]: any;
};
/**
 * Mock implementation of the {@link core-plugin-api#StorageApi} to be used in tests
 * @public
 */
declare class MockStorageApi implements StorageApi {
    private readonly namespace;
    private readonly data;
    private readonly bucketStorageApis;
    private constructor();
    static create(data?: MockStorageBucket): MockStorageApi;
    forBucket(name: string): StorageApi;
    snapshot<T extends JsonValue>(key: string): StorageValueSnapshot<T>;
    set<T>(key: string, data: T): Promise<void>;
    remove(key: string): Promise<void>;
    observe$<T>(key: string): Observable<StorageValueSnapshot<T>>;
    private getKeyName;
    private notifyChanges;
    private subscribers;
    private readonly observable;
}

/**
 *  This is a mocking method suggested in the Jest docs, as it is not implemented in JSDOM yet.
 *  It can be used to mock values for the MUI `useMediaQuery` hook if it is used in a tested component.
 *
 *  For issues checkout the documentation:
 *  https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
 *
 *  If there are any updates from MUI React on testing `useMediaQuery` this mock should be replaced
 *  https://material-ui.com/components/use-media-query/#testing
 *
 * @public
 */
declare function mockBreakpoint(options: {
    matches: boolean;
}): void;

/**
 * Options to customize the behavior of the test app wrapper.
 * @public
 */
declare type TestAppOptions = {
    /**
     * Initial route entries to pass along as `initialEntries` to the router.
     */
    routeEntries?: string[];
    /**
     * An object of paths to mount route ref on, with the key being the path and the value
     * being the RouteRef that the path will be bound to. This allows the route refs to be
     * used by `useRouteRef` in the rendered elements.
     *
     * @example
     * wrapInTestApp(<MyComponent />, \{
     *   mountedRoutes: \{
     *     '/my-path': myRouteRef,
     *   \}
     * \})
     * // ...
     * const link = useRouteRef(myRouteRef)
     */
    mountedRoutes?: {
        [path: string]: RouteRef | ExternalRouteRef;
    };
};
/**
 * Creates a Wrapper component that wraps a component inside a Backstage test app,
 * providing a mocked theme and app context, along with mocked APIs.
 *
 * @param options - Additional options for the rendering.
 * @public
 */
declare function createTestAppWrapper(options?: TestAppOptions): (props: {
    children: ReactNode;
}) => JSX.Element;
/**
 * Wraps a component inside a Backstage test app, providing a mocked theme
 * and app context, along with mocked APIs.
 *
 * @param Component - A component or react node to render inside the test app.
 * @param options - Additional options for the rendering.
 * @public
 */
declare function wrapInTestApp(Component: ComponentType | ReactNode, options?: TestAppOptions): ReactElement;
/**
 * Renders a component inside a Backstage test app, providing a mocked theme
 * and app context, along with mocked APIs.
 *
 * The render executes async effects similar to `renderWithEffects`. To avoid this
 * behavior, use a regular `render()` + `wrapInTestApp()` instead.
 *
 * @param Component - A component or react node to render inside the test app.
 * @param options - Additional options for the rendering.
 * @public
 */
declare function renderInTestApp(Component: ComponentType | ReactNode, options?: TestAppOptions): Promise<RenderResult>;

/**
 * Sets up handlers for request mocking
 * @public
 * @param worker - service worker
 */
declare function setupRequestMockHandlers(worker: {
    listen: (t: any) => void;
    close: () => void;
    resetHandlers: () => void;
}): void;

/**
 * Severity levels of {@link CollectedLogs}
 * @public
 */
declare type LogFuncs = 'log' | 'warn' | 'error';
/**
 * AsyncLogCollector type used in {@link (withLogCollector:1)} callback function.
 * @public
 */
declare type AsyncLogCollector = () => Promise<void>;
/**
 * SyncLogCollector type used in {@link (withLogCollector:2)} callback function.
 * @public
 */
declare type SyncLogCollector = () => void;
/**
 * Union type used in {@link (withLogCollector:3)} callback function.
 * @public
 */
declare type LogCollector = AsyncLogCollector | SyncLogCollector;
/**
 * Map of severity level and corresponding log lines.
 * @public
 */
declare type CollectedLogs<T extends LogFuncs> = {
    [key in T]: string[];
};
/**
 * Asynchronous log collector with that collects all categories
 * @public
 */
declare function withLogCollector(callback: AsyncLogCollector): Promise<CollectedLogs<LogFuncs>>;
/**
 * Synchronous log collector with that collects all categories
 * @public
 */
declare function withLogCollector(callback: SyncLogCollector): CollectedLogs<LogFuncs>;
/**
 * Asynchronous log collector with that only collects selected categories
 * @public
 */
declare function withLogCollector<T extends LogFuncs>(logsToCollect: T[], callback: AsyncLogCollector): Promise<CollectedLogs<T>>;
/**
 * Synchronous log collector with that only collects selected categories
 * @public
 */
declare function withLogCollector<T extends LogFuncs>(logsToCollect: T[], callback: SyncLogCollector): CollectedLogs<T>;

/**
 * @public
 * Simplifies rendering of async components in by taking care of the wrapping inside act
 *
 * @remarks
 *
 * Components using useEffect to perform an asynchronous action (such as fetch) must be rendered within an async
 * act call to properly get the final state, even with mocked responses. This utility method makes the signature a bit
 * cleaner, since act doesn't return the result of the evaluated function.
 * https://github.com/testing-library/react-testing-library/issues/281
 * https://github.com/facebook/react/pull/14853
 */
declare function renderWithEffects(nodes: ReactElement, options?: Pick<RenderOptions, 'wrapper'>): Promise<RenderResult>;

/** @ignore */
declare type TestApiProviderPropsApiPair<TApi> = TApi extends infer TImpl ? readonly [ApiRef<TApi>, Partial<TImpl>] : never;
/** @ignore */
declare type TestApiProviderPropsApiPairs<TApiPairs> = {
    [TIndex in keyof TApiPairs]: TestApiProviderPropsApiPair<TApiPairs[TIndex]>;
};
/**
 * Properties for the {@link TestApiProvider} component.
 *
 * @public
 */
declare type TestApiProviderProps<TApiPairs extends any[]> = {
    apis: readonly [...TestApiProviderPropsApiPairs<TApiPairs>];
    children: ReactNode;
};
/**
 * The `TestApiRegistry` is an {@link @backstage/core-plugin-api#ApiHolder} implementation
 * that is particularly well suited for development and test environments such as
 * unit tests, storybooks, and isolated plugin development setups.
 *
 * @public
 */
declare class TestApiRegistry implements ApiHolder {
    private readonly apis;
    /**
     * Creates a new {@link TestApiRegistry} with a list of API implementation pairs.
     *
     * Similar to the {@link TestApiProvider}, there is no need to provide a full
     * implementation of each API, it's enough to implement the methods that are tested.
     *
     * @example
     * ```ts
     * const apis = TestApiRegistry.from(
     *   [configApiRef, new ConfigReader({})],
     *   [identityApiRef, { getUserId: () => 'tester' }],
     * );
     * ```
     *
     * @public
     * @param apis - A list of pairs mapping an ApiRef to its respective implementation.
     */
    static from<TApiPairs extends any[]>(...apis: readonly [...TestApiProviderPropsApiPairs<TApiPairs>]): TestApiRegistry;
    private constructor();
    /**
     * Returns an implementation of the API.
     *
     * @public
     */
    get<T>(api: ApiRef<T>): T | undefined;
}
/**
 * The `TestApiProvider` is a Utility API context provider that is particularly
 * well suited for development and test environments such as unit tests, storybooks,
 * and isolated plugin development setups.
 *
 * It lets you provide any number of API implementations, without necessarily
 * having to fully implement each of the APIs.
 *
 * A migration from `ApiRegistry` and `ApiProvider` might look like this, from:
 *
 * ```tsx
 * renderInTestApp(
 *   <ApiProvider
 *     apis={ApiRegistry.from([
 *       [identityApiRef, mockIdentityApi as unknown as IdentityApi]
 *     ])}
 *   >
 *     {...}
 *   </ApiProvider>
 * )
 * ```
 *
 * To the following:
 *
 * ```tsx
 * renderInTestApp(
 *   <TestApiProvider apis={[[identityApiRef, mockIdentityApi]]}>
 *     {...}
 *   </TestApiProvider>
 * )
 * ```
 *
 * Note that the cast to `IdentityApi` is no longer needed as long as the mock API
 * implements a subset of the `IdentityApi`.
 *
 * @public
 **/
declare const TestApiProvider: <T extends any[]>(props: TestApiProviderProps<T>) => JSX.Element;

export { AsyncLogCollector, CollectedLogs, ErrorWithContext, LogCollector, LogFuncs, MockAnalyticsApi, MockConfigApi, MockErrorApi, MockErrorApiOptions, MockFetchApi, MockFetchApiOptions, MockPermissionApi, MockStorageApi, MockStorageBucket, SyncLogCollector, TestApiProvider, TestApiProviderProps, TestApiRegistry, TestAppOptions, createTestAppWrapper, mockBreakpoint, renderInTestApp, renderWithEffects, setupRequestMockHandlers, withLogCollector, wrapInTestApp };
