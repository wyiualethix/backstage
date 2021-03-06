'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var zod = require('zod');
var express = require('express');
var Router = require('express-promise-router');
var backendCommon = require('@backstage/backend-common');
var errors = require('@backstage/errors');
var pluginAuthNode = require('@backstage/plugin-auth-node');
var pluginPermissionCommon = require('@backstage/plugin-permission-common');
var fetch = require('node-fetch');
var lodash = require('lodash');
var DataLoader = require('dataloader');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var express__default = /*#__PURE__*/_interopDefaultLegacy(express);
var Router__default = /*#__PURE__*/_interopDefaultLegacy(Router);
var fetch__default = /*#__PURE__*/_interopDefaultLegacy(fetch);
var DataLoader__default = /*#__PURE__*/_interopDefaultLegacy(DataLoader);

const responseSchema = zod.z.object({
  items: zod.z.array(zod.z.object({
    id: zod.z.string(),
    result: zod.z.literal(pluginPermissionCommon.AuthorizeResult.ALLOW).or(zod.z.literal(pluginPermissionCommon.AuthorizeResult.DENY))
  }))
});
class PermissionIntegrationClient {
  constructor(options) {
    this.discovery = options.discovery;
  }
  async applyConditions(pluginId, decisions, authHeader) {
    const endpoint = `${await this.discovery.getBaseUrl(pluginId)}/.well-known/backstage/permissions/apply-conditions`;
    const response = await fetch__default["default"](endpoint, {
      method: "POST",
      body: JSON.stringify({
        items: decisions.map(({ id, resourceRef, resourceType, conditions }) => ({
          id,
          resourceRef,
          resourceType,
          conditions
        }))
      }),
      headers: {
        ...authHeader ? { authorization: authHeader } : {},
        "content-type": "application/json"
      }
    });
    if (!response.ok) {
      throw new Error(`Unexpected response from plugin upstream when applying conditions. Expected 200 but got ${response.status} - ${response.statusText}`);
    }
    const result = responseSchema.parse(await response.json());
    return result.items;
  }
}

const attributesSchema = zod.z.object({
  action: zod.z.union([
    zod.z.literal("create"),
    zod.z.literal("read"),
    zod.z.literal("update"),
    zod.z.literal("delete")
  ]).optional()
});
const permissionSchema = zod.z.union([
  zod.z.object({
    type: zod.z.literal("basic"),
    name: zod.z.string(),
    attributes: attributesSchema
  }),
  zod.z.object({
    type: zod.z.literal("resource"),
    name: zod.z.string(),
    attributes: attributesSchema,
    resourceType: zod.z.string()
  })
]);
const evaluatePermissionRequestSchema = zod.z.object({
  id: zod.z.string(),
  resourceRef: zod.z.string().optional(),
  permission: permissionSchema
});
const evaluatePermissionRequestBatchSchema = zod.z.object({
  items: zod.z.array(evaluatePermissionRequestSchema)
});
const handleRequest = async (requests, user, policy, permissionIntegrationClient, authHeader) => {
  const applyConditionsLoaderFor = lodash.memoize((pluginId) => {
    return new DataLoader__default["default"]((batch) => permissionIntegrationClient.applyConditions(pluginId, batch, authHeader));
  });
  return Promise.all(requests.map(({ id, resourceRef, ...request }) => policy.handle(request, user).then((decision) => {
    if (decision.result !== pluginPermissionCommon.AuthorizeResult.CONDITIONAL) {
      return {
        id,
        ...decision
      };
    }
    if (!pluginPermissionCommon.isResourcePermission(request.permission)) {
      throw new Error(`Conditional decision returned from permission policy for non-resource permission ${request.permission.name}`);
    }
    if (decision.resourceType !== request.permission.resourceType) {
      throw new Error(`Invalid resource conditions returned from permission policy for permission ${request.permission.name}`);
    }
    if (!resourceRef) {
      return {
        id,
        ...decision
      };
    }
    return applyConditionsLoaderFor(decision.pluginId).load({
      id,
      resourceRef,
      ...decision
    });
  })));
};
async function createRouter(options) {
  const { policy, discovery, identity, config, logger } = options;
  if (!config.getOptionalBoolean("permission.enabled")) {
    logger.warn("Permission backend started with permissions disabled. Enable permissions by setting permission.enabled=true.");
  }
  const permissionIntegrationClient = new PermissionIntegrationClient({
    discovery
  });
  const router = Router__default["default"]();
  router.use(express__default["default"].json());
  router.get("/health", (_, response) => {
    response.send({ status: "ok" });
  });
  router.post("/authorize", async (req, res) => {
    const token = pluginAuthNode.getBearerTokenFromAuthorizationHeader(req.header("authorization"));
    const user = token ? await identity.authenticate(token) : void 0;
    const parseResult = evaluatePermissionRequestBatchSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new errors.InputError(parseResult.error.toString());
    }
    const body = parseResult.data;
    res.json({
      items: await handleRequest(body.items, user, policy, permissionIntegrationClient, req.header("authorization"))
    });
  });
  router.use(backendCommon.errorHandler());
  return router;
}

exports.createRouter = createRouter;
//# sourceMappingURL=index.cjs.js.map
