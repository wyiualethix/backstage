/**
 * Types and validators that help describe the model of a Backstage Catalog
 *
 * @packageDocumentation
 */

import { JsonObject } from '@backstage/types';
import { SerializedError } from '@backstage/errors';

/**
 * A version of the {@link Entity} type that contains unstable alpha fields.
 *
 * @remarks
 *
 * Available via the `@backstage/catalog-model/alpha` import.
 *
 * @alpha
 */
export declare interface AlphaEntity extends Entity {
    /**
     * The current status of the entity, as claimed by various sources.
     *
     * The keys are implementation defined and the values can be any JSON object
     * with semantics that match that implementation.
     */
    status?: EntityStatus;
}

/**
 * Annotation for linking to entity edit page from catalog pages.
 *
 * @public
 */
export declare const ANNOTATION_EDIT_URL = "backstage.io/edit-url";

/**
 * Entity annotation containing the location from which the entity is sourced.
 *
 * @public
 */
export declare const ANNOTATION_LOCATION = "backstage.io/managed-by-location";

/**
 * Entity annotation containing the originally sourced location which ultimately
 * led to this entity being ingested.
 *
 * @public
 */
export declare const ANNOTATION_ORIGIN_LOCATION = "backstage.io/managed-by-origin-location";

/**
 * Entity annotation pointing to the source (e.g. source code repository root or
 * similar) for this entity.
 *
 * @public
 */
export declare const ANNOTATION_SOURCE_LOCATION = "backstage.io/source-location";

/**
 * Annotation for linking to entity page from catalog pages.
 *
 * @public
 */
export declare const ANNOTATION_VIEW_URL = "backstage.io/view-url";

/**
 * Backstage API kind Entity. APIs describe the interfaces for Components to communicate.
 *
 * @remarks
 *
 * See {@link https://backstage.io/docs/features/software-catalog/system-model}
 *
 * @public
 */
declare interface ApiEntityV1alpha1 extends Entity {
    apiVersion: 'backstage.io/v1alpha1' | 'backstage.io/v1beta1';
    kind: 'API';
    spec: {
        type: string;
        lifecycle: string;
        owner: string;
        definition: string;
        system?: string;
    };
}
export { ApiEntityV1alpha1 as ApiEntity }
export { ApiEntityV1alpha1 }

/**
 * {@link KindValidator} for {@link ApiEntityV1alpha1}.
 *
 * @public
 */
export declare const apiEntityV1alpha1Validator: KindValidator;

/**
 * Contains various helper validation and normalization functions that can be
 * composed to form a Validator.
 *
 * @public
 */
export declare class CommonValidatorFunctions {
    /**
     * Checks that the value is on the form <suffix> or <prefix><separator><suffix>, and validates
     * those parts separately.
     *
     * @param value - The value to check
     * @param separator - The separator between parts
     * @param isValidPrefix - Checks that the part before the separator is valid, if present
     * @param isValidSuffix - Checks that the part after the separator (or the entire value if there is no separator) is valid
     */
    static isValidPrefixAndOrSuffix(value: unknown, separator: string, isValidPrefix: (value: string) => boolean, isValidSuffix: (value: string) => boolean): boolean;
    /**
     * Checks that the value can be safely transferred as JSON.
     *
     * @param value - The value to check
     */
    static isJsonSafe(value: unknown): boolean;
    /**
     * Checks that the value is a valid DNS subdomain name.
     *
     * @param value - The value to check
     * @see https://tools.ietf.org/html/rfc1123
     */
    static isValidDnsSubdomain(value: unknown): boolean;
    /**
     * Checks that the value is a valid DNS label.
     *
     * @param value - The value to check
     * @see https://tools.ietf.org/html/rfc1123
     */
    static isValidDnsLabel(value: unknown): boolean;
    /**
     * Checks that the value is a valid tag.
     *
     * @deprecated This will be removed in a future release
     * @param value - The value to check
     */
    static isValidTag(value: unknown): boolean;
    /**
     * Checks that the value is a valid string URL.
     *
     * @param value - The value to check
     */
    static isValidUrl(value: unknown): boolean;
    /**
     * Checks that the value is a non empty string value.
     *
     * @deprecated use isNonEmptyString instead
     * @param value - The value to check
     */
    static isValidString(value: unknown): boolean;
    /**
     * Checks that the value is a string value that's not empty.
     *
     * @param value - The value to check
     */
    static isNonEmptyString(value: unknown): value is string;
}

