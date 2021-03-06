'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var errors = require('@backstage/errors');
var yaml = require('yaml');
var path = require('path');
var Ajv = require('ajv');
var mergeAllOf = require('json-schema-merge-allof');
var traverse = require('json-schema-traverse');
var config = require('@backstage/config');
var fs = require('fs-extra');
var chokidar = require('chokidar');
var fetch = require('node-fetch');

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

var yaml__default = /*#__PURE__*/_interopDefaultLegacy(yaml);
var Ajv__default = /*#__PURE__*/_interopDefaultLegacy(Ajv);
var mergeAllOf__default = /*#__PURE__*/_interopDefaultLegacy(mergeAllOf);
var traverse__default = /*#__PURE__*/_interopDefaultLegacy(traverse);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var chokidar__default = /*#__PURE__*/_interopDefaultLegacy(chokidar);
var fetch__default = /*#__PURE__*/_interopDefaultLegacy(fetch);

const ENV_PREFIX = "APP_CONFIG_";
const CONFIG_KEY_PART_PATTERN = /^[a-z][a-z0-9]*(?:[-_][a-z][a-z0-9]*)*$/i;
function readEnvConfig(env) {
  var _a;
  let data = void 0;
  for (const [name, value] of Object.entries(env)) {
    if (!value) {
      continue;
    }
    if (name.startsWith(ENV_PREFIX)) {
      const key = name.replace(ENV_PREFIX, "");
      const keyParts = key.split("_");
      let obj = data = data != null ? data : {};
      for (const [index, part] of keyParts.entries()) {
        if (!CONFIG_KEY_PART_PATTERN.test(part)) {
          throw new TypeError(`Invalid env config key '${key}'`);
        }
        if (index < keyParts.length - 1) {
          obj = obj[part] = (_a = obj[part]) != null ? _a : {};
          if (typeof obj !== "object" || Array.isArray(obj)) {
            const subKey = keyParts.slice(0, index + 1).join("_");
            throw new TypeError(`Could not nest config for key '${key}' under existing value '${subKey}'`);
          }
        } else {
          if (part in obj) {
            throw new TypeError(`Refusing to override existing config at key '${key}'`);
          }
          try {
            const [, parsedValue] = safeJsonParse(value);
            if (parsedValue === null) {
              throw new Error("value may not be null");
            }
            obj[part] = parsedValue;
          } catch (error) {
            throw new TypeError(`Failed to parse JSON-serialized config value for key '${key}', ${error}`);
          }
        }
      }
    }
  }
  return data ? [{ data, context: "env" }] : [];
}
function safeJsonParse(str) {
  try {
    return [null, JSON.parse(str)];
  } catch (err) {
    errors.assertError(err);
    return [err, str];
  }
}

function isObject(obj) {
  if (typeof obj !== "object") {
    return false;
  } else if (Array.isArray(obj)) {
    return false;
  }
  return obj !== null;
}

async function applyConfigTransforms(initialDir, input, transforms) {
  async function transform(inputObj, path, baseDir) {
    var _a;
    let obj = inputObj;
    let dir = baseDir;
    for (const tf of transforms) {
      try {
        const result = await tf(inputObj, baseDir);
        if (result.applied) {
          if (result.value === void 0) {
            return void 0;
          }
          obj = result.value;
          dir = (_a = result.newBaseDir) != null ? _a : dir;
          break;
        }
      } catch (error) {
        errors.assertError(error);
        throw new Error(`error at ${path}, ${error.message}`);
      }
    }
    if (typeof obj !== "object") {
      return obj;
    } else if (obj === null) {
      return void 0;
    } else if (Array.isArray(obj)) {
      const arr = new Array();
      for (const [index, value] of obj.entries()) {
        const out2 = await transform(value, `${path}[${index}]`, dir);
        if (out2 !== void 0) {
          arr.push(out2);
        }
      }
      return arr;
    }
    const out = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== void 0) {
        const result = await transform(value, `${path}.${key}`, dir);
        if (result !== void 0) {
          out[key] = result;
        }
      }
    }
    return out;
  }
  const finalData = await transform(input, "", initialDir);
  if (!isObject(finalData)) {
    throw new TypeError("expected object at config root");
  }
  return finalData;
}

