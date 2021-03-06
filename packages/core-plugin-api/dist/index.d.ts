/// <reference types="react" />
import React$1, { ReactNode, ComponentType, ReactElement } from 'react';
import { Observable, JsonValue } from '@backstage/types';
import { Config } from '@backstage/config';
import { IdentityApi as IdentityApi$1, BackstagePlugin as BackstagePlugin$1, IconComponent as IconComponent$1 } from '@backstage/core-plugin-api';

/**
 * Common analytics context attributes.
 *
 * @alpha
 */
declare type CommonAnalyticsContext = {
    /**
     * The nearest known parent plugin where the event was captured.
     */
    pluginId: string;
    /**
     * The ID of the routeRef that was active when the event was captured.
     */
    routeRef: string;
    /**
     * The nearest known parent extension where the event was captured.
     */
    extension: string;
};
/**
 * Analytics context envelope.
 *
 * @alpha
 */
declare type AnalyticsContextValue = CommonAnalyticsContext & {
    [param in string]: string | boolean | number | undefined;
};

/**
 * Provides components in the child react tree an Analytics Context, ensuring
 * all analytics events captured within the context have relevant attributes.
 *
 * @remarks
 *
 * Analytics contexts are additive, meaning the context ultimately emitted with
 * an event is the combination of all contexts in the parent tree.
 *
 * @alpha
 */
declare const AnalyticsContext: (options: {
    attributes: Partial<AnalyticsContextValue>;
    children: ReactNode;
}) => JSX.Element;

/**
 * API reference.
 *
 * @public
 */
declare type ApiRef<T> = {
    id: string;
    T: T;
};
/**
 * Catch-all {@link ApiRef} type.
 *
 * @public
 */
declare type AnyApiRef = ApiRef<unknown>;
/**
 * Wraps a type with API properties into a type holding their respective {@link ApiRef}s.
 *
 * @public
 */
declare type TypesToApiRefs<T> = {
    [key in keyof T]: ApiRef<T[key]>;
};
/**
 * Provides lookup of APIs through their {@link ApiRef}s.
 *
 * @public
 */
declare type ApiHolder = {
    get<T>(api: ApiRef<T>): T | undefined;
};
/**
 * Describes type returning API implementations.
 *
 * @public
 */
declare type ApiFactory<Api, Impl extends Api, Deps extends {
    [name in string]: unknown;
}> = {
    api: ApiRef<Api>;
    deps: TypesToApiRefs<Deps>;
    factory(deps: Deps): Impl;
};
/**
 * Catch-all {@link ApiFactory} type.
 *
 * @public
 */
declare type AnyApiFactory = ApiFactory<unknown, unknown, {
    [key in string]: unknown;
}>;

/**
 * React hook for retrieving {@link ApiHolder}, an API catalog.
 *
 * @public
 */
declare function useApiHolder(): ApiHolder;
/**
 * React hook for retrieving APIs.
 *
 * @param apiRef - Reference of the API to use.
 * @public
 */
declare function useApi<T>(apiRef: ApiRef<T>): T;
/**
 * Wrapper for giving component an API context.
 *
 * @param apis - APIs for the context.
 * @public
 */
declare function withApis<T>(apis: TypesToApiRefs<T>): <P extends T>(WrappedComponent: React$1.ComponentType<P>) => {
    (props: React$1.PropsWithChildren<Omit<P, keyof T>>): JSX.Element;
    displayName: string;
};

/**
 * API reference configuration - holds an ID of the referenced API.
 *
 * @public
 */
declare type ApiRefConfig = {
    id: string;
};
/**
 * Creates a reference to an API.
 *
 * @param config - The descriptor of the API to reference.
 * @returns An API reference.
 * @public
 */
declare function createApiRef<T>(config: ApiRefConfig): ApiRef<T>;

/**
 * Used to infer types for a standalone {@link ApiFactory} that isn't immediately passed
 * to another function.
 *
 * @remarks
 *
 * This function doesn't actually do anything, it's only used to infer types.
 *
 * @public
 */
declare function createApiFactory<Api, Impl extends Api, Deps extends {
    [name in string]: unknown;
}>(factory: ApiFactory<Api, Impl, Deps>): ApiFactory<Api, Impl, Deps>;
/**
 * Used to infer types for a standalone {@link ApiFactory} that isn't immediately passed
 * to another function.
 *
 * @param api - Ref of the API that will be produced by the factory.
 * @param instance - Implementation of the API to use.
 * @public
 */
declare function createApiFactory<Api, Impl extends Api>(api: ApiRef<Api>, instance: Impl): ApiFactory<Api, Impl, {}>;

/**
 * IconComponent is the common icon type used throughout Backstage when
 * working with and rendering generic icons, including the app system icons.
 *
 * @remarks
 *
 * The type is based on SvgIcon from MUI, but both do not what the plugin-api
 * package to have a dependency on MUI, nor do we want the props to be as broad
 * as the SvgIconProps interface.
 *
 * If you have the need to forward additional props from SvgIconProps, you can
 * open an issue or submit a PR to the main Backstage repo. When doing so please
 * also describe your use-case and reasoning of the addition.
 *
 * @public
 */
declare type IconComponent = ComponentType<{
    fontSize?: 'default' | 'small' | 'large';
}>;

/**
 * This file contains declarations for common interfaces of auth-related APIs.
 * The declarations should be used to signal which type of authentication and
 * authorization methods each separate auth provider supports.
 *
 * For example, a Google OAuth provider that supports OAuth 2 and OpenID Connect,
 * would be declared as follows:
 *
 * const googleAuthApiRef = createApiRef<OAuthApi & OpenIDConnectApi>({ ... })
 */
/**
 * Information about the auth provider.
 *
 * @remarks
 *
 * This information is used both to connect the correct auth provider in the backend, as
 * well as displaying the provider to the user.
 *
 * @public
 */
declare type AuthProviderInfo = {
    /**
     * The ID of the auth provider. This should match with ID of the provider in the `@backstage/auth-backend`.
     */
    id: string;
    /**
     * Title for the auth provider, for example "GitHub"
     */
    title: string;
    /**
     * Icon for the auth provider.
     */
    icon: IconComponent;
};
/**
 * An array of scopes, or a scope string formatted according to the
 * auth provider, which is typically a space separated list.
 *
 * @remarks
 *
 * See the documentation for each auth provider for the list of scopes
 * supported by each provider.
 *
 * @public
 */
declare type OAuthScope = string | string[];
/**
 * Configuration of an authentication request.
 *
 * @public
 */
