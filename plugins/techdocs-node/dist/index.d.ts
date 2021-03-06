/// <reference types="node" />
import { UrlReader, ContainerRunner, PluginEndpointDiscovery } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import { Logger } from 'winston';
import { ScmIntegrationRegistry } from '@backstage/integration';
import { Entity, CompoundEntityRef } from '@backstage/catalog-model';
import { Writable } from 'stream';
import express from 'express';
import { IndexableDocument } from '@backstage/plugin-search-common';

/**
 * A unique identifier of the tree blob, usually the commit SHA or etag from the target.
 * @public
 */
declare type ETag = string;
/**
 * Options for building preparers
 * @public
 */
declare type PreparerConfig = {
    logger: Logger;
    reader: UrlReader;
};
/**
 * Options for configuring the content preparation process.
 * @public
 */
declare type PreparerOptions = {
    /**
     * An instance of the logger
     */
    logger?: Logger;
    /**
     * see {@link ETag}
     */
    etag?: ETag;
};
/**
 * Result of the preparation step.
 * @public
 */
declare type PreparerResponse = {
    /**
     * The path to directory where the tree is downloaded.
     */
    preparedDir: string;
    /**
     * see {@link ETag}
     */
    etag: ETag;
};
/**
 * Definition of a TechDocs preparer
 * @public
 */
declare type PreparerBase = {
    /**
     * Given an Entity definition from the Software Catalog, go and prepare a directory
     * with contents from the location in temporary storage and return the path.
     *
     * @param entity - The entity from the Software Catalog
     * @param options - If etag is provided, it will be used to check if the target has
     *        updated since the last build.
     * @throws `NotModifiedError` when the prepared directory has not been changed since the last build.
     */
    prepare(entity: Entity, options?: PreparerOptions): Promise<PreparerResponse>;
};
/**
 * Definition for a TechDocs preparer builder
 * @public
 */
declare type PreparerBuilder = {
    register(protocol: RemoteProtocol, preparer: PreparerBase): void;
    get(entity: Entity): PreparerBase;
};
/**
 * Location where documentation files are stored
 * @public
 */
declare type RemoteProtocol = 'url' | 'dir';

/**
 * Parsed location annotation
 * @public
 */
declare type ParsedLocationAnnotation = {
    type: RemoteProtocol;
    target: string;
};
/**
 * Returns a parset locations annotation
 * @public
 * @param annotationName - The name of the annotation in the entity metadata
 * @param entity - A TechDocs entity instance
 */
declare const parseReferenceAnnotation: (annotationName: string, entity: Entity) => ParsedLocationAnnotation;
/**
 * TechDocs references of type `dir` are relative the source location of the entity.
 * This function transforms relative references to absolute ones, based on the
 * location the entity was ingested from. If the entity was registered by a `url`
 * location, it returns a `url` location with a resolved target that points to the
 * targeted subfolder. If the entity was registered by a `file` location, it returns
 * an absolute `dir` location.
 * @public
 * @param entity - the entity with annotations
 * @param dirAnnotation - the parsed techdocs-ref annotation of type 'dir'
 * @param scmIntegrations - access to the scmIntegration to do url transformations
 * @throws if the entity doesn't specify a `dir` location or is ingested from an unsupported location.
 * @returns the transformed location with an absolute target.
 */
declare const transformDirLocation: (entity: Entity, dirAnnotation: ParsedLocationAnnotation, scmIntegrations: ScmIntegrationRegistry) => {
    type: 'dir' | 'url';
    target: string;
};
/**
 * Returns a entity reference based on the TechDocs annotation type
 * @public
 * @param entity - A TechDocs instance
 * @param scmIntegration - An implementation for  SCM integration API
 */
declare const getLocationForEntity: (entity: Entity, scmIntegration: ScmIntegrationRegistry) => ParsedLocationAnnotation;
/**
 * Returns a preparer response {@link PreparerResponse}
 * @public
 * @param reader - Read a tree of files from a repository
 * @param entity - A TechDocs entity instance
 * @param opts - Options for configuring the reader, e.g. logger, etag, etc.
 */
declare const getDocFilesFromRepository: (reader: UrlReader, entity: Entity, opts?: {
    etag?: string | undefined;
    logger?: Logger | undefined;
} | undefined) => Promise<PreparerResponse>;

/**
 * Options for building generators
 * @public
 */
declare type GeneratorOptions = {
    containerRunner: ContainerRunner;
    logger: Logger;
};
/**
 * The values that the generator will receive.
 *
 * @public
 * @param inputDir - The directory of the uncompiled documentation, with the values from the frontend
 * @param outputDir - Directory to store generated docs in. Usually - a newly created temporary directory.
 * @param parsedLocationAnnotation - backstage.io/techdocs-ref annotation of an entity
 * @param etag - A unique identifier for the prepared tree e.g. commit SHA. If provided it will be stored in techdocs_metadata.json.
 * @param logger - A logger that forwards the messages to the caller to be displayed outside of the backend.
 * @param logStream - A log stream that can send raw log messages to the caller to be displayed outside of the backend.
 */
