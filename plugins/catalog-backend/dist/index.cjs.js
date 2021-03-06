'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var errors = require('@backstage/errors');
var integration = require('@backstage/integration');
require('core-js/features/promise');
var codeowners = require('codeowners-utils');
var fp = require('lodash/fp');
var catalogModel = require('@backstage/catalog-model');
var lodash = require('lodash');
var parseGitUrl = require('git-url-parse');
var fs = require('fs-extra');
var g = require('glob');
var path = require('path');
var util = require('util');
var yaml = require('yaml');
var limiterFactory = require('p-limit');
var pluginCatalogCommon = require('@backstage/plugin-catalog-common');
var pluginPermissionNode = require('@backstage/plugin-permission-node');
var catalogClient = require('@backstage/catalog-client');
var stream = require('stream');
var crypto = require('crypto');
var uuid = require('uuid');
var backendCommon = require('@backstage/backend-common');
var luxon = require('luxon');
var promClient = require('prom-client');
var stableStringify = require('fast-json-stable-stringify');
var express = require('express');
var Router = require('express-promise-router');
var yn = require('yn');
var zod = require('zod');
var pluginPermissionCommon = require('@backstage/plugin-permission-common');

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

var codeowners__namespace = /*#__PURE__*/_interopNamespace(codeowners);
var lodash__default = /*#__PURE__*/_interopDefaultLegacy(lodash);
var parseGitUrl__default = /*#__PURE__*/_interopDefaultLegacy(parseGitUrl);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var g__default = /*#__PURE__*/_interopDefaultLegacy(g);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var yaml__default = /*#__PURE__*/_interopDefaultLegacy(yaml);
var limiterFactory__default = /*#__PURE__*/_interopDefaultLegacy(limiterFactory);
var stableStringify__default = /*#__PURE__*/_interopDefaultLegacy(stableStringify);
var express__default = /*#__PURE__*/_interopDefaultLegacy(express);
var Router__default = /*#__PURE__*/_interopDefaultLegacy(Router);
var yn__default = /*#__PURE__*/_interopDefaultLegacy(yn);

const processingResult = Object.freeze({
  notFoundError(atLocation, message) {
    return {
      type: "error",
      location: atLocation,
      error: new errors.NotFoundError(message)
    };
  },
  inputError(atLocation, message) {
    return {
      type: "error",
      location: atLocation,
      error: new errors.InputError(message)
    };
  },
  generalError(atLocation, message) {
    return { type: "error", location: atLocation, error: new Error(message) };
  },
  location(newLocation) {
    return { type: "location", location: newLocation };
  },
  entity(atLocation, newEntity) {
    return { type: "entity", location: atLocation, entity: newEntity };
  },
  relation(spec) {
    return { type: "relation", relation: spec };
  }
});

const USER_PATTERN = /^@.*/;
const GROUP_PATTERN = /^@.*\/.*/;
const EMAIL_PATTERN = /^.*@.*\..*$/;
function resolveCodeOwner(contents, pattern = "*") {
  const owners = codeowners__namespace.parse(contents);
  return fp.pipe(fp.filter((e) => e.pattern === pattern), fp.reverse, fp.head, fp.get("owners"), fp.head, normalizeCodeOwner)(owners);
}
function normalizeCodeOwner(owner) {
  if (owner.match(GROUP_PATTERN)) {
    return owner.split("/")[1];
  } else if (owner.match(USER_PATTERN)) {
    return `User:${owner.substring(1)}`;
  } else if (owner.match(EMAIL_PATTERN)) {
    return owner.split("@")[0];
  }
  return owner;
}

const CODEOWNERS = "CODEOWNERS";
const scmCodeOwnersPaths = {
  bitbucket: [CODEOWNERS, `.bitbucket/${CODEOWNERS}`],
  gitlab: [CODEOWNERS, `.gitlab/${CODEOWNERS}`, `docs/${CODEOWNERS}`],
  github: [CODEOWNERS, `.github/${CODEOWNERS}`, `docs/${CODEOWNERS}`]
};

async function readCodeOwners(reader, sourceUrl, codeownersPaths) {
  const readOwnerLocation = async (path) => {
    const url = `${sourceUrl}${path}`;
    if (reader.readUrl) {
      const data2 = await reader.readUrl(url);
      const buffer = await data2.buffer();
      return buffer.toString();
    }
    const data = await reader.read(url);
    return data.toString();
  };
  const candidates = codeownersPaths.map(readOwnerLocation);
  return Promise.any(candidates).catch((aggregateError) => {
    const hardError = aggregateError.errors.find((error) => !(error instanceof errors.NotFoundError));
    if (hardError) {
      throw hardError;
    }
    return void 0;
  });
}
async function findCodeOwnerByTarget(reader, targetUrl, scmIntegration) {
  var _a;
  const codeownersPaths = scmCodeOwnersPaths[(_a = scmIntegration == null ? void 0 : scmIntegration.type) != null ? _a : ""];
  const sourceUrl = scmIntegration == null ? void 0 : scmIntegration.resolveUrl({
    url: "/",
    base: targetUrl
  });
  if (!sourceUrl || !codeownersPaths) {
    return void 0;
  }
  const contents = await readCodeOwners(reader, sourceUrl, codeownersPaths);
  if (!contents) {
    return void 0;
  }
  const owner = resolveCodeOwner(contents);
  return owner;
}

const ALLOWED_KINDS = ["API", "Component", "Domain", "Resource", "System"];
const ALLOWED_LOCATION_TYPES = ["url"];
class CodeOwnersProcessor {
  static fromConfig(config, options) {
    const integrations = integration.ScmIntegrations.fromConfig(config);
    return new CodeOwnersProcessor({
      ...options,
      integrations
    });
  }
  constructor(options) {
    this.integrations = options.integrations;
    this.logger = options.logger;
    this.reader = options.reader;
  }
  getProcessorName() {
    return "CodeOwnersProcessor";
  }
  async preProcessEntity(entity, location) {
    if (!entity || !ALLOWED_KINDS.includes(entity.kind) || !ALLOWED_LOCATION_TYPES.includes(location.type) || entity.spec && entity.spec.owner) {
      return entity;
    }
    const scmIntegration = this.integrations.byUrl(location.target);
    if (!scmIntegration) {
      return entity;
    }
    const owner = await findCodeOwnerByTarget(this.reader, location.target, scmIntegration);
    if (!owner) {
      this.logger.debug(`CodeOwnerProcessor could not resolve owner for ${location.target}`);
      return entity;
    }
    return {
      ...entity,
      spec: { ...entity.spec, owner }
    };
  }
}

class AnnotateLocationEntityProcessor {
  constructor(options) {
    this.options = options;
  }
  getProcessorName() {
    return "AnnotateLocationEntityProcessor";
  }
  async preProcessEntity(entity, location, _, originLocation) {
    const { integrations } = this.options;
    let viewUrl;
    let editUrl;
    let sourceLocation;
    if (location.type === "url") {
      const scmIntegration = integrations.byUrl(location.target);
      viewUrl = location.target;
      editUrl = scmIntegration == null ? void 0 : scmIntegration.resolveEditUrl(location.target);
      const sourceUrl = scmIntegration == null ? void 0 : scmIntegration.resolveUrl({
        url: "./",
        base: location.target
      });
      if (sourceUrl) {
        sourceLocation = catalogModel.stringifyLocationRef({
          type: "url",
          target: sourceUrl
        });
      }
    }
    return lodash.merge({
      metadata: {
        annotations: lodash.pickBy({
          [catalogModel.ANNOTATION_LOCATION]: catalogModel.stringifyLocationRef(location),
          [catalogModel.ANNOTATION_ORIGIN_LOCATION]: catalogModel.stringifyLocationRef(originLocation),
          [catalogModel.ANNOTATION_VIEW_URL]: viewUrl,
          [catalogModel.ANNOTATION_EDIT_URL]: editUrl,
          [catalogModel.ANNOTATION_SOURCE_LOCATION]: sourceLocation
        }, lodash.identity)
      }
    }, entity);
  }
}

const GITHUB_ACTIONS_ANNOTATION = "github.com/project-slug";
const GITLAB_ACTIONS_ANNOTATION = "gitlab.com/project-slug";
class AnnotateScmSlugEntityProcessor {
  constructor(opts) {
    this.opts = opts;
  }
  getProcessorName() {
    return "AnnotateScmSlugEntityProcessor";
  }
  static fromConfig(config) {
    return new AnnotateScmSlugEntityProcessor({
      scmIntegrationRegistry: integration.ScmIntegrations.fromConfig(config)
    });
  }
  async preProcessEntity(entity, location) {
    var _a;
    if (entity.kind !== "Component" || location.type !== "url") {
      return entity;
    }
    const scmIntegration = this.opts.scmIntegrationRegistry.byUrl(location.target);
    if (!scmIntegration) {
      return entity;
    }
    let annotation;
    switch (scmIntegration.type) {
      case "github":
        annotation = GITHUB_ACTIONS_ANNOTATION;
        break;
      case "gitlab":
        annotation = GITLAB_ACTIONS_ANNOTATION;
        break;
      default:
        return entity;
    }
    let projectSlug = (_a = entity.metadata.annotations) == null ? void 0 : _a[annotation];
    if (!projectSlug) {
      const gitUrl = parseGitUrl__default["default"](location.target);
      projectSlug = `${gitUrl.owner}/${gitUrl.name}`;
    }
    return lodash.merge({
      metadata: {
        annotations: lodash.pickBy({
          [annotation]: projectSlug
        }, lodash.identity)
      }
    }, entity);
  }
}

class BuiltinKindsEntityProcessor {
  constructor() {
    this.validators = [
      catalogModel.apiEntityV1alpha1Validator,
      catalogModel.componentEntityV1alpha1Validator,
      catalogModel.resourceEntityV1alpha1Validator,
      catalogModel.groupEntityV1alpha1Validator,
      catalogModel.locationEntityV1alpha1Validator,
      catalogModel.userEntityV1alpha1Validator,
      catalogModel.systemEntityV1alpha1Validator,
      catalogModel.domainEntityV1alpha1Validator
    ];
  }
  getProcessorName() {
    return "BuiltinKindsEntityProcessor";
  }
  async validateEntityKind(entity) {
    for (const validator of this.validators) {
      const results = await validator.check(entity);
      if (results) {
        return true;
      }
    }
    return false;
  }
  async postProcessEntity(entity, _location, emit) {
    const selfRef = catalogModel.getCompoundEntityRef(entity);
    function doEmit(targets, context, outgoingRelation, incomingRelation) {
      if (!targets) {
        return;
      }
      for (const target of [targets].flat()) {
        const targetRef = catalogModel.parseEntityRef(target, context);
        emit(processingResult.relation({
          source: selfRef,
          type: outgoingRelation,
          target: {
            kind: targetRef.kind,
            namespace: targetRef.namespace,
            name: targetRef.name
          }
        }));
        emit(processingResult.relation({
          source: {
            kind: targetRef.kind,
            namespace: targetRef.namespace,
            name: targetRef.name
          },
          type: incomingRelation,
          target: selfRef
        }));
      }
    }
    if (entity.kind === "Component") {
      const component = entity;
      doEmit(component.spec.owner, { defaultKind: "Group", defaultNamespace: selfRef.namespace }, catalogModel.RELATION_OWNED_BY, catalogModel.RELATION_OWNER_OF);
      doEmit(component.spec.subcomponentOf, { defaultKind: "Component", defaultNamespace: selfRef.namespace }, catalogModel.RELATION_PART_OF, catalogModel.RELATION_HAS_PART);
      doEmit(component.spec.providesApis, { defaultKind: "API", defaultNamespace: selfRef.namespace }, catalogModel.RELATION_PROVIDES_API, catalogModel.RELATION_API_PROVIDED_BY);
      doEmit(component.spec.consumesApis, { defaultKind: "API", defaultNamespace: selfRef.namespace }, catalogModel.RELATION_CONSUMES_API, catalogModel.RELATION_API_CONSUMED_BY);
      doEmit(component.spec.dependsOn, { defaultNamespace: selfRef.namespace }, catalogModel.RELATION_DEPENDS_ON, catalogModel.RELATION_DEPENDENCY_OF);
      doEmit(component.spec.system, { defaultKind: "System", defaultNamespace: selfRef.namespace }, catalogModel.RELATION_PART_OF, catalogModel.RELATION_HAS_PART);
    }
    if (entity.kind === "API") {
      const api = entity;
      doEmit(api.spec.owner, { defaultKind: "Group", defaultNamespace: selfRef.namespace }, catalogModel.RELATION_OWNED_BY, catalogModel.RELATION_OWNER_OF);
      doEmit(api.spec.system, { defaultKind: "System", defaultNamespace: selfRef.namespace }, catalogModel.RELATION_PART_OF, catalogModel.RELATION_HAS_PART);
    }
    if (entity.kind === "Resource") {
      const resource = entity;
      doEmit(resource.spec.owner, { defaultKind: "Group", defaultNamespace: selfRef.namespace }, catalogModel.RELATION_OWNED_BY, catalogModel.RELATION_OWNER_OF);
      doEmit(resource.spec.dependsOn, { defaultNamespace: selfRef.namespace }, catalogModel.RELATION_DEPENDS_ON, catalogModel.RELATION_DEPENDENCY_OF);
      doEmit(resource.spec.dependencyOf, { defaultNamespace: selfRef.namespace }, catalogModel.RELATION_DEPENDENCY_OF, catalogModel.RELATION_DEPENDS_ON);
      doEmit(resource.spec.system, { defaultKind: "System", defaultNamespace: selfRef.namespace }, catalogModel.RELATION_PART_OF, catalogModel.RELATION_HAS_PART);
    }
    if (entity.kind === "User") {
      const user = entity;
      doEmit(user.spec.memberOf, { defaultKind: "Group", defaultNamespace: selfRef.namespace }, catalogModel.RELATION_MEMBER_OF, catalogModel.RELATION_HAS_MEMBER);
    }
    if (entity.kind === "Group") {
      const group = entity;
      doEmit(group.spec.parent, { defaultKind: "Group", defaultNamespace: selfRef.namespace }, catalogModel.RELATION_CHILD_OF, catalogModel.RELATION_PARENT_OF);
      doEmit(group.spec.children, { defaultKind: "Group", defaultNamespace: selfRef.namespace }, catalogModel.RELATION_PARENT_OF, catalogModel.RELATION_CHILD_OF);
      doEmit(group.spec.members, { defaultKind: "User", defaultNamespace: selfRef.namespace }, catalogModel.RELATION_HAS_MEMBER, catalogModel.RELATION_MEMBER_OF);
    }
    if (entity.kind === "System") {
      const system = entity;
      doEmit(system.spec.owner, { defaultKind: "Group", defaultNamespace: selfRef.namespace }, catalogModel.RELATION_OWNED_BY, catalogModel.RELATION_OWNER_OF);
      doEmit(system.spec.domain, { defaultKind: "Domain", defaultNamespace: selfRef.namespace }, catalogModel.RELATION_PART_OF, catalogModel.RELATION_HAS_PART);
    }
    if (entity.kind === "Domain") {
      const domain = entity;
      doEmit(domain.spec.owner, { defaultKind: "Group", defaultNamespace: selfRef.namespace }, catalogModel.RELATION_OWNED_BY, catalogModel.RELATION_OWNER_OF);
    }
    return entity;
  }
}

const glob = util.promisify(g__default["default"]);
class FileReaderProcessor {
  getProcessorName() {
    return "FileReaderProcessor";
  }
  async readLocation(location, optional, emit, parser) {
    if (location.type !== "file") {
      return false;
    }
    try {
      const fileMatches = await glob(location.target);
      if (fileMatches.length > 0) {
        for (const fileMatch of fileMatches) {
          const data = await fs__default["default"].readFile(fileMatch);
          for await (const parseResult of parser({
            data,
            location: {
              type: "file",
              target: path__default["default"].normalize(fileMatch)
            }
          })) {
            emit(parseResult);
          }
        }
      } else if (!optional) {
        const message = `${location.type} ${location.target} does not exist`;
        emit(processingResult.notFoundError(location, message));
      }
    } catch (e) {
      const message = `${location.type} ${location.target} could not be read, ${e}`;
      emit(processingResult.generalError(location, message));
    }
    return true;
  }
}