declare type AuthRequestOptions = {
    /**
     * If this is set to true, the user will not be prompted to log in,
     * and an empty response will be returned if there is no existing session.
     *
     * This can be used to perform a check whether the user is logged in, or if you don't
     * want to force a user to be logged in, but provide functionality if they already are.
     *
     * @defaultValue false
     */
    optional?: boolean;
    /**
     * If this is set to true, the request will bypass the regular oauth login modal
     * and open the login popup directly.
     *
     * The method must be called synchronously from a user action for this to work in all browsers.
     *
     * @defaultValue false
     */
    instantPopup?: boolean;
};
/**
 * This API provides access to OAuth 2 credentials. It lets you request access tokens,
 * which can be used to act on behalf of the user when talking to APIs.
 *
 * @public
 */
declare type OAuthApi = {
    /**
     * Requests an OAuth 2 Access Token, optionally with a set of scopes. The access token allows
     * you to make requests on behalf of the user, and the copes may grant you broader access, depending
     * on the auth provider.
     *
     * Each auth provider has separate handling of scope, so you need to look at the documentation
     * for each one to know what scope you need to request.
     *
     * This method is cheap and should be called each time an access token is used. Do not for example
     * store the access token in React component state, as that could cause the token to expire. Instead
     * fetch a new access token for each request.
     *
     * Be sure to include all required scopes when requesting an access token. When testing your implementation
     * it is best to log out the Backstage session and then visit your plugin page directly, as
     * you might already have some required scopes in your existing session. Not requesting the correct
     * scopes can lead to 403 or other authorization errors, which can be tricky to debug.
     *
     * If the user has not yet granted access to the provider and the set of requested scopes, the user
     * will be prompted to log in. The returned promise will not resolve until the user has
     * successfully logged in. The returned promise can be rejected, but only if the user rejects the login request.
     */
    getAccessToken(scope?: OAuthScope, options?: AuthRequestOptions): Promise<string>;
};
/**
 * This API provides access to OpenID Connect credentials. It lets you request ID tokens,
 * which can be passed to backend services to prove the user's identity.
 *
 * @public
 */
declare type OpenIdConnectApi = {
    /**
     * Requests an OpenID Connect ID Token.
     *
     * This method is cheap and should be called each time an ID token is used. Do not for example
     * store the id token in React component state, as that could cause the token to expire. Instead
     * fetch a new id token for each request.
     *
     * If the user has not yet logged in to Google inside Backstage, the user will be prompted
     * to log in. The returned promise will not resolve until the user has successfully logged in.
     * The returned promise can be rejected, but only if the user rejects the login request.
     */
    getIdToken(options?: AuthRequestOptions): Promise<string>;
};
/**
 * This API provides access to profile information of the user from an auth provider.
 *
 * @public
 */
declare type ProfileInfoApi = {
    /**
     * Get profile information for the user as supplied by this auth provider.
     *
     * If the optional flag is not set, a session is guaranteed to be returned, while if
     * the optional flag is set, the session may be undefined. See {@link AuthRequestOptions} for more details.
     */
    getProfile(options?: AuthRequestOptions): Promise<ProfileInfo | undefined>;
};
/**
 * This API provides access to the user's identity within Backstage.
 *
 * @remarks
 *
 * An auth provider that implements this interface can be used to sign-in to backstage. It is
 * not intended to be used directly from a plugin, but instead serves as a connection between
 * this authentication method and the app's {@link IdentityApi}
 *
 * @public
 */
declare type BackstageIdentityApi = {
    /**
     * Get the user's identity within Backstage. This should normally not be called directly,
     * use the {@link IdentityApi} instead.
     *
     * If the optional flag is not set, a session is guaranteed to be returned, while if
     * the optional flag is set, the session may be undefined. See {@link AuthRequestOptions} for more details.
     */
    getBackstageIdentity(options?: AuthRequestOptions): Promise<BackstageIdentityResponse | undefined>;
};
/**
 * User identity information within Backstage.
 *
 * @public
 */
declare type BackstageUserIdentity = {
    /**
     * The type of identity that this structure represents. In the frontend app
     * this will currently always be 'user'.
     */
    type: 'user';
    /**
     * The entityRef of the user in the catalog.
     * For example User:default/sandra
     */
    userEntityRef: string;
    /**
     * The user and group entities that the user claims ownership through
     */
    ownershipEntityRefs: string[];
};
/**
 * Token and Identity response, with the users claims in the Identity.
 *
 * @public
 */
declare type BackstageIdentityResponse = {
    /**
     * The token used to authenticate the user within Backstage.
     */
    token: string;
    /**
     * Identity information derived from the token.
     */
    identity: BackstageUserIdentity;
};
/**
 * Profile information of the user.
 *
 * @public
 */
declare type ProfileInfo = {
    /**
     * Email ID.
     */
    email?: string;
    /**
     * Display name that can be presented to the user.
     */
    displayName?: string;
    /**
     * URL to an avatar image of the user.
     */
    picture?: string;
};
/**
 * Session state values passed to subscribers of the SessionApi.
 *
 * @public
 */
declare enum SessionState {
    /**
     * User signed in.
     */
    SignedIn = "SignedIn",
    /**
     * User not signed in.
     */
    SignedOut = "SignedOut"
}
/**
 * The SessionApi provides basic controls for any auth provider that is tied to a persistent session.
 *
 * @public
 */
declare type SessionApi = {
    /**
     * Sign in with a minimum set of permissions.
     */
    signIn(): Promise<void>;
    /**
     * Sign out from the current session. This will reload the page.
     */
    signOut(): Promise<void>;
    /**
     * Observe the current state of the auth session. Emits the current state on subscription.
     */
    sessionState$(): Observable<SessionState>;
};
/**
 * Provides authentication towards Google APIs and identities.
 *
 * @public
 * @remarks
 *
 * See {@link https://developers.google.com/identity/protocols/googlescopes} for a full list of supported scopes.
 *
 * Note that the ID token payload is only guaranteed to contain the user's numerical Google ID,
 * email and expiration information. Do not rely on any other fields, as they might not be present.
 */
declare const googleAuthApiRef: ApiRef<OAuthApi & OpenIdConnectApi & ProfileInfoApi & BackstageIdentityApi & SessionApi>;
/**
 * Provides authentication towards GitHub APIs.
 *
 * @public
 * @remarks
 *
 * See {@link https://developer.github.com/apps/building-oauth-apps/understanding-scopes-for-oauth-apps/}
 * for a full list of supported scopes.
 */
declare const githubAuthApiRef: ApiRef<OAuthApi & ProfileInfoApi & BackstageIdentityApi & SessionApi>;
/**
 * Provides authentication towards Okta APIs.
 *
 * @public
 * @remarks
 *
 * See {@link https://developer.okta.com/docs/guides/implement-oauth-for-okta/scopes/}
 * for a full list of supported scopes.
 */