/**
 * Backstage catalog Component kind Entity. Represents a single, individual piece of software.
 *
 * @remarks
 *
 * See {@link https://backstage.io/docs/features/software-catalog/system-model}
 *
 * @public
 */
declare interface ComponentEntityV1alpha1 extends Entity {
    apiVersion: 'backstage.io/v1alpha1' | 'backstage.io/v1beta1';
    kind: 'Component';
    spec: {
        type: string;
        lifecycle: string;
        owner: string;
        subcomponentOf?: string;
        providesApis?: string[];
        consumesApis?: string[];
        dependsOn?: string[];
        system?: string;
    };
}
export { ComponentEntityV1alpha1 as ComponentEntity }
export { ComponentEntityV1alpha1 }

/**
 * {@link KindValidator} for {@link ComponentEntityV1alpha1}.
 *
 * @public
 */
export declare const componentEntityV1alpha1Validator: KindValidator;

/**
 * All parts of a complete entity ref, forming a full kind-namespace-name
 * triplet.
 *
 * @public
 */
export declare type CompoundEntityRef = {
    kind: string;
    namespace: string;
    name: string;
};

/**
 * The namespace that entities without an explicit namespace fall into.
 *
 * @public
 */
export declare const DEFAULT_NAMESPACE = "default";

/**
 * Sets a default namespace if none was set.
 *
 * @public
 */
export declare class DefaultNamespaceEntityPolicy implements EntityPolicy {
    private readonly namespace;
    constructor(namespace?: string);
    enforce(entity: Entity): Promise<Entity>;
}

/**
 * Backstage Domain kind Entity. Domains group Systems together.
 *
 * @remarks
 *
 * See {@link https://backstage.io/docs/features/software-catalog/system-model}
 *
 * @public
 */
declare interface DomainEntityV1alpha1 extends Entity {
    apiVersion: 'backstage.io/v1alpha1' | 'backstage.io/v1beta1';
    kind: 'Domain';
    spec: {
        owner: string;
    };
}
export { DomainEntityV1alpha1 as DomainEntity }
export { DomainEntityV1alpha1 }

/**
 * {@link KindValidator} for {@link DomainEntityV1alpha1}.
 *
 * @public
 */
export declare const domainEntityV1alpha1Validator: KindValidator;

/**
 * The parts of the format that's common to all versions/kinds of entity.
 *
 * @remarks
 *
 * See also:
 * {@link https://kubernetes.io/docs/concepts/overview/working-with-objects/kubernetes-objects/}
 * @public
 */
export declare type Entity = {
    /**
     * The version of specification format for this particular entity that
     * this is written against.
     */
    apiVersion: string;
    /**
     * The high level entity type being described.
     */
    kind: string;
    /**
     * Metadata related to the entity.
     */
    metadata: EntityMeta;
    /**
     * The specification data describing the entity itself.
     */
    spec?: JsonObject;
    /**
     * The relations that this entity has with other entities.
     */
    relations?: EntityRelation[];
};

/**
 * The envelope skeleton parts of an entity - whatever is necessary to be able
 * to give it a ref and pass to further validation / policy checking.
 *
 * @public
 * @see https://kubernetes.io/docs/concepts/overview/working-with-objects/kubernetes-objects/
 */
export declare type EntityEnvelope = {
    /**
     * The version of specification format for this particular entity that
     * this is written against.
     */
    apiVersion: string;
    /**
     * The high level entity type being described.
     */
    kind: string;
    /**
     * Metadata related to the entity.
     */
    metadata: {
        /**
         * The name of the entity.
         *
         * Must be unique within the catalog at any given point in time, for any
         * given namespace + kind pair.
         */
        name: string;
        /**
         * The namespace that the entity belongs to.
         */
        namespace?: string;
    };
};