function toAbsoluteUrl$1(integrations, base, target) {
  try {
    if (base.type === "file") {
      if (target.startsWith(".")) {
        return path__default["default"].join(path__default["default"].dirname(base.target), target);
      }
      return target;
    }
    return integrations.resolveUrl({ url: target, base: base.target });
  } catch (e) {
    return target;
  }
}
class LocationEntityProcessor {
  constructor(options) {
    this.options = options;
  }
  getProcessorName() {
    return "LocationEntityProcessor";
  }
  async postProcessEntity(entity, location, emit) {
    if (entity.kind === "Location") {
      const locationEntity = entity;
      const type = locationEntity.spec.type || location.type;
      if (type === "file" && location.target.endsWith(path__default["default"].sep)) {
        emit(processingResult.inputError(location, `LocationEntityProcessor cannot handle ${type} type location with target ${location.target} that ends with a path separator`));
      }
      const targets = new Array();
      if (locationEntity.spec.target) {
        targets.push(locationEntity.spec.target);
      }
      if (locationEntity.spec.targets) {
        targets.push(...locationEntity.spec.targets);
      }
      for (const maybeRelativeTarget of targets) {
        const target = toAbsoluteUrl$1(this.options.integrations, location, maybeRelativeTarget);
        emit(processingResult.location({ type, target }));
      }
    }
    return entity;
  }
}