declare const oktaAuthApiRef: ApiRef<OAuthApi & OpenIdConnectApi & ProfileInfoApi & BackstageIdentityApi & SessionApi>;
/**
 * Provides authentication towards GitLab APIs.
 *
 * @public
 * @remarks
 *
 * See {@link https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html#limiting-scopes-of-a-personal-access-token}
 * for a full list of supported scopes.
 */
declare const gitlabAuthApiRef: ApiRef<OAuthApi & ProfileInfoApi & BackstageIdentityApi & SessionApi>;
/**
 * Provides authentication towards Microsoft APIs and identities.
 *
 * @public
 * @remarks
 *
 * For more info and a full list of supported scopes, see:
 * - {@link https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent}
 * - {@link https://docs.microsoft.com/en-us/graph/permissions-reference}
 */
declare const microsoftAuthApiRef: ApiRef<OAuthApi & OpenIdConnectApi & ProfileInfoApi & BackstageIdentityApi & SessionApi>;
/**
 * Provides authentication towards OneLogin APIs.
 *
 * @public
 */
declare const oneloginAuthApiRef: ApiRef<OAuthApi & OpenIdConnectApi & ProfileInfoApi & BackstageIdentityApi & SessionApi>;
/**
 * Provides authentication towards Bitbucket APIs.
 *
 * @public
 * @remarks
 *
 * See {@link https://support.atlassian.com/bitbucket-cloud/docs/use-oauth-on-bitbucket-cloud/}
 * for a full list of supported scopes.
 */
declare const bitbucketAuthApiRef: ApiRef<OAuthApi & ProfileInfoApi & BackstageIdentityApi & SessionApi>;
/**
 * Provides authentication towards Atlassian APIs.
 *
 * @public
 * @remarks
 *
 * See {@link https://developer.atlassian.com/cloud/jira/platform/scopes-for-connect-and-oauth-2-3LO-apps/}
 * for a full list of supported scopes.
 */
declare const atlassianAuthApiRef: ApiRef<OAuthApi & ProfileInfoApi & BackstageIdentityApi & SessionApi>;

/**
 * Message handled by the {@link AlertApi}.
 *
 * @public
 */
declare type AlertMessage = {
    message: string;
    severity?: 'success' | 'info' | 'warning' | 'error';
};
/**
 * The alert API is used to report alerts to the app, and display them to the user.
 *
 * @public
 */
declare type AlertApi = {
    /**
     * Post an alert for handling by the application.
     */
    post(alert: AlertMessage): void;
    /**
     * Observe alerts posted by other parts of the application.
     */
    alert$(): Observable<AlertMessage>;
};
/**
 * The {@link ApiRef} of {@link AlertApi}.
 *
 * @public
 */
declare const alertApiRef: ApiRef<AlertApi>;

/**
 * Represents an event worth tracking in an analytics system that could inform
 * how users of a Backstage instance are using its features.
 *
 * @alpha
 */
declare type AnalyticsEvent = {
    /**
     * A string that identifies the event being tracked by the type of action the
     * event represents. Be careful not to encode extra metadata in this string
     * that should instead be placed in the Analytics Context or attributes.
     * Examples include:
     *
     * - view
     * - click
     * - filter
     * - search
     * - hover
     * - scroll
     */
    action: string;
    /**
     * A string that uniquely identifies the object that the action is being
     * taken on. Examples include:
     *
     * - The path of the page viewed
     * - The url of the link clicked
     * - The value that was filtered by
     * - The text that was searched for
     */
    subject: string;
    /**
     * An optional numeric value relevant to the event that could be aggregated
     * by analytics tools. Examples include:
     *
     * - The index or position of the clicked element in an ordered list
     * - The percentage of an element that has been scrolled through
     * - The amount of time that has elapsed since a fixed point
     * - A satisfaction score on a fixed scale
     */
    value?: number;
    /**
     * Optional, additional attributes (representing dimensions or metrics)
     * specific to the event that could be forwarded on to analytics systems.
     */
    attributes?: AnalyticsEventAttributes;
    /**
     * Contextual metadata relating to where the event was captured and by whom.
     * This could include information about the route, plugin, or extension in
     * which an event was captured.
     */
    context: AnalyticsContextValue;
};
/**
 * A structure allowing other arbitrary metadata to be provided by analytics
 * event emitters.
 *
 * @alpha
 */
declare type AnalyticsEventAttributes = {
    [attribute in string]: string | boolean | number;
};
/**
 * Represents a tracker with methods that can be called to track events in a
 * configured analytics service.
 *
 * @alpha
 */
declare type AnalyticsTracker = {
    captureEvent: (action: string, subject: string, options?: {
        value?: number;
        attributes?: AnalyticsEventAttributes;
    }) => void;
};
/**
 * **EXPERIMENTAL**
 *
 * The Analytics API is used to track user behavior in a Backstage instance.
 *
 * @remarks
 *
 * To instrument your App or Plugin, retrieve an analytics tracker using the
 * useAnalytics() hook. This will return a pre-configured AnalyticsTracker
 * with relevant methods for instrumentation.
 *
 * @alpha
 */
declare type AnalyticsApi = {
    /**
     * Primary event handler responsible for compiling and forwarding events to
     * an analytics system.
     */
    captureEvent(event: AnalyticsEvent): void;
};
/**
 * **EXPERIMENTAL**
 *
 * The {@link ApiRef} of {@link AnalyticsApi}.
 *
 * @alpha
 */
declare const analyticsApiRef: ApiRef<AnalyticsApi>;

/**
 * Describes a theme provided by the app.
 *
 * @public
 */
declare type AppTheme = {
    /**
     * ID used to remember theme selections.
     */
    id: string;
    /**
     * Title of the theme
     */
    title: string;
    /**
     * Theme variant
     */
    variant: 'light' | 'dark';
    /**
     * An Icon for the theme mode setting.
     */
    icon?: React.ReactElement;
    Provider(props: {
        children: ReactNode;
    }): JSX.Element | null;
};
/**
 * The AppThemeApi gives access to the current app theme, and allows switching
 * to other options that have been registered as a part of the App.
 *
 * @public
 */
