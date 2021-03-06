import { TaskRunner } from '@backstage/backend-tasks';
import { Config } from '@backstage/config';
import { EntityProvider, EntityProviderConnection, CatalogProcessor, LocationSpec, CatalogProcessorEmit } from '@backstage/plugin-catalog-backend';
import { Logger } from 'winston';
import { JsonValue } from '@backstage/types';
import { SearchOptions, SearchEntry, Client } from 'ldapjs';
import { UserEntity, GroupEntity } from '@backstage/catalog-model';

/**
 * The configuration parameters for a single LDAP provider.
 *
 * @public
 */
declare type LdapProviderConfig = {
    target: string;
    tls?: TLSConfig;
    bind?: BindConfig;
    users: UserConfig;
    groups: GroupConfig;
};
/**
 * TLS settings
 *
 * @public
 */
declare type TLSConfig = {
    rejectUnauthorized?: boolean;
};
/**
 * The settings to use for the a command.
 *
 * @public
 */
declare type BindConfig = {
    dn: string;
    secret: string;
};
/**
 * The settings that govern the reading and interpretation of users.
 *
 * @public
 */
declare type UserConfig = {
    dn: string;
    options: SearchOptions;
    set?: {
        [path: string]: JsonValue;
    };
    map: {
        rdn: string;
        name: string;
        description?: string;
        displayName: string;
        email: string;
        picture?: string;
        memberOf: string;
    };
};
/**
 * The settings that govern the reading and interpretation of groups.
 *
 * @public
 */
declare type GroupConfig = {
    dn: string;
    options: SearchOptions;
    set?: {
        [path: string]: JsonValue;
    };
    map: {
        rdn: string;
        name: string;
        description: string;
        type: string;
        displayName: string;
        email?: string;
        picture?: string;
        memberOf: string;
        members: string;
    };
};
/**
 * Parses configuration.
 *
 * @param config - The root of the LDAP config hierarchy
 *
 * @public
 */
declare function readLdapConfig(config: Config): LdapProviderConfig[];

/**
 * An LDAP Vendor handles unique nuances between different vendors.
 *
 * @public
 */
declare type LdapVendor = {
    /**
     * The attribute name that holds the distinguished name (DN) for an entry.
     */
    dnAttributeName: string;
    /**
     * The attribute name that holds a universal unique identifier for an entry.
     */
    uuidAttributeName: string;
    /**
     * Decode ldap entry values for a given attribute name to their string representation.
     *
     * @param entry - The ldap entry
     * @param name - The attribute to decode
     */
    decodeStringAttribute: (entry: SearchEntry, name: string) => string[];
};

/**
 * Basic wrapper for the `ldapjs` library.
 *
 * Helps out with promisifying calls, paging, binding etc.
 *
 * @public
 */
declare class LdapClient {
    private readonly client;
    private readonly logger;
    private vendor;
    static create(logger: Logger, target: string, bind?: BindConfig, tls?: TLSConfig): Promise<LdapClient>;
    constructor(client: Client, logger: Logger);
    /**
     * Performs an LDAP search operation.
     *
     * @param dn - The fully qualified base DN to search within
     * @param options - The search options
     */
    search(dn: string, options: SearchOptions): Promise<SearchEntry[]>;
    /**
     * Performs an LDAP search operation, calls a function on each entry to limit memory usage
     *
     * @param dn - The fully qualified base DN to search within
     * @param options - The search options
     * @param f - The callback to call on each search entry
     */
    searchStreaming(dn: string, options: SearchOptions, f: (entry: SearchEntry) => void): Promise<void>;
    /**
     * Get the Server Vendor.
     * Currently only detects Microsoft Active Directory Servers.
     *
     * @see https://ldapwiki.com/wiki/Determine%20LDAP%20Server%20Vendor
     */
    getVendor(): Promise<LdapVendor>;
    /**
     * Get the Root DSE.
     *
     * @see https://ldapwiki.com/wiki/RootDSE
     */
    getRootDSE(): Promise<SearchEntry | undefined>;
}

