import express from 'express';
import { Logger } from 'winston';
import { PluginEndpointDiscovery } from '@backstage/backend-common';
import { IdentityClient } from '@backstage/plugin-auth-node';
import { PermissionPolicy } from '@backstage/plugin-permission-node';
import { Config } from '@backstage/config';

/**
 * Options required when constructing a new {@link express#Router} using
 * {@link createRouter}.
 *
 * @public
 */
interface RouterOptions {
    logger: Logger;
    discovery: PluginEndpointDiscovery;
    policy: PermissionPolicy;
    identity: IdentityClient;
    config: Config;
}
/**
 * Creates a new {@link express#Router} which provides the backend API
 * for the permission system.
 *
 * @public
 */
declare function createRouter(options: RouterOptions): Promise<express.Router>;

export { RouterOptions, createRouter };
