import { Config } from '@backstage/config';
import { RestEndpointMethodTypes } from '@octokit/rest';

/**
 * Encapsulates a single SCM integration.
 *
 * @public
 */
interface ScmIntegration {
    /**
     * The type of integration, e.g. "github".
     */
    type: string;
    /**
     * A human readable title for the integration, that can be shown to users to
     * differentiate between different integrations.
     */
    title: string;
    /**
     * Resolves an absolute or relative URL in relation to a base URL.
     *
     * This method is adapted for use within SCM systems, so relative URLs are
     * within the context of the root of the hierarchy pointed to by the base
     * URL.
     *
     * For example, if the base URL is  `<repo root url>/folder/a.yaml`, i.e.
     * within the file tree of a certain repo, an absolute path of `/b.yaml` does
     * not resolve to `https://hostname/b.yaml` but rather to
     * `<repo root url>/b.yaml` inside the file tree of that same repo.
     */
    resolveUrl(options: {
        /**
         * The (absolute or relative) URL or path to resolve
         */
        url: string;
        /**
         * The base URL onto which this resolution happens
         */
        base: string;
        /**
         * The line number in the target file to link to, starting with 1. Only applicable when linking to files.
         */
        lineNumber?: number;
    }): string;
    /**
     * Resolves the edit URL for a file within the SCM system.
     *
     * Most SCM systems have a web interface that allows viewing and editing files
     * in the repository. The returned URL directly jumps into the edit mode for
     * the file.
     * If this is not possible, the integration can fall back to a URL to view
     * the file in the web interface.
     *
     * @param url - The absolute URL to the file that should be edited.
     */
    resolveEditUrl(url: string): string;
}
/**
 * Encapsulates several integrations, that are all of the same type.
 *
 * @public
 */
interface ScmIntegrationsGroup<T extends ScmIntegration> {
    /**
     * Lists all registered integrations of this type.
     */
    list(): T[];
    /**
     * Fetches an integration of this type by URL.
     *
     * @param url - A URL that matches a registered integration of this type
     */
    byUrl(url: string | URL): T | undefined;
    /**
     * Fetches an integration of this type by host name.
     *
     * @param host - A host name that matches a registered integration of this type
     */
    byHost(host: string): T | undefined;
}
/**
 * A factory function that creates an integration group based on configuration.
 *
 * @public
 */
declare type ScmIntegrationsFactory<T extends ScmIntegration> = (options: {
    config: Config;
}) => ScmIntegrationsGroup<T>;

/**
 * The configuration parameters for a single AWS S3 provider.
 *
 * @public
 */
declare type AwsS3IntegrationConfig = {
    /**
     * Host, derived from endpoint, and defaults to amazonaws.com
     */
    host: string;
    /**
     * (Optional) AWS Endpoint.
     * The endpoint URI to send requests to. The default endpoint is built from the configured region.
     * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property
     *
     * Supports non-AWS providers, e.g. for LocalStack, endpoint may look like http://localhost:4566
     */
    endpoint?: string;
    /**
     * (Optional) Whether to use path style URLs when communicating with S3.
     * Defaults to false.
     * This allows providers like LocalStack, Minio and Wasabi (and possibly others) to be used.
     */
    s3ForcePathStyle?: boolean;
    /**
     * (Optional) User access key id
     */
    accessKeyId?: string;
    /**
     * (Optional) User secret access key
     */
    secretAccessKey?: string;
    /**
     * (Optional) ARN of role to be assumed
     */
    roleArn?: string;
    /**
     * (Optional) External ID to use when assuming role
     */
    externalId?: string;
};
/**
 * Reads a single Aws S3 integration config.
 *
 * @param config - The config object of a single integration
 * @public
 */
declare function readAwsS3IntegrationConfig(config: Config): AwsS3IntegrationConfig;
/**
 * Reads a set of AWS S3 integration configs, and inserts some defaults for
 * public Amazon AWS if not specified.
 *
 * @param configs - The config objects of the integrations
 * @public
 */
declare function readAwsS3IntegrationConfigs(configs: Config[]): AwsS3IntegrationConfig[];

/**
 * Integrates with AWS S3 or compatible solutions.
 *
 * @public
 */
declare class AwsS3Integration implements ScmIntegration {
    private readonly integrationConfig;
    static factory: ScmIntegrationsFactory<AwsS3Integration>;
    get type(): string;
    get title(): string;
    get config(): AwsS3IntegrationConfig;
    constructor(integrationConfig: AwsS3IntegrationConfig);
    resolveUrl(options: {
        url: string;
        base: string;
        lineNumber?: number | undefined;
    }): string;
    resolveEditUrl(url: string): string;
}

/**
 * The configuration parameters for a single Azure provider.
 *
 * @public
 */
declare type AzureIntegrationConfig = {
    /**
     * The host of the target that this matches on, e.g. "dev.azure.com".
     *
     * Currently only "dev.azure.com" is supported.
     */
    host: string;
    /**
     * The authorization token to use for requests.
     *
     * If no token is specified, anonymous access is used.
     */
    token?: string;
};
/**
 * Reads a single Azure integration config.
 *
 * @param config - The config object of a single integration
 * @public
 */