/**
 * Maps a single-valued attribute to a consumer.
 *
 * This helper can be useful when implementing a user or group transformer.
 *
 * @param entry - The LDAP source entry
 * @param vendor - The LDAP vendor
 * @param attributeName - The source attribute to map. If the attribute is
 *        undefined the mapping will be silently ignored.
 * @param setter - The function to be called with the decoded attribute from the
 *        source entry
 *
 * @public
 */
declare function mapStringAttr(entry: SearchEntry, vendor: LdapVendor, attributeName: string | undefined, setter: (value: string) => void): void;

/**
 * The name of an entity annotation, that references the RDN of the LDAP object
 * it was ingested from.
 *
 * The RDN is the name of the leftmost attribute that identifies the item; for
 * example, for an item with the fully qualified DN
 * uid=john,ou=people,ou=spotify,dc=spotify,dc=net the generated entity would
 * have this annotation, with the value "john".
 *
 * @public
 */
declare const LDAP_RDN_ANNOTATION = "backstage.io/ldap-rdn";
/**
 * The name of an entity annotation, that references the DN of the LDAP object
 * it was ingested from.
 *
 * The DN is the fully qualified name that identifies the item; for example,
 * for an item with the DN uid=john,ou=people,ou=spotify,dc=spotify,dc=net the
 * generated entity would have this annotation, with that full string as its
 * value.
 *
 * @public
 */
declare const LDAP_DN_ANNOTATION = "backstage.io/ldap-dn";
/**
 * The name of an entity annotation, that references the UUID of the LDAP
 * object it was ingested from.
 *
 * The UUID is the globally unique ID that identifies the item; for example,
 * for an item with the UUID 76ef928a-b251-1037-9840-d78227f36a7e, the
 * generated entity would have this annotation, with that full string as its
 * value.
 *
 * @public
 */
declare const LDAP_UUID_ANNOTATION = "backstage.io/ldap-uuid";

/**
 * Customize the ingested User entity
 *
 * @param vendor - The LDAP vendor that can be used to find and decode vendor
 *        specific attributes
 * @param config - The User specific config used by the default transformer.
 * @param user - The found LDAP entry in its source format. This is the entry
 *        that you want to transform
 * @returns A `UserEntity` or `undefined` if you want to ignore the found user
 *          for being ingested by the catalog
 *
 * @public
 */
declare type UserTransformer = (vendor: LdapVendor, config: UserConfig, user: SearchEntry) => Promise<UserEntity | undefined>;
/**
 * Customize the ingested Group entity
 *
 * @param vendor - The LDAP vendor that can be used to find and decode vendor
 *        specific attributes
 * @param config - The Group specific config used by the default transformer.
 * @param group - The found LDAP entry in its source format. This is the entry
 *        that you want to transform
 * @returns A `GroupEntity` or `undefined` if you want to ignore the found group
 *          for being ingested by the catalog
 *
 * @public
 */
declare type GroupTransformer = (vendor: LdapVendor, config: GroupConfig, group: SearchEntry) => Promise<GroupEntity | undefined>;

/**
 * The default implementation of the transformation from an LDAP entry to a
 * User entity.
 *
 * @public
 */
declare function defaultUserTransformer(vendor: LdapVendor, config: UserConfig, entry: SearchEntry): Promise<UserEntity | undefined>;
/**
 * The default implementation of the transformation from an LDAP entry to a
 * Group entity.
 *
 * @public
 */
declare function defaultGroupTransformer(vendor: LdapVendor, config: GroupConfig, entry: SearchEntry): Promise<GroupEntity | undefined>;
/**
 * Reads users and groups out of an LDAP provider.
 *
 * @param client - The LDAP client
 * @param userConfig - The user data configuration
 * @param groupConfig - The group data configuration
 * @param options - Additional options
 *
 * @public
 */
