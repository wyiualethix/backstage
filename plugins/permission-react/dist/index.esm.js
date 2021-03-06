import React from 'react';
import { Route } from 'react-router';
import { createApiRef, useApi, useApp } from '@backstage/core-plugin-api';
import { PermissionClient, isResourcePermission, AuthorizeResult } from '@backstage/plugin-permission-common';
import useSWR from 'swr';

const permissionApiRef = createApiRef({
  id: "plugin.permission.api"
});

class IdentityPermissionApi {
  constructor(permissionClient, identityApi) {
    this.permissionClient = permissionClient;
    this.identityApi = identityApi;
  }
  static create(options) {
    const { config, discovery, identity } = options;
    const permissionClient = new PermissionClient({ discovery, config });
    return new IdentityPermissionApi(permissionClient, identity);
  }
  async authorize(request) {
    const response = await this.permissionClient.authorize([request], await this.identityApi.getCredentials());
    return response[0];
  }
}

function usePermission(input) {
  const permissionApi = useApi(permissionApiRef);
  const { data, error } = useSWR(input, async (args) => {
    if (isResourcePermission(args.permission) && !args.resourceRef) {
      return AuthorizeResult.DENY;
    }
    const { result } = await permissionApi.authorize(args);
    return result;
  });
  if (error) {
    return { error, loading: false, allowed: false };
  }
  if (data === void 0) {
    return { loading: true, allowed: false };
  }
  return { loading: false, allowed: data === AuthorizeResult.ALLOW };
}

const PermissionedRoute = (props) => {
  const { permission, resourceRef, errorComponent, ...otherProps } = props;
  const permissionResult = usePermission(isResourcePermission(permission) ? { permission, resourceRef } : { permission });
  const app = useApp();
  const { NotFoundErrorPage } = app.getComponents();
  let shownElement = errorComponent === void 0 ? /* @__PURE__ */ React.createElement(NotFoundErrorPage, null) : errorComponent;
  if (permissionResult.loading) {
    shownElement = null;
  } else if (permissionResult.allowed) {
    shownElement = props.element;
  }
  return /* @__PURE__ */ React.createElement(Route, {
    ...otherProps,
    element: shownElement
  });
};

export { IdentityPermissionApi, PermissionedRoute, permissionApiRef, usePermission };
//# sourceMappingURL=index.esm.js.map