declare function readAzureIntegrationConfig(config: Config): AzureIntegrationConfig;
/**
 * Reads a set of Azure integration configs, and inserts some defaults for
 * public Azure if not specified.
 *
 * @param configs - All of the integration config objects
 * @public
 */
declare function readAzureIntegrationConfigs(configs: Config[]): AzureIntegrationConfig[];

/**
 * Microsoft Azure based integration.
 *
 * @public
 */
declare class AzureIntegration implements ScmIntegration {
    private readonly integrationConfig;
    static factory: ScmIntegrationsFactory<AzureIntegration>;
    constructor(integrationConfig: AzureIntegrationConfig);
    get type(): string;
    get title(): string;
    get config(): AzureIntegrationConfig;
    resolveUrl(options: {
        url: string;
        base: string;
        lineNumber?: number;
    }): string;
    resolveEditUrl(url: string): string;
}

/**
 * Given a URL pointing to a file on a provider, returns a URL that is suitable
 * for fetching the contents of the data.
 *
 * @remarks
 *
 * Converts
 * - from: `https://dev.azure.com/{organization}/{project}/_git/reponame?path={path}&version=GB{commitOrBranch}&_a=contents`
 * - to:   `https://dev.azure.com/{organization}/{project}/_apis/git/repositories/reponame/items?path={path}&version={commitOrBranch}`
 *
 * @param url - A URL pointing to a file
 * @public
 */
declare function getAzureFileFetchUrl(url: string): string;
/**
 * Given a URL pointing to a path on a provider, returns a URL that is suitable
 * for downloading the subtree.
 *
 * @param url - A URL pointing to a path
 * @public
 */
declare function getAzureDownloadUrl(url: string): string;
/**
 * Given a URL, return the API URL to fetch commits on the branch.
 *
 * @param url - A URL pointing to a repository or a sub-path
 * @public
 */
declare function getAzureCommitsUrl(url: string): string;
/**
 * Gets the request options necessary to make requests to a given provider.
 *
 * @param config - The relevant provider config
 * @public
 */
declare function getAzureRequestOptions(config: AzureIntegrationConfig, additionalHeaders?: Record<string, string>): {
    headers: Record<string, string>;
};

/**
 * The configuration parameters for a single Bitbucket API provider.
 *
 * @public
 * @deprecated bitbucket integration replaced by integrations bitbucketCloud and bitbucketServer.
 */
declare type BitbucketIntegrationConfig = {
    /**
     * The host of the target that this matches on, e.g. "bitbucket.org"
     */
    host: string;
    /**
     * The base URL of the API of this provider, e.g. "https://api.bitbucket.org/2.0",
     * with no trailing slash.
     *
     * Values omitted at the optional property at the app-config will be deduced
     * from the "host" value.
     */
    apiBaseUrl: string;
    /**
     * The authorization token to use for requests to a Bitbucket Server provider.
     *
     * See https://confluence.atlassian.com/bitbucketserver/personal-access-tokens-939515499.html
     *
     * If no token is specified, anonymous access is used.
     */
    token?: string;
    /**
     * The username to use for requests to Bitbucket Cloud (bitbucket.org).
     */
    username?: string;
    /**
     * Authentication with Bitbucket Cloud (bitbucket.org) is done using app passwords.
     *
     * See https://support.atlassian.com/bitbucket-cloud/docs/app-passwords/
     */
    appPassword?: string;
};
/**
 * Reads a single Bitbucket integration config.
 *
 * @param config - The config object of a single integration
 * @public
 * @deprecated bitbucket integration replaced by integrations bitbucketCloud and bitbucketServer.
 */
declare function readBitbucketIntegrationConfig(config: Config): BitbucketIntegrationConfig;
/**
 * Reads a set of Bitbucket integration configs, and inserts some defaults for
 * public Bitbucket if not specified.
 *
 * @param configs - All of the integration config objects
 * @public
 * @deprecated bitbucket integration replaced by integrations bitbucketCloud and bitbucketServer.
 */
declare function readBitbucketIntegrationConfigs(configs: Config[]): BitbucketIntegrationConfig[];

/**
 * A Bitbucket based integration.
 *
 * @public
 * @deprecated replaced by the integrations bitbucketCloud and bitbucketServer.
 */
declare class BitbucketIntegration implements ScmIntegration {
    private readonly integrationConfig;
    static factory: ScmIntegrationsFactory<BitbucketIntegration>;
    constructor(integrationConfig: BitbucketIntegrationConfig);
    get type(): string;
    get title(): string;
    get config(): BitbucketIntegrationConfig;
    resolveUrl(options: {
        url: string;
        base: string;
        lineNumber?: number;
    }): string;
    resolveEditUrl(url: string): string;
}

/**
 * Given a URL pointing to a path on a provider, returns the default branch.
 *
 * @param url - A URL pointing to a path
 * @param config - The relevant provider config
 * @public
 * @deprecated no longer in use, bitbucket integration replaced by integrations bitbucketCloud and bitbucketServer.
 */
declare function getBitbucketDefaultBranch(url: string, config: BitbucketIntegrationConfig): Promise<string>;
/**
 * Given a URL pointing to a path on a provider, returns a URL that is suitable
 * for downloading the subtree.
 *
 * @param url - A URL pointing to a path
 * @param config - The relevant provider config
 * @public
 * @deprecated no longer in use, bitbucket integration replaced by integrations bitbucketCloud and bitbucketServer.
 */
