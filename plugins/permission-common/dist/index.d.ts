import { Config } from '@backstage/config';

/**
 * The attributes related to a given permission; these should be generic and widely applicable to
 * all permissions in the system.
 * @public
 */
declare type PermissionAttributes = {
    action?: 'create' | 'read' | 'update' | 'delete';
};
/**
 * Generic type for building {@link Permission} types.
 * @public
 */
declare type PermissionBase<TType extends string, TFields extends object> = {
    /**
     * The name of the permission.
     */
    name: string;
    /**
     * {@link PermissionAttributes} which describe characteristics of the permission, to help
     * policy authors make consistent decisions for similar permissions without referring to them
     * all by name.
     */
    attributes: PermissionAttributes;
} & {
    /**
     * String value indicating the type of the permission (e.g. 'basic',
     * 'resource'). The allowed authorization flows in the permission system
     * depend on the type. For example, a `resourceRef` should only be provided
     * when authorizing permissions of type 'resource'.
     */
    type: TType;
} & TFields;
/**
 * A permission that can be checked through authorization.
 *
 * @remarks
 *
 * Permissions are the "what" part of authorization, the action to be performed. This may be reading
 * an entity from the catalog, executing a software template, or any other action a plugin author
 * may wish to protect.
 *
 * To evaluate authorization, a permission is paired with a Backstage identity (the "who") and
 * evaluated using an authorization policy.
 * @public
 */
declare type Permission = BasicPermission | ResourcePermission;
/**
 * A standard {@link Permission} with no additional capabilities or restrictions.
 * @public
 */
declare type BasicPermission = PermissionBase<'basic', {}>;
/**
 * ResourcePermissions are {@link Permission}s that can be authorized based on
 * characteristics of a resource such a catalog entity.
 * @public
 */
declare type ResourcePermission<TResourceType extends string = string> = PermissionBase<'resource', {
    /**
     * Denotes the type of the resource whose resourceRef should be passed when
     * authorizing.
     */
    resourceType: TResourceType;
}>;
/**
 * A client interacting with the permission backend can implement this authorizer interface.
 * @public
 * @deprecated Use {@link @backstage/plugin-permission-common#PermissionEvaluator} instead
 */
interface PermissionAuthorizer {
    authorize(requests: EvaluatePermissionRequest[], options?: AuthorizeRequestOptions): Promise<EvaluatePermissionResponse[]>;
}
/**
 * Options for authorization requests.
 * @public
 */
declare type AuthorizeRequestOptions = {
    token?: string;
};

/**
 * A request with a UUID identifier, so that batched responses can be matched up with the original
 * requests.
 * @public
 */
declare type IdentifiedPermissionMessage<T> = T & {
    id: string;
};
/**
 * A batch of request or response items.
 * @public
 */
declare type PermissionMessageBatch<T> = {
    items: IdentifiedPermissionMessage<T>[];
};
/**
 * The result of an authorization request.
 * @public
 */
declare enum AuthorizeResult {
    /**
     * The authorization request is denied.
     */
    DENY = "DENY",
    /**
     * The authorization request is allowed.
     */
    ALLOW = "ALLOW",
    /**
     * The authorization request is allowed if the provided conditions are met.
     */
    CONDITIONAL = "CONDITIONAL"
}
/**
 * A definitive decision returned by the {@link @backstage/plugin-permission-node#PermissionPolicy}.
 *
 * @remarks
 *
 * This indicates that the policy unconditionally allows (or denies) the request.
 *
 * @public
 */
declare type DefinitivePolicyDecision = {
    result: AuthorizeResult.ALLOW | AuthorizeResult.DENY;
};
/**
 * A conditional decision returned by the {@link @backstage/plugin-permission-node#PermissionPolicy}.
 *
 * @remarks
 *
 * This indicates that the policy allows authorization for the request, given that the returned
 * conditions hold when evaluated. The conditions will be evaluated by the corresponding plugin
 * which knows about the referenced permission rules.
 *
 * @public
 */
declare type ConditionalPolicyDecision = {
    result: AuthorizeResult.CONDITIONAL;
    pluginId: string;
    resourceType: string;
    conditions: PermissionCriteria<PermissionCondition>;
};
/**
 * A decision returned by the {@link @backstage/plugin-permission-node#PermissionPolicy}.
 *
 * @public
 */