/**
 * Creates a validation function that takes some arbitrary data, and either
 * returns that data cast to an {@link EntityEnvelope} (or the given subtype)
 * if it matches that schema, or throws a {@link globals#TypeError} describing the
 * errors.
 *
 * @remarks
 *
 * Note that this validator is only meant for applying the base schema checks;
 * it does not take custom policies or additional processor based validation
 * into account.
 *
 * By default, the plain `EntityEnvelope` schema is used. If you pass in your
 * own, it may contain `$ref` references to the following, which are resolved
 * automatically for you:
 *
 * - {@link EntityEnvelope}
 * - {@link Entity}
 * - {@link EntityMeta}
 * - `common#<id>`
 *
 * See also {@link https://github.com/backstage/backstage/tree/master/packages/catalog-model/src/schema}
 *
 * @public
 *
 */
export declare function entityEnvelopeSchemaValidator<T extends EntityEnvelope = EntityEnvelope>(schema?: unknown): (data: unknown) => T;

/**
 * Creates a validation function that takes some arbitrary data, and either
 * returns that data cast to a `T` if it matches that schema, or `false` if the
 * schema apiVersion/kind didn't apply to that data, or throws a
 * {@link globals#TypeError} describing actual errors.
 *
 * @remarks
 *
 * This validator is highly specialized, in that it has special treatment of
 * the `kind` and `apiVersion` root keys. This only works if your schema has
 * their rule set to `"enum"`:
 *
 * ```
 * "apiVersion": {
 *    "enum": ["backstage.io/v1alpha1", "backstage.io/v1beta1"]
 * },
 * "kind": {
 *   "enum": ["Group"]
 * },
 * ```
 *
 * In the above example, the created validator will return `false` if and only
 * if the kind and/or apiVersion mismatch.
 *
 * Note that this validator is only meant for applying the base schema checks;
 * it does not take custom policies or additional processor based validation
 * into account.
 *
 * The given schema may contain `$ref` references to the following, which are
 * resolved automatically for you:
 *
 * - {@link Entity}
 *
 * - {@link EntityEnvelope}
 *
 * - {@link EntityMeta}
 *
 * - `common#<id>`
 * @see {@link https://github.com/backstage/backstage/tree/master/packages/catalog-model/src/schema}
 *
 * @public
 */
export declare function entityKindSchemaValidator<T extends Entity>(schema: unknown): (data: unknown) => T | false;

/**
 * A link to external information that is related to the entity.
 *
 * @public
 */
export declare type EntityLink = {
    /**
     * The url to the external site, document, etc.
     */
    url: string;
    /**
     * An optional descriptive title for the link.
     */
    title?: string;
    /**
     * An optional semantic key that represents a visual icon.
     */
    icon?: string;
};

/**
 * Metadata fields common to all versions/kinds of entity.
 *
 * @remarks
 *
 * See also:
 * {@link https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.18/#objectmeta-v1-meta}
 * {@link https://kubernetes.io/docs/concepts/overview/working-with-objects/kubernetes-objects/}
 *
 * @public
 */
export declare type EntityMeta = JsonObject & {
    /**
     * A globally unique ID for the entity.
     *
     * This field can not be set by the user at creation time, and the server
     * will reject an attempt to do so. The field will be populated in read
     * operations. The field can (optionally) be specified when performing
     * update or delete operations, but the server is free to reject requests
     * that do so in such a way that it breaks semantics.
     */
    uid?: string;
    /**
     * An opaque string that changes for each update operation to any part of
     * the entity, including metadata.
     *
     * This field can not be set by the user at creation time, and the server
     * will reject an attempt to do so. The field will be populated in read
     * operations. The field can (optionally) be specified when performing
     * update or delete operations, and the server will then reject the
     * operation if it does not match the current stored value.
     */
    etag?: string;
    /**
     * The name of the entity.
     *
     * Must be unique within the catalog at any given point in time, for any
     * given namespace + kind pair. This value is part of the technical
     * identifier of the entity, and as such it will appear in URLs, database
     * tables, entity references, and similar. It is subject to restrictions
     * regarding what characters are allowed.
     *
     * If you want to use a different, more human readable string with fewer
     * restrictions on it in user interfaces, see the `title` field below.
     */
    name: string;
    /**
     * The namespace that the entity belongs to.
     */
    namespace?: string;
    /**
     * A display name of the entity, to be presented in user interfaces instead
     * of the `name` property above, when available.
     *
     * This field is sometimes useful when the `name` is cumbersome or ends up
     * being perceived as overly technical. The title generally does not have
     * as stringent format requirements on it, so it may contain special
     * characters and be more explanatory. Do keep it very short though, and
     * avoid situations where a title can be confused with the name of another
     * entity, or where two entities share a title.
     *
     * Note that this is only for display purposes, and may be ignored by some
     * parts of the code. Entity references still always make use of the `name`
     * property, not the title.
     */
    title?: string;
    /**
     * A short (typically relatively few words, on one line) description of the
     * entity.
     */
    description?: string;
    /**
     * Key/value pairs of identifying information attached to the entity.
     */
    labels?: Record<string, string>;
    /**
     * Key/value pairs of non-identifying auxiliary information attached to the
     * entity.
     */
    annotations?: Record<string, string>;
    /**
     * A list of single-valued strings, to for example classify catalog entities in
     * various ways.
     */
    tags?: string[];
    /**
     * A list of external hyperlinks related to the entity.
     */
    links?: EntityLink[];
};