declare function getBitbucketDownloadUrl(url: string, config: BitbucketIntegrationConfig): Promise<string>;
/**
 * Given a URL pointing to a file on a provider, returns a URL that is suitable
 * for fetching the contents of the data.
 *
 * @remarks
 *
 * Converts
 * from: https://bitbucket.org/orgname/reponame/src/master/file.yaml
 * to:   https://api.bitbucket.org/2.0/repositories/orgname/reponame/src/master/file.yaml
 *
 * @param url - A URL pointing to a file
 * @param config - The relevant provider config
 * @public
 * @deprecated no longer in use, bitbucket integration replaced by integrations bitbucketCloud and bitbucketServer.
 */
declare function getBitbucketFileFetchUrl(url: string, config: BitbucketIntegrationConfig): string;
/**
 * Gets the request options necessary to make requests to a given provider.
 *
 * @param config - The relevant provider config
 * @public
 * @deprecated no longer in use, bitbucket integration replaced by integrations bitbucketCloud and bitbucketServer.
 */
declare function getBitbucketRequestOptions(config: BitbucketIntegrationConfig): {
    headers: Record<string, string>;
};

/**
 * The configuration parameters for a single Bitbucket Cloud API provider.
 *
 * @public
 */
declare type BitbucketCloudIntegrationConfig = {
    /**
     * Constant. bitbucket.org
     */
    host: string;
    /**
     * Constant. https://api.bitbucket.org/2.0
     */
    apiBaseUrl: string;
    /**
     * The username to use for requests to Bitbucket Cloud (bitbucket.org).
     */
    username?: string;
    /**
     * Authentication with Bitbucket Cloud (bitbucket.org) is done using app passwords.
     *
     * See https://support.atlassian.com/bitbucket-cloud/docs/app-passwords/
     */
    appPassword?: string;
};
/**
 * Reads a single Bitbucket Cloud integration config.
 *
 * @param config - The config object of a single integration
 * @public
 */
declare function readBitbucketCloudIntegrationConfig(config: Config): BitbucketCloudIntegrationConfig;
/**
 * Reads a set of Bitbucket Cloud integration configs,
 * and inserts one for public Bitbucket Cloud if none specified.
 *
 * @param configs - All of the integration config objects
 * @public
 */
declare function readBitbucketCloudIntegrationConfigs(configs: Config[]): BitbucketCloudIntegrationConfig[];

/**
 * A Bitbucket Cloud based integration.
 *
 * @public
 */
declare class BitbucketCloudIntegration implements ScmIntegration {
    private readonly integrationConfig;
    static factory: ScmIntegrationsFactory<BitbucketCloudIntegration>;
    constructor(integrationConfig: BitbucketCloudIntegrationConfig);
    get type(): string;
    get title(): string;
    get config(): BitbucketCloudIntegrationConfig;
    resolveUrl(options: {
        url: string;
        base: string;
        lineNumber?: number;
    }): string;
    resolveEditUrl(url: string): string;
}

/**
 * Given a URL pointing to a path on a provider, returns the default branch.
 *
 * @param url - A URL pointing to a path
 * @param config - The relevant provider config
 * @public
 */
declare function getBitbucketCloudDefaultBranch(url: string, config: BitbucketCloudIntegrationConfig): Promise<string>;
/**
 * Given a URL pointing to a path on a provider, returns a URL that is suitable
 * for downloading the subtree.
 *
 * @param url - A URL pointing to a path
 * @param config - The relevant provider config
 * @public
 */
declare function getBitbucketCloudDownloadUrl(url: string, config: BitbucketCloudIntegrationConfig): Promise<string>;
/**
 * Given a URL pointing to a file on a provider, returns a URL that is suitable
 * for fetching the contents of the data.
 *
 * @remarks
 *
 * Converts
 * from: https://bitbucket.org/orgname/reponame/src/master/file.yaml
 * to:   https://api.bitbucket.org/2.0/repositories/orgname/reponame/src/master/file.yaml
 *
 * @param url - A URL pointing to a file
 * @param config - The relevant provider config
 * @public
 */
declare function getBitbucketCloudFileFetchUrl(url: string, config: BitbucketCloudIntegrationConfig): string;
/**
 * Gets the request options necessary to make requests to a given provider.
 *
 * @param config - The relevant provider config
 * @public
 */
declare function getBitbucketCloudRequestOptions(config: BitbucketCloudIntegrationConfig): {
    headers: Record<string, string>;
};

/**
 * The configuration parameters for a single Bitbucket Server API provider.
 *
 * @public
 */
declare type BitbucketServerIntegrationConfig = {
    /**
     * The host of the target that this matches on, e.g. "bitbucket.company.com"
     */
    host: string;
    /**
     * The base URL of the API of this provider, e.g. "https://<host>/rest/api/1.0",
     * with no trailing slash.
     *
     * The API will always be preferred if both its base URL and a token are
     * present.
     */
    apiBaseUrl: string;
    /**
     * The authorization token to use for requests to a Bitbucket Server provider.
     *
     * See https://confluence.atlassian.com/bitbucketserver/personal-access-tokens-939515499.html
     *
     * If no token is specified, anonymous access is used.
     */
    token?: string;
};
/**
 * Reads a single Bitbucket Server integration config.
 *
 * @param config - The config object of a single integration
 * @public
 */
