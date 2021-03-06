'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Router = require('express-promise-router');
var zod = require('zod');
var backendCommon = require('@backstage/backend-common');
var errors = require('@backstage/errors');
var pluginAuthNode = require('@backstage/plugin-auth-node');
var pluginPermissionCommon = require('@backstage/plugin-permission-common');
var lodash = require('lodash');
var qs = require('qs');
var DataLoader = require('dataloader');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var Router__default = /*#__PURE__*/_interopDefaultLegacy(Router);
var qs__default = /*#__PURE__*/_interopDefaultLegacy(qs);
var DataLoader__default = /*#__PURE__*/_interopDefaultLegacy(DataLoader);

function decodePageCursor(pageCursor) {
  if (!pageCursor) {
    return { page: 0 };
  }
  const page = Number(Buffer.from(pageCursor, "base64").toString("utf-8"));
  if (isNaN(page)) {
    throw new errors.InputError("Invalid page cursor");
  }
  if (page < 0) {
    throw new errors.InputError("Invalid page cursor");
  }
  return {
    page
  };
}
function encodePageCursor({ page }) {
  return Buffer.from(`${page}`, "utf-8").toString("base64");
}
class AuthorizedSearchEngine {
  constructor(searchEngine, types, permissions, config) {
    this.searchEngine = searchEngine;
    this.types = types;
    this.permissions = permissions;
    this.pageSize = 25;
    var _a;
    this.queryLatencyBudgetMs = (_a = config.getOptionalNumber("search.permissions.queryLatencyBudgetMs")) != null ? _a : 1e3;
  }
  setTranslator(translator) {
    this.searchEngine.setTranslator(translator);
  }
  async getIndexer(type) {
    return this.searchEngine.getIndexer(type);
  }
  async query(query, options) {
    const queryStartTime = Date.now();
    const conditionFetcher = new DataLoader__default["default"]((requests) => this.permissions.authorizeConditional(requests.slice(), options), {
      cacheKeyFn: ({ permission: { name } }) => name
    });
    const authorizer = new DataLoader__default["default"]((requests) => this.permissions.authorize(requests.slice(), options), {
      cacheKeyFn: ({ permission: { name }, resourceRef }) => qs__default["default"].stringify({ name, resourceRef })
    });
    const requestedTypes = query.types || Object.keys(this.types);
    const typeDecisions = lodash.zipObject(requestedTypes, await Promise.all(requestedTypes.map((type) => {
      var _a;
      const permission = (_a = this.types[type]) == null ? void 0 : _a.visibilityPermission;
      if (!permission) {
        return { result: pluginPermissionCommon.AuthorizeResult.ALLOW };
      }
      if (pluginPermissionCommon.isResourcePermission(permission)) {
        return conditionFetcher.load({ permission });
      }
      return authorizer.load({ permission });
    })));
    const authorizedTypes = requestedTypes.filter((type) => {
      var _a;
      return ((_a = typeDecisions[type]) == null ? void 0 : _a.result) !== pluginPermissionCommon.AuthorizeResult.DENY;
    });
    const resultByResultFilteringRequired = authorizedTypes.some((type) => {
      var _a;
      return ((_a = typeDecisions[type]) == null ? void 0 : _a.result) === pluginPermissionCommon.AuthorizeResult.CONDITIONAL;
    });
    if (!resultByResultFilteringRequired) {
      return this.searchEngine.query({ ...query, types: authorizedTypes }, options);
    }
    const { page } = decodePageCursor(query.pageCursor);
    const targetResults = (page + 1) * this.pageSize;
    let filteredResults = [];
    let nextPageCursor;
    let latencyBudgetExhausted = false;
    do {
      const nextPage = await this.searchEngine.query({ ...query, types: authorizedTypes, pageCursor: nextPageCursor }, options);
      filteredResults = filteredResults.concat(await this.filterResults(nextPage.results, typeDecisions, authorizer));
      nextPageCursor = nextPage.nextPageCursor;
      latencyBudgetExhausted = Date.now() - queryStartTime > this.queryLatencyBudgetMs;
    } while (nextPageCursor && filteredResults.length < targetResults && !latencyBudgetExhausted);
    return {
      results: filteredResults.slice(page * this.pageSize, (page + 1) * this.pageSize),
      previousPageCursor: page === 0 ? void 0 : encodePageCursor({ page: page - 1 }),
      nextPageCursor: !latencyBudgetExhausted && (nextPageCursor || filteredResults.length > targetResults) ? encodePageCursor({ page: page + 1 }) : void 0
    };
  }
  async filterResults(results, typeDecisions, authorizer) {
    return lodash.compact(await Promise.all(results.map((result) => {
      var _a, _b, _c;
      if (((_a = typeDecisions[result.type]) == null ? void 0 : _a.result) === pluginPermissionCommon.AuthorizeResult.ALLOW) {
        return result;
      }
      const permission = (_b = this.types[result.type]) == null ? void 0 : _b.visibilityPermission;
      const resourceRef = (_c = result.document.authorization) == null ? void 0 : _c.resourceRef;
      if (!permission || !resourceRef) {
        return result;
      }
      if (!pluginPermissionCommon.isResourcePermission(permission)) {
        throw new Error(`Unexpected conditional decision returned for non-resource permission "${permission.name}"`);
      }
      return authorizer.load({ permission, resourceRef }).then((decision) => decision.result === pluginPermissionCommon.AuthorizeResult.ALLOW ? result : void 0);
    })));
  }
}