/**
 * Provides helpers for enforcing a set of {@link EntityPolicy} in an `and`/`or` expression.
 *
 * @public
 */
export declare const EntityPolicies: {
    allOf(policies: EntityPolicy[]): EntityPolicy;
    oneOf(policies: EntityPolicy[]): EntityPolicy;
};

/**
 * A policy for validation or mutation to be applied to entities as they are
 * entering the system.
 *
 * @public
 */
export declare type EntityPolicy = {
    /**
     * Applies validation or mutation on an entity.
     *
     * @param entity - The entity, as validated/mutated so far in the policy tree
     * @returns The incoming entity, or a mutated version of the same, or
     *          undefined if this processor could not handle the entity
     * @throws An error if the entity should be rejected
     */
    enforce(entity: Entity): Promise<Entity | undefined>;
};

/**
 * A relation of a specific type to another entity in the catalog.
 *
 * @public
 */
export declare type EntityRelation = {
    /**
     * The type of the relation.
     */
    type: string;
    /**
     * The entity ref of the target of this relation.
     */
    targetRef: string;
};

/**
 * Creates a validation function that takes some arbitrary data, and either
 * returns that data cast to an {@link Entity} (or the given subtype) if it
 * matches that schema, or throws a {@link globals#TypeError} describing the errors.
 *
 * @remarks
 *
 * Note that this validator is only meant for applying the base schema checks;
 * it does not take custom policies or additional processor based validation
 * into account.
 *
 * By default, the plain {@link Entity} schema is used. If you pass in your own, it
 * may contain `$ref` references to the following, which are resolved
 * automatically for you:
 *
 * - {@link Entity}
 * - {@link EntityEnvelope}
 * - {@link EntityMeta}
 * - `common#<id>`
 *
 * @public
 * @see {@link https://github.com/backstage/backstage/tree/master/packages/catalog-model/src/schema}
 */
export declare function entitySchemaValidator<T extends Entity = Entity>(schema?: unknown): (data: unknown) => T;

/**
 * The current status of the entity, as claimed by various sources.
 *
 * @alpha
 */
export declare type EntityStatus = {
    /**
     * Specific status item on a well known format.
     */
    items?: EntityStatusItem[];
};

/**
 * A specific status item on a well known format.
 * @alpha
 */
export declare type EntityStatusItem = {
    /**
     * The type of status as a unique key per source.
     */
    type: string;
    /**
     * The level / severity of the status item. If the level is "error", the
     * processing of the entity may be entirely blocked. In this case the status
     * entry may apply to a different, newer version of the data than what is
     * being returned in the catalog response.
     */
    level: EntityStatusLevel;
    /**
     * A brief message describing the status, intended for human consumption.
     */
    message: string;
    /**
     * An optional serialized error object related to the status.
     */
    error?: SerializedError;
};

/**
 * Each entity status item has a level, describing its severity.
 * @alpha
 */
export declare type EntityStatusLevel = 'info' | 'warning' | 'error';

/**
 * Ensures that the format of individual fields of the entity envelope
 * is valid.
 *
 * @remarks
 *
 * This does not take into account machine generated fields such as uid and etag.
 *
 * @public
 */
