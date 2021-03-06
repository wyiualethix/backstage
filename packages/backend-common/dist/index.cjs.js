'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Keyv = require('keyv');
var KeyvMemcache = require('keyv-memcache');
var KeyvRedis = require('@keyv/redis');
var winston = require('winston');
var lodash = require('lodash');
var crypto = require('crypto');
var platformPath = require('path');
var parseArgs = require('minimist');
var cliCommon = require('@backstage/cli-common');
var configLoader = require('@backstage/config-loader');
var config = require('@backstage/config');
var getPackages = require('@manypkg/get-packages');
var nodeAbortController = require('node-abort-controller');
var errors = require('@backstage/errors');
var knexFactory = require('knex');
var yn = require('yn');
var fs = require('fs-extra');
var minimatch = require('minimatch');
var compression = require('compression');
var cors = require('cors');
var express = require('express');
var helmet = require('helmet');
var stoppable = require('stoppable');
var morgan = require('morgan');
var http = require('http');
var https = require('https');
var integration = require('@backstage/integration');
var fetch = require('node-fetch');
var getRawBody = require('raw-body');
var stream = require('stream');
var parseGitUrl = require('git-url-parse');
var git = require('isomorphic-git');
var http$1 = require('isomorphic-git/http/node');
var base64Stream = require('base64-stream');
var concatStream = require('concat-stream');
var os = require('os');
var tar = require('tar');
var util = require('util');
var aws = require('aws-sdk');
var archiver = require('archiver');
var unzipper = require('unzipper');
var storage = require('@google-cloud/storage');
var Router = require('express-promise-router');
var jose = require('jose');
var luxon = require('luxon');

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

var Keyv__default = /*#__PURE__*/_interopDefaultLegacy(Keyv);
var KeyvMemcache__default = /*#__PURE__*/_interopDefaultLegacy(KeyvMemcache);
var KeyvRedis__default = /*#__PURE__*/_interopDefaultLegacy(KeyvRedis);
var winston__namespace = /*#__PURE__*/_interopNamespace(winston);
var platformPath__default = /*#__PURE__*/_interopDefaultLegacy(platformPath);
var parseArgs__default = /*#__PURE__*/_interopDefaultLegacy(parseArgs);
var knexFactory__default = /*#__PURE__*/_interopDefaultLegacy(knexFactory);
var yn__default = /*#__PURE__*/_interopDefaultLegacy(yn);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var compression__default = /*#__PURE__*/_interopDefaultLegacy(compression);
var cors__default = /*#__PURE__*/_interopDefaultLegacy(cors);
var express__default = /*#__PURE__*/_interopDefaultLegacy(express);
var helmet__default = /*#__PURE__*/_interopDefaultLegacy(helmet);
var stoppable__default = /*#__PURE__*/_interopDefaultLegacy(stoppable);
var morgan__default = /*#__PURE__*/_interopDefaultLegacy(morgan);
var http__namespace = /*#__PURE__*/_interopNamespace(http);
var https__namespace = /*#__PURE__*/_interopNamespace(https);
var fetch__default = /*#__PURE__*/_interopDefaultLegacy(fetch);
var getRawBody__default = /*#__PURE__*/_interopDefaultLegacy(getRawBody);
var parseGitUrl__default = /*#__PURE__*/_interopDefaultLegacy(parseGitUrl);
var git__default = /*#__PURE__*/_interopDefaultLegacy(git);
var http__default = /*#__PURE__*/_interopDefaultLegacy(http$1);
var concatStream__default = /*#__PURE__*/_interopDefaultLegacy(concatStream);
var os__default = /*#__PURE__*/_interopDefaultLegacy(os);
var tar__default = /*#__PURE__*/_interopDefaultLegacy(tar);
var aws__default = /*#__PURE__*/_interopDefaultLegacy(aws);
var archiver__default = /*#__PURE__*/_interopDefaultLegacy(archiver);
var unzipper__default = /*#__PURE__*/_interopDefaultLegacy(unzipper);
var Router__default = /*#__PURE__*/_interopDefaultLegacy(Router);

const coloredTemplate = (info) => {
  const { timestamp, level, message, plugin, service, ...fields } = info;
  const colorizer = winston__namespace.format.colorize();
  const prefix = plugin || service;
  const timestampColor = colorizer.colorize("timestamp", timestamp);
  const prefixColor = colorizer.colorize("prefix", prefix);
  const extraFields = Object.entries(fields).map(([key, value]) => `${colorizer.colorize("field", `${key}`)}=${value}`).join(" ");
  return `${timestampColor} ${prefixColor} ${level} ${message} ${extraFields}`;
};
const coloredFormat = winston__namespace.format.combine(winston__namespace.format.timestamp(), winston__namespace.format.colorize({
  colors: { timestamp: "dim", prefix: "blue", field: "cyan", debug: "grey" }
}), winston__namespace.format.printf(coloredTemplate));

const escapeRegExp = (text) => {
  return text.replace(/[.*+?^${}(\)|[\]\\]/g, "\\$&");
};

let rootLogger;
let redactionRegExp;
function getRootLogger() {
  return rootLogger;
}
function setRootLogger(newLogger) {
  rootLogger = newLogger;
}
function setRootLoggerRedactionList(redactionList) {
  const filtered = redactionList.filter((r) => r.length > 1);
  if (filtered.length) {
    redactionRegExp = new RegExp(`(${filtered.map(escapeRegExp).join("|")})`, "g");
  } else {
    redactionRegExp = void 0;
  }
}
function redactLogLine(info) {
  if (redactionRegExp && typeof info.message === "string") {
    info.message = info.message.replace(redactionRegExp, "[REDACTED]");
  }
  return info;
}
function createRootLogger(options = {}, env = process.env) {
  const logger = winston__namespace.createLogger(lodash.merge({
    level: env.LOG_LEVEL || "info",
    format: winston__namespace.format.combine(winston__namespace.format(redactLogLine)(), env.NODE_ENV === "production" ? winston__namespace.format.json() : coloredFormat),
    defaultMeta: {
      service: "backstage"
    },
    transports: [
      new winston__namespace.transports.Console({
        silent: env.JEST_WORKER_ID !== void 0 && !env.LOG_LEVEL
      })
    ]
  }, options));
  setRootLogger(logger);
  return logger;
}
rootLogger = createRootLogger();

function getVoidLogger() {
  return winston__namespace.createLogger({
    transports: [new winston__namespace.transports.Console({ silent: true })]
  });
}

class DefaultCacheClient {
  constructor({ client }) {
    this.client = client;
  }
  async get(key) {
    const k = this.getNormalizedKey(key);
    return await this.client.get(k);
  }
  async set(key, value, opts = {}) {
    const k = this.getNormalizedKey(key);
    await this.client.set(k, value, opts.ttl);
  }
  async delete(key) {
    const k = this.getNormalizedKey(key);
    await this.client.delete(k);
  }
  getNormalizedKey(candidateKey) {
    const wellFormedKey = Buffer.from(candidateKey).toString("base64");
    if (wellFormedKey.length < 200) {
      return wellFormedKey;
    }
    return crypto.createHash("md5").update(candidateKey).digest("base64");
  }
}

class NoStore extends Map {
  clear() {
    return;
  }
  delete(_key) {
    return false;
  }
  get(_key) {
    return;
  }
  has(_key) {
    return false;
  }
  set(_key, _value) {
    return this;
  }
}