const includeFileParser = {
  ".json": async (content) => JSON.parse(content),
  ".yaml": async (content) => yaml__default["default"].parse(content),
  ".yml": async (content) => yaml__default["default"].parse(content)
};
function createIncludeTransform(env, readFile, substitute) {
  return async (input, baseDir) => {
    if (!isObject(input)) {
      return { applied: false };
    }
    const [includeKey] = Object.keys(input).filter((key) => key.startsWith("$"));
    if (includeKey) {
      if (Object.keys(input).length !== 1) {
        throw new Error(`include key ${includeKey} should not have adjacent keys`);
      }
    } else {
      return { applied: false };
    }
    const rawIncludedValue = input[includeKey];
    if (typeof rawIncludedValue !== "string") {
      throw new Error(`${includeKey} include value is not a string`);
    }
    const substituteResults = await substitute(rawIncludedValue, baseDir);
    const includeValue = substituteResults.applied ? substituteResults.value : rawIncludedValue;
    if (includeValue === void 0 || typeof includeValue !== "string") {
      throw new Error(`${includeKey} substitution value was undefined`);
    }
    switch (includeKey) {
      case "$file":
        try {
          const value = await readFile(path.resolve(baseDir, includeValue));
          return { applied: true, value };
        } catch (error) {
          throw new Error(`failed to read file ${includeValue}, ${error}`);
        }
      case "$env":
        try {
          return { applied: true, value: await env(includeValue) };
        } catch (error) {
          throw new Error(`failed to read env ${includeValue}, ${error}`);
        }
      case "$include": {
        const [filePath, dataPath] = includeValue.split(/#(.*)/);
        const ext = path.extname(filePath);
        const parser = includeFileParser[ext];
        if (!parser) {
          throw new Error(`no configuration parser available for included file ${filePath}`);
        }
        const path$1 = path.resolve(baseDir, filePath);
        const content = await readFile(path$1);
        const newBaseDir = path.dirname(path$1);
        const parts = dataPath ? dataPath.split(".") : [];
        let value;
        try {
          value = await parser(content);
        } catch (error) {
          throw new Error(`failed to parse included file ${filePath}, ${error}`);
        }
        for (const [index, part] of parts.entries()) {
          if (!isObject(value)) {
            const errPath = parts.slice(0, index).join(".");
            throw new Error(`value at '${errPath}' in included file ${filePath} is not an object`);
          }
          value = value[part];
        }
        return {
          applied: true,
          value,
          newBaseDir: newBaseDir !== baseDir ? newBaseDir : void 0
        };
      }
      default:
        throw new Error(`unknown include ${includeKey}`);
    }
  };
}

function createSubstitutionTransform(env) {
  return async (input) => {
    if (typeof input !== "string") {
      return { applied: false };
    }
    const parts = input.split(/(\$?\$\{[^{}]*\})/);
    for (let i = 1; i < parts.length; i += 2) {
      const part = parts[i];
      if (part.startsWith("$$")) {
        parts[i] = part.slice(1);
      } else {
        parts[i] = await env(part.slice(2, -1).trim());
      }
    }
    if (parts.some((part) => part === void 0)) {
      return { applied: true, value: void 0 };
    }
    return { applied: true, value: parts.join("") };
  };
}

const CONFIG_VISIBILITIES = ["frontend", "backend", "secret"];
const DEFAULT_CONFIG_VISIBILITY = "backend";

function compileConfigSchemas(schemas) {
  const visibilityByDataPath = /* @__PURE__ */ new Map();
  const deprecationByDataPath = /* @__PURE__ */ new Map();
  const ajv = new Ajv__default["default"]({
    allErrors: true,
    allowUnionTypes: true,
    schemas: {
      "https://backstage.io/schema/config-v1": true
    }
  }).addKeyword({
    keyword: "visibility",
    metaSchema: {
      type: "string",
      enum: CONFIG_VISIBILITIES
    },
    compile(visibility) {
      return (_data, context) => {
        if ((context == null ? void 0 : context.instancePath) === void 0) {
          return false;
        }
        if (visibility && visibility !== "backend") {
          const normalizedPath = context.instancePath.replace(/\['?(.*?)'?\]/g, (_, segment) => `/${segment}`);
          visibilityByDataPath.set(normalizedPath, visibility);
        }
        return true;
      };
    }
  }).removeKeyword("deprecated").addKeyword({
    keyword: "deprecated",
    metaSchema: { type: "string" },
    compile(deprecationDescription) {
      return (_data, context) => {
        if ((context == null ? void 0 : context.instancePath) === void 0) {
          return false;
        }
        const normalizedPath = context.instancePath.replace(/\['?(.*?)'?\]/g, (_, segment) => `/${segment}`);
        deprecationByDataPath.set(normalizedPath, deprecationDescription);
        return true;
      };
    }
  });
  for (const schema of schemas) {
    try {
      ajv.compile(schema.value);
    } catch (error) {
      throw new Error(`Schema at ${schema.path} is invalid, ${error}`);
    }
  }
  const merged = mergeConfigSchemas(schemas.map((_) => _.value));
  const validate = ajv.compile(merged);
  const visibilityBySchemaPath = /* @__PURE__ */ new Map();
  traverse__default["default"](merged, (schema, path) => {
    if (schema.visibility && schema.visibility !== "backend") {
      visibilityBySchemaPath.set(path, schema.visibility);
    }
  });
  return (configs) => {
    var _a;
    const config$1 = config.ConfigReader.fromConfigs(configs).get();
    visibilityByDataPath.clear();
    const valid = validate(config$1);
    if (!valid) {
      return {
        errors: (_a = validate.errors) != null ? _a : [],
        visibilityByDataPath: new Map(visibilityByDataPath),
        visibilityBySchemaPath,
        deprecationByDataPath
      };
    }
    return {
      visibilityByDataPath: new Map(visibilityByDataPath),
      visibilityBySchemaPath,
      deprecationByDataPath
    };
  };
}
function mergeConfigSchemas(schemas) {
  const merged = mergeAllOf__default["default"]({ allOf: schemas }, {
    ignoreAdditionalProperties: true,
    resolvers: {
      visibility(values, path) {
        const hasFrontend = values.some((_) => _ === "frontend");
        const hasSecret = values.some((_) => _ === "secret");
        if (hasFrontend && hasSecret) {
          throw new Error(`Config schema visibility is both 'frontend' and 'secret' for ${path.join("/")}`);
        } else if (hasFrontend) {
          return "frontend";
        } else if (hasSecret) {
          return "secret";
        }
        return "backend";
      }
    }
  });
  return merged;
}

const req = typeof __non_webpack_require__ === "undefined" ? require : __non_webpack_require__;
async function collectConfigSchemas(packageNames, packagePaths) {
  const schemas = new Array();
  const tsSchemaPaths = new Array();
  const visitedPackageVersions = /* @__PURE__ */ new Map();
  const currentDir = await fs__default["default"].realpath(process.cwd());
  async function processItem(item) {
    var _a, _b, _c, _d;
    let pkgPath = item.packagePath;
    if (pkgPath) {
      const pkgExists = await fs__default["default"].pathExists(pkgPath);
      if (!pkgExists) {
        return;
      }
    } else if (item.name) {
      const { name, parentPath } = item;
      try {
        pkgPath = req.resolve(`${name}/package.json`, parentPath && {
          paths: [parentPath]
        });
      } catch {
      }
    }
    if (!pkgPath) {
      return;
    }
    const pkg = await fs__default["default"].readJson(pkgPath);
    let versions = visitedPackageVersions.get(pkg.name);
    if (versions == null ? void 0 : versions.has(pkg.version)) {
      return;
    }
    if (!versions) {
      versions = /* @__PURE__ */ new Set();
      visitedPackageVersions.set(pkg.name, versions);
    }
    versions.add(pkg.version);
    const depNames = [
      ...Object.keys((_a = pkg.dependencies) != null ? _a : {}),
      ...Object.keys((_b = pkg.devDependencies) != null ? _b : {}),
      ...Object.keys((_c = pkg.optionalDependencies) != null ? _c : {}),
      ...Object.keys((_d = pkg.peerDependencies) != null ? _d : {})
    ];
    const hasSchema = "configSchema" in pkg;
    const hasBackstageDep = depNames.some((_) => _.startsWith("@backstage/"));
    if (!hasSchema && !hasBackstageDep) {
      return;
    }
    if (hasSchema) {
      if (typeof pkg.configSchema === "string") {
        const isJson = pkg.configSchema.endsWith(".json");
        const isDts = pkg.configSchema.endsWith(".d.ts");
        if (!isJson && !isDts) {
          throw new Error(`Config schema files must be .json or .d.ts, got ${pkg.configSchema}`);
        }
        if (isDts) {
          tsSchemaPaths.push(path.relative(currentDir, path.resolve(path.dirname(pkgPath), pkg.configSchema)));
        } else {
          const path$1 = path.resolve(path.dirname(pkgPath), pkg.configSchema);
          const value = await fs__default["default"].readJson(path$1);
          schemas.push({
            value,
            path: path.relative(currentDir, path$1)
          });
        }
      } else {
        schemas.push({
          value: pkg.configSchema,
          path: path.relative(currentDir, pkgPath)
        });
      }
    }
    await Promise.all(depNames.map((depName) => processItem({ name: depName, parentPath: pkgPath })));
  }
  await Promise.all([
    ...packageNames.map((name) => processItem({ name, parentPath: currentDir })),
    ...packagePaths.map((path) => processItem({ name: path, packagePath: path }))
  ]);
  const tsSchemas = await compileTsSchemas(tsSchemaPaths);
  return schemas.concat(tsSchemas);
}
async function compileTsSchemas(paths) {
  if (paths.length === 0) {
    return [];
  }
  const { getProgramFromFiles, generateSchema } = await Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('typescript-json-schema')); });
  const program = getProgramFromFiles(paths, {
    incremental: false,
    isolatedModules: true,
    lib: ["ES5"],
    noEmit: true,
    noResolve: true,
    skipLibCheck: true,
    skipDefaultLibCheck: true,
    strict: true,
    typeRoots: [],
    types: []
  });
  const tsSchemas = paths.map((path$1) => {
    let value;
    try {
      value = generateSchema(program, "Config", {
        required: true,
        validationKeywords: ["visibility", "deprecated"]
      }, [path$1.split(path.sep).join("/")]);
    } catch (error) {
      errors.assertError(error);
      if (error.message !== "type Config not found") {
        throw error;
      }
    }
    if (!value) {
      throw new Error(`Invalid schema in ${path$1}, missing Config export`);
    }
    return { path: path$1, value };
  });
  return tsSchemas;
}