export declare class FieldFormatEntityPolicy implements EntityPolicy {
    private readonly validators;
    constructor(validators?: Validators);
    enforce(entity: Entity): Promise<Entity>;
}

/**
 * Extracts the kind, namespace and name that form the compound entity ref
 * triplet of the given entity.
 *
 * @public
 * @param entity - An entity
 * @returns The compound entity ref
 */
export declare function getCompoundEntityRef(entity: Entity): CompoundEntityRef;

/**
 * Returns the source code location of the Entity, to the extent that one exists.
 *
 * @remarks
 *
 * If the returned location type is of type 'url', the target should be readable at least
 * using the UrlReader from `@backstage/backend-common`. If it is not of type 'url', the caller
 * needs to have explicit handling of each location type or signal that it is not supported.
 *
 * @public
 */
export declare function getEntitySourceLocation(entity: Entity): {
    type: string;
    target: string;
};

/**
 * Backstage catalog Group kind Entity.
 *
 * @public
 */
declare interface GroupEntityV1alpha1 extends Entity {
    apiVersion: 'backstage.io/v1alpha1' | 'backstage.io/v1beta1';
    kind: 'Group';
    spec: {
        type: string;
        profile?: {
            displayName?: string;
            email?: string;
            picture?: string;
        };
        parent?: string;
        children: string[];
        members?: string[];
    };
}
export { GroupEntityV1alpha1 as GroupEntity }
export { GroupEntityV1alpha1 }

/**
 * {@link KindValidator} for {@link GroupEntityV1alpha1}.
 * @public
 */
export declare const groupEntityV1alpha1Validator: KindValidator;

/**
 * Validates entities of a certain kind.
 *
 * @public
 */
export declare type KindValidator = {
    /**
     * Validates the entity as a known entity kind.
     *
     * @param entity - The entity to validate
     * @returns Resolves to true, if the entity was of a kind that was known and
     *   handled by this validator, and was found to be valid. Resolves to false,
     *   if the entity was not of a kind that was known by this validator.
     *   Rejects to an Error describing the problem, if the entity was of a kind
     *   that was known by this validator and was not valid.
     */
    check(entity: Entity): Promise<boolean>;
};

/**
 * Contains validation functions that match the Kubernetes spec, usable to
 * build a catalog that is compatible with those rule sets.
 *
 * @public
 * @see https://kubernetes.io/docs/concepts/overview/working-with-objects/names/
 * @see https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set
 * @see https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/#syntax-and-character-set
 */
export declare class KubernetesValidatorFunctions {
    static isValidApiVersion(value: unknown): boolean;
    static isValidKind(value: unknown): boolean;
    static isValidObjectName(value: unknown): boolean;
    static isValidNamespace(value: unknown): boolean;
    static isValidLabelKey(value: unknown): boolean;
    static isValidLabelValue(value: unknown): boolean;
    static isValidAnnotationKey(value: unknown): boolean;
    static isValidAnnotationValue(value: unknown): boolean;
}

/**
 * Backstage catalog Location kind Entity.
 *
 * @public
 */
declare interface LocationEntityV1alpha1 extends Entity {
    apiVersion: 'backstage.io/v1alpha1' | 'backstage.io/v1beta1';
    kind: 'Location';
    spec: {
        type?: string;
        target?: string;
        targets?: string[];
        presence?: 'required' | 'optional';
    };
}
export { LocationEntityV1alpha1 as LocationEntity }
export { LocationEntityV1alpha1 }

/**
 * {@link KindValidator} for {@link LocationEntityV1alpha1}.
 *
 * @public
 */
export declare const locationEntityV1alpha1Validator: KindValidator;

/**
 * Creates a {@link Validators} object from `overrides`, with default values taken from {@link KubernetesValidatorFunctions}
 *
 * @public
 */
export declare function makeValidator(overrides?: Partial<Validators>): Validators;

/**
 * Ensures that there are no foreign root fields in the entity.
 *
 * @public
 */
export declare class NoForeignRootFieldsEntityPolicy implements EntityPolicy {
    private readonly knownFields;
    constructor(knownFields?: string[]);
    enforce(entity: Entity): Promise<Entity>;
}

