'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var path = require('path');
var integration = require('@backstage/integration');
var backendCommon = require('@backstage/backend-common');
var errors = require('@backstage/errors');
var child_process = require('child_process');
var fs = require('fs-extra');
var gitUrlParse = require('git-url-parse');
var yaml = require('js-yaml');
var stream = require('stream');
var catalogModel = require('@backstage/catalog-model');
var mime = require('mime-types');
var createLimiter = require('p-limit');
var recursiveReadDir = require('recursive-readdir');
var aws = require('aws-sdk');
var JSON5 = require('json5');
var identity = require('@azure/identity');
var storageBlob = require('@azure/storage-blob');
var storage = require('@google-cloud/storage');
var express = require('express');
var os = require('os');
var openstackSwiftSdk = require('@trendyol-js/openstack-swift-sdk');
var types = require('@trendyol-js/openstack-swift-sdk/lib/types');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var gitUrlParse__default = /*#__PURE__*/_interopDefaultLegacy(gitUrlParse);
var yaml__default = /*#__PURE__*/_interopDefaultLegacy(yaml);
var mime__default = /*#__PURE__*/_interopDefaultLegacy(mime);
var createLimiter__default = /*#__PURE__*/_interopDefaultLegacy(createLimiter);
var recursiveReadDir__default = /*#__PURE__*/_interopDefaultLegacy(recursiveReadDir);
var aws__default = /*#__PURE__*/_interopDefaultLegacy(aws);
var JSON5__default = /*#__PURE__*/_interopDefaultLegacy(JSON5);
var express__default = /*#__PURE__*/_interopDefaultLegacy(express);
var os__default = /*#__PURE__*/_interopDefaultLegacy(os);

const getContentTypeForExtension = (ext) => {
  const defaultContentType = "text/plain; charset=utf-8";
  if (ext.match(/htm|xml|svg/i)) {
    return defaultContentType;
  }
  return mime__default["default"].contentType(ext) || defaultContentType;
};
const getHeadersForFileExtension = (fileExtension) => {
  return {
    "Content-Type": getContentTypeForExtension(fileExtension)
  };
};
const getFileTreeRecursively = async (rootDirPath) => {
  const fileList = await recursiveReadDir__default["default"](rootDirPath).catch((error) => {
    throw new Error(`Failed to read template directory: ${error.message}`);
  });
  return fileList;
};
const lowerCaseEntityTriplet = (posixPath) => {
  const [namespace, kind, name, ...rest] = posixPath.split(path__default["default"].posix.sep);
  const lowerNamespace = namespace.toLowerCase();
  const lowerKind = kind.toLowerCase();
  const lowerName = name.toLowerCase();
  return [lowerNamespace, lowerKind, lowerName, ...rest].join(path__default["default"].posix.sep);
};
const lowerCaseEntityTripletInStoragePath = (originalPath) => {
  let posixPath = originalPath;
  if (originalPath.includes(path__default["default"].win32.sep)) {
    posixPath = originalPath.split(path__default["default"].win32.sep).join(path__default["default"].posix.sep);
  }
  const parts = posixPath.split(path__default["default"].posix.sep);
  if (parts[0] === "") {
    parts.shift();
  }
  if (parts.length <= 3) {
    throw new Error(`Encountered file unmanaged by TechDocs ${originalPath}. Skipping.`);
  }
  return lowerCaseEntityTriplet(parts.join(path__default["default"].posix.sep));
};
const normalizeExternalStorageRootPath = (posixPath) => {
  let normalizedPath = posixPath;
  if (posixPath.startsWith(path__default["default"].posix.sep)) {
    normalizedPath = posixPath.slice(1);
  }
  if (normalizedPath.endsWith(path__default["default"].posix.sep)) {
    normalizedPath = normalizedPath.slice(0, normalizedPath.length - 1);
  }
  return normalizedPath;
};
const getStaleFiles = (newFiles, oldFiles) => {
  const staleFiles = new Set(oldFiles);
  newFiles.forEach((newFile) => {
    staleFiles.delete(newFile);
  });
  return Array.from(staleFiles);
};
const getCloudPathForLocalPath = (entity, localPath = "", useLegacyPathCasing = false, externalStorageRootPath = "") => {
  var _a, _b;
  const relativeFilePathPosix = localPath.split(path__default["default"].sep).join(path__default["default"].posix.sep);
  const entityRootDir = `${(_b = (_a = entity.metadata) == null ? void 0 : _a.namespace) != null ? _b : catalogModel.DEFAULT_NAMESPACE}/${entity.kind}/${entity.metadata.name}`;
  const relativeFilePathTriplet = `${entityRootDir}/${relativeFilePathPosix}`;
  const destination = useLegacyPathCasing ? relativeFilePathTriplet : lowerCaseEntityTriplet(relativeFilePathTriplet);
  const destinationWithRoot = [
    ...externalStorageRootPath.split(path__default["default"].posix.sep).filter((s) => s !== ""),
    destination
  ].join("/");
  return destinationWithRoot;
};
const bulkStorageOperation = async (operation, args, { concurrencyLimit } = { concurrencyLimit: 25 }) => {
  const limiter = createLimiter__default["default"](concurrencyLimit);
  await Promise.all(args.map((arg) => limiter(operation, arg)));
};

function getGeneratorKey(entity) {
  if (!entity) {
    throw new Error("No entity provided");
  }
  return "techdocs";
}
const runCommand = async ({
  command,
  args,
  options,
  logStream = new stream.PassThrough()
}) => {
  await new Promise((resolve, reject) => {
    const process = child_process.spawn(command, args, options);
    process.stdout.on("data", (stream) => {
      logStream.write(stream);
    });
    process.stderr.on("data", (stream) => {
      logStream.write(stream);
    });
    process.on("error", (error) => {
      return reject(error);
    });
    process.on("close", (code) => {
      if (code !== 0) {
        return reject(`Command ${command} failed, exit code: ${code}`);
      }
      return resolve();
    });
  });
};
const getRepoUrlFromLocationAnnotation = (parsedLocationAnnotation, scmIntegrations, docsFolder = "docs") => {
  const { type: locationType, target } = parsedLocationAnnotation;
  if (locationType === "url") {
    const integration = scmIntegrations.byUrl(target);
    if (integration && ["github", "gitlab"].includes(integration.type)) {
      const { filepathtype } = gitUrlParse__default["default"](target);
      if (filepathtype === "") {
        return { repo_url: target };
      }
      const sourceFolder = integration.resolveUrl({
        url: `./${docsFolder}`,
        base: target
      });
      return { edit_uri: integration.resolveEditUrl(sourceFolder) };
    }
  }
  return {};
};
class UnknownTag {
  constructor(data, type) {
    this.data = data;
    this.type = type;
  }
}
const MKDOCS_SCHEMA = yaml.DEFAULT_SCHEMA.extend([
  new yaml.Type("", {
    kind: "scalar",
    multi: true,
    representName: (o) => o.type,
    represent: (o) => {
      var _a;
      return (_a = o.data) != null ? _a : "";
    },
    instanceOf: UnknownTag,
    construct: (data, type) => new UnknownTag(data, type)
  }),
  new yaml.Type("", {
    kind: "sequence",
    multi: true,
    representName: (o) => o.type,
    represent: (o) => {
      var _a;
      return (_a = o.data) != null ? _a : "";
    },
    instanceOf: UnknownTag,
    construct: (data, type) => new UnknownTag(data, type)
  })
]);
const getMkdocsYml = async (inputDir) => {
  let mkdocsYmlPath;
  let mkdocsYmlFileString;
  try {
    mkdocsYmlPath = path__default["default"].join(inputDir, "mkdocs.yaml");
    mkdocsYmlFileString = await fs__default["default"].readFile(mkdocsYmlPath, "utf8");
  } catch {
    try {
      mkdocsYmlPath = path__default["default"].join(inputDir, "mkdocs.yml");
      mkdocsYmlFileString = await fs__default["default"].readFile(mkdocsYmlPath, "utf8");
    } catch (error) {
      throw new errors.ForwardedError("Could not read MkDocs YAML config file mkdocs.yml or mkdocs.yaml for validation", error);
    }
  }
  return {
    path: mkdocsYmlPath,
    content: mkdocsYmlFileString
  };
};
const validateMkdocsYaml = async (inputDir, mkdocsYmlFileString) => {
  const mkdocsYml = yaml__default["default"].load(mkdocsYmlFileString, {
    schema: MKDOCS_SCHEMA
  });
  if (mkdocsYml === null || typeof mkdocsYml !== "object") {
    return void 0;
  }
  const parsedMkdocsYml = mkdocsYml;
  if (parsedMkdocsYml.docs_dir && !backendCommon.isChildPath(inputDir, path.resolve(inputDir, parsedMkdocsYml.docs_dir))) {
    throw new Error(`docs_dir configuration value in mkdocs can't be an absolute directory or start with ../ for security reasons.
       Use relative paths instead which are resolved relative to your mkdocs.yml file location.`);
  }
  return parsedMkdocsYml.docs_dir;
};
const patchIndexPreBuild = async ({
  inputDir,
  logger,
  docsDir = "docs"
}) => {
  const docsPath = path__default["default"].join(inputDir, docsDir);
  const indexMdPath = path__default["default"].join(docsPath, "index.md");
  if (await fs__default["default"].pathExists(indexMdPath)) {
    return;
  }
  logger.warn(`${path__default["default"].join(docsDir, "index.md")} not found.`);
  const fallbacks = [
    path__default["default"].join(docsPath, "README.md"),
    path__default["default"].join(docsPath, "readme.md"),
    path__default["default"].join(inputDir, "README.md"),
    path__default["default"].join(inputDir, "readme.md")
  ];
  await fs__default["default"].ensureDir(docsPath);
  for (const filePath of fallbacks) {
    try {
      await fs__default["default"].copyFile(filePath, indexMdPath);
      return;
    } catch (error) {
      logger.warn(`${path__default["default"].relative(inputDir, filePath)} not found.`);
    }
  }
  logger.warn(`Could not find any techdocs' index file. Please make sure at least one of ${[
    indexMdPath,
    ...fallbacks
  ].join(" ")} exists.`);
};
const createOrUpdateMetadata = async (techdocsMetadataPath, logger) => {
  const techdocsMetadataDir = techdocsMetadataPath.split(path__default["default"].sep).slice(0, -1).join(path__default["default"].sep);
  try {
    await fs__default["default"].access(techdocsMetadataPath, fs__default["default"].constants.F_OK);
  } catch (err) {
    await fs__default["default"].writeJson(techdocsMetadataPath, JSON.parse("{}"));
  }
  let json;
  try {
    json = await fs__default["default"].readJson(techdocsMetadataPath);
  } catch (err) {
    errors.assertError(err);
    const message = `Invalid JSON at ${techdocsMetadataPath} with error ${err.message}`;
    logger.error(message);
    throw new Error(message);
  }
  json.build_timestamp = Date.now();
  try {
    json.files = (await getFileTreeRecursively(techdocsMetadataDir)).map((file) => file.replace(`${techdocsMetadataDir}${path__default["default"].sep}`, ""));
  } catch (err) {
    errors.assertError(err);
    json.files = [];
    logger.warn(`Unable to add files list to metadata: ${err.message}`);
  }
  await fs__default["default"].writeJson(techdocsMetadataPath, json);
  return;
};
const storeEtagMetadata = async (techdocsMetadataPath, etag) => {
  const json = await fs__default["default"].readJson(techdocsMetadataPath);
  json.etag = etag;
  await fs__default["default"].writeJson(techdocsMetadataPath, json);
};