function filterByVisibility(data, includeVisibilities, visibilityByDataPath, deprecationByDataPath, transformFunc, withFilteredKeys, withDeprecatedKeys) {
  var _a;
  const filteredKeys = new Array();
  const deprecatedKeys = new Array();
  function transform(jsonVal, visibilityPath, filterPath) {
    var _a2;
    const visibility = (_a2 = visibilityByDataPath.get(visibilityPath)) != null ? _a2 : DEFAULT_CONFIG_VISIBILITY;
    const isVisible = includeVisibilities.includes(visibility);
    const deprecation = deprecationByDataPath.get(visibilityPath);
    if (deprecation) {
      deprecatedKeys.push({ key: filterPath, description: deprecation });
    }
    if (typeof jsonVal !== "object") {
      if (isVisible) {
        if (transformFunc) {
          return transformFunc(jsonVal, { visibility });
        }
        return jsonVal;
      }
      if (withFilteredKeys) {
        filteredKeys.push(filterPath);
      }
      return void 0;
    } else if (jsonVal === null) {
      return void 0;
    } else if (Array.isArray(jsonVal)) {
      const arr = new Array();
      for (const [index, value] of jsonVal.entries()) {
        let path = visibilityPath;
        const hasVisibilityInIndex = visibilityByDataPath.get(`${visibilityPath}/${index}`);
        if (hasVisibilityInIndex || typeof value === "object") {
          path = `${visibilityPath}/${index}`;
        }
        const out = transform(value, path, `${filterPath}[${index}]`);
        if (out !== void 0) {
          arr.push(out);
        }
      }
      if (arr.length > 0 || isVisible) {
        return arr;
      }
      return void 0;
    }
    const outObj = {};
    let hasOutput = false;
    for (const [key, value] of Object.entries(jsonVal)) {
      if (value === void 0) {
        continue;
      }
      const out = transform(value, `${visibilityPath}/${key}`, filterPath ? `${filterPath}.${key}` : key);
      if (out !== void 0) {
        outObj[key] = out;
        hasOutput = true;
      }
    }
    if (hasOutput || isVisible) {
      return outObj;
    }
    return void 0;
  }
  return {
    filteredKeys: withFilteredKeys ? filteredKeys : void 0,
    deprecatedKeys: withDeprecatedKeys ? deprecatedKeys : void 0,
    data: (_a = transform(data, "", "")) != null ? _a : {}
  };
}
function filterErrorsByVisibility(errors, includeVisibilities, visibilityByDataPath, visibilityBySchemaPath) {
  if (!errors) {
    return [];
  }
  if (!includeVisibilities) {
    return errors;
  }
  const visibleSchemaPaths = Array.from(visibilityBySchemaPath).filter(([, v]) => includeVisibilities.includes(v)).map(([k]) => k);
  return errors.filter((error) => {
    var _a;
    if (error.keyword === "type" && ["object", "array"].includes(error.params.type)) {
      return true;
    }
    if (error.keyword === "required") {
      const trimmedPath = error.schemaPath.slice(1, -"/required".length);
      const fullPath = `${trimmedPath}/properties/${error.params.missingProperty}`;
      if (visibleSchemaPaths.some((visiblePath) => visiblePath.startsWith(fullPath))) {
        return true;
      }
    }
    const vis = (_a = visibilityByDataPath.get(error.instancePath)) != null ? _a : DEFAULT_CONFIG_VISIBILITY;
    return vis && includeVisibilities.includes(vis);
  });
}