declare function readLdapOrg(client: LdapClient, userConfig: UserConfig, groupConfig: GroupConfig, options: {
    groupTransformer?: GroupTransformer;
    userTransformer?: UserTransformer;
    logger: Logger;
}): Promise<{
    users: UserEntity[];
    groups: GroupEntity[];
}>;

/**
 * Options for {@link LdapOrgEntityProvider}.
 *
 * @public
 */
interface LdapOrgEntityProviderOptions {
    /**
     * A unique, stable identifier for this provider.
     *
     * @example "production"
     */
    id: string;
    /**
     * The target that this provider should consume.
     *
     * Should exactly match the "target" field of one of the "ldap.providers"
     * configuration entries.
     *
     * @example "ldaps://ds-read.example.net"
     */
    target: string;
    /**
     * The logger to use.
     */
    logger: Logger;
    /**
     * The refresh schedule to use.
     *
     * @remarks
     *
     * If you pass in 'manual', you are responsible for calling the `read` method
     * manually at some interval.
     *
     * But more commonly you will pass in the result of
     * {@link @backstage/backend-tasks#PluginTaskScheduler.createScheduledTaskRunner}
     * to enable automatic scheduling of tasks.
     */
    schedule: 'manual' | TaskRunner;
    /**
     * The function that transforms a user entry in LDAP to an entity.
     */
    userTransformer?: UserTransformer;
    /**
     * The function that transforms a group entry in LDAP to an entity.
     */
    groupTransformer?: GroupTransformer;
}
/**
 * Reads user and group entries out of an LDAP service, and provides them as
 * User and Group entities for the catalog.
 *
 * @remarks
 *
 * Add an instance of this class to your catalog builder, and then periodically
 * call the {@link LdapOrgEntityProvider.read} method.
 *
 * @public
 */
declare class LdapOrgEntityProvider implements EntityProvider {
    private options;
    private connection?;
    private scheduleFn?;
    static fromConfig(configRoot: Config, options: LdapOrgEntityProviderOptions): LdapOrgEntityProvider;
    constructor(options: {
        id: string;
        provider: LdapProviderConfig;
        logger: Logger;
        userTransformer?: UserTransformer;
        groupTransformer?: GroupTransformer;
    });
    /** {@inheritdoc @backstage/plugin-catalog-backend#EntityProvider.getProviderName} */
    getProviderName(): string;
    /** {@inheritdoc @backstage/plugin-catalog-backend#EntityProvider.connect} */
    connect(connection: EntityProviderConnection): Promise<void>;
    /**
     * Runs one single complete ingestion. This is only necessary if you use
     * manual scheduling.
     */
    read(options?: {
        logger?: Logger;
    }): Promise<void>;
    private schedule;
}

/**
 * Extracts teams and users out of an LDAP server.
 *
 * @public
 */
declare class LdapOrgReaderProcessor implements CatalogProcessor {
    private readonly providers;
    private readonly logger;
    private readonly groupTransformer?;
    private readonly userTransformer?;
    static fromConfig(configRoot: Config, options: {
        logger: Logger;
        groupTransformer?: GroupTransformer;
        userTransformer?: UserTransformer;
    }): LdapOrgReaderProcessor;
    constructor(options: {
        providers: LdapProviderConfig[];
        logger: Logger;
        groupTransformer?: GroupTransformer;
        userTransformer?: UserTransformer;
    });
    getProcessorName(): string;
    readLocation(location: LocationSpec, _optional: boolean, emit: CatalogProcessorEmit): Promise<boolean>;
}

export { BindConfig, GroupConfig, GroupTransformer, LDAP_DN_ANNOTATION, LDAP_RDN_ANNOTATION, LDAP_UUID_ANNOTATION, LdapClient, LdapOrgEntityProvider, LdapOrgEntityProviderOptions, LdapOrgReaderProcessor, LdapProviderConfig, LdapVendor, TLSConfig, UserConfig, UserTransformer, defaultGroupTransformer, defaultUserTransformer, mapStringAttr, readLdapConfig, readLdapOrg };