declare type AppThemeApi = {
    /**
     * Get a list of available themes.
     */
    getInstalledThemes(): AppTheme[];
    /**
     * Observe the currently selected theme. A value of undefined means no specific theme has been selected.
     */
    activeThemeId$(): Observable<string | undefined>;
    /**
     * Get the current theme ID. Returns undefined if no specific theme is selected.
     */
    getActiveThemeId(): string | undefined;
    /**
     * Set a specific theme to use in the app, overriding the default theme selection.
     *
     * Clear the selection by passing in undefined.
     */
    setActiveThemeId(themeId?: string): void;
};
/**
 * The {@link ApiRef} of {@link AppThemeApi}.
 *
 * @public
 */
declare const appThemeApiRef: ApiRef<AppThemeApi>;

/**
 * The Config API is used to provide a mechanism to access the
 * runtime configuration of the system.
 *
 * @public
 */
declare type ConfigApi = Config;
/**
 * The {@link ApiRef} of {@link ConfigApi}.
 *
 * @public
 */
declare const configApiRef: ApiRef<ConfigApi>;

/**
 * The discovery API is used to provide a mechanism for plugins to
 * discover the endpoint to use to talk to their backend counterpart.
 *
 * @remarks
 *
 * The purpose of the discovery API is to allow for many different deployment
 * setups and routing methods through a central configuration, instead
 * of letting each individual plugin manage that configuration.
 *
 * Implementations of the discovery API can be a simple as a URL pattern
 * using the pluginId, but could also have overrides for individual plugins,
 * or query a separate discovery service.
 *
 * @public
 */
declare type DiscoveryApi = {
    /**
     * Returns the HTTP base backend URL for a given plugin, without a trailing slash.
     *
     * This method must always be called just before making a request, as opposed to
     * fetching the URL when constructing an API client. That is to ensure that more
     * flexible routing patterns can be supported.
     *
     * For example, asking for the URL for `auth` may return something
     * like `https://backstage.example.com/api/auth`
     */
    getBaseUrl(pluginId: string): Promise<string>;
};
/**
 * The {@link ApiRef} of {@link DiscoveryApi}.
 *
 * @public
 */
declare const discoveryApiRef: ApiRef<DiscoveryApi>;

/**
 * Mirrors the JavaScript Error class, for the purpose of
 * providing documentation and optional fields.
 *
 * @public
 */
declare type ErrorApiError = {
    name: string;
    message: string;
    stack?: string;
};
/**
 * Provides additional information about an error that was posted to the application.
 *
 * @public
 */
declare type ErrorApiErrorContext = {
    /**
     * If set to true, this error should not be displayed to the user.
     *
     * Hidden errors are typically not displayed in the UI, but the ErrorApi
     * implementation may still report them to error tracking services
     * or other utilities that care about all errors.
     *
     * @defaultValue false
     */
    hidden?: boolean;
};
/**
 * The error API is used to report errors to the app, and display them to the user.
 *
 * @remarks
 *
 * Plugins can use this API as a method of displaying errors to the user, but also
 * to report errors for collection by error reporting services.
 *
 * If an error can be displayed inline, e.g. as feedback in a form, that should be
 * preferred over relying on this API to display the error. The main use of this API
 * for displaying errors should be for asynchronous errors, such as a failing background process.
 *
 * Even if an error is displayed inline, it should still be reported through this API
 * if it would be useful to collect or log it for debugging purposes, but with
 * the hidden flag set. For example, an error arising from form field validation
 * should probably not be reported, while a failed REST call would be useful to report.
 *
 * @public
 */
declare type ErrorApi = {
    /**
     * Post an error for handling by the application.
     */
    post(error: ErrorApiError, context?: ErrorApiErrorContext): void;
    /**
     * Observe errors posted by other parts of the application.
     */
    error$(): Observable<{
        error: ErrorApiError;
        context?: ErrorApiErrorContext;
    }>;
};
/**
 * The {@link ApiRef} of {@link ErrorApi}.
 *
 * @public
 */
declare const errorApiRef: ApiRef<ErrorApi>;

/**
 * Feature flag descriptor.
 *
 * @public
 */
declare type FeatureFlag = {
    name: string;
    pluginId: string;
};
/**
 * Enum representing the state of a feature flag (inactive/active).
 *
 * @public
 */
declare enum FeatureFlagState {
    /**
     * Feature flag inactive (disabled).
     */
    None = 0,
    /**
     * Feature flag active (enabled).
     */
    Active = 1
}
/**
 * Options to use when saving feature flags.
 *
 * @public
 */
declare type FeatureFlagsSaveOptions = {
    /**
     * The new feature flag states to save.
     */
    states: Record<string, FeatureFlagState>;
    /**
     * Whether the saves states should be merged into the existing ones, or replace them.
     *
     * Defaults to false.
     */
    merge?: boolean;
};
/**
 * The feature flags API is used to toggle functionality to users across plugins and Backstage.
 *
 * @remarks
 *
 * Plugins can use this API to register feature flags that they have available
 * for users to enable/disable, and this API will centralize the current user's
 * state of which feature flags they would like to enable.
 *
 * This is ideal for Backstage plugins, as well as your own App, to trial incomplete
 * or unstable upcoming features. Although there will be a common interface for users
 * to enable and disable feature flags, this API acts as another way to enable/disable.
 *
 * @public
 */
interface FeatureFlagsApi {
    /**
     * Registers a new feature flag. Once a feature flag has been registered it
     * can be toggled by users, and read back to enable or disable features.
     */
    registerFlag(flag: FeatureFlag): void;
    /**
     * Get a list of all registered flags.
     */
    getRegisteredFlags(): FeatureFlag[];
    /**
     * Whether the feature flag with the given name is currently activated for the user.
     */
    isActive(name: string): boolean;
    /**
     * Save the user's choice of feature flag states.
     */
    save(options: FeatureFlagsSaveOptions): void;
}
/**
 * The {@link ApiRef} of {@link FeatureFlagsApi}.
 *
 * @public
 */
declare const featureFlagsApiRef: ApiRef<FeatureFlagsApi>;

/**
 * A wrapper for the fetch API, that has additional behaviors such as the
 * ability to automatically inject auth information where necessary.
 *
 * @public
 */
declare type FetchApi = {
    /**
     * The `fetch` implementation.
     */
    fetch: typeof fetch;
};
/**
 * The {@link ApiRef} of {@link FetchApi}.
 *
 * @remarks
 *
 * This is a wrapper for the fetch API, that has additional behaviors such as
 * the ability to automatically inject auth information where necessary.
 *
 * @public
 */
declare const fetchApiRef: ApiRef<FetchApi>;

/**
 * The Identity API used to identify and get information about the signed in user.
 *
 * @public
 */