class PlaceholderProcessor {
  constructor(options) {
    this.options = options;
  }
  getProcessorName() {
    return "PlaceholderProcessor";
  }
  async preProcessEntity(entity, location) {
    const process = async (data) => {
      if (!data || !(data instanceof Object)) {
        return [data, false];
      }
      if (Array.isArray(data)) {
        const items = await Promise.all(data.map((item) => process(item)));
        return items.every(([, changed]) => !changed) ? [data, false] : [items.map(([item]) => item), true];
      }
      const keys = Object.keys(data);
      if (!keys.some((k) => k.startsWith("$"))) {
        const entries = await Promise.all(Object.entries(data).map(([k, v]) => process(v).then((vp) => [k, vp])));
        return entries.every(([, [, changed]]) => !changed) ? [data, false] : [Object.fromEntries(entries.map(([k, [v]]) => [k, v])), true];
      } else if (keys.length !== 1) {
        return [data, false];
      }
      const resolverKey = keys[0].substr(1);
      const resolverValue = data[keys[0]];
      const resolver = this.options.resolvers[resolverKey];
      if (!resolver || typeof resolverValue !== "string") {
        return [data, false];
      }
      const read = async (url) => {
        if (this.options.reader.readUrl) {
          const response = await this.options.reader.readUrl(url);
          const buffer = await response.buffer();
          return buffer;
        }
        return this.options.reader.read(url);
      };
      const resolveUrl = (url, base) => this.options.integrations.resolveUrl({
        url,
        base
      });
      return [
        await resolver({
          key: resolverKey,
          value: resolverValue,
          baseUrl: location.target,
          read,
          resolveUrl
        }),
        true
      ];
    };
    const [result] = await process(entity);
    return result;
  }
}
async function yamlPlaceholderResolver(params) {
  var _a;
  const text = await readTextLocation(params);
  let documents;
  try {
    documents = yaml__default["default"].parseAllDocuments(text).filter((d) => d);
  } catch (e) {
    throw new Error(`Placeholder $${params.key} failed to parse YAML data at ${params.value}, ${e}`);
  }
  if (documents.length !== 1) {
    throw new Error(`Placeholder $${params.key} expected to find exactly one document of data at ${params.value}, found ${documents.length}`);
  }
  const document = documents[0];
  if ((_a = document.errors) == null ? void 0 : _a.length) {
    throw new Error(`Placeholder $${params.key} found an error in the data at ${params.value}, ${document.errors[0]}`);
  }
  return document.toJSON();
}
async function jsonPlaceholderResolver(params) {
  const text = await readTextLocation(params);
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Placeholder $${params.key} failed to parse JSON data at ${params.value}, ${e}`);
  }
}
async function textPlaceholderResolver(params) {
  return await readTextLocation(params);
}
async function readTextLocation(params) {
  const newUrl = relativeUrl(params);
  try {
    const data = await params.read(newUrl);
    return data.toString("utf-8");
  } catch (e) {
    throw new Error(`Placeholder $${params.key} could not read location ${params.value}, ${e}`);
  }
}
function relativeUrl({
  key,
  value,
  baseUrl,
  resolveUrl
}) {
  if (typeof value !== "string") {
    throw new Error(`Placeholder $${key} expected a string value parameter, in the form of an absolute URL or a relative path`);
  }
  try {
    return resolveUrl(value, baseUrl);
  } catch (e) {
    throw new Error(`Placeholder $${key} could not form a URL out of ${baseUrl} and ${value}, ${e}`);
  }
}

const CACHE_KEY = "v1";
class UrlReaderProcessor {
  constructor(options) {
    this.options = options;
  }
  getProcessorName() {
    return "url-reader";
  }
  async readLocation(location, optional, emit, parser, cache) {
    if (location.type !== "url") {
      return false;
    }
    const cacheItem = await cache.get(CACHE_KEY);
    try {
      const { response, etag: newEtag } = await this.doRead(location.target, cacheItem == null ? void 0 : cacheItem.etag);
      const parseResults = [];
      for (const item of response) {
        for await (const parseResult of parser({
          data: item.data,
          location: { type: location.type, target: item.url }
        })) {
          parseResults.push(parseResult);
          emit(parseResult);
        }
      }
      const isOnlyEntities = parseResults.every((r) => r.type === "entity");
      if (newEtag && isOnlyEntities) {
        await cache.set(CACHE_KEY, {
          etag: newEtag,
          value: parseResults
        });
      }
    } catch (error) {
      errors.assertError(error);
      const message = `Unable to read ${location.type}, ${error}`;
      if (error.name === "NotModifiedError" && cacheItem) {
        for (const parseResult of cacheItem.value) {
          emit(parseResult);
        }
      } else if (error.name === "NotFoundError") {
        if (!optional) {
          emit(processingResult.notFoundError(location, message));
        }
      } else {
        emit(processingResult.generalError(location, message));
      }
    }
    return true;
  }
  async doRead(location, etag) {
    const { filepath } = parseGitUrl__default["default"](location);
    if (filepath == null ? void 0 : filepath.match(/[*?]/)) {
      const limiter = limiterFactory__default["default"](5);
      const response = await this.options.reader.search(location, { etag });
      const output = response.files.map(async (file) => ({
        url: file.url,
        data: await limiter(file.content)
      }));
      return { response: await Promise.all(output), etag: response.etag };
    }
    if (this.options.reader.readUrl) {
      const data2 = await this.options.reader.readUrl(location, { etag });
      return {
        response: [{ url: location, data: await data2.buffer() }],
        etag: data2.etag
      };
    }
    const data = await this.options.reader.read(location);
    return { response: [{ url: location, data }] };
  }
}

function* parseEntityYaml(data, location) {
  var _a;
  let documents;
  try {
    documents = yaml__default["default"].parseAllDocuments(data.toString("utf8")).filter((d) => d);
  } catch (e) {
    const loc = catalogModel.stringifyLocationRef(location);
    const message = `Failed to parse YAML at ${loc}, ${e}`;
    yield processingResult.generalError(location, message);
    return;
  }
  for (const document of documents) {
    if ((_a = document.errors) == null ? void 0 : _a.length) {
      const loc = catalogModel.stringifyLocationRef(location);
      const message = `YAML error at ${loc}, ${document.errors[0]}`;
      yield processingResult.generalError(location, message);
    } else {
      const json = document.toJSON();
      if (lodash__default["default"].isPlainObject(json)) {
        yield processingResult.entity(location, json);
      } else if (json === null) ; else {
        const message = `Expected object at root, got ${typeof json}`;
        yield processingResult.generalError(location, message);
      }
    }
  }
}
const defaultEntityDataParser = async function* defaultEntityDataParser2({ data, location }) {
  for (const e of parseEntityYaml(data, location)) {
    yield e;
  }
};

const createCatalogPermissionRule = pluginPermissionNode.makeCreatePermissionRule();

const hasAnnotation = createCatalogPermissionRule({
  name: "HAS_ANNOTATION",
  description: "Allow entities which are annotated with the specified annotation",
  resourceType: pluginCatalogCommon.RESOURCE_TYPE_CATALOG_ENTITY,
  apply: (resource, annotation) => {
    var _a;
    return !!((_a = resource.metadata.annotations) == null ? void 0 : _a.hasOwnProperty(annotation));
  },
  toQuery: (annotation) => ({
    key: `metadata.annotations.${annotation}`
  })
});

const isEntityKind = createCatalogPermissionRule({
  name: "IS_ENTITY_KIND",
  description: "Allow entities with the specified kind",
  resourceType: pluginCatalogCommon.RESOURCE_TYPE_CATALOG_ENTITY,
  apply(resource, kinds) {
    const resourceKind = resource.kind.toLocaleLowerCase("en-US");
    return kinds.some((kind) => kind.toLocaleLowerCase("en-US") === resourceKind);
  },
  toQuery(kinds) {
    return {
      key: "kind",
      values: kinds.map((kind) => kind.toLocaleLowerCase("en-US"))
    };
  }
});

const isEntityOwner = createCatalogPermissionRule({
  name: "IS_ENTITY_OWNER",
  description: "Allow entities owned by the current user",
  resourceType: pluginCatalogCommon.RESOURCE_TYPE_CATALOG_ENTITY,
  apply: (resource, claims) => {
    if (!resource.relations) {
      return false;
    }
    return resource.relations.filter((relation) => relation.type === catalogModel.RELATION_OWNED_BY).some((relation) => claims.includes(relation.targetRef));
  },
  toQuery: (claims) => ({
    key: "relations.ownedBy",
    values: claims
  })
});

const hasLabel = createCatalogPermissionRule({
  name: "HAS_LABEL",
  description: "Allow entities which have the specified label metadata.",
  resourceType: pluginCatalogCommon.RESOURCE_TYPE_CATALOG_ENTITY,
  apply: (resource, label) => {
    var _a;
    return !!((_a = resource.metadata.labels) == null ? void 0 : _a.hasOwnProperty(label));
  },
  toQuery: (label) => ({
    key: `metadata.labels.${label}`
  })
});

const createPropertyRule = (propertyType) => createCatalogPermissionRule({
  name: `HAS_${propertyType.toUpperCase()}`,
  description: `Allow entities which have the specified ${propertyType} subfield.`,
  resourceType: pluginCatalogCommon.RESOURCE_TYPE_CATALOG_ENTITY,
  apply: (resource, key, value) => {
    const foundValue = lodash.get(resource[propertyType], key);
    if (value !== void 0) {
      return value === foundValue;
    }
    return !!foundValue;
  },
  toQuery: (key, value) => ({
    key: `${propertyType}.${key}`,
    ...value !== void 0 && { values: [value] }
  })
});

const hasMetadata = createPropertyRule("metadata");

const hasSpec = createPropertyRule("spec");

const permissionRules = {
  hasAnnotation,
  hasLabel,
  hasMetadata,
  hasSpec,
  isEntityKind,
  isEntityOwner
};

const { conditions, createConditionalDecision } = pluginPermissionNode.createConditionExports({
  pluginId: "catalog",
  resourceType: pluginCatalogCommon.RESOURCE_TYPE_CATALOG_ENTITY,
  rules: permissionRules
});
const catalogConditions = conditions;
const createCatalogConditionalDecision = createConditionalDecision;

function createRandomProcessingInterval(options) {
  const { minSeconds, maxSeconds } = options;
  return () => {
    return Math.random() * (maxSeconds - minSeconds) + minSeconds;
  };
}

function isUserEntity(entity) {
  return entity.kind.toLocaleUpperCase("en-US") === "USER";
}
function isGroupEntity(entity) {
  return entity.kind.toLocaleUpperCase("en-US") === "GROUP";
}
function getDocumentText(entity) {
  var _a, _b;
  const documentTexts = [];
  documentTexts.push(entity.metadata.description || "");
  if (isUserEntity(entity) || isGroupEntity(entity)) {
    if ((_b = (_a = entity.spec) == null ? void 0 : _a.profile) == null ? void 0 : _b.displayName) {
      documentTexts.push(entity.spec.profile.displayName);
    }
  }
  return documentTexts.join(" : ");
}

class DefaultCatalogCollatorFactory {
  constructor(options) {
    this.type = "software-catalog";
    this.visibilityPermission = pluginCatalogCommon.catalogEntityReadPermission;
    const {
      batchSize,
      discovery,
      locationTemplate,
      filter,
      catalogClient: catalogClient$1,
      tokenManager
    } = options;
    this.locationTemplate = locationTemplate || "/catalog/:namespace/:kind/:name";
    this.filter = filter;
    this.batchSize = batchSize || 500;
    this.catalogClient = catalogClient$1 || new catalogClient.CatalogClient({ discoveryApi: discovery });
    this.tokenManager = tokenManager;
  }
  static fromConfig(_config, options) {
    return new DefaultCatalogCollatorFactory(options);
  }
  async getCollator() {
    return stream.Readable.from(this.execute());
  }
  applyArgsToFormat(format, args) {
    let formatted = format;
    for (const [key, value] of Object.entries(args)) {
      formatted = formatted.replace(`:${key}`, value);
    }
    return formatted.toLowerCase();
  }
  async *execute() {
    var _a, _b, _c, _d, _e, _f, _g;
    const { token } = await this.tokenManager.getToken();
    let entitiesRetrieved = 0;
    let moreEntitiesToGet = true;
    while (moreEntitiesToGet) {
      const entities = (await this.catalogClient.getEntities({
        filter: this.filter,
        limit: this.batchSize,
        offset: entitiesRetrieved
      }, { token })).items;
      moreEntitiesToGet = entities.length === this.batchSize;
      entitiesRetrieved += entities.length;
      for (const entity of entities) {
        yield {
          title: (_a = entity.metadata.title) != null ? _a : entity.metadata.name,
          location: this.applyArgsToFormat(this.locationTemplate, {
            namespace: entity.metadata.namespace || "default",
            kind: entity.kind,
            name: entity.metadata.name
          }),
          text: getDocumentText(entity),
          componentType: ((_c = (_b = entity.spec) == null ? void 0 : _b.type) == null ? void 0 : _c.toString()) || "other",
          type: ((_e = (_d = entity.spec) == null ? void 0 : _d.type) == null ? void 0 : _e.toString()) || "other",
          namespace: entity.metadata.namespace || "default",
          kind: entity.kind,
          lifecycle: ((_f = entity.spec) == null ? void 0 : _f.lifecycle) || "",
          owner: ((_g = entity.spec) == null ? void 0 : _g.owner) || "",
          authorization: {
            resourceRef: catalogModel.stringifyEntityRef(entity)
          }
        };
      }
    }
  }
}

class DefaultCatalogCollator {
  constructor(options) {
    this.type = "software-catalog";
    this.visibilityPermission = pluginCatalogCommon.catalogEntityReadPermission;
    const { discovery, locationTemplate, filter, catalogClient: catalogClient$1, tokenManager } = options;
    this.discovery = discovery;
    this.locationTemplate = locationTemplate || "/catalog/:namespace/:kind/:name";
    this.filter = filter;
    this.catalogClient = catalogClient$1 || new catalogClient.CatalogClient({ discoveryApi: discovery });
    this.tokenManager = tokenManager;
  }
  static fromConfig(_config, options) {
    return new DefaultCatalogCollator({
      ...options
    });
  }
  applyArgsToFormat(format, args) {
    let formatted = format;
    for (const [key, value] of Object.entries(args)) {
      formatted = formatted.replace(`:${key}`, value);
    }
    return formatted.toLowerCase();
  }
  isUserEntity(entity) {
    return entity.kind.toLocaleUpperCase("en-US") === "USER";
  }
  getDocumentText(entity) {
    var _a, _b, _c, _d, _e, _f;
    let documentText = entity.metadata.description || "";
    if (this.isUserEntity(entity)) {
      if (((_b = (_a = entity.spec) == null ? void 0 : _a.profile) == null ? void 0 : _b.displayName) && documentText) {
        const displayName = (_d = (_c = entity.spec) == null ? void 0 : _c.profile) == null ? void 0 : _d.displayName;
        documentText = displayName.concat(" : ", documentText);
      } else {
        documentText = ((_f = (_e = entity.spec) == null ? void 0 : _e.profile) == null ? void 0 : _f.displayName) || documentText;
      }
    }
    return documentText;
  }
  async execute() {
    const { token } = await this.tokenManager.getToken();
    const response = await this.catalogClient.getEntities({
      filter: this.filter
    }, { token });
    return response.items.map((entity) => {
      var _a, _b, _c, _d, _e, _f, _g;
      return {
        title: (_a = entity.metadata.title) != null ? _a : entity.metadata.name,
        location: this.applyArgsToFormat(this.locationTemplate, {
          namespace: entity.metadata.namespace || "default",
          kind: entity.kind,
          name: entity.metadata.name
        }),
        text: this.getDocumentText(entity),
        componentType: ((_c = (_b = entity.spec) == null ? void 0 : _b.type) == null ? void 0 : _c.toString()) || "other",
        type: ((_e = (_d = entity.spec) == null ? void 0 : _d.type) == null ? void 0 : _e.toString()) || "other",
        namespace: entity.metadata.namespace || "default",
        kind: entity.kind,
        lifecycle: ((_f = entity.spec) == null ? void 0 : _f.lifecycle) || "",
        owner: ((_g = entity.spec) == null ? void 0 : _g.owner) || "",
        authorization: {
          resourceRef: catalogModel.stringifyEntityRef(entity)
        }
      };
    });
  }
}

function isLocationEntity(entity) {
  return entity.kind === "Location";
}
function getEntityLocationRef(entity) {
  var _a;
  const ref = (_a = entity.metadata.annotations) == null ? void 0 : _a[catalogModel.ANNOTATION_LOCATION];
  if (!ref) {
    const entityRef = catalogModel.stringifyEntityRef(entity);
    throw new errors.InputError(`Entity '${entityRef}' does not have the annotation ${catalogModel.ANNOTATION_LOCATION}`);
  }
  return ref;
}
function getEntityOriginLocationRef(entity) {
  var _a;
  const ref = (_a = entity.metadata.annotations) == null ? void 0 : _a[catalogModel.ANNOTATION_ORIGIN_LOCATION];
  if (!ref) {
    const entityRef = catalogModel.stringifyEntityRef(entity);
    throw new errors.InputError(`Entity '${entityRef}' does not have the annotation ${catalogModel.ANNOTATION_ORIGIN_LOCATION}`);
  }
  return ref;
}
function toAbsoluteUrl(integrations, base, type, target) {
  if (base.type !== type) {
    return target;
  }
  try {
    if (type === "file") {
      if (target.startsWith(".")) {
        return path__default["default"].join(path__default["default"].dirname(base.target), target);
      }
      return target;
    } else if (type === "url") {
      return integrations.resolveUrl({ url: target, base: base.target });
    }
    return target;
  } catch (e) {
    return target;
  }
}
function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
const validateEntity = catalogModel.entitySchemaValidator();
const validateEntityEnvelope = catalogModel.entityEnvelopeSchemaValidator();

function locationSpecToMetadataName(location) {
  const hash = crypto.createHash("sha1").update(`${location.type}:${location.target}`).digest("hex");
  return `generated-${hash}`;
}
function locationSpecToLocationEntity(opts) {
  var _a, _b;
  const location = opts.location;
  const parentEntity = opts.parentEntity;
  let ownLocation;
  let originLocation;
  if (parentEntity) {
    const maybeOwnLocation = (_a = parentEntity.metadata.annotations) == null ? void 0 : _a[catalogModel.ANNOTATION_LOCATION];
    if (!maybeOwnLocation) {
      throw new Error(`Parent entity '${catalogModel.stringifyEntityRef(parentEntity)}' of location '${catalogModel.stringifyLocationRef(location)}' does not have a location annotation`);
    }
    ownLocation = maybeOwnLocation;
    const maybeOriginLocation = (_b = parentEntity.metadata.annotations) == null ? void 0 : _b[catalogModel.ANNOTATION_ORIGIN_LOCATION];
    if (!maybeOriginLocation) {
      throw new Error(`Parent entity '${catalogModel.stringifyEntityRef(parentEntity)}' of location '${catalogModel.stringifyLocationRef(location)}' does not have an origin location annotation`);
    }
    originLocation = maybeOriginLocation;
  } else {
    ownLocation = catalogModel.stringifyLocationRef(location);
    originLocation = ownLocation;
  }
  const result = {
    apiVersion: "backstage.io/v1alpha1",
    kind: "Location",
    metadata: {
      name: locationSpecToMetadataName(location),
      annotations: {
        [catalogModel.ANNOTATION_LOCATION]: ownLocation,
        [catalogModel.ANNOTATION_ORIGIN_LOCATION]: originLocation
      }
    },
    spec: {
      type: location.type,
      target: location.target,
      presence: location.presence
    }
  };
  return result;
}

class ConfigLocationEntityProvider {
  constructor(config) {
    this.config = config;
  }
  getProviderName() {
    return "ConfigLocationProvider";
  }
  async connect(connection) {
    const entities = this.getEntitiesFromConfig();
    await connection.applyMutation({
      type: "full",
      entities
    });
    if (this.config.subscribe) {
      let currentKey = JSON.stringify(entities);
      this.config.subscribe(() => {
        const newEntities = this.getEntitiesFromConfig();
        const newKey = JSON.stringify(newEntities);
        if (currentKey !== newKey) {
          currentKey = newKey;
          connection.applyMutation({
            type: "full",
            entities: newEntities
          });
        }
      });
    }
  }
  getEntitiesFromConfig() {
    var _a;
    const locationConfigs = (_a = this.config.getOptionalConfigArray("catalog.locations")) != null ? _a : [];
    return locationConfigs.map((location) => {
      const type = location.getString("type");
      const target = location.getString("target");
      const entity = locationSpecToLocationEntity({
        location: {
          type,
          target: type === "file" ? path__default["default"].resolve(target) : target
        }
      });
      const locationKey = getEntityLocationRef(entity);
      return { entity, locationKey };
    });
  }
}

class DefaultLocationStore {
  constructor(db) {
    this.db = db;
  }
  getProviderName() {
    return "DefaultLocationStore";
  }
  async createLocation(input) {
    const location = await this.db.transaction(async (tx) => {
      const previousLocations = await this.locations(tx);
      const previousLocation = previousLocations.some((l) => input.type === l.type && input.target === l.target);
      if (previousLocation) {
        throw new errors.ConflictError(`Location ${input.type}:${input.target} already exists`);
      }
      const inner = {
        id: uuid.v4(),
        type: input.type,
        target: input.target
      };
      await tx("locations").insert(inner);
      return inner;
    });
    const entity = locationSpecToLocationEntity({ location });
    await this.connection.applyMutation({
      type: "delta",
      added: [{ entity, locationKey: getEntityLocationRef(entity) }],
      removed: []
    });
    return location;
  }
  async listLocations() {
    return await this.locations();
  }
  async getLocation(id) {
    const items = await this.db("locations").where({ id }).select();
    if (!items.length) {
      throw new errors.NotFoundError(`Found no location with ID ${id}`);
    }
    return items[0];
  }
  async deleteLocation(id) {
    if (!this.connection) {
      throw new Error("location store is not initialized");
    }
    const deleted = await this.db.transaction(async (tx) => {
      const [location] = await tx("locations").where({ id }).select();
      if (!location) {
        throw new errors.NotFoundError(`Found no location with ID ${id}`);
      }
      await tx("locations").where({ id }).del();
      return location;
    });
    const entity = locationSpecToLocationEntity({ location: deleted });
    await this.connection.applyMutation({
      type: "delta",
      added: [],
      removed: [{ entity, locationKey: getEntityLocationRef(entity) }]
    });
  }
  get connection() {
    if (!this._connection) {
      throw new Error("location store is not initialized");
    }
    return this._connection;
  }
  async connect(connection) {
    this._connection = connection;
    const locations = await this.locations();
    const entities = locations.map((location) => {
      const entity = locationSpecToLocationEntity({ location });
      return { entity, locationKey: getEntityLocationRef(entity) };
    });
    await this.connection.applyMutation({
      type: "full",
      entities
    });
  }
  async locations(dbOrTx = this.db) {
    const locations = await dbOrTx("locations").select();
    return locations.filter(({ type }) => type !== "bootstrap").map((item) => ({
      id: item.id,
      target: item.target,
      type: item.type
    }));
  }
}

class RepoLocationAnalyzer {
  constructor(logger, scmIntegrations) {
    this.logger = logger;
    this.scmIntegrations = scmIntegrations;
  }
  async analyzeLocation(request) {
    const { owner, name } = parseGitUrl__default["default"](request.location.target);
    const entity = {
      apiVersion: "backstage.io/v1alpha1",
      kind: "Component",
      metadata: {
        name
      },
      spec: { type: "other", lifecycle: "unknown" }
    };
    const integration = this.scmIntegrations.byUrl(request.location.target);
    let annotationPrefix;
    switch (integration == null ? void 0 : integration.type) {
      case "azure":
        annotationPrefix = "dev.azure.com";
        break;
      case "bitbucket":
        annotationPrefix = "bitbucket.org";
        break;
      case "github":
        annotationPrefix = "github.com";
        break;
      case "gitlab":
        annotationPrefix = "gitlab.com";
        break;
    }
    if (annotationPrefix) {
      entity.metadata.annotations = {
        [`${annotationPrefix}/project-slug`]: `${owner}/${name}`
      };
    }
    this.logger.debug(`entity created for ${request.location.target}`);
    return {
      existingEntityFiles: [],
      generateEntities: [{ entity, fields: [] }]
    };
  }
}

function timestampToDateTime(input) {
  try {
    if (typeof input === "object") {
      return luxon.DateTime.fromJSDate(input).toUTC();
    }
    const result = input.includes(" ") ? luxon.DateTime.fromSQL(input, { zone: "utc" }) : luxon.DateTime.fromISO(input, { zone: "utc" });
    if (!result.isValid) {
      throw new TypeError("Not valid");
    }
    return result;
  } catch (e) {
    throw new errors.InputError(`Failed to parse database timestamp ${input}`, e);
  }
}
function rethrowError(e) {
  if (backendCommon.isDatabaseConflictError(e)) {
    throw new errors.ConflictError(`Rejected due to a conflicting entity`, e);
  }
  throw e;
}

function createCounterMetric(config) {
  const existing = promClient.register.getSingleMetric(config.name);
  return existing || new promClient.Counter(config);
}
function createGaugeMetric(config) {
  const existing = promClient.register.getSingleMetric(config.name);
  return existing || new promClient.Gauge(config);
}
function createSummaryMetric(config) {
  const existing = promClient.register.getSingleMetric(config.name);
  return existing || new promClient.Summary(config);
}

function initDatabaseMetrics(knex) {
  const seen = /* @__PURE__ */ new Set();
  return {
    entities_count: createGaugeMetric({
      name: "catalog_entities_count",
      help: "Total amount of entities in the catalog",
      labelNames: ["kind"],
      async collect() {
        const result = await knex("refresh_state").select("entity_ref");
        const results = result.map((row) => row.entity_ref.split(":")[0]).reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), /* @__PURE__ */ new Map());
        results.forEach((value, key) => {
          seen.add(key);
          this.set({ kind: key }, value);
        });
        seen.forEach((key) => {
          if (!results.has(key)) {
            this.set({ kind: key }, 0);
            seen.delete(key);
          }
        });
      }
    }),
    registered_locations: createGaugeMetric({
      name: "catalog_registered_locations_count",
      help: "Total amount of registered locations in the catalog",
      async collect() {
        const total = await knex("locations").count({
          count: "*"
        });
        this.set(Number(total[0].count));
      }
    }),
    relations: createGaugeMetric({
      name: "catalog_relations_count",
      help: "Total amount of relations between entities",
      async collect() {
        const total = await knex("relations").count({
          count: "*"
        });
        this.set(Number(total[0].count));
      }
    })
  };
}

function generateStableHash$1(entity) {
  return crypto.createHash("sha1").update(stableStringify__default["default"]({ ...entity })).digest("hex");
}

const BATCH_SIZE$1 = 50;
const MAX_ANCESTOR_DEPTH = 32;
class DefaultProcessingDatabase {
  constructor(options) {
    this.options = options;
    initDatabaseMetrics(options.database);
  }
  async updateProcessedEntity(txOpaque, options) {
    const tx = txOpaque;
    const {
      id,
      processedEntity,
      resultHash,
      errors: errors$1,
      relations,
      deferredEntities,
      locationKey
    } = options;
    const refreshResult = await tx("refresh_state").update({
      processed_entity: JSON.stringify(processedEntity),
      result_hash: resultHash,
      errors: errors$1,
      location_key: locationKey
    }).where("entity_id", id).andWhere((inner) => {
      if (!locationKey) {
        return inner.whereNull("location_key");
      }
      return inner.where("location_key", locationKey).orWhereNull("location_key");
    });
    if (refreshResult === 0) {
      throw new errors.ConflictError(`Conflicting write of processing result for ${id} with location key '${locationKey}'`);
    }
    await this.addUnprocessedEntities(tx, {
      entities: deferredEntities,
      sourceEntityRef: catalogModel.stringifyEntityRef(processedEntity)
    });
    let previousRelationRows;
    if (tx.client.config.client.includes("sqlite3")) {
      previousRelationRows = await tx("relations").select("*").where({ originating_entity_id: id });
      await tx("relations").where({ originating_entity_id: id }).delete();
    } else {
      previousRelationRows = await tx("relations").where({ originating_entity_id: id }).delete().returning("*");
    }
    const relationRows = relations.map(({ source, target, type }) => ({
      originating_entity_id: id,
      source_entity_ref: catalogModel.stringifyEntityRef(source),
      target_entity_ref: catalogModel.stringifyEntityRef(target),
      type
    }));
    await tx.batchInsert("relations", this.deduplicateRelations(relationRows), BATCH_SIZE$1);
    return {
      previous: {
        relations: previousRelationRows
      }
    };
  }
  async updateProcessedEntityErrors(txOpaque, options) {
    const tx = txOpaque;
    const { id, errors, resultHash } = options;
    await tx("refresh_state").update({
      errors,
      result_hash: resultHash
    }).where("entity_id", id);
  }
  async updateEntityCache(txOpaque, options) {
    const tx = txOpaque;
    const { id, state } = options;
    await tx("refresh_state").update({ cache: JSON.stringify(state != null ? state : {}) }).where("entity_id", id);
  }
  async replaceUnprocessedEntities(txOpaque, options) {
    const tx = txOpaque;
    const { toAdd, toUpsert, toRemove } = await this.createDelta(tx, options);
    if (toRemove.length) {
      let removedCount = 0;
      for (const refs of lodash__default["default"].chunk(toRemove, 1e3)) {
        removedCount += await tx("refresh_state").whereIn("entity_ref", function orphanedEntityRefs(orphans) {
          return orphans.withRecursive("descendants", function descendants(outer) {
            return outer.select({ root_id: "id", entity_ref: "target_entity_ref" }).from("refresh_state_references").where("source_key", options.sourceKey).whereIn("target_entity_ref", refs).union(function recursive(inner) {
              return inner.select({
                root_id: "descendants.root_id",
                entity_ref: "refresh_state_references.target_entity_ref"
              }).from("descendants").join("refresh_state_references", {
                "descendants.entity_ref": "refresh_state_references.source_entity_ref"
              });
            });
          }).withRecursive("ancestors", function ancestors(outer) {
            return outer.select({
              root_id: tx.raw("CAST(NULL as INT)", []),
              via_entity_ref: "entity_ref",
              to_entity_ref: "entity_ref"
            }).from("descendants").union(function recursive(inner) {
              return inner.select({
                root_id: tx.raw("CASE WHEN source_key IS NOT NULL THEN id ELSE NULL END", []),
                via_entity_ref: "source_entity_ref",
                to_entity_ref: "ancestors.to_entity_ref"
              }).from("ancestors").join("refresh_state_references", {
                target_entity_ref: "ancestors.via_entity_ref"
              });
            });
          }).select("descendants.entity_ref").from("descendants").leftOuterJoin("ancestors", function keepaliveRoots() {
            this.on("ancestors.to_entity_ref", "=", "descendants.entity_ref");
            this.andOnNotNull("ancestors.root_id");
            this.andOn("ancestors.root_id", "!=", "descendants.root_id");
          }).whereNull("ancestors.root_id");
        }).delete();
        await tx("refresh_state_references").where("source_key", "=", options.sourceKey).whereIn("target_entity_ref", refs).delete();
      }
      this.options.logger.debug(`removed, ${removedCount} entities: ${JSON.stringify(toRemove)}`);
    }
    if (toAdd.length) {
      for (const chunk of lodash__default["default"].chunk(toAdd, 50)) {
        try {
          await tx.batchInsert("refresh_state", chunk.map((item) => ({
            entity_id: uuid.v4(),
            entity_ref: catalogModel.stringifyEntityRef(item.deferred.entity),
            unprocessed_entity: JSON.stringify(item.deferred.entity),
            unprocessed_hash: item.hash,
            errors: "",
            location_key: item.deferred.locationKey,
            next_update_at: tx.fn.now(),
            last_discovery_at: tx.fn.now()
          })), BATCH_SIZE$1);
          await tx.batchInsert("refresh_state_references", chunk.map((item) => ({
            source_key: options.sourceKey,
            target_entity_ref: catalogModel.stringifyEntityRef(item.deferred.entity)
          })), BATCH_SIZE$1);
        } catch (error) {
          if (!backendCommon.isDatabaseConflictError(error)) {
            throw error;
          } else {
            this.options.logger.debug(`Fast insert path failed, falling back to slow path, ${error}`);
            toUpsert.push(...chunk);
          }
        }
      }
    }
    if (toUpsert.length) {
      for (const {
        deferred: { entity, locationKey },
        hash
      } of toUpsert) {
        const entityRef = catalogModel.stringifyEntityRef(entity);
        try {
          let ok = await this.updateUnprocessedEntity(tx, entity, hash, locationKey);
          if (!ok) {
            ok = await this.insertUnprocessedEntity(tx, entity, hash, locationKey);
          }
          if (ok) {
            await tx("refresh_state_references").insert({
              source_key: options.sourceKey,
              target_entity_ref: entityRef
            });
          } else {
            const conflictingKey = await this.checkLocationKeyConflict(tx, entityRef, locationKey);
            if (conflictingKey) {
              this.options.logger.warn(`Source ${options.sourceKey} detected conflicting entityRef ${entityRef} already referenced by ${conflictingKey} and now also ${locationKey}`);
            }
          }
        } catch (error) {
          this.options.logger.error(`Failed to add '${entityRef}' from source '${options.sourceKey}', ${error}`);
        }
      }
    }
  }
  async getProcessableEntities(txOpaque, request) {
    const tx = txOpaque;
    let itemsQuery = tx("refresh_state").select();
    if (["mysql", "mysql2", "pg"].includes(tx.client.config.client)) {
      itemsQuery = itemsQuery.forUpdate().skipLocked();
    }
    const items = await itemsQuery.where("next_update_at", "<=", tx.fn.now()).limit(request.processBatchSize).orderBy("next_update_at", "asc");
    const interval = this.options.refreshInterval();
    await tx("refresh_state").whereIn("entity_ref", items.map((i) => i.entity_ref)).update({
      next_update_at: tx.client.config.client.includes("sqlite3") ? tx.raw(`datetime('now', ?)`, [`${interval} seconds`]) : tx.raw(`now() + interval '${interval} seconds'`)
    });
    return {
      items: items.map((i) => ({
        id: i.entity_id,
        entityRef: i.entity_ref,
        unprocessedEntity: JSON.parse(i.unprocessed_entity),
        processedEntity: i.processed_entity ? JSON.parse(i.processed_entity) : void 0,
        resultHash: i.result_hash || "",
        nextUpdateAt: timestampToDateTime(i.next_update_at),
        lastDiscoveryAt: timestampToDateTime(i.last_discovery_at),
        state: i.cache ? JSON.parse(i.cache) : void 0,
        errors: i.errors,
        locationKey: i.location_key
      }))
    };
  }
  async listAncestors(txOpaque, options) {
    var _a;
    const tx = txOpaque;
    const { entityRef } = options;
    const entityRefs = new Array();
    let currentRef = entityRef.toLocaleLowerCase("en-US");
    for (let depth = 1; depth <= MAX_ANCESTOR_DEPTH; depth += 1) {
      const rows = await tx("refresh_state_references").where({ target_entity_ref: currentRef }).select();
      if (rows.length === 0) {
        if (depth === 1) {
          throw new errors.NotFoundError(`Entity ${currentRef} not found`);
        }
        throw new errors.NotFoundError(`Entity ${entityRef} has a broken parent reference chain at ${currentRef}`);
      }
      const parentRef = (_a = rows.find((r) => r.source_entity_ref)) == null ? void 0 : _a.source_entity_ref;
      if (!parentRef) {
        return { entityRefs };
      }
      entityRefs.push(parentRef);
      currentRef = parentRef;
    }
    throw new Error(`Unable receive ancestors for ${entityRef}, reached maximum depth of ${MAX_ANCESTOR_DEPTH}`);
  }
  async listParents(txOpaque, options) {
    const tx = txOpaque;
    const rows = await tx("refresh_state_references").where({ target_entity_ref: options.entityRef }).select();
    const entityRefs = rows.map((r) => r.source_entity_ref).filter(Boolean);
    return { entityRefs };
  }
  async refresh(txOpaque, options) {
    const tx = txOpaque;
    const { entityRef } = options;
    const updateResult = await tx("refresh_state").where({ entity_ref: entityRef.toLocaleLowerCase("en-US") }).update({ next_update_at: tx.fn.now() });
    if (updateResult === 0) {
      throw new errors.NotFoundError(`Failed to schedule ${entityRef} for refresh`);
    }
  }
  async transaction(fn) {
    try {
      let result = void 0;
      await this.options.database.transaction(async (tx) => {
        result = await fn(tx);
      }, {
        doNotRejectOnRollback: true
      });
      return result;
    } catch (e) {
      this.options.logger.debug(`Error during transaction, ${e}`);
      throw rethrowError(e);
    }
  }
  async updateUnprocessedEntity(tx, entity, hash, locationKey) {
    const entityRef = catalogModel.stringifyEntityRef(entity);
    const serializedEntity = JSON.stringify(entity);
    const refreshResult = await tx("refresh_state").update({
      unprocessed_entity: serializedEntity,
      unprocessed_hash: hash,
      location_key: locationKey,
      last_discovery_at: tx.fn.now(),
      next_update_at: tx.fn.now()
    }).where("entity_ref", entityRef).andWhere((inner) => {
      if (!locationKey) {
        return inner.whereNull("location_key");
      }
      return inner.where("location_key", locationKey).orWhereNull("location_key");
    });
    return refreshResult === 1;
  }
  async insertUnprocessedEntity(tx, entity, hash, locationKey) {
    const entityRef = catalogModel.stringifyEntityRef(entity);
    const serializedEntity = JSON.stringify(entity);
    try {
      let query = tx("refresh_state").insert({
        entity_id: uuid.v4(),
        entity_ref: entityRef,
        unprocessed_entity: serializedEntity,
        unprocessed_hash: hash,
        errors: "",
        location_key: locationKey,
        next_update_at: tx.fn.now(),
        last_discovery_at: tx.fn.now()
      });
      if (!tx.client.config.client.includes("sqlite3")) {
        query = query.onConflict("entity_ref").ignore();
      }
      const result = await query;
      return result.rowCount === 1 || result.length === 1;
    } catch (error) {
      if (errors.isError(error) && error.message.includes("UNIQUE constraint failed")) {
        return false;
      }
      throw error;
    }
  }
  async checkLocationKeyConflict(tx, entityRef, locationKey) {
    const row = await tx("refresh_state").select("location_key").where("entity_ref", entityRef).first();
    const conflictingKey = row == null ? void 0 : row.location_key;
    if (!conflictingKey) {
      return void 0;
    }
    if (conflictingKey !== locationKey) {
      return conflictingKey;
    }
    return void 0;
  }
  deduplicateRelations(rows) {
    return lodash__default["default"].uniqBy(rows, (r) => `${r.source_entity_ref}:${r.target_entity_ref}:${r.type}`);
  }
  async createDelta(tx, options) {
    if (options.type === "delta") {
      return {
        toAdd: [],
        toUpsert: options.added.map((e) => ({
          deferred: e,
          hash: generateStableHash$1(e.entity)
        })),
        toRemove: options.removed.map((e) => catalogModel.stringifyEntityRef(e.entity))
      };
    }
    const oldRefs = await tx("refresh_state_references").leftJoin("refresh_state", {
      target_entity_ref: "entity_ref"
    }).where({ source_key: options.sourceKey }).select({
      target_entity_ref: "refresh_state_references.target_entity_ref",
      location_key: "refresh_state.location_key",
      unprocessed_hash: "refresh_state.unprocessed_hash"
    });
    const items = options.items.map((deferred) => ({
      deferred,
      ref: catalogModel.stringifyEntityRef(deferred.entity),
      hash: generateStableHash$1(deferred.entity)
    }));
    const oldRefsSet = new Map(oldRefs.map((r) => [
      r.target_entity_ref,
      {
        locationKey: r.location_key,
        oldEntityHash: r.unprocessed_hash
      }
    ]));
    const newRefsSet = new Set(items.map((item) => item.ref));
    const toAdd = new Array();
    const toUpsert = new Array();
    const toRemove = oldRefs.map((row) => row.target_entity_ref).filter((ref) => !newRefsSet.has(ref));
    for (const item of items) {
      const oldRef = oldRefsSet.get(item.ref);
      const upsertItem = { deferred: item.deferred, hash: item.hash };
      if (!oldRef) {
        toAdd.push(upsertItem);
      } else if (oldRef.locationKey !== item.deferred.locationKey) {
        toRemove.push(item.ref);
        toAdd.push(upsertItem);
      } else if (oldRef.oldEntityHash !== item.hash) {
        toUpsert.push(upsertItem);
      }
    }
    return { toAdd, toUpsert, toRemove };
  }
  async addUnprocessedEntities(txOpaque, options) {
    const tx = txOpaque;
    const stateReferences = new Array();
    const conflictingStateReferences = new Array();
    for (const { entity, locationKey } of options.entities) {
      const entityRef = catalogModel.stringifyEntityRef(entity);
      const hash = generateStableHash$1(entity);
      const updated = await this.updateUnprocessedEntity(tx, entity, hash, locationKey);
      if (updated) {
        stateReferences.push(entityRef);
        continue;
      }
      const inserted = await this.insertUnprocessedEntity(tx, entity, hash, locationKey);
      if (inserted) {
        stateReferences.push(entityRef);
        continue;
      }
      const conflictingKey = await this.checkLocationKeyConflict(tx, entityRef, locationKey);
      if (conflictingKey) {
        this.options.logger.warn(`Detected conflicting entityRef ${entityRef} already referenced by ${conflictingKey} and now also ${locationKey}`);
        conflictingStateReferences.push(entityRef);
      }
    }
    await tx("refresh_state_references").whereNotIn("target_entity_ref", conflictingStateReferences).andWhere({ source_entity_ref: options.sourceEntityRef }).delete();
    await tx.batchInsert("refresh_state_references", stateReferences.map((entityRef) => ({
      source_entity_ref: options.sourceEntityRef,
      target_entity_ref: entityRef
    })), BATCH_SIZE$1);
  }
}

async function applyDatabaseMigrations(knex) {
  const migrationsDir = backendCommon.resolvePackagePath("@backstage/plugin-catalog-backend", "migrations");
  await knex.migrate.latest({
    directory: migrationsDir
  });
}

const DEFAULT_POLLING_INTERVAL_MS = 1e3;
function startTaskPipeline(options) {
  const {
    loadTasks,
    processTask,
    lowWatermark,
    highWatermark,
    pollingIntervalMs = DEFAULT_POLLING_INTERVAL_MS
  } = options;
  if (lowWatermark >= highWatermark) {
    throw new Error("lowWatermark must be lower than highWatermark");
  }
  let loading = false;
  let stopped = false;
  let inFlightCount = 0;
  async function maybeLoadMore() {
    if (stopped || loading || inFlightCount > lowWatermark) {
      return;
    }
    loading = true;
    const loadCount = highWatermark - inFlightCount;
    const loadedItems = await loadTasks(loadCount);
    loading = false;
    inFlightCount += loadedItems.length;
    loadedItems.forEach((item) => {
      processTask(item).finally(() => {
        if (stopped) {
          return;
        }
        inFlightCount -= 1;
        maybeLoadMore();
      });
    });
    if (loadedItems.length > 1) {
      maybeLoadMore();
    }
  }
  const intervalId = setInterval(() => {
    maybeLoadMore();
  }, pollingIntervalMs);
  return () => {
    stopped = true;
    clearInterval(intervalId);
  };
}

const CACHE_TTL = 5;
class DefaultCatalogProcessingEngine {
  constructor(logger, processingDatabase, orchestrator, stitcher, createHash, pollingIntervalMs = 1e3) {
    this.logger = logger;
    this.processingDatabase = processingDatabase;
    this.orchestrator = orchestrator;
    this.stitcher = stitcher;
    this.createHash = createHash;
    this.pollingIntervalMs = pollingIntervalMs;
    this.tracker = progressTracker();
  }
  async start() {
    if (this.stopFunc) {
      throw new Error("Processing engine is already started");
    }
    this.stopFunc = startTaskPipeline({
      lowWatermark: 5,
      highWatermark: 10,
      pollingIntervalMs: this.pollingIntervalMs,
      loadTasks: async (count) => {
        try {
          const { items } = await this.processingDatabase.transaction(async (tx) => {
            return this.processingDatabase.getProcessableEntities(tx, {
              processBatchSize: count
            });
          });
          return items;
        } catch (error) {
          this.logger.warn("Failed to load processing items", error);
          return [];
        }
      },
      processTask: async (item) => {
        const track = this.tracker.processStart(item, this.logger);
        try {
          const {
            id,
            state,
            unprocessedEntity,
            entityRef,
            locationKey,
            resultHash: previousResultHash
          } = item;
          const result = await this.orchestrator.process({
            entity: unprocessedEntity,
            state
          });
          track.markProcessorsCompleted(result);
          if (result.ok) {
            if (stableStringify__default["default"](state) !== stableStringify__default["default"](result.state)) {
              await this.processingDatabase.transaction(async (tx) => {
                await this.processingDatabase.updateEntityCache(tx, {
                  id,
                  state: {
                    ttl: CACHE_TTL,
                    ...result.state
                  }
                });
              });
            }
          } else {
            const maybeTtl = state == null ? void 0 : state.ttl;
            const ttl = Number.isInteger(maybeTtl) ? maybeTtl : 0;
            await this.processingDatabase.transaction(async (tx) => {
              await this.processingDatabase.updateEntityCache(tx, {
                id,
                state: ttl > 0 ? { ...state, ttl: ttl - 1 } : {}
              });
            });
          }
          for (const error of result.errors) {
            this.logger.warn(error.message, {
              entity: entityRef
            });
          }
          const errorsString = JSON.stringify(result.errors.map((e) => errors.serializeError(e)));
          let hashBuilder = this.createHash().update(errorsString);
          if (result.ok) {
            const { entityRefs: parents } = await this.processingDatabase.transaction((tx) => this.processingDatabase.listParents(tx, {
              entityRef
            }));
            hashBuilder = hashBuilder.update(stableStringify__default["default"]({ ...result.completedEntity })).update(stableStringify__default["default"]([...result.deferredEntities])).update(stableStringify__default["default"]([...result.relations])).update(stableStringify__default["default"]([...parents]));
          }
          const resultHash = hashBuilder.digest("hex");
          if (resultHash === previousResultHash) {
            track.markSuccessfulWithNoChanges();
            return;
          }
          if (!result.ok) {
            await this.processingDatabase.transaction(async (tx) => {
              await this.processingDatabase.updateProcessedEntityErrors(tx, {
                id,
                errors: errorsString,
                resultHash
              });
            });
            await this.stitcher.stitch(/* @__PURE__ */ new Set([catalogModel.stringifyEntityRef(unprocessedEntity)]));
            track.markSuccessfulWithErrors();
            return;
          }
          result.completedEntity.metadata.uid = id;
          let oldRelationSources;
          await this.processingDatabase.transaction(async (tx) => {
            const { previous } = await this.processingDatabase.updateProcessedEntity(tx, {
              id,
              processedEntity: result.completedEntity,
              resultHash,
              errors: errorsString,
              relations: result.relations,
              deferredEntities: result.deferredEntities,
              locationKey
            });
            oldRelationSources = new Set(previous.relations.map((r) => r.source_entity_ref));
          });
          const newRelationSources = new Set(result.relations.map((relation) => catalogModel.stringifyEntityRef(relation.source)));
          const setOfThingsToStitch = /* @__PURE__ */ new Set([
            catalogModel.stringifyEntityRef(result.completedEntity)
          ]);
          newRelationSources.forEach((r) => {
            if (!oldRelationSources.has(r)) {
              setOfThingsToStitch.add(r);
            }
          });
          oldRelationSources.forEach((r) => {
            if (!newRelationSources.has(r)) {
              setOfThingsToStitch.add(r);
            }
          });
          await this.stitcher.stitch(setOfThingsToStitch);
          track.markSuccessfulWithChanges(setOfThingsToStitch.size);
        } catch (error) {
          errors.assertError(error);
          track.markFailed(error);
        }
      }
    });
  }
  async stop() {
    if (this.stopFunc) {
      this.stopFunc();
      this.stopFunc = void 0;
    }
  }
}
function progressTracker() {
  const stitchedEntities = createCounterMetric({
    name: "catalog_stitched_entities_count",
    help: "Amount of entities stitched"
  });
  const processedEntities = createCounterMetric({
    name: "catalog_processed_entities_count",
    help: "Amount of entities processed",
    labelNames: ["result"]
  });
  const processingDuration = createSummaryMetric({
    name: "catalog_processing_duration_seconds",
    help: "Time spent executing the full processing flow",
    labelNames: ["result"]
  });
  const processorsDuration = createSummaryMetric({
    name: "catalog_processors_duration_seconds",
    help: "Time spent executing catalog processors",
    labelNames: ["result"]
  });
  const processingQueueDelay = createSummaryMetric({
    name: "catalog_processing_queue_delay_seconds",
    help: "The amount of delay between being scheduled for processing, and the start of actually being processed"
  });
  function processStart(item, logger) {
    logger.debug(`Processing ${item.entityRef}`);
    if (item.nextUpdateAt) {
      processingQueueDelay.observe(-item.nextUpdateAt.diffNow().as("seconds"));
    }
    const endOverallTimer = processingDuration.startTimer();
    const endProcessorsTimer = processorsDuration.startTimer();
    function markProcessorsCompleted(result) {
      endProcessorsTimer({ result: result.ok ? "ok" : "failed" });
    }
    function markSuccessfulWithNoChanges() {
      endOverallTimer({ result: "unchanged" });
      processedEntities.inc({ result: "unchanged" }, 1);
    }
    function markSuccessfulWithErrors() {
      endOverallTimer({ result: "errors" });
      processedEntities.inc({ result: "errors" }, 1);
    }
    function markSuccessfulWithChanges(stitchedCount) {
      endOverallTimer({ result: "changed" });
      stitchedEntities.inc(stitchedCount);
      processedEntities.inc({ result: "changed" }, 1);
    }
    function markFailed(error) {
      processedEntities.inc({ result: "failed" }, 1);
      logger.warn(`Processing of ${item.entityRef} failed`, error);
    }
    return {
      markProcessorsCompleted,
      markSuccessfulWithNoChanges,
      markSuccessfulWithErrors,
      markSuccessfulWithChanges,
      markFailed
    };
  }
  return { processStart };
}

class DefaultLocationService {
  constructor(store, orchestrator) {
    this.store = store;
    this.orchestrator = orchestrator;
  }
  async createLocation(input, dryRun) {
    if (dryRun) {
      return this.dryRunCreateLocation(input);
    }
    const location = await this.store.createLocation(input);
    return { location, entities: [] };
  }
  listLocations() {
    return this.store.listLocations();
  }
  getLocation(id) {
    return this.store.getLocation(id);
  }
  deleteLocation(id) {
    return this.store.deleteLocation(id);
  }
  async processEntities(unprocessedEntities) {
    const entities = [];
    while (unprocessedEntities.length) {
      const currentEntity = unprocessedEntities.pop();
      if (!currentEntity) {
        continue;
      }
      const processed = await this.orchestrator.process({
        entity: currentEntity.entity,
        state: {}
      });
      if (processed.ok) {
        if (entities.some((e) => catalogModel.stringifyEntityRef(e) === catalogModel.stringifyEntityRef(processed.completedEntity))) {
          throw new Error(`Duplicate nested entity: ${catalogModel.stringifyEntityRef(processed.completedEntity)}`);
        }
        unprocessedEntities.push(...processed.deferredEntities);
        entities.push(processed.completedEntity);
      } else {
        throw Error(processed.errors.map(String).join(", "));
      }
    }
    return entities;
  }
  async dryRunCreateLocation(spec) {
    const existsPromise = this.store.listLocations().then((locations) => locations.some((l) => l.type === spec.type && l.target === spec.target));
    const entity = {
      apiVersion: "backstage.io/v1alpha1",
      kind: "Location",
      metadata: {
        name: locationSpecToMetadataName({
          type: spec.type,
          target: spec.target
        }),
        namespace: "default",
        annotations: {
          [catalogModel.ANNOTATION_LOCATION]: `${spec.type}:${spec.target}`,
          [catalogModel.ANNOTATION_ORIGIN_LOCATION]: `${spec.type}:${spec.target}`
        }
      },
      spec: {
        type: spec.type,
        target: spec.target
      }
    };
    const unprocessedEntities = [
      { entity, locationKey: `${spec.type}:${spec.target}` }
    ];
    const entities = await this.processEntities(unprocessedEntities);
    return {
      exists: await existsPromise,
      location: { ...spec, id: `${spec.type}:${spec.target}` },
      entities
    };
  }
}

function parsePagination(input) {
  if (!input) {
    return {};
  }
  let { limit, offset } = input;
  if (input.after !== void 0) {
    let cursor;
    try {
      const json = Buffer.from(input.after, "base64").toString("utf8");
      cursor = JSON.parse(json);
    } catch {
      throw new errors.InputError("Malformed after cursor, could not be parsed");
    }
    if (cursor.limit !== void 0) {
      if (!Number.isInteger(cursor.limit)) {
        throw new errors.InputError("Malformed after cursor, limit was not an number");
      }
      limit = cursor.limit;
    }
    if (cursor.offset !== void 0) {
      if (!Number.isInteger(cursor.offset)) {
        throw new errors.InputError("Malformed after cursor, offset was not a number");
      }
      offset = cursor.offset;
    }
  }
  return { limit, offset };
}
function stringifyPagination(input) {
  const json = JSON.stringify({ limit: input.limit, offset: input.offset });
  const base64 = Buffer.from(json, "utf8").toString("base64");
  return base64;
}
function addCondition(queryBuilder, db, filter, negate = false) {
  const matchQuery = db("search").select("entity_id").where({ key: filter.key.toLowerCase() }).andWhere(function keyFilter() {
    if (filter.values) {
      if (filter.values.length === 1) {
        this.where({ value: filter.values[0].toLowerCase() });
      } else {
        this.andWhere("value", "in", filter.values.map((v) => v.toLowerCase()));
      }
    }
  });
  queryBuilder.andWhere("entity_id", negate ? "not in" : "in", matchQuery);
}
function isEntitiesSearchFilter(filter) {
  return filter.hasOwnProperty("key");
}
function isOrEntityFilter(filter) {
  return filter.hasOwnProperty("anyOf");
}
function isNegationEntityFilter(filter) {
  return filter.hasOwnProperty("not");
}
function parseFilter(filter, query, db, negate = false) {
  if (isEntitiesSearchFilter(filter)) {
    return query.andWhere(function filterFunction() {
      addCondition(this, db, filter, negate);
    });
  }
  if (isNegationEntityFilter(filter)) {
    return parseFilter(filter.not, query, db, !negate);
  }
  return query[negate ? "andWhereNot" : "andWhere"](function filterFunction() {
    var _a, _b;
    if (isOrEntityFilter(filter)) {
      for (const subFilter of (_a = filter.anyOf) != null ? _a : []) {
        this.orWhere((subQuery) => parseFilter(subFilter, subQuery, db));
      }
    } else {
      for (const subFilter of (_b = filter.allOf) != null ? _b : []) {
        this.andWhere((subQuery) => parseFilter(subFilter, subQuery, db));
      }
    }
  });
}
class DefaultEntitiesCatalog {
  constructor(database) {
    this.database = database;
  }
  async entities(request) {
    const db = this.database;
    let entitiesQuery = db("final_entities").select("final_entities.*");
    if (request == null ? void 0 : request.filter) {
      entitiesQuery = parseFilter(request.filter, entitiesQuery, db);
    }
    entitiesQuery = entitiesQuery.whereNotNull("final_entities.final_entity").orderBy("entity_id", "asc");
    const { limit, offset } = parsePagination(request == null ? void 0 : request.pagination);
    if (limit !== void 0) {
      entitiesQuery = entitiesQuery.limit(limit + 1);
    }
    if (offset !== void 0) {
      entitiesQuery = entitiesQuery.offset(offset);
    }
    let rows = await entitiesQuery;
    let pageInfo;
    if (limit === void 0 || rows.length <= limit) {
      pageInfo = { hasNextPage: false };
    } else {
      rows = rows.slice(0, -1);
      pageInfo = {
        hasNextPage: true,
        endCursor: stringifyPagination({
          limit,
          offset: (offset != null ? offset : 0) + limit
        })
      };
    }
    let entities = rows.map((e) => JSON.parse(e.final_entity));
    if (request == null ? void 0 : request.fields) {
      entities = entities.map((e) => request.fields(e));
    }
    for (const entity of entities) {
      if (entity.relations) {
        for (const relation of entity.relations) {
          if (!relation.targetRef && relation.target) {
            relation.targetRef = catalogModel.stringifyEntityRef(relation.target);
          } else if (!relation.target && relation.targetRef) {
            relation.target = catalogModel.parseEntityRef(relation.targetRef);
          }
        }
      }
    }
    return {
      entities,
      pageInfo
    };
  }
  async removeEntityByUid(uid) {
    await this.database("refresh_state").update({
      result_hash: "child-was-deleted"
    }).whereIn("entity_ref", function parents(builder) {
      return builder.from("refresh_state").innerJoin("refresh_state_references", {
        "refresh_state_references.target_entity_ref": "refresh_state.entity_ref"
      }).where("refresh_state.entity_id", "=", uid).select("refresh_state_references.source_entity_ref");
    });
    await this.database("refresh_state").where("entity_id", uid).delete();
  }
  async entityAncestry(rootRef) {
    const [rootRow] = await this.database("refresh_state").leftJoin("final_entities", {
      "refresh_state.entity_id": "final_entities.entity_id"
    }).where("refresh_state.entity_ref", "=", rootRef).select({
      entityJson: "final_entities.final_entity"
    });
    if (!rootRow) {
      throw new errors.NotFoundError(`No such entity ${rootRef}`);
    }
    const rootEntity = JSON.parse(rootRow.entityJson);
    const seenEntityRefs = /* @__PURE__ */ new Set();
    const todo = new Array();
    const items = new Array();
    for (let current = rootEntity; current; current = todo.pop()) {
      const currentRef = catalogModel.stringifyEntityRef(current);
      seenEntityRefs.add(currentRef);
      const parentRows = await this.database("refresh_state_references").innerJoin("refresh_state", {
        "refresh_state_references.source_entity_ref": "refresh_state.entity_ref"
      }).innerJoin("final_entities", {
        "refresh_state.entity_id": "final_entities.entity_id"
      }).where("refresh_state_references.target_entity_ref", "=", currentRef).select({
        parentEntityRef: "refresh_state.entity_ref",
        parentEntityJson: "final_entities.final_entity"
      });
      const parentRefs = [];
      for (const { parentEntityRef, parentEntityJson } of parentRows) {
        parentRefs.push(parentEntityRef);
        if (!seenEntityRefs.has(parentEntityRef)) {
          seenEntityRefs.add(parentEntityRef);
          todo.push(JSON.parse(parentEntityJson));
        }
      }
      items.push({
        entity: current,
        parentEntityRefs: parentRefs
      });
    }
    return {
      rootEntityRef: catalogModel.stringifyEntityRef(rootEntity),
      items
    };
  }
  async facets(request) {
    const { entities } = await this.entities({
      filter: request.filter,
      authorizationToken: request.authorizationToken
    });
    const facets = {};
    for (const facet of request.facets) {
      const values = entities.map((entity) => {
        var _a, _b;
        if (facet.startsWith("metadata.annotations.")) {
          return (_a = entity.metadata.annotations) == null ? void 0 : _a[facet.substring("metadata.annotations.".length)];
        } else if (facet.startsWith("metadata.labels.")) {
          return (_b = entity.metadata.labels) == null ? void 0 : _b[facet.substring("metadata.labels.".length)];
        }
        return lodash__default["default"].get(entity, facet);
      }).flatMap((field) => {
        if (typeof field === "string") {
          return [field];
        } else if (Array.isArray(field)) {
          return field.filter((i) => typeof i === "string");
        }
        return [];
      }).sort();
      const counts = lodash__default["default"].countBy(values, lodash__default["default"].identity);
      facets[facet] = Object.entries(counts).map(([value, count]) => ({
        value,
        count
      }));
    }
    return { facets };
  }
}

class ProcessorOutputCollector {
  constructor(logger, parentEntity) {
    this.logger = logger;
    this.parentEntity = parentEntity;
    this.errors = new Array();
    this.relations = new Array();
    this.deferredEntities = new Array();
    this.done = false;
  }
  get onEmit() {
    return (i) => this.receive(i);
  }
  results() {
    this.done = true;
    return {
      errors: this.errors,
      relations: this.relations,
      deferredEntities: this.deferredEntities
    };
  }
  receive(i) {
    if (this.done) {
      this.logger.warn(`Item of type "${i.type}" was emitted after processing had completed. Stack trace: ${new Error().stack}`);
      return;
    }
    if (i.type === "entity") {
      let entity;
      const location = catalogModel.stringifyLocationRef(i.location);
      try {
        entity = validateEntityEnvelope(i.entity);
      } catch (e) {
        errors.assertError(e);
        this.logger.debug(`Envelope validation failed at ${location}, ${e}`);
        this.errors.push(e);
        return;
      }
      const annotations = entity.metadata.annotations || {};
      if (typeof annotations === "object" && !Array.isArray(annotations)) {
        const originLocation = getEntityOriginLocationRef(this.parentEntity);
        entity = {
          ...entity,
          metadata: {
            ...entity.metadata,
            annotations: {
              ...annotations,
              [catalogModel.ANNOTATION_ORIGIN_LOCATION]: originLocation,
              [catalogModel.ANNOTATION_LOCATION]: location
            }
          }
        };
      }
      this.deferredEntities.push({ entity, locationKey: location });
    } else if (i.type === "location") {
      const entity = locationSpecToLocationEntity({
        location: i.location,
        parentEntity: this.parentEntity
      });
      const locationKey = getEntityLocationRef(entity);
      this.deferredEntities.push({ entity, locationKey });
    } else if (i.type === "relation") {
      this.relations.push(i.relation);
    } else if (i.type === "error") {
      this.errors.push(i.error);
    }
  }
}

class SingleProcessorSubCache {
  constructor(existingState) {
    this.existingState = existingState;
  }
  async get(key) {
    var _a;
    return (_a = this.existingState) == null ? void 0 : _a[key];
  }
  async set(key, value) {
    if (!this.newState) {
      this.newState = {};
    }
    this.newState[key] = value;
  }
  collect() {
    var _a;
    return (_a = this.newState) != null ? _a : this.existingState;
  }
}
class SingleProcessorCache {
  constructor(existingState) {
    this.existingState = existingState;
    this.subCaches = /* @__PURE__ */ new Map();
  }
  async get(key) {
    var _a;
    return (_a = this.existingState) == null ? void 0 : _a[key];
  }
  async set(key, value) {
    if (!this.newState) {
      this.newState = {};
    }
    this.newState[key] = value;
  }
  withKey(key) {
    var _a;
    const existingSubCache = this.subCaches.get(key);
    if (existingSubCache) {
      return existingSubCache;
    }
    const existing = (_a = this.existingState) == null ? void 0 : _a[key];
    const subCache = new SingleProcessorSubCache(isObject(existing) ? existing : void 0);
    this.subCaches.set(key, subCache);
    return subCache;
  }
  collect() {
    var _a;
    let obj = (_a = this.newState) != null ? _a : this.existingState;
    for (const [key, subCache] of this.subCaches) {
      const subCacheValue = subCache.collect();
      if (subCacheValue) {
        obj = { ...obj, [key]: subCacheValue };
      }
    }
    return obj;
  }
}
class ProcessorCacheManager {
  constructor(existingState) {
    this.existingState = existingState;
    this.caches = /* @__PURE__ */ new Map();
  }
  forProcessor(processor, key) {
    const name = processor.getProcessorName();
    const cache = this.caches.get(name);
    if (cache) {
      return key ? cache.withKey(key) : cache;
    }
    const existing = this.existingState[name];
    const newCache = new SingleProcessorCache(isObject(existing) ? existing : void 0);
    this.caches.set(name, newCache);
    return key ? newCache.withKey(key) : newCache;
  }
  collect() {
    const result = {};
    for (const [key, value] of this.caches.entries()) {
      result[key] = value.collect();
    }
    return result;
  }
}

class DefaultCatalogProcessingOrchestrator {
  constructor(options) {
    this.options = options;
  }
  async process(request) {
    return this.processSingleEntity(request.entity, request.state);
  }
  async processSingleEntity(unprocessedEntity, state) {
    const collector = new ProcessorOutputCollector(this.options.logger, unprocessedEntity);
    const cache = new ProcessorCacheManager(isObject(state) && isObject(state.cache) ? state.cache : {});
    try {
      let entity = unprocessedEntity;
      try {
        validateEntityEnvelope(entity);
      } catch (e) {
        throw new errors.InputError(`Entity envelope failed validation before processing`, e);
      }
      const context = {
        entityRef: catalogModel.stringifyEntityRef(entity),
        location: catalogModel.parseLocationRef(getEntityLocationRef(entity)),
        originLocation: catalogModel.parseLocationRef(getEntityOriginLocationRef(entity)),
        cache,
        collector
      };
      entity = await this.runPreProcessStep(entity, context);
      entity = await this.runPolicyStep(entity);
      await this.runValidateStep(entity, context);
      if (isLocationEntity(entity)) {
        await this.runSpecialLocationStep(entity, context);
      }
      entity = await this.runPostProcessStep(entity, context);
      const collectorResults = context.collector.results();
      for (const deferredEntity of collectorResults.deferredEntities) {
        if (!this.options.rulesEnforcer.isAllowed(deferredEntity.entity, context.originLocation)) {
          throw new errors.NotAllowedError(`Entity ${catalogModel.stringifyEntityRef(deferredEntity.entity)} at ${catalogModel.stringifyLocationRef(context.location)}, originated at ${catalogModel.stringifyLocationRef(context.originLocation)}, is not of an allowed kind for that location`);
        }
      }
      return {
        ...collectorResults,
        completedEntity: entity,
        state: { cache: cache.collect() },
        ok: collectorResults.errors.length === 0
      };
    } catch (error) {
      errors.assertError(error);
      return {
        ok: false,
        errors: collector.results().errors.concat(error)
      };
    }
  }
  async runPreProcessStep(entity, context) {
    let res = entity;
    for (const processor of this.options.processors) {
      if (processor.preProcessEntity) {
        try {
          res = await processor.preProcessEntity(res, context.location, context.collector.onEmit, context.originLocation, context.cache.forProcessor(processor));
        } catch (e) {
          throw new errors.InputError(`Processor ${processor.constructor.name} threw an error while preprocessing`, e);
        }
      }
    }
    return res;
  }
  async runPolicyStep(entity) {
    let policyEnforcedEntity;
    try {
      policyEnforcedEntity = await this.options.policy.enforce(entity);
    } catch (e) {
      throw new errors.InputError("Policy check failed", e);
    }
    if (!policyEnforcedEntity) {
      throw new Error("Policy unexpectedly returned no data");
    }
    return policyEnforcedEntity;
  }
  async runValidateStep(entity, context) {
    if (catalogModel.stringifyEntityRef(entity) !== context.entityRef) {
      throw new errors.ConflictError("Fatal: The entity kind, namespace, or name changed during processing");
    }
    try {
      validateEntity(entity);
    } catch (e) {
      throw new errors.ConflictError(`Entity envelope for ${context.entityRef} failed validation after preprocessing`, e);
    }
    let foundKind = false;
    for (const processor of this.options.processors) {
      if (processor.validateEntityKind) {
        try {
          foundKind = await processor.validateEntityKind(entity);
          if (foundKind) {
            break;
          }
        } catch (e) {
          throw new errors.InputError(`Processor ${processor.constructor.name} threw an error while validating the entity ${context.entityRef}`, e);
        }
      }
    }
    if (!foundKind) {
      throw new errors.InputError(`No processor recognized the entity ${context.entityRef} as valid, possibly caused by a foreign kind or apiVersion`);
    }
  }
  async runSpecialLocationStep(entity, context) {
    const { type = context.location.type, presence = "required" } = entity.spec;
    const targets = new Array();
    if (entity.spec.target) {
      targets.push(entity.spec.target);
    }
    if (entity.spec.targets) {
      targets.push(...entity.spec.targets);
    }
    for (const maybeRelativeTarget of targets) {
      if (type === "file" && maybeRelativeTarget.endsWith(path__default["default"].sep)) {
        context.collector.onEmit(processingResult.inputError(context.location, `LocationEntityProcessor cannot handle ${type} type location with target ${context.location.target} that ends with a path separator`));
        continue;
      }
      const target = toAbsoluteUrl(this.options.integrations, context.location, type, maybeRelativeTarget);
      let didRead = false;
      for (const processor of this.options.processors) {
        if (processor.readLocation) {
          try {
            const read = await processor.readLocation({
              type,
              target,
              presence
            }, presence === "optional", context.collector.onEmit, this.options.parser, context.cache.forProcessor(processor, target));
            if (read) {
              didRead = true;
              break;
            }
          } catch (e) {
            throw new errors.InputError(`Processor ${processor.constructor.name} threw an error while reading ${type}:${target}`, e);
          }
        }
      }
      if (!didRead) {
        throw new errors.InputError(`No processor was able to handle reading of ${type}:${target}`);
      }
    }
  }
  async runPostProcessStep(entity, context) {
    let res = entity;
    for (const processor of this.options.processors) {
      if (processor.postProcessEntity) {
        try {
          res = await processor.postProcessEntity(res, context.location, context.collector.onEmit, context.cache.forProcessor(processor));
        } catch (e) {
          throw new errors.InputError(`Processor ${processor.constructor.name} threw an error while postprocessing`, e);
        }
      }
    }
    return res;
  }
}

const SPECIAL_KEYS = [
  "attachments",
  "relations",
  "status",
  "metadata.name",
  "metadata.namespace",
  "metadata.uid",
  "metadata.etag"
];
const MAX_KEY_LENGTH = 200;
const MAX_VALUE_LENGTH = 200;
function traverse(root) {
  const output = [];
  function visit(path, current) {
    if (SPECIAL_KEYS.includes(path)) {
      return;
    }
    if (current === void 0 || current === null || ["string", "number", "boolean"].includes(typeof current)) {
      output.push({ key: path, value: current });
      return;
    }
    if (typeof current !== "object") {
      return;
    }
    if (Array.isArray(current)) {
      for (const item of current) {
        visit(path, item);
        if (typeof item === "string") {
          output.push({ key: `${path}.${item}`, value: true });
        }
      }
      return;
    }
    for (const [key, value] of Object.entries(current)) {
      visit(path ? `${path}.${key}` : key, value);
    }
  }
  visit("", root);
  return output;
}
function mapToRows(input, entityId) {
  const result = [];
  for (const { key: rawKey, value: rawValue } of input) {
    const key = rawKey.toLocaleLowerCase("en-US");
    if (rawValue === void 0 || rawValue === null) {
      result.push({ entity_id: entityId, key, value: null });
    } else {
      const value = String(rawValue).toLocaleLowerCase("en-US");
      if (key.length <= MAX_KEY_LENGTH && value.length <= MAX_VALUE_LENGTH) {
        result.push({ entity_id: entityId, key, value });
      }
    }
  }
  return result;
}
function buildEntitySearch(entityId, entity) {
  var _a;
  const raw = traverse(entity);
  raw.push({ key: "metadata.name", value: entity.metadata.name });
  raw.push({ key: "metadata.namespace", value: entity.metadata.namespace });
  raw.push({ key: "metadata.uid", value: entity.metadata.uid });
  if (!entity.metadata.namespace) {
    raw.push({ key: "metadata.namespace", value: catalogModel.DEFAULT_NAMESPACE });
  }
  for (const relation of (_a = entity.relations) != null ? _a : []) {
    raw.push({
      key: `relations.${relation.type}`,
      value: relation.targetRef
    });
  }
  const keys = new Set(raw.map((r) => r.key));
  const lowerKeys = new Set(raw.map((r) => r.key.toLocaleLowerCase("en-US")));
  if (keys.size !== lowerKeys.size) {
    const difference = [];
    for (const key of keys) {
      const lower = key.toLocaleLowerCase("en-US");
      if (!lowerKeys.delete(lower)) {
        difference.push(lower);
      }
    }
    const badKeys = `'${difference.join("', '")}'`;
    throw new errors.InputError(`Entity has duplicate keys that vary only in casing, ${badKeys}`);
  }
  return mapToRows(raw, entityId);
}

const BATCH_SIZE = 50;
function generateStableHash(entity) {
  return crypto.createHash("sha1").update(stableStringify__default["default"]({ ...entity })).digest("hex");
}

class Stitcher {
  constructor(database, logger) {
    this.database = database;
    this.logger = logger;
  }
  async stitch(entityRefs) {
    for (const entityRef of entityRefs) {
      try {
        await this.stitchOne(entityRef);
      } catch (error) {
        this.logger.error(`Failed to stitch ${entityRef}, ${errors.stringifyError(error)}`);
      }
    }
  }
  async stitchOne(entityRef) {
    var _a, _b;
    const entityResult = await this.database("refresh_state").where({ entity_ref: entityRef }).limit(1).select("entity_id");
    if (!entityResult.length) {
      return;
    }
    const ticket = uuid.v4();
    await this.database("final_entities").insert({
      entity_id: entityResult[0].entity_id,
      hash: "",
      stitch_ticket: ticket
    }).onConflict("entity_id").merge(["stitch_ticket"]);
    const result = await this.database.with("incoming_references", function incomingReferences(builder) {
      return builder.from("refresh_state_references").where({ target_entity_ref: entityRef }).count({ count: "*" });
    }).select({
      entityId: "refresh_state.entity_id",
      processedEntity: "refresh_state.processed_entity",
      errors: "refresh_state.errors",
      incomingReferenceCount: "incoming_references.count",
      previousHash: "final_entities.hash",
      relationType: "relations.type",
      relationTarget: "relations.target_entity_ref"
    }).from("refresh_state").where({ "refresh_state.entity_ref": entityRef }).crossJoin(this.database.raw("incoming_references")).leftOuterJoin("final_entities", {
      "final_entities.entity_id": "refresh_state.entity_id"
    }).leftOuterJoin("relations", {
      "relations.source_entity_ref": "refresh_state.entity_ref"
    }).orderBy("relationType", "asc").orderBy("relationTarget", "asc");
    if (!result.length) {
      this.logger.error(`Unable to stitch ${entityRef}, item does not exist in refresh state table`);
      return;
    }
    const {
      entityId,
      processedEntity,
      errors,
      incomingReferenceCount,
      previousHash
    } = result[0];
    if (!processedEntity) {
      this.logger.debug(`Unable to stitch ${entityRef}, the entity has not yet been processed`);
      return;
    }
    const entity = JSON.parse(processedEntity);
    const isOrphan = Number(incomingReferenceCount) === 0;
    let statusItems = [];
    if (isOrphan) {
      this.logger.debug(`${entityRef} is an orphan`);
      entity.metadata.annotations = {
        ...entity.metadata.annotations,
        ["backstage.io/orphan"]: "true"
      };
    }
    if (errors) {
      const parsedErrors = JSON.parse(errors);
      if (Array.isArray(parsedErrors) && parsedErrors.length) {
        statusItems = parsedErrors.map((e) => ({
          type: catalogClient.ENTITY_STATUS_CATALOG_PROCESSING_TYPE,
          level: "error",
          message: `${e.name}: ${e.message}`,
          error: e
        }));
      }
    }
    const uniqueRelationRows = lodash.uniqBy(result, (r) => `${r.relationType}:${r.relationTarget}`);
    entity.relations = uniqueRelationRows.filter((row) => row.relationType).map((row) => ({
      type: row.relationType,
      targetRef: row.relationTarget
    }));
    if (statusItems.length) {
      entity.status = {
        ...entity.status,
        items: [...(_b = (_a = entity.status) == null ? void 0 : _a.items) != null ? _b : [], ...statusItems]
      };
    }
    const hash = generateStableHash(entity);
    if (hash === previousHash) {
      this.logger.debug(`Skipped stitching of ${entityRef}, no changes`);
      return;
    }
    entity.metadata.uid = entityId;
    if (!entity.metadata.etag) {
      entity.metadata.etag = hash;
    }
    const searchEntries = buildEntitySearch(entityId, entity);
    const amountOfRowsChanged = await this.database("final_entities").update({
      final_entity: JSON.stringify(entity),
      hash
    }).where("entity_id", entityId).where("stitch_ticket", ticket).onConflict("entity_id").merge(["final_entity", "hash"]);
    if (amountOfRowsChanged === 0) {
      this.logger.debug(`Entity ${entityRef} is already processed, skipping write.`);
      return;
    }
    await this.database("search").where({ entity_id: entityId }).delete();
    await this.database.batchInsert("search", searchEntries, BATCH_SIZE);
  }
}

function basicEntityFilter(items) {
  const filtersByKey = {};
  for (const [key, value] of Object.entries(items)) {
    const values = [value].flat();
    const f = key in filtersByKey ? filtersByKey[key] : filtersByKey[key] = { key, values: [] };
    f.values.push(...values);
  }
  return { anyOf: [{ allOf: Object.values(filtersByKey) }] };
}

function parseIntegerParam(param, ctx) {
  if (param === void 0) {
    return void 0;
  }
  if (typeof param !== "string") {
    throw new errors.InputError(`Invalid ${ctx}, not an integer on string form`);
  }
  const parsed = parseInt(param, 10);
  if (!Number.isInteger(parsed) || String(parsed) !== param) {
    throw new errors.InputError(`Invalid ${ctx}, not an integer`);
  }
  return parsed;
}
function parseStringParam(param, ctx) {
  if (param === void 0) {
    return void 0;
  }
  if (typeof param !== "string") {
    throw new errors.InputError(`Invalid ${ctx}, not a string`);
  }
  return param;
}
function parseStringsParam(param, ctx) {
  if (param === void 0) {
    return void 0;
  }
  const array = [param].flat();
  if (array.some((p) => typeof p !== "string")) {
    throw new errors.InputError(`Invalid ${ctx}, not a string`);
  }
  return array;
}

function parseEntityFilterParams(params) {
  const filterStrings = parseStringsParam(params.filter, "filter");
  if (!filterStrings) {
    return void 0;
  }
  const filters = filterStrings.map(parseEntityFilterString).filter(Boolean);
  if (!filters.length) {
    return void 0;
  }
  return { anyOf: filters.map((f) => ({ allOf: f })) };
}
function parseEntityFilterString(filterString) {
  const statements = filterString.split(",").map((s) => s.trim()).filter(Boolean);
  if (!statements.length) {
    return void 0;
  }
  const filtersByKey = {};
  for (const statement of statements) {
    const equalsIndex = statement.indexOf("=");
    const key = equalsIndex === -1 ? statement : statement.substr(0, equalsIndex).trim();
    const value = equalsIndex === -1 ? void 0 : statement.substr(equalsIndex + 1).trim();
    if (!key) {
      throw new errors.InputError(`Invalid filter, '${statement}' is not a valid statement (expected a string on the form a=b or a= or a)`);
    }
    const f = key in filtersByKey ? filtersByKey[key] : filtersByKey[key] = { key };
    if (value !== void 0) {
      f.values = f.values || [];
      f.values.push(value);
    }
  }
  return Object.values(filtersByKey);
}

function parseEntityPaginationParams(params) {
  const offset = parseIntegerParam(params.offset, "offset");
  const limit = parseIntegerParam(params.limit, "limit");
  const after = parseStringParam(params.after, "after");
  if (offset === void 0 && limit === void 0 && after === void 0) {
    return void 0;
  }
  if (offset !== void 0 && offset < 0) {
    throw new errors.InputError(`Invalid offset, must be zero or greater`);
  }
  if (limit !== void 0 && limit <= 0) {
    throw new errors.InputError(`Invalid limit, must be greater than zero`);
  }
  if (after !== void 0 && !after) {
    throw new errors.InputError(`Invalid after, must not be empty`);
  }
  return {
    ...offset !== void 0 ? { offset } : {},
    ...limit !== void 0 ? { limit } : {},
    ...after !== void 0 ? { after } : {}
  };
}

function getPathArrayAndValue(input, field) {
  return field.split(".").reduce(([pathArray, inputSubset], pathPart, index, fieldParts) => {
    if (lodash__default["default"].hasIn(inputSubset, pathPart)) {
      return [pathArray.concat(pathPart), inputSubset[pathPart]];
    } else if (fieldParts[index + 1] !== void 0) {
      fieldParts[index + 1] = `${pathPart}.${fieldParts[index + 1]}`;
      return [pathArray, inputSubset];
    }
    return [pathArray, void 0];
  }, [[], input]);
}
function parseEntityTransformParams(params) {
  const fieldsStrings = parseStringsParam(params.fields, "fields");
  if (!fieldsStrings) {
    return void 0;
  }
  const fields = fieldsStrings.map((s) => s.split(",")).flat().map((s) => s.trim()).filter(Boolean);
  if (!fields.length) {
    return void 0;
  }
  if (fields.some((f) => f.includes("["))) {
    throw new errors.InputError("invalid fields, array type fields are not supported");
  }
  return (input) => {
    const output = {};
    for (const field of fields) {
      const [pathArray, value] = getPathArrayAndValue(input, field);
      if (value !== void 0) {
        lodash__default["default"].set(output, pathArray, value);
      }
    }
    return output;
  };
}

async function requireRequestBody(req) {
  const contentType = req.header("content-type");
  if (!contentType) {
    throw new errors.InputError("Content-Type missing");
  } else if (!contentType.match(/^application\/json($|;)/)) {
    throw new errors.InputError("Illegal Content-Type");
  }
  const body = req.body;
  if (!body) {
    throw new errors.InputError("Missing request body");
  } else if (!lodash__default["default"].isPlainObject(body)) {
    throw new errors.InputError("Expected body to be a JSON object");
  } else if (Object.keys(body).length === 0) {
    throw new errors.InputError("Empty request body");
  }
  return body;
}
const locationInput = zod.z.object({
  type: zod.z.string(),
  target: zod.z.string(),
  presence: zod.z.literal("required").or(zod.z.literal("optional")).optional()
}).strict();
async function validateRequestBody(req, schema) {
  const body = await requireRequestBody(req);
  try {
    return await schema.parse(body);
  } catch (e) {
    throw new errors.InputError(`Malformed request: ${e}`);
  }
}
function disallowReadonlyMode(readonly) {
  if (readonly) {
    throw new errors.NotAllowedError("This operation not allowed in readonly mode");
  }
}

function parseEntityFacetParams(params) {
  const facetStrings = parseStringsParam(params.facet, "facet");
  if (facetStrings) {
    const filtered = facetStrings.filter(Boolean);
    if (filtered.length) {
      return filtered;
    }
  }
  throw new errors.InputError("Missing facet parameter");
}

async function createRouter(options) {
  const {
    entitiesCatalog,
    locationAnalyzer,
    locationService,
    orchestrator,
    refreshService,
    config,
    logger,
    permissionIntegrationRouter
  } = options;
  const router = Router__default["default"]();
  router.use(express__default["default"].json());
  const readonlyEnabled = config.getOptionalBoolean("catalog.readonly") || false;
  if (readonlyEnabled) {
    logger.info("Catalog is running in readonly mode");
  }
  if (refreshService) {
    router.post("/refresh", async (req, res) => {
      const refreshOptions = req.body;
      refreshOptions.authorizationToken = getBearerToken(req.header("authorization"));
      await refreshService.refresh(refreshOptions);
      res.status(200).send();
    });
  }
  if (permissionIntegrationRouter) {
    router.use(permissionIntegrationRouter);
  }
  if (entitiesCatalog) {
    router.get("/entities", async (req, res) => {
      const { entities, pageInfo } = await entitiesCatalog.entities({
        filter: parseEntityFilterParams(req.query),
        fields: parseEntityTransformParams(req.query),
        pagination: parseEntityPaginationParams(req.query),
        authorizationToken: getBearerToken(req.header("authorization"))
      });
      if (pageInfo.hasNextPage) {
        const url = new URL(`http://ignored${req.url}`);
        url.searchParams.delete("offset");
        url.searchParams.set("after", pageInfo.endCursor);
        res.setHeader("link", `<${url.pathname}${url.search}>; rel="next"`);
      }
      res.json(entities);
    }).get("/entities/by-uid/:uid", async (req, res) => {
      const { uid } = req.params;
      const { entities } = await entitiesCatalog.entities({
        filter: basicEntityFilter({ "metadata.uid": uid }),
        authorizationToken: getBearerToken(req.header("authorization"))
      });
      if (!entities.length) {
        throw new errors.NotFoundError(`No entity with uid ${uid}`);
      }
      res.status(200).json(entities[0]);
    }).delete("/entities/by-uid/:uid", async (req, res) => {
      const { uid } = req.params;
      await entitiesCatalog.removeEntityByUid(uid, {
        authorizationToken: getBearerToken(req.header("authorization"))
      });
      res.status(204).end();
    }).get("/entities/by-name/:kind/:namespace/:name", async (req, res) => {
      const { kind, namespace, name } = req.params;
      const { entities } = await entitiesCatalog.entities({
        filter: basicEntityFilter({
          kind,
          "metadata.namespace": namespace,
          "metadata.name": name
        }),
        authorizationToken: getBearerToken(req.header("authorization"))
      });
      if (!entities.length) {
        throw new errors.NotFoundError(`No entity named '${name}' found, with kind '${kind}' in namespace '${namespace}'`);
      }
      res.status(200).json(entities[0]);
    }).get("/entities/by-name/:kind/:namespace/:name/ancestry", async (req, res) => {
      const { kind, namespace, name } = req.params;
      const entityRef = catalogModel.stringifyEntityRef({ kind, namespace, name });
      const response = await entitiesCatalog.entityAncestry(entityRef, {
        authorizationToken: getBearerToken(req.header("authorization"))
      });
      res.status(200).json(response);
    }).get("/entity-facets", async (req, res) => {
      const response = await entitiesCatalog.facets({
        filter: parseEntityFilterParams(req.query),
        facets: parseEntityFacetParams(req.query),
        authorizationToken: getBearerToken(req.header("authorization"))
      });
      res.status(200).json(response);
    });
  }
  if (locationService) {
    router.post("/locations", async (req, res) => {
      const location = await validateRequestBody(req, locationInput);
      const dryRun = yn__default["default"](req.query.dryRun, { default: false });
      if (!dryRun) {
        disallowReadonlyMode(readonlyEnabled);
      }
      const output = await locationService.createLocation(location, dryRun, {
        authorizationToken: getBearerToken(req.header("authorization"))
      });
      res.status(201).json(output);
    }).get("/locations", async (req, res) => {
      const locations = await locationService.listLocations({
        authorizationToken: getBearerToken(req.header("authorization"))
      });
      res.status(200).json(locations.map((l) => ({ data: l })));
    }).get("/locations/:id", async (req, res) => {
      const { id } = req.params;
      const output = await locationService.getLocation(id, {
        authorizationToken: getBearerToken(req.header("authorization"))
      });
      res.status(200).json(output);
    }).delete("/locations/:id", async (req, res) => {
      disallowReadonlyMode(readonlyEnabled);
      const { id } = req.params;
      await locationService.deleteLocation(id, {
        authorizationToken: getBearerToken(req.header("authorization"))
      });
      res.status(204).end();
    });
  }
  if (locationAnalyzer) {
    router.post("/analyze-location", async (req, res) => {
      const body = await validateRequestBody(req, zod.z.object({ location: locationInput }));
      const schema = zod.z.object({ location: locationInput });
      const output = await locationAnalyzer.analyzeLocation(schema.parse(body));
      res.status(200).json(output);
    });
  }
  if (orchestrator) {
    router.post("/validate-entity", async (req, res) => {
      const bodySchema = zod.z.object({
        entity: zod.z.unknown(),
        location: zod.z.string()
      });
      let body;
      let entity;
      let location;
      try {
        body = await validateRequestBody(req, bodySchema);
        entity = validateEntityEnvelope(body.entity);
        location = catalogModel.parseLocationRef(body.location);
        if (location.type !== "url")
          throw new TypeError(`Invalid location ref ${body.location}, only 'url:<target>' is supported, e.g. url:https://host/path`);
      } catch (err) {
        return res.status(400).json({
          errors: [errors.serializeError(err)]
        });
      }
      const processingResult = await orchestrator.process({
        entity: {
          ...entity,
          metadata: {
            ...entity.metadata,
            annotations: {
              [catalogModel.ANNOTATION_LOCATION]: body.location,
              [catalogModel.ANNOTATION_ORIGIN_LOCATION]: body.location,
              ...entity.metadata.annotations
            }
          }
        }
      });
      if (!processingResult.ok)
        res.status(400).json({
          errors: processingResult.errors.map((e) => errors.serializeError(e))
        });
      return res.status(200).end();
    });
  }
  router.use(backendCommon.errorHandler());
  return router;
}
function getBearerToken(authorizationHeader) {
  if (typeof authorizationHeader !== "string") {
    return void 0;
  }
  const matches = authorizationHeader.match(/Bearer\s+(\S+)/i);
  return matches == null ? void 0 : matches[1];
}