declare function readBitbucketServerIntegrationConfig(config: Config): BitbucketServerIntegrationConfig;
/**
 * Reads a set of Bitbucket Server integration configs.
 *
 * @param configs - All of the integration config objects
 * @public
 */
declare function readBitbucketServerIntegrationConfigs(configs: Config[]): BitbucketServerIntegrationConfig[];

/**
 * A Bitbucket Server based integration.
 *
 * @public
 */
declare class BitbucketServerIntegration implements ScmIntegration {
    private readonly integrationConfig;
    static factory: ScmIntegrationsFactory<BitbucketServerIntegration>;
    constructor(integrationConfig: BitbucketServerIntegrationConfig);
    get type(): string;
    get title(): string;
    get config(): BitbucketServerIntegrationConfig;
    resolveUrl(options: {
        url: string;
        base: string;
        lineNumber?: number;
    }): string;
    resolveEditUrl(url: string): string;
}

/**
 * Given a URL pointing to a path on a provider, returns the default branch.
 *
 * @param url - A URL pointing to a path
 * @param config - The relevant provider config
 * @public
 */
declare function getBitbucketServerDefaultBranch(url: string, config: BitbucketServerIntegrationConfig): Promise<string>;
/**
 * Given a URL pointing to a path on a provider, returns a URL that is suitable
 * for downloading the subtree.
 *
 * @param url - A URL pointing to a path
 * @param config - The relevant provider config
 * @public
 */
declare function getBitbucketServerDownloadUrl(url: string, config: BitbucketServerIntegrationConfig): Promise<string>;
/**
 * Given a URL pointing to a file on a provider, returns a URL that is suitable
 * for fetching the contents of the data.
 *
 * @remarks
 *
 * Converts
 * from: https://bitbucket.company.com/projectname/reponame/src/main/file.yaml
 * to:   https://bitbucket.company.com/rest/api/1.0/project/projectname/reponame/raw/file.yaml?at=main
 *
 * @param url - A URL pointing to a file
 * @param config - The relevant provider config
 * @public
 */
declare function getBitbucketServerFileFetchUrl(url: string, config: BitbucketServerIntegrationConfig): string;
/**
 * Gets the request options necessary to make requests to a given provider.
 *
 * @param config - The relevant provider config
 * @public
 */
declare function getBitbucketServerRequestOptions(config: BitbucketServerIntegrationConfig): {
    headers: Record<string, string>;
};

/**
 * The configuration parameters for a single Gerrit API provider.
 *
 * @public
 */
declare type GerritIntegrationConfig = {
    /**
     * The host of the target that this matches on, e.g. "gerrit-review.com"
     */
    host: string;
    /**
     * The optional base URL of the Gerrit instance. It is assumed that https
     * is used and that the base path is "/" on the host. If that is not the
     * case set the complete base url to the gerrit instance, e.g.
     * "https://gerrit-review.com/gerrit". This is the url that you would open
     * in a browser.
     */
    baseUrl?: string;
    /**
     * The optional base url to use for cloning a repository. If not set the
     * baseUrl will be used.
     */
    cloneUrl?: string;
    /**
     * Optional base url for Gitiles. This is needed for creating a valid
     * user-friendly url that can be used for browsing the content of the
     * provider. If not set a default value will be created in the same way
     * as the "baseUrl" option.
     */
    gitilesBaseUrl?: string;
    /**
     * The username to use for requests to gerrit.
     */
    username?: string;
    /**
     * The password or http token to use for authentication.
     */
    password?: string;
};
/**
 * Reads a single Gerrit integration config.
 *
 * @param config - The config object of a single integration
 *
 * @public
 */
declare function readGerritIntegrationConfig(config: Config): GerritIntegrationConfig;
/**
 * Reads a set of Gerrit integration configs.
 *
 * @param configs - All of the integration config objects
 *
 * @public
 */
declare function readGerritIntegrationConfigs(configs: Config[]): GerritIntegrationConfig[];

/**
 * A Gerrit based integration.
 *
 * @public
 */
declare class GerritIntegration implements ScmIntegration {
    private readonly integrationConfig;
    static factory: ScmIntegrationsFactory<GerritIntegration>;
    constructor(integrationConfig: GerritIntegrationConfig);
    get type(): string;
    get title(): string;
    get config(): GerritIntegrationConfig;
    resolveUrl(options: {
        url: string;
        base: string;
        lineNumber?: number;
    }): string;
    resolveEditUrl(url: string): string;
}

/**
 * Parse a Gitiles URL and return branch, file path and project.
 *
 * @remarks
 *
 * Gerrit only handles code reviews so it does not have a native way to browse
 * or showing the content of gits. Image if Github only had the "pull requests"
 * tab.
 *
 * Any source code browsing is instead handled by optional services outside
 * Gerrit. The url format chosen for the Gerrit url reader is the one used by
 * the Gitiles project. Gerrit will work perfectly with Backstage without
 * having Gitiles installed but there are some places in the Backstage GUI
 * with links to the url used by the url reader. These will not work unless
 * the urls point to an actual Gitiles installation.
 *
 * Gitiles url:
 * https://g.com/optional_path/\{project\}/+/refs/heads/\{branch\}/\{filePath\}
 *
 *
 * @param url - An URL pointing to a file stored in git.
 * @public
 */