declare type GeneratorRunOptions = {
    inputDir: string;
    outputDir: string;
    parsedLocationAnnotation?: ParsedLocationAnnotation;
    etag?: string;
    logger: Logger;
    logStream?: Writable;
};
/**
 * Generates documentation files
 * @public
 */
declare type GeneratorBase = {
    /**
     * Runs the generator with the values
     * @public
     */
    run(opts: GeneratorRunOptions): Promise<void>;
};
/**
 * List of supported generator options
 * @public
 */
declare type SupportedGeneratorKey = 'techdocs' | string;
/**
 * The generator builder holds the generator ready for run time
 * @public
 */
declare type GeneratorBuilder = {
    register(protocol: SupportedGeneratorKey, generator: GeneratorBase): void;
    get(entity: Entity): GeneratorBase;
};

/**
 * Generates documentation files
 * @public
 */
declare class TechdocsGenerator implements GeneratorBase {
    /**
     * The default docker image (and version) used to generate content. Public
     * and static so that techdocs-node consumers can use the same version.
     */
    static readonly defaultDockerImage = "spotify/techdocs:v1.0.3";
    private readonly logger;
    private readonly containerRunner;
    private readonly options;
    private readonly scmIntegrations;
    /**
     * Returns a instance of TechDocs generator
     * @param config - A Backstage configuration
     * @param options - Options to configure the generator
     */
    static fromConfig(config: Config, options: GeneratorOptions): TechdocsGenerator;
    constructor(options: {
        logger: Logger;
        containerRunner: ContainerRunner;
        config: Config;
        scmIntegrations: ScmIntegrationRegistry;
    });
    /** {@inheritDoc GeneratorBase.run} */
    run(options: GeneratorRunOptions): Promise<void>;
}

/**
 * Collection of docs generators
 * @public
 */
declare class Generators implements GeneratorBuilder {
    private generatorMap;
    /**
     * Returns a generators instance containing a generator for TechDocs
     * @param config - A Backstage configuration
     * @param options - Options to configure the TechDocs generator
     */
    static fromConfig(config: Config, options: {
        logger: Logger;
        containerRunner: ContainerRunner;
    }): Promise<GeneratorBuilder>;
    /**
     * Register a generator in the generators collection
     * @param generatorKey - Unique identifier for the generator
     * @param generator - The generator instance to register
     */
    register(generatorKey: SupportedGeneratorKey, generator: GeneratorBase): void;
    /**
     * Returns the generator for a given TechDocs entity
     * @param entity - A TechDocs entity instance
     */
    get(entity: Entity): GeneratorBase;
}

/**
 * Preparer used to retrieve documentation files from a local directory
 * @public
 */
declare class DirectoryPreparer implements PreparerBase {
    private readonly scmIntegrations;
    private readonly reader;
    /**
     * Returns a directory preparer instance
     * @param config - A backstage config
     * @param options - A directory preparer options containing a logger and reader
     */
    static fromConfig(config: Config, { logger, reader }: PreparerConfig): DirectoryPreparer;
    private constructor();
    /** {@inheritDoc PreparerBase.prepare} */
    prepare(entity: Entity, options?: PreparerOptions): Promise<PreparerResponse>;
}

/**
 * Preparer used to retrieve documentation files from a remote repository
 * @public
 */
declare class UrlPreparer implements PreparerBase {
    private readonly logger;
    private readonly reader;
    /**
     * Returns a directory preparer instance
     * @param config - A URL preparer config containing the a logger and reader
     */
    static fromConfig({ reader, logger }: PreparerConfig): UrlPreparer;
    private constructor();
    /** {@inheritDoc PreparerBase.prepare} */
    prepare(entity: Entity, options?: PreparerOptions): Promise<PreparerResponse>;
}

/**
 * Collection of docs preparers (dir and url)
 * @public
 */
declare class Preparers implements PreparerBuilder {
    private preparerMap;
    /**
     * Returns a generators instance containing a generator for TechDocs
     * @public
     * @param backstageConfig - A Backstage configuration
     * @param preparerConfig - Options to configure preparers
     */
    static fromConfig(backstageConfig: Config, { logger, reader }: PreparerConfig): Promise<PreparerBuilder>;
    /**
     * Register a preparer in the preparers collection
     * @param protocol - url or dir to associate with preparer
     * @param preparer - The preparer instance to set
     */
    register(protocol: RemoteProtocol, preparer: PreparerBase): void;
    /**
     * Returns the preparer for a given TechDocs entity
     * @param entity - A TechDocs entity instance
     * @returns
     */
    get(entity: Entity): PreparerBase;
}

/**
 * Options for building publishers
 * @public
 */
declare type PublisherFactory = {
    logger: Logger;
    discovery: PluginEndpointDiscovery;
};
/**
 * Key for all the different types of TechDocs publishers that are supported.
 * @public
 */
declare type PublisherType = 'local' | 'googleGcs' | 'awsS3' | 'azureBlobStorage' | 'openStackSwift';
/**
 * Request publish definition
 * @public
 */