declare type IdentityApi = {
    /**
     * The profile of the signed in user.
     */
    getProfileInfo(): Promise<ProfileInfo>;
    /**
     * User identity information within Backstage.
     */
    getBackstageIdentity(): Promise<BackstageUserIdentity>;
    /**
     * Provides credentials in the form of a token which proves the identity of the signed in user.
     *
     * The token will be undefined if the signed in user does not have a verified
     * identity, such as a demo user or mocked user for e2e tests.
     */
    getCredentials(): Promise<{
        token?: string;
    }>;
    /**
     * Sign out the current user
     */
    signOut(): Promise<void>;
};
/**
 * The {@link ApiRef} of {@link IdentityApi}.
 *
 * @public
 */
declare const identityApiRef: ApiRef<IdentityApi>;

/**
 * Describes how to handle auth requests. Both how to show them to the user, and what to do when
 * the user accesses the auth request.
 *
 * @public
 */
declare type OAuthRequesterOptions<TOAuthResponse> = {
    /**
     * Information about the auth provider, which will be forwarded to auth requests.
     */
    provider: AuthProviderInfo;
    /**
     * Implementation of the auth flow, which will be called synchronously when
     * trigger() is called on an auth requests.
     */
    onAuthRequest(scopes: Set<string>): Promise<TOAuthResponse>;
};
/**
 * Function used to trigger new auth requests for a set of scopes.
 *
 * @remarks
 *
 * The returned promise will resolve to the same value returned by the onAuthRequest in the
 * {@link OAuthRequesterOptions}. Or rejected, if the request is rejected.
 *
 * This function can be called multiple times before the promise resolves. All calls
 * will be merged into one request, and the scopes forwarded to the onAuthRequest will be the
 * union of all requested scopes.
 *
 * @public
 */
declare type OAuthRequester<TAuthResponse> = (scopes: Set<string>) => Promise<TAuthResponse>;
/**
 * An pending auth request for a single auth provider. The request will remain in this pending
 * state until either reject() or trigger() is called.
 *
 * @remarks
 *
 * Any new requests for the same provider are merged into the existing pending request, meaning
 * there will only ever be a single pending request for a given provider.
 *
 * @public
 */
declare type PendingOAuthRequest = {
    /**
     * Information about the auth provider, as given in the AuthRequesterOptions
     */
    provider: AuthProviderInfo;
    /**
     * Rejects the request, causing all pending AuthRequester calls to fail with "RejectedError".
     */
    reject(): void;
    /**
     * Trigger the auth request to continue the auth flow, by for example showing a popup.
     *
     * Synchronously calls onAuthRequest with all scope currently in the request.
     */
    trigger(): Promise<void>;
};
/**
 * Provides helpers for implemented OAuth login flows within Backstage.
 *
 * @public
 */
declare type OAuthRequestApi = {
    /**
     * A utility for showing login popups or similar things, and merging together multiple requests for
     * different scopes into one request that includes all scopes.
     *
     * The passed in options provide information about the login provider, and how to handle auth requests.
     *
     * The returned AuthRequester function is used to request login with new scopes. These requests
     * are merged together and forwarded to the auth handler, as soon as a consumer of auth requests
     * triggers an auth flow.
     *
     * See AuthRequesterOptions, AuthRequester, and handleAuthRequests for more info.
     */
    createAuthRequester<OAuthResponse>(options: OAuthRequesterOptions<OAuthResponse>): OAuthRequester<OAuthResponse>;
    /**
     * Observers pending auth requests. The returned observable will emit all
     * current active auth request, at most one for each created auth requester.
     *
     * Each request has its own info about the login provider, forwarded from the auth requester options.
     *
     * Depending on user interaction, the request should either be rejected, or used to trigger the auth handler.
     * If the request is rejected, all pending AuthRequester calls will fail with a "RejectedError".
     * If a auth is triggered, and the auth handler resolves successfully, then all currently pending
     * AuthRequester calls will resolve to the value returned by the onAuthRequest call.
     */
    authRequest$(): Observable<PendingOAuthRequest[]>;
};
/**
 * The {@link ApiRef} of {@link OAuthRequestApi}.
 *
 * @public
 */
declare const oauthRequestApiRef: ApiRef<OAuthRequestApi>;

/**
 * A snapshot in time of the current known value of a storage key.
 *
 * @public
 */
declare type StorageValueSnapshot<TValue extends JsonValue> = {
    key: string;
    presence: 'unknown' | 'absent';
    value?: undefined;
} | {
    key: string;
    presence: 'present';
    value: TValue;
};
/**
 * Provides a key-value persistence API.
 *
 * @public
 */
interface StorageApi {
    /**
     * Create a bucket to store data in.
     *
     * @param name - Namespace for the storage to be stored under,
     *               will inherit previous namespaces too
     */
    forBucket(name: string): StorageApi;
    /**
     * Remove persistent data.
     *
     * @param key - Unique key associated with the data.
     */
    remove(key: string): Promise<void>;
    /**
     * Save persistent data, and emit messages to anyone that is using
     * {@link StorageApi.observe$} for this key.
     *
     * @param key - Unique key associated with the data.
     * @param data - The data to be stored under the key.
     */
    set<T extends JsonValue>(key: string, data: T): Promise<void>;
    /**
     * Observe the value over time for a particular key in the current bucket.
     *
     * @remarks
     *
     * The observable will only emit values when the value changes in the underlying
     * storage, although multiple values with the same shape may be emitted in a row.
     *
     * If a {@link StorageApi.snapshot} of a key is retrieved and the presence is
     * `'unknown'`, then you are guaranteed to receive a snapshot with a known
     * presence, as long as you observe the key within the same tick.
     *
     * Since the emitted values are shared across all subscribers, it is important
     * not to mutate the returned values. The values may be frozen as a precaution.
     *
     * @param key - Unique key associated with the data
     */
    observe$<T extends JsonValue>(key: string): Observable<StorageValueSnapshot<T>>;
    /**
     * Returns an immediate snapshot value for the given key, if possible.
     *
     * @remarks
     *
     * Combine with {@link StorageApi.observe$} to get notified of value changes.
     *
     * Note that this method is synchronous, and some underlying storages may be
     * unable to retrieve a value using this method - the result may or may not
     * consistently have a presence of 'unknown'. Use {@link StorageApi.observe$}
     * to be sure to receive an actual value eventually.
     */
    snapshot<T extends JsonValue>(key: string): StorageValueSnapshot<T>;
}
/**
 * The {@link ApiRef} of {@link StorageApi}.
 *
 * @public
 */
declare const storageApiRef: ApiRef<StorageApi>;

/**
 * Gets a pre-configured analytics tracker.
 *
 * @alpha
 */
declare function useAnalytics(): AnalyticsTracker;

/**
 * Props for the `BootErrorPage` component of {@link AppComponents}.
 *
 * @public
 */