/**
 * Parses an entity reference, either on string or compound form, and returns
 * a structure with a name, and optional kind and namespace.
 *
 * @remarks
 *
 * The context object can contain default values for the kind and namespace,
 * that will be used if the input reference did not specify any.
 *
 * @public
 * @param ref - The reference to parse
 * @param context - The context of defaults that the parsing happens within
 * @returns The compound form of the reference
 */
export declare function parseEntityRef(ref: string | {
    kind?: string;
    namespace?: string;
    name: string;
}, context?: {
    /** The default kind, if none is given in the reference */
    defaultKind?: string;
    /** The default namespace, if none is given in the reference */
    defaultNamespace?: string;
}): CompoundEntityRef;

/**
 * Parses a string form location reference.
 *
 * @public
 * @param ref - A string-form location ref, e.g. `'url:https://host'`
 * @returns A location ref, e.g. `{ type: 'url', target: 'https://host' }`
 */
export declare function parseLocationRef(ref: string): {
    type: string;
    target: string;
};

/**
 * A relation of an API being consumed, typically by a component. Reversed direction of
 * {@link RELATION_CONSUMES_API}.
 *
 * @public
 */
export declare const RELATION_API_CONSUMED_BY = "apiConsumedBy";

/**
 * A relation from an API to its provider entity (typically a component). Reversed direction of
 * {@link RELATION_PROVIDES_API}.
 *
 * @public
 */
export declare const RELATION_API_PROVIDED_BY = "apiProvidedBy";

/**
 * A relation from a child to a parent entity, used for example to describe
 * the organizational structure between groups. Reversed direction of
 * {@link RELATION_PARENT_OF}.
 *
 * @public
 */
export declare const RELATION_CHILD_OF = "childOf";

/**
 * A relation with an API entity, typically from a component. Reversed direction of
 * {@link RELATION_API_CONSUMED_BY}.
 *
 * @public
 */
export declare const RELATION_CONSUMES_API = "consumesApi";

/**
 * A relation denoting a reverse dependency by another entity. Reversed direction of
 * {@link RELATION_DEPENDS_ON}.
 *
 * @public
 */
export declare const RELATION_DEPENDENCY_OF = "dependencyOf";

/**
 * A relation denoting a dependency on another entity. Reversed direction of
 * {@link RELATION_DEPENDENCY_OF}.
 *
 * @public
 */
export declare const RELATION_DEPENDS_ON = "dependsOn";

/**
 * A relation from a group to its member, typcally a user in a group. Reversed direction of
 * {@link RELATION_MEMBER_OF}.
 *
 * @public
 */
export declare const RELATION_HAS_MEMBER = "hasMember";

/**
 * A relation from a containing entity to a contained entity. Reversed direction of
 * {@link RELATION_PART_OF}.
 *
 * @public
 */
export declare const RELATION_HAS_PART = "hasPart";

/**
 * A membership relation, typically for users in a group. Reversed direction of
 * {@link RELATION_HAS_MEMBER}.
 *
 * @public
 */
export declare const RELATION_MEMBER_OF = "memberOf";

/**
 * An ownership relation where the owner is usually an organizational
 * entity (user or group), and the other entity can be anything. Reversed
 * direction of {@link RELATION_OWNER_OF}.
 *
 * @public
 */
export declare const RELATION_OWNED_BY = "ownedBy";

/**
 * A relationship from an owner to the owned entity. Reversed direction of
 * {@link RELATION_OWNED_BY}.
 *
 * @public
 */
export declare const RELATION_OWNER_OF = "ownerOf";

/**
 * A parent/child relation to build up a tree, used for example to describe
 * the organizational structure between groups. Reversed direction of
 * {@link RELATION_CHILD_OF}.
 *
 * @public
 */
export declare const RELATION_PARENT_OF = "parentOf";

/**
 * A part/whole relation, typically for components in a system and systems
 * in a domain. Reversed direction of {@link RELATION_HAS_PART}.
 *
 * @public
 */
export declare const RELATION_PART_OF = "partOf";

/**
 * A relation from an API provider entity (typically a component) to the API. Reversed direction of
 * {@link RELATION_API_PROVIDED_BY}.
 *
 * @public
 */
