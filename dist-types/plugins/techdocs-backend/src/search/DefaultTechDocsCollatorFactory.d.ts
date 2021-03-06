/// <reference types="node" />
import { PluginEndpointDiscovery, TokenManager } from '@backstage/backend-common';
import { CatalogApi } from '@backstage/catalog-client';
import { Config } from '@backstage/config';
import { Permission } from '@backstage/plugin-permission-common';
import { DocumentCollatorFactory } from '@backstage/plugin-search-common';
import { Readable } from 'stream';
import { Logger } from 'winston';
/**
 * Options to configure the TechDocs collator factory
 *
 * @public
 */
export declare type TechDocsCollatorFactoryOptions = {
    discovery: PluginEndpointDiscovery;
    logger: Logger;
    tokenManager: TokenManager;
    locationTemplate?: string;
    catalogClient?: CatalogApi;
    parallelismLimit?: number;
    legacyPathCasing?: boolean;
};
/**
 * A search collator factory responsible for gathering and transforming
 * TechDocs documents.
 *
 * @public
 */
export declare class DefaultTechDocsCollatorFactory implements DocumentCollatorFactory {
    readonly type: string;
    readonly visibilityPermission: Permission;
    private discovery;
    private locationTemplate;
    private readonly logger;
    private readonly catalogClient;
    private readonly tokenManager;
    private readonly parallelismLimit;
    private readonly legacyPathCasing;
    private constructor();
    static fromConfig(config: Config, options: TechDocsCollatorFactoryOptions): DefaultTechDocsCollatorFactory;
    getCollator(): Promise<Readable>;
    private execute;
    private applyArgsToFormat;
    private static constructDocsIndexUrl;
    private static handleEntityInfoCasing;
}