class CacheManager {
  constructor(store, connectionString, logger, errorHandler) {
    this.storeFactories = {
      redis: this.getRedisClient,
      memcache: this.getMemcacheClient,
      memory: this.getMemoryClient,
      none: this.getNoneClient
    };
    this.memoryStore = /* @__PURE__ */ new Map();
    if (!this.storeFactories.hasOwnProperty(store)) {
      throw new Error(`Unknown cache store: ${store}`);
    }
    this.logger = logger;
    this.store = store;
    this.connection = connectionString;
    this.errorHandler = errorHandler;
  }
  static fromConfig(config, options = {}) {
    const store = config.getOptionalString("backend.cache.store") || "none";
    const connectionString = config.getOptionalString("backend.cache.connection") || "";
    const logger = (options.logger || getRootLogger()).child({
      type: "cacheManager"
    });
    return new CacheManager(store, connectionString, logger, options.onError);
  }
  forPlugin(pluginId) {
    return {
      getClient: (opts = {}) => {
        const concreteClient = this.getClientWithTtl(pluginId, opts.defaultTtl);
        concreteClient.on("error", (err) => {
          this.logger.error(err);
          if (typeof this.errorHandler === "function") {
            this.errorHandler(err);
          }
        });
        return new DefaultCacheClient({
          client: concreteClient
        });
      }
    };
  }
  getClientWithTtl(pluginId, ttl) {
    return this.storeFactories[this.store].call(this, pluginId, ttl);
  }
  getRedisClient(pluginId, defaultTtl) {
    return new Keyv__default["default"]({
      namespace: pluginId,
      ttl: defaultTtl,
      store: new KeyvRedis__default["default"](this.connection)
    });
  }
  getMemcacheClient(pluginId, defaultTtl) {
    return new Keyv__default["default"]({
      namespace: pluginId,
      ttl: defaultTtl,
      store: new KeyvMemcache__default["default"](this.connection)
    });
  }
  getMemoryClient(pluginId, defaultTtl) {
    return new Keyv__default["default"]({
      namespace: pluginId,
      ttl: defaultTtl,
      store: this.memoryStore
    });
  }
  getNoneClient(pluginId) {
    return new Keyv__default["default"]({
      namespace: pluginId,
      store: new NoStore()
    });
  }
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

const updateRedactionList = (schema, configs, logger) => {
  const secretAppConfigs = schema.process(configs, {
    visibility: ["secret"],
    ignoreSchemaErrors: true
  });
  const secretConfig = config.ConfigReader.fromConfigs(secretAppConfigs);
  const values = /* @__PURE__ */ new Set();
  const data = secretConfig.get();
  JSON.parse(JSON.stringify(data), (_, v) => typeof v === "string" && values.add(v));
  logger.info(`${values.size} secrets found in the config which will be redacted`);
  setRootLoggerRedactionList(Array.from(values));
};
class ObservableConfigProxy {
  constructor(logger, parent, parentKey) {
    this.logger = logger;
    this.parent = parent;
    this.parentKey = parentKey;
    this.config = new config.ConfigReader({});
    this.subscribers = [];
    if (parent && !parentKey) {
      throw new Error("parentKey is required if parent is set");
    }
  }
  setConfig(config) {
    if (this.parent) {
      throw new Error("immutable");
    }
    this.config = config;
    for (const subscriber of this.subscribers) {
      try {
        subscriber();
      } catch (error) {
        this.logger.error(`Config subscriber threw error, ${error}`);
      }
    }
  }
  subscribe(onChange) {
    if (this.parent) {
      return this.parent.subscribe(onChange);
    }
    this.subscribers.push(onChange);
    return {
      unsubscribe: () => {
        const index = this.subscribers.indexOf(onChange);
        if (index >= 0) {
          this.subscribers.splice(index, 1);
        }
      }
    };
  }
  select(required) {
    var _a;
    if (this.parent && this.parentKey) {
      if (required) {
        return this.parent.select(true).getConfig(this.parentKey);
      }
      return (_a = this.parent.select(false)) == null ? void 0 : _a.getOptionalConfig(this.parentKey);
    }
    return this.config;
  }
  has(key) {
    var _a, _b;
    return (_b = (_a = this.select(false)) == null ? void 0 : _a.has(key)) != null ? _b : false;
  }
  keys() {
    var _a, _b;
    return (_b = (_a = this.select(false)) == null ? void 0 : _a.keys()) != null ? _b : [];
  }
  get(key) {
    return this.select(true).get(key);
  }
  getOptional(key) {
    var _a;
    return (_a = this.select(false)) == null ? void 0 : _a.getOptional(key);
  }
  getConfig(key) {
    return new ObservableConfigProxy(this.logger, this, key);
  }
  getOptionalConfig(key) {
    var _a;
    if ((_a = this.select(false)) == null ? void 0 : _a.has(key)) {
      return new ObservableConfigProxy(this.logger, this, key);
    }
    return void 0;
  }
  getConfigArray(key) {
    return this.select(true).getConfigArray(key);
  }
  getOptionalConfigArray(key) {
    var _a;
    return (_a = this.select(false)) == null ? void 0 : _a.getOptionalConfigArray(key);
  }
  getNumber(key) {
    return this.select(true).getNumber(key);
  }
  getOptionalNumber(key) {
    var _a;
    return (_a = this.select(false)) == null ? void 0 : _a.getOptionalNumber(key);
  }
  getBoolean(key) {
    return this.select(true).getBoolean(key);
  }
  getOptionalBoolean(key) {
    var _a;
    return (_a = this.select(false)) == null ? void 0 : _a.getOptionalBoolean(key);
  }
  getString(key) {
    return this.select(true).getString(key);
  }
  getOptionalString(key) {
    var _a;
    return (_a = this.select(false)) == null ? void 0 : _a.getOptionalString(key);
  }
  getStringArray(key) {
    return this.select(true).getStringArray(key);
  }
  getOptionalStringArray(key) {
    var _a;
    return (_a = this.select(false)) == null ? void 0 : _a.getOptionalStringArray(key);
  }
}
let currentCancelFunc;
async function loadBackendConfig(options) {
  var _a;
  const args = parseArgs__default["default"](options.argv);
  const configTargets = [(_a = args.config) != null ? _a : []].flat().map((arg) => isValidUrl(arg) ? { url: arg } : { path: platformPath.resolve(arg) });
  const paths = cliCommon.findPaths(__dirname);
  const { packages } = await getPackages.getPackages(paths.targetDir);
  const schema = await configLoader.loadConfigSchema({
    dependencies: packages.map((p) => p.packageJson.name)
  });
  const config$1 = new ObservableConfigProxy(options.logger);
  const { appConfigs } = await configLoader.loadConfig({
    configRoot: paths.targetRoot,
    configTargets,
    remote: options.remote,
    watch: {
      onChange(newConfigs) {
        options.logger.info(`Reloaded config from ${newConfigs.map((c) => c.context).join(", ")}`);
        config$1.setConfig(config.ConfigReader.fromConfigs(newConfigs));
      },
      stopSignal: new Promise((resolve) => {
        if (currentCancelFunc) {
          currentCancelFunc();
        }
        currentCancelFunc = resolve;
        if (module.hot) {
          module.hot.addDisposeHandler(resolve);
        }
      })
    }
  });
  options.logger.info(`Loaded config from ${appConfigs.map((c) => c.context).join(", ")}`);
  config$1.setConfig(config.ConfigReader.fromConfigs(appConfigs));
  updateRedactionList(schema, appConfigs, options.logger);
  config$1.subscribe(() => updateRedactionList(schema, appConfigs, options.logger));
  return config$1;
}

class AbortContext {
  constructor(parent, abortSignal, deadline) {
    this.parent = parent;
    this.abortSignal = abortSignal;
    this.deadline = deadline;
  }
  static forTimeoutMillis(ctx, timeout) {
    const desiredDeadline = new Date(Date.now() + timeout);
    const actualDeadline = ctx.deadline && ctx.deadline < desiredDeadline ? ctx.deadline : desiredDeadline;
    if (ctx.abortSignal.aborted) {
      if (ctx.deadline && desiredDeadline === actualDeadline) {
        return ctx;
      }
      return new AbortContext(ctx, ctx.abortSignal, actualDeadline);
    }
    const controller = new nodeAbortController.AbortController();
    const timeoutHandle = setTimeout(abort, timeout);
    ctx.abortSignal.addEventListener("abort", abort);
    function abort() {
      ctx.abortSignal.removeEventListener("abort", abort);
      clearTimeout(timeoutHandle);
      controller.abort();
    }
    return new AbortContext(ctx, controller.signal, actualDeadline);
  }
  static forController(ctx, controller) {
    if (ctx.abortSignal.aborted) {
      return ctx;
    } else if (controller.signal.aborted) {
      return new AbortContext(ctx, controller.signal, ctx.deadline);
    }
    function abort() {
      ctx.abortSignal.removeEventListener("abort", abort);
      controller.abort();
    }
    ctx.abortSignal.addEventListener("abort", abort);
    return new AbortContext(ctx, controller.signal, ctx.deadline);
  }
  static forSignal(ctx, signal) {
    if (ctx.abortSignal.aborted) {
      return ctx;
    } else if (signal.aborted) {
      return new AbortContext(ctx, signal, ctx.deadline);
    }
    const controller = new nodeAbortController.AbortController();
    function abort() {
      ctx.abortSignal.removeEventListener("abort", abort);
      signal.removeEventListener("abort", abort);
      controller.abort();
    }
    ctx.abortSignal.addEventListener("abort", abort);
    signal.addEventListener("abort", abort);
    return new AbortContext(ctx, controller.signal, ctx.deadline);
  }
  value(key) {
    return this.parent.value(key);
  }
}

const dummyAbortSignal = Object.freeze({
  aborted: false,
  addEventListener() {
  },
  removeEventListener() {
  },
  dispatchEvent() {
    return true;
  },
  onabort: null
});
class RootContext {
  constructor() {
    this.abortSignal = dummyAbortSignal;
    this.deadline = void 0;
  }
  value(_key) {
    return void 0;
  }
}

class ValueContext {
  constructor(_parent, _key, _value) {
    this._parent = _parent;
    this._key = _key;
    this._value = _value;
  }
  static forConstantValue(ctx, key, value) {
    return new ValueContext(ctx, key, value);
  }
  get abortSignal() {
    return this._parent.abortSignal;
  }
  get deadline() {
    return this._parent.deadline;
  }
  value(key) {
    return key === this._key ? this._value : this._parent.value(key);
  }
}

class Contexts {
  static root() {
    return new RootContext();
  }
  static withAbort(parentCtx, source) {
    return "aborted" in source ? AbortContext.forSignal(parentCtx, source) : AbortContext.forController(parentCtx, source);
  }
  static withTimeoutDuration(parentCtx, timeout) {
    return AbortContext.forTimeoutMillis(parentCtx, timeout.as("milliseconds"));
  }
  static withTimeoutMillis(parentCtx, timeout) {
    return AbortContext.forTimeoutMillis(parentCtx, timeout);
  }
  static withValue(parentCtx, key, value) {
    const v = typeof value === "function" ? value(parentCtx.value(key)) : value;
    return ValueContext.forConstantValue(parentCtx, key, v);
  }
}

function mergeDatabaseConfig(config, ...overrides) {
  return lodash.merge({}, config, ...overrides);
}

function defaultNameOverride(name) {
  return {
    connection: {
      database: name
    }
  };
}

function createMysqlDatabaseClient(dbConfig, overrides) {
  const knexConfig = buildMysqlDatabaseConfig(dbConfig, overrides);
  const database = knexFactory__default["default"](knexConfig);
  return database;
}
function buildMysqlDatabaseConfig(dbConfig, overrides) {
  return mergeDatabaseConfig(dbConfig.get(), {
    connection: getMysqlConnectionConfig(dbConfig, !!overrides),
    useNullAsDefault: true
  }, overrides);
}
function getMysqlConnectionConfig(dbConfig, parseConnectionString) {
  const connection = dbConfig.get("connection");
  const isConnectionString = typeof connection === "string" || connection instanceof String;
  const autoParse = typeof parseConnectionString !== "boolean";
  const shouldParseConnectionString = autoParse ? isConnectionString : parseConnectionString && isConnectionString;
  return shouldParseConnectionString ? parseMysqlConnectionString(connection) : connection;
}
function parseMysqlConnectionString(connectionString) {
  try {
    const {
      protocol,
      username,
      password,
      port,
      hostname,
      pathname,
      searchParams
    } = new URL(connectionString);
    if (protocol !== "mysql:") {
      throw new Error(`Unknown protocol ${protocol}`);
    } else if (!username || !password) {
      throw new Error(`Missing username/password`);
    } else if (!pathname.match(/^\/[^/]+$/)) {
      throw new Error(`Expected single path segment`);
    }
    const result = {
      user: username,
      password,
      host: hostname,
      port: Number(port || 3306),
      database: decodeURIComponent(pathname.substr(1))
    };
    const ssl = searchParams.get("ssl");
    if (ssl) {
      result.ssl = ssl;
    }
    const debug = searchParams.get("debug");
    if (debug) {
      result.debug = yn__default["default"](debug);
    }
    return result;
  } catch (e) {
    throw new errors.InputError(`Error while parsing MySQL connection string, ${e}`, e);
  }
}
async function ensureMysqlDatabaseExists(dbConfig, ...databases) {
  const admin = createMysqlDatabaseClient(dbConfig, {
    connection: {
      database: null
    }
  });
  try {
    const ensureDatabase = async (database) => {
      await admin.raw(`CREATE DATABASE IF NOT EXISTS ??`, [database]);
    };
    await Promise.all(databases.map(ensureDatabase));
  } finally {
    await admin.destroy();
  }
}
const mysqlConnector = Object.freeze({
  createClient: createMysqlDatabaseClient,
  ensureDatabaseExists: ensureMysqlDatabaseExists,
  createNameOverride: defaultNameOverride,
  parseConnectionString: parseMysqlConnectionString
});

function defaultSchemaOverride(name) {
  return {
    searchPath: [name]
  };
}

function createPgDatabaseClient(dbConfig, overrides) {
  const knexConfig = buildPgDatabaseConfig(dbConfig, overrides);
  const database = knexFactory__default["default"](knexConfig);
  return database;
}
function buildPgDatabaseConfig(dbConfig, overrides) {
  return mergeDatabaseConfig(dbConfig.get(), {
    connection: getPgConnectionConfig(dbConfig, !!overrides),
    useNullAsDefault: true
  }, overrides);
}
function getPgConnectionConfig(dbConfig, parseConnectionString) {
  const connection = dbConfig.get("connection");
  const isConnectionString = typeof connection === "string" || connection instanceof String;
  const autoParse = typeof parseConnectionString !== "boolean";
  const shouldParseConnectionString = autoParse ? isConnectionString : parseConnectionString && isConnectionString;
  return shouldParseConnectionString ? parsePgConnectionString(connection) : connection;
}
function parsePgConnectionString(connectionString) {
  const parse = requirePgConnectionString();
  return parse(connectionString);
}
function requirePgConnectionString() {
  try {
    return require("pg-connection-string").parse;
  } catch (e) {
    throw new errors.ForwardedError("Postgres: Install 'pg-connection-string'", e);
  }
}
async function ensurePgDatabaseExists(dbConfig, ...databases) {
  const admin = createPgDatabaseClient(dbConfig, {
    connection: {
      database: "postgres"
    }
  });
  try {
    const ensureDatabase = async (database) => {
      const result = await admin.from("pg_database").where("datname", database).count();
      if (parseInt(result[0].count, 10) > 0) {
        return;
      }
      await admin.raw(`CREATE DATABASE ??`, [database]);
    };
    await Promise.all(databases.map(ensureDatabase));
  } finally {
    await admin.destroy();
  }
}
async function ensurePgSchemaExists(dbConfig, ...schemas) {
  const admin = createPgDatabaseClient(dbConfig);
  try {
    const ensureSchema = async (database) => {
      await admin.raw(`CREATE SCHEMA IF NOT EXISTS ??`, [database]);
    };
    await Promise.all(schemas.map(ensureSchema));
  } finally {
    await admin.destroy();
  }
}
const pgConnector = Object.freeze({
  createClient: createPgDatabaseClient,
  ensureDatabaseExists: ensurePgDatabaseExists,
  ensureSchemaExists: ensurePgSchemaExists,
  createNameOverride: defaultNameOverride,
  createSchemaOverride: defaultSchemaOverride,
  parseConnectionString: parsePgConnectionString
});

function createSqliteDatabaseClient(dbConfig, overrides) {
  const knexConfig = buildSqliteDatabaseConfig(dbConfig, overrides);
  if (knexConfig.connection.filename && knexConfig.connection.filename !== ":memory:") {
    const { filename } = knexConfig.connection;
    const directory = platformPath__default["default"].dirname(filename);
    fs.ensureDirSync(directory);
  }
  const database = knexFactory__default["default"](knexConfig);
  database.client.pool.on("createSuccess", (_eventId, resource) => {
    resource.run("PRAGMA foreign_keys = ON", () => {
    });
  });
  return database;
}
function buildSqliteDatabaseConfig(dbConfig, overrides) {
  const baseConfig = dbConfig.get();
  if (typeof baseConfig.connection === "string") {
    baseConfig.connection = { filename: baseConfig.connection };
  }
  if (overrides && typeof overrides.connection === "string") {
    overrides.connection = { filename: overrides.connection };
  }
  const config = mergeDatabaseConfig({
    connection: {}
  }, baseConfig, {
    useNullAsDefault: true
  }, overrides);
  return config;
}
function createSqliteNameOverride(name) {
  return {
    connection: parseSqliteConnectionString(name)
  };
}
function parseSqliteConnectionString(name) {
  return {
    filename: name
  };
}
const sqlite3Connector = Object.freeze({
  createClient: createSqliteDatabaseClient,
  createNameOverride: createSqliteNameOverride,
  parseConnectionString: parseSqliteConnectionString
});

const ConnectorMapping = {
  pg: pgConnector,
  "better-sqlite3": sqlite3Connector,
  sqlite3: sqlite3Connector,
  mysql: mysqlConnector,
  mysql2: mysqlConnector
};
function createDatabaseClient(dbConfig, overrides) {
  var _a, _b;
  const client = dbConfig.getString("client");
  return (_b = (_a = ConnectorMapping[client]) == null ? void 0 : _a.createClient(dbConfig, overrides)) != null ? _b : knexFactory__default["default"](mergeDatabaseConfig(dbConfig.get(), overrides));
}
async function ensureDatabaseExists(dbConfig, ...databases) {
  var _a, _b;
  const client = dbConfig.getString("client");
  return (_b = (_a = ConnectorMapping[client]) == null ? void 0 : _a.ensureDatabaseExists) == null ? void 0 : _b.call(_a, dbConfig, ...databases);
}
async function ensureSchemaExists(dbConfig, ...schemas) {
  var _a, _b;
  const client = dbConfig.getString("client");
  return await ((_b = (_a = ConnectorMapping[client]) == null ? void 0 : _a.ensureSchemaExists) == null ? void 0 : _b.call(_a, dbConfig, ...schemas));
}
function createNameOverride(client, name) {
  try {
    return ConnectorMapping[client].createNameOverride(name);
  } catch (e) {
    throw new errors.InputError(`Unable to create database name override for '${client}' connector`, e);
  }
}
function createSchemaOverride(client, name) {
  var _a, _b;
  try {
    return (_b = (_a = ConnectorMapping[client]) == null ? void 0 : _a.createSchemaOverride) == null ? void 0 : _b.call(_a, name);
  } catch (e) {
    throw new errors.InputError(`Unable to create database schema override for '${client}' connector`, e);
  }
}
function parseConnectionString(connectionString, client) {
  if (typeof client === "undefined" || client === null) {
    throw new errors.InputError("Database connection string client type auto-detection is not yet supported.");
  }
  try {
    return ConnectorMapping[client].parseConnectionString(connectionString);
  } catch (e) {
    throw new errors.InputError(`Unable to parse connection string for '${client}' connector`);
  }
}
function normalizeConnection(connection, client) {
  if (typeof connection === "undefined" || connection === null) {
    return {};
  }
  return typeof connection === "string" || connection instanceof String ? parseConnectionString(connection, client) : connection;
}

function pluginPath(pluginId) {
  return `plugin.${pluginId}`;
}
class DatabaseManager {
  constructor(config, prefix = "backstage_plugin_", options) {
    this.config = config;
    this.prefix = prefix;
    this.options = options;
  }
  static fromConfig(config, options) {
    const databaseConfig = config.getConfig("backend.database");
    return new DatabaseManager(databaseConfig, databaseConfig.getOptionalString("prefix"), options);
  }
  forPlugin(pluginId) {
    var _a;
    const _this = this;
    return {
      getClient() {
        return _this.getDatabase(pluginId);
      },
      migrations: {
        skip: false,
        ...(_a = _this.options) == null ? void 0 : _a.migrations
      }
    };
  }
  getDatabaseName(pluginId) {
    var _a;
    const connection = this.getConnectionConfig(pluginId);
    if (this.getClientType(pluginId).client.includes("sqlite3")) {
      const sqliteFilename = connection.filename;
      if (sqliteFilename === ":memory:") {
        return sqliteFilename;
      }
      const sqliteDirectory = (_a = connection.directory) != null ? _a : ".";
      return platformPath__default["default"].join(sqliteDirectory, sqliteFilename != null ? sqliteFilename : `${pluginId}.sqlite`);
    }
    const databaseName = connection == null ? void 0 : connection.database;
    if (this.getPluginDivisionModeConfig() === "schema") {
      return databaseName;
    }
    return databaseName != null ? databaseName : `${this.prefix}${pluginId}`;
  }
  getClientType(pluginId) {
    const pluginClient = this.config.getOptionalString(`${pluginPath(pluginId)}.client`);
    const baseClient = this.config.getString("client");
    const client = pluginClient != null ? pluginClient : baseClient;
    return {
      client,
      overridden: client !== baseClient
    };
  }
  getAdditionalKnexConfig(pluginId) {
    var _a, _b;
    const pluginConfig = (_a = this.config.getOptionalConfig(`${pluginPath(pluginId)}.knexConfig`)) == null ? void 0 : _a.get();
    const baseConfig = (_b = this.config.getOptionalConfig("knexConfig")) == null ? void 0 : _b.get();
    return lodash.merge(baseConfig, pluginConfig);
  }
  getEnsureExistsConfig(pluginId) {
    var _a, _b;
    const baseConfig = (_a = this.config.getOptionalBoolean("ensureExists")) != null ? _a : true;
    return (_b = this.config.getOptionalBoolean(`${pluginPath(pluginId)}.ensureExists`)) != null ? _b : baseConfig;
  }
  getPluginDivisionModeConfig() {
    var _a;
    return (_a = this.config.getOptionalString("pluginDivisionMode")) != null ? _a : "database";
  }
  getConnectionConfig(pluginId) {
    const { client, overridden } = this.getClientType(pluginId);
    let baseConnection = normalizeConnection(this.config.get("connection"), this.config.getString("client"));
    if (client.includes("sqlite3") && "filename" in baseConnection && baseConnection.filename !== ":memory:") {
      throw new Error("`connection.filename` is not supported for the base sqlite connection. Prefer `connection.directory` or provide a filename for the plugin connection instead.");
    }
    if (this.getPluginDivisionModeConfig() !== "schema") {
      baseConnection = lodash.omit(baseConnection, "database");
    }
    const connection = normalizeConnection(this.config.getOptional(`${pluginPath(pluginId)}.connection`), client);
    return {
      ...overridden ? {} : baseConnection,
      ...connection
    };
  }
  getConfigForPlugin(pluginId) {
    const { client } = this.getClientType(pluginId);
    return {
      ...this.getAdditionalKnexConfig(pluginId),
      client,
      connection: this.getConnectionConfig(pluginId)
    };
  }
  getSchemaOverrides(pluginId) {
    return createSchemaOverride(this.getClientType(pluginId).client, pluginId);
  }
  getDatabaseOverrides(pluginId) {
    const databaseName = this.getDatabaseName(pluginId);
    return databaseName ? createNameOverride(this.getClientType(pluginId).client, databaseName) : {};
  }
  async getDatabase(pluginId) {
    const pluginConfig = new config.ConfigReader(this.getConfigForPlugin(pluginId));
    const databaseName = this.getDatabaseName(pluginId);
    if (databaseName && this.getEnsureExistsConfig(pluginId)) {
      try {
        await ensureDatabaseExists(pluginConfig, databaseName);
      } catch (error) {
        throw new Error(`Failed to connect to the database to make sure that '${databaseName}' exists, ${error}`);
      }
    }
    let schemaOverrides;
    if (this.getPluginDivisionModeConfig() === "schema") {
      try {
        schemaOverrides = this.getSchemaOverrides(pluginId);
        await ensureSchemaExists(pluginConfig, pluginId);
      } catch (error) {
        throw new Error(`Failed to connect to the database to make sure that schema for plugin '${pluginId}' exists, ${error}`);
      }
    }
    const databaseClientOverrides = mergeDatabaseConfig({}, this.getDatabaseOverrides(pluginId), schemaOverrides);
    return createDatabaseClient(pluginConfig, databaseClientOverrides);
  }
}

function isDatabaseConflictError(e) {
  const message = e == null ? void 0 : e.message;
  return typeof message === "string" && (/SQLITE_CONSTRAINT(?:_UNIQUE)?: UNIQUE/.test(message) || /UNIQUE constraint failed:/.test(message) || /unique constraint/.test(message));
}

function readBaseOptions(config) {
  if (typeof config.get("listen") === "string") {
    const { host, port: port2 } = parseListenAddress(config.getString("listen"));
    return removeUnknown({
      listenPort: port2,
      listenHost: host
    });
  }
  const port = config.getOptional("listen.port");
  if (typeof port !== "undefined" && typeof port !== "number" && typeof port !== "string") {
    throw new Error(`Invalid type in config for key 'backend.listen.port', got ${typeof port}, wanted string or number`);
  }
  return removeUnknown({
    listenPort: port,
    listenHost: config.getOptionalString("listen.host"),
    baseUrl: config.getOptionalString("baseUrl")
  });
}
function readCorsOptions(config) {
  const cc = config.getOptionalConfig("cors");
  if (!cc) {
    return void 0;
  }
  return removeUnknown({
    origin: createCorsOriginMatcher(getOptionalStringOrStrings(cc, "origin")),
    methods: getOptionalStringOrStrings(cc, "methods"),
    allowedHeaders: getOptionalStringOrStrings(cc, "allowedHeaders"),
    exposedHeaders: getOptionalStringOrStrings(cc, "exposedHeaders"),
    credentials: cc.getOptionalBoolean("credentials"),
    maxAge: cc.getOptionalNumber("maxAge"),
    preflightContinue: cc.getOptionalBoolean("preflightContinue"),
    optionsSuccessStatus: cc.getOptionalNumber("optionsSuccessStatus")
  });
}
function readCspOptions(config) {
  const cc = config.getOptionalConfig("csp");
  if (!cc) {
    return void 0;
  }
  const result = {};
  for (const key of cc.keys()) {
    if (cc.get(key) === false) {
      result[key] = false;
    } else {
      result[key] = cc.getStringArray(key);
    }
  }
  return result;
}
function readHttpsSettings(config) {
  const https = config.getOptional("https");
  if (https === true) {
    const baseUrl = config.getString("baseUrl");
    let hostname;
    try {
      hostname = new URL(baseUrl).hostname;
    } catch (error) {
      throw new Error(`Invalid backend.baseUrl "${baseUrl}"`);
    }
    return { certificate: { hostname } };
  }
  const cc = config.getOptionalConfig("https");
  if (!cc) {
    return void 0;
  }
  const certificateConfig = cc.get("certificate");
  const cfg = {
    certificate: certificateConfig
  };
  return removeUnknown(cfg);
}
function getOptionalStringOrStrings(config, key) {
  const value = config.getOptional(key);
  if (value === void 0 || isStringOrStrings(value)) {
    return value;
  }
  throw new Error(`Expected string or array of strings, got ${typeof value}`);
}
function createCorsOriginMatcher(originValue) {
  var _a;
  if (originValue === void 0) {
    return originValue;
  }
  if (!isStringOrStrings(originValue)) {
    throw new Error(`Expected string or array of strings, got ${typeof originValue}`);
  }
  const allowedOrigin = typeof originValue === "string" ? [originValue] : originValue;
  const allowedOriginPatterns = (_a = allowedOrigin == null ? void 0 : allowedOrigin.map((pattern) => new minimatch.Minimatch(pattern, { nocase: true, noglobstar: true }))) != null ? _a : [];
  return (origin, callback) => {
    return callback(null, allowedOriginPatterns.some((pattern) => pattern.match(origin != null ? origin : "")));
  };
}
function isStringOrStrings(value) {
  return typeof value === "string" || isStringArray(value);
}
function isStringArray(value) {
  if (!Array.isArray(value)) {
    return false;
  }
  for (const v of value) {
    if (typeof v !== "string") {
      return false;
    }
  }
  return true;
}
function removeUnknown(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== void 0));
}
function parseListenAddress(value) {
  const parts = value.split(":");
  if (parts.length === 1) {
    return { port: parseInt(parts[0], 10) };
  }
  if (parts.length === 2) {
    return { host: parts[0], port: parseInt(parts[1], 10) };
  }
  throw new Error(`Unable to parse listen address ${value}, expected <port> or <host>:<port>`);
}

