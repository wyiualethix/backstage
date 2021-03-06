'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var catalogClient = require('@backstage/catalog-client');
var catalogModel = require('@backstage/catalog-model');
var errors = require('@backstage/errors');
var pluginTechdocsNode = require('@backstage/plugin-techdocs-node');
var router = require('express-promise-router');
var integration = require('@backstage/integration');
var fetch = require('node-fetch');
var pLimit = require('p-limit');
var stream = require('stream');
var winston = require('winston');
var fs = require('fs-extra');
var os = require('os');
var path = require('path');
var pluginCatalogCommon = require('@backstage/plugin-catalog-common');
var unescape = require('lodash/unescape');

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

var router__default = /*#__PURE__*/_interopDefaultLegacy(router);
var fetch__default = /*#__PURE__*/_interopDefaultLegacy(fetch);
var pLimit__default = /*#__PURE__*/_interopDefaultLegacy(pLimit);
var winston__namespace = /*#__PURE__*/_interopNamespace(winston);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var os__default = /*#__PURE__*/_interopDefaultLegacy(os);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var unescape__default = /*#__PURE__*/_interopDefaultLegacy(unescape);

const lastUpdatedRecord = {};
class BuildMetadataStorage {
  constructor(entityUid) {
    this.entityUid = entityUid;
    this.lastUpdatedRecord = lastUpdatedRecord;
  }
  setLastUpdated() {
    this.lastUpdatedRecord[this.entityUid] = Date.now();
  }
  getLastUpdated() {
    return this.lastUpdatedRecord[this.entityUid];
  }
}
const shouldCheckForUpdate = (entityUid) => {
  const lastUpdated = new BuildMetadataStorage(entityUid).getLastUpdated();
  if (lastUpdated) {
    if (Date.now() - lastUpdated < 60 * 1e3) {
      return false;
    }
  }
  return true;
};

class DocsBuilder {
  constructor({
    preparers,
    generators,
    publisher,
    entity,
    logger,
    config,
    scmIntegrations,
    logStream,
    cache
  }) {
    this.preparer = preparers.get(entity);
    this.generator = generators.get(entity);
    this.publisher = publisher;
    this.entity = entity;
    this.logger = logger;
    this.config = config;
    this.scmIntegrations = scmIntegrations;
    this.logStream = logStream;
    this.cache = cache;
  }
  async build() {
    var _a, _b;
    if (!this.entity.metadata.uid) {
      throw new Error("Trying to build documentation for entity not in software catalog");
    }
    this.logger.info(`Step 1 of 3: Preparing docs for entity ${catalogModel.stringifyEntityRef(this.entity)}`);
    let storedEtag;
    if (await this.publisher.hasDocsBeenGenerated(this.entity)) {
      try {
        storedEtag = (await this.publisher.fetchTechDocsMetadata({
          namespace: (_a = this.entity.metadata.namespace) != null ? _a : catalogModel.DEFAULT_NAMESPACE,
          kind: this.entity.kind,
          name: this.entity.metadata.name
        })).etag;
      } catch (err) {
        this.logger.warn(`Unable to read techdocs_metadata.json, proceeding with fresh build, error ${err}.`);
      }
    }
    let preparedDir;
    let newEtag;
    try {
      const preparerResponse = await this.preparer.prepare(this.entity, {
        etag: storedEtag,
        logger: this.logger
      });
      preparedDir = preparerResponse.preparedDir;
      newEtag = preparerResponse.etag;
    } catch (err) {
      if (errors.isError(err) && err.name === "NotModifiedError") {
        new BuildMetadataStorage(this.entity.metadata.uid).setLastUpdated();
        this.logger.debug(`Docs for ${catalogModel.stringifyEntityRef(this.entity)} are unmodified. Using cache, skipping generate and prepare`);
        return false;
      }
      throw err;
    }
    this.logger.info(`Prepare step completed for entity ${catalogModel.stringifyEntityRef(this.entity)}, stored at ${preparedDir}`);
    this.logger.info(`Step 2 of 3: Generating docs for entity ${catalogModel.stringifyEntityRef(this.entity)}`);
    const workingDir = this.config.getOptionalString("backend.workingDirectory");
    const tmpdirPath = workingDir || os__default["default"].tmpdir();
    const tmpdirResolvedPath = fs__default["default"].realpathSync(tmpdirPath);
    const outputDir = await fs__default["default"].mkdtemp(path__default["default"].join(tmpdirResolvedPath, "techdocs-tmp-"));
    const parsedLocationAnnotation = pluginTechdocsNode.getLocationForEntity(this.entity, this.scmIntegrations);
    await this.generator.run({
      inputDir: preparedDir,
      outputDir,
      parsedLocationAnnotation,
      etag: newEtag,
      logger: this.logger,
      logStream: this.logStream
    });
    if (this.preparer instanceof pluginTechdocsNode.UrlPreparer) {
      this.logger.debug(`Removing prepared directory ${preparedDir} since the site has been generated`);
      try {
        fs__default["default"].remove(preparedDir);
      } catch (error) {
        errors.assertError(error);
        this.logger.debug(`Error removing prepared directory ${error.message}`);
      }
    }
    this.logger.info(`Step 3 of 3: Publishing docs for entity ${catalogModel.stringifyEntityRef(this.entity)}`);
    const published = await this.publisher.publish({
      entity: this.entity,
      directory: outputDir
    });
    if (this.cache && published && ((_b = published == null ? void 0 : published.objects) == null ? void 0 : _b.length)) {
      this.logger.debug(`Invalidating ${published.objects.length} cache objects`);
      await this.cache.invalidateMultiple(published.objects);
    }
    try {
      fs__default["default"].remove(outputDir);
      this.logger.debug(`Removing generated directory ${outputDir} since the site has been published`);
    } catch (error) {
      errors.assertError(error);
      this.logger.debug(`Error removing generated directory ${error.message}`);
    }
    new BuildMetadataStorage(this.entity.metadata.uid).setLastUpdated();
    return true;
  }
}

