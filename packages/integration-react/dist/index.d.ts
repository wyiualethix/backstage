/// <reference types="react" />
import * as _backstage_core_plugin_api from '@backstage/core-plugin-api';
import { AuthRequestOptions, ApiRef, OAuthApi } from '@backstage/core-plugin-api';
import { Config } from '@backstage/config';
import { ScmIntegrationRegistry } from '@backstage/integration';

/**
 * The options that control a {@link ScmAuthApi.getCredentials} call.
 *
 * @public
 */
interface ScmAuthTokenOptions extends AuthRequestOptions {
    /**
     * The URL of the SCM resource to be accessed.
     *
     * @example https://github.com/backstage/backstage
     */
    url: string;
    /**
     * Whether to request additional access scope.
     *
     * Read access to user, organization, and repositories is always included.
     */
    additionalScope?: {
        /**
         * Requests access to be able to write repository content, including
         * the ability to create things like issues and pull requests.
         */
        repoWrite?: boolean;
        /**
         * Allow an arbitrary list of scopes provided from the user
         * to request from the provider.
         */
        customScopes?: {
            github?: string[];
            azure?: string[];
            bitbucket?: string[];
            gitlab?: string[];
        };
    };
}
/**
 * The response from a {@link ScmAuthApi.getCredentials} call.
 *
 * @public
 */
interface ScmAuthTokenResponse {
    /**
     * An authorization token that can be used to authenticate requests.
     */
    token: string;
    /**
     * The set of HTTP headers that are needed to authenticate requests.
     */
    headers: {
        [name: string]: string;
    };
}
/**
 * ScmAuthApi provides methods for authenticating towards source code management services.
 *
 * As opposed to using the GitHub, GitLab and other auth APIs
 * directly, this API allows for more generic access to SCM services.
 *
 * @public
 */
interface ScmAuthApi {
    /**
     * Requests credentials for accessing an SCM resource.
     */
    getCredentials(options: ScmAuthTokenOptions): Promise<ScmAuthTokenResponse>;
}
/**
 * The ApiRef for the ScmAuthApi.
 *
 * @public
 */
declare const scmAuthApiRef: ApiRef<ScmAuthApi>;

/**
 * An implementation of the ScmAuthApi that merges together OAuthApi instances
 * to form a single instance that can handles authentication for multiple providers.
 *
 * @public
 *
 * @example
 * ```
 * // Supports authentication towards both public GitHub and GHE:
 * createApiFactory({
 *   api: scmAuthApiRef,
 *   deps: {
 *     gheAuthApi: gheAuthApiRef,
 *     githubAuthApi: githubAuthApiRef,
 *   },
 *   factory: ({ githubAuthApi, gheAuthApi }) =>
 *     ScmAuth.merge(
 *       ScmAuth.forGithub(githubAuthApi),
 *       ScmAuth.forGithub(gheAuthApi, {
 *         host: 'ghe.example.com',
 *       }),
 *     )
 * })
 * ```
 */