const patchMkdocsFile = async (mkdocsYmlPath, logger, updateAction) => {
  let didEdit = false;
  let mkdocsYmlFileString;
  try {
    mkdocsYmlFileString = await fs__default["default"].readFile(mkdocsYmlPath, "utf8");
  } catch (error) {
    errors.assertError(error);
    logger.warn(`Could not read MkDocs YAML config file ${mkdocsYmlPath} before running the generator: ${error.message}`);
    return;
  }
  let mkdocsYml;
  try {
    mkdocsYml = yaml__default["default"].load(mkdocsYmlFileString, { schema: MKDOCS_SCHEMA });
    if (typeof mkdocsYml === "string" || typeof mkdocsYml === "undefined") {
      throw new Error("Bad YAML format.");
    }
  } catch (error) {
    errors.assertError(error);
    logger.warn(`Error in parsing YAML at ${mkdocsYmlPath} before running the generator. ${error.message}`);
    return;
  }
  didEdit = updateAction(mkdocsYml);
  try {
    if (didEdit) {
      await fs__default["default"].writeFile(mkdocsYmlPath, yaml__default["default"].dump(mkdocsYml, { schema: MKDOCS_SCHEMA }), "utf8");
    }
  } catch (error) {
    errors.assertError(error);
    logger.warn(`Could not write to ${mkdocsYmlPath} after updating it before running the generator. ${error.message}`);
    return;
  }
};
const patchMkdocsYmlPreBuild = async (mkdocsYmlPath, logger, parsedLocationAnnotation, scmIntegrations) => {
  await patchMkdocsFile(mkdocsYmlPath, logger, (mkdocsYml) => {
    if (!("repo_url" in mkdocsYml) && !("edit_uri" in mkdocsYml)) {
      const result = getRepoUrlFromLocationAnnotation(parsedLocationAnnotation, scmIntegrations, mkdocsYml.docs_dir);
      if (result.repo_url || result.edit_uri) {
        mkdocsYml.repo_url = result.repo_url;
        mkdocsYml.edit_uri = result.edit_uri;
        logger.info(`Set ${JSON.stringify(result)}. You can disable this feature by manually setting 'repo_url' or 'edit_uri' according to the MkDocs documentation at https://www.mkdocs.org/user-guide/configuration/#repo_url`);
        return true;
      }
    }
    return false;
  });
};
const pathMkdocsYmlWithTechdocsPlugin = async (mkdocsYmlPath, logger) => {
  await patchMkdocsFile(mkdocsYmlPath, logger, (mkdocsYml) => {
    if (!("plugins" in mkdocsYml)) {
      mkdocsYml.plugins = ["techdocs-core"];
      return true;
    }
    if (mkdocsYml.plugins && !mkdocsYml.plugins.includes("techdocs-core")) {
      mkdocsYml.plugins.push("techdocs-core");
      return true;
    }
    return false;
  });
};

const _TechdocsGenerator = class {
  static fromConfig(config, options) {
    const { containerRunner, logger } = options;
    const scmIntegrations = integration.ScmIntegrations.fromConfig(config);
    return new _TechdocsGenerator({
      logger,
      containerRunner,
      config,
      scmIntegrations
    });
  }
  constructor(options) {
    this.logger = options.logger;
    this.options = readGeneratorConfig(options.config, options.logger);
    this.containerRunner = options.containerRunner;
    this.scmIntegrations = options.scmIntegrations;
  }
  async run(options) {
    var _a;
    const {
      inputDir,
      outputDir,
      parsedLocationAnnotation,
      etag,
      logger: childLogger,
      logStream
    } = options;
    const { path: mkdocsYmlPath, content } = await getMkdocsYml(inputDir);
    const docsDir = await validateMkdocsYaml(inputDir, content);
    if (parsedLocationAnnotation) {
      await patchMkdocsYmlPreBuild(mkdocsYmlPath, childLogger, parsedLocationAnnotation, this.scmIntegrations);
      if (this.options.legacyCopyReadmeMdToIndexMd) {
        await patchIndexPreBuild({ inputDir, logger: childLogger, docsDir });
      }
    }
    if (!this.options.omitTechdocsCoreMkdocsPlugin) {
      await pathMkdocsYmlWithTechdocsPlugin(mkdocsYmlPath, childLogger);
    }
    const mountDirs = {
      [inputDir]: "/input",
      [outputDir]: "/output"
    };
    try {
      switch (this.options.runIn) {
        case "local":
          await runCommand({
            command: "mkdocs",
            args: ["build", "-d", outputDir, "-v"],
            options: {
              cwd: inputDir
            },
            logStream
          });
          childLogger.info(`Successfully generated docs from ${inputDir} into ${outputDir} using local mkdocs`);
          break;
        case "docker":
          await this.containerRunner.runContainer({
            imageName: (_a = this.options.dockerImage) != null ? _a : _TechdocsGenerator.defaultDockerImage,
            args: ["build", "-d", "/output"],
            logStream,
            mountDirs,
            workingDir: "/input",
            envVars: { HOME: "/tmp" },
            pullImage: this.options.pullImage
          });
          childLogger.info(`Successfully generated docs from ${inputDir} into ${outputDir} using techdocs-container`);
          break;
        default:
          throw new Error(`Invalid config value "${this.options.runIn}" provided in 'techdocs.generators.techdocs'.`);
      }
    } catch (error) {
      this.logger.debug(`Failed to generate docs from ${inputDir} into ${outputDir}`);
      throw new errors.ForwardedError(`Failed to generate docs from ${inputDir} into ${outputDir}`, error);
    }
    await createOrUpdateMetadata(path__default["default"].join(outputDir, "techdocs_metadata.json"), childLogger);
    if (etag) {
      await storeEtagMetadata(path__default["default"].join(outputDir, "techdocs_metadata.json"), etag);
    }
  }
};
let TechdocsGenerator = _TechdocsGenerator;
TechdocsGenerator.defaultDockerImage = "spotify/techdocs:v1.0.3";
function readGeneratorConfig(config, logger) {
  var _a;
  const legacyGeneratorType = config.getOptionalString("techdocs.generators.techdocs");
  if (legacyGeneratorType) {
    logger.warn(`The 'techdocs.generators.techdocs' configuration key is deprecated and will be removed in the future. Please use 'techdocs.generator' instead. See here https://backstage.io/docs/features/techdocs/configuration`);
  }
  return {
    runIn: (_a = legacyGeneratorType != null ? legacyGeneratorType : config.getOptionalString("techdocs.generator.runIn")) != null ? _a : "docker",
    dockerImage: config.getOptionalString("techdocs.generator.dockerImage"),
    pullImage: config.getOptionalBoolean("techdocs.generator.pullImage"),
    omitTechdocsCoreMkdocsPlugin: config.getOptionalBoolean("techdocs.generator.mkdocs.omitTechdocsCorePlugin"),
    legacyCopyReadmeMdToIndexMd: config.getOptionalBoolean("techdocs.generator.mkdocs.legacyCopyReadmeMdToIndexMd")
  };
}