class DefaultRefreshService {
  constructor(options) {
    this.database = options.database;
  }
  async refresh(options) {
    await this.database.transaction(async (tx) => {
      const { entityRefs } = await this.database.listAncestors(tx, {
        entityRef: options.entityRef
      });
      const locationAncestor = entityRefs.find((ref) => ref.startsWith("location:"));
      if (locationAncestor) {
        await this.database.refresh(tx, {
          entityRef: locationAncestor
        });
      }
      await this.database.refresh(tx, {
        entityRef: options.entityRef
      });
    });
  }
}

class AuthorizedRefreshService {
  constructor(service, permissionApi) {
    this.service = service;
    this.permissionApi = permissionApi;
  }
  async refresh(options) {
    const authorizeDecision = (await this.permissionApi.authorize([
      {
        permission: pluginCatalogCommon.catalogEntityRefreshPermission,
        resourceRef: options.entityRef
      }
    ], { token: options.authorizationToken }))[0];
    if (authorizeDecision.result !== pluginPermissionCommon.AuthorizeResult.ALLOW) {
      throw new errors.NotAllowedError();
    }
    await this.service.refresh(options);
  }
}

const _DefaultCatalogRulesEnforcer = class {
  constructor(rules) {
    this.rules = rules;
  }
  static fromConfig(config) {
    const rules = new Array();
    if (config.has("catalog.rules")) {
      const globalRules = config.getConfigArray("catalog.rules").map((sub) => ({
        allow: sub.getStringArray("allow").map((kind) => ({ kind }))
      }));
      rules.push(...globalRules);
    } else {
      rules.push(..._DefaultCatalogRulesEnforcer.defaultRules);
    }
    if (config.has("catalog.locations")) {
      const locationRules = config.getConfigArray("catalog.locations").flatMap((locConf) => {
        if (!locConf.has("rules")) {
          return [];
        }
        const type = locConf.getString("type");
        const target = resolveTarget(type, locConf.getString("target"));
        return locConf.getConfigArray("rules").map((ruleConf) => ({
          allow: ruleConf.getStringArray("allow").map((kind) => ({ kind })),
          locations: [{ type, target }]
        }));
      });
      rules.push(...locationRules);
    }
    return new _DefaultCatalogRulesEnforcer(rules);
  }
  isAllowed(entity, location) {
    for (const rule of this.rules) {
      if (!this.matchLocation(location, rule.locations)) {
        continue;
      }
      if (this.matchEntity(entity, rule.allow)) {
        return true;
      }
    }
    return false;
  }
  matchLocation(location, matchers) {
    if (!matchers) {
      return true;
    }
    for (const matcher of matchers) {
      if (matcher.type !== (location == null ? void 0 : location.type)) {
        continue;
      }
      if (matcher.target && matcher.target !== (location == null ? void 0 : location.target)) {
        continue;
      }
      return true;
    }
    return false;
  }
  matchEntity(entity, matchers) {
    var _a;
    if (!matchers) {
      return true;
    }
    for (const matcher of matchers) {
      if (((_a = entity == null ? void 0 : entity.kind) == null ? void 0 : _a.toLowerCase()) !== matcher.kind.toLowerCase()) {
        continue;
      }
      return true;
    }
    return false;
  }
};
let DefaultCatalogRulesEnforcer = _DefaultCatalogRulesEnforcer;
DefaultCatalogRulesEnforcer.defaultRules = [
  {
    allow: ["Component", "API", "Location"].map((kind) => ({ kind }))
  }
];
function resolveTarget(type, target) {
  if (type !== "file") {
    return target;
  }
  return path__default["default"].resolve(target);
}