declare type PublishRequest = {
    entity: Entity;
    directory: string;
};
/**
 * Response containing metadata about where files were published and what may
 * have been published or updated.
 * @public
 */
declare type PublishResponse = {
    /**
     * The URL which serves files from the local publisher's static directory.
     */
    remoteUrl?: string;
    /**
     * The list of objects (specifically their paths) that were published.
     * Objects do not have a preceding slash, and match how one would load the
     * object over the `/static/docs/*` TechDocs Backend Plugin endpoint.
     */
    objects?: string[];
} | void;
/**
 * Result for the validation check.
 * @public
 */
declare type ReadinessResponse = {
    /** If true, the publisher is able to interact with the backing storage. */
    isAvailable: boolean;
};
/**
 * Type to hold metadata found in techdocs_metadata.json and associated with each site
 * @param etag - ETag of the resource used to generate the site. Usually the latest commit sha of the source repository.
 * @public
 */
declare type TechDocsMetadata = {
    site_name: string;
    site_description: string;
    etag: string;
    build_timestamp: number;
    files?: string[];
};
/**
 * TechDocs entity triplet migration request
 * @public
 */
declare type MigrateRequest = {
    /**
     * Whether or not to remove the source file. Defaults to false (acting like a
     * copy instead of a move).
     */
    removeOriginal?: boolean;
    /**
     * Maximum number of files/objects to migrate at once. Defaults to 25.
     */
    concurrency?: number;
};
/**
 * Base class for a TechDocs publisher (e.g. Local, Google GCS Bucket, AWS S3, etc.)
 * The publisher handles publishing of the generated static files after the prepare and generate steps of TechDocs.
 * It also provides APIs to communicate with the storage service.
 *
 * @public
 */
interface PublisherBase {
    /**
     * Check if the publisher is ready. This check tries to perform certain checks to see if the
     * publisher is configured correctly and can be used to publish or read documentations.
     * The different implementations might e.g. use the provided service credentials to access the
     * target or check if a folder/bucket is available.
     */
    getReadiness(): Promise<ReadinessResponse>;
    /**
     * Store the generated static files onto a storage service (either local filesystem or external service).
     *
     * @param request - Object containing the entity from the service
     *                  catalog, and the directory that contains the generated static files from TechDocs.
     */
    publish(request: PublishRequest): Promise<PublishResponse>;
    /**
     * Retrieve TechDocs Metadata about a site e.g. name, contributors, last updated, etc.
     * This API uses the techdocs_metadata.json file that co-exists along with the generated docs.
     */
    fetchTechDocsMetadata(entityName: CompoundEntityRef): Promise<TechDocsMetadata>;
    /**
     * Route middleware to serve static documentation files for an entity.
     */
    docsRouter(): express.Handler;
    /**
     * Check if the index.html is present for the Entity at the Storage location.
     */
    hasDocsBeenGenerated(entityName: Entity): Promise<boolean>;
    /**
     * Migrates documentation objects with case sensitive entity triplets to
     * lowercase entity triplets. This was (will be) a change introduced in
     * `techdocs-cli` version `{0.x.y}` and `techdocs-backend` version `{0.x.y}`.
     *
     * Implementation of this method is unnecessary in publishers introduced
     * after version `{0.x.y}` of `techdocs-node`.
     */
    migrateDocsCase?(migrateRequest: MigrateRequest): Promise<void>;
}

/**
 * Factory class to create a TechDocs publisher based on defined publisher type in app config.
 * Uses `techdocs.publisher.type`.
 * @public
 */
declare class Publisher {
    /**
     * Returns a instance of TechDocs publisher
     * @param config - A Backstage configuration
     * @param options - Options for configuring the publisher factory
     */
    static fromConfig(config: Config, { logger, discovery }: PublisherFactory): Promise<PublisherBase>;
}

/**
 * TechDocs indexable document interface
 * @public
 */
interface TechDocsDocument extends IndexableDocument {
    /**
     * Entity kind
     */
    kind: string;
    /**
     * Entity metadata namespace
     */
    namespace: string;
    /**
     * Entity metadata name
     */
    name: string;
    /**
     * Entity lifecycle
     */
    lifecycle: string;
    /**
     * Entity owner
     */
    owner: string;
    /**
     * Entity path
     */
    path: string;
}

export { DirectoryPreparer, ETag, GeneratorBase, GeneratorBuilder, GeneratorOptions, GeneratorRunOptions, Generators, MigrateRequest, ParsedLocationAnnotation, PreparerBase, PreparerBuilder, PreparerConfig, PreparerOptions, PreparerResponse, Preparers, PublishRequest, PublishResponse, Publisher, PublisherBase, PublisherFactory, PublisherType, ReadinessResponse, RemoteProtocol, SupportedGeneratorKey, TechDocsDocument, TechDocsMetadata, TechdocsGenerator, UrlPreparer, getDocFilesFromRepository, getLocationForEntity, parseReferenceAnnotation, transformDirLocation };