class DocsSynchronizer {
  constructor({
    publisher,
    logger,
    buildLogTransport,
    config,
    scmIntegrations,
    cache
  }) {
    this.config = config;
    this.logger = logger;
    this.buildLogTransport = buildLogTransport;
    this.publisher = publisher;
    this.scmIntegrations = scmIntegrations;
    this.cache = cache;
    this.buildLimiter = pLimit__default["default"](10);
  }
  async doSync({
    responseHandler: { log, error, finish },
    entity,
    preparers,
    generators
  }) {
    const taskLogger = winston__namespace.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: winston__namespace.format.combine(winston__namespace.format.colorize(), winston__namespace.format.timestamp(), winston__namespace.format.simple()),
      defaultMeta: {}
    });
    const logStream = new stream.PassThrough();
    logStream.on("data", async (data) => {
      log(data.toString().trim());
    });
    taskLogger.add(new winston__namespace.transports.Stream({ stream: logStream }));
    taskLogger.add(this.buildLogTransport);
    if (!shouldCheckForUpdate(entity.metadata.uid)) {
      finish({ updated: false });
      return;
    }
    let foundDocs = false;
    try {
      const docsBuilder = new DocsBuilder({
        preparers,
        generators,
        publisher: this.publisher,
        logger: taskLogger,
        entity,
        config: this.config,
        scmIntegrations: this.scmIntegrations,
        logStream,
        cache: this.cache
      });
      const updated = await this.buildLimiter(() => docsBuilder.build());
      if (!updated) {
        finish({ updated: false });
        return;
      }
    } catch (e) {
      errors.assertError(e);
      const msg = `Failed to build the docs page: ${e.message}`;
      taskLogger.error(msg);
      this.logger.error(msg, e);
      error(e);
      return;
    }
    for (let attempt = 0; attempt < 5; attempt++) {
      if (await this.publisher.hasDocsBeenGenerated(entity)) {
        foundDocs = true;
        break;
      }
      await new Promise((r) => setTimeout(r, 1e3));
    }
    if (!foundDocs) {
      this.logger.error("Published files are taking longer to show up in storage. Something went wrong.");
      error(new errors.NotFoundError("Sorry! It took too long for the generated docs to show up in storage. Check back later."));
      return;
    }
    finish({ updated: true });
  }
  async doCacheSync({
    responseHandler: { finish },
    discovery,
    token,
    entity
  }) {
    var _a;
    if (!shouldCheckForUpdate(entity.metadata.uid) || !this.cache) {
      finish({ updated: false });
      return;
    }
    const baseUrl = await discovery.getBaseUrl("techdocs");
    const namespace = ((_a = entity.metadata) == null ? void 0 : _a.namespace) || catalogModel.DEFAULT_NAMESPACE;
    const kind = entity.kind;
    const name = entity.metadata.name;
    const legacyPathCasing = this.config.getOptionalBoolean("techdocs.legacyUseCaseSensitiveTripletPaths") || false;
    const tripletPath = `${namespace}/${kind}/${name}`;
    const entityTripletPath = `${legacyPathCasing ? tripletPath : tripletPath.toLocaleLowerCase("en-US")}`;
    try {
      const [sourceMetadata, cachedMetadata] = await Promise.all([
        this.publisher.fetchTechDocsMetadata({ namespace, kind, name }),
        fetch__default["default"](`${baseUrl}/static/docs/${entityTripletPath}/techdocs_metadata.json`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }).then((f) => f.json().catch(() => void 0))
      ]);
      if (sourceMetadata.build_timestamp !== cachedMetadata.build_timestamp) {
        const files = [
          .../* @__PURE__ */ new Set([
            ...sourceMetadata.files || [],
            ...cachedMetadata.files || []
          ])
        ].map((f) => `${entityTripletPath}/${f}`);
        await this.cache.invalidateMultiple(files);
        finish({ updated: true });
      } else {
        finish({ updated: false });
      }
    } catch (e) {
      errors.assertError(e);
      this.logger.error(`Error syncing cache for ${entityTripletPath}: ${e.message}`);
      finish({ updated: false });
    } finally {
      new BuildMetadataStorage(entity.metadata.uid).setLastUpdated();
    }
  }
}