class Connection {
  constructor(config) {
    this.config = config;
    this.validateEntityEnvelope = catalogModel.entityEnvelopeSchemaValidator();
  }
  async applyMutation(mutation) {
    const db = this.config.processingDatabase;
    if (mutation.type === "full") {
      this.check(mutation.entities.map((e) => e.entity));
      await db.transaction(async (tx) => {
        await db.replaceUnprocessedEntities(tx, {
          sourceKey: this.config.id,
          type: "full",
          items: mutation.entities
        });
      });
    } else if (mutation.type === "delta") {
      this.check(mutation.added.map((e) => e.entity));
      this.check(mutation.removed.map((e) => e.entity));
      await db.transaction(async (tx) => {
        await db.replaceUnprocessedEntities(tx, {
          sourceKey: this.config.id,
          type: "delta",
          added: mutation.added,
          removed: mutation.removed
        });
      });
    }
  }
  check(entities) {
    for (const entity of entities) {
      try {
        this.validateEntityEnvelope(entity);
      } catch (e) {
        throw new TypeError(`Malformed entity envelope, ${e}`);
      }
    }
  }
}
async function connectEntityProviders(db, providers) {
  await Promise.all(providers.map(async (provider) => {
    const connection = new Connection({
      id: provider.getProviderName(),
      processingDatabase: db
    });
    return provider.connect(connection);
  }));
}

