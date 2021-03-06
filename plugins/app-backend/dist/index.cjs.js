'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var backendCommon = require('@backstage/backend-common');
var helmet = require('helmet');
var express = require('express');
var Router = require('express-promise-router');
var fs = require('fs-extra');
var path = require('path');
var configLoader = require('@backstage/config-loader');
var luxon = require('luxon');
var partition = require('lodash/partition');
var globby = require('globby');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var helmet__default = /*#__PURE__*/_interopDefaultLegacy(helmet);
var express__default = /*#__PURE__*/_interopDefaultLegacy(express);
var Router__default = /*#__PURE__*/_interopDefaultLegacy(Router);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var partition__default = /*#__PURE__*/_interopDefaultLegacy(partition);
var globby__default = /*#__PURE__*/_interopDefaultLegacy(globby);

async function injectConfig(options) {
  const { staticDir, logger, appConfigs } = options;
  const files = await fs__default["default"].readdir(staticDir);
  const jsFiles = files.filter((file) => file.endsWith(".js"));
  const escapedData = JSON.stringify(appConfigs).replace(/("|'|\\)/g, "\\$1");
  const injected = `/*__APP_INJECTED_CONFIG_MARKER__*/"${escapedData}"/*__INJECTED_END__*/`;
  for (const jsFile of jsFiles) {
    const path$1 = path.resolve(staticDir, jsFile);
    const content = await fs__default["default"].readFile(path$1, "utf8");
    if (content.includes("__APP_INJECTED_RUNTIME_CONFIG__")) {
      logger.info(`Injecting env config into ${jsFile}`);
      const newContent = content.replace('"__APP_INJECTED_RUNTIME_CONFIG__"', injected);
      await fs__default["default"].writeFile(path$1, newContent, "utf8");
      return;
    } else if (content.includes("__APP_INJECTED_CONFIG_MARKER__")) {
      logger.info(`Replacing injected env config in ${jsFile}`);
      const newContent = content.replace(/\/\*__APP_INJECTED_CONFIG_MARKER__\*\/.*\/\*__INJECTED_END__\*\//, injected);
      await fs__default["default"].writeFile(path$1, newContent, "utf8");
      return;
    }
  }
  logger.info("Env config not injected");
}
async function readConfigs(options) {
  const { env, appDistDir, config } = options;
  const appConfigs = configLoader.readEnvConfig(env);
  const schemaPath = path.resolve(appDistDir, ".config-schema.json");
  if (await fs__default["default"].pathExists(schemaPath)) {
    const serializedSchema = await fs__default["default"].readJson(schemaPath);
    try {
      const schema = await configLoader.loadConfigSchema({ serialized: serializedSchema });
      const frontendConfigs = await schema.process([{ data: config.get(), context: "app" }], { visibility: ["frontend"], withDeprecatedKeys: true });
      appConfigs.push(...frontendConfigs);
    } catch (error) {
      throw new Error(`Invalid app bundle schema. If this error is unexpected you need to run \`yarn build\` in the app. If that doesn't help you should make sure your config schema is correct and rebuild the app bundle again. Caused by the following schema error, ${error}`);
    }
  }
  return appConfigs;
}

var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _db, _logger;
const migrationsDir = backendCommon.resolvePackagePath("@backstage/plugin-app-backend", "migrations");
const _StaticAssetsStore = class {
  constructor(options) {
    __privateAdd(this, _db, void 0);
    __privateAdd(this, _logger, void 0);
    __privateSet(this, _db, options.database);
    __privateSet(this, _logger, options.logger);
  }
  static async create(options) {
    await options.database.migrate.latest({
      directory: migrationsDir
    });
    return new _StaticAssetsStore(options);
  }
  async storeAssets(assets) {
    const existingRows = await __privateGet(this, _db).call(this, "static_assets_cache").whereIn("path", assets.map((a) => a.path));
    const existingAssetPaths = new Set(existingRows.map((r) => r.path));
    const [modified, added] = partition__default["default"](assets, (asset) => existingAssetPaths.has(asset.path));
    __privateGet(this, _logger).info(`Storing ${modified.length} updated assets and ${added.length} new assets`);
    await __privateGet(this, _db).call(this, "static_assets_cache").update({
      last_modified_at: __privateGet(this, _db).fn.now()
    }).whereIn("path", modified.map((a) => a.path));
    for (const asset of added) {
      await __privateGet(this, _db).call(this, "static_assets_cache").insert({
        path: asset.path,
        content: await asset.content()
      }).onConflict("path").ignore();
    }
  }
  async getAsset(path) {
    const [row] = await __privateGet(this, _db).call(this, "static_assets_cache").where({
      path
    });
    if (!row) {
      return void 0;
    }
    return {
      path: row.path,
      content: row.content,
      lastModifiedAt: typeof row.last_modified_at === "string" ? luxon.DateTime.fromSQL(row.last_modified_at, { zone: "UTC" }).toJSDate() : row.last_modified_at
    };
  }
  async trimAssets(options) {
    const { maxAgeSeconds } = options;
    await __privateGet(this, _db).call(this, "static_assets_cache").where("last_modified_at", "<=", __privateGet(this, _db).client.config.client.includes("sqlite3") ? __privateGet(this, _db).raw(`datetime('now', ?)`, [`-${maxAgeSeconds} seconds`]) : __privateGet(this, _db).raw(`now() + interval '${-maxAgeSeconds} seconds'`)).delete();
  }
};
let StaticAssetsStore = _StaticAssetsStore;
_db = new WeakMap();
_logger = new WeakMap();

async function findStaticAssets(staticDir) {
  const assetPaths = await globby__default["default"]("**/*", {
    ignore: ["**/*.map"],
    cwd: staticDir,
    dot: true
  });
  return assetPaths.map((path) => ({
    path,
    content: async () => fs__default["default"].readFile(backendCommon.resolveSafeChildPath(staticDir, path))
  }));
}

const CACHE_CONTROL_NO_CACHE = "no-store, max-age=0";
const CACHE_CONTROL_MAX_CACHE = "public, max-age=1209600";

function createStaticAssetMiddleware(store) {
  return (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      next();
      return;
    }
    Promise.resolve((async () => {
      const path$1 = req.path.startsWith("/") ? req.path.slice(1) : req.path;
      const asset = await store.getAsset(path$1);
      if (!asset) {
        next();
        return;
      }
      const ext = path.extname(asset.path);
      if (ext) {
        res.type(ext);
      } else {
        res.type("bin");
      }
      res.setHeader("Cache-Control", CACHE_CONTROL_MAX_CACHE);
      res.setHeader("Last-Modified", asset.lastModifiedAt.toUTCString());
      res.send(asset.content);
    })()).catch(next);
  };
}

async function createRouter(options) {
  const { config, logger, appPackageName, staticFallbackHandler } = options;
  const appDistDir = backendCommon.resolvePackagePath(appPackageName, "dist");
  const staticDir = path.resolve(appDistDir, "static");
  if (!await fs__default["default"].pathExists(staticDir)) {
    logger.warn(`Can't serve static app content from ${staticDir}, directory doesn't exist`);
    return Router__default["default"]();
  }
  logger.info(`Serving static app content from ${appDistDir}`);
  if (!options.disableConfigInjection) {
    const appConfigs = await readConfigs({
      config,
      appDistDir,
      env: process.env
    });
    await injectConfig({ appConfigs, logger, staticDir });
  }
  const router = Router__default["default"]();
  router.use(helmet__default["default"].frameguard({ action: "deny" }));
  const staticRouter = Router__default["default"]();
  staticRouter.use(express__default["default"].static(path.resolve(appDistDir, "static"), {
    setHeaders: (res) => {
      res.setHeader("Cache-Control", CACHE_CONTROL_MAX_CACHE);
    }
  }));
  if (options.database) {
    const store = await StaticAssetsStore.create({
      logger,
      database: await options.database.getClient()
    });
    const assets = await findStaticAssets(staticDir);
    await store.storeAssets(assets);
    await store.trimAssets({ maxAgeSeconds: 60 * 60 * 24 * 7 });
    staticRouter.use(createStaticAssetMiddleware(store));
  }
  if (staticFallbackHandler) {
    staticRouter.use(staticFallbackHandler);
  }
  staticRouter.use(backendCommon.notFoundHandler());
  router.use("/static", staticRouter);
  router.use(express__default["default"].static(appDistDir, {
    setHeaders: (res, path) => {
      if (express__default["default"].static.mime.lookup(path) === "text/html") {
        res.setHeader("Cache-Control", CACHE_CONTROL_NO_CACHE);
      }
    }
  }));
  router.get("/*", (_req, res) => {
    res.sendFile(path.resolve(appDistDir, "index.html"), {
      headers: {
        "cache-control": CACHE_CONTROL_NO_CACHE
      }
    });
  });
  return router;
}

exports.createRouter = createRouter;
//# sourceMappingURL=index.cjs.js.map