declare type BootErrorPageProps = {
    step: 'load-config' | 'load-chunk';
    error: Error;
};
/**
 * Props for the `SignInPage` component of {@link AppComponents}.
 *
 * @public
 */
declare type SignInPageProps = {
    /**
     * Set the IdentityApi on successful sign in. This should only be called once.
     */
    onSignInSuccess(identityApi: IdentityApi$1): void;
};
/**
 * Props for the fallback error boundary.
 *
 * @public
 */
declare type ErrorBoundaryFallbackProps = {
    plugin?: BackstagePlugin$1;
    error: Error;
    resetError: () => void;
};
/**
 * A set of replaceable core components that are part of every Backstage app.
 *
 * @public
 */
declare type AppComponents = {
    NotFoundErrorPage: ComponentType<{}>;
    BootErrorPage: ComponentType<BootErrorPageProps>;
    Progress: ComponentType<{}>;
    Router: ComponentType<{}>;
    ErrorBoundaryFallback: ComponentType<ErrorBoundaryFallbackProps>;
    ThemeProvider?: ComponentType<{}>;
    /**
     * An optional sign-in page that will be rendered instead of the AppRouter at startup.
     *
     * If a sign-in page is set, it will always be shown before the app, and it is up
     * to the sign-in page to handle e.g. saving of login methods for subsequent visits.
     *
     * The sign-in page will be displayed until it has passed up a result to the parent,
     * and which point the AppRouter and all of its children will be rendered instead.
     */
    SignInPage?: ComponentType<SignInPageProps>;
};
/**
 * The central context providing runtime app specific state that plugin views
 * want to consume.
 *
 * @public
 */
declare type AppContext = {
    /**
     * Get a list of all plugins that are installed in the app.
     */
    getPlugins(): BackstagePlugin$1<any, any>[];
    /**
     * Get a common or custom icon for this app.
     */
    getSystemIcon(key: string): IconComponent$1 | undefined;
    /**
     * Get the components registered for various purposes in the app.
     */
    getComponents(): AppComponents;
};

/**
 * React hook providing {@link AppContext}.
 *
 * @public
 */
declare const useApp: () => AppContext;

/**
 * Stores data related to a component in a global store.
 *
 * @remarks
 *
 * See {@link https://backstage.io/docs/plugins/composability#component-data}.
 *
 * @param component - The component to attach the data to.
 * @param type - The key under which the data will be stored.
 * @param data - Arbitrary value.
 * @public
 */
declare function attachComponentData<P>(component: ComponentType<P>, type: string, data: unknown): void;
/**
 * Retrieves data attached to a component.
 *
 * @remarks
 *
 * See {@link https://backstage.io/docs/plugins/composability#component-data}.
 *
 * @param node - React component to look up.
 * @param type - Key of the data to retrieve.
 * @returns Data stored using {@link attachComponentData}.
 * @public
 */
declare function getComponentData<T>(node: ReactNode, type: string): T | undefined;

/**
 * Catch-all type for route params.
 *
 * @public
 */
declare type AnyParams = {
    [param in string]: string;
} | undefined;
/**
 * Type describing the key type of a route parameter mapping.
 *
 * @public
 */
declare type ParamKeys<Params extends AnyParams> = keyof Params extends never ? [] : (keyof Params)[];
/**
 * Optional route params.
 *
 * @public
 */
declare type OptionalParams<Params extends {
    [param in string]: string;
}> = Params[keyof Params] extends never ? undefined : Params;
/**
 * TS magic for handling route parameters.
 *
 * @remarks
 *
 * The extra TS magic here is to require a single params argument if the RouteRef
 * had at least one param defined, but require 0 arguments if there are no params defined.
 * Without this we'd have to pass in empty object to all parameter-less RouteRefs
 * just to make TypeScript happy, or we would have to make the argument optional in
 * which case you might forget to pass it in when it is actually required.
 *
 * @public
 */
declare type RouteFunc<Params extends AnyParams> = (...[params]: Params extends undefined ? readonly [] : readonly [Params]) => string;
/**
 * Absolute route reference.
 *
 * @remarks
 *
 * See {@link https://backstage.io/docs/plugins/composability#routing-system}.
 *
 * @public
 */
declare type RouteRef<Params extends AnyParams = any> = {
    $$routeRefType: 'absolute';
    params: ParamKeys<Params>;
};
/**
 * Descriptor of a route relative to an absolute {@link RouteRef}.
 *
 * @remarks
 *
 * See {@link https://backstage.io/docs/plugins/composability#routing-system}.
 *
 * @public
 */
declare type SubRouteRef<Params extends AnyParams = any> = {
    $$routeRefType: 'sub';
    parent: RouteRef;
    path: string;
    params: ParamKeys<Params>;
};
/**
 * Route descriptor, to be later bound to a concrete route by the app. Used to implement cross-plugin route references.
 *
 * @remarks
 *
 * See {@link https://backstage.io/docs/plugins/composability#routing-system}.
 *
 * @public
 */
declare type ExternalRouteRef<Params extends AnyParams = any, Optional extends boolean = any> = {
    $$routeRefType: 'external';
    params: ParamKeys<Params>;
    optional?: Optional;
};

/**
 * Create a {@link RouteRef} from a route descriptor.
 *
 * @param config - Description of the route reference to be created.
 * @public
 */
declare function createRouteRef<Params extends {
    [param in ParamKey]: string;
}, ParamKey extends string = never>(config: {
    /** The id of the route ref, used to identify it when printed */
    id: string;
    /** A list of parameter names that the path that this route ref is bound to must contain */
    params?: ParamKey[];
}): RouteRef<OptionalParams<Params>>;

/**
 * Used in {@link PathParams} type declaration.
 * @public
 */
declare type ParamPart<S extends string> = S extends `:${infer Param}` ? Param : never;
/**
 * Used in {@link PathParams} type declaration.
 * @public
 */
declare type ParamNames<S extends string> = S extends `${infer Part}/${infer Rest}` ? ParamPart<Part> | ParamNames<Rest> : ParamPart<S>;
/**
 * This utility type helps us infer a Param object type from a string path
 * For example, `/foo/:bar/:baz` inferred to `{ bar: string, baz: string }`
 * @public
 */
declare type PathParams<S extends string> = {
    [name in ParamNames<S>]: string;
};
/**
 * Merges a param object type with with an optional params type into a params object.
 * @public
 */
declare type MergeParams<P1 extends {
    [param in string]: string;
}, P2 extends AnyParams> = (P1[keyof P1] extends never ? {} : P1) & (P2 extends undefined ? {} : P2);
/**
 * Creates a SubRouteRef type given the desired parameters and parent route parameters.
 * The parameters types are merged together while ensuring that there is no overlap between the two.
 *
 * @public
 */