class AuthorizedEntitiesCatalog {
  constructor(entitiesCatalog, permissionApi, transformConditions) {
    this.entitiesCatalog = entitiesCatalog;
    this.permissionApi = permissionApi;
    this.transformConditions = transformConditions;
  }
  async entities(request) {
    const authorizeDecision = (await this.permissionApi.authorizeConditional([{ permission: pluginCatalogCommon.catalogEntityReadPermission }], { token: request == null ? void 0 : request.authorizationToken }))[0];
    if (authorizeDecision.result === pluginPermissionCommon.AuthorizeResult.DENY) {
      return {
        entities: [],
        pageInfo: { hasNextPage: false }
      };
    }
    if (authorizeDecision.result === pluginPermissionCommon.AuthorizeResult.CONDITIONAL) {
      const permissionFilter = this.transformConditions(authorizeDecision.conditions);
      return this.entitiesCatalog.entities({
        ...request,
        filter: (request == null ? void 0 : request.filter) ? { allOf: [permissionFilter, request.filter] } : permissionFilter
      });
    }
    return this.entitiesCatalog.entities(request);
  }
  async removeEntityByUid(uid, options) {
    const authorizeResponse = (await this.permissionApi.authorizeConditional([{ permission: pluginCatalogCommon.catalogEntityDeletePermission }], { token: options == null ? void 0 : options.authorizationToken }))[0];
    if (authorizeResponse.result === pluginPermissionCommon.AuthorizeResult.DENY) {
      throw new errors.NotAllowedError();
    }
    if (authorizeResponse.result === pluginPermissionCommon.AuthorizeResult.CONDITIONAL) {
      const permissionFilter = this.transformConditions(authorizeResponse.conditions);
      const { entities } = await this.entitiesCatalog.entities({
        filter: {
          allOf: [permissionFilter, basicEntityFilter({ "metadata.uid": uid })]
        }
      });
      if (entities.length === 0) {
        throw new errors.NotAllowedError();
      }
    }
    return this.entitiesCatalog.removeEntityByUid(uid);
  }
  async entityAncestry(entityRef, options) {
    const rootEntityAuthorizeResponse = (await this.permissionApi.authorize([{ permission: pluginCatalogCommon.catalogEntityReadPermission, resourceRef: entityRef }], { token: options == null ? void 0 : options.authorizationToken }))[0];
    if (rootEntityAuthorizeResponse.result === pluginPermissionCommon.AuthorizeResult.DENY) {
      throw new errors.NotAllowedError();
    }
    const ancestryResult = await this.entitiesCatalog.entityAncestry(entityRef);
    const authorizeResponse = await this.permissionApi.authorize(ancestryResult.items.map((item) => ({
      permission: pluginCatalogCommon.catalogEntityReadPermission,
      resourceRef: catalogModel.stringifyEntityRef(item.entity)
    })), { token: options == null ? void 0 : options.authorizationToken });
    const unauthorizedAncestryItems = ancestryResult.items.filter((_, index) => authorizeResponse[index].result === pluginPermissionCommon.AuthorizeResult.DENY);
    if (unauthorizedAncestryItems.length === 0) {
      return ancestryResult;
    }
    const rootUnauthorizedEntityRefs = unauthorizedAncestryItems.map((ancestryItem) => catalogModel.stringifyEntityRef(ancestryItem.entity));
    const allUnauthorizedEntityRefs = new Set(rootUnauthorizedEntityRefs.flatMap((rootEntityRef) => this.findParents(rootEntityRef, ancestryResult.items, new Set(rootUnauthorizedEntityRefs))));
    return {
      rootEntityRef: ancestryResult.rootEntityRef,
      items: ancestryResult.items.filter((ancestryItem) => !allUnauthorizedEntityRefs.has(catalogModel.stringifyEntityRef(ancestryItem.entity)))
    };
  }
  async facets(request) {
    const authorizeDecision = (await this.permissionApi.authorizeConditional([{ permission: pluginCatalogCommon.catalogEntityReadPermission }], { token: request == null ? void 0 : request.authorizationToken }))[0];
    if (authorizeDecision.result === pluginPermissionCommon.AuthorizeResult.DENY) {
      return {
        facets: Object.fromEntries(request.facets.map((f) => [f, []]))
      };
    }
    if (authorizeDecision.result === pluginPermissionCommon.AuthorizeResult.CONDITIONAL) {
      const permissionFilter = this.transformConditions(authorizeDecision.conditions);
      return this.entitiesCatalog.facets({
        ...request,
        filter: (request == null ? void 0 : request.filter) ? { allOf: [permissionFilter, request.filter] } : permissionFilter
      });
    }
    return this.entitiesCatalog.facets(request);
  }
  findParents(entityRef, allAncestryItems, seenEntityRefs) {
    const entity = allAncestryItems.find((ancestryItem) => catalogModel.stringifyEntityRef(ancestryItem.entity) === entityRef);
    if (!entity)
      return [];
    const newSeenEntityRefs = new Set(seenEntityRefs);
    entity.parentEntityRefs.forEach((parentRef) => newSeenEntityRefs.add(parentRef));
    return [
      entityRef,
      ...entity.parentEntityRefs.flatMap((parentRef) => seenEntityRefs.has(parentRef) ? [] : this.findParents(parentRef, allAncestryItems, newSeenEntityRefs))
    ];
  }
}