declare type PolicyDecision = DefinitivePolicyDecision | ConditionalPolicyDecision;
/**
 * A condition returned with a CONDITIONAL authorization response.
 *
 * Conditions are a reference to a rule defined by a plugin, and parameters to apply the rule. For
 * example, a rule might be `isOwner` from the catalog-backend, and params may be a list of entity
 * claims from a identity token.
 * @public
 */
declare type PermissionCondition<TResourceType extends string = string, TParams extends unknown[] = unknown[]> = {
    resourceType: TResourceType;
    rule: string;
    params: TParams;
};
/**
 * Utility type to represent an array with 1 or more elements.
 * @ignore
 */
declare type NonEmptyArray<T> = [T, ...T[]];
/**
 * Represents a logical AND for the provided criteria.
 * @public
 */
declare type AllOfCriteria<TQuery> = {
    allOf: NonEmptyArray<PermissionCriteria<TQuery>>;
};
/**
 * Represents a logical OR for the provided criteria.
 * @public
 */
declare type AnyOfCriteria<TQuery> = {
    anyOf: NonEmptyArray<PermissionCriteria<TQuery>>;
};
/**
 * Represents a negation of the provided criteria.
 * @public
 */
declare type NotCriteria<TQuery> = {
    not: PermissionCriteria<TQuery>;
};
/**
 * Composes several {@link PermissionCondition}s as criteria with a nested AND/OR structure.
 * @public
 */
declare type PermissionCriteria<TQuery> = AllOfCriteria<TQuery> | AnyOfCriteria<TQuery> | NotCriteria<TQuery> | TQuery;
/**
 * An individual request sent to the permission backend.
 * @public
 */
declare type EvaluatePermissionRequest = {
    permission: Permission;
    resourceRef?: string;
};
/**
 * A batch of requests sent to the permission backend.
 * @public
 */
declare type EvaluatePermissionRequestBatch = PermissionMessageBatch<EvaluatePermissionRequest>;
/**
 * An individual response from the permission backend.
 *
 * @remarks
 *
 * This response type is an alias of {@link PolicyDecision} to maintain separation between the
 * {@link @backstage/plugin-permission-node#PermissionPolicy} interface and the permission backend
 * api. They may diverge at some point in the future. The response
 *
 * @public
 */
declare type EvaluatePermissionResponse = PolicyDecision;
/**
 * A batch of responses from the permission backend.
 * @public
 */
declare type EvaluatePermissionResponseBatch = PermissionMessageBatch<EvaluatePermissionResponse>;
/**
 * Request object for {@link PermissionEvaluator.authorize}. If a {@link ResourcePermission}
 * is provided, it must include a corresponding `resourceRef`.
 * @public
 */
declare type AuthorizePermissionRequest = {
    permission: Exclude<Permission, ResourcePermission>;
    resourceRef?: never;
} | {
    permission: ResourcePermission;
    resourceRef: string;
};
/**
 * Response object for {@link PermissionEvaluator.authorize}.
 * @public
 */
declare type AuthorizePermissionResponse = DefinitivePolicyDecision;
/**
 * Request object for {@link PermissionEvaluator.authorizeConditional}.
 * @public
 */
declare type QueryPermissionRequest = {
    permission: ResourcePermission;
    resourceRef?: never;
};
/**
 * Response object for {@link PermissionEvaluator.authorizeConditional}.
 * @public
 */
declare type QueryPermissionResponse = PolicyDecision;
/**
 * A client interacting with the permission backend can implement this evaluator interface.
 *
 * @public
 */
interface PermissionEvaluator {
    /**
     * Evaluates {@link Permission | Permissions} and returns a definitive decision.
     */
    authorize(requests: AuthorizePermissionRequest[], options?: EvaluatorRequestOptions): Promise<AuthorizePermissionResponse[]>;
    /**
     * Evaluates {@link ResourcePermission | ResourcePermissions} and returns both definitive and
     * conditional decisions, depending on the configured
     * {@link @backstage/plugin-permission-node#PermissionPolicy}. This method is useful when the
     * caller needs more control over the processing of conditional decisions. For example, a plugin
     * backend may want to use {@link PermissionCriteria | conditions} in a database query instead of
     * evaluating each resource in memory.
     */
    authorizeConditional(requests: QueryPermissionRequest[], options?: EvaluatorRequestOptions): Promise<QueryPermissionResponse[]>;
}
/**
 * Options for {@link PermissionEvaluator} requests.
 * The Backstage identity token should be defined if available.
 * @public
 */