declare function parseGerritGitilesUrl(config: GerritIntegrationConfig, url: string): {
    branch: string;
    filePath: string;
    project: string;
};
/**
 * Return the url to get branch info from the Gerrit API.
 *
 * @param config - A Gerrit provider config.
 * @param url - An url pointing to a file in git.
 * @public
 */
declare function getGerritBranchApiUrl(config: GerritIntegrationConfig, url: string): string;
/**
 * Return the url to clone the repo that is referenced by the url.
 *
 * @param url - An url pointing to a file in git.
 * @public
 */
declare function getGerritCloneRepoUrl(config: GerritIntegrationConfig, url: string): string;
/**
 * Return the url to fetch the contents of a file using the Gerrit API.
 *
 * @param config - A Gerrit provider config.
 * @param url - An url pointing to a file in git.
 * @public
 */
declare function getGerritFileContentsApiUrl(config: GerritIntegrationConfig, url: string): string;
/**
 * Return the url to query available projects using the Gerrit API.
 *
 * @param config - A Gerrit provider config.
 * @public
 */
declare function getGerritProjectsApiUrl(config: GerritIntegrationConfig): string;
/**
 * Return request headers for a Gerrit provider.
 *
 * @param config - A Gerrit provider config
 * @public
 */
declare function getGerritRequestOptions(config: GerritIntegrationConfig): {
    headers?: Record<string, string>;
};
/**
 * Parse the json response from Gerrit and strip the magic prefix.
 *
 * @remarks
 *
 * To prevent against XSSI attacks the JSON response body from Gerrit starts
 * with a magic prefix that must be stripped before it can be fed to a JSON
 * parser.
 *
 * @param response - An API response.
 * @public
 */
declare function parseGerritJsonResponse(response: Response): Promise<unknown>;

/**
 * The configuration parameters for a single GitHub integration.
 *
 * @public
 */
declare type GitHubIntegrationConfig = {
    /**
     * The host of the target that this matches on, e.g. "github.com"
     */
    host: string;
    /**
     * The base URL of the API of this provider, e.g. "https://api.github.com",
     * with no trailing slash.
     *
     * May be omitted specifically for GitHub; then it will be deduced.
     *
     * The API will always be preferred if both its base URL and a token are
     * present.
     */
    apiBaseUrl?: string;
    /**
     * The base URL of the raw fetch endpoint of this provider, e.g.
     * "https://raw.githubusercontent.com", with no trailing slash.
     *
     * May be omitted specifically for GitHub; then it will be deduced.
     *
     * The API will always be preferred if both its base URL and a token are
     * present.
     */
    rawBaseUrl?: string;
    /**
     * The authorization token to use for requests to this provider.
     *
     * If no token is specified, anonymous access is used.
     */
    token?: string;
    /**
     * The GitHub Apps configuration to use for requests to this provider.
     *
     * If no apps are specified, token or anonymous is used.
     */
    apps?: GithubAppConfig[];
};
/**
 * The configuration parameters for authenticating a GitHub Application.
 *
 * @remarks
 *
 * A GitHub Apps configuration can be generated using the `backstage-cli create-github-app` command.
 *
 * @public
 */
declare type GithubAppConfig = {
    /**
     * Unique app identifier, found at https://github.com/organizations/$org/settings/apps/$AppName
     */
    appId: number;
    /**
     * The private key is used by the GitHub App integration to authenticate the app.
     * A private key can be generated from the app at https://github.com/organizations/$org/settings/apps/$AppName
     */
    privateKey: string;
    /**
     * Webhook secret can be configured at https://github.com/organizations/$org/settings/apps/$AppName
     */
    webhookSecret: string;
    /**
     * Found at https://github.com/organizations/$org/settings/apps/$AppName
     */
    clientId: string;
    /**
     * Client secrets can be generated at https://github.com/organizations/$org/settings/apps/$AppName
     */
    clientSecret: string;
    /**
     * List of installation owners allowed to be used by this GitHub app. The GitHub UI does not provide a way to list the installations.
     * However you can list the installations with the GitHub API. You can find the list of installations here:
     * https://api.github.com/app/installations
     * The relevant documentation for this is here.
     * https://docs.github.com/en/rest/reference/apps#list-installations-for-the-authenticated-app--code-samples
     */
    allowedInstallationOwners?: string[];
};
/**
 * Reads a single GitHub integration config.
 *
 * @param config - The config object of a single integration
 * @public
 */
declare function readGitHubIntegrationConfig(config: Config): GitHubIntegrationConfig;
/**
 * Reads a set of GitHub integration configs, and inserts some defaults for
 * public GitHub if not specified.
 *
 * @param configs - All of the integration config objects
 * @public
 */
declare function readGitHubIntegrationConfigs(configs: Config[]): GitHubIntegrationConfig[];

/**
 * The type of credentials produced by the credential provider.
 *
 * @public
 */
declare type GithubCredentialType = 'app' | 'token';
/**
 * A set of credentials information for a GitHub integration.
 *
 * @public
 */