class AuthorizedLocationService {
  constructor(locationService, permissionApi) {
    this.locationService = locationService;
    this.permissionApi = permissionApi;
  }
  async createLocation(spec, dryRun, options) {
    const authorizationResponse = (await this.permissionApi.authorize([{ permission: pluginCatalogCommon.catalogLocationCreatePermission }], { token: options == null ? void 0 : options.authorizationToken }))[0];
    if (authorizationResponse.result === pluginPermissionCommon.AuthorizeResult.DENY) {
      throw new errors.NotAllowedError();
    }
    return this.locationService.createLocation(spec, dryRun);
  }
  async listLocations(options) {
    const authorizationResponse = (await this.permissionApi.authorize([{ permission: pluginCatalogCommon.catalogLocationReadPermission }], { token: options == null ? void 0 : options.authorizationToken }))[0];
    if (authorizationResponse.result === pluginPermissionCommon.AuthorizeResult.DENY) {
      return [];
    }
    return this.locationService.listLocations();
  }
  async getLocation(id, options) {
    const authorizationResponse = (await this.permissionApi.authorize([{ permission: pluginCatalogCommon.catalogLocationReadPermission }], { token: options == null ? void 0 : options.authorizationToken }))[0];
    if (authorizationResponse.result === pluginPermissionCommon.AuthorizeResult.DENY) {
      throw new errors.NotFoundError(`Found no location with ID ${id}`);
    }
    return this.locationService.getLocation(id);
  }
  async deleteLocation(id, options) {
    const authorizationResponse = (await this.permissionApi.authorize([{ permission: pluginCatalogCommon.catalogLocationDeletePermission }], { token: options == null ? void 0 : options.authorizationToken }))[0];
    if (authorizationResponse.result === pluginPermissionCommon.AuthorizeResult.DENY) {
      throw new errors.NotAllowedError();
    }
    return this.locationService.deleteLocation(id);
  }
}

