import { ComponentProps, ReactElement } from 'react';
import { Route } from 'react-router';
import { Permission, ResourcePermission, EvaluatePermissionRequest, EvaluatePermissionResponse, AuthorizePermissionRequest, AuthorizePermissionResponse } from '@backstage/plugin-permission-common';
import { ApiRef, DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';
import { Config } from '@backstage/config';

/**
 * Returns a React Router Route which only renders the element when authorized. If unauthorized, the Route will render a
 * NotFoundErrorPage (see {@link @backstage/core-app-api#AppComponents}).
 *
 * @public
 */
declare const PermissionedRoute: (props: ComponentProps<typeof Route> & {
    errorComponent?: ReactElement | null;
} & ({
    permission: Exclude<Permission, ResourcePermission>;
    resourceRef?: never;
} | {
    permission: ResourcePermission;
    resourceRef: string | undefined;
})) => JSX.Element;

/** @public */
declare type AsyncPermissionResult = {
    loading: boolean;
    allowed: boolean;
    error?: Error;
};
/**
 * React hook utility for authorization. Given either a non-resource
 * {@link @backstage/plugin-permission-common#Permission} or a
 * {@link @backstage/plugin-permission-common#ResourcePermission} and an
 * optional resourceRef, it will return whether or not access is allowed (for
 * the given resource, if resourceRef is provided). See
 * {@link @backstage/plugin-permission-common/PermissionClient#authorize} for
 * more details.
 *
 * The resourceRef field is optional to allow calling this hook with an
 * entity that might be loading asynchronously, but when resourceRef is not
 * supplied, the value of `allowed` will always be false.
 *
 * Note: This hook uses stale-while-revalidate to help avoid flicker in UI
 * elements that would be conditionally rendered based on the `allowed` result
 * of this hook.
 * @public
 */
declare function usePermission(input: {
    permission: Exclude<Permission, ResourcePermission>;
    resourceRef?: never;
} | {
    permission: ResourcePermission;
    resourceRef: string | undefined;
}): AsyncPermissionResult;

/**
 * This API is used by various frontend utilities that allow developers to implement authorization within their frontend
 * plugins. A plugin developer will likely not have to interact with this API or its implementations directly, but
 * rather with the aforementioned utility components/hooks.
 * @public
 */
declare type PermissionApi = {
    authorize(request: EvaluatePermissionRequest): Promise<EvaluatePermissionResponse>;
};
/**
 * A Backstage ApiRef for the Permission API. See https://backstage.io/docs/api/utility-apis for more information on
 * Backstage ApiRefs.
 * @public
 */
declare const permissionApiRef: ApiRef<PermissionApi>;

/**
 * The default implementation of the PermissionApi, which simply calls the authorize method of the given
 * {@link @backstage/plugin-permission-common#PermissionClient}.
 * @public
 */
declare class IdentityPermissionApi implements PermissionApi {
    private readonly permissionClient;
    private readonly identityApi;
    private constructor();
    static create(options: {
        config: Config;
        discovery: DiscoveryApi;
        identity: IdentityApi;
    }): IdentityPermissionApi;
    authorize(request: AuthorizePermissionRequest): Promise<AuthorizePermissionResponse>;
}

export { AsyncPermissionResult, IdentityPermissionApi, PermissionApi, PermissionedRoute, permissionApiRef, usePermission };