declare type GithubCredentials = {
    headers?: {
        [name: string]: string;
    };
    token?: string;
    type: GithubCredentialType;
};
/**
 * This allows implementations to be provided to retrieve GitHub credentials.
 *
 * @public
 *
 */
interface GithubCredentialsProvider {
    getCredentials(opts: {
        url: string;
    }): Promise<GithubCredentials>;
}

/**
 * Given a URL pointing to a file on a provider, returns a URL that is suitable
 * for fetching the contents of the data.
 *
 * @remarks
 *
 * Converts
 * from: https://github.com/a/b/blob/branchname/path/to/c.yaml
 * to:   https://api.github.com/repos/a/b/contents/path/to/c.yaml?ref=branchname
 * or:   https://raw.githubusercontent.com/a/b/branchname/c.yaml
 *
 * @param url - A URL pointing to a file
 * @param config - The relevant provider config
 * @public
 */
declare function getGitHubFileFetchUrl(url: string, config: GitHubIntegrationConfig, credentials: GithubCredentials): string;
/**
 * Gets the request options necessary to make requests to a given provider.
 *
 * @deprecated This function is no longer used internally
 * @param config - The relevant provider config
 * @public
 */
declare function getGitHubRequestOptions(config: GitHubIntegrationConfig, credentials: GithubCredentials): {
    headers: Record<string, string>;
};

/**
 * A GitHub based integration.
 *
 * @public
 */
declare class GitHubIntegration implements ScmIntegration {
    private readonly integrationConfig;
    static factory: ScmIntegrationsFactory<GitHubIntegration>;
    constructor(integrationConfig: GitHubIntegrationConfig);
    get type(): string;
    get title(): string;
    get config(): GitHubIntegrationConfig;
    resolveUrl(options: {
        url: string;
        base: string;
        lineNumber?: number;
    }): string;
    resolveEditUrl(url: string): string;
}
/**
 * Takes a GitHub URL and replaces the type part (blob, tree etc).
 *
 * @param url - The original URL
 * @param type - The desired type, e.g. "blob"
 * @public
 */
declare function replaceGitHubUrlType(url: string, type: 'blob' | 'tree' | 'edit'): string;

/**
 * The configuration parameters for a single GitLab integration.
 *
 * @public
 */
declare type GitLabIntegrationConfig = {
    /**
     * The host of the target that this matches on, e.g. `gitlab.com`.
     */
    host: string;
    /**
     * The base URL of the API of this provider, e.g.
     * `https://gitlab.com/api/v4`, with no trailing slash.
     *
     * May be omitted specifically for public GitLab; then it will be deduced.
     */
    apiBaseUrl: string;
    /**
     * The authorization token to use for requests to this provider.
     *
     * If no token is specified, anonymous access is used.
     */
    token?: string;
    /**
     * The baseUrl of this provider, e.g. `https://gitlab.com`, which is passed
     * into the GitLab client.
     *
     * If no baseUrl is provided, it will default to `https://${host}`
     */
    baseUrl: string;
};
/**
 * Reads a single GitLab integration config.
 *
 * @param config - The config object of a single integration
 * @public
 */
declare function readGitLabIntegrationConfig(config: Config): GitLabIntegrationConfig;
/**
 * Reads a set of GitLab integration configs, and inserts some defaults for
 * public GitLab if not specified.
 *
 * @param configs - All of the integration config objects
 * @public
 */
declare function readGitLabIntegrationConfigs(configs: Config[]): GitLabIntegrationConfig[];

/**
 * A GitLab based integration.
 *
 * @public
 */
declare class GitLabIntegration implements ScmIntegration {
    private readonly integrationConfig;
    static factory: ScmIntegrationsFactory<GitLabIntegration>;
    constructor(integrationConfig: GitLabIntegrationConfig);
    get type(): string;
    get title(): string;
    get config(): GitLabIntegrationConfig;
    resolveUrl(options: {
        url: string;
        base: string;
        lineNumber?: number;
    }): string;
    resolveEditUrl(url: string): string;
}
/**
 * Takes a GitLab URL and replaces the type part (blob, tree etc).
 *
 * @param url - The original URL
 * @param type - The desired type, e.g. 'blob', 'tree', 'edit'
 * @public
 */
declare function replaceGitLabUrlType(url: string, type: 'blob' | 'tree' | 'edit'): string;

/**
 * Holds all registered SCM integrations, of all types.
 *
 * @public
 */