declare type EvaluatorRequestOptions = {
    token?: string;
};

/**
 * This is a copy of the core DiscoveryApi, to avoid importing core.
 *
 * @public
 */
declare type DiscoveryApi = {
    getBaseUrl(pluginId: string): Promise<string>;
};

/**
 * Check if the two parameters are equivalent permissions.
 * @public
 */
declare function isPermission<T extends Permission>(permission: Permission, comparedPermission: T): permission is T;
/**
 * Check if a given permission is a {@link ResourcePermission}. When
 * `resourceType` is supplied as the second parameter, also checks if
 * the permission has the specified resource type.
 * @public
 */
declare function isResourcePermission<T extends string = string>(permission: Permission, resourceType?: T): permission is ResourcePermission<T>;
/**
 * Check if a given permission is related to a create action.
 * @public
 */
declare function isCreatePermission(permission: Permission): boolean;
/**
 * Check if a given permission is related to a read action.
 * @public
 */
declare function isReadPermission(permission: Permission): boolean;
/**
 * Check if a given permission is related to an update action.
 * @public
 */
declare function isUpdatePermission(permission: Permission): boolean;
/**
 * Check if a given permission is related to a delete action.
 * @public
 */
declare function isDeletePermission(permission: Permission): boolean;
/**
 * Convert {@link PermissionAuthorizer} to {@link PermissionEvaluator}.
 *
 * @public
 */
declare function toPermissionEvaluator(permissionAuthorizer: PermissionAuthorizer): PermissionEvaluator;

/**
 * Utility function for creating a valid {@link ResourcePermission}, inferring
 * the appropriate type and resource type parameter.
 *
 * @public
 */
declare function createPermission<TResourceType extends string>(input: {
    name: string;
    attributes: PermissionAttributes;
    resourceType: TResourceType;
}): ResourcePermission<TResourceType>;
/**
 * Utility function for creating a valid {@link BasicPermission}.
 *
 * @public
 */
declare function createPermission(input: {
    name: string;
    attributes: PermissionAttributes;
}): BasicPermission;

/**
 * An isomorphic client for requesting authorization for Backstage permissions.
 * @public
 */
declare class PermissionClient implements PermissionEvaluator {
    private readonly enabled;
    private readonly discovery;
    constructor(options: {
        discovery: DiscoveryApi;
        config: Config;
    });
    /**
     * {@inheritdoc PermissionEvaluator.authorize}
     */
    authorize(requests: AuthorizePermissionRequest[], options?: EvaluatorRequestOptions): Promise<AuthorizePermissionResponse[]>;
    /**
     * {@inheritdoc PermissionEvaluator.authorizeConditional}
     */
    authorizeConditional(queries: QueryPermissionRequest[], options?: EvaluatorRequestOptions): Promise<QueryPermissionResponse[]>;
    private makeRequest;
    private getAuthorizationHeader;
}

export { AllOfCriteria, AnyOfCriteria, AuthorizePermissionRequest, AuthorizePermissionResponse, AuthorizeRequestOptions, AuthorizeResult, BasicPermission, ConditionalPolicyDecision, DefinitivePolicyDecision, DiscoveryApi, EvaluatePermissionRequest, EvaluatePermissionRequestBatch, EvaluatePermissionResponse, EvaluatePermissionResponseBatch, EvaluatorRequestOptions, IdentifiedPermissionMessage, NotCriteria, Permission, PermissionAttributes, PermissionAuthorizer, PermissionBase, PermissionClient, PermissionCondition, PermissionCriteria, PermissionEvaluator, PermissionMessageBatch, PolicyDecision, QueryPermissionRequest, QueryPermissionResponse, ResourcePermission, createPermission, isCreatePermission, isDeletePermission, isPermission, isReadPermission, isResourcePermission, isUpdatePermission, toPermissionEvaluator };