const jsonObjectSchema = zod.z.lazy(() => {
  const jsonValueSchema = zod.z.lazy(() => zod.z.union([
    zod.z.string(),
    zod.z.number(),
    zod.z.boolean(),
    zod.z.null(),
    zod.z.array(jsonValueSchema),
    jsonObjectSchema
  ]));
  return zod.z.record(jsonValueSchema);
});
const allowedLocationProtocols = ["http:", "https:"];
async function createRouter(options) {
  const { engine: inputEngine, types, permissions, config, logger } = options;
  const requestSchema = zod.z.object({
    term: zod.z.string().default(""),
    filters: jsonObjectSchema.optional(),
    types: zod.z.array(zod.z.string().refine((type) => Object.keys(types).includes(type))).optional(),
    pageCursor: zod.z.string().optional()
  });
  let permissionEvaluator;
  if ("authorizeConditional" in permissions) {
    permissionEvaluator = permissions;
  } else {
    logger.warn("PermissionAuthorizer is deprecated. Please use an instance of PermissionEvaluator instead of PermissionAuthorizer in PluginEnvironment#permissions");
    permissionEvaluator = pluginPermissionCommon.toPermissionEvaluator(permissions);
  }
  const engine = config.getOptionalBoolean("permission.enabled") ? new AuthorizedSearchEngine(inputEngine, types, permissionEvaluator, config) : inputEngine;
  const filterResultSet = ({ results, ...resultSet }) => ({
    ...resultSet,
    results: results.filter((result) => {
      const protocol = new URL(result.document.location, "https://example.com").protocol;
      const isAllowed = allowedLocationProtocols.includes(protocol);
      if (!isAllowed) {
        logger.info(`Rejected search result for "${result.document.title}" as location protocol "${protocol}" is unsafe`);
      }
      return isAllowed;
    })
  });
  const toSearchResults = (resultSet) => ({
    ...resultSet,
    results: resultSet.results.map((result) => ({
      ...result,
      document: {
        ...result.document,
        authorization: void 0
      }
    }))
  });
  const router = Router__default["default"]();
  router.get("/query", async (req, res) => {
    var _a;
    const parseResult = requestSchema.safeParse(req.query);
    if (!parseResult.success) {
      throw new errors.InputError(`Invalid query string: ${parseResult.error}`);
    }
    const query = parseResult.data;
    logger.info(`Search request received: term="${query.term}", filters=${JSON.stringify(query.filters)}, types=${query.types ? query.types.join(",") : ""}, pageCursor=${(_a = query.pageCursor) != null ? _a : ""}`);
    const token = pluginAuthNode.getBearerTokenFromAuthorizationHeader(req.header("authorization"));
    try {
      const resultSet = await (engine == null ? void 0 : engine.query(query, { token }));
      res.send(filterResultSet(toSearchResults(resultSet)));
    } catch (err) {
      throw new Error(`There was a problem performing the search query. ${err}`);
    }
  });
  router.use(backendCommon.errorHandler());
  return router;
}

exports.createRouter = createRouter;
//# sourceMappingURL=index.cjs.js.map