interface ScmIntegrationRegistry extends ScmIntegrationsGroup<ScmIntegration> {
    awsS3: ScmIntegrationsGroup<AwsS3Integration>;
    azure: ScmIntegrationsGroup<AzureIntegration>;
    /**
     * @deprecated in favor of `bitbucketCloud` and `bitbucketServer`
     */
    bitbucket: ScmIntegrationsGroup<BitbucketIntegration>;
    bitbucketCloud: ScmIntegrationsGroup<BitbucketCloudIntegration>;
    bitbucketServer: ScmIntegrationsGroup<BitbucketServerIntegration>;
    gerrit: ScmIntegrationsGroup<GerritIntegration>;
    github: ScmIntegrationsGroup<GitHubIntegration>;
    gitlab: ScmIntegrationsGroup<GitLabIntegration>;
    /**
     * Resolves an absolute or relative URL in relation to a base URL.
     *
     * This method is adapted for use within SCM systems, so relative URLs are
     * within the context of the root of the hierarchy pointed to by the base
     * URL.
     *
     * For example, if the base URL is  `<repo root url>/folder/a.yaml`, i.e.
     * within the file tree of a certain repo, an absolute path of `/b.yaml` does
     * not resolve to `https://hostname/b.yaml` but rather to
     * `<repo root url>/b.yaml` inside the file tree of that same repo.
     */
    resolveUrl(options: {
        /**
         * The (absolute or relative) URL or path to resolve.
         */
        url: string;
        /**
         * The base URL onto which this resolution happens
         */
        base: string;
        /**
         * The line number in the target file to link to, starting with 1. Only applicable when linking to files.
         */
        lineNumber?: number;
    }): string;
    /**
     * Resolves the edit URL for a file within the SCM system.
     *
     * Most SCM systems have a web interface that allows viewing and editing files
     * in the repository. The returned URL directly jumps into the edit mode for
     * the file.
     * If this is not possible, the integration can fall back to a URL to view
     * the file in the web interface.
     *
     * @param url - The absolute URL to the file that should be edited.
     */
    resolveEditUrl(url: string): string;
}

/**
 * Handles the creation and caching of credentials for GitHub integrations.
 *
 * @public
 * @remarks
 *
 * TODO: Possibly move this to a backend only package so that it's not used in the frontend by mistake
 */
declare class DefaultGithubCredentialsProvider implements GithubCredentialsProvider {
    private readonly providers;
    static fromIntegrations(integrations: ScmIntegrationRegistry): DefaultGithubCredentialsProvider;
    private constructor();
    /**
     * Returns {@link GithubCredentials} for a given URL.
     *
     * @remarks
     *
     * Consecutive calls to this method with the same URL will return cached
     * credentials.
     *
     * The shortest lifetime for a token returned is 10 minutes.
     *
     * @example
     * ```ts
     * const { token, headers } = await getCredentials({
     *   url: 'https://github.com/backstage/foobar'
     * })
     *
     * const { token, headers } = await getCredentials({
     *   url: 'https://github.com/backstage'
     * })
     * ```
     *
     * @param opts - The organization or repository URL
     * @returns A promise of {@link GithubCredentials}.
     */
    getCredentials(opts: {
        url: string;
    }): Promise<GithubCredentials>;
}

/**
 * Corresponds to a Github installation which internally could hold several GitHub Apps.
 *
 * @public
 */
declare class GithubAppCredentialsMux {
    private readonly apps;
    constructor(config: GitHubIntegrationConfig);
    getAllInstallations(): Promise<RestEndpointMethodTypes['apps']['listInstallations']['response']['data']>;
    getAppToken(owner: string, repo?: string): Promise<string | undefined>;
}
/**
 * Handles the creation and caching of credentials for GitHub integrations.
 *
 * @public
 * @remarks
 *
 * TODO: Possibly move this to a backend only package so that it's not used in the frontend by mistake
 */
declare class SingleInstanceGithubCredentialsProvider implements GithubCredentialsProvider {
    private readonly githubAppCredentialsMux;
    private readonly token?;
    static create: (config: GitHubIntegrationConfig) => GithubCredentialsProvider;
    private constructor();
    /**
     * Returns {@link GithubCredentials} for a given URL.
     *
     * @remarks
     *
     * Consecutive calls to this method with the same URL will return cached
     * credentials.
     *
     * The shortest lifetime for a token returned is 10 minutes.
     *
     * @example
     * ```ts
     * const { token, headers } = await getCredentials({
     *   url: 'github.com/backstage/foobar'
     * })
     * ```
     *
     * @param opts - The organization or repository URL
     * @returns A promise of {@link GithubCredentials}.
     */
    getCredentials(opts: {
        url: string;
    }): Promise<GithubCredentials>;
}

/**
 * Given a URL pointing to a file on a provider, returns a URL that is suitable
 * for fetching the contents of the data.
 *
 * @remarks
 *
 * Converts
 * from: https://gitlab.example.com/a/b/blob/master/c.yaml
 * to:   https://gitlab.example.com/a/b/raw/master/c.yaml
 * -or-
 * from: https://gitlab.com/groupA/teams/teamA/subgroupA/repoA/-/blob/branch/filepath
 * to:   https://gitlab.com/api/v4/projects/projectId/repository/files/filepath?ref=branch
 *
 * @param url - A URL pointing to a file
 * @param config - The relevant provider config
 * @public
 */
declare function getGitLabFileFetchUrl(url: string, config: GitLabIntegrationConfig): Promise<string>;
/**
 * Gets the request options necessary to make requests to a given provider.
 *
 * @param config - The relevant provider config
 * @public
 */
declare function getGitLabRequestOptions(config: GitLabIntegrationConfig): {
    headers: Record<string, string>;
};

/**
 * The configuration parameters for a single Google Cloud Storage provider.
 *
 * @public
 */
declare type GoogleGcsIntegrationConfig = {
    /**
     * Service account email used to authenticate requests.
     */
    clientEmail?: string;
    /**
     * Service account private key used to authenticate requests.
     */
    privateKey?: string;
};
/**
 * Reads a single Google GCS integration config.
 *
 * @param config - The config object of a single integration
 * @public
 */