declare class ScmAuth implements ScmAuthApi {
    #private;
    /**
     * Creates an API factory that enables auth for each of the default SCM providers.
     */
    static createDefaultApiFactory(): _backstage_core_plugin_api.ApiFactory<ScmAuthApi, ScmAuthApi, {
        github: OAuthApi & _backstage_core_plugin_api.ProfileInfoApi & _backstage_core_plugin_api.BackstageIdentityApi & _backstage_core_plugin_api.SessionApi;
        gitlab: OAuthApi & _backstage_core_plugin_api.ProfileInfoApi & _backstage_core_plugin_api.BackstageIdentityApi & _backstage_core_plugin_api.SessionApi;
        azure: OAuthApi & _backstage_core_plugin_api.OpenIdConnectApi & _backstage_core_plugin_api.ProfileInfoApi & _backstage_core_plugin_api.BackstageIdentityApi & _backstage_core_plugin_api.SessionApi;
        bitbucket: OAuthApi & _backstage_core_plugin_api.ProfileInfoApi & _backstage_core_plugin_api.BackstageIdentityApi & _backstage_core_plugin_api.SessionApi;
    }>;
    /**
     * Creates a general purpose ScmAuth instance with a custom scope mapping.
     */
    static forAuthApi(authApi: OAuthApi, options: {
        host: string;
        scopeMapping: {
            default: string[];
            repoWrite: string[];
        };
    }): ScmAuth;
    /**
     * Creates a new ScmAuth instance that handles authentication towards GitHub.
     *
     * The host option determines which URLs that are handled by this instance and defaults to `github.com`.
     *
     * The default scopes are:
     *
     * `repo read:org read:user`
     *
     * If the additional `repoWrite` permission is requested, these scopes are added:
     *
     * `gist`
     */
    static forGithub(githubAuthApi: OAuthApi, options?: {
        host?: string;
    }): ScmAuth;
    /**
     * Creates a new ScmAuth instance that handles authentication towards GitLab.
     *
     * The host option determines which URLs that are handled by this instance and defaults to `gitlab.com`.
     *
     * The default scopes are:
     *
     * `read_user read_api read_repository`
     *
     * If the additional `repoWrite` permission is requested, these scopes are added:
     *
     * `write_repository api`
     */
    static forGitlab(gitlabAuthApi: OAuthApi, options?: {
        host?: string;
    }): ScmAuth;
    /**
     * Creates a new ScmAuth instance that handles authentication towards Azure.
     *
     * The host option determines which URLs that are handled by this instance and defaults to `dev.azure.com`.
     *
     * The default scopes are:
     *
     * `vso.build vso.code vso.graph vso.project vso.profile`
     *
     * If the additional `repoWrite` permission is requested, these scopes are added:
     *
     * `vso.code_manage`
     */
    static forAzure(microsoftAuthApi: OAuthApi, options?: {
        host?: string;
    }): ScmAuth;
    /**
     * Creates a new ScmAuth instance that handles authentication towards Bitbucket.
     *
     * The host option determines which URLs that are handled by this instance and defaults to `bitbucket.org`.
     *
     * The default scopes are:
     *
     * `account team pullrequest snippet issue`
     *
     * If the additional `repoWrite` permission is requested, these scopes are added:
     *
     * `pullrequest:write snippet:write issue:write`
     */
    static forBitbucket(bitbucketAuthApi: OAuthApi, options?: {
        host?: string;
    }): ScmAuth;
    /**
     * Merges together multiple ScmAuth instances into one that
     * routes requests to the correct instance based on the URL.
     */
    static merge(...providers: ScmAuth[]): ScmAuthApi;
    private constructor();
    /**
     * Checks whether the implementation is able to provide authentication for the given URL.
     */
    isUrlSupported(url: URL): boolean;
    private getAdditionalScopesForProvider;
    /**
     * Fetches credentials for the given resource.
     */
    getCredentials(options: ScmAuthTokenOptions): Promise<ScmAuthTokenResponse>;
}

/**
 * Factory class for creating {@link @backstage/integration#ScmIntegrationRegistry} instances.
 *
 * @public
 */
declare class ScmIntegrationsApi {
    /**
     * Instantiates an {@link @backstage/integration#ScmIntegrationRegistry}.
     *
     * @param config - The root of the config hierarchy.
     */
    static fromConfig(config: Config): ScmIntegrationRegistry;
}
/**
 * The API that holds all configured SCM integrations.
 *
 * @public
 */
declare const scmIntegrationsApiRef: ApiRef<ScmIntegrationRegistry>;

/**
 * Props for {@link ScmIntegrationIcon}.
 *
 * @public
 */
declare type ScmIntegrationIconProps = {
    /**
     * The integration type, e.g. "github".
     */
    type?: string;
};
/**
 * An icon that represents a certain SCM integration.
 *
 * @public
 */
declare const ScmIntegrationIcon: (props: ScmIntegrationIconProps) => JSX.Element;

export { ScmAuth, ScmAuthApi, ScmAuthTokenOptions, ScmAuthTokenResponse, ScmIntegrationIcon, ScmIntegrationIconProps, ScmIntegrationsApi, scmAuthApiRef, scmIntegrationsApiRef };