class CatalogBuilder {
  constructor(env) {
    this.processingInterval = createRandomProcessingInterval({
      minSeconds: 100,
      maxSeconds: 150
    });
    this.locationAnalyzer = void 0;
    this.env = env;
    this.entityPolicies = [];
    this.entityPoliciesReplace = false;
    this.placeholderResolvers = {};
    this.fieldFormatValidators = {};
    this.entityProviders = [];
    this.processors = [];
    this.processorsReplace = false;
    this.parser = void 0;
    this.permissionRules = Object.values(permissionRules);
  }
  static create(env) {
    return new CatalogBuilder(env);
  }
  addEntityPolicy(...policies) {
    this.entityPolicies.push(...policies.flat());
    return this;
  }
  setProcessingIntervalSeconds(seconds) {
    this.processingInterval = createRandomProcessingInterval({
      minSeconds: seconds,
      maxSeconds: seconds * 1.5
    });
    return this;
  }
  setProcessingInterval(processingInterval) {
    this.processingInterval = processingInterval;
    return this;
  }
  setLocationAnalyzer(locationAnalyzer) {
    this.locationAnalyzer = locationAnalyzer;
    return this;
  }
  replaceEntityPolicies(policies) {
    this.entityPolicies = [...policies];
    this.entityPoliciesReplace = true;
    return this;
  }
  setPlaceholderResolver(key, resolver) {
    this.placeholderResolvers[key] = resolver;
    return this;
  }
  setFieldFormatValidators(validators) {
    lodash__default["default"].merge(this.fieldFormatValidators, validators);
    return this;
  }
  addEntityProvider(...providers) {
    this.entityProviders.push(...providers.flat());
    return this;
  }
  addProcessor(...processors) {
    this.processors.push(...processors.flat());
    return this;
  }
  replaceProcessors(processors) {
    this.processors = [...processors];
    this.processorsReplace = true;
    return this;
  }
  getDefaultProcessors() {
    const { config, logger, reader } = this.env;
    const integrations = integration.ScmIntegrations.fromConfig(config);
    return [
      new FileReaderProcessor(),
      new UrlReaderProcessor({ reader, logger }),
      CodeOwnersProcessor.fromConfig(config, { logger, reader }),
      new AnnotateLocationEntityProcessor({ integrations })
    ];
  }
  setEntityDataParser(parser) {
    this.parser = parser;
    return this;
  }
  addPermissionRules(...permissionRules) {
    this.permissionRules.push(...permissionRules.flat());
  }
  async build() {
    var _a, _b;
    const { config, database, logger, permissions } = this.env;
    const policy = this.buildEntityPolicy();
    const processors = this.buildProcessors();
    const parser = this.parser || defaultEntityDataParser;
    const dbClient = await database.getClient();
    if (!((_a = database.migrations) == null ? void 0 : _a.skip)) {
      logger.info("Performing database migration");
      await applyDatabaseMigrations(dbClient);
    }
    const processingDatabase = new DefaultProcessingDatabase({
      database: dbClient,
      logger,
      refreshInterval: this.processingInterval
    });
    const integrations = integration.ScmIntegrations.fromConfig(config);
    const rulesEnforcer = DefaultCatalogRulesEnforcer.fromConfig(config);
    const orchestrator = new DefaultCatalogProcessingOrchestrator({
      processors,
      integrations,
      rulesEnforcer,
      logger,
      parser,
      policy
    });
    const unauthorizedEntitiesCatalog = new DefaultEntitiesCatalog(dbClient);
    let permissionEvaluator;
    if ("authorizeConditional" in permissions) {
      permissionEvaluator = permissions;
    } else {
      logger.warn("PermissionAuthorizer is deprecated. Please use an instance of PermissionEvaluator instead of PermissionAuthorizer in PluginEnvironment#permissions");
      permissionEvaluator = pluginPermissionCommon.toPermissionEvaluator(permissions);
    }
    const entitiesCatalog = new AuthorizedEntitiesCatalog(unauthorizedEntitiesCatalog, permissionEvaluator, pluginPermissionNode.createConditionTransformer(this.permissionRules));
    const permissionIntegrationRouter = pluginPermissionNode.createPermissionIntegrationRouter({
      resourceType: pluginCatalogCommon.RESOURCE_TYPE_CATALOG_ENTITY,
      getResources: async (resourceRefs) => {
        const { entities } = await unauthorizedEntitiesCatalog.entities({
          filter: {
            anyOf: resourceRefs.map((resourceRef) => {
              const { kind, namespace, name } = catalogModel.parseEntityRef(resourceRef);
              return basicEntityFilter({
                kind,
                "metadata.namespace": namespace,
                "metadata.name": name
              });
            })
          }
        });
        const entitiesByRef = lodash.keyBy(entities, catalogModel.stringifyEntityRef);
        return resourceRefs.map((resourceRef) => entitiesByRef[catalogModel.stringifyEntityRef(catalogModel.parseEntityRef(resourceRef))]);
      },
      rules: this.permissionRules
    });
    const stitcher = new Stitcher(dbClient, logger);
    const locationStore = new DefaultLocationStore(dbClient);
    const configLocationProvider = new ConfigLocationEntityProvider(config);
    const entityProviders = lodash__default["default"].uniqBy([...this.entityProviders, locationStore, configLocationProvider], (provider) => provider.getProviderName());
    const processingEngine = new DefaultCatalogProcessingEngine(logger, processingDatabase, orchestrator, stitcher, () => crypto.createHash("sha1"));
    const locationAnalyzer = (_b = this.locationAnalyzer) != null ? _b : new RepoLocationAnalyzer(logger, integrations);
    const locationService = new AuthorizedLocationService(new DefaultLocationService(locationStore, orchestrator), permissionEvaluator);
    const refreshService = new AuthorizedRefreshService(new DefaultRefreshService({ database: processingDatabase }), permissionEvaluator);
    const router = await createRouter({
      entitiesCatalog,
      locationAnalyzer,
      locationService,
      orchestrator,
      refreshService,
      logger,
      config,
      permissionIntegrationRouter
    });
    await connectEntityProviders(processingDatabase, entityProviders);
    return {
      processingEngine,
      router
    };
  }
  buildEntityPolicy() {
    const entityPolicies = this.entityPoliciesReplace ? [new catalogModel.SchemaValidEntityPolicy(), ...this.entityPolicies] : [
      new catalogModel.SchemaValidEntityPolicy(),
      new catalogModel.DefaultNamespaceEntityPolicy(),
      new catalogModel.NoForeignRootFieldsEntityPolicy(),
      new catalogModel.FieldFormatEntityPolicy(catalogModel.makeValidator(this.fieldFormatValidators)),
      ...this.entityPolicies
    ];
    return catalogModel.EntityPolicies.allOf(entityPolicies);
  }
  buildProcessors() {
    const { config, reader } = this.env;
    const integrations = integration.ScmIntegrations.fromConfig(config);
    this.checkDeprecatedReaderProcessors();
    const placeholderResolvers = {
      json: jsonPlaceholderResolver,
      yaml: yamlPlaceholderResolver,
      text: textPlaceholderResolver,
      ...this.placeholderResolvers
    };
    const processors = [
      new PlaceholderProcessor({
        resolvers: placeholderResolvers,
        reader,
        integrations
      }),
      new BuiltinKindsEntityProcessor()
    ];
    if (!this.processorsReplace) {
      processors.push(...this.getDefaultProcessors());
    }
    processors.push(...this.processors);
    this.checkMissingExternalProcessors(processors);
    return processors;
  }
  checkDeprecatedReaderProcessors() {
    const pc = this.env.config.getOptionalConfig("catalog.processors");
    if (pc == null ? void 0 : pc.has("github")) {
      throw new Error(`Using deprecated configuration for catalog.processors.github, move to using integrations.github instead`);
    }
    if (pc == null ? void 0 : pc.has("gitlabApi")) {
      throw new Error(`Using deprecated configuration for catalog.processors.gitlabApi, move to using integrations.gitlab instead`);
    }
    if (pc == null ? void 0 : pc.has("bitbucketApi")) {
      throw new Error(`Using deprecated configuration for catalog.processors.bitbucketApi, move to using integrations.bitbucket instead`);
    }
    if (pc == null ? void 0 : pc.has("azureApi")) {
      throw new Error(`Using deprecated configuration for catalog.processors.azureApi, move to using integrations.azure instead`);
    }
  }
  checkMissingExternalProcessors(processors) {
    var _a, _b;
    const skipCheckVarName = "BACKSTAGE_CATALOG_SKIP_MISSING_PROCESSORS_CHECK";
    if (process.env[skipCheckVarName]) {
      return;
    }
    const locationTypes = new Set((_b = (_a = this.env.config.getOptionalConfigArray("catalog.locations")) == null ? void 0 : _a.map((l) => l.getString("type"))) != null ? _b : []);
    const processorNames = new Set(processors.map((p) => p.getProcessorName()));
    function check(locationType, processorName, installationUrl) {
      if (locationTypes.has(locationType) && !processorNames.has(processorName)) {
        throw new Error([
          `Your config contains a "catalog.locations" entry of type ${locationType},`,
          `but does not have the corresponding catalog processor ${processorName} installed.`,
          `This processor used to be built into the catalog itself, but is now moved to an`,
          `external module that has to be installed manually. Please follow the installation`,
          `instructions at ${installationUrl} if you are using this ability, or remove the`,
          `location from your app config if you do not. You can also silence this check entirely`,
          `by setting the environment variable ${skipCheckVarName} to 'true'.`
        ].join(" "));
      }
    }
    check("aws-cloud-accounts", "AwsOrganizationCloudAccountProcessor", "https://backstage.io/docs/integrations");
    check("s3-discovery", "AwsS3DiscoveryProcessor", "https://backstage.io/docs/integrations/aws-s3/discovery");
    check("azure-discovery", "AzureDevOpsDiscoveryProcessor", "https://backstage.io/docs/integrations/azure/discovery");
    check("bitbucket-discovery", "BitbucketDiscoveryProcessor", "https://backstage.io/docs/integrations/bitbucket/discovery");
    check("github-discovery", "GithubDiscoveryProcessor", "https://backstage.io/docs/integrations/github/discovery");
    check("github-org", "GithubOrgReaderProcessor", "https://backstage.io/docs/integrations/github/org");
    check("gitlab-discovery", "GitLabDiscoveryProcessor", "https://backstage.io/docs/integrations/gitlab/discovery");
    check("ldap-org", "LdapOrgReaderProcessor", "https://backstage.io/docs/integrations/ldap/org");
    check("microsoft-graph-org", "MicrosoftGraphOrgReaderProcessor", "https://backstage.io/docs/integrations/azure/org");
  }
}

exports.AnnotateLocationEntityProcessor = AnnotateLocationEntityProcessor;
exports.AnnotateScmSlugEntityProcessor = AnnotateScmSlugEntityProcessor;
exports.BuiltinKindsEntityProcessor = BuiltinKindsEntityProcessor;
exports.CatalogBuilder = CatalogBuilder;
exports.CodeOwnersProcessor = CodeOwnersProcessor;
exports.DefaultCatalogCollator = DefaultCatalogCollator;
exports.DefaultCatalogCollatorFactory = DefaultCatalogCollatorFactory;
exports.FileReaderProcessor = FileReaderProcessor;
exports.LocationEntityProcessor = LocationEntityProcessor;
exports.PlaceholderProcessor = PlaceholderProcessor;
exports.UrlReaderProcessor = UrlReaderProcessor;
exports.catalogConditions = catalogConditions;
exports.createCatalogConditionalDecision = createCatalogConditionalDecision;
exports.createCatalogPermissionRule = createCatalogPermissionRule;
exports.createRandomProcessingInterval = createRandomProcessingInterval;
exports.locationSpecToLocationEntity = locationSpecToLocationEntity;
exports.parseEntityYaml = parseEntityYaml;
exports.permissionRules = permissionRules;
exports.processingResult = processingResult;
//# sourceMappingURL=index.cjs.js.map