function findAllAncestors(_module) {
  const ancestors = new Array();
  const parentIds = /* @__PURE__ */ new Set();
  function add(id, m) {
    if (parentIds.has(id)) {
      return;
    }
    parentIds.add(id);
    ancestors.push(m);
    for (const parentId of m.parents) {
      const parent = require.cache[parentId];
      if (parent) {
        add(parentId, parent);
      }
    }
  }
  add(_module.id, _module);
  return ancestors;
}
function useHotCleanup(_module, cancelEffect) {
  var _a;
  if (_module.hot) {
    const ancestors = findAllAncestors(_module);
    let cancelled = false;
    const handler = () => {
      if (!cancelled) {
        cancelled = true;
        cancelEffect();
      }
    };
    for (const m of ancestors) {
      (_a = m.hot) == null ? void 0 : _a.addDisposeHandler(handler);
    }
  }
}
const CURRENT_HOT_MEMOIZE_INDEX_KEY = "backstage.io/hmr-memoize-key";
function useHotMemoize(_module, valueFactory) {
  var _a, _b, _c;
  if (!_module.hot) {
    return valueFactory();
  }
  if (!((_a = _module.hot.data) == null ? void 0 : _a[CURRENT_HOT_MEMOIZE_INDEX_KEY])) {
    for (const ancestor of findAllAncestors(_module)) {
      (_b = ancestor.hot) == null ? void 0 : _b.addDisposeHandler((data) => {
        data[CURRENT_HOT_MEMOIZE_INDEX_KEY] = 1;
      });
    }
    _module.hot.data = {
      ..._module.hot.data,
      [CURRENT_HOT_MEMOIZE_INDEX_KEY]: 1
    };
  }
  const index = _module.hot.data[CURRENT_HOT_MEMOIZE_INDEX_KEY]++;
  const value = (_c = _module.hot.data[index]) != null ? _c : valueFactory();
  _module.hot.addDisposeHandler((data) => {
    data[index] = value;
  });
  return value;
}

function errorHandler(options = {}) {
  var _a;
  const showStackTraces = (_a = options.showStackTraces) != null ? _a : process.env.NODE_ENV === "development";
  const logger = (options.logger || getRootLogger()).child({
    type: "errorHandler"
  });
  return (error, req, res, next) => {
    const statusCode = getStatusCode(error);
    if (options.logClientErrors || statusCode >= 500) {
      logger.error(error);
    }
    if (res.headersSent) {
      next(error);
      return;
    }
    const body = {
      error: errors.serializeError(error, { includeStack: showStackTraces }),
      request: { method: req.method, url: req.url },
      response: { statusCode }
    };
    res.status(statusCode).json(body);
  };
}
function getStatusCode(error) {
  const knownStatusCodeFields = ["statusCode", "status"];
  for (const field of knownStatusCodeFields) {
    const statusCode = error[field];
    if (typeof statusCode === "number" && (statusCode | 0) === statusCode && statusCode >= 100 && statusCode <= 599) {
      return statusCode;
    }
  }
  switch (error.name) {
    case errors.NotModifiedError.name:
      return 304;
    case errors.InputError.name:
      return 400;
    case errors.AuthenticationError.name:
      return 401;
    case errors.NotAllowedError.name:
      return 403;
    case errors.NotFoundError.name:
      return 404;
    case errors.ConflictError.name:
      return 409;
  }
  return 500;
}

function notFoundHandler() {
  return (_request, response, _next) => {
    response.status(404).send();
  };
}

function requestLoggingHandler(logger) {
  const actualLogger = (logger || getRootLogger()).child({
    type: "incomingRequest"
  });
  return morgan__default["default"]("combined", {
    stream: {
      write(message) {
        actualLogger.info(message.trimRight());
      }
    }
  });
}

async function statusCheckHandler(options = {}) {
  const statusCheck = options.statusCheck ? options.statusCheck : () => Promise.resolve({ status: "ok" });
  return async (_request, response, next) => {
    try {
      const status = await statusCheck();
      response.status(200).header("").send(status);
    } catch (err) {
      next(err);
    }
  };
}

const ALMOST_MONTH_IN_MS = 25 * 24 * 60 * 60 * 1e3;
const IP_HOSTNAME_REGEX = /:|^\d+\.\d+\.\d+\.\d+$/;
function createHttpServer(app, logger) {
  logger == null ? void 0 : logger.info("Initializing http server");
  return http__namespace.createServer(app);
}
async function createHttpsServer(app, httpsSettings, logger) {
  var _a, _b;
  logger == null ? void 0 : logger.info("Initializing https server");
  let credentials;
  if ("hostname" in (httpsSettings == null ? void 0 : httpsSettings.certificate)) {
    credentials = await getGeneratedCertificate(httpsSettings.certificate.hostname, logger);
  } else {
    logger == null ? void 0 : logger.info("Loading certificate from config");
    credentials = {
      key: (_a = httpsSettings == null ? void 0 : httpsSettings.certificate) == null ? void 0 : _a.key,
      cert: (_b = httpsSettings == null ? void 0 : httpsSettings.certificate) == null ? void 0 : _b.cert
    };
  }
  if (!credentials.key || !credentials.cert) {
    throw new Error("Invalid HTTPS credentials");
  }
  return https__namespace.createServer(credentials, app);
}
async function getGeneratedCertificate(hostname, logger) {
  const hasModules = await fs__default["default"].pathExists("node_modules");
  let certPath;
  if (hasModules) {
    certPath = platformPath.resolve("node_modules/.cache/backstage-backend/dev-cert.pem");
    await fs__default["default"].ensureDir(platformPath.dirname(certPath));
  } else {
    certPath = platformPath.resolve(".dev-cert.pem");
  }
  let cert = void 0;
  if (await fs__default["default"].pathExists(certPath)) {
    const stat = await fs__default["default"].stat(certPath);
    const ageMs = Date.now() - stat.ctimeMs;
    if (stat.isFile() && ageMs < ALMOST_MONTH_IN_MS) {
      cert = await fs__default["default"].readFile(certPath);
    }
  }
  if (cert) {
    logger == null ? void 0 : logger.info("Using existing self-signed certificate");
    return {
      key: cert,
      cert
    };
  }
  logger == null ? void 0 : logger.info("Generating new self-signed certificate");
  const newCert = await createCertificate(hostname);
  await fs__default["default"].writeFile(certPath, newCert.cert + newCert.key, "utf8");
  return newCert;
}
async function createCertificate(hostname) {
  const attributes = [
    {
      name: "commonName",
      value: "dev-cert"
    }
  ];
  const sans = [
    {
      type: 2,
      value: "localhost"
    },
    {
      type: 2,
      value: "localhost.localdomain"
    },
    {
      type: 2,
      value: "[::1]"
    },
    {
      type: 7,
      ip: "127.0.0.1"
    },
    {
      type: 7,
      ip: "fe80::1"
    }
  ];
  if (!sans.find(({ value, ip }) => value === hostname || ip === hostname)) {
    sans.push(IP_HOSTNAME_REGEX.test(hostname) ? {
      type: 7,
      ip: hostname
    } : {
      type: 2,
      value: hostname
    });
  }
  const params = {
    algorithm: "sha256",
    keySize: 2048,
    days: 30,
    extensions: [
      {
        name: "keyUsage",
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true
      },
      {
        name: "extKeyUsage",
        serverAuth: true,
        clientAuth: true,
        codeSigning: true,
        timeStamping: true
      },
      {
        name: "subjectAltName",
        altNames: sans
      }
    ]
  };
  return new Promise((resolve, reject) => require("selfsigned").generate(attributes, params, (err, bundle) => {
    if (err) {
      reject(err);
    } else {
      resolve({ key: bundle.private, cert: bundle.cert });
    }
  }));
}