declare type MakeSubRouteRef<Params extends {
    [param in string]: string;
}, ParentParams extends AnyParams> = keyof Params & keyof ParentParams extends never ? SubRouteRef<OptionalParams<MergeParams<Params, ParentParams>>> : never;
/**
 * Create a {@link SubRouteRef} from a route descriptor.
 *
 * @param config - Description of the route reference to be created.
 * @public
 */
declare function createSubRouteRef<Path extends string, ParentParams extends AnyParams = never>(config: {
    id: string;
    path: Path;
    parent: RouteRef<ParentParams>;
}): MakeSubRouteRef<PathParams<Path>, ParentParams>;

/**
 * Creates a route descriptor, to be later bound to a concrete route by the app. Used to implement cross-plugin route references.
 *
 * @remarks
 *
 * See {@link https://backstage.io/docs/plugins/composability#routing-system}.
 *
 * @param options - Description of the route reference to be created.
 * @public
 */
declare function createExternalRouteRef<Params extends {
    [param in ParamKey]: string;
}, Optional extends boolean = false, ParamKey extends string = never>(options: {
    /**
     * An identifier for this route, used to identify it in error messages
     */
    id: string;
    /**
     * The parameters that will be provided to the external route reference.
     */
    params?: ParamKey[];
    /**
     * Whether or not this route is optional, defaults to false.
     *
     * Optional external routes are not required to be bound in the app, and
     * if they aren't, `useRouteRef` will return `undefined`.
     */
    optional?: Optional;
}): ExternalRouteRef<OptionalParams<Params>, Optional>;

/**
 * React hook for constructing URLs to routes.
 *
 * @remarks
 *
 * See {@link https://backstage.io/docs/plugins/composability#routing-system}
 *
 * @param routeRef - The ref to route that should be converted to URL.
 * @returns A function that will in turn return the concrete URL of the `routeRef`.
 * @public
 */
declare function useRouteRef<Optional extends boolean, Params extends AnyParams>(routeRef: ExternalRouteRef<Params, Optional>): Optional extends true ? RouteFunc<Params> | undefined : RouteFunc<Params>;
/**
 * React hook for constructing URLs to routes.
 *
 * @remarks
 *
 * See {@link https://backstage.io/docs/plugins/composability#routing-system}
 *
 * @param routeRef - The ref to route that should be converted to URL.
 * @returns A function that will in turn return the concrete URL of the `routeRef`.
 * @public
 */
declare function useRouteRef<Params extends AnyParams>(routeRef: RouteRef<Params> | SubRouteRef<Params>): RouteFunc<Params>;

/**
 * React hook for retrieving dynamic params from the current URL.
 * @param _routeRef - Ref of the current route.
 * @public
 */
declare function useRouteRefParams<Params extends AnyParams>(_routeRef: RouteRef<Params> | SubRouteRef<Params>): Params;

/**
 * Plugin extension type.
 *
 * @remarks
 *
 * See {@link https://backstage.io/docs/plugins/composability#extensions}.
 *
 * @public
 */
declare type Extension<T> = {
    expose(plugin: BackstagePlugin<any, any>): T;
};
/**
 * Catch-all route type.
 *
 * @public
 */
declare type AnyRoutes = {
    [name: string]: RouteRef | SubRouteRef;
};
/**
 * Catch-all type for {@link ExternalRouteRef}s.
 *
 * @public
 */
declare type AnyExternalRoutes = {
    [name: string]: ExternalRouteRef;
};
/**
 * Plugin type.
 *
 * @public
 */
declare type BackstagePlugin<Routes extends AnyRoutes = {}, ExternalRoutes extends AnyExternalRoutes = {}> = {
    getId(): string;
    getApis(): Iterable<AnyApiFactory>;
    /**
     * Returns all registered feature flags for this plugin.
     */
    getFeatureFlags(): Iterable<PluginFeatureFlagConfig>;
    provide<T>(extension: Extension<T>): T;
    routes: Routes;
    externalRoutes: ExternalRoutes;
};
/**
 * Plugin feature flag configuration.
 *
 * @public
 */
declare type PluginFeatureFlagConfig = {
    /** Feature flag name */
    name: string;
};
/**
 * Plugin descriptor type.
 *
 * @public
 */
declare type PluginConfig<Routes extends AnyRoutes, ExternalRoutes extends AnyExternalRoutes> = {
    id: string;
    apis?: Iterable<AnyApiFactory>;
    routes?: Routes;
    externalRoutes?: ExternalRoutes;
    featureFlags?: PluginFeatureFlagConfig[];
};
/**
 * Interface for registering feature flags hooks.
 *
 * @public
 */
declare type FeatureFlagsHooks = {
    register(name: string): void;
};

/**
 * Lazy or synchronous retrieving of extension components.
 *
 * @public
 */
declare type ComponentLoader<T> = {
    lazy: () => Promise<T>;
} | {
    sync: T;
};
/**
 * Extension for components that can have its own URL route (top-level pages, tabs etc.).
 *
 * @remarks
 *
 * We do not use ComponentType as the return type, since it doesn't let us convey the children prop.
 * ComponentType inserts children as an optional prop whether the inner component accepts it or not,
 * making it impossible to make the usage of children type safe.
 *
 * See {@link https://backstage.io/docs/plugins/composability#extensions}.
 *
 * @public
 */
declare function createRoutableExtension<T extends (props: any) => JSX.Element | null>(options: {
    /**
     * A loader for the component that is rendered by this extension.
     */
    component: () => Promise<T>;
    /**
     * The mount point to bind this routable extension to.
     *
     * If this extension is placed somewhere in the app element tree of a Backstage
     * app, callers will be able to route to this extensions by calling,
     * `useRouteRef` with this mount point.
     */
    mountPoint: RouteRef;
    /**
     * The name of this extension that will represent it at runtime. It is for example
     * used to identify this extension in analytics data.
     *
     * If possible the name should always be the same as the name of the exported
     * variable for this extension.
     */
    name?: string;
}): Extension<T>;
/**
 * Plain React component extension.
 *
 * @remarks
 *
 * We do not use ComponentType as the return type, since it doesn't let us convey the children prop.
 * ComponentType inserts children as an optional prop whether the inner component accepts it or not,
 * making it impossible to make the usage of children type safe.
 *
 * See {@link https://backstage.io/docs/plugins/composability#extensions}.
 *
 * @public
 */
