import { PluginDatabaseManager } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import express from 'express';
import { Logger } from 'winston';
export interface RouterOptions {
    config: Config;
    logger: Logger;
    /**
     * If a database is provided it will be used to cache previously deployed static assets.
     *
     * This is a built-in alternative to using a `staticFallbackHandler`.
     */
    database?: PluginDatabaseManager;
    /**
     * The name of the app package that content should be served from. The same app package should be
     * added as a dependency to the backend package in order for it to be accessible at runtime.
     *
     * In a typical setup with a single app package this would be set to 'app'.
     */
    appPackageName: string;
    /**
     * A request handler to handle requests for static content that are not present in the app bundle.
     *
     * This can be used to avoid issues with clients on older deployment versions trying to access lazy
     * loaded content that is no longer present. Typically the requests would fall back to a long-term
     * object store where all recently deployed versions of the app are present.
     *
     * Another option is to provide a `database` that will take care of storing the static assets instead.
     *
     * If both `database` and `staticFallbackHandler` are provided, the `database` will attempt to serve
     * static assets first, and if they are not found, the `staticFallbackHandler` will be called.
     */
    staticFallbackHandler?: express.Handler;
    /**
     * Disables the configuration injection. This can be useful if you're running in an environment
     * with a read-only filesystem, or for some other reason don't want configuration to be injected.
     *
     * Note that this will cause the configuration used when building the app bundle to be used, unless
     * a separate configuration loading strategy is set up.
     *
     * This also disables configuration injection though `APP_CONFIG_` environment variables.
     */
    disableConfigInjection?: boolean;
}
export declare function createRouter(options: RouterOptions): Promise<express.Router>;