const DEFAULT_PORT = 7007;
const DEFAULT_HOST = "";
class ServiceBuilderImpl {
  constructor(moduleRef) {
    this.routers = [];
    this.module = moduleRef;
    this.useDefaultErrorHandler = true;
  }
  loadConfig(config) {
    const backendConfig = config.getOptionalConfig("backend");
    if (!backendConfig) {
      return this;
    }
    const baseOptions = readBaseOptions(backendConfig);
    if (baseOptions.listenPort) {
      this.port = typeof baseOptions.listenPort === "string" ? parseInt(baseOptions.listenPort, 10) : baseOptions.listenPort;
    }
    if (baseOptions.listenHost) {
      this.host = baseOptions.listenHost;
    }
    const corsOptions = readCorsOptions(backendConfig);
    if (corsOptions) {
      this.corsOptions = corsOptions;
    }
    const cspOptions = readCspOptions(backendConfig);
    if (cspOptions) {
      this.cspOptions = cspOptions;
    }
    const httpsSettings = readHttpsSettings(backendConfig);
    if (httpsSettings) {
      this.httpsSettings = httpsSettings;
    }
    return this;
  }
  setPort(port) {
    this.port = port;
    return this;
  }
  setHost(host) {
    this.host = host;
    return this;
  }
  setLogger(logger) {
    this.logger = logger;
    return this;
  }
  setHttpsSettings(settings) {
    this.httpsSettings = settings;
    return this;
  }
  enableCors(options) {
    this.corsOptions = options;
    return this;
  }
  setCsp(options) {
    this.cspOptions = options;
    return this;
  }
  addRouter(root, router) {
    this.routers.push([root, router]);
    return this;
  }
  setRequestLoggingHandler(requestLoggingHandler) {
    this.requestLoggingHandler = requestLoggingHandler;
    return this;
  }
  setErrorHandler(errorHandler) {
    this.errorHandler = errorHandler;
    return this;
  }
  disableDefaultErrorHandler() {
    this.useDefaultErrorHandler = false;
    return this;
  }
  async start() {
    var _a;
    const app = express__default["default"]();
    const { port, host, logger, corsOptions, httpsSettings, helmetOptions } = this.getOptions();
    app.use(helmet__default["default"](helmetOptions));
    if (corsOptions) {
      app.use(cors__default["default"](corsOptions));
    }
    app.use(compression__default["default"]());
    app.use(((_a = this.requestLoggingHandler) != null ? _a : requestLoggingHandler)(logger));
    for (const [root, route] of this.routers) {
      app.use(root, route);
    }
    app.use(notFoundHandler());
    if (this.errorHandler) {
      app.use(this.errorHandler);
    }
    if (this.useDefaultErrorHandler) {
      app.use(errorHandler());
    }
    const server = httpsSettings ? await createHttpsServer(app, httpsSettings, logger) : createHttpServer(app, logger);
    const stoppableServer = stoppable__default["default"](server, 0);
    useHotCleanup(this.module, () => stoppableServer.stop((e) => {
      if (e)
        console.error(e);
    }));
    return new Promise((resolve, reject) => {
      function handleStartupError(e) {
        server.close();
        reject(e);
      }
      server.on("error", handleStartupError);
      server.listen(port, host, () => {
        server.off("error", handleStartupError);
        logger.info(`Listening on ${host}:${port}`);
        resolve(stoppableServer);
      });
    });
  }
  getOptions() {
    var _a, _b, _c;
    return {
      port: (_a = this.port) != null ? _a : DEFAULT_PORT,
      host: (_b = this.host) != null ? _b : DEFAULT_HOST,
      logger: (_c = this.logger) != null ? _c : getRootLogger(),
      corsOptions: this.corsOptions,
      httpsSettings: this.httpsSettings,
      helmetOptions: {
        contentSecurityPolicy: {
          useDefaults: false,
          directives: applyCspDirectives(this.cspOptions)
        },
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
        crossOriginResourcePolicy: false,
        originAgentCluster: false
      }
    };
  }
}
function applyCspDirectives(directives) {
  const result = helmet__default["default"].contentSecurityPolicy.getDefaultDirectives();
  result["script-src"] = ["'self'", "'unsafe-eval'"];
  delete result["form-action"];
  if (directives) {
    for (const [key, value] of Object.entries(directives)) {
      if (value === false) {
        delete result[key];
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

class SingleHostDiscovery {
  constructor(internalBaseUrl, externalBaseUrl) {
    this.internalBaseUrl = internalBaseUrl;
    this.externalBaseUrl = externalBaseUrl;
  }
  static fromConfig(config, options) {
    var _a;
    const basePath = (_a = options == null ? void 0 : options.basePath) != null ? _a : "/api";
    const externalBaseUrl = config.getString("backend.baseUrl");
    const { listenHost = "::", listenPort = DEFAULT_PORT } = readBaseOptions(config.getConfig("backend"));
    const protocol = config.has("backend.https") ? "https" : "http";
    let host = listenHost;
    if (host === "::") {
      host = "localhost";
    } else if (host === "0.0.0.0") {
      host = "127.0.0.1";
    }
    if (host.includes(":")) {
      host = `[${host}]`;
    }
    const internalBaseUrl = `${protocol}://${host}:${listenPort}`;
    return new SingleHostDiscovery(internalBaseUrl + basePath, externalBaseUrl + basePath);
  }
  async getBaseUrl(pluginId) {
    return `${this.internalBaseUrl}/${pluginId}`;
  }
  async getExternalBaseUrl(pluginId) {
    return `${this.externalBaseUrl}/${pluginId}`;
  }
}

function resolvePackagePath(name, ...paths) {
  const req = typeof __non_webpack_require__ === "undefined" ? require : __non_webpack_require__;
  return platformPath.resolve(req.resolve(`${name}/package.json`), "..", ...paths);
}
function resolveSafeChildPath(base, path) {
  const targetPath = platformPath.resolve(base, path);
  if (!cliCommon.isChildPath(base, targetPath)) {
    throw new errors.NotAllowedError("Relative path is not allowed to refer to a directory outside its parent");
  }
  return targetPath;
}

class ReadUrlResponseFactory {
  static async fromReadable(stream, options) {
    let buffer;
    const conflictError = new errors.ConflictError("Cannot use buffer() and stream() from the same ReadUrlResponse");
    let hasCalledStream = false;
    let hasCalledBuffer = false;
    return {
      buffer: () => {
        hasCalledBuffer = true;
        if (hasCalledStream)
          throw conflictError;
        if (buffer)
          return buffer;
        buffer = getRawBody__default["default"](stream);
        return buffer;
      },
      stream: () => {
        hasCalledStream = true;
        if (hasCalledBuffer)
          throw conflictError;
        return stream;
      },
      etag: options == null ? void 0 : options.etag
    };
  }
  static async fromNodeJSReadable(oldStyleStream, options) {
    const readable = new stream.Readable().wrap(oldStyleStream);
    return ReadUrlResponseFactory.fromReadable(readable, options);
  }
}

const _AzureUrlReader = class {
  constructor(integration, deps) {
    this.integration = integration;
    this.deps = deps;
  }
  async read(url) {
    const response = await this.readUrl(url);
    return response.buffer();
  }
  async readUrl(url, options) {
    const { signal } = options != null ? options : {};
    const builtUrl = integration.getAzureFileFetchUrl(url);
    let response;
    try {
      response = await fetch__default["default"](builtUrl, {
        ...integration.getAzureRequestOptions(this.integration.config),
        ...signal && { signal }
      });
    } catch (e) {
      throw new Error(`Unable to read ${url}, ${e}`);
    }
    if (response.ok && response.status !== 203) {
      return ReadUrlResponseFactory.fromNodeJSReadable(response.body);
    }
    const message = `${url} could not be read as ${builtUrl}, ${response.status} ${response.statusText}`;
    if (response.status === 404) {
      throw new errors.NotFoundError(message);
    }
    throw new Error(message);
  }
  async readTree(url, options) {
    const { etag, filter, signal } = options != null ? options : {};
    const commitsAzureResponse = await fetch__default["default"](integration.getAzureCommitsUrl(url), integration.getAzureRequestOptions(this.integration.config));
    if (!commitsAzureResponse.ok) {
      const message = `Failed to read tree from ${url}, ${commitsAzureResponse.status} ${commitsAzureResponse.statusText}`;
      if (commitsAzureResponse.status === 404) {
        throw new errors.NotFoundError(message);
      }
      throw new Error(message);
    }
    const commitSha = (await commitsAzureResponse.json()).value[0].commitId;
    if (etag && etag === commitSha) {
      throw new errors.NotModifiedError();
    }
    const archiveAzureResponse = await fetch__default["default"](integration.getAzureDownloadUrl(url), {
      ...integration.getAzureRequestOptions(this.integration.config, {
        Accept: "application/zip"
      }),
      ...signal && { signal }
    });
    if (!archiveAzureResponse.ok) {
      const message = `Failed to read tree from ${url}, ${archiveAzureResponse.status} ${archiveAzureResponse.statusText}`;
      if (archiveAzureResponse.status === 404) {
        throw new errors.NotFoundError(message);
      }
      throw new Error(message);
    }
    let subpath;
    const path = new URL(url).searchParams.get("path");
    if (path) {
      subpath = path.split("/").filter(Boolean).slice(-1)[0];
    }
    return await this.deps.treeResponseFactory.fromZipArchive({
      stream: archiveAzureResponse.body,
      etag: commitSha,
      filter,
      subpath
    });
  }
  async search(url, options) {
    const treeUrl = new URL(url);
    const path = treeUrl.searchParams.get("path");
    const matcher = path && new minimatch.Minimatch(path.replace(/^\/+/, ""));
    treeUrl.searchParams.delete("path");
    const tree = await this.readTree(treeUrl.toString(), {
      etag: options == null ? void 0 : options.etag,
      signal: options == null ? void 0 : options.signal,
      filter: (p) => matcher ? matcher.match(p) : true
    });
    const files = await tree.files();
    return {
      etag: tree.etag,
      files: files.map((file) => ({
        url: this.integration.resolveUrl({
          url: `/${file.path}`,
          base: url
        }),
        content: file.content
      }))
    };
  }
  toString() {
    const { host, token } = this.integration.config;
    return `azure{host=${host},authed=${Boolean(token)}}`;
  }
};
let AzureUrlReader = _AzureUrlReader;
AzureUrlReader.factory = ({ config, treeResponseFactory }) => {
  const integrations = integration.ScmIntegrations.fromConfig(config);
  return integrations.azure.list().map((integration) => {
    const reader = new _AzureUrlReader(integration, { treeResponseFactory });
    const predicate = (url) => url.host === integration.config.host;
    return { reader, predicate };
  });
};

const _BitbucketCloudUrlReader = class {
  constructor(integration, deps) {
    this.integration = integration;
    this.deps = deps;
    const { host, username, appPassword } = integration.config;
    if (username && !appPassword) {
      throw new Error(`Bitbucket Cloud integration for '${host}' has configured a username but is missing a required appPassword.`);
    }
  }
  async read(url) {
    const response = await this.readUrl(url);
    return response.buffer();
  }
  async readUrl(url, options) {
    var _a;
    const { etag, signal } = options != null ? options : {};
    const bitbucketUrl = integration.getBitbucketCloudFileFetchUrl(url, this.integration.config);
    const requestOptions = integration.getBitbucketCloudRequestOptions(this.integration.config);
    let response;
    try {
      response = await fetch__default["default"](bitbucketUrl.toString(), {
        headers: {
          ...requestOptions.headers,
          ...etag && { "If-None-Match": etag }
        },
        ...signal && { signal }
      });
    } catch (e) {
      throw new Error(`Unable to read ${url}, ${e}`);
    }
    if (response.status === 304) {
      throw new errors.NotModifiedError();
    }
    if (response.ok) {
      return ReadUrlResponseFactory.fromNodeJSReadable(response.body, {
        etag: (_a = response.headers.get("ETag")) != null ? _a : void 0
      });
    }
    const message = `${url} could not be read as ${bitbucketUrl}, ${response.status} ${response.statusText}`;
    if (response.status === 404) {
      throw new errors.NotFoundError(message);
    }
    throw new Error(message);
  }
  async readTree(url, options) {
    const { filepath } = parseGitUrl__default["default"](url);
    const lastCommitShortHash = await this.getLastCommitShortHash(url);
    if ((options == null ? void 0 : options.etag) && options.etag === lastCommitShortHash) {
      throw new errors.NotModifiedError();
    }
    const downloadUrl = await integration.getBitbucketCloudDownloadUrl(url, this.integration.config);
    const archiveResponse = await fetch__default["default"](downloadUrl, integration.getBitbucketCloudRequestOptions(this.integration.config));
    if (!archiveResponse.ok) {
      const message = `Failed to read tree from ${url}, ${archiveResponse.status} ${archiveResponse.statusText}`;
      if (archiveResponse.status === 404) {
        throw new errors.NotFoundError(message);
      }
      throw new Error(message);
    }
    return await this.deps.treeResponseFactory.fromTarArchive({
      stream: archiveResponse.body,
      subpath: filepath,
      etag: lastCommitShortHash,
      filter: options == null ? void 0 : options.filter
    });
  }
  async search(url, options) {
    const { filepath } = parseGitUrl__default["default"](url);
    const matcher = new minimatch.Minimatch(filepath);
    const treeUrl = lodash.trimEnd(url.replace(filepath, ""), "/");
    const tree = await this.readTree(treeUrl, {
      etag: options == null ? void 0 : options.etag,
      filter: (path) => matcher.match(path)
    });
    const files = await tree.files();
    return {
      etag: tree.etag,
      files: files.map((file) => ({
        url: this.integration.resolveUrl({
          url: `/${file.path}`,
          base: url
        }),
        content: file.content
      }))
    };
  }
  toString() {
    const { host, username, appPassword } = this.integration.config;
    const authed = Boolean(username && appPassword);
    return `bitbucketCloud{host=${host},authed=${authed}}`;
  }
  async getLastCommitShortHash(url) {
    const { name: repoName, owner: project, ref } = parseGitUrl__default["default"](url);
    let branch = ref;
    if (!branch) {
      branch = await integration.getBitbucketCloudDefaultBranch(url, this.integration.config);
    }
    const commitsApiUrl = `${this.integration.config.apiBaseUrl}/repositories/${project}/${repoName}/commits/${branch}`;
    const commitsResponse = await fetch__default["default"](commitsApiUrl, integration.getBitbucketCloudRequestOptions(this.integration.config));
    if (!commitsResponse.ok) {
      const message = `Failed to retrieve commits from ${commitsApiUrl}, ${commitsResponse.status} ${commitsResponse.statusText}`;
      if (commitsResponse.status === 404) {
        throw new errors.NotFoundError(message);
      }
      throw new Error(message);
    }
    const commits = await commitsResponse.json();
    if (commits && commits.values && commits.values.length > 0 && commits.values[0].hash) {
      return commits.values[0].hash.substring(0, 12);
    }
    throw new Error(`Failed to read response from ${commitsApiUrl}`);
  }
};
let BitbucketCloudUrlReader = _BitbucketCloudUrlReader;
BitbucketCloudUrlReader.factory = ({ config, treeResponseFactory }) => {
  const integrations = integration.ScmIntegrations.fromConfig(config);
  return integrations.bitbucketCloud.list().map((integration) => {
    const reader = new _BitbucketCloudUrlReader(integration, {
      treeResponseFactory
    });
    const predicate = (url) => url.host === integration.config.host;
    return { reader, predicate };
  });
};

const _BitbucketUrlReader = class {
  constructor(integration, logger, deps) {
    this.integration = integration;
    this.deps = deps;
    const { host, token, username, appPassword } = integration.config;
    const replacement = host === "bitbucket.org" ? "bitbucketCloud" : "bitbucketServer";
    logger.warn(`[Deprecated] Please migrate from "integrations.bitbucket" to "integrations.${replacement}".`);
    if (!token && username && !appPassword) {
      throw new Error(`Bitbucket integration for '${host}' has configured a username but is missing a required appPassword.`);
    }
  }
  async read(url) {
    const response = await this.readUrl(url);
    return response.buffer();
  }
  async readUrl(url, options) {
    var _a;
    const { etag, signal } = options != null ? options : {};
    const bitbucketUrl = integration.getBitbucketFileFetchUrl(url, this.integration.config);
    const requestOptions = integration.getBitbucketRequestOptions(this.integration.config);
    let response;
    try {
      response = await fetch__default["default"](bitbucketUrl.toString(), {
        headers: {
          ...requestOptions.headers,
          ...etag && { "If-None-Match": etag }
        },
        ...signal && { signal }
      });
    } catch (e) {
      throw new Error(`Unable to read ${url}, ${e}`);
    }
    if (response.status === 304) {
      throw new errors.NotModifiedError();
    }
    if (response.ok) {
      return ReadUrlResponseFactory.fromNodeJSReadable(response.body, {
        etag: (_a = response.headers.get("ETag")) != null ? _a : void 0
      });
    }
    const message = `${url} could not be read as ${bitbucketUrl}, ${response.status} ${response.statusText}`;
    if (response.status === 404) {
      throw new errors.NotFoundError(message);
    }
    throw new Error(message);
  }
  async readTree(url, options) {
    const { filepath } = parseGitUrl__default["default"](url);
    const lastCommitShortHash = await this.getLastCommitShortHash(url);
    if ((options == null ? void 0 : options.etag) && options.etag === lastCommitShortHash) {
      throw new errors.NotModifiedError();
    }
    const downloadUrl = await integration.getBitbucketDownloadUrl(url, this.integration.config);
    const archiveBitbucketResponse = await fetch__default["default"](downloadUrl, integration.getBitbucketRequestOptions(this.integration.config));
    if (!archiveBitbucketResponse.ok) {
      const message = `Failed to read tree from ${url}, ${archiveBitbucketResponse.status} ${archiveBitbucketResponse.statusText}`;
      if (archiveBitbucketResponse.status === 404) {
        throw new errors.NotFoundError(message);
      }
      throw new Error(message);
    }
    return await this.deps.treeResponseFactory.fromTarArchive({
      stream: archiveBitbucketResponse.body,
      subpath: filepath,
      etag: lastCommitShortHash,
      filter: options == null ? void 0 : options.filter
    });
  }
  async search(url, options) {
    const { filepath } = parseGitUrl__default["default"](url);
    const matcher = new minimatch.Minimatch(filepath);
    const treeUrl = lodash.trimEnd(url.replace(filepath, ""), "/");
    const tree = await this.readTree(treeUrl, {
      etag: options == null ? void 0 : options.etag,
      filter: (path) => matcher.match(path)
    });
    const files = await tree.files();
    return {
      etag: tree.etag,
      files: files.map((file) => ({
        url: this.integration.resolveUrl({
          url: `/${file.path}`,
          base: url
        }),
        content: file.content
      }))
    };
  }
  toString() {
    const { host, token, username, appPassword } = this.integration.config;
    let authed = Boolean(token);
    if (!authed) {
      authed = Boolean(username && appPassword);
    }
    return `bitbucket{host=${host},authed=${authed}}`;
  }
  async getLastCommitShortHash(url) {
    const { resource, name: repoName, owner: project, ref } = parseGitUrl__default["default"](url);
    let branch = ref;
    if (!branch) {
      branch = await integration.getBitbucketDefaultBranch(url, this.integration.config);
    }
    const isHosted = resource === "bitbucket.org";
    const commitsApiUrl = isHosted ? `${this.integration.config.apiBaseUrl}/repositories/${project}/${repoName}/commits/${branch}` : `${this.integration.config.apiBaseUrl}/projects/${project}/repos/${repoName}/commits`;
    const commitsResponse = await fetch__default["default"](commitsApiUrl, integration.getBitbucketRequestOptions(this.integration.config));
    if (!commitsResponse.ok) {
      const message = `Failed to retrieve commits from ${commitsApiUrl}, ${commitsResponse.status} ${commitsResponse.statusText}`;
      if (commitsResponse.status === 404) {
        throw new errors.NotFoundError(message);
      }
      throw new Error(message);
    }
    const commits = await commitsResponse.json();
    if (isHosted) {
      if (commits && commits.values && commits.values.length > 0 && commits.values[0].hash) {
        return commits.values[0].hash.substring(0, 12);
      }
    } else {
      if (commits && commits.values && commits.values.length > 0 && commits.values[0].id) {
        return commits.values[0].id.substring(0, 12);
      }
    }
    throw new Error(`Failed to read response from ${commitsApiUrl}`);
  }
};
let BitbucketUrlReader = _BitbucketUrlReader;
BitbucketUrlReader.factory = ({ config, logger, treeResponseFactory }) => {
  const integrations = integration.ScmIntegrations.fromConfig(config);
  return integrations.bitbucket.list().filter((item) => !integrations.bitbucketCloud.byHost(item.config.host) && !integrations.bitbucketServer.byHost(item.config.host)).map((integration) => {
    const reader = new _BitbucketUrlReader(integration, logger, {
      treeResponseFactory
    });
    const predicate = (url) => url.host === integration.config.host;
    return { reader, predicate };
  });
};

const _BitbucketServerUrlReader = class {
  constructor(integration, deps) {
    this.integration = integration;
    this.deps = deps;
  }
  async read(url) {
    const response = await this.readUrl(url);
    return response.buffer();
  }
  async readUrl(url, options) {
    var _a;
    const { etag, signal } = options != null ? options : {};
    const bitbucketUrl = integration.getBitbucketServerFileFetchUrl(url, this.integration.config);
    const requestOptions = integration.getBitbucketServerRequestOptions(this.integration.config);
    let response;
    try {
      response = await fetch__default["default"](bitbucketUrl.toString(), {
        headers: {
          ...requestOptions.headers,
          ...etag && { "If-None-Match": etag }
        },
        ...signal && { signal }
      });
    } catch (e) {
      throw new Error(`Unable to read ${url}, ${e}`);
    }
    if (response.status === 304) {
      throw new errors.NotModifiedError();
    }
    if (response.ok) {
      return ReadUrlResponseFactory.fromNodeJSReadable(response.body, {
        etag: (_a = response.headers.get("ETag")) != null ? _a : void 0
      });
    }
    const message = `${url} could not be read as ${bitbucketUrl}, ${response.status} ${response.statusText}`;
    if (response.status === 404) {
      throw new errors.NotFoundError(message);
    }
    throw new Error(message);
  }
  async readTree(url, options) {
    const { filepath } = parseGitUrl__default["default"](url);
    const lastCommitShortHash = await this.getLastCommitShortHash(url);
    if ((options == null ? void 0 : options.etag) && options.etag === lastCommitShortHash) {
      throw new errors.NotModifiedError();
    }
    const downloadUrl = await integration.getBitbucketServerDownloadUrl(url, this.integration.config);
    const archiveResponse = await fetch__default["default"](downloadUrl, integration.getBitbucketServerRequestOptions(this.integration.config));
    if (!archiveResponse.ok) {
      const message = `Failed to read tree from ${url}, ${archiveResponse.status} ${archiveResponse.statusText}`;
      if (archiveResponse.status === 404) {
        throw new errors.NotFoundError(message);
      }
      throw new Error(message);
    }
    return await this.deps.treeResponseFactory.fromTarArchive({
      stream: archiveResponse.body,
      subpath: filepath,
      etag: lastCommitShortHash,
      filter: options == null ? void 0 : options.filter
    });
  }
  async search(url, options) {
    const { filepath } = parseGitUrl__default["default"](url);
    const matcher = new minimatch.Minimatch(filepath);
    const treeUrl = lodash.trimEnd(url.replace(filepath, ""), "/");
    const tree = await this.readTree(treeUrl, {
      etag: options == null ? void 0 : options.etag,
      filter: (path) => matcher.match(path)
    });
    const files = await tree.files();
    return {
      etag: tree.etag,
      files: files.map((file) => ({
        url: this.integration.resolveUrl({
          url: `/${file.path}`,
          base: url
        }),
        content: file.content
      }))
    };
  }
  toString() {
    const { host, token } = this.integration.config;
    const authed = Boolean(token);
    return `bitbucketServer{host=${host},authed=${authed}}`;
  }
  async getLastCommitShortHash(url) {
    const { name: repoName, owner: project } = parseGitUrl__default["default"](url);
    const commitsApiUrl = `${this.integration.config.apiBaseUrl}/projects/${project}/repos/${repoName}/commits`;
    const commitsResponse = await fetch__default["default"](commitsApiUrl, integration.getBitbucketServerRequestOptions(this.integration.config));
    if (!commitsResponse.ok) {
      const message = `Failed to retrieve commits from ${commitsApiUrl}, ${commitsResponse.status} ${commitsResponse.statusText}`;
      if (commitsResponse.status === 404) {
        throw new errors.NotFoundError(message);
      }
      throw new Error(message);
    }
    const commits = await commitsResponse.json();
    if (commits && commits.values && commits.values.length > 0 && commits.values[0].id) {
      return commits.values[0].id.substring(0, 12);
    }
    throw new Error(`Failed to read response from ${commitsApiUrl}`);
  }
};
let BitbucketServerUrlReader = _BitbucketServerUrlReader;
BitbucketServerUrlReader.factory = ({ config, treeResponseFactory }) => {
  const integrations = integration.ScmIntegrations.fromConfig(config);
  return integrations.bitbucketServer.list().map((integration) => {
    const reader = new _BitbucketServerUrlReader(integration, {
      treeResponseFactory
    });
    const predicate = (url) => url.host === integration.config.host;
    return { reader, predicate };
  });
};

const _Git = class {
  constructor(config) {
    this.config = config;
    this.onAuth = () => ({
      username: this.config.username,
      password: this.config.password
    });
    this.onProgressHandler = () => {
      let currentPhase = "";
      return (event) => {
        var _a, _b;
        if (currentPhase !== event.phase) {
          currentPhase = event.phase;
          (_a = this.config.logger) == null ? void 0 : _a.info(event.phase);
        }
        const total = event.total ? `${Math.round(event.loaded / event.total * 100)}%` : event.loaded;
        (_b = this.config.logger) == null ? void 0 : _b.debug(`status={${event.phase},total={${total}}}`);
      };
    };
  }
  async add(options) {
    var _a;
    const { dir, filepath } = options;
    (_a = this.config.logger) == null ? void 0 : _a.info(`Adding file {dir=${dir},filepath=${filepath}}`);
    return git__default["default"].add({ fs: fs__default["default"], dir, filepath });
  }
  async addRemote(options) {
    var _a;
    const { dir, url, remote } = options;
    (_a = this.config.logger) == null ? void 0 : _a.info(`Creating new remote {dir=${dir},remote=${remote},url=${url}}`);
    return git__default["default"].addRemote({ fs: fs__default["default"], dir, remote, url });
  }
  async commit(options) {
    var _a;
    const { dir, message, author, committer } = options;
    (_a = this.config.logger) == null ? void 0 : _a.info(`Committing file to repo {dir=${dir},message=${message}}`);
    return git__default["default"].commit({ fs: fs__default["default"], dir, message, author, committer });
  }
  async clone(options) {
    var _a;
    const { url, dir, ref, depth, noCheckout } = options;
    (_a = this.config.logger) == null ? void 0 : _a.info(`Cloning repo {dir=${dir},url=${url}}`);
    return git__default["default"].clone({
      fs: fs__default["default"],
      http: http__default["default"],
      url,
      dir,
      ref,
      singleBranch: true,
      depth: depth != null ? depth : 1,
      noCheckout,
      onProgress: this.onProgressHandler(),
      headers: {
        "user-agent": "git/@isomorphic-git"
      },
      onAuth: this.onAuth
    });
  }
  async currentBranch(options) {
    const { dir, fullName = false } = options;
    return git__default["default"].currentBranch({ fs: fs__default["default"], dir, fullname: fullName });
  }
  async fetch(options) {
    var _a;
    const { dir, remote = "origin" } = options;
    (_a = this.config.logger) == null ? void 0 : _a.info(`Fetching remote=${remote} for repository {dir=${dir}}`);
    await git__default["default"].fetch({
      fs: fs__default["default"],
      http: http__default["default"],
      dir,
      remote,
      onProgress: this.onProgressHandler(),
      headers: { "user-agent": "git/@isomorphic-git" },
      onAuth: this.onAuth
    });
  }
  async init(options) {
    var _a;
    const { dir, defaultBranch = "master" } = options;
    (_a = this.config.logger) == null ? void 0 : _a.info(`Init git repository {dir=${dir}}`);
    return git__default["default"].init({
      fs: fs__default["default"],
      dir,
      defaultBranch
    });
  }
  async merge(options) {
    var _a;
    const { dir, theirs, ours, author, committer } = options;
    (_a = this.config.logger) == null ? void 0 : _a.info(`Merging branch '${theirs}' into '${ours}' for repository {dir=${dir}}`);
    return git__default["default"].merge({
      fs: fs__default["default"],
      dir,
      ours,
      theirs,
      author,
      committer
    });
  }
  async push(options) {
    var _a;
    const { dir, remote } = options;
    (_a = this.config.logger) == null ? void 0 : _a.info(`Pushing directory to remote {dir=${dir},remote=${remote}}`);
    return git__default["default"].push({
      fs: fs__default["default"],
      dir,
      http: http__default["default"],
      onProgress: this.onProgressHandler(),
      headers: {
        "user-agent": "git/@isomorphic-git"
      },
      remote,
      onAuth: this.onAuth
    });
  }
  async readCommit(options) {
    const { dir, sha } = options;
    return git__default["default"].readCommit({ fs: fs__default["default"], dir, oid: sha });
  }
  async resolveRef(options) {
    const { dir, ref } = options;
    return git__default["default"].resolveRef({ fs: fs__default["default"], dir, ref });
  }
  async log(options) {
    const { dir, ref } = options;
    return git__default["default"].log({
      fs: fs__default["default"],
      dir,
      ref: ref != null ? ref : "HEAD"
    });
  }
};
let Git = _Git;
Git.fromAuth = (options) => {
  const { username, password, logger } = options;
  return new _Git({ username, password, logger });
};

const pipeline$2 = util.promisify(stream.pipeline);
const createTemporaryDirectory = async (workDir) => await fs__default["default"].mkdtemp(platformPath.join(workDir, "/gerrit-clone-"));
const _GerritUrlReader = class {
  constructor(integration, deps, workDir) {
    this.integration = integration;
    this.deps = deps;
    this.workDir = workDir;
  }
  async read(url) {
    const response = await this.readUrl(url);
    return response.buffer();
  }
  async readUrl(url, options) {
    const apiUrl = integration.getGerritFileContentsApiUrl(this.integration.config, url);
    let response;
    try {
      response = await fetch__default["default"](apiUrl, {
        method: "GET",
        ...integration.getGerritRequestOptions(this.integration.config),
        signal: options == null ? void 0 : options.signal
      });
    } catch (e) {
      throw new Error(`Unable to read gerrit file ${url}, ${e}`);
    }
    if (response.ok) {
      let responseBody;
      return {
        buffer: async () => {
          if (responseBody === void 0) {
            responseBody = await response.text();
          }
          return Buffer.from(responseBody, "base64");
        },
        stream: () => {
          const readable = new stream.Readable().wrap(response.body);
          return readable.pipe(new base64Stream.Base64Decode());
        }
      };
    }
    if (response.status === 404) {
      throw new errors.NotFoundError(`File ${url} not found.`);
    }
    throw new Error(`${url} could not be read as ${apiUrl}, ${response.status} ${response.statusText}`);
  }
  async readTree(url, options) {
    const { filePath } = integration.parseGerritGitilesUrl(this.integration.config, url);
    const apiUrl = integration.getGerritBranchApiUrl(this.integration.config, url);
    let response;
    try {
      response = await fetch__default["default"](apiUrl, {
        method: "GET",
        ...integration.getGerritRequestOptions(this.integration.config)
      });
    } catch (e) {
      throw new Error(`Unable to read branch state ${url}, ${e}`);
    }
    if (response.status === 404) {
      throw new errors.NotFoundError(`Not found: ${url}`);
    }
    if (!response.ok) {
      throw new Error(`${url} could not be read as ${apiUrl}, ${response.status} ${response.statusText}`);
    }
    const branchInfo = await integration.parseGerritJsonResponse(response);
    if ((options == null ? void 0 : options.etag) === branchInfo.revision) {
      throw new errors.NotModifiedError();
    }
    const git = Git.fromAuth({
      username: this.integration.config.username,
      password: this.integration.config.password
    });
    const tempDir = await createTemporaryDirectory(this.workDir);
    const cloneUrl = integration.getGerritCloneRepoUrl(this.integration.config, url);
    try {
      await git.clone({
        url: cloneUrl,
        dir: platformPath.join(tempDir, "repo"),
        ref: branchInfo.revision,
        depth: 1
      });
      const data = await new Promise(async (resolve) => {
        await pipeline$2(tar__default["default"].create({ cwd: tempDir }, [""]), concatStream__default["default"](resolve));
      });
      const tarArchive = stream.Readable.from(data);
      return await this.deps.treeResponseFactory.fromTarArchive({
        stream: tarArchive,
        subpath: filePath === "/" ? void 0 : filePath,
        etag: branchInfo.revision,
        filter: options == null ? void 0 : options.filter
      });
    } catch (error) {
      throw new Error(`Could not clone ${cloneUrl}: ${error}`);
    } finally {
      await fs__default["default"].rm(tempDir, { recursive: true, force: true });
    }
  }
  async search() {
    throw new Error("GerritReader does not implement search");
  }
  toString() {
    const { host, password } = this.integration.config;
    return `gerrit{host=${host},authed=${Boolean(password)}}`;
  }
};
let GerritUrlReader = _GerritUrlReader;
GerritUrlReader.factory = ({ config, treeResponseFactory }) => {
  var _a;
  const integrations = integration.ScmIntegrations.fromConfig(config);
  if (!integrations.gerrit) {
    return [];
  }
  const workDir = (_a = config.getOptionalString("backend.workingDirectory")) != null ? _a : os__default["default"].tmpdir();
  return integrations.gerrit.list().map((integration) => {
    const reader = new _GerritUrlReader(integration, { treeResponseFactory }, workDir);
    const predicate = (url) => {
      const gitilesUrl = new URL(integration.config.gitilesBaseUrl);
      return url.host === gitilesUrl.host;
    };
    return { reader, predicate };
  });
};

const _GithubUrlReader = class {
  constructor(integration, deps) {
    this.integration = integration;
    this.deps = deps;
    if (!integration.config.apiBaseUrl && !integration.config.rawBaseUrl) {
      throw new Error(`GitHub integration '${integration.title}' must configure an explicit apiBaseUrl or rawBaseUrl`);
    }
  }
  async read(url) {
    const response = await this.readUrl(url);
    return response.buffer();
  }
  async readUrl(url, options) {
    var _a;
    const credentials = await this.deps.credentialsProvider.getCredentials({
      url
    });
    const ghUrl = integration.getGitHubFileFetchUrl(url, this.integration.config, credentials);
    let response;
    try {
      response = await fetch__default["default"](ghUrl, {
        headers: {
          ...credentials == null ? void 0 : credentials.headers,
          ...(options == null ? void 0 : options.etag) && { "If-None-Match": options.etag },
          Accept: "application/vnd.github.v3.raw"
        },
        signal: options == null ? void 0 : options.signal
      });
    } catch (e) {
      throw new Error(`Unable to read ${url}, ${e}`);
    }
    if (response.status === 304) {
      throw new errors.NotModifiedError();
    }
    if (response.ok) {
      return ReadUrlResponseFactory.fromNodeJSReadable(response.body, {
        etag: (_a = response.headers.get("ETag")) != null ? _a : void 0
      });
    }
    let message = `${url} could not be read as ${ghUrl}, ${response.status} ${response.statusText}`;
    if (response.status === 404) {
      throw new errors.NotFoundError(message);
    }
    if (response.status === 403 && response.headers.get("X-RateLimit-Remaining") === "0") {
      message += " (rate limit exceeded)";
    }
    throw new Error(message);
  }
  async readTree(url, options) {
    const repoDetails = await this.getRepoDetails(url);
    const commitSha = repoDetails.branch.commit.sha;
    if ((options == null ? void 0 : options.etag) && options.etag === commitSha) {
      throw new errors.NotModifiedError();
    }
    const { filepath } = parseGitUrl__default["default"](url);
    const { headers } = await this.deps.credentialsProvider.getCredentials({
      url
    });
    return this.doReadTree(repoDetails.repo.archive_url, commitSha, filepath, { headers, signal: options == null ? void 0 : options.signal }, options);
  }
  async search(url, options) {
    const repoDetails = await this.getRepoDetails(url);
    const commitSha = repoDetails.branch.commit.sha;
    if ((options == null ? void 0 : options.etag) && options.etag === commitSha) {
      throw new errors.NotModifiedError();
    }
    const { filepath } = parseGitUrl__default["default"](url);
    const { headers } = await this.deps.credentialsProvider.getCredentials({
      url
    });
    const files = await this.doSearch(url, repoDetails.repo.trees_url, repoDetails.repo.archive_url, commitSha, filepath, { headers, signal: options == null ? void 0 : options.signal });
    return { files, etag: commitSha };
  }
  toString() {
    const { host, token } = this.integration.config;
    return `github{host=${host},authed=${Boolean(token)}}`;
  }
  async doReadTree(archiveUrl, sha, subpath, init, options) {
    const archive = await this.fetchResponse(archiveUrl.replace("{archive_format}", "tarball").replace("{/ref}", `/${sha}`), init);
    return await this.deps.treeResponseFactory.fromTarArchive({
      stream: archive.body,
      subpath,
      etag: sha,
      filter: options == null ? void 0 : options.filter
    });
  }
  async doSearch(url, treesUrl, archiveUrl, sha, query, init) {
    function pathToUrl(path) {
      const updated = new URL(url);
      const base = updated.pathname.split("/").slice(1, 5).join("/");
      updated.pathname = `${base}/${path}`;
      return updated.toString();
    }
    const matcher = new minimatch.Minimatch(query.replace(/^\/+/, ""));
    const recursiveTree = await this.fetchJson(treesUrl.replace("{/sha}", `/${sha}?recursive=true`), init);
    if (!recursiveTree.truncated) {
      const matching = recursiveTree.tree.filter((item) => item.type === "blob" && item.path && item.url && matcher.match(item.path));
      return matching.map((item) => ({
        url: pathToUrl(item.path),
        content: async () => {
          const blob = await this.fetchJson(item.url, init);
          return Buffer.from(blob.content, "base64");
        }
      }));
    }
    const tree = await this.doReadTree(archiveUrl, sha, "", init, {
      filter: (path) => matcher.match(path)
    });
    const files = await tree.files();
    return files.map((file) => ({
      url: pathToUrl(file.path),
      content: file.content
    }));
  }
  async getRepoDetails(url) {
    const parsed = parseGitUrl__default["default"](url);
    const { ref, full_name } = parsed;
    const { headers } = await this.deps.credentialsProvider.getCredentials({
      url
    });
    const repo = await this.fetchJson(`${this.integration.config.apiBaseUrl}/repos/${full_name}`, { headers });
    const branch = await this.fetchJson(repo.branches_url.replace("{/branch}", `/${ref || repo.default_branch}`), { headers });
    return { repo, branch };
  }
  async fetchResponse(url, init) {
    const urlAsString = url.toString();
    const response = await fetch__default["default"](urlAsString, init);
    if (!response.ok) {
      const message = `Request failed for ${urlAsString}, ${response.status} ${response.statusText}`;
      if (response.status === 404) {
        throw new errors.NotFoundError(message);
      }
      throw new Error(message);
    }
    return response;
  }
  async fetchJson(url, init) {
    const response = await this.fetchResponse(url, init);
    return await response.json();
  }
};
let GithubUrlReader = _GithubUrlReader;
GithubUrlReader.factory = ({ config, treeResponseFactory }) => {
  const integrations = integration.ScmIntegrations.fromConfig(config);
  const credentialsProvider = integration.DefaultGithubCredentialsProvider.fromIntegrations(integrations);
  return integrations.github.list().map((integration) => {
    const reader = new _GithubUrlReader(integration, {
      treeResponseFactory,
      credentialsProvider
    });
    const predicate = (url) => url.host === integration.config.host;
    return { reader, predicate };
  });
};

const directoryNameRegex = /^[^\/]+\//;
function stripFirstDirectoryFromPath(path) {
  return path.replace(directoryNameRegex, "");
}

const _GitlabUrlReader = class {
  constructor(integration, deps) {
    this.integration = integration;
    this.deps = deps;
  }
  async read(url) {
    const response = await this.readUrl(url);
    return response.buffer();
  }
  async readUrl(url, options) {
    var _a;
    const { etag, signal } = options != null ? options : {};
    const builtUrl = await integration.getGitLabFileFetchUrl(url, this.integration.config);
    let response;
    try {
      response = await fetch__default["default"](builtUrl, {
        headers: {
          ...integration.getGitLabRequestOptions(this.integration.config).headers,
          ...etag && { "If-None-Match": etag }
        },
        ...signal && { signal }
      });
    } catch (e) {
      throw new Error(`Unable to read ${url}, ${e}`);
    }
    if (response.status === 304) {
      throw new errors.NotModifiedError();
    }
    if (response.ok) {
      return ReadUrlResponseFactory.fromNodeJSReadable(response.body, {
        etag: (_a = response.headers.get("ETag")) != null ? _a : void 0
      });
    }
    const message = `${url} could not be read as ${builtUrl}, ${response.status} ${response.statusText}`;
    if (response.status === 404) {
      throw new errors.NotFoundError(message);
    }
    throw new Error(message);
  }
  async readTree(url, options) {
    const { etag, signal } = options != null ? options : {};
    const { ref, full_name, filepath } = parseGitUrl__default["default"](url);
    const projectGitlabResponse = await fetch__default["default"](new URL(`${this.integration.config.apiBaseUrl}/projects/${encodeURIComponent(full_name)}`).toString(), integration.getGitLabRequestOptions(this.integration.config));
    if (!projectGitlabResponse.ok) {
      const msg = `Failed to read tree from ${url}, ${projectGitlabResponse.status} ${projectGitlabResponse.statusText}`;
      if (projectGitlabResponse.status === 404) {
        throw new errors.NotFoundError(msg);
      }
      throw new Error(msg);
    }
    const projectGitlabResponseJson = await projectGitlabResponse.json();
    const branch = ref || projectGitlabResponseJson.default_branch;
    const commitsReqParams = new URLSearchParams();
    commitsReqParams.set("ref_name", branch);
    if (!!filepath) {
      commitsReqParams.set("path", filepath);
    }
    const commitsGitlabResponse = await fetch__default["default"](new URL(`${this.integration.config.apiBaseUrl}/projects/${encodeURIComponent(full_name)}/repository/commits?${commitsReqParams.toString()}`).toString(), {
      ...integration.getGitLabRequestOptions(this.integration.config),
      ...signal && { signal }
    });
    if (!commitsGitlabResponse.ok) {
      const message = `Failed to read tree (branch) from ${url}, ${commitsGitlabResponse.status} ${commitsGitlabResponse.statusText}`;
      if (commitsGitlabResponse.status === 404) {
        throw new errors.NotFoundError(message);
      }
      throw new Error(message);
    }
    const commitSha = (await commitsGitlabResponse.json())[0].id;
    if (etag && etag === commitSha) {
      throw new errors.NotModifiedError();
    }
    const archiveGitLabResponse = await fetch__default["default"](`${this.integration.config.apiBaseUrl}/projects/${encodeURIComponent(full_name)}/repository/archive?sha=${branch}`, {
      ...integration.getGitLabRequestOptions(this.integration.config),
      ...signal && { signal }
    });
    if (!archiveGitLabResponse.ok) {
      const message = `Failed to read tree (archive) from ${url}, ${archiveGitLabResponse.status} ${archiveGitLabResponse.statusText}`;
      if (archiveGitLabResponse.status === 404) {
        throw new errors.NotFoundError(message);
      }
      throw new Error(message);
    }
    return await this.deps.treeResponseFactory.fromTarArchive({
      stream: archiveGitLabResponse.body,
      subpath: filepath,
      etag: commitSha,
      filter: options == null ? void 0 : options.filter
    });
  }
  async search(url, options) {
    const { filepath } = parseGitUrl__default["default"](url);
    const matcher = new minimatch.Minimatch(filepath);
    const treeUrl = lodash.trimEnd(url.replace(filepath, ""), "/");
    const tree = await this.readTree(treeUrl, {
      etag: options == null ? void 0 : options.etag,
      signal: options == null ? void 0 : options.signal,
      filter: (path) => matcher.match(stripFirstDirectoryFromPath(path))
    });
    const files = await tree.files();
    return {
      etag: tree.etag,
      files: files.map((file) => ({
        url: this.integration.resolveUrl({ url: `/${file.path}`, base: url }),
        content: file.content
      }))
    };
  }
  toString() {
    const { host, token } = this.integration.config;
    return `gitlab{host=${host},authed=${Boolean(token)}}`;
  }
};
let GitlabUrlReader = _GitlabUrlReader;
GitlabUrlReader.factory = ({ config, treeResponseFactory }) => {
  const integrations = integration.ScmIntegrations.fromConfig(config);
  return integrations.gitlab.list().map((integration) => {
    const reader = new _GitlabUrlReader(integration, {
      treeResponseFactory
    });
    const predicate = (url) => url.host === integration.config.host;
    return { reader, predicate };
  });
};

function parseUrl(url, config) {
  const parsedUrl = new URL(url);
  const pathname = parsedUrl.pathname.substring(1);
  const host = parsedUrl.host;
  if (config.host === "amazonaws.com") {
    const match = host.match(/^(?:([a-z0-9.-]+)\.)?s3[.-]([a-z0-9-]+)\.amazonaws\.com$/);
    if (!match) {
      throw new Error(`Invalid AWS S3 URL ${url}`);
    }
    const [, hostBucket, hostRegion] = match;
    if (config.s3ForcePathStyle || !hostBucket) {
      const slashIndex = pathname.indexOf("/");
      if (slashIndex < 0) {
        throw new Error(`Invalid path-style AWS S3 URL ${url}, does not contain bucket in the path`);
      }
      return {
        path: pathname.substring(slashIndex + 1),
        bucket: pathname.substring(0, slashIndex),
        region: hostRegion
      };
    }
    return {
      path: pathname,
      bucket: hostBucket,
      region: hostRegion
    };
  }
  const usePathStyle = config.s3ForcePathStyle || host.length === config.host.length;
  if (usePathStyle) {
    const slashIndex = pathname.indexOf("/");
    if (slashIndex < 0) {
      throw new Error(`Invalid path-style AWS S3 URL ${url}, does not contain bucket in the path`);
    }
    return {
      path: pathname.substring(slashIndex + 1),
      bucket: pathname.substring(0, slashIndex),
      region: ""
    };
  }
  return {
    path: pathname,
    bucket: host.substring(0, host.length - config.host.length - 1),
    region: ""
  };
}
const _AwsS3UrlReader = class {
  constructor(integration, deps) {
    this.integration = integration;
    this.deps = deps;
  }
  static buildCredentials(integration) {
    if (!integration) {
      return void 0;
    }
    const accessKeyId = integration.config.accessKeyId;
    const secretAccessKey = integration.config.secretAccessKey;
    let explicitCredentials;
    if (accessKeyId && secretAccessKey) {
      explicitCredentials = new aws.Credentials({
        accessKeyId,
        secretAccessKey
      });
    }
    const roleArn = integration.config.roleArn;
    if (roleArn) {
      return new aws__default["default"].ChainableTemporaryCredentials({
        masterCredentials: explicitCredentials,
        params: {
          RoleSessionName: "backstage-aws-s3-url-reader",
          RoleArn: roleArn,
          ExternalId: integration.config.externalId
        }
      });
    }
    return explicitCredentials;
  }
  async read(url) {
    const response = await this.readUrl(url);
    return response.buffer();
  }
  async readUrl(url, options) {
    var _a;
    try {
      const { path, bucket, region } = parseUrl(url, this.integration.config);
      aws__default["default"].config.update({ region });
      let params;
      if (options == null ? void 0 : options.etag) {
        params = {
          Bucket: bucket,
          Key: path,
          IfNoneMatch: options.etag
        };
      } else {
        params = {
          Bucket: bucket,
          Key: path
        };
      }
      const request = this.deps.s3.getObject(params);
      (_a = options == null ? void 0 : options.signal) == null ? void 0 : _a.addEventListener("abort", () => request.abort());
      const etagPromise = new Promise((resolve, reject) => {
        request.on("httpHeaders", (status, headers) => {
          if (status < 400) {
            if (status === 200) {
              resolve(headers.etag);
            } else if (status !== 304) {
              reject(new Error(`S3 readUrl request received unexpected status '${status}' in response`));
            }
          }
        });
        request.on("error", (error) => reject(error));
        request.on("complete", () => reject(new Error("S3 readUrl request completed without receiving headers")));
      });
      const stream = request.createReadStream();
      stream.on("error", () => {
      });
      return ReadUrlResponseFactory.fromReadable(stream, {
        etag: await etagPromise
      });
    } catch (e) {
      if (e.statusCode === 304) {
        throw new errors.NotModifiedError();
      }
      throw new errors.ForwardedError("Could not retrieve file from S3", e);
    }
  }
  async readTree(url, options) {
    var _a;
    try {
      const { path, bucket, region } = parseUrl(url, this.integration.config);
      const allObjects = [];
      const responses = [];
      let continuationToken;
      let output;
      do {
        aws__default["default"].config.update({ region });
        const request = this.deps.s3.listObjectsV2({
          Bucket: bucket,
          ContinuationToken: continuationToken,
          Prefix: path
        });
        (_a = options == null ? void 0 : options.signal) == null ? void 0 : _a.addEventListener("abort", () => request.abort());
        output = await request.promise();
        if (output.Contents) {
          output.Contents.forEach((contents) => {
            allObjects.push(contents);
          });
        }
        continuationToken = output.NextContinuationToken;
      } while (continuationToken);
      for (let i = 0; i < allObjects.length; i++) {
        const object = this.deps.s3.getObject({
          Bucket: bucket,
          Key: String(allObjects[i].Key)
        });
        responses.push({
          data: object.createReadStream(),
          path: String(allObjects[i].Key)
        });
      }
      return await this.deps.treeResponseFactory.fromReadableArray(responses);
    } catch (e) {
      throw new errors.ForwardedError("Could not retrieve file tree from S3", e);
    }
  }
  async search() {
    throw new Error("AwsS3Reader does not implement search");
  }
  toString() {
    const secretAccessKey = this.integration.config.secretAccessKey;
    return `awsS3{host=${this.integration.config.host},authed=${Boolean(secretAccessKey)}}`;
  }
};
let AwsS3UrlReader = _AwsS3UrlReader;
AwsS3UrlReader.factory = ({ config, treeResponseFactory }) => {
  const integrations = integration.ScmIntegrations.fromConfig(config);
  return integrations.awsS3.list().map((integration) => {
    const credentials = _AwsS3UrlReader.buildCredentials(integration);
    const s3 = new aws.S3({
      apiVersion: "2006-03-01",
      credentials,
      endpoint: integration.config.endpoint,
      s3ForcePathStyle: integration.config.s3ForcePathStyle
    });
    const reader = new _AwsS3UrlReader(integration, {
      s3,
      treeResponseFactory
    });
    const predicate = (url) => url.host.endsWith(integration.config.host);
    return { reader, predicate };
  });
};

const _FetchUrlReader = class {
  async read(url) {
    const response = await this.readUrl(url);
    return response.buffer();
  }
  async readUrl(url, options) {
    var _a;
    let response;
    try {
      response = await fetch__default["default"](url, {
        headers: {
          ...(options == null ? void 0 : options.etag) && { "If-None-Match": options.etag }
        },
        signal: options == null ? void 0 : options.signal
      });
    } catch (e) {
      throw new Error(`Unable to read ${url}, ${e}`);
    }
    if (response.status === 304) {
      throw new errors.NotModifiedError();
    }
    if (response.ok) {
      return ReadUrlResponseFactory.fromNodeJSReadable(response.body, {
        etag: (_a = response.headers.get("ETag")) != null ? _a : void 0
      });
    }
    const message = `could not read ${url}, ${response.status} ${response.statusText}`;
    if (response.status === 404) {
      throw new errors.NotFoundError(message);
    }
    throw new Error(message);
  }
  async readTree() {
    throw new Error("FetchUrlReader does not implement readTree");
  }
  async search() {
    throw new Error("FetchUrlReader does not implement search");
  }
  toString() {
    return "fetch{}";
  }
};
let FetchUrlReader = _FetchUrlReader;
FetchUrlReader.factory = ({ config }) => {
  var _a, _b;
  const predicates = (_b = (_a = config.getOptionalConfigArray("backend.reading.allow")) == null ? void 0 : _a.map((allowConfig) => {
    const paths = allowConfig.getOptionalStringArray("paths");
    const checkPath = paths ? (url) => {
      const targetPath = platformPath__default["default"].posix.normalize(url.pathname);
      return paths.some((allowedPath) => targetPath.startsWith(allowedPath));
    } : (_url) => true;
    const host = allowConfig.getString("host");
    if (host.startsWith("*.")) {
      const suffix = host.slice(1);
      return (url) => url.host.endsWith(suffix) && checkPath(url);
    }
    return (url) => url.host === host && checkPath(url);
  })) != null ? _b : [];
  const reader = new _FetchUrlReader();
  const predicate = (url) => predicates.some((p) => p(url));
  return [{ reader, predicate }];
};

const MIN_WARNING_INTERVAL_MS = 1e3 * 60 * 15;
function notAllowedMessage(url) {
  return `Reading from '${url}' is not allowed. You may need to configure an integration for the target host, or add it to the configured list of allowed hosts at 'backend.reading.allow'`;
}
class UrlReaderPredicateMux {
  constructor(logger) {
    this.logger = logger;
    this.readers = [];
    this.readerWarnings = /* @__PURE__ */ new Map();
  }
  register(tuple) {
    this.readers.push(tuple);
  }
  async read(url) {
    const parsed = new URL(url);
    for (const { predicate, reader } of this.readers) {
      if (predicate(parsed)) {
        return reader.read(url);
      }
    }
    throw new errors.NotAllowedError(notAllowedMessage(url));
  }
  async readUrl(url, options) {
    var _a;
    const parsed = new URL(url);
    for (const { predicate, reader } of this.readers) {
      if (predicate(parsed)) {
        if (reader.readUrl) {
          return reader.readUrl(url, options);
        }
        const now = Date.now();
        const lastWarned = (_a = this.readerWarnings.get(reader)) != null ? _a : 0;
        if (now > lastWarned + MIN_WARNING_INTERVAL_MS) {
          this.readerWarnings.set(reader, now);
          this.logger.warn(`No implementation of readUrl found for ${reader}, this method will be required in the future and will replace the 'read' method. See the changelog for more details here: https://github.com/backstage/backstage/blob/master/packages/backend-common/CHANGELOG.md#085`);
        }
        const buffer = await reader.read(url);
        return {
          buffer: async () => buffer
        };
      }
    }
    throw new errors.NotAllowedError(notAllowedMessage(url));
  }
  async readTree(url, options) {
    const parsed = new URL(url);
    for (const { predicate, reader } of this.readers) {
      if (predicate(parsed)) {
        return await reader.readTree(url, options);
      }
    }
    throw new errors.NotAllowedError(notAllowedMessage(url));
  }
  async search(url, options) {
    const parsed = new URL(url);
    for (const { predicate, reader } of this.readers) {
      if (predicate(parsed)) {
        return await reader.search(url, options);
      }
    }
    throw new errors.NotAllowedError(notAllowedMessage(url));
  }
  toString() {
    return `predicateMux{readers=${this.readers.map((t) => t.reader).join(",")}`;
  }
}

const TarParseStream = tar.Parse;
const pipeline$1 = util.promisify(stream.pipeline);
class TarArchiveResponse {
  constructor(stream, subPath, workDir, etag, filter) {
    this.stream = stream;
    this.subPath = subPath;
    this.workDir = workDir;
    this.etag = etag;
    this.filter = filter;
    this.read = false;
    if (subPath) {
      if (!subPath.endsWith("/")) {
        this.subPath += "/";
      }
      if (subPath.startsWith("/")) {
        throw new TypeError(`TarArchiveResponse subPath must not start with a /, got '${subPath}'`);
      }
    }
    this.etag = etag;
  }
  onlyOnce() {
    if (this.read) {
      throw new Error("Response has already been read");
    }
    this.read = true;
  }
  async files() {
    this.onlyOnce();
    const files = Array();
    const parser = new TarParseStream();
    parser.on("entry", (entry) => {
      if (entry.type === "Directory") {
        entry.resume();
        return;
      }
      const relativePath = stripFirstDirectoryFromPath(entry.path);
      if (this.subPath) {
        if (!relativePath.startsWith(this.subPath)) {
          entry.resume();
          return;
        }
      }
      const path = relativePath.slice(this.subPath.length);
      if (this.filter) {
        if (!this.filter(path, { size: entry.remain })) {
          entry.resume();
          return;
        }
      }
      const content = new Promise(async (resolve) => {
        await pipeline$1(entry, concatStream__default["default"](resolve));
      });
      files.push({
        path,
        content: () => content
      });
      entry.resume();
    });
    await pipeline$1(this.stream, parser);
    return files;
  }
  async archive() {
    if (!this.subPath) {
      this.onlyOnce();
      return this.stream;
    }
    const tmpDir = await this.dir();
    try {
      const data = await new Promise(async (resolve) => {
        await pipeline$1(tar__default["default"].create({ cwd: tmpDir }, [""]), concatStream__default["default"](resolve));
      });
      return stream.Readable.from(data);
    } finally {
      await fs__default["default"].remove(tmpDir);
    }
  }
  async dir(options) {
    var _a;
    this.onlyOnce();
    const dir = (_a = options == null ? void 0 : options.targetDir) != null ? _a : await fs__default["default"].mkdtemp(platformPath__default["default"].join(this.workDir, "backstage-"));
    const strip = this.subPath ? this.subPath.split("/").length : 1;
    let filterError = void 0;
    await pipeline$1(this.stream, tar__default["default"].extract({
      strip,
      cwd: dir,
      filter: (path, stat) => {
        if (filterError) {
          return false;
        }
        const relativePath = stripFirstDirectoryFromPath(path);
        if (this.subPath && !relativePath.startsWith(this.subPath)) {
          return false;
        }
        if (this.filter) {
          const innerPath = path.split("/").slice(strip).join("/");
          try {
            return this.filter(innerPath, { size: stat.size });
          } catch (error) {
            filterError = error;
            return false;
          }
        }
        return true;
      }
    }));
    if (filterError) {
      if (!(options == null ? void 0 : options.targetDir)) {
        await fs__default["default"].remove(dir).catch(() => {
        });
      }
      throw filterError;
    }
    return dir;
  }
}

class ZipArchiveResponse {
  constructor(stream, subPath, workDir, etag, filter) {
    this.stream = stream;
    this.subPath = subPath;
    this.workDir = workDir;
    this.etag = etag;
    this.filter = filter;
    this.read = false;
    if (subPath) {
      if (!subPath.endsWith("/")) {
        this.subPath += "/";
      }
      if (subPath.startsWith("/")) {
        throw new TypeError(`ZipArchiveResponse subPath must not start with a /, got '${subPath}'`);
      }
    }
    this.etag = etag;
  }
  onlyOnce() {
    if (this.read) {
      throw new Error("Response has already been read");
    }
    this.read = true;
  }
  getInnerPath(path) {
    return path.slice(this.subPath.length);
  }
  shouldBeIncluded(entry) {
    var _a;
    if (this.subPath) {
      if (!entry.path.startsWith(this.subPath)) {
        return false;
      }
    }
    if (this.filter) {
      return this.filter(this.getInnerPath(entry.path), {
        size: (_a = entry.vars.uncompressedSize) != null ? _a : entry.vars.compressedSize
      });
    }
    return true;
  }
  async files() {
    this.onlyOnce();
    const files = Array();
    await this.stream.pipe(unzipper__default["default"].Parse()).on("entry", (entry) => {
      if (entry.type === "Directory") {
        entry.resume();
        return;
      }
      if (this.shouldBeIncluded(entry)) {
        files.push({
          path: this.getInnerPath(entry.path),
          content: () => entry.buffer()
        });
      } else {
        entry.autodrain();
      }
    }).promise();
    return files;
  }
  async archive() {
    this.onlyOnce();
    if (!this.subPath) {
      return this.stream;
    }
    const archive = archiver__default["default"]("zip");
    await this.stream.pipe(unzipper__default["default"].Parse()).on("entry", (entry) => {
      if (entry.type === "File" && this.shouldBeIncluded(entry)) {
        archive.append(entry, { name: this.getInnerPath(entry.path) });
      } else {
        entry.autodrain();
      }
    }).promise();
    archive.finalize();
    return archive;
  }
  async dir(options) {
    var _a;
    this.onlyOnce();
    const dir = (_a = options == null ? void 0 : options.targetDir) != null ? _a : await fs__default["default"].mkdtemp(platformPath__default["default"].join(this.workDir, "backstage-"));
    await this.stream.pipe(unzipper__default["default"].Parse()).on("entry", async (entry) => {
      if (entry.type === "File" && this.shouldBeIncluded(entry)) {
        const entryPath = this.getInnerPath(entry.path);
        const dirname = platformPath__default["default"].dirname(entryPath);
        if (dirname) {
          await fs__default["default"].mkdirp(platformPath__default["default"].join(dir, dirname));
        }
        entry.pipe(fs__default["default"].createWriteStream(platformPath__default["default"].join(dir, entryPath)));
      } else {
        entry.autodrain();
      }
    }).promise();
    return dir;
  }
}

const pipeline = util.promisify(stream.pipeline);
class ReadableArrayResponse {
  constructor(stream, workDir, etag) {
    this.stream = stream;
    this.workDir = workDir;
    this.etag = etag;
    this.read = false;
    this.etag = etag;
  }
  onlyOnce() {
    if (this.read) {
      throw new Error("Response has already been read");
    }
    this.read = true;
  }
  async files() {
    this.onlyOnce();
    const files = Array();
    for (let i = 0; i < this.stream.length; i++) {
      if (!this.stream[i].path.endsWith("/")) {
        files.push({
          path: this.stream[i].path,
          content: () => getRawBody__default["default"](this.stream[i].data)
        });
      }
    }
    return files;
  }
  async archive() {
    const tmpDir = await this.dir();
    try {
      const data = await new Promise(async (resolve) => {
        await pipeline(tar__default["default"].create({ cwd: tmpDir }, [""]), concatStream__default["default"](resolve));
      });
      return stream.Readable.from(data);
    } finally {
      await fs__default["default"].remove(tmpDir);
    }
  }
  async dir(options) {
    var _a;
    this.onlyOnce();
    const dir = (_a = options == null ? void 0 : options.targetDir) != null ? _a : await fs__default["default"].mkdtemp(platformPath__default["default"].join(this.workDir, "backstage-"));
    for (let i = 0; i < this.stream.length; i++) {
      if (!this.stream[i].path.endsWith("/")) {
        await pipeline(this.stream[i].data, fs__default["default"].createWriteStream(platformPath__default["default"].join(dir, platformPath.basename(this.stream[i].path))));
      }
    }
    return dir;
  }
}

class DefaultReadTreeResponseFactory {
  constructor(workDir) {
    this.workDir = workDir;
  }
  static create(options) {
    var _a;
    return new DefaultReadTreeResponseFactory((_a = options.config.getOptionalString("backend.workingDirectory")) != null ? _a : os__default["default"].tmpdir());
  }
  async fromTarArchive(options) {
    var _a;
    return new TarArchiveResponse(options.stream, (_a = options.subpath) != null ? _a : "", this.workDir, options.etag, options.filter);
  }
  async fromZipArchive(options) {
    var _a;
    return new ZipArchiveResponse(options.stream, (_a = options.subpath) != null ? _a : "", this.workDir, options.etag, options.filter);
  }
  async fromReadableArray(options) {
    return new ReadableArrayResponse(options, this.workDir, "");
  }
}

const GOOGLE_GCS_HOST = "storage.cloud.google.com";
const parseURL = (url) => {
  const { host, pathname } = new URL(url);
  if (host !== GOOGLE_GCS_HOST) {
    throw new Error(`not a valid GCS URL: ${url}`);
  }
  const [, bucket, ...key] = pathname.split("/");
  return {
    host,
    bucket,
    key: key.join("/")
  };
};
const _GoogleGcsUrlReader = class {
  constructor(integration, storage) {
    this.integration = integration;
    this.storage = storage;
  }
  readStreamFromUrl(url) {
    const { bucket, key } = parseURL(url);
    return this.storage.bucket(bucket).file(key).createReadStream();
  }
  async read(url) {
    try {
      return await getRawBody__default["default"](this.readStreamFromUrl(url));
    } catch (error) {
      throw new Error(`unable to read gcs file from ${url}, ${error}`);
    }
  }
  async readUrl(url, _options) {
    const stream = this.readStreamFromUrl(url);
    return ReadUrlResponseFactory.fromReadable(stream);
  }
  async readTree() {
    throw new Error("GcsUrlReader does not implement readTree");
  }
  async search(url) {
    const { bucket, key: pattern } = parseURL(url);
    if (!pattern.endsWith("*") || pattern.indexOf("*") !== pattern.length - 1) {
      throw new Error("GcsUrlReader only supports prefix-based searches");
    }
    const [files] = await this.storage.bucket(bucket).getFiles({
      autoPaginate: true,
      prefix: pattern.split("*").join("")
    });
    return {
      files: files.map((file) => {
        const fullUrl = ["https:/", GOOGLE_GCS_HOST, bucket, file.name].join("/");
        return {
          url: fullUrl,
          content: async () => {
            const readResponse = await this.readUrl(fullUrl);
            return readResponse.buffer();
          }
        };
      }),
      etag: "NOT/IMPLEMENTED"
    };
  }
  toString() {
    const key = this.integration.privateKey;
    return `googleGcs{host=${GOOGLE_GCS_HOST},authed=${Boolean(key)}}`;
  }
};
let GoogleGcsUrlReader = _GoogleGcsUrlReader;
GoogleGcsUrlReader.factory = ({ config, logger }) => {
  if (!config.has("integrations.googleGcs")) {
    return [];
  }
  const gcsConfig = integration.readGoogleGcsIntegrationConfig(config.getConfig("integrations.googleGcs"));
  let storage$1;
  if (!gcsConfig.clientEmail || !gcsConfig.privateKey) {
    logger.info("googleGcs credentials not found in config. Using default credentials provider.");
    storage$1 = new storage.Storage();
  } else {
    storage$1 = new storage.Storage({
      credentials: {
        client_email: gcsConfig.clientEmail || void 0,
        private_key: gcsConfig.privateKey || void 0
      }
    });
  }
  const reader = new _GoogleGcsUrlReader(gcsConfig, storage$1);
  const predicate = (url) => url.host === GOOGLE_GCS_HOST;
  return [{ reader, predicate }];
};

class UrlReaders {
  static create(options) {
    const { logger, config, factories } = options;
    const mux = new UrlReaderPredicateMux(logger);
    const treeResponseFactory = DefaultReadTreeResponseFactory.create({
      config
    });
    for (const factory of factories != null ? factories : []) {
      const tuples = factory({ config, logger, treeResponseFactory });
      for (const tuple of tuples) {
        mux.register(tuple);
      }
    }
    return mux;
  }
  static default(options) {
    const { logger, config, factories = [] } = options;
    return UrlReaders.create({
      logger,
      config,
      factories: factories.concat([
        AzureUrlReader.factory,
        BitbucketCloudUrlReader.factory,
        BitbucketServerUrlReader.factory,
        BitbucketUrlReader.factory,
        GerritUrlReader.factory,
        GithubUrlReader.factory,
        GitlabUrlReader.factory,
        GoogleGcsUrlReader.factory,
        AwsS3UrlReader.factory,
        FetchUrlReader.factory
      ])
    });
  }
}

function createServiceBuilder(_module) {
  return new ServiceBuilderImpl(_module);
}

async function createStatusCheckRouter(options) {
  const router = Router__default["default"]();
  const { path = "/healthcheck", statusCheck } = options;
  router.use(path, await statusCheckHandler({ statusCheck }));
  router.use(errorHandler());
  return router;
}

const TOKEN_ALG = "HS256";
const TOKEN_SUB = "backstage-server";
const TOKEN_EXPIRY_AFTER = luxon.Duration.fromObject({ hours: 1 });
const TOKEN_REISSUE_AFTER = luxon.Duration.fromObject({ minutes: 10 });
class NoopTokenManager {
  constructor() {
    this.isInsecureServerTokenManager = true;
  }
  async getToken() {
    return { token: "" };
  }
  async authenticate() {
  }
}
class ServerTokenManager {
  static noop() {
    return new NoopTokenManager();
  }
  static fromConfig(config, options) {
    const keys = config.getOptionalConfigArray("backend.auth.keys");
    if (keys == null ? void 0 : keys.length) {
      return new ServerTokenManager(keys.map((key) => key.getString("secret")), options);
    }
    if (process.env.NODE_ENV !== "development") {
      throw new Error("You must configure at least one key in backend.auth.keys for production.");
    }
    options.logger.warn("Generated a secret for backend-to-backend authentication: DEVELOPMENT USE ONLY.");
    return new ServerTokenManager([], options);
  }
  constructor(secrets, options) {
    if (!secrets.length && process.env.NODE_ENV !== "development") {
      throw new Error("No secrets provided when constructing ServerTokenManager");
    }
    this.options = options;
    this.verificationKeys = secrets.map((s) => jose.base64url.decode(s));
    this.signingKey = this.verificationKeys[0];
  }
  async generateKeys() {
    if (process.env.NODE_ENV !== "development") {
      throw new Error("Key generation is not supported outside of the dev environment");
    }
    if (this.privateKeyPromise) {
      return this.privateKeyPromise;
    }
    const promise = (async () => {
      var _a;
      const secret = await jose.generateSecret(TOKEN_ALG);
      const jwk = await jose.exportJWK(secret);
      this.verificationKeys.push(jose.base64url.decode((_a = jwk.k) != null ? _a : ""));
      this.signingKey = this.verificationKeys[0];
      return;
    })();
    try {
      this.privateKeyPromise = promise;
      await promise;
    } catch (error) {
      this.options.logger.error(`Failed to generate new key, ${error}`);
      delete this.privateKeyPromise;
    }
    return promise;
  }
  async getToken() {
    if (!this.verificationKeys.length) {
      await this.generateKeys();
    }
    if (this.currentTokenPromise) {
      return this.currentTokenPromise;
    }
    const result = Promise.resolve().then(async () => {
      const jwt = await new jose.SignJWT({}).setProtectedHeader({ alg: TOKEN_ALG }).setSubject(TOKEN_SUB).setExpirationTime(luxon.DateTime.now().plus(TOKEN_EXPIRY_AFTER).toUnixInteger()).sign(this.signingKey);
      return { token: jwt };
    });
    this.currentTokenPromise = result;
    result.then(() => {
      setTimeout(() => {
        this.currentTokenPromise = void 0;
      }, TOKEN_REISSUE_AFTER.toMillis());
    }).catch(() => {
      this.currentTokenPromise = void 0;
    });
    return result;
  }
  async authenticate(token) {
    let verifyError = void 0;
    for (const key of this.verificationKeys) {
      try {
        const {
          protectedHeader: { alg },
          payload: { sub, exp }
        } = await jose.jwtVerify(token, key);
        if (alg !== TOKEN_ALG) {
          throw new errors.AuthenticationError(`Illegal alg "${alg}"`);
        }
        if (sub !== TOKEN_SUB) {
          throw new errors.AuthenticationError(`Illegal sub "${sub}"`);
        }
        if (typeof exp !== "number") {
          throw new errors.AuthenticationError("Server-to-server token had no exp claim");
        }
        return;
      } catch (e) {
        verifyError = e;
      }
    }
    throw new errors.AuthenticationError("Invalid server token", verifyError);
  }
}

class DockerContainerRunner {
  constructor(options) {
    this.dockerClient = options.dockerClient;
  }
  async runContainer(options) {
    const {
      imageName,
      command,
      args,
      logStream = new stream.PassThrough(),
      mountDirs = {},
      workingDir,
      envVars = {},
      pullImage = true
    } = options;
    try {
      await this.dockerClient.ping();
    } catch (e) {
      throw new errors.ForwardedError("This operation requires Docker. Docker does not appear to be available. Docker.ping() failed with", e);
    }
    if (pullImage) {
      await new Promise((resolve, reject) => {
        this.dockerClient.pull(imageName, {}, (err, stream) => {
          if (err)
            return reject(err);
          stream.pipe(logStream, { end: false });
          stream.on("end", () => resolve());
          stream.on("error", (error2) => reject(error2));
          return void 0;
        });
      });
    }
    const userOptions = {};
    if (process.getuid && process.getgid) {
      userOptions.User = `${process.getuid()}:${process.getgid()}`;
    }
    const Volumes = {};
    for (const containerDir of Object.values(mountDirs)) {
      Volumes[containerDir] = {};
    }
    const Binds = [];
    for (const [hostDir, containerDir] of Object.entries(mountDirs)) {
      const realHostDir = await fs__default["default"].realpath(hostDir);
      Binds.push(`${realHostDir}:${containerDir}`);
    }
    const Env = [];
    for (const [key, value] of Object.entries(envVars)) {
      Env.push(`${key}=${value}`);
    }
    const [{ Error: error, StatusCode: statusCode }] = await this.dockerClient.run(imageName, args, logStream, {
      Volumes,
      HostConfig: {
        AutoRemove: true,
        Binds
      },
      ...workingDir ? { WorkingDir: workingDir } : {},
      Entrypoint: command,
      Env,
      ...userOptions
    });
    if (error) {
      throw new Error(`Docker failed to run with the following error message: ${error}`);
    }
    if (statusCode !== 0) {
      throw new Error(`Docker container returned a non-zero exit code (${statusCode})`);
    }
  }
}

Object.defineProperty(exports, 'isChildPath', {
  enumerable: true,
  get: function () { return cliCommon.isChildPath; }
});
exports.AwsS3UrlReader = AwsS3UrlReader;
exports.AzureUrlReader = AzureUrlReader;
exports.BitbucketCloudUrlReader = BitbucketCloudUrlReader;
exports.BitbucketServerUrlReader = BitbucketServerUrlReader;
exports.BitbucketUrlReader = BitbucketUrlReader;
exports.CacheManager = CacheManager;
exports.Contexts = Contexts;
exports.DatabaseManager = DatabaseManager;
exports.DockerContainerRunner = DockerContainerRunner;
exports.FetchUrlReader = FetchUrlReader;
exports.GerritUrlReader = GerritUrlReader;
exports.Git = Git;
exports.GithubUrlReader = GithubUrlReader;
exports.GitlabUrlReader = GitlabUrlReader;
exports.ReadUrlResponseFactory = ReadUrlResponseFactory;
exports.ServerTokenManager = ServerTokenManager;
exports.SingleHostDiscovery = SingleHostDiscovery;
exports.UrlReaders = UrlReaders;
exports.coloredFormat = coloredFormat;
exports.createDatabaseClient = createDatabaseClient;
exports.createRootLogger = createRootLogger;
exports.createServiceBuilder = createServiceBuilder;
exports.createStatusCheckRouter = createStatusCheckRouter;
exports.ensureDatabaseExists = ensureDatabaseExists;
exports.errorHandler = errorHandler;
exports.getRootLogger = getRootLogger;
exports.getVoidLogger = getVoidLogger;
exports.isDatabaseConflictError = isDatabaseConflictError;
exports.loadBackendConfig = loadBackendConfig;
exports.notFoundHandler = notFoundHandler;
exports.requestLoggingHandler = requestLoggingHandler;
exports.resolvePackagePath = resolvePackagePath;
exports.resolveSafeChildPath = resolveSafeChildPath;
exports.setRootLogger = setRootLogger;
exports.statusCheckHandler = statusCheckHandler;
exports.useHotCleanup = useHotCleanup;
exports.useHotMemoize = useHotMemoize;
//# sourceMappingURL=index.cjs.js.map