const createCacheMiddleware = ({
  cache
}) => {
  const cacheMiddleware = router__default["default"]();
  cacheMiddleware.use(async (req, res, next) => {
    const socket = res.socket;
    const isCacheable = req.path.startsWith("/static/docs/");
    const isGetRequest = req.method === "GET";
    if (!isCacheable || !socket) {
      next();
      return;
    }
    const reqPath = decodeURI(req.path.match(/\/static\/docs\/(.*)$/)[1]);
    const realEnd = socket.end.bind(socket);
    const realWrite = socket.write.bind(socket);
    let writeToCache = true;
    const chunks = [];
    socket.write = (data, encoding, callback) => {
      chunks.push(Buffer.from(data));
      if (typeof encoding === "function") {
        return realWrite(data, encoding);
      }
      return realWrite(data, encoding, callback);
    };
    socket.on("close", async (hadError) => {
      const content = Buffer.concat(chunks);
      const head = content.toString("utf8", 0, 12);
      if (isGetRequest && writeToCache && !hadError && head.match(/HTTP\/\d\.\d 200/)) {
        await cache.set(reqPath, content);
      }
    });
    const cached = await cache.get(reqPath);
    if (cached) {
      writeToCache = false;
      realEnd(cached);
      return;
    }
    next();
  });
  return cacheMiddleware;
};

class CacheInvalidationError extends errors.CustomErrorBase {
}
class TechDocsCache {
  constructor({
    cache,
    logger,
    readTimeout
  }) {
    this.cache = cache;
    this.logger = logger;
    this.readTimeout = readTimeout;
  }
  static fromConfig(config, { cache, logger }) {
    const timeout = config.getOptionalNumber("techdocs.cache.readTimeout");
    const readTimeout = timeout === void 0 ? 1e3 : timeout;
    return new TechDocsCache({ cache, logger, readTimeout });
  }
  async get(path) {
    try {
      const response = await Promise.race([
        this.cache.get(path),
        new Promise((cancelAfter) => setTimeout(cancelAfter, this.readTimeout))
      ]);
      if (response !== void 0) {
        this.logger.debug(`Cache hit: ${path}`);
        return Buffer.from(response, "base64");
      }
      this.logger.debug(`Cache miss: ${path}`);
      return response;
    } catch (e) {
      errors.assertError(e);
      this.logger.warn(`Error getting cache entry ${path}: ${e.message}`);
      this.logger.debug(e.stack);
      return void 0;
    }
  }
  async set(path, data) {
    this.logger.debug(`Writing cache entry for ${path}`);
    this.cache.set(path, data.toString("base64")).catch((e) => this.logger.error("write error", e));
  }
  async invalidate(path) {
    return this.cache.delete(path);
  }
  async invalidateMultiple(paths) {
    const settled = await Promise.allSettled(paths.map((path) => this.cache.delete(path)));
    const rejected = settled.filter((s) => s.status === "rejected");
    if (rejected.length) {
      throw new CacheInvalidationError("TechDocs cache invalidation error", rejected);
    }
    return settled;
  }
}