class Generators {
  constructor() {
    this.generatorMap = /* @__PURE__ */ new Map();
  }
  static async fromConfig(config, options) {
    const generators = new Generators();
    const techdocsGenerator = TechdocsGenerator.fromConfig(config, options);
    generators.register("techdocs", techdocsGenerator);
    return generators;
  }
  register(generatorKey, generator) {
    this.generatorMap.set(generatorKey, generator);
  }
  get(entity) {
    const generatorKey = getGeneratorKey(entity);
    const generator = this.generatorMap.get(generatorKey);
    if (!generator) {
      throw new Error(`No generator registered for entity: "${generatorKey}"`);
    }
    return generator;
  }
}

const parseReferenceAnnotation = (annotationName, entity) => {
  var _a;
  const annotation = (_a = entity.metadata.annotations) == null ? void 0 : _a[annotationName];
  if (!annotation) {
    throw new errors.InputError(`No location annotation provided in entity: ${entity.metadata.name}`);
  }
  const { type, target } = catalogModel.parseLocationRef(annotation);
  return {
    type,
    target
  };
};
const transformDirLocation = (entity, dirAnnotation, scmIntegrations) => {
  const location = catalogModel.getEntitySourceLocation(entity);
  switch (location.type) {
    case "url": {
      const target = scmIntegrations.resolveUrl({
        url: dirAnnotation.target,
        base: location.target
      });
      return {
        type: "url",
        target
      };
    }
    case "file": {
      const target = backendCommon.resolveSafeChildPath(path__default["default"].dirname(location.target), dirAnnotation.target);
      return {
        type: "dir",
        target
      };
    }
    default:
      throw new errors.InputError(`Unable to resolve location type ${location.type}`);
  }
};
const getLocationForEntity = (entity, scmIntegration) => {
  const annotation = parseReferenceAnnotation("backstage.io/techdocs-ref", entity);
  switch (annotation.type) {
    case "url":
      return annotation;
    case "dir":
      return transformDirLocation(entity, annotation, scmIntegration);
    default:
      throw new Error(`Invalid reference annotation ${annotation.type}`);
  }
};
const getDocFilesFromRepository = async (reader, entity, opts) => {
  var _a, _b;
  const { target } = parseReferenceAnnotation("backstage.io/techdocs-ref", entity);
  (_a = opts == null ? void 0 : opts.logger) == null ? void 0 : _a.debug(`Reading files from ${target}`);
  const readTreeResponse = await reader.readTree(target, { etag: opts == null ? void 0 : opts.etag });
  const preparedDir = await readTreeResponse.dir();
  (_b = opts == null ? void 0 : opts.logger) == null ? void 0 : _b.debug(`Tree downloaded and stored at ${preparedDir}`);
  return {
    preparedDir,
    etag: readTreeResponse.etag
  };
};

class DirectoryPreparer {
  static fromConfig(config, { logger, reader }) {
    return new DirectoryPreparer(config, logger, reader);
  }
  constructor(config, _logger, reader) {
    this.reader = reader;
    this.scmIntegrations = integration.ScmIntegrations.fromConfig(config);
  }
  async prepare(entity, options) {
    var _a, _b;
    const annotation = parseReferenceAnnotation("backstage.io/techdocs-ref", entity);
    const { type, target } = transformDirLocation(entity, annotation, this.scmIntegrations);
    switch (type) {
      case "url": {
        (_a = options == null ? void 0 : options.logger) == null ? void 0 : _a.debug(`Reading files from ${target}`);
        const response = await this.reader.readTree(target, {
          etag: options == null ? void 0 : options.etag
        });
        const preparedDir = await response.dir();
        (_b = options == null ? void 0 : options.logger) == null ? void 0 : _b.debug(`Tree downloaded and stored at ${preparedDir}`);
        return {
          preparedDir,
          etag: response.etag
        };
      }
      case "dir": {
        return {
          preparedDir: target,
          etag: ""
        };
      }
      default:
        throw new errors.InputError(`Unable to resolve location type ${type}`);
    }
  }
}

class UrlPreparer {
  static fromConfig({ reader, logger }) {
    return new UrlPreparer(reader, logger);
  }
  constructor(reader, logger) {
    this.logger = logger;
    this.reader = reader;
  }
  async prepare(entity, options) {
    try {
      return await getDocFilesFromRepository(this.reader, entity, {
        etag: options == null ? void 0 : options.etag,
        logger: this.logger
      });
    } catch (error) {
      errors.assertError(error);
      if (error.name === "NotModifiedError") {
        this.logger.debug(`Cache is valid for etag ${options == null ? void 0 : options.etag}`);
      } else {
        this.logger.debug(`Unable to fetch files for building docs ${error.message}`);
      }
      throw error;
    }
  }
}

class Preparers {
  constructor() {
    this.preparerMap = /* @__PURE__ */ new Map();
  }
  static async fromConfig(backstageConfig, { logger, reader }) {
    const preparers = new Preparers();
    const urlPreparer = UrlPreparer.fromConfig({ reader, logger });
    preparers.register("url", urlPreparer);
    const directoryPreparer = DirectoryPreparer.fromConfig(backstageConfig, {
      logger,
      reader
    });
    preparers.register("dir", directoryPreparer);
    return preparers;
  }
  register(protocol, preparer) {
    this.preparerMap.set(protocol, preparer);
  }
  get(entity) {
    const { type } = parseReferenceAnnotation("backstage.io/techdocs-ref", entity);
    const preparer = this.preparerMap.get(type);
    if (!preparer) {
      throw new Error(`No preparer registered for type: "${type}"`);
    }
    return preparer;
  }
}

