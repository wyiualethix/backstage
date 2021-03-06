import { ResponseError } from '@backstage/errors';
import fetch from 'cross-fetch';
import * as uuid from 'uuid';
import { z } from 'zod';

var AuthorizeResult = /* @__PURE__ */ ((AuthorizeResult2) => {
  AuthorizeResult2["DENY"] = "DENY";
  AuthorizeResult2["ALLOW"] = "ALLOW";
  AuthorizeResult2["CONDITIONAL"] = "CONDITIONAL";
  return AuthorizeResult2;
})(AuthorizeResult || {});

function isPermission(permission, comparedPermission) {
  return permission.name === comparedPermission.name;
}
function isResourcePermission(permission, resourceType) {
  if (!("resourceType" in permission)) {
    return false;
  }
  return !resourceType || permission.resourceType === resourceType;
}
function isCreatePermission(permission) {
  return permission.attributes.action === "create";
}
function isReadPermission(permission) {
  return permission.attributes.action === "read";
}
function isUpdatePermission(permission) {
  return permission.attributes.action === "update";
}
function isDeletePermission(permission) {
  return permission.attributes.action === "delete";
}
function toPermissionEvaluator(permissionAuthorizer) {
  return {
    authorize: async (requests, options) => {
      const response = await permissionAuthorizer.authorize(requests, options);
      return response;
    },
    authorizeConditional(requests, options) {
      const parsedRequests = requests;
      return permissionAuthorizer.authorize(parsedRequests, options);
    }
  };
}

function createPermission({
  name,
  attributes,
  resourceType
}) {
  if (resourceType) {
    return {
      type: "resource",
      name,
      attributes,
      resourceType
    };
  }
  return {
    type: "basic",
    name,
    attributes
  };
}

const permissionCriteriaSchema = z.lazy(() => z.object({
  rule: z.string(),
  resourceType: z.string(),
  params: z.array(z.unknown())
}).or(z.object({ anyOf: z.array(permissionCriteriaSchema).nonempty() })).or(z.object({ allOf: z.array(permissionCriteriaSchema).nonempty() })).or(z.object({ not: permissionCriteriaSchema })));
const authorizePermissionResponseSchema = z.object({
  result: z.literal(AuthorizeResult.ALLOW).or(z.literal(AuthorizeResult.DENY))
});
const queryPermissionResponseSchema = z.union([
  z.object({
    result: z.literal(AuthorizeResult.ALLOW).or(z.literal(AuthorizeResult.DENY))
  }),
  z.object({
    result: z.literal(AuthorizeResult.CONDITIONAL),
    pluginId: z.string(),
    resourceType: z.string(),
    conditions: permissionCriteriaSchema
  })
]);
const responseSchema = (itemSchema, ids) => z.object({
  items: z.array(z.intersection(z.object({
    id: z.string()
  }), itemSchema)).refine((items) => items.length === ids.size && items.every(({ id }) => ids.has(id)), {
    message: "Items in response do not match request"
  })
});
class PermissionClient {
  constructor(options) {
    var _a;
    this.discovery = options.discovery;
    this.enabled = (_a = options.config.getOptionalBoolean("permission.enabled")) != null ? _a : false;
  }
  async authorize(requests, options) {
    return this.makeRequest(requests, authorizePermissionResponseSchema, options);
  }
  async authorizeConditional(queries, options) {
    return this.makeRequest(queries, queryPermissionResponseSchema, options);
  }
  async makeRequest(queries, itemSchema, options) {
    if (!this.enabled) {
      return queries.map((_) => ({ result: AuthorizeResult.ALLOW }));
    }
    const request = {
      items: queries.map((query) => ({
        id: uuid.v4(),
        ...query
      }))
    };
    const permissionApi = await this.discovery.getBaseUrl("permission");
    const response = await fetch(`${permissionApi}/authorize`, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        ...this.getAuthorizationHeader(options == null ? void 0 : options.token),
        "content-type": "application/json"
      }
    });
    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    const responseBody = await response.json();
    const parsedResponse = responseSchema(itemSchema, new Set(request.items.map(({ id }) => id))).parse(responseBody);
    const responsesById = parsedResponse.items.reduce((acc, r) => {
      acc[r.id] = r;
      return acc;
    }, {});
    return request.items.map((query) => responsesById[query.id]);
  }
  getAuthorizationHeader(token) {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export { AuthorizeResult, PermissionClient, createPermission, isCreatePermission, isDeletePermission, isPermission, isReadPermission, isResourcePermission, isUpdatePermission, toPermissionEvaluator };
//# sourceMappingURL=index.esm.js.map