export declare const RELATION_PROVIDES_API = "providesApi";

/**
 * Backstage catalog Resource kind Entity. Represents infrastructure required to operate Components.
 *
 * @remarks
 *
 * See {@link https://backstage.io/docs/features/software-catalog/system-model}
 *
 * @public
 */
declare interface ResourceEntityV1alpha1 extends Entity {
    apiVersion: 'backstage.io/v1alpha1' | 'backstage.io/v1beta1';
    kind: 'Resource';
    spec: {
        type: string;
        owner: string;
        dependsOn?: string[];
        dependencyOf?: string[];
        system?: string;
    };
}
export { ResourceEntityV1alpha1 as ResourceEntity }
export { ResourceEntityV1alpha1 }

/**
 * {@link KindValidator} for {@link ResourceEntityV1alpha1}.
 *
 * @public
 */
export declare const resourceEntityV1alpha1Validator: KindValidator;

/**
 * Ensures that the entity spec is valid according to a schema.
 *
 * @remarks
 *
 * This should be the first policy in the list, to ensure that other downstream
 * policies can work with a structure that is at least valid in therms of the
 * typescript type.
 *
 * @public
 */
export declare class SchemaValidEntityPolicy implements EntityPolicy {
    private validate;
    enforce(entity: Entity): Promise<Entity>;
}

/**
 * Takes an entity or entity name/reference, and returns the string form of an
 * entity ref.
 *
 * @remarks
 *
 * This function creates a canonical and unique reference to the entity, converting
 * all parts of the name to lowercase and inserts the default namespace if needed.
 * It is typically not the best way to represent the entity reference to the user.
 *
 * @public
 * @param ref - The reference to serialize
 * @returns The same reference on either string or compound form
 */
export declare function stringifyEntityRef(ref: Entity | {
    kind: string;
    namespace?: string;
    name: string;
}): string;

/**
 * Turns a location ref into its string form.
 *
 * @public
 * @param ref - A location ref, e.g. `{ type: 'url', target: 'https://host' }`
 * @returns A string-form location ref, e.g. `'url:https://host'`
 */
export declare function stringifyLocationRef(ref: {
    type: string;
    target: string;
}): string;

/**
 * Backstage catalog System kind Entity. Systems group Comopnents, Resources and APIs together.
 *
 * @remarks
 *
 * See {@link https://backstage.io/docs/features/software-catalog/system-model}
 *
 * @public
 */
declare interface SystemEntityV1alpha1 extends Entity {
    apiVersion: 'backstage.io/v1alpha1' | 'backstage.io/v1beta1';
    kind: 'System';
    spec: {
        owner: string;
        domain?: string;
    };
}
export { SystemEntityV1alpha1 as SystemEntity }
export { SystemEntityV1alpha1 }

/**
 * {@link KindValidator} for {@link SystemEntityV1alpha1}.
 *
 * @public
 */
export declare const systemEntityV1alpha1Validator: KindValidator;

/**
 * Backstage catalog User kind Entity.
 *
 * @public
 */
declare interface UserEntityV1alpha1 extends Entity {
    apiVersion: 'backstage.io/v1alpha1' | 'backstage.io/v1beta1';
    kind: 'User';
    spec: {
        profile?: {
            displayName?: string;
            email?: string;
            picture?: string;
        };
        memberOf?: string[];
    };
}
export { UserEntityV1alpha1 as UserEntity }
export { UserEntityV1alpha1 }

/**
 * {@link KindValidator} for {@link UserEntityV1alpha1}.
 *
 * @public
 */
export declare const userEntityV1alpha1Validator: KindValidator;

/**
 * Type alias for implementing validators of various entity objects.
 *
 * @public
 */
export declare type Validators = {
    isValidApiVersion(value: unknown): boolean;
    isValidKind(value: unknown): boolean;
    isValidEntityName(value: unknown): boolean;
    isValidNamespace(value: unknown): boolean;
    isValidLabelKey(value: unknown): boolean;
    isValidLabelValue(value: unknown): boolean;
    isValidAnnotationKey(value: unknown): boolean;
    isValidAnnotationValue(value: unknown): boolean;
    isValidTag(value: unknown): boolean;
};

export { }