const streamToBuffer$1 = (stream) => {
  return new Promise((resolve, reject) => {
    try {
      const chunks = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("error", reject);
      stream.on("end", () => resolve(Buffer.concat(chunks)));
    } catch (e) {
      throw new errors.ForwardedError("Unable to parse the response data", e);
    }
  });
};
class AwsS3Publish {
  constructor(options) {
    this.storageClient = options.storageClient;
    this.bucketName = options.bucketName;
    this.legacyPathCasing = options.legacyPathCasing;
    this.logger = options.logger;
    this.bucketRootPath = options.bucketRootPath;
    this.sse = options.sse;
  }
  static fromConfig(config, logger) {
    let bucketName = "";
    try {
      bucketName = config.getString("techdocs.publisher.awsS3.bucketName");
    } catch (error) {
      throw new Error("Since techdocs.publisher.type is set to 'awsS3' in your app config, techdocs.publisher.awsS3.bucketName is required.");
    }
    const bucketRootPath = normalizeExternalStorageRootPath(config.getOptionalString("techdocs.publisher.awsS3.bucketRootPath") || "");
    const sse = config.getOptionalString("techdocs.publisher.awsS3.sse");
    const credentialsConfig = config.getOptionalConfig("techdocs.publisher.awsS3.credentials");
    const credentials = AwsS3Publish.buildCredentials(credentialsConfig);
    const region = config.getOptionalString("techdocs.publisher.awsS3.region");
    const endpoint = config.getOptionalString("techdocs.publisher.awsS3.endpoint");
    const s3ForcePathStyle = config.getOptionalBoolean("techdocs.publisher.awsS3.s3ForcePathStyle");
    const storageClient = new aws__default["default"].S3({
      credentials,
      ...region && { region },
      ...endpoint && { endpoint },
      ...s3ForcePathStyle && { s3ForcePathStyle }
    });
    const legacyPathCasing = config.getOptionalBoolean("techdocs.legacyUseCaseSensitiveTripletPaths") || false;
    return new AwsS3Publish({
      storageClient,
      bucketName,
      bucketRootPath,
      legacyPathCasing,
      logger,
      sse
    });
  }
  static buildCredentials(config) {
    if (!config) {
      return void 0;
    }
    const accessKeyId = config.getOptionalString("accessKeyId");
    const secretAccessKey = config.getOptionalString("secretAccessKey");
    let explicitCredentials;
    if (accessKeyId && secretAccessKey) {
      explicitCredentials = new aws.Credentials({
        accessKeyId,
        secretAccessKey
      });
    }
    const roleArn = config.getOptionalString("roleArn");
    if (roleArn) {
      return new aws__default["default"].ChainableTemporaryCredentials({
        masterCredentials: explicitCredentials,
        params: {
          RoleSessionName: "backstage-aws-techdocs-s3-publisher",
          RoleArn: roleArn
        }
      });
    }
    return explicitCredentials;
  }
  async getReadiness() {
    try {
      await this.storageClient.headBucket({ Bucket: this.bucketName }).promise();
      this.logger.info(`Successfully connected to the AWS S3 bucket ${this.bucketName}.`);
      return { isAvailable: true };
    } catch (error) {
      this.logger.error(`Could not retrieve metadata about the AWS S3 bucket ${this.bucketName}. Make sure the bucket exists. Also make sure that authentication is setup either by explicitly defining credentials and region in techdocs.publisher.awsS3 in app config or by using environment variables. Refer to https://backstage.io/docs/features/techdocs/using-cloud-storage`);
      this.logger.error(`from AWS client library`, error);
      return {
        isAvailable: false
      };
    }
  }
  async publish({
    entity,
    directory
  }) {
    const objects = [];
    const useLegacyPathCasing = this.legacyPathCasing;
    const bucketRootPath = this.bucketRootPath;
    const sse = this.sse;
    let existingFiles = [];
    try {
      const remoteFolder = getCloudPathForLocalPath(entity, void 0, useLegacyPathCasing, bucketRootPath);
      existingFiles = await this.getAllObjectsFromBucket({
        prefix: remoteFolder
      });
    } catch (e) {
      errors.assertError(e);
      this.logger.error(`Unable to list files for Entity ${entity.metadata.name}: ${e.message}`);
    }
    let absoluteFilesToUpload;
    try {
      absoluteFilesToUpload = await getFileTreeRecursively(directory);
      await bulkStorageOperation(async (absoluteFilePath) => {
        const relativeFilePath = path__default["default"].relative(directory, absoluteFilePath);
        const fileStream = fs__default["default"].createReadStream(absoluteFilePath);
        const params = {
          Bucket: this.bucketName,
          Key: getCloudPathForLocalPath(entity, relativeFilePath, useLegacyPathCasing, bucketRootPath),
          Body: fileStream,
          ...sse && { ServerSideEncryption: sse }
        };
        objects.push(params.Key);
        return this.storageClient.upload(params).promise();
      }, absoluteFilesToUpload, { concurrencyLimit: 10 });
      this.logger.info(`Successfully uploaded all the generated files for Entity ${entity.metadata.name}. Total number of files: ${absoluteFilesToUpload.length}`);
    } catch (e) {
      const errorMessage = `Unable to upload file(s) to AWS S3. ${e}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    try {
      const relativeFilesToUpload = absoluteFilesToUpload.map((absoluteFilePath) => getCloudPathForLocalPath(entity, path__default["default"].relative(directory, absoluteFilePath), useLegacyPathCasing, bucketRootPath));
      const staleFiles = getStaleFiles(relativeFilesToUpload, existingFiles);
      await bulkStorageOperation(async (relativeFilePath) => {
        return await this.storageClient.deleteObject({
          Bucket: this.bucketName,
          Key: relativeFilePath
        }).promise();
      }, staleFiles, { concurrencyLimit: 10 });
      this.logger.info(`Successfully deleted stale files for Entity ${entity.metadata.name}. Total number of files: ${staleFiles.length}`);
    } catch (error) {
      const errorMessage = `Unable to delete file(s) from AWS S3. ${error}`;
      this.logger.error(errorMessage);
    }
    return { objects };
  }
  async fetchTechDocsMetadata(entityName) {
    try {
      return await new Promise(async (resolve, reject) => {
        const entityTriplet = `${entityName.namespace}/${entityName.kind}/${entityName.name}`;
        const entityDir = this.legacyPathCasing ? entityTriplet : lowerCaseEntityTriplet(entityTriplet);
        const entityRootDir = path__default["default"].posix.join(this.bucketRootPath, entityDir);
        const stream = this.storageClient.getObject({
          Bucket: this.bucketName,
          Key: `${entityRootDir}/techdocs_metadata.json`
        }).createReadStream();
        try {
          const techdocsMetadataJson = await streamToBuffer$1(stream);
          if (!techdocsMetadataJson) {
            throw new Error(`Unable to parse the techdocs metadata file ${entityRootDir}/techdocs_metadata.json.`);
          }
          const techdocsMetadata = JSON5__default["default"].parse(techdocsMetadataJson.toString("utf-8"));
          resolve(techdocsMetadata);
        } catch (err) {
          errors.assertError(err);
          this.logger.error(err.message);
          reject(new Error(err.message));
        }
      });
    } catch (e) {
      throw new errors.ForwardedError("TechDocs metadata fetch failed", e);
    }
  }
  docsRouter() {
    return async (req, res) => {
      const decodedUri = decodeURI(req.path.replace(/^\//, ""));
      const decodedUriNoRoot = path__default["default"].relative(this.bucketRootPath, decodedUri);
      const filePathNoRoot = this.legacyPathCasing ? decodedUriNoRoot : lowerCaseEntityTripletInStoragePath(decodedUriNoRoot);
      const filePath = path__default["default"].posix.join(this.bucketRootPath, filePathNoRoot);
      const fileExtension = path__default["default"].extname(filePath);
      const responseHeaders = getHeadersForFileExtension(fileExtension);
      const stream = this.storageClient.getObject({ Bucket: this.bucketName, Key: filePath }).createReadStream();
      try {
        for (const [headerKey, headerValue] of Object.entries(responseHeaders)) {
          res.setHeader(headerKey, headerValue);
        }
        res.send(await streamToBuffer$1(stream));
      } catch (err) {
        errors.assertError(err);
        this.logger.warn(`TechDocs S3 router failed to serve static files from bucket ${this.bucketName} at key ${filePath}: ${err.message}`);
        res.status(404).send("File Not Found");
      }
    };
  }
  async hasDocsBeenGenerated(entity) {
    try {
      const entityTriplet = `${entity.metadata.namespace}/${entity.kind}/${entity.metadata.name}`;
      const entityDir = this.legacyPathCasing ? entityTriplet : lowerCaseEntityTriplet(entityTriplet);
      const entityRootDir = path__default["default"].posix.join(this.bucketRootPath, entityDir);
      await this.storageClient.headObject({
        Bucket: this.bucketName,
        Key: `${entityRootDir}/index.html`
      }).promise();
      return Promise.resolve(true);
    } catch (e) {
      return Promise.resolve(false);
    }
  }
  async migrateDocsCase({
    removeOriginal = false,
    concurrency = 25
  }) {
    const allObjects = await this.getAllObjectsFromBucket();
    const limiter = createLimiter__default["default"](concurrency);
    await Promise.all(allObjects.map((f) => limiter(async (file) => {
      let newPath;
      try {
        newPath = lowerCaseEntityTripletInStoragePath(file);
      } catch (e) {
        errors.assertError(e);
        this.logger.warn(e.message);
        return;
      }
      if (file === newPath) {
        return;
      }
      try {
        this.logger.verbose(`Migrating ${file}`);
        await this.storageClient.copyObject({
          Bucket: this.bucketName,
          CopySource: [this.bucketName, file].join("/"),
          Key: newPath
        }).promise();
        if (removeOriginal) {
          await this.storageClient.deleteObject({
            Bucket: this.bucketName,
            Key: file
          }).promise();
        }
      } catch (e) {
        errors.assertError(e);
        this.logger.warn(`Unable to migrate ${file}: ${e.message}`);
      }
    }, f)));
  }
  async getAllObjectsFromBucket({ prefix } = { prefix: "" }) {
    const objects = [];
    let nextContinuation;
    let allObjects;
    do {
      allObjects = await this.storageClient.listObjectsV2({
        Bucket: this.bucketName,
        ContinuationToken: nextContinuation,
        ...prefix ? { Prefix: prefix } : {}
      }).promise();
      objects.push(...(allObjects.Contents || []).map((f) => f.Key || "").filter((f) => !!f));
      nextContinuation = allObjects.NextContinuationToken;
    } while (nextContinuation);
    return objects;
  }
}

const BATCH_CONCURRENCY = 3;
class AzureBlobStoragePublish {
  constructor(options) {
    this.storageClient = options.storageClient;
    this.containerName = options.containerName;
    this.legacyPathCasing = options.legacyPathCasing;
    this.logger = options.logger;
  }
  static fromConfig(config, logger) {
    let containerName = "";
    try {
      containerName = config.getString("techdocs.publisher.azureBlobStorage.containerName");
    } catch (error) {
      throw new Error("Since techdocs.publisher.type is set to 'azureBlobStorage' in your app config, techdocs.publisher.azureBlobStorage.containerName is required.");
    }
    let accountName = "";
    try {
      accountName = config.getString("techdocs.publisher.azureBlobStorage.credentials.accountName");
    } catch (error) {
      throw new Error("Since techdocs.publisher.type is set to 'azureBlobStorage' in your app config, techdocs.publisher.azureBlobStorage.credentials.accountName is required.");
    }
    const accountKey = config.getOptionalString("techdocs.publisher.azureBlobStorage.credentials.accountKey");
    let credential;
    if (accountKey) {
      credential = new storageBlob.StorageSharedKeyCredential(accountName, accountKey);
    } else {
      credential = new identity.DefaultAzureCredential();
    }
    const storageClient = new storageBlob.BlobServiceClient(`https://${accountName}.blob.core.windows.net`, credential);
    const legacyPathCasing = config.getOptionalBoolean("techdocs.legacyUseCaseSensitiveTripletPaths") || false;
    return new AzureBlobStoragePublish({
      storageClient,
      containerName,
      legacyPathCasing,
      logger
    });
  }
  async getReadiness() {
    try {
      const response = await this.storageClient.getContainerClient(this.containerName).getProperties();
      if (response._response.status === 200) {
        return {
          isAvailable: true
        };
      }
      if (response._response.status >= 400) {
        this.logger.error(`Failed to retrieve metadata from ${response._response.request.url} with status code ${response._response.status}.`);
      }
    } catch (e) {
      errors.assertError(e);
      this.logger.error(`from Azure Blob Storage client library: ${e.message}`);
    }
    this.logger.error(`Could not retrieve metadata about the Azure Blob Storage container ${this.containerName}. Make sure that the Azure project and container exist and the access key is setup correctly techdocs.publisher.azureBlobStorage.credentials defined in app config has correct permissions. Refer to https://backstage.io/docs/features/techdocs/using-cloud-storage`);
    return { isAvailable: false };
  }
  async publish({
    entity,
    directory
  }) {
    const objects = [];
    const useLegacyPathCasing = this.legacyPathCasing;
    const remoteFolder = getCloudPathForLocalPath(entity, void 0, useLegacyPathCasing);
    let existingFiles = [];
    try {
      existingFiles = await this.getAllBlobsFromContainer({
        prefix: remoteFolder,
        maxPageSize: BATCH_CONCURRENCY
      });
    } catch (e) {
      errors.assertError(e);
      this.logger.error(`Unable to list files for Entity ${entity.metadata.name}: ${e.message}`);
    }
    let absoluteFilesToUpload;
    let container;
    try {
      absoluteFilesToUpload = await getFileTreeRecursively(directory);
      container = this.storageClient.getContainerClient(this.containerName);
      const failedOperations = [];
      await bulkStorageOperation(async (absoluteFilePath) => {
        const relativeFilePath = path__default["default"].normalize(path__default["default"].relative(directory, absoluteFilePath));
        const remotePath = getCloudPathForLocalPath(entity, relativeFilePath, useLegacyPathCasing);
        objects.push(remotePath);
        const response = await container.getBlockBlobClient(remotePath).uploadFile(absoluteFilePath);
        if (response._response.status >= 400) {
          failedOperations.push(new Error(`Upload failed for ${absoluteFilePath} with status code ${response._response.status}`));
        }
        return response;
      }, absoluteFilesToUpload, { concurrencyLimit: BATCH_CONCURRENCY });
      if (failedOperations.length > 0) {
        throw new Error(failedOperations.map((r) => r.message).filter(Boolean).join(" "));
      }
      this.logger.info(`Successfully uploaded all the generated files for Entity ${entity.metadata.name}. Total number of files: ${absoluteFilesToUpload.length}`);
    } catch (e) {
      const errorMessage = `Unable to upload file(s) to Azure. ${e}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    try {
      const relativeFilesToUpload = absoluteFilesToUpload.map((absoluteFilePath) => getCloudPathForLocalPath(entity, path__default["default"].relative(directory, absoluteFilePath), useLegacyPathCasing));
      const staleFiles = getStaleFiles(relativeFilesToUpload, existingFiles);
      await bulkStorageOperation(async (relativeFilePath) => {
        return await container.deleteBlob(relativeFilePath);
      }, staleFiles, { concurrencyLimit: BATCH_CONCURRENCY });
      this.logger.info(`Successfully deleted stale files for Entity ${entity.metadata.name}. Total number of files: ${staleFiles.length}`);
    } catch (error) {
      const errorMessage = `Unable to delete file(s) from Azure. ${error}`;
      this.logger.error(errorMessage);
    }
    return { objects };
  }
  download(containerName, blobPath) {
    return new Promise((resolve, reject) => {
      const fileStreamChunks = [];
      this.storageClient.getContainerClient(containerName).getBlockBlobClient(blobPath).download().then((res) => {
        const body = res.readableStreamBody;
        if (!body) {
          reject(new Error(`Unable to parse the response data`));
          return;
        }
        body.on("error", reject).on("data", (chunk) => {
          fileStreamChunks.push(chunk);
        }).on("end", () => {
          resolve(Buffer.concat(fileStreamChunks));
        });
      }).catch(reject);
    });
  }
  async fetchTechDocsMetadata(entityName) {
    const entityTriplet = `${entityName.namespace}/${entityName.kind}/${entityName.name}`;
    const entityRootDir = this.legacyPathCasing ? entityTriplet : lowerCaseEntityTriplet(entityTriplet);
    try {
      const techdocsMetadataJson = await this.download(this.containerName, `${entityRootDir}/techdocs_metadata.json`);
      if (!techdocsMetadataJson) {
        throw new Error(`Unable to parse the techdocs metadata file ${entityRootDir}/techdocs_metadata.json.`);
      }
      const techdocsMetadata = JSON5__default["default"].parse(techdocsMetadataJson.toString("utf-8"));
      return techdocsMetadata;
    } catch (e) {
      throw new errors.ForwardedError("TechDocs metadata fetch failed", e);
    }
  }
  docsRouter() {
    return (req, res) => {
      const decodedUri = decodeURI(req.path.replace(/^\//, ""));
      const filePath = this.legacyPathCasing ? decodedUri : lowerCaseEntityTripletInStoragePath(decodedUri);
      const fileExtension = path__default["default"].extname(filePath);
      const responseHeaders = getHeadersForFileExtension(fileExtension);
      this.download(this.containerName, filePath).then((fileContent) => {
        for (const [headerKey, headerValue] of Object.entries(responseHeaders)) {
          res.setHeader(headerKey, headerValue);
        }
        res.send(fileContent);
      }).catch((e) => {
        this.logger.warn(`TechDocs Azure router failed to serve content from container ${this.containerName} at path ${filePath}: ${e.message}`);
        res.status(404).send("File Not Found");
      });
    };
  }
  hasDocsBeenGenerated(entity) {
    const entityTriplet = `${entity.metadata.namespace}/${entity.kind}/${entity.metadata.name}`;
    const entityRootDir = this.legacyPathCasing ? entityTriplet : lowerCaseEntityTriplet(entityTriplet);
    return this.storageClient.getContainerClient(this.containerName).getBlockBlobClient(`${entityRootDir}/index.html`).exists();
  }
  async renameBlob(originalName, newName, removeOriginal = false) {
    const container = this.storageClient.getContainerClient(this.containerName);
    const blob = container.getBlobClient(newName);
    const { url } = container.getBlobClient(originalName);
    const response = await blob.beginCopyFromURL(url);
    await response.pollUntilDone();
    if (removeOriginal) {
      await container.deleteBlob(originalName);
    }
  }
  async renameBlobToLowerCase(originalPath, removeOriginal) {
    let newPath;
    try {
      newPath = lowerCaseEntityTripletInStoragePath(originalPath);
    } catch (e) {
      errors.assertError(e);
      this.logger.warn(e.message);
      return;
    }
    if (originalPath === newPath)
      return;
    try {
      this.logger.verbose(`Migrating ${originalPath}`);
      await this.renameBlob(originalPath, newPath, removeOriginal);
    } catch (e) {
      errors.assertError(e);
      this.logger.warn(`Unable to migrate ${originalPath}: ${e.message}`);
    }
  }
  async migrateDocsCase({
    removeOriginal = false,
    concurrency = 25
  }) {
    const promises = [];
    const limiter = createLimiter__default["default"](concurrency);
    const container = this.storageClient.getContainerClient(this.containerName);
    for await (const blob of container.listBlobsFlat()) {
      promises.push(limiter(this.renameBlobToLowerCase.bind(this), blob.name, removeOriginal));
    }
    await Promise.all(promises);
  }
  async getAllBlobsFromContainer({
    prefix,
    maxPageSize
  }) {
    var _a, _b;
    const blobs = [];
    const container = this.storageClient.getContainerClient(this.containerName);
    let iterator = container.listBlobsFlat({ prefix }).byPage({ maxPageSize });
    let response = (await iterator.next()).value;
    do {
      for (const blob of (_b = (_a = response == null ? void 0 : response.segment) == null ? void 0 : _a.blobItems) != null ? _b : []) {
        blobs.push(blob.name);
      }
      iterator = container.listBlobsFlat({ prefix }).byPage({ continuationToken: response.continuationToken, maxPageSize });
      response = (await iterator.next()).value;
    } while (response && response.continuationToken);
    return blobs;
  }
}

class MigrateWriteStream extends stream.Writable {
  constructor(logger, removeOriginal, concurrency) {
    super({ objectMode: true });
    this.inFlight = 0;
    this.logger = logger;
    this.removeOriginal = removeOriginal;
    this.maxConcurrency = concurrency;
  }
  _write(file, _encoding, next) {
    let shouldCallNext = true;
    let newFile;
    try {
      newFile = lowerCaseEntityTripletInStoragePath(file.name);
    } catch (e) {
      errors.assertError(e);
      this.logger.warn(e.message);
      next();
      return;
    }
    if (newFile === file.name) {
      next();
      return;
    }
    this.inFlight++;
    if (this.inFlight < this.maxConcurrency) {
      next();
      shouldCallNext = false;
    }
    const migrate = this.removeOriginal ? file.move.bind(file) : file.copy.bind(file);
    this.logger.verbose(`Migrating ${file.name}`);
    migrate(newFile).catch((e) => this.logger.warn(`Unable to migrate ${file.name}: ${e.message}`)).finally(() => {
      this.inFlight--;
      if (shouldCallNext) {
        next();
      }
    });
  }
}

class GoogleGCSPublish {
  constructor(options) {
    this.storageClient = options.storageClient;
    this.bucketName = options.bucketName;
    this.legacyPathCasing = options.legacyPathCasing;
    this.logger = options.logger;
    this.bucketRootPath = options.bucketRootPath;
  }
  static fromConfig(config, logger) {
    let bucketName = "";
    try {
      bucketName = config.getString("techdocs.publisher.googleGcs.bucketName");
    } catch (error) {
      throw new Error("Since techdocs.publisher.type is set to 'googleGcs' in your app config, techdocs.publisher.googleGcs.bucketName is required.");
    }
    const bucketRootPath = normalizeExternalStorageRootPath(config.getOptionalString("techdocs.publisher.googleGcs.bucketRootPath") || "");
    const credentials = config.getOptionalString("techdocs.publisher.googleGcs.credentials");
    let credentialsJson = {};
    if (credentials) {
      try {
        credentialsJson = JSON.parse(credentials);
      } catch (err) {
        throw new Error("Error in parsing techdocs.publisher.googleGcs.credentials config to JSON.");
      }
    }
    const storageClient = new storage.Storage({
      ...credentials && {
        projectId: credentialsJson.project_id,
        credentials: credentialsJson
      }
    });
    const legacyPathCasing = config.getOptionalBoolean("techdocs.legacyUseCaseSensitiveTripletPaths") || false;
    return new GoogleGCSPublish({
      storageClient,
      bucketName,
      legacyPathCasing,
      logger,
      bucketRootPath
    });
  }
  async getReadiness() {
    try {
      await this.storageClient.bucket(this.bucketName).getMetadata();
      this.logger.info(`Successfully connected to the GCS bucket ${this.bucketName}.`);
      return {
        isAvailable: true
      };
    } catch (err) {
      errors.assertError(err);
      this.logger.error(`Could not retrieve metadata about the GCS bucket ${this.bucketName}. Make sure the bucket exists. Also make sure that authentication is setup either by explicitly defining techdocs.publisher.googleGcs.credentials in app config or by using environment variables. Refer to https://backstage.io/docs/features/techdocs/using-cloud-storage`);
      this.logger.error(`from GCS client library: ${err.message}`);
      return { isAvailable: false };
    }
  }
  async publish({
    entity,
    directory
  }) {
    const objects = [];
    const useLegacyPathCasing = this.legacyPathCasing;
    const bucket = this.storageClient.bucket(this.bucketName);
    const bucketRootPath = this.bucketRootPath;
    let existingFiles = [];
    try {
      const remoteFolder = getCloudPathForLocalPath(entity, void 0, useLegacyPathCasing, bucketRootPath);
      existingFiles = await this.getFilesForFolder(remoteFolder);
    } catch (e) {
      errors.assertError(e);
      this.logger.error(`Unable to list files for Entity ${entity.metadata.name}: ${e.message}`);
    }
    let absoluteFilesToUpload;
    try {
      absoluteFilesToUpload = await getFileTreeRecursively(directory);
      await bulkStorageOperation(async (absoluteFilePath) => {
        const relativeFilePath = path__default["default"].relative(directory, absoluteFilePath);
        const destination = getCloudPathForLocalPath(entity, relativeFilePath, useLegacyPathCasing, bucketRootPath);
        objects.push(destination);
        return await bucket.upload(absoluteFilePath, { destination });
      }, absoluteFilesToUpload, { concurrencyLimit: 10 });
      this.logger.info(`Successfully uploaded all the generated files for Entity ${entity.metadata.name}. Total number of files: ${absoluteFilesToUpload.length}`);
    } catch (e) {
      const errorMessage = `Unable to upload file(s) to Google Cloud Storage. ${e}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    try {
      const relativeFilesToUpload = absoluteFilesToUpload.map((absoluteFilePath) => getCloudPathForLocalPath(entity, path__default["default"].relative(directory, absoluteFilePath), useLegacyPathCasing, bucketRootPath));
      const staleFiles = getStaleFiles(relativeFilesToUpload, existingFiles);
      await bulkStorageOperation(async (relativeFilePath) => {
        return await bucket.file(relativeFilePath).delete();
      }, staleFiles, { concurrencyLimit: 10 });
      this.logger.info(`Successfully deleted stale files for Entity ${entity.metadata.name}. Total number of files: ${staleFiles.length}`);
    } catch (error) {
      const errorMessage = `Unable to delete file(s) from Google Cloud Storage. ${error}`;
      this.logger.error(errorMessage);
    }
    return { objects };
  }
  fetchTechDocsMetadata(entityName) {
    return new Promise((resolve, reject) => {
      const entityTriplet = `${entityName.namespace}/${entityName.kind}/${entityName.name}`;
      const entityDir = this.legacyPathCasing ? entityTriplet : lowerCaseEntityTriplet(entityTriplet);
      const entityRootDir = path__default["default"].posix.join(this.bucketRootPath, entityDir);
      const fileStreamChunks = [];
      this.storageClient.bucket(this.bucketName).file(`${entityRootDir}/techdocs_metadata.json`).createReadStream().on("error", (err) => {
        this.logger.error(err.message);
        reject(err);
      }).on("data", (chunk) => {
        fileStreamChunks.push(chunk);
      }).on("end", () => {
        const techdocsMetadataJson = Buffer.concat(fileStreamChunks).toString("utf-8");
        resolve(JSON5__default["default"].parse(techdocsMetadataJson));
      });
    });
  }
  docsRouter() {
    return (req, res) => {
      const decodedUri = decodeURI(req.path.replace(/^\//, ""));
      const decodedUriNoRoot = path__default["default"].relative(this.bucketRootPath, decodedUri);
      const filePathNoRoot = this.legacyPathCasing ? decodedUriNoRoot : lowerCaseEntityTripletInStoragePath(decodedUriNoRoot);
      const filePath = path__default["default"].posix.join(this.bucketRootPath, filePathNoRoot);
      const fileExtension = path__default["default"].extname(filePath);
      const responseHeaders = getHeadersForFileExtension(fileExtension);
      this.storageClient.bucket(this.bucketName).file(filePath).createReadStream().on("pipe", () => {
        res.writeHead(200, responseHeaders);
      }).on("error", (err) => {
        this.logger.warn(`TechDocs Google GCS router failed to serve content from bucket ${this.bucketName} at path ${filePath}: ${err.message}`);
        if (!res.headersSent) {
          res.status(404).send("File Not Found");
        } else {
          res.destroy();
        }
      }).pipe(res);
    };
  }
  async hasDocsBeenGenerated(entity) {
    return new Promise((resolve) => {
      const entityTriplet = `${entity.metadata.namespace}/${entity.kind}/${entity.metadata.name}`;
      const entityDir = this.legacyPathCasing ? entityTriplet : lowerCaseEntityTriplet(entityTriplet);
      const entityRootDir = path__default["default"].posix.join(this.bucketRootPath, entityDir);
      this.storageClient.bucket(this.bucketName).file(`${entityRootDir}/index.html`).exists().then((response) => {
        resolve(response[0]);
      }).catch(() => {
        resolve(false);
      });
    });
  }
  migrateDocsCase({ removeOriginal = false, concurrency = 25 }) {
    return new Promise((resolve, reject) => {
      const allFileMetadata = this.storageClient.bucket(this.bucketName).getFilesStream();
      const migrateFiles = new MigrateWriteStream(this.logger, removeOriginal, concurrency);
      migrateFiles.on("finish", resolve).on("error", reject);
      allFileMetadata.pipe(migrateFiles).on("error", (error) => {
        migrateFiles.destroy();
        reject(error);
      });
    });
  }
  getFilesForFolder(folder) {
    const fileMetadataStream = this.storageClient.bucket(this.bucketName).getFilesStream({ prefix: folder });
    return new Promise((resolve, reject) => {
      const files = [];
      fileMetadataStream.on("error", (error) => {
        reject(error);
      });
      fileMetadataStream.on("data", (file) => {
        files.push(file.name);
      });
      fileMetadataStream.on("end", () => {
        resolve(files);
      });
    });
  }
}

let staticDocsDir = "";
try {
  staticDocsDir = backendCommon.resolvePackagePath("@backstage/plugin-techdocs-backend", "static/docs");
} catch (err) {
  staticDocsDir = os__default["default"].tmpdir();
}
class LocalPublish {
  constructor(options) {
    this.logger = options.logger;
    this.discovery = options.discovery;
    this.legacyPathCasing = options.legacyPathCasing;
  }
  static fromConfig(config, logger, discovery) {
    const legacyPathCasing = config.getOptionalBoolean("techdocs.legacyUseCaseSensitiveTripletPaths") || false;
    return new LocalPublish({
      logger,
      discovery,
      legacyPathCasing
    });
  }
  async getReadiness() {
    return {
      isAvailable: true
    };
  }
  async publish({
    entity,
    directory
  }) {
    var _a;
    const entityNamespace = (_a = entity.metadata.namespace) != null ? _a : "default";
    const publishDir = this.staticEntityPathJoin(entityNamespace, entity.kind, entity.metadata.name);
    if (!fs__default["default"].existsSync(publishDir)) {
      this.logger.info(`Could not find ${publishDir}, creating the directory.`);
      fs__default["default"].mkdirSync(publishDir, { recursive: true });
    }
    try {
      await fs__default["default"].copy(directory, publishDir);
      this.logger.info(`Published site stored at ${publishDir}`);
    } catch (error) {
      this.logger.debug(`Failed to copy docs from ${directory} to ${publishDir}`);
      throw error;
    }
    const techdocsApiUrl = await this.discovery.getBaseUrl("techdocs");
    const publishedFilePaths = (await getFileTreeRecursively(publishDir)).map((abs) => {
      return abs.split(`${staticDocsDir}/`)[1];
    });
    return {
      remoteUrl: `${techdocsApiUrl}/static/docs/${encodeURIComponent(entity.metadata.name)}`,
      objects: publishedFilePaths
    };
  }
  async fetchTechDocsMetadata(entityName) {
    const metadataPath = this.staticEntityPathJoin(entityName.namespace, entityName.kind, entityName.name, "techdocs_metadata.json");
    try {
      return await fs__default["default"].readJson(metadataPath);
    } catch (err) {
      errors.assertError(err);
      this.logger.error(`Unable to read techdocs_metadata.json at ${metadataPath}. Error: ${err}`);
      throw new Error(err.message);
    }
  }
  docsRouter() {
    const router = express__default["default"].Router();
    router.use((req, res, next) => {
      if (this.legacyPathCasing) {
        return next();
      }
      const [_, namespace, kind, name, ...rest] = req.path.split("/");
      if (!namespace || !kind || !name) {
        return next();
      }
      const newPath = [
        _,
        namespace.toLowerCase(),
        kind.toLowerCase(),
        name.toLowerCase(),
        ...rest
      ].join("/");
      if (newPath === req.path) {
        return next();
      }
      return res.redirect(req.baseUrl + newPath, 301);
    });
    router.use(express__default["default"].static(staticDocsDir, {
      setHeaders: (res, filePath) => {
        const fileExtension = path__default["default"].extname(filePath);
        const headers = getHeadersForFileExtension(fileExtension);
        for (const [header, value] of Object.entries(headers)) {
          res.setHeader(header, value);
        }
      }
    }));
    return router;
  }
  async hasDocsBeenGenerated(entity) {
    var _a;
    const namespace = (_a = entity.metadata.namespace) != null ? _a : "default";
    const indexHtmlPath = this.staticEntityPathJoin(namespace, entity.kind, entity.metadata.name, "index.html");
    try {
      await fs__default["default"].access(indexHtmlPath, fs__default["default"].constants.F_OK);
      return true;
    } catch (err) {
      return false;
    }
  }
  async migrateDocsCase({
    removeOriginal = false,
    concurrency = 25
  }) {
    const files = await getFileTreeRecursively(staticDocsDir);
    const limit = createLimiter__default["default"](concurrency);
    await Promise.all(files.map((f) => limit(async (file) => {
      const relativeFile = file.replace(`${staticDocsDir}${path__default["default"].sep}`, "");
      const newFile = lowerCaseEntityTripletInStoragePath(relativeFile);
      if (relativeFile === newFile) {
        return;
      }
      await new Promise((resolve) => {
        const migrate = removeOriginal ? fs__default["default"].move : fs__default["default"].copyFile;
        this.logger.verbose(`Migrating ${relativeFile}`);
        migrate(file, newFile, (err) => {
          if (err) {
            this.logger.warn(`Unable to migrate ${relativeFile}: ${err.message}`);
          }
          resolve();
        });
      });
    }, f)));
  }
  staticEntityPathJoin(...allParts) {
    if (this.legacyPathCasing) {
      const [namespace2, kind2, name2, ...parts2] = allParts;
      return path__default["default"].join(staticDocsDir, namespace2, kind2, name2, ...parts2);
    }
    const [namespace, kind, name, ...parts] = allParts;
    return path__default["default"].join(staticDocsDir, namespace.toLowerCase(), kind.toLowerCase(), name.toLowerCase(), ...parts);
  }
}

const streamToBuffer = (stream) => {
  return new Promise((resolve, reject) => {
    try {
      const chunks = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("error", reject);
      stream.on("end", () => resolve(Buffer.concat(chunks)));
    } catch (e) {
      throw new errors.ForwardedError("Unable to parse the response data", e);
    }
  });
};
const bufferToStream = (buffer) => {
  const stream$1 = new stream.Readable();
  stream$1.push(buffer);
  stream$1.push(null);
  return stream$1;
};
class OpenStackSwiftPublish {
  constructor(options) {
    this.storageClient = options.storageClient;
    this.containerName = options.containerName;
    this.logger = options.logger;
  }
  static fromConfig(config, logger) {
    let containerName = "";
    try {
      containerName = config.getString("techdocs.publisher.openStackSwift.containerName");
    } catch (error) {
      throw new Error("Since techdocs.publisher.type is set to 'openStackSwift' in your app config, techdocs.publisher.openStackSwift.containerName is required.");
    }
    const openStackSwiftConfig = config.getConfig("techdocs.publisher.openStackSwift");
    const storageClient = new openstackSwiftSdk.SwiftClient({
      authEndpoint: openStackSwiftConfig.getString("authUrl"),
      swiftEndpoint: openStackSwiftConfig.getString("swiftUrl"),
      credentialId: openStackSwiftConfig.getString("credentials.id"),
      secret: openStackSwiftConfig.getString("credentials.secret")
    });
    return new OpenStackSwiftPublish({ storageClient, containerName, logger });
  }
  async getReadiness() {
    try {
      const container = await this.storageClient.getContainerMetadata(this.containerName);
      if (!(container instanceof types.NotFound)) {
        this.logger.info(`Successfully connected to the OpenStack Swift container ${this.containerName}.`);
        return {
          isAvailable: true
        };
      }
      this.logger.error(`Could not retrieve metadata about the OpenStack Swift container ${this.containerName}. Make sure the container exists. Also make sure that authentication is setup either by explicitly defining credentials and region in techdocs.publisher.openStackSwift in app config or by using environment variables. Refer to https://backstage.io/docs/features/techdocs/using-cloud-storage`);
      return {
        isAvailable: false
      };
    } catch (err) {
      errors.assertError(err);
      this.logger.error(`from OpenStack client library: ${err.message}`);
      return {
        isAvailable: false
      };
    }
  }
  async publish({
    entity,
    directory
  }) {
    try {
      const objects = [];
      const allFilesToUpload = await getFileTreeRecursively(directory);
      const limiter = createLimiter__default["default"](10);
      const uploadPromises = [];
      for (const filePath of allFilesToUpload) {
        const relativeFilePath = path__default["default"].relative(directory, filePath);
        const relativeFilePathPosix = relativeFilePath.split(path__default["default"].sep).join(path__default["default"].posix.sep);
        const entityRootDir = `${entity.metadata.namespace}/${entity.kind}/${entity.metadata.name}`;
        const destination = `${entityRootDir}/${relativeFilePathPosix}`;
        objects.push(destination);
        const uploadFile = limiter(async () => {
          const fileBuffer = await fs__default["default"].readFile(filePath);
          const stream = bufferToStream(fileBuffer);
          return this.storageClient.upload(this.containerName, destination, stream);
        });
        uploadPromises.push(uploadFile);
      }
      await Promise.all(uploadPromises);
      this.logger.info(`Successfully uploaded all the generated files for Entity ${entity.metadata.name}. Total number of files: ${allFilesToUpload.length}`);
      return { objects };
    } catch (e) {
      const errorMessage = `Unable to upload file(s) to OpenStack Swift. ${e}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
  }
  async fetchTechDocsMetadata(entityName) {
    return await new Promise(async (resolve, reject) => {
      const entityRootDir = `${entityName.namespace}/${entityName.kind}/${entityName.name}`;
      const downloadResponse = await this.storageClient.download(this.containerName, `${entityRootDir}/techdocs_metadata.json`);
      if (!(downloadResponse instanceof types.NotFound)) {
        const stream = downloadResponse.data;
        try {
          const techdocsMetadataJson = await streamToBuffer(stream);
          if (!techdocsMetadataJson) {
            throw new Error(`Unable to parse the techdocs metadata file ${entityRootDir}/techdocs_metadata.json.`);
          }
          const techdocsMetadata = JSON5__default["default"].parse(techdocsMetadataJson.toString("utf-8"));
          resolve(techdocsMetadata);
        } catch (err) {
          errors.assertError(err);
          this.logger.error(err.message);
          reject(new Error(err.message));
        }
      } else {
        reject({
          message: `TechDocs metadata fetch failed, The file /rootDir/${entityRootDir}/techdocs_metadata.json does not exist !`
        });
      }
    });
  }
  docsRouter() {
    return async (req, res) => {
      const filePath = decodeURI(req.path.replace(/^\//, ""));
      const fileExtension = path__default["default"].extname(filePath);
      const responseHeaders = getHeadersForFileExtension(fileExtension);
      const downloadResponse = await this.storageClient.download(this.containerName, filePath);
      if (!(downloadResponse instanceof types.NotFound)) {
        const stream = downloadResponse.data;
        try {
          for (const [headerKey, headerValue] of Object.entries(responseHeaders)) {
            res.setHeader(headerKey, headerValue);
          }
          res.send(await streamToBuffer(stream));
        } catch (err) {
          errors.assertError(err);
          this.logger.warn(`TechDocs OpenStack swift router failed to serve content from container ${this.containerName} at path ${filePath}: ${err.message}`);
          res.status(404).send("File Not Found");
        }
      } else {
        this.logger.warn(`TechDocs OpenStack swift router failed to serve content from container ${this.containerName} at path ${filePath}: Not found`);
        res.status(404).send("File Not Found");
      }
    };
  }
  async hasDocsBeenGenerated(entity) {
    const entityRootDir = `${entity.metadata.namespace}/${entity.kind}/${entity.metadata.name}`;
    try {
      const fileResponse = await this.storageClient.getMetadata(this.containerName, `${entityRootDir}/index.html`);
      if (!(fileResponse instanceof types.NotFound)) {
        return true;
      }
      return false;
    } catch (err) {
      errors.assertError(err);
      this.logger.warn(err.message);
      return false;
    }
  }
  async migrateDocsCase({
    removeOriginal = false,
    concurrency = 25
  }) {
    const allObjects = await this.getAllObjectsFromContainer();
    const limiter = createLimiter__default["default"](concurrency);
    await Promise.all(allObjects.map((f) => limiter(async (file) => {
      let newPath;
      try {
        newPath = lowerCaseEntityTripletInStoragePath(file);
      } catch (e) {
        errors.assertError(e);
        this.logger.warn(e.message);
        return;
      }
      if (file === newPath) {
        return;
      }
      try {
        this.logger.verbose(`Migrating ${file} to ${newPath}`);
        await this.storageClient.copy(this.containerName, file, this.containerName, newPath);
        if (removeOriginal) {
          await this.storageClient.delete(this.containerName, file);
        }
      } catch (e) {
        errors.assertError(e);
        this.logger.warn(`Unable to migrate ${file}: ${e.message}`);
      }
    }, f)));
  }
  async getAllObjectsFromContainer({ prefix } = { prefix: "" }) {
    let objects = [];
    const OSS_MAX_LIMIT = Math.pow(2, 31) - 1;
    const allObjects = await this.storageClient.list(this.containerName, prefix, OSS_MAX_LIMIT);
    objects = allObjects.map((object) => object.name);
    return objects;
  }
}

class Publisher {
  static async fromConfig(config, { logger, discovery }) {
    var _a;
    const publisherType = (_a = config.getOptionalString("techdocs.publisher.type")) != null ? _a : "local";
    switch (publisherType) {
      case "googleGcs":
        logger.info("Creating Google Storage Bucket publisher for TechDocs");
        return GoogleGCSPublish.fromConfig(config, logger);
      case "awsS3":
        logger.info("Creating AWS S3 Bucket publisher for TechDocs");
        return AwsS3Publish.fromConfig(config, logger);
      case "azureBlobStorage":
        logger.info("Creating Azure Blob Storage Container publisher for TechDocs");
        return AzureBlobStoragePublish.fromConfig(config, logger);
      case "openStackSwift":
        logger.info("Creating OpenStack Swift Container publisher for TechDocs");
        return OpenStackSwiftPublish.fromConfig(config, logger);
      case "local":
        logger.info("Creating Local publisher for TechDocs");
        return LocalPublish.fromConfig(config, logger, discovery);
      default:
        logger.info("Creating Local publisher for TechDocs");
        return LocalPublish.fromConfig(config, logger, discovery);
    }
  }
}

exports.DirectoryPreparer = DirectoryPreparer;
exports.Generators = Generators;
exports.Preparers = Preparers;
exports.Publisher = Publisher;
exports.TechdocsGenerator = TechdocsGenerator;
exports.UrlPreparer = UrlPreparer;
exports.getDocFilesFromRepository = getDocFilesFromRepository;
exports.getLocationForEntity = getLocationForEntity;
exports.parseReferenceAnnotation = parseReferenceAnnotation;
exports.transformDirLocation = transformDirLocation;
//# sourceMappingURL=index.cjs.js.map