declare function readGoogleGcsIntegrationConfig(config: Config): GoogleGcsIntegrationConfig;

/**
 * Default implementation of {@link ScmIntegration} `resolveUrl`, that only
 * works with URL pathname based providers.
 *
 * @public
 */
declare function defaultScmResolveUrl(options: {
    url: string;
    base: string;
    lineNumber?: number;
}): string;

/**
 * The set of supported integrations.
 *
 * @public
 */
interface IntegrationsByType {
    awsS3: ScmIntegrationsGroup<AwsS3Integration>;
    azure: ScmIntegrationsGroup<AzureIntegration>;
    /**
     * @deprecated in favor of `bitbucketCloud` and `bitbucketServer`
     */
    bitbucket: ScmIntegrationsGroup<BitbucketIntegration>;
    bitbucketCloud: ScmIntegrationsGroup<BitbucketCloudIntegration>;
    bitbucketServer: ScmIntegrationsGroup<BitbucketServerIntegration>;
    gerrit: ScmIntegrationsGroup<GerritIntegration>;
    github: ScmIntegrationsGroup<GitHubIntegration>;
    gitlab: ScmIntegrationsGroup<GitLabIntegration>;
}
/**
 * Exposes the set of supported integrations.
 *
 * @public
 */
declare class ScmIntegrations implements ScmIntegrationRegistry {
    private readonly byType;
    static fromConfig(config: Config): ScmIntegrations;
    constructor(integrationsByType: IntegrationsByType);
    get awsS3(): ScmIntegrationsGroup<AwsS3Integration>;
    get azure(): ScmIntegrationsGroup<AzureIntegration>;
    /**
     * @deprecated in favor of `bitbucketCloud()` and `bitbucketServer()`
     */
    get bitbucket(): ScmIntegrationsGroup<BitbucketIntegration>;
    get bitbucketCloud(): ScmIntegrationsGroup<BitbucketCloudIntegration>;
    get bitbucketServer(): ScmIntegrationsGroup<BitbucketServerIntegration>;
    get gerrit(): ScmIntegrationsGroup<GerritIntegration>;
    get github(): ScmIntegrationsGroup<GitHubIntegration>;
    get gitlab(): ScmIntegrationsGroup<GitLabIntegration>;
    list(): ScmIntegration[];
    byUrl(url: string | URL): ScmIntegration | undefined;
    byHost(host: string): ScmIntegration | undefined;
    resolveUrl(options: {
        url: string;
        base: string;
        lineNumber?: number;
    }): string;
    resolveEditUrl(url: string): string;
}

export { AwsS3Integration, AwsS3IntegrationConfig, AzureIntegration, AzureIntegrationConfig, BitbucketCloudIntegration, BitbucketCloudIntegrationConfig, BitbucketIntegration, BitbucketIntegrationConfig, BitbucketServerIntegration, BitbucketServerIntegrationConfig, DefaultGithubCredentialsProvider, GerritIntegration, GerritIntegrationConfig, GitHubIntegration, GitHubIntegrationConfig, GitLabIntegration, GitLabIntegrationConfig, GithubAppConfig, GithubAppCredentialsMux, GithubCredentialType, GithubCredentials, GithubCredentialsProvider, GoogleGcsIntegrationConfig, IntegrationsByType, ScmIntegration, ScmIntegrationRegistry, ScmIntegrations, ScmIntegrationsFactory, ScmIntegrationsGroup, SingleInstanceGithubCredentialsProvider, defaultScmResolveUrl, getAzureCommitsUrl, getAzureDownloadUrl, getAzureFileFetchUrl, getAzureRequestOptions, getBitbucketCloudDefaultBranch, getBitbucketCloudDownloadUrl, getBitbucketCloudFileFetchUrl, getBitbucketCloudRequestOptions, getBitbucketDefaultBranch, getBitbucketDownloadUrl, getBitbucketFileFetchUrl, getBitbucketRequestOptions, getBitbucketServerDefaultBranch, getBitbucketServerDownloadUrl, getBitbucketServerFileFetchUrl, getBitbucketServerRequestOptions, getGerritBranchApiUrl, getGerritCloneRepoUrl, getGerritFileContentsApiUrl, getGerritProjectsApiUrl, getGerritRequestOptions, getGitHubFileFetchUrl, getGitHubRequestOptions, getGitLabFileFetchUrl, getGitLabRequestOptions, parseGerritGitilesUrl, parseGerritJsonResponse, readAwsS3IntegrationConfig, readAwsS3IntegrationConfigs, readAzureIntegrationConfig, readAzureIntegrationConfigs, readBitbucketCloudIntegrationConfig, readBitbucketCloudIntegrationConfigs, readBitbucketIntegrationConfig, readBitbucketIntegrationConfigs, readBitbucketServerIntegrationConfig, readBitbucketServerIntegrationConfigs, readGerritIntegrationConfig, readGerritIntegrationConfigs, readGitHubIntegrationConfig, readGitHubIntegrationConfigs, readGitLabIntegrationConfig, readGitLabIntegrationConfigs, readGoogleGcsIntegrationConfig, replaceGitHubUrlType, replaceGitLabUrlType };