class CachedEntityLoader {
  constructor({ catalog, cache }) {
    this.readTimeout = 1e3;
    this.catalog = catalog;
    this.cache = cache;
  }
  async load(entityRef, token) {
    const cacheKey = this.getCacheKey(entityRef, token);
    let result = await this.getFromCache(cacheKey);
    if (result) {
      return result;
    }
    result = await this.catalog.getEntityByRef(entityRef, { token });
    if (result) {
      this.cache.set(cacheKey, result, { ttl: 5e3 });
    }
    return result;
  }
  async getFromCache(key) {
    return await Promise.race([
      this.cache.get(key),
      new Promise((cancelAfter) => setTimeout(cancelAfter, this.readTimeout))
    ]);
  }
  getCacheKey(entityName, token) {
    const key = ["catalog", catalogModel.stringifyEntityRef(entityName)];
    if (token) {
      key.push(token);
    }
    return key.join(":");
  }
}

class DefaultDocsBuildStrategy {
  constructor(config) {
    this.config = config;
  }
  static fromConfig(config) {
    return new DefaultDocsBuildStrategy(config);
  }
  async shouldBuild(_) {
    return this.config.getString("techdocs.builder") === "local";
  }
}

function isOutOfTheBoxOption(opt) {
  return opt.preparers !== void 0;
}
async function createRouter(options) {
  var _a, _b;
  const router = router__default["default"]();
  const { publisher, config, logger, discovery } = options;
  const catalogClient$1 = new catalogClient.CatalogClient({ discoveryApi: discovery });
  const docsBuildStrategy = (_a = options.docsBuildStrategy) != null ? _a : DefaultDocsBuildStrategy.fromConfig(config);
  const buildLogTransport = (_b = options.buildLogTransport) != null ? _b : new winston__namespace.transports.Stream({ stream: new stream.PassThrough() });
  const entityLoader = new CachedEntityLoader({
    catalog: catalogClient$1,
    cache: options.cache.getClient()
  });
  let cache;
  const defaultTtl = config.getOptionalNumber("techdocs.cache.ttl");
  if (defaultTtl) {
    const cacheClient = options.cache.getClient({ defaultTtl });
    cache = TechDocsCache.fromConfig(config, { cache: cacheClient, logger });
  }
  const scmIntegrations = integration.ScmIntegrations.fromConfig(config);
  const docsSynchronizer = new DocsSynchronizer({
    publisher,
    logger,
    buildLogTransport,
    config,
    scmIntegrations,
    cache
  });
  router.get("/metadata/techdocs/:namespace/:kind/:name", async (req, res) => {
    const { kind, namespace, name } = req.params;
    const entityName = { kind, namespace, name };
    const token = getBearerToken(req.headers.authorization);
    const entity = await entityLoader.load(entityName, token);
    if (!entity) {
      throw new errors.NotFoundError(`Unable to get metadata for '${catalogModel.stringifyEntityRef(entityName)}'`);
    }
    try {
      const techdocsMetadata = await publisher.fetchTechDocsMetadata(entityName);
      res.json(techdocsMetadata);
    } catch (err) {
      logger.info(`Unable to get metadata for '${catalogModel.stringifyEntityRef(entityName)}' with error ${err}`);
      throw new errors.NotFoundError(`Unable to get metadata for '${catalogModel.stringifyEntityRef(entityName)}'`, err);
    }
  });
  router.get("/metadata/entity/:namespace/:kind/:name", async (req, res) => {
    const { kind, namespace, name } = req.params;
    const entityName = { kind, namespace, name };
    const token = getBearerToken(req.headers.authorization);
    const entity = await entityLoader.load(entityName, token);
    if (!entity) {
      throw new errors.NotFoundError(`Unable to get metadata for '${catalogModel.stringifyEntityRef(entityName)}'`);
    }
    try {
      const locationMetadata = pluginTechdocsNode.getLocationForEntity(entity, scmIntegrations);
      res.json({ ...entity, locationMetadata });
    } catch (err) {
      logger.info(`Unable to get metadata for '${catalogModel.stringifyEntityRef(entityName)}' with error ${err}`);
      throw new errors.NotFoundError(`Unable to get metadata for '${catalogModel.stringifyEntityRef(entityName)}'`, err);
    }
  });
  router.get("/sync/:namespace/:kind/:name", async (req, res) => {
    var _a2;
    const { kind, namespace, name } = req.params;
    const token = getBearerToken(req.headers.authorization);
    const entity = await entityLoader.load({ kind, namespace, name }, token);
    if (!((_a2 = entity == null ? void 0 : entity.metadata) == null ? void 0 : _a2.uid)) {
      throw new errors.NotFoundError("Entity metadata UID missing");
    }
    const responseHandler = createEventStream(res);
    const shouldBuild = await docsBuildStrategy.shouldBuild({ entity });
    if (!shouldBuild) {
      if (cache) {
        await docsSynchronizer.doCacheSync({
          responseHandler,
          discovery,
          token,
          entity
        });
        return;
      }
      responseHandler.finish({ updated: false });
      return;
    }
    if (isOutOfTheBoxOption(options)) {
      const { preparers, generators } = options;
      await docsSynchronizer.doSync({
        responseHandler,
        entity,
        preparers,
        generators
      });
      return;
    }
    responseHandler.error(new Error("Invalid configuration. docsBuildStrategy.shouldBuild returned 'true', but no 'preparer' was provided to the router initialization."));
  });
  if (config.getOptionalBoolean("permission.enabled")) {
    router.use("/static/docs/:namespace/:kind/:name", async (req, _res, next) => {
      const { kind, namespace, name } = req.params;
      const entityName = { kind, namespace, name };
      const token = getBearerToken(req.headers.authorization);
      const entity = await entityLoader.load(entityName, token);
      if (!entity) {
        throw new errors.NotFoundError(`Entity not found for ${catalogModel.stringifyEntityRef(entityName)}`);
      }
      next();
    });
  }
  if (cache) {
    router.use(createCacheMiddleware({ logger, cache }));
  }
  router.use("/static/docs", publisher.docsRouter());
  return router;
}
function getBearerToken(header) {
  var _a;
  return (_a = header == null ? void 0 : header.match(/(?:Bearer)\s+(\S+)/i)) == null ? void 0 : _a[1];
}
function createEventStream(res) {
  var _a;
  res.writeHead(200, {
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream"
  });
  (_a = res.socket) == null ? void 0 : _a.on("close", () => {
    res.end();
  });
  const send = (type, data) => {
    res.write(`event: ${type}
data: ${JSON.stringify(data)}

`);
    if (res.flush) {
      res.flush();
    }
  };
  return {
    log: (data) => {
      send("log", data);
    },
    error: (e) => {
      send("error", e.message);
      res.end();
    },
    finish: (result) => {
      send("finish", result);
      res.end();
    }
  };
}

