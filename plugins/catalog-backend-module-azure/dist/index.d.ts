import { Config } from '@backstage/config';
import { ScmIntegrationRegistry } from '@backstage/integration';
import { CatalogProcessor, LocationSpec, CatalogProcessorEmit, EntityProvider, EntityProviderConnection } from '@backstage/plugin-catalog-backend';
import { Logger } from 'winston';
import { TaskRunner } from '@backstage/backend-tasks';

/**
 * Extracts repositories out of an Azure DevOps org.
 *
 * The following will create locations for all projects which have a catalog-info.yaml
 * on the default branch. The first is shorthand for the second.
 *
 *    target: "https://dev.azure.com/org/project"
 *    or
 *    target: https://dev.azure.com/org/project?path=/catalog-info.yaml
 *
 * You may also explicitly specify a single repo:
 *
 *    target: https://dev.azure.com/org/project/_git/repo
 *
 * @public
 **/
declare class AzureDevOpsDiscoveryProcessor implements CatalogProcessor {
    private readonly integrations;
    private readonly logger;
    static fromConfig(config: Config, options: {
        logger: Logger;
    }): AzureDevOpsDiscoveryProcessor;
    constructor(options: {
        integrations: ScmIntegrationRegistry;
        logger: Logger;
    });
    getProcessorName(): string;
    readLocation(location: LocationSpec, _optional: boolean, emit: CatalogProcessorEmit): Promise<boolean>;
}

/**
 * Provider which discovers catalog files within an Azure DevOps repositories.
 *
 * Use `AzureDevOpsEntityProvider.fromConfig(...)` to create instances.
 *
 * @public
 */
declare class AzureDevOpsEntityProvider implements EntityProvider {
    private readonly config;
    private readonly integration;
    private readonly logger;
    private readonly scheduleFn;
    private connection?;
    static fromConfig(configRoot: Config, options: {
        logger: Logger;
        schedule: TaskRunner;
    }): AzureDevOpsEntityProvider[];
    private constructor();
    private createScheduleFn;
    /** {@inheritdoc @backstage/plugin-catalog-backend#EntityProvider.getProviderName} */
    getProviderName(): string;
    /** {@inheritdoc @backstage/plugin-catalog-backend#EntityProvider.connect} */
    connect(connection: EntityProviderConnection): Promise<void>;
    refresh(logger: Logger): Promise<void>;
    private createLocationSpec;
    private createObjectUrl;
}

export { AzureDevOpsDiscoveryProcessor, AzureDevOpsEntityProvider };