function errorsToError(errors) {
  const messages = errors.map(({ instancePath, message, params }) => {
    const paramStr = Object.entries(params).map(([name, value]) => `${name}=${value}`).join(" ");
    return `Config ${message || ""} { ${paramStr} } at ${instancePath}`;
  });
  const error = new Error(`Config validation failed, ${messages.join("; ")}`);
  error.messages = messages;
  return error;
}
async function loadConfigSchema(options) {
  var _a;
  let schemas;
  if ("dependencies" in options) {
    schemas = await collectConfigSchemas(options.dependencies, (_a = options.packagePaths) != null ? _a : []);
  } else {
    const { serialized } = options;
    if ((serialized == null ? void 0 : serialized.backstageConfigSchemaVersion) !== 1) {
      throw new Error("Serialized configuration schema is invalid or has an invalid version number");
    }
    schemas = serialized.schemas;
  }
  const validate = compileConfigSchemas(schemas);
  return {
    process(configs, {
      visibility,
      valueTransform,
      withFilteredKeys,
      withDeprecatedKeys,
      ignoreSchemaErrors
    } = {}) {
      const result = validate(configs);
      if (!ignoreSchemaErrors) {
        const visibleErrors = filterErrorsByVisibility(result.errors, visibility, result.visibilityByDataPath, result.visibilityBySchemaPath);
        if (visibleErrors.length > 0) {
          throw errorsToError(visibleErrors);
        }
      }
      let processedConfigs = configs;
      if (visibility) {
        processedConfigs = processedConfigs.map(({ data, context }) => ({
          context,
          ...filterByVisibility(data, visibility, result.visibilityByDataPath, result.deprecationByDataPath, valueTransform, withFilteredKeys, withDeprecatedKeys)
        }));
      } else if (valueTransform) {
        processedConfigs = processedConfigs.map(({ data, context }) => ({
          context,
          ...filterByVisibility(data, Array.from(CONFIG_VISIBILITIES), result.visibilityByDataPath, result.deprecationByDataPath, valueTransform, withFilteredKeys, withDeprecatedKeys)
        }));
      }
      return processedConfigs;
    },
    serialize() {
      return {
        schemas,
        backstageConfigSchemaVersion: 1
      };
    }
  };
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

async function loadConfig(options) {
  const { configRoot, experimentalEnvFunc: envFunc, watch, remote } = options;
  const configPaths = options.configTargets.slice().filter((e) => e.hasOwnProperty("path")).map((configTarget) => configTarget.path);
  const configUrls = options.configTargets.slice().filter((e) => e.hasOwnProperty("url")).map((configTarget) => configTarget.url);
  if (remote === void 0) {
    if (configUrls.length > 0) {
      throw new Error(`Please make sure you are passing the remote option when loading remote configurations. See https://backstage.io/docs/conf/writing#configuration-files for detailed info.`);
    }
  } else if (remote.reloadIntervalSeconds <= 0) {
    throw new Error(`Remote config must be contain a non zero reloadIntervalSeconds: <seconds> value`);
  }
  if (configPaths.length === 0 && configUrls.length === 0) {
    configPaths.push(path.resolve(configRoot, "app-config.yaml"));
    const localConfig = path.resolve(configRoot, "app-config.local.yaml");
    if (await fs__default["default"].pathExists(localConfig)) {
      configPaths.push(localConfig);
    }
  }
  const env = envFunc != null ? envFunc : async (name) => process.env[name];
  const loadConfigFiles = async () => {
    const fileConfigs2 = [];
    const loadedPaths2 = /* @__PURE__ */ new Set();
    for (const configPath of configPaths) {
      if (!path.isAbsolute(configPath)) {
        throw new Error(`Config load path is not absolute: '${configPath}'`);
      }
      const dir = path.dirname(configPath);
      const readFile = (path$1) => {
        const fullPath = path.resolve(dir, path$1);
        loadedPaths2.add(fullPath);
        return fs__default["default"].readFile(fullPath, "utf8");
      };
      const input = yaml__default["default"].parse(await readFile(configPath));
      if (input !== null) {
        const substitutionTransform = createSubstitutionTransform(env);
        const data = await applyConfigTransforms(dir, input, [
          createIncludeTransform(env, readFile, substitutionTransform),
          substitutionTransform
        ]);
        fileConfigs2.push({ data, context: path.basename(configPath) });
      }
    }
    return { fileConfigs: fileConfigs2, loadedPaths: loadedPaths2 };
  };
  const loadRemoteConfigFiles = async () => {
    const configs = [];
    const readConfigFromUrl = async (url) => {
      const response = await fetch__default["default"](url);
      if (!response.ok) {
        throw new Error(`Could not read config file at ${url}`);
      }
      return await response.text();
    };
    for (let i = 0; i < configUrls.length; i++) {
      const configUrl = configUrls[i];
      if (!isValidUrl(configUrl)) {
        throw new Error(`Config load path is not valid: '${configUrl}'`);
      }
      const remoteConfigContent = await readConfigFromUrl(configUrl);
      if (!remoteConfigContent) {
        throw new Error(`Config is not valid`);
      }
      const configYaml = yaml__default["default"].parse(remoteConfigContent);
      const substitutionTransform = createSubstitutionTransform(env);
      const data = await applyConfigTransforms(configRoot, configYaml, [
        substitutionTransform
      ]);
      configs.push({ data, context: configUrl });
    }
    return configs;
  };
  let fileConfigs;
  let loadedPaths;
  try {
    ({ fileConfigs, loadedPaths } = await loadConfigFiles());
  } catch (error) {
    throw new errors.ForwardedError("Failed to read static configuration file", error);
  }
  let remoteConfigs = [];
  if (remote) {
    try {
      remoteConfigs = await loadRemoteConfigFiles();
    } catch (error) {
      throw new errors.ForwardedError(`Failed to read remote configuration file`, error);
    }
  }
  const envConfigs = readEnvConfig(process.env);
  const watchConfigFile = (watchProp) => {
    let watchedFiles = Array.from(loadedPaths);
    const watcher = chokidar__default["default"].watch(watchedFiles, {
      usePolling: process.env.NODE_ENV === "test"
    });
    let currentSerializedConfig = JSON.stringify(fileConfigs);
    watcher.on("change", async () => {
      try {
        const { fileConfigs: newConfigs, loadedPaths: newLoadedPaths } = await loadConfigFiles();
        watcher.unwatch(watchedFiles);
        watchedFiles = Array.from(newLoadedPaths);
        watcher.add(watchedFiles);
        const newSerializedConfig = JSON.stringify(newConfigs);
        if (currentSerializedConfig === newSerializedConfig) {
          return;
        }
        currentSerializedConfig = newSerializedConfig;
        watchProp.onChange([...remoteConfigs, ...newConfigs, ...envConfigs]);
      } catch (error) {
        console.error(`Failed to reload configuration files, ${error}`);
      }
    });
    if (watchProp.stopSignal) {
      watchProp.stopSignal.then(() => {
        watcher.close();
      });
    }
  };
  const watchRemoteConfig = (watchProp, remoteProp) => {
    const hasConfigChanged = async (oldRemoteConfigs, newRemoteConfigs) => {
      return JSON.stringify(oldRemoteConfigs) !== JSON.stringify(newRemoteConfigs);
    };
    let handle;
    try {
      handle = setInterval(async () => {
        console.info(`Checking for config update`);
        const newRemoteConfigs = await loadRemoteConfigFiles();
        if (await hasConfigChanged(remoteConfigs, newRemoteConfigs)) {
          remoteConfigs = newRemoteConfigs;
          console.info(`Remote config change, reloading config ...`);
          watchProp.onChange([...remoteConfigs, ...fileConfigs, ...envConfigs]);
          console.info(`Remote config reloaded`);
        }
      }, remoteProp.reloadIntervalSeconds * 1e3);
    } catch (error) {
      console.error(`Failed to reload configuration files, ${error}`);
    }
    if (watchProp.stopSignal) {
      watchProp.stopSignal.then(() => {
        if (handle !== void 0) {
          console.info(`Stopping remote config watch`);
          clearInterval(handle);
          handle = void 0;
        }
      });
    }
  };
  if (watch) {
    watchConfigFile(watch);
  }
  if (watch && remote) {
    watchRemoteConfig(watch, remote);
  }
  return {
    appConfigs: remote ? [...remoteConfigs, ...fileConfigs, ...envConfigs] : [...fileConfigs, ...envConfigs]
  };
}

exports.loadConfig = loadConfig;
exports.loadConfigSchema = loadConfigSchema;
exports.mergeConfigSchemas = mergeConfigSchemas;
exports.readEnvConfig = readEnvConfig;
//# sourceMappingURL=index.cjs.js.map