class DefaultTechDocsCollatorFactory {
  constructor(options) {
    this.type = "techdocs";
    this.visibilityPermission = pluginCatalogCommon.catalogEntityReadPermission;
    var _a, _b;
    this.discovery = options.discovery;
    this.locationTemplate = options.locationTemplate || "/docs/:namespace/:kind/:name/:path";
    this.logger = options.logger;
    this.catalogClient = options.catalogClient || new catalogClient.CatalogClient({ discoveryApi: options.discovery });
    this.parallelismLimit = (_a = options.parallelismLimit) != null ? _a : 10;
    this.legacyPathCasing = (_b = options.legacyPathCasing) != null ? _b : false;
    this.tokenManager = options.tokenManager;
  }
  static fromConfig(config, options) {
    const legacyPathCasing = config.getOptionalBoolean("techdocs.legacyUseCaseSensitiveTripletPaths") || false;
    return new DefaultTechDocsCollatorFactory({ ...options, legacyPathCasing });
  }
  async getCollator() {
    return stream.Readable.from(this.execute());
  }
  async *execute() {
    const limit = pLimit__default["default"](this.parallelismLimit);
    const techDocsBaseUrl = await this.discovery.getBaseUrl("techdocs");
    const { token } = await this.tokenManager.getToken();
    let entitiesRetrieved = 0;
    let moreEntitiesToGet = true;
    const batchSize = this.parallelismLimit * 50;
    while (moreEntitiesToGet) {
      const entities = (await this.catalogClient.getEntities({
        filter: {
          "metadata.annotations.backstage.io/techdocs-ref": catalogClient.CATALOG_FILTER_EXISTS
        },
        fields: [
          "kind",
          "namespace",
          "metadata.annotations",
          "metadata.name",
          "metadata.title",
          "metadata.namespace",
          "spec.type",
          "spec.lifecycle",
          "relations"
        ],
        limit: batchSize,
        offset: entitiesRetrieved
      }, { token })).items;
      moreEntitiesToGet = entities.length === batchSize;
      entitiesRetrieved += entities.length;
      const docPromises = entities.filter((it) => {
        var _a, _b;
        return (_b = (_a = it.metadata) == null ? void 0 : _a.annotations) == null ? void 0 : _b["backstage.io/techdocs-ref"];
      }).map((entity) => limit(async () => {
        const entityInfo = DefaultTechDocsCollatorFactory.handleEntityInfoCasing(this.legacyPathCasing, {
          kind: entity.kind,
          namespace: entity.metadata.namespace || "default",
          name: entity.metadata.name
        });
        try {
          const searchIndexResponse = await fetch__default["default"](DefaultTechDocsCollatorFactory.constructDocsIndexUrl(techDocsBaseUrl, entityInfo), {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          const searchIndex = await Promise.race([
            searchIndexResponse.json(),
            new Promise((_resolve, reject) => {
              setTimeout(() => {
                reject("Could not parse JSON in 5 seconds.");
              }, 5e3);
            })
          ]);
          return searchIndex.docs.map((doc) => {
            var _a, _b, _c;
            return {
              title: unescape__default["default"](doc.title),
              text: unescape__default["default"](doc.text || ""),
              location: this.applyArgsToFormat(this.locationTemplate || "/docs/:namespace/:kind/:name/:path", {
                ...entityInfo,
                path: doc.location
              }),
              path: doc.location,
              ...entityInfo,
              entityTitle: entity.metadata.title,
              componentType: ((_b = (_a = entity.spec) == null ? void 0 : _a.type) == null ? void 0 : _b.toString()) || "other",
              lifecycle: ((_c = entity.spec) == null ? void 0 : _c.lifecycle) || "",
              owner: getSimpleEntityOwnerString$1(entity),
              authorization: {
                resourceRef: catalogModel.stringifyEntityRef(entity)
              }
            };
          });
        } catch (e) {
          this.logger.debug(`Failed to retrieve tech docs search index for entity ${entityInfo.namespace}/${entityInfo.kind}/${entityInfo.name}`, e);
          return [];
        }
      }));
      yield* (await Promise.all(docPromises)).flat();
    }
  }
  applyArgsToFormat(format, args) {
    let formatted = format;
    for (const [key, value] of Object.entries(args)) {
      formatted = formatted.replace(`:${key}`, value);
    }
    return formatted;
  }
  static constructDocsIndexUrl(techDocsBaseUrl, entityInfo) {
    return `${techDocsBaseUrl}/static/docs/${entityInfo.namespace}/${entityInfo.kind}/${entityInfo.name}/search/search_index.json`;
  }
  static handleEntityInfoCasing(legacyPaths, entityInfo) {
    return legacyPaths ? entityInfo : Object.entries(entityInfo).reduce((acc, [key, value]) => {
      return { ...acc, [key]: value.toLocaleLowerCase("en-US") };
    }, {});
  }
}
function getSimpleEntityOwnerString$1(entity) {
  if (entity.relations) {
    const owner = entity.relations.find((r) => r.type === catalogModel.RELATION_OWNED_BY);
    if (owner) {
      const { name } = catalogModel.parseEntityRef(owner.targetRef);
      return name;
    }
  }
  return "";
}

class DefaultTechDocsCollator {
  constructor(legacyPathCasing, options) {
    this.legacyPathCasing = legacyPathCasing;
    this.options = options;
    this.type = "techdocs";
    this.visibilityPermission = pluginCatalogCommon.catalogEntityReadPermission;
  }
  static fromConfig(config, options) {
    const legacyPathCasing = config.getOptionalBoolean("techdocs.legacyUseCaseSensitiveTripletPaths") || false;
    return new DefaultTechDocsCollator(legacyPathCasing, options);
  }
  async execute() {
    const {
      parallelismLimit,
      discovery,
      tokenManager,
      catalogClient: catalogClient$1,
      locationTemplate,
      logger
    } = this.options;
    const limit = pLimit__default["default"](parallelismLimit != null ? parallelismLimit : 10);
    const techDocsBaseUrl = await discovery.getBaseUrl("techdocs");
    const { token } = await tokenManager.getToken();
    const entities = await (catalogClient$1 != null ? catalogClient$1 : new catalogClient.CatalogClient({ discoveryApi: discovery })).getEntities({
      filter: {
        "metadata.annotations.backstage.io/techdocs-ref": catalogClient.CATALOG_FILTER_EXISTS
      },
      fields: [
        "kind",
        "namespace",
        "metadata.annotations",
        "metadata.name",
        "metadata.title",
        "metadata.namespace",
        "spec.type",
        "spec.lifecycle",
        "relations"
      ]
    }, { token });
    const docPromises = entities.items.map((entity) => limit(async () => {
      var _a;
      const entityInfo = DefaultTechDocsCollator.handleEntityInfoCasing((_a = this.legacyPathCasing) != null ? _a : false, {
        kind: entity.kind,
        namespace: entity.metadata.namespace || "default",
        name: entity.metadata.name
      });
      try {
        const searchIndexResponse = await fetch__default["default"](DefaultTechDocsCollator.constructDocsIndexUrl(techDocsBaseUrl, entityInfo), {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const searchIndex = await searchIndexResponse.json();
        return searchIndex.docs.map((doc) => {
          var _a2, _b, _c;
          return {
            title: unescape__default["default"](doc.title),
            text: unescape__default["default"](doc.text || ""),
            location: this.applyArgsToFormat(locationTemplate || "/docs/:namespace/:kind/:name/:path", {
              ...entityInfo,
              path: doc.location
            }),
            path: doc.location,
            ...entityInfo,
            entityTitle: entity.metadata.title,
            componentType: ((_b = (_a2 = entity.spec) == null ? void 0 : _a2.type) == null ? void 0 : _b.toString()) || "other",
            lifecycle: ((_c = entity.spec) == null ? void 0 : _c.lifecycle) || "",
            owner: getSimpleEntityOwnerString(entity),
            authorization: {
              resourceRef: catalogModel.stringifyEntityRef(entity)
            }
          };
        });
      } catch (e) {
        logger.debug(`Failed to retrieve tech docs search index for entity ${entityInfo.namespace}/${entityInfo.kind}/${entityInfo.name}`, e);
        return [];
      }
    }));
    return (await Promise.all(docPromises)).flat();
  }
  applyArgsToFormat(format, args) {
    let formatted = format;
    for (const [key, value] of Object.entries(args)) {
      formatted = formatted.replace(`:${key}`, value);
    }
    return formatted;
  }
  static constructDocsIndexUrl(techDocsBaseUrl, entityInfo) {
    return `${techDocsBaseUrl}/static/docs/${entityInfo.namespace}/${entityInfo.kind}/${entityInfo.name}/search/search_index.json`;
  }
  static handleEntityInfoCasing(legacyPaths, entityInfo) {
    return legacyPaths ? entityInfo : Object.entries(entityInfo).reduce((acc, [key, value]) => {
      return { ...acc, [key]: value.toLocaleLowerCase("en-US") };
    }, {});
  }
}
function getSimpleEntityOwnerString(entity) {
  if (entity.relations) {
    const owner = entity.relations.find((r) => r.type === catalogModel.RELATION_OWNED_BY);
    if (owner) {
      const { name } = catalogModel.parseEntityRef(owner.targetRef);
      return name;
    }
  }
  return "";
}

exports.DefaultTechDocsCollator = DefaultTechDocsCollator;
exports.DefaultTechDocsCollatorFactory = DefaultTechDocsCollatorFactory;
exports.createRouter = createRouter;
Object.keys(pluginTechdocsNode).forEach(function (k) {
  if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
    enumerable: true,
    get: function () { return pluginTechdocsNode[k]; }
  });
});
//# sourceMappingURL=index.cjs.js.map
