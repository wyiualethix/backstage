'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var errors = require('@backstage/errors');
var fetch = require('cross-fetch');
var uuid = require('uuid');
var zod = require('zod');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var fetch__default = /*#__PURE__*/_interopDefaultLegacy(fetch);
var uuid__namespace = /*#__PURE__*/_interopNamespace(uuid);

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

const permissionCriteriaSchema = zod.z.lazy(() => zod.z.object({
  rule: zod.z.string(),
  resourceType: zod.z.string(),
  params: zod.z.array(zod.z.unknown())
}).or(zod.z.object({ anyOf: zod.z.array(permissionCriteriaSchema).nonempty() })).or(zod.z.object({ allOf: zod.z.array(permissionCriteriaSchema).nonempty() })).or(zod.z.object({ not: permissionCriteriaSchema })));
const authorizePermissionResponseSchema = zod.z.object({
  result: zod.z.literal(AuthorizeResult.ALLOW).or(zod.z.literal(AuthorizeResult.DENY))
});
const queryPermissionResponseSchema = zod.z.union([
  zod.z.object({
    result: zod.z.literal(AuthorizeResult.ALLOW).or(zod.z.literal(AuthorizeResult.DENY))
  }),
  zod.z.object({
    result: zod.z.literal(AuthorizeResult.CONDITIONAL),
    pluginId: zod.z.string(),
    resourceType: zod.z.string(),
    conditions: permissionCriteriaSchema
  })
]);
const responseSchema = (itemSchema, ids) => zod.z.object({
  items: zod.z.array(zod.z.intersection(zod.z.object({
    id: zod.z.string()
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
        id: uuid__namespace.v4(),
        ...query
      }))
    };
    const permissionApi = await this.discovery.getBaseUrl("permission");
    const response = await fetch__default["default"](`${permissionApi}/authorize`, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        ...this.getAuthorizationHeader(options == null ? void 0 : options.token),
        "content-type": "application/json"
      }
    });
    if (!response.ok) {
      throw await errors.ResponseError.fromResponse(response);
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

exports.AuthorizeResult = AuthorizeResult;
exports.PermissionClient = PermissionClient;
exports.createPermission = createPermission;
exports.isCreatePermission = isCreatePermission;
exports.isDeletePermission = isDeletePermission;
exports.isPermission = isPermission;
exports.isReadPermission = isReadPermission;
exports.isResourcePermission = isResourcePermission;
exports.isUpdatePermission = isUpdatePermission;
exports.toPermissionEvaluator = toPermissionEvaluator;
//# sourceMappingURL=index.cjs.js.map