declare function createComponentExtension<T extends (props: any) => JSX.Element | null>(options: {
    /**
     * A loader or synchronously supplied component that is rendered by this extension.
     */
    component: ComponentLoader<T>;
    /**
     * The name of this extension that will represent it at runtime. It is for example
     * used to identify this extension in analytics data.
     *
     * If possible the name should always be the same as the name of the exported
     * variable for this extension.
     */
    name?: string;
}): Extension<T>;
/**
 * Used by {@link createComponentExtension} and {@link createRoutableExtension}.
 *
 * @remarks
 *
 * We do not use ComponentType as the return type, since it doesn't let us convey the children prop.
 * ComponentType inserts children as an optional prop whether the inner component accepts it or not,
 * making it impossible to make the usage of children type safe.
 *
 * See {@link https://backstage.io/docs/plugins/composability#extensions}.
 *
 * @public
 */
declare function createReactExtension<T extends (props: any) => JSX.Element | null>(options: {
    /**
     * A loader or synchronously supplied component that is rendered by this extension.
     */
    component: ComponentLoader<T>;
    /**
     * Additional component data that is attached to the top-level extension component.
     */
    data?: Record<string, unknown>;
    /**
     * The name of this extension that will represent it at runtime. It is for example
     * used to identify this extension in analytics data.
     *
     * If possible the name should always be the same as the name of the exported
     * variable for this extension.
     */
    name?: string;
}): Extension<T>;

/**
 * A querying interface tailored to traversing a set of selected React elements
 * and extracting data.
 *
 * @remarks
 *
 * Methods prefixed with `selectBy` are used to narrow the set of selected elements.
 *
 * Methods prefixed with `find` return concrete data using a deep traversal of the set.
 *
 * Methods prefixed with `get` return concrete data using a shallow traversal of the set.
 *
 * @public
 */
interface ElementCollection {
    /**
     * Narrows the set of selected components by doing a deep traversal and
     * only including those that have defined component data for the given `key`.
     *
     * @remarks
     *
     * Whether an element in the tree has component data set for the given key
     * is determined by whether `getComponentData` returns undefined.
     *
     * The traversal does not continue deeper past elements that match the criteria,
     * and it also includes the root children in the selection, meaning that if the,
     * of all the currently selected elements contain data for the given key, this
     * method is a no-op.
     *
     * If `withStrictError` is set, the resulting selection must be a full match, meaning
     * there may be no elements that were excluded in the selection. If the selection
     * is not a clean match, an error will be throw with `withStrictError` as the message.
     *
     * @param query - Filtering query.
     */
    selectByComponentData(query: {
        key: string;
        withStrictError?: string;
    }): ElementCollection;
    /**
     * Finds all elements using the same criteria as `selectByComponentData`, but
     * returns the actual component data of each of those elements instead.
     *
     * @param query - Lookup query.
     */
    findComponentData<T>(query: {
        key: string;
    }): T[];
    /**
     * Returns all of the elements currently selected by this collection.
     */
    getElements<Props extends {
        [name: string]: unknown;
    }>(): Array<ReactElement<Props>>;
}
/**
 * useElementFilter is a utility that helps you narrow down and retrieve data
 * from a React element tree, typically operating on the `children` property
 * passed in to a component.
 *
 * @remarks
 *
 * A common use-case is to construct declarative APIs
 * where a React component defines its behavior based on its children, such as
 * the relationship between `Routes` and `Route` in `react-router`.
 *
 * The purpose of this hook is similar to `React.Children.map`, and it expands upon
 * it to also handle traversal of fragments and Backstage specific things like the
 * `FeatureFlagged` component.
 *
 * The return value of the hook is computed by the provided filter function, but
 * with added memoization based on the input `node`. If further memoization
 * dependencies are used in the filter function, they should be added to the
 * third `dependencies` argument, just like `useMemo`, `useEffect`, etc.
 *
 * @public
 */
declare function useElementFilter<T>(node: ReactNode, filterFn: (arg: ElementCollection) => T, dependencies?: any[]): T;

/**
 * Creates Backstage Plugin from config.
 *
 * @param config - Plugin configuration.
 * @public
 */
declare function createPlugin<Routes extends AnyRoutes = {}, ExternalRoutes extends AnyExternalRoutes = {}>(config: PluginConfig<Routes, ExternalRoutes>): BackstagePlugin<Routes, ExternalRoutes>;

export { AlertApi, AlertMessage, AnalyticsApi, AnalyticsContext, AnalyticsContextValue, AnalyticsEvent, AnalyticsEventAttributes, AnalyticsTracker, AnyApiFactory, AnyApiRef, AnyExternalRoutes, AnyParams, AnyRoutes, ApiFactory, ApiHolder, ApiRef, ApiRefConfig, AppComponents, AppContext, AppTheme, AppThemeApi, AuthProviderInfo, AuthRequestOptions, BackstageIdentityApi, BackstageIdentityResponse, BackstagePlugin, BackstageUserIdentity, BootErrorPageProps, CommonAnalyticsContext, ComponentLoader, ConfigApi, DiscoveryApi, ElementCollection, ErrorApi, ErrorApiError, ErrorApiErrorContext, ErrorBoundaryFallbackProps, Extension, ExternalRouteRef, FeatureFlag, FeatureFlagState, FeatureFlagsApi, FeatureFlagsHooks, FeatureFlagsSaveOptions, FetchApi, IconComponent, IdentityApi, MakeSubRouteRef, MergeParams, OAuthApi, OAuthRequestApi, OAuthRequester, OAuthRequesterOptions, OAuthScope, OpenIdConnectApi, OptionalParams, ParamKeys, ParamNames, ParamPart, PathParams, PendingOAuthRequest, PluginConfig, PluginFeatureFlagConfig, ProfileInfo, ProfileInfoApi, RouteFunc, RouteRef, SessionApi, SessionState, SignInPageProps, StorageApi, StorageValueSnapshot, SubRouteRef, TypesToApiRefs, alertApiRef, analyticsApiRef, appThemeApiRef, atlassianAuthApiRef, attachComponentData, bitbucketAuthApiRef, configApiRef, createApiFactory, createApiRef, createComponentExtension, createExternalRouteRef, createPlugin, createReactExtension, createRoutableExtension, createRouteRef, createSubRouteRef, discoveryApiRef, errorApiRef, featureFlagsApiRef, fetchApiRef, getComponentData, githubAuthApiRef, gitlabAuthApiRef, googleAuthApiRef, identityApiRef, microsoftAuthApiRef, oauthRequestApiRef, oktaAuthApiRef, oneloginAuthApiRef, storageApiRef, useAnalytics, useApi, useApiHolder, useApp, useElementFilter, useRouteRef, useRouteRefParams, withApis };
