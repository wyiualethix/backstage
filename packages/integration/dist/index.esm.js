import parseGitUrl from 'git-url-parse';
import { trimEnd, trimStart } from 'lodash';
import fetch from 'cross-fetch';
import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';
import { DateTime } from 'luxon';
import { InputError } from '@backstage/errors';

function isValidHost(host) {
  const check = new URL("http://example.com");
  check.host = host;
  return check.host === host;
}
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
function basicIntegrations(integrations, getHost) {
  return {
    list() {
      return integrations;
    },
    byUrl(url) {
      try {
        const parsed = typeof url === "string" ? new URL(url) : url;
        return integrations.find((i) => getHost(i) === parsed.host);
      } catch {
        return void 0;
      }
    },
    byHost(host) {
      return integrations.find((i) => getHost(i) === host);
    }
  };
}
function defaultScmResolveUrl(options) {
  const { url, base, lineNumber } = options;
  try {
    new URL(url);
    return url;
  } catch {
  }
  let updated;
  if (url.startsWith("/")) {
    const { filepath } = parseGitUrl(base);
    updated = new URL(base);
    const repoRootPath = trimEnd(updated.pathname.substring(0, updated.pathname.length - filepath.length), "/");
    updated.pathname = `${repoRootPath}${url}`;
  } else {
    updated = new URL(url, base);
  }
  updated.search = new URL(base).search;
  if (lineNumber) {
    updated.hash = `L${lineNumber}`;
  }
  return updated.toString();
}

const AMAZON_AWS_HOST = "amazonaws.com";
function readAwsS3IntegrationConfig(config) {
  var _a;
  const endpoint = config.getOptionalString("endpoint");
  const s3ForcePathStyle = (_a = config.getOptionalBoolean("s3ForcePathStyle")) != null ? _a : false;
  let host;
  let pathname;
  if (endpoint) {
    try {
      const url = new URL(endpoint);
      host = url.host;
      pathname = url.pathname;
    } catch {
      throw new Error(`invalid awsS3 integration config, endpoint '${endpoint}' is not a valid URL`);
    }
    if (pathname !== "/") {
      throw new Error(`invalid awsS3 integration config, endpoints cannot contain path, got '${endpoint}'`);
    }
  } else {
    host = AMAZON_AWS_HOST;
  }
  const accessKeyId = config.getOptionalString("accessKeyId");
  const secretAccessKey = config.getOptionalString("secretAccessKey");
  const roleArn = config.getOptionalString("roleArn");
  const externalId = config.getOptionalString("externalId");
  return {
    host,
    endpoint,
    s3ForcePathStyle,
    accessKeyId,
    secretAccessKey,
    roleArn,
    externalId
  };
}
function readAwsS3IntegrationConfigs(configs) {
  const result = configs.map(readAwsS3IntegrationConfig);
  if (!result.some((c) => c.host === AMAZON_AWS_HOST)) {
    result.push({
      host: AMAZON_AWS_HOST
    });
  }
  return result;
}

const _AwsS3Integration = class {
  constructor(integrationConfig) {
    this.integrationConfig = integrationConfig;
  }
  get type() {
    return "awsS3";
  }
  get title() {
    return this.integrationConfig.host;
  }
  get config() {
    return this.integrationConfig;
  }
  resolveUrl(options) {
    const resolved = defaultScmResolveUrl(options);
    return resolved;
  }
  resolveEditUrl(url) {
    return url;
  }
};
let AwsS3Integration = _AwsS3Integration;
AwsS3Integration.factory = ({ config }) => {
  var _a;
  const configs = readAwsS3IntegrationConfigs((_a = config.getOptionalConfigArray("integrations.awsS3")) != null ? _a : []);
  return basicIntegrations(configs.map((c) => new _AwsS3Integration(c)), (i) => i.config.host);
};

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
var _origin, _owner, _project, _repo, _path, _ref, _baseUrl;
const VERSION_PREFIX_GIT_BRANCH = "GB";
const _AzureUrl = class {
  constructor(origin, owner, project, repo, path, ref) {
    __privateAdd(this, _origin, void 0);
    __privateAdd(this, _owner, void 0);
    __privateAdd(this, _project, void 0);
    __privateAdd(this, _repo, void 0);
    __privateAdd(this, _path, void 0);
    __privateAdd(this, _ref, void 0);
    __privateAdd(this, _baseUrl, (...parts) => {
      const url = new URL(__privateGet(this, _origin));
      url.pathname = parts.map((part) => encodeURIComponent(part)).join("/");
      return url;
    });
    __privateSet(this, _origin, origin);
    __privateSet(this, _owner, owner);
    __privateSet(this, _project, project);
    __privateSet(this, _repo, repo);
    __privateSet(this, _path, path);
    __privateSet(this, _ref, ref);
  }
  static fromRepoUrl(repoUrl) {
    var _a;
    const url = new URL(repoUrl);
    let owner;
    let project;
    let repo;
    const parts = url.pathname.split("/").map((part) => decodeURIComponent(part));
    if (parts[2] === "_git") {
      owner = parts[1];
      project = repo = parts[3];
    } else if (parts[3] === "_git") {
      owner = parts[1];
      project = parts[2];
      repo = parts[4];
    } else if (parts[4] === "_git") {
      owner = `${parts[1]}/${parts[2]}`;
      project = parts[3];
      repo = parts[5];
    }
    if (!owner || !project || !repo) {
      throw new Error("Azure URL must point to a git repository");
    }
    const path = (_a = url.searchParams.get("path")) != null ? _a : void 0;
    let ref;
    const version = url.searchParams.get("version");
    if (version) {
      const prefix = version.slice(0, 2);
      if (prefix !== "GB") {
        throw new Error("Azure URL version must point to a git branch");
      }
      ref = version.slice(2);
    }
    return new _AzureUrl(url.origin, owner, project, repo, path, ref);
  }
  toRepoUrl() {
    let url;
    if (__privateGet(this, _project) === __privateGet(this, _repo)) {
      url = __privateGet(this, _baseUrl).call(this, __privateGet(this, _owner), "_git", __privateGet(this, _repo));
    } else {
      url = __privateGet(this, _baseUrl).call(this, __privateGet(this, _owner), __privateGet(this, _project), "_git", __privateGet(this, _repo));
    }
    if (__privateGet(this, _path)) {
      url.searchParams.set("path", __privateGet(this, _path));
    }
    if (__privateGet(this, _ref)) {
      url.searchParams.set("version", VERSION_PREFIX_GIT_BRANCH + __privateGet(this, _ref));
    }
    return url.toString();
  }
  toFileUrl() {
    if (!__privateGet(this, _path)) {
      throw new Error("Azure URL must point to a specific path to be able to download a file");
    }
    const url = __privateGet(this, _baseUrl).call(this, __privateGet(this, _owner), __privateGet(this, _project), "_apis", "git", "repositories", __privateGet(this, _repo), "items");
    url.searchParams.set("api-version", "6.0");
    url.searchParams.set("path", __privateGet(this, _path));
    if (__privateGet(this, _ref)) {
      url.searchParams.set("version", __privateGet(this, _ref));
    }
    return url.toString();
  }
  toArchiveUrl() {
    const url = __privateGet(this, _baseUrl).call(this, __privateGet(this, _owner), __privateGet(this, _project), "_apis", "git", "repositories", __privateGet(this, _repo), "items");
    url.searchParams.set("recursionLevel", "full");
    url.searchParams.set("download", "true");
    url.searchParams.set("api-version", "6.0");
    if (__privateGet(this, _path)) {
      url.searchParams.set("scopePath", __privateGet(this, _path));
    }
    if (__privateGet(this, _ref)) {
      url.searchParams.set("version", __privateGet(this, _ref));
    }
    return url.toString();
  }
  toCommitsUrl() {
    const url = __privateGet(this, _baseUrl).call(this, __privateGet(this, _owner), __privateGet(this, _project), "_apis", "git", "repositories", __privateGet(this, _repo), "commits");
    url.searchParams.set("api-version", "6.0");
    if (__privateGet(this, _ref)) {
      url.searchParams.set("searchCriteria.itemVersion.version", __privateGet(this, _ref));
    }
    return url.toString();
  }
  getOwner() {
    return __privateGet(this, _owner);
  }
  getProject() {
    return __privateGet(this, _project);
  }
  getRepo() {
    return __privateGet(this, _repo);
  }
  getPath() {
    return __privateGet(this, _path);
  }
  getRef() {
    return __privateGet(this, _ref);
  }
};
let AzureUrl = _AzureUrl;
_origin = new WeakMap();
_owner = new WeakMap();
_project = new WeakMap();
_repo = new WeakMap();
_path = new WeakMap();
_ref = new WeakMap();
_baseUrl = new WeakMap();

const AZURE_HOST = "dev.azure.com";
function readAzureIntegrationConfig(config) {
  var _a;
  const host = (_a = config.getOptionalString("host")) != null ? _a : AZURE_HOST;
  const token = config.getOptionalString("token");
  if (!isValidHost(host)) {
    throw new Error(`Invalid Azure integration config, '${host}' is not a valid host`);
  }
  return { host, token };
}
function readAzureIntegrationConfigs(configs) {
  const result = configs.map(readAzureIntegrationConfig);
  if (!result.some((c) => c.host === AZURE_HOST)) {
    result.push({ host: AZURE_HOST });
  }
  return result;
}

const _AzureIntegration = class {
  constructor(integrationConfig) {
    this.integrationConfig = integrationConfig;
  }
  get type() {
    return "azure";
  }
  get title() {
    return this.integrationConfig.host;
  }
  get config() {
    return this.integrationConfig;
  }
  resolveUrl(options) {
    var _a;
    const { url, base } = options;
    if (isValidUrl(url)) {
      return url;
    }
    try {
      const azureUrl = AzureUrl.fromRepoUrl(base);
      const newUrl = new URL(base);
      const mockBaseUrl = new URL(`https://a.com${(_a = azureUrl.getPath()) != null ? _a : ""}`);
      const updatedPath = new URL(url, mockBaseUrl).pathname;
      newUrl.searchParams.set("path", updatedPath);
      if (options.lineNumber) {
        newUrl.searchParams.set("line", String(options.lineNumber));
        newUrl.searchParams.set("lineEnd", String(options.lineNumber + 1));
        newUrl.searchParams.set("lineStartColumn", "1");
        newUrl.searchParams.set("lineEndColumn", "1");
      }
      return newUrl.toString();
    } catch {
      return new URL(url, base).toString();
    }
  }
  resolveEditUrl(url) {
    return url;
  }
};
let AzureIntegration = _AzureIntegration;
AzureIntegration.factory = ({ config }) => {
  var _a;
  const configs = readAzureIntegrationConfigs((_a = config.getOptionalConfigArray("integrations.azure")) != null ? _a : []);
  return basicIntegrations(configs.map((c) => new _AzureIntegration(c)), (i) => i.config.host);
};

function getAzureFileFetchUrl(url) {
  return AzureUrl.fromRepoUrl(url).toFileUrl();
}
function getAzureDownloadUrl(url) {
  return AzureUrl.fromRepoUrl(url).toArchiveUrl();
}
function getAzureCommitsUrl(url) {
  return AzureUrl.fromRepoUrl(url).toCommitsUrl();
}
function getAzureRequestOptions(config, additionalHeaders) {
  const headers = additionalHeaders ? { ...additionalHeaders } : {};
  if (config.token) {
    const buffer = Buffer.from(`:${config.token}`, "utf8");
    headers.Authorization = `Basic ${buffer.toString("base64")}`;
  }
  return { headers };
}

const BITBUCKET_HOST = "bitbucket.org";
const BITBUCKET_API_BASE_URL = "https://api.bitbucket.org/2.0";
function readBitbucketIntegrationConfig(config) {
  var _a;
  const host = (_a = config.getOptionalString("host")) != null ? _a : BITBUCKET_HOST;
  let apiBaseUrl = config.getOptionalString("apiBaseUrl");
  const token = config.getOptionalString("token");
  const username = config.getOptionalString("username");
  const appPassword = config.getOptionalString("appPassword");
  if (!isValidHost(host)) {
    throw new Error(`Invalid Bitbucket integration config, '${host}' is not a valid host`);
  }
  if (apiBaseUrl) {
    apiBaseUrl = trimEnd(apiBaseUrl, "/");
  } else if (host === BITBUCKET_HOST) {
    apiBaseUrl = BITBUCKET_API_BASE_URL;
  } else {
    apiBaseUrl = `https://${host}/rest/api/1.0`;
  }
  return {
    host,
    apiBaseUrl,
    token,
    username,
    appPassword
  };
}
function readBitbucketIntegrationConfigs(configs) {
  const result = configs.map(readBitbucketIntegrationConfig);
  if (!result.some((c) => c.host === BITBUCKET_HOST)) {
    result.push({
      host: BITBUCKET_HOST,
      apiBaseUrl: BITBUCKET_API_BASE_URL
    });
  }
  return result;
}

const _BitbucketIntegration = class {
  constructor(integrationConfig) {
    this.integrationConfig = integrationConfig;
  }
  get type() {
    return "bitbucket";
  }
  get title() {
    return this.integrationConfig.host;
  }
  get config() {
    return this.integrationConfig;
  }
  resolveUrl(options) {
    const resolved = defaultScmResolveUrl(options);
    if (!options.lineNumber) {
      return resolved;
    }
    const url = new URL(resolved);
    if (this.integrationConfig.host === "bitbucket.org") {
      url.hash = `lines-${options.lineNumber}`;
    } else {
      url.hash = `${options.lineNumber}`;
    }
    return url.toString();
  }
  resolveEditUrl(url) {
    const urlData = parseGitUrl(url);
    const editUrl = new URL(url);
    editUrl.searchParams.set("mode", "edit");
    editUrl.searchParams.set("spa", "0");
    editUrl.searchParams.set("at", urlData.ref);
    return editUrl.toString();
  }
};
let BitbucketIntegration = _BitbucketIntegration;
BitbucketIntegration.factory = ({
  config
}) => {
  var _a, _b, _c;
  const configs = readBitbucketIntegrationConfigs((_c = config.getOptionalConfigArray("integrations.bitbucket")) != null ? _c : [
    ...(_a = config.getOptionalConfigArray("integrations.bitbucketCloud")) != null ? _a : [],
    ...(_b = config.getOptionalConfigArray("integrations.bitbucketServer")) != null ? _b : []
  ]);
  return basicIntegrations(configs.map((c) => new _BitbucketIntegration(c)), (i) => i.config.host);
};

async function getBitbucketDefaultBranch(url, config) {
  const { name: repoName, owner: project, resource } = parseGitUrl(url);
  const isHosted = resource === "bitbucket.org";
  let branchUrl = isHosted ? `${config.apiBaseUrl}/repositories/${project}/${repoName}` : `${config.apiBaseUrl}/projects/${project}/repos/${repoName}/default-branch`;
  let response = await fetch(branchUrl, getBitbucketRequestOptions(config));
  if (response.status === 404 && !isHosted) {
    branchUrl = `${config.apiBaseUrl}/projects/${project}/repos/${repoName}/branches/default`;
    response = await fetch(branchUrl, getBitbucketRequestOptions(config));
  }
  if (!response.ok) {
    const message = `Failed to retrieve default branch from ${branchUrl}, ${response.status} ${response.statusText}`;
    throw new Error(message);
  }
  let defaultBranch;
  if (isHosted) {
    const repoInfo = await response.json();
    defaultBranch = repoInfo.mainbranch.name;
  } else {
    const { displayId } = await response.json();
    defaultBranch = displayId;
  }
  if (!defaultBranch) {
    throw new Error(`Failed to read default branch from ${branchUrl}. Response ${response.status} ${response.json()}`);
  }
  return defaultBranch;
}
async function getBitbucketDownloadUrl(url, config) {
  const {
    name: repoName,
    owner: project,
    ref,
    protocol,
    resource,
    filepath
  } = parseGitUrl(url);
  const isHosted = resource === "bitbucket.org";
  let branch = ref;
  if (!branch) {
    branch = await getBitbucketDefaultBranch(url, config);
  }
  const path = filepath ? `&path=${encodeURIComponent(filepath)}` : "";
  const archiveUrl = isHosted ? `${protocol}://${resource}/${project}/${repoName}/get/${branch}.tar.gz` : `${config.apiBaseUrl}/projects/${project}/repos/${repoName}/archive?format=tgz&at=${branch}&prefix=${project}-${repoName}${path}`;
  return archiveUrl;
}
function getBitbucketFileFetchUrl(url, config) {
  try {
    const { owner, name, ref, filepathtype, filepath } = parseGitUrl(url);
    if (!owner || !name || filepathtype !== "browse" && filepathtype !== "raw" && filepathtype !== "src") {
      throw new Error("Invalid Bitbucket URL or file path");
    }
    const pathWithoutSlash = filepath.replace(/^\//, "");
    if (config.host === "bitbucket.org") {
      if (!ref) {
        throw new Error("Invalid Bitbucket URL or file path");
      }
      return `${config.apiBaseUrl}/repositories/${owner}/${name}/src/${ref}/${pathWithoutSlash}`;
    }
    return `${config.apiBaseUrl}/projects/${owner}/repos/${name}/raw/${pathWithoutSlash}?at=${ref}`;
  } catch (e) {
    throw new Error(`Incorrect URL: ${url}, ${e}`);
  }
}
function getBitbucketRequestOptions(config) {
  const headers = {};
  if (config.token) {
    headers.Authorization = `Bearer ${config.token}`;
  } else if (config.username && config.appPassword) {
    const buffer = Buffer.from(`${config.username}:${config.appPassword}`, "utf8");
    headers.Authorization = `Basic ${buffer.toString("base64")}`;
  }
  return {
    headers
  };
}

const BITBUCKET_CLOUD_HOST = "bitbucket.org";
const BITBUCKET_CLOUD_API_BASE_URL = "https://api.bitbucket.org/2.0";
function readBitbucketCloudIntegrationConfig(config) {
  const host = BITBUCKET_CLOUD_HOST;
  const apiBaseUrl = BITBUCKET_CLOUD_API_BASE_URL;
  const username = config.getString("username");
  const appPassword = config.getString("appPassword");
  return {
    host,
    apiBaseUrl,
    username,
    appPassword
  };
}
function readBitbucketCloudIntegrationConfigs(configs) {
  const result = configs.map(readBitbucketCloudIntegrationConfig);
  if (result.length === 0) {
    result.push({
      host: BITBUCKET_CLOUD_HOST,
      apiBaseUrl: BITBUCKET_CLOUD_API_BASE_URL
    });
  }
  return result;
}

const _BitbucketCloudIntegration = class {
  constructor(integrationConfig) {
    this.integrationConfig = integrationConfig;
  }
  get type() {
    return "bitbucketCloud";
  }
  get title() {
    return this.integrationConfig.host;
  }
  get config() {
    return this.integrationConfig;
  }
  resolveUrl(options) {
    const resolved = defaultScmResolveUrl(options);
    if (options.lineNumber) {
      const url = new URL(resolved);
      url.hash = `lines-${options.lineNumber}`;
      return url.toString();
    }
    return resolved;
  }
  resolveEditUrl(url) {
    const urlData = parseGitUrl(url);
    const editUrl = new URL(url);
    editUrl.searchParams.set("mode", "edit");
    editUrl.searchParams.set("at", urlData.ref);
    return editUrl.toString();
  }
};
let BitbucketCloudIntegration = _BitbucketCloudIntegration;
BitbucketCloudIntegration.factory = ({
  config
}) => {
  var _a;
  const configs = readBitbucketCloudIntegrationConfigs((_a = config.getOptionalConfigArray("integrations.bitbucketCloud")) != null ? _a : []);
  return basicIntegrations(configs.map((c) => new _BitbucketCloudIntegration(c)), (i) => i.config.host);
};

async function getBitbucketCloudDefaultBranch(url, config) {
  const { name: repoName, owner: project } = parseGitUrl(url);
  const branchUrl = `${config.apiBaseUrl}/repositories/${project}/${repoName}`;
  const response = await fetch(branchUrl, getBitbucketCloudRequestOptions(config));
  if (!response.ok) {
    const message = `Failed to retrieve default branch from ${branchUrl}, ${response.status} ${response.statusText}`;
    throw new Error(message);
  }
  const repoInfo = await response.json();
  const defaultBranch = repoInfo.mainbranch.name;
  if (!defaultBranch) {
    throw new Error(`Failed to read default branch from ${branchUrl}. Response ${response.status} ${response.json()}`);
  }
  return defaultBranch;
}
async function getBitbucketCloudDownloadUrl(url, config) {
  const {
    name: repoName,
    owner: project,
    ref,
    protocol,
    resource
  } = parseGitUrl(url);
  let branch = ref;
  if (!branch) {
    branch = await getBitbucketCloudDefaultBranch(url, config);
  }
  return `${protocol}://${resource}/${project}/${repoName}/get/${branch}.tar.gz`;
}
function getBitbucketCloudFileFetchUrl(url, config) {
  try {
    const { owner, name, ref, filepathtype, filepath } = parseGitUrl(url);
    if (!owner || !name || filepathtype !== "src" && filepathtype !== "raw") {
      throw new Error("Invalid Bitbucket Cloud URL or file path");
    }
    const pathWithoutSlash = filepath.replace(/^\//, "");
    if (!ref) {
      throw new Error("Invalid Bitbucket Cloud URL or file path");
    }
    return `${config.apiBaseUrl}/repositories/${owner}/${name}/src/${ref}/${pathWithoutSlash}`;
  } catch (e) {
    throw new Error(`Incorrect URL: ${url}, ${e}`);
  }
}
function getBitbucketCloudRequestOptions(config) {
  const headers = {};
  if (config.username && config.appPassword) {
    const buffer = Buffer.from(`${config.username}:${config.appPassword}`, "utf8");
    headers.Authorization = `Basic ${buffer.toString("base64")}`;
  }
  return {
    headers
  };
}

function readBitbucketServerIntegrationConfig(config) {
  const host = config.getString("host");
  let apiBaseUrl = config.getOptionalString("apiBaseUrl");
  const token = config.getOptionalString("token");
  if (!isValidHost(host)) {
    throw new Error(`Invalid Bitbucket Server integration config, '${host}' is not a valid host`);
  }
  if (apiBaseUrl) {
    apiBaseUrl = trimEnd(apiBaseUrl, "/");
  } else {
    apiBaseUrl = `https://${host}/rest/api/1.0`;
  }
  return {
    host,
    apiBaseUrl,
    token
  };
}
function readBitbucketServerIntegrationConfigs(configs) {
  return configs.map(readBitbucketServerIntegrationConfig);
}

const _BitbucketServerIntegration = class {
  constructor(integrationConfig) {
    this.integrationConfig = integrationConfig;
  }
  get type() {
    return "bitbucketServer";
  }
  get title() {
    return this.integrationConfig.host;
  }
  get config() {
    return this.integrationConfig;
  }
  resolveUrl(options) {
    const resolved = defaultScmResolveUrl(options);
    if (options.lineNumber) {
      const url = new URL(resolved);
      const filename = url.pathname.split("/").slice(-1)[0];
      url.hash = `${filename}-${options.lineNumber}`;
      return url.toString();
    }
    return resolved;
  }
  resolveEditUrl(url) {
    const urlData = parseGitUrl(url);
    const editUrl = new URL(url);
    editUrl.searchParams.set("mode", "edit");
    editUrl.searchParams.set("spa", "0");
    editUrl.searchParams.set("at", urlData.ref);
    return editUrl.toString();
  }
};
let BitbucketServerIntegration = _BitbucketServerIntegration;
BitbucketServerIntegration.factory = ({
  config
}) => {
  var _a;
  const configs = readBitbucketServerIntegrationConfigs((_a = config.getOptionalConfigArray("integrations.bitbucketServer")) != null ? _a : []);
  return basicIntegrations(configs.map((c) => new _BitbucketServerIntegration(c)), (i) => i.config.host);
};

async function getBitbucketServerDefaultBranch(url, config) {
  const { name: repoName, owner: project } = parseGitUrl(url);
  let branchUrl = `${config.apiBaseUrl}/projects/${project}/repos/${repoName}/default-branch`;
  let response = await fetch(branchUrl, getBitbucketServerRequestOptions(config));
  if (response.status === 404) {
    branchUrl = `${config.apiBaseUrl}/projects/${project}/repos/${repoName}/branches/default`;
    response = await fetch(branchUrl, getBitbucketServerRequestOptions(config));
  }
  if (!response.ok) {
    const message = `Failed to retrieve default branch from ${branchUrl}, ${response.status} ${response.statusText}`;
    throw new Error(message);
  }
  const { displayId } = await response.json();
  const defaultBranch = displayId;
  if (!defaultBranch) {
    throw new Error(`Failed to read default branch from ${branchUrl}. Response ${response.status} ${response.json()}`);
  }
  return defaultBranch;
}
async function getBitbucketServerDownloadUrl(url, config) {
  const { name: repoName, owner: project, ref, filepath } = parseGitUrl(url);
  let branch = ref;
  if (!branch) {
    branch = await getBitbucketServerDefaultBranch(url, config);
  }
  const path = filepath ? `&path=${encodeURIComponent(filepath)}` : "";
  return `${config.apiBaseUrl}/projects/${project}/repos/${repoName}/archive?format=tgz&at=${branch}&prefix=${project}-${repoName}${path}`;
}
function getBitbucketServerFileFetchUrl(url, config) {
  try {
    const { owner, name, ref, filepathtype, filepath } = parseGitUrl(url);
    if (!owner || !name || filepathtype !== "browse" && filepathtype !== "raw" && filepathtype !== "src") {
      throw new Error("Invalid Bitbucket Server URL or file path");
    }
    const pathWithoutSlash = filepath.replace(/^\//, "");
    return `${config.apiBaseUrl}/projects/${owner}/repos/${name}/raw/${pathWithoutSlash}?at=${ref}`;
  } catch (e) {
    throw new Error(`Incorrect URL: ${url}, ${e}`);
  }
}
function getBitbucketServerRequestOptions(config) {
  const headers = {};
  if (config.token) {
    headers.Authorization = `Bearer ${config.token}`;
  }
  return {
    headers
  };
}

function readGerritIntegrationConfig(config) {
  const host = config.getString("host");
  let baseUrl = config.getOptionalString("baseUrl");
  let cloneUrl = config.getOptionalString("cloneUrl");
  let gitilesBaseUrl = config.getOptionalString("gitilesBaseUrl");
  const username = config.getOptionalString("username");
  const password = config.getOptionalString("password");
  if (!isValidHost(host)) {
    throw new Error(`Invalid Gerrit integration config, '${host}' is not a valid host`);
  } else if (baseUrl && !isValidUrl(baseUrl)) {
    throw new Error(`Invalid Gerrit integration config, '${baseUrl}' is not a valid baseUrl`);
  } else if (cloneUrl && !isValidUrl(cloneUrl)) {
    throw new Error(`Invalid Gerrit integration config, '${cloneUrl}' is not a valid cloneUrl`);
  } else if (gitilesBaseUrl && !isValidUrl(gitilesBaseUrl)) {
    throw new Error(`Invalid Gerrit integration config, '${gitilesBaseUrl}' is not a valid gitilesBaseUrl`);
  }
  if (baseUrl) {
    baseUrl = trimEnd(baseUrl, "/");
  } else {
    baseUrl = `https://${host}`;
  }
  if (gitilesBaseUrl) {
    gitilesBaseUrl = trimEnd(gitilesBaseUrl, "/");
  } else {
    gitilesBaseUrl = `https://${host}`;
  }
  if (cloneUrl) {
    cloneUrl = trimEnd(cloneUrl, "/");
  } else {
    cloneUrl = baseUrl;
  }
  return {
    host,
    baseUrl,
    cloneUrl,
    gitilesBaseUrl,
    username,
    password
  };
}
function readGerritIntegrationConfigs(configs) {
  return configs.map(readGerritIntegrationConfig);
}

const GERRIT_BODY_PREFIX = ")]}'";
function parseGerritGitilesUrl(config, url) {
  const urlPath = url.replace(config.gitilesBaseUrl, "");
  const parts = urlPath.split("/").filter((p) => !!p);
  const projectEndIndex = parts.indexOf("+");
  if (projectEndIndex <= 0) {
    throw new Error(`Unable to parse project from url: ${url}`);
  }
  const project = trimStart(parts.slice(0, projectEndIndex).join("/"), "/");
  const branchIndex = parts.indexOf("heads");
  if (branchIndex <= 0) {
    throw new Error(`Unable to parse branch from url: ${url}`);
  }
  const branch = parts[branchIndex + 1];
  const filePath = parts.slice(branchIndex + 2).join("/");
  return {
    branch,
    filePath: filePath === "" ? "/" : filePath,
    project
  };
}
function builldGerritGitilesUrl(config, project, branch, filePath) {
  return `${config.gitilesBaseUrl}/${project}/+/refs/heads/${branch}/${trimStart(filePath, "/")}`;
}
function getAuthenticationPrefix(config) {
  return config.password ? "/a/" : "/";
}
function getGerritBranchApiUrl(config, url) {
  const { branch, project } = parseGerritGitilesUrl(config, url);
  return `${config.baseUrl}${getAuthenticationPrefix(config)}projects/${encodeURIComponent(project)}/branches/${branch}`;
}
function getGerritCloneRepoUrl(config, url) {
  const { project } = parseGerritGitilesUrl(config, url);
  return `${config.cloneUrl}${getAuthenticationPrefix(config)}${project}`;
}
function getGerritFileContentsApiUrl(config, url) {
  const { branch, filePath, project } = parseGerritGitilesUrl(config, url);
  return `${config.baseUrl}${getAuthenticationPrefix(config)}projects/${encodeURIComponent(project)}/branches/${branch}/files/${encodeURIComponent(filePath)}/content`;
}
function getGerritProjectsApiUrl(config) {
  return `${config.baseUrl}${getAuthenticationPrefix(config)}projects/`;
}
function getGerritRequestOptions(config) {
  const headers = {};
  if (!config.password) {
    return headers;
  }
  const buffer = Buffer.from(`${config.username}:${config.password}`, "utf8");
  headers.Authorization = `Basic ${buffer.toString("base64")}`;
  return {
    headers
  };
}
async function parseGerritJsonResponse(response) {
  const responseBody = await response.text();
  if (responseBody.startsWith(GERRIT_BODY_PREFIX)) {
    try {
      return JSON.parse(responseBody.slice(GERRIT_BODY_PREFIX.length));
    } catch (ex) {
      throw new Error(`Invalid response from Gerrit: ${responseBody.slice(0, 10)} - ${ex}`);
    }
  }
  throw new Error(`Gerrit JSON body prefix missing. Found: ${responseBody.slice(0, 10)}`);
}

const _GerritIntegration = class {
  constructor(integrationConfig) {
    this.integrationConfig = integrationConfig;
  }
  get type() {
    return "gerrit";
  }
  get title() {
    return this.integrationConfig.host;
  }
  get config() {
    return this.integrationConfig;
  }
  resolveUrl(options) {
    const { url, base, lineNumber } = options;
    let updated;
    if (url.startsWith("/")) {
      const { branch, project } = parseGerritGitilesUrl(this.config, base);
      return builldGerritGitilesUrl(this.config, project, branch, url);
    }
    if (url) {
      updated = new URL(url, base);
    } else {
      updated = new URL(base);
    }
    if (lineNumber) {
      updated.hash = lineNumber.toString();
    }
    return updated.toString();
  }
  resolveEditUrl(url) {
    return url;
  }
};
let GerritIntegration = _GerritIntegration;
GerritIntegration.factory = ({ config }) => {
  var _a;
  const configs = readGerritIntegrationConfigs((_a = config.getOptionalConfigArray("integrations.gerrit")) != null ? _a : []);
  return basicIntegrations(configs.map((c) => new _GerritIntegration(c)), (i) => i.config.host);
};

const GITHUB_HOST = "github.com";
const GITHUB_API_BASE_URL = "https://api.github.com";
const GITHUB_RAW_BASE_URL = "https://raw.githubusercontent.com";
function readGitHubIntegrationConfig(config) {
  var _a, _b;
  const host = (_a = config.getOptionalString("host")) != null ? _a : GITHUB_HOST;
  let apiBaseUrl = config.getOptionalString("apiBaseUrl");
  let rawBaseUrl = config.getOptionalString("rawBaseUrl");
  const token = config.getOptionalString("token");
  const apps = (_b = config.getOptionalConfigArray("apps")) == null ? void 0 : _b.map((c) => ({
    appId: c.getNumber("appId"),
    clientId: c.getString("clientId"),
    clientSecret: c.getString("clientSecret"),
    webhookSecret: c.getString("webhookSecret"),
    privateKey: c.getString("privateKey"),
    allowedInstallationOwners: c.getOptionalStringArray("allowedInstallationOwners")
  }));
  if (!isValidHost(host)) {
    throw new Error(`Invalid GitHub integration config, '${host}' is not a valid host`);
  }
  if (apiBaseUrl) {
    apiBaseUrl = trimEnd(apiBaseUrl, "/");
  } else if (host === GITHUB_HOST) {
    apiBaseUrl = GITHUB_API_BASE_URL;
  }
  if (rawBaseUrl) {
    rawBaseUrl = trimEnd(rawBaseUrl, "/");
  } else if (host === GITHUB_HOST) {
    rawBaseUrl = GITHUB_RAW_BASE_URL;
  }
  return { host, apiBaseUrl, rawBaseUrl, token, apps };
}
function readGitHubIntegrationConfigs(configs) {
  const result = configs.map(readGitHubIntegrationConfig);
  if (!result.some((c) => c.host === GITHUB_HOST)) {
    result.push({
      host: GITHUB_HOST,
      apiBaseUrl: GITHUB_API_BASE_URL,
      rawBaseUrl: GITHUB_RAW_BASE_URL
    });
  }
  return result;
}

function getGitHubFileFetchUrl(url, config, credentials) {
  try {
    const { owner, name, ref, filepathtype, filepath } = parseGitUrl(url);
    if (!owner || !name || !ref || filepathtype !== "blob" && filepathtype !== "raw" && filepathtype !== "tree") {
      throw new Error("Invalid GitHub URL or file path");
    }
    const pathWithoutSlash = filepath.replace(/^\//, "");
    if (chooseEndpoint(config, credentials) === "api") {
      return `${config.apiBaseUrl}/repos/${owner}/${name}/contents/${pathWithoutSlash}?ref=${ref}`;
    }
    return `${config.rawBaseUrl}/${owner}/${name}/${ref}/${pathWithoutSlash}`;
  } catch (e) {
    throw new Error(`Incorrect URL: ${url}, ${e}`);
  }
}
function getGitHubRequestOptions(config, credentials) {
  const headers = {};
  if (chooseEndpoint(config, credentials) === "api") {
    headers.Accept = "application/vnd.github.v3.raw";
  }
  if (credentials.token) {
    headers.Authorization = `token ${credentials.token}`;
  }
  return { headers };
}
function chooseEndpoint(config, credentials) {
  if (config.apiBaseUrl && (credentials.token || !config.rawBaseUrl)) {
    return "api";
  }
  return "raw";
}

class Cache {
  constructor() {
    this.tokenCache = /* @__PURE__ */ new Map();
    this.isNotExpired = (date) => date.diff(DateTime.local(), "minutes").minutes > 50;
  }
  async getOrCreateToken(key, supplier) {
    const item = this.tokenCache.get(key);
    if (item && this.isNotExpired(item.expiresAt)) {
      return { accessToken: item.token };
    }
    const result = await supplier();
    this.tokenCache.set(key, result);
    return { accessToken: result.token };
  }
}
const HEADERS = {
  Accept: "application/vnd.github.machine-man-preview+json"
};
class GithubAppManager {
  constructor(config, baseUrl) {
    this.cache = new Cache();
    this.allowedInstallationOwners = config.allowedInstallationOwners;
    this.baseUrl = baseUrl;
    this.baseAuthConfig = {
      appId: config.appId,
      privateKey: config.privateKey.replace(/\\n/gm, "\n")
    };
    this.appClient = new Octokit({
      baseUrl,
      headers: HEADERS,
      authStrategy: createAppAuth,
      auth: this.baseAuthConfig
    });
  }
  async getInstallationCredentials(owner, repo) {
    var _a;
    const { installationId, suspended } = await this.getInstallationData(owner);
    if (this.allowedInstallationOwners) {
      if (!((_a = this.allowedInstallationOwners) == null ? void 0 : _a.includes(owner))) {
        return { accessToken: void 0 };
      }
    }
    if (suspended) {
      throw new Error(`The GitHub application for ${owner} is suspended`);
    }
    const cacheKey = repo ? `${owner}/${repo}` : owner;
    return this.cache.getOrCreateToken(cacheKey, async () => {
      const result = await this.appClient.apps.createInstallationAccessToken({
        installation_id: installationId,
        headers: HEADERS
      });
      if (repo && result.data.repository_selection === "selected") {
        const installationClient = new Octokit({
          baseUrl: this.baseUrl,
          auth: result.data.token
        });
        const repos = await installationClient.paginate(installationClient.apps.listReposAccessibleToInstallation);
        const hasRepo = repos.some((repository) => {
          return repository.name === repo;
        });
        if (!hasRepo) {
          throw new Error(`The Backstage GitHub application used in the ${owner} organization does not have access to a repository with the name ${repo}`);
        }
      }
      return {
        token: result.data.token,
        expiresAt: DateTime.fromISO(result.data.expires_at)
      };
    });
  }
  getInstallations() {
    return this.appClient.paginate(this.appClient.apps.listInstallations);
  }
  async getInstallationData(owner) {
    const allInstallations = await this.getInstallations();
    const installation = allInstallations.find((inst) => {
      var _a, _b;
      return ((_b = (_a = inst.account) == null ? void 0 : _a.login) == null ? void 0 : _b.toLocaleLowerCase("en-US")) === owner.toLocaleLowerCase("en-US");
    });
    if (installation) {
      return {
        installationId: installation.id,
        suspended: Boolean(installation.suspended_by)
      };
    }
    const notFoundError = new Error(`No app installation found for ${owner} in ${this.baseAuthConfig.appId}`);
    notFoundError.name = "NotFoundError";
    throw notFoundError;
  }
}
class GithubAppCredentialsMux {
  constructor(config) {
    var _a, _b;
    this.apps = (_b = (_a = config.apps) == null ? void 0 : _a.map((ac) => new GithubAppManager(ac, config.apiBaseUrl))) != null ? _b : [];
  }
  async getAllInstallations() {
    if (!this.apps.length) {
      return [];
    }
    const installs = await Promise.all(this.apps.map((app) => app.getInstallations()));
    return installs.flat();
  }
  async getAppToken(owner, repo) {
    if (this.apps.length === 0) {
      return void 0;
    }
    const results = await Promise.all(this.apps.map((app) => app.getInstallationCredentials(owner, repo).then((credentials) => ({ credentials, error: void 0 }), (error) => ({ credentials: void 0, error }))));
    const result = results.find((resultItem) => resultItem.credentials);
    if (result) {
      return result.credentials.accessToken;
    }
    const errors = results.map((r) => r.error);
    const notNotFoundError = errors.find((err) => err.name !== "NotFoundError");
    if (notNotFoundError) {
      throw notNotFoundError;
    }
    return void 0;
  }
}
const _SingleInstanceGithubCredentialsProvider = class {
  constructor(githubAppCredentialsMux, token) {
    this.githubAppCredentialsMux = githubAppCredentialsMux;
    this.token = token;
  }
  async getCredentials(opts) {
    const parsed = parseGitUrl(opts.url);
    const owner = parsed.owner || parsed.name;
    const repo = parsed.owner ? parsed.name : void 0;
    let type = "app";
    let token = await this.githubAppCredentialsMux.getAppToken(owner, repo);
    if (!token) {
      type = "token";
      token = this.token;
    }
    return {
      headers: token ? { Authorization: `Bearer ${token}` } : void 0,
      token,
      type
    };
  }
};
let SingleInstanceGithubCredentialsProvider = _SingleInstanceGithubCredentialsProvider;
SingleInstanceGithubCredentialsProvider.create = (config) => {
  return new _SingleInstanceGithubCredentialsProvider(new GithubAppCredentialsMux(config), config.token);
};

class DefaultGithubCredentialsProvider {
  constructor(providers) {
    this.providers = providers;
  }
  static fromIntegrations(integrations) {
    const credentialsProviders = /* @__PURE__ */ new Map();
    integrations.github.list().forEach((integration) => {
      const credentialsProvider = SingleInstanceGithubCredentialsProvider.create(integration.config);
      credentialsProviders.set(integration.config.host, credentialsProvider);
    });
    return new DefaultGithubCredentialsProvider(credentialsProviders);
  }
  async getCredentials(opts) {
    const parsed = new URL(opts.url);
    const provider = this.providers.get(parsed.host);
    if (!provider) {
      throw new Error(`There is no GitHub integration that matches ${opts.url}. Please add a configuration for an integration.`);
    }
    return provider.getCredentials(opts);
  }
}

const _GitHubIntegration = class {
  constructor(integrationConfig) {
    this.integrationConfig = integrationConfig;
  }
  get type() {
    return "github";
  }
  get title() {
    return this.integrationConfig.host;
  }
  get config() {
    return this.integrationConfig;
  }
  resolveUrl(options) {
    return replaceGitHubUrlType(defaultScmResolveUrl(options), "tree");
  }
  resolveEditUrl(url) {
    return replaceGitHubUrlType(url, "edit");
  }
};
let GitHubIntegration = _GitHubIntegration;
GitHubIntegration.factory = ({ config }) => {
  var _a;
  const configs = readGitHubIntegrationConfigs((_a = config.getOptionalConfigArray("integrations.github")) != null ? _a : []);
  return basicIntegrations(configs.map((c) => new _GitHubIntegration(c)), (i) => i.config.host);
};
function replaceGitHubUrlType(url, type) {
  return url.replace(/\/\/([^/]+)\/([^/]+)\/([^/]+)\/(blob|tree|edit)\//, (_, host, owner, repo) => {
    return `//${host}/${owner}/${repo}/${type}/`;
  });
}

const GITLAB_HOST = "gitlab.com";
const GITLAB_API_BASE_URL = "https://gitlab.com/api/v4";
function readGitLabIntegrationConfig(config) {
  const host = config.getString("host");
  let apiBaseUrl = config.getOptionalString("apiBaseUrl");
  const token = config.getOptionalString("token");
  let baseUrl = config.getOptionalString("baseUrl");
  if (apiBaseUrl) {
    apiBaseUrl = trimEnd(apiBaseUrl, "/");
  } else if (host === GITLAB_HOST) {
    apiBaseUrl = GITLAB_API_BASE_URL;
  }
  if (baseUrl) {
    baseUrl = trimEnd(baseUrl, "/");
  } else {
    baseUrl = `https://${host}`;
  }
  if (!isValidHost(host)) {
    throw new Error(`Invalid GitLab integration config, '${host}' is not a valid host`);
  } else if (!apiBaseUrl || !isValidUrl(apiBaseUrl)) {
    throw new Error(`Invalid GitLab integration config, '${apiBaseUrl}' is not a valid apiBaseUrl`);
  } else if (!isValidUrl(baseUrl)) {
    throw new Error(`Invalid GitLab integration config, '${baseUrl}' is not a valid baseUrl`);
  }
  return { host, token, apiBaseUrl, baseUrl };
}
function readGitLabIntegrationConfigs(configs) {
  const result = configs.map(readGitLabIntegrationConfig);
  if (!result.some((c) => c.host === GITLAB_HOST)) {
    result.push({
      host: GITLAB_HOST,
      apiBaseUrl: GITLAB_API_BASE_URL,
      baseUrl: `https://${GITLAB_HOST}`
    });
  }
  return result;
}

async function getGitLabFileFetchUrl(url, config) {
  if (url.includes("/-/blob/")) {
    const projectID = await getProjectId(url, config);
    return buildProjectUrl(url, projectID).toString();
  }
  return buildRawUrl(url).toString();
}
function getGitLabRequestOptions(config) {
  const { token = "" } = config;
  return {
    headers: {
      "PRIVATE-TOKEN": token
    }
  };
}
function buildRawUrl(target) {
  try {
    const url = new URL(target);
    const splitPath = url.pathname.split("/").filter(Boolean);
    const blobIndex = splitPath.indexOf("blob", 2);
    if (blobIndex < 2 || blobIndex === splitPath.length - 1) {
      throw new InputError("Wrong GitLab URL");
    }
    const repoPath = splitPath.slice(0, blobIndex);
    const restOfPath = splitPath.slice(blobIndex + 1);
    if (!restOfPath.join("/").match(/\.(yaml|yml)$/)) {
      throw new InputError("Wrong GitLab URL");
    }
    url.pathname = [...repoPath, "raw", ...restOfPath].join("/");
    return url;
  } catch (e) {
    throw new InputError(`Incorrect url: ${target}, ${e}`);
  }
}
function buildProjectUrl(target, projectID) {
  try {
    const url = new URL(target);
    const branchAndFilePath = url.pathname.split("/-/blob/")[1];
    const [branch, ...filePath] = branchAndFilePath.split("/");
    url.pathname = [
      "/api/v4/projects",
      projectID,
      "repository/files",
      encodeURIComponent(decodeURIComponent(filePath.join("/"))),
      "raw"
    ].join("/");
    url.search = `?ref=${branch}`;
    return url;
  } catch (e) {
    throw new Error(`Incorrect url: ${target}, ${e}`);
  }
}
async function getProjectId(target, config) {
  const url = new URL(target);
  if (!url.pathname.includes("/-/blob/")) {
    throw new Error("Please provide full path to yaml file from GitLab");
  }
  try {
    const repo = url.pathname.split("/-/blob/")[0];
    const repoIDLookup = new URL(`${url.origin}/api/v4/projects/${encodeURIComponent(repo.replace(/^\//, ""))}`);
    const response = await fetch(repoIDLookup.toString(), getGitLabRequestOptions(config));
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`GitLab Error '${data.error}', ${data.error_description}`);
    }
    return Number(data.id);
  } catch (e) {
    throw new Error(`Could not get GitLab project ID for: ${target}, ${e}`);
  }
}

const _GitLabIntegration = class {
  constructor(integrationConfig) {
    this.integrationConfig = integrationConfig;
  }
  get type() {
    return "gitlab";
  }
  get title() {
    return this.integrationConfig.host;
  }
  get config() {
    return this.integrationConfig;
  }
  resolveUrl(options) {
    return defaultScmResolveUrl(options);
  }
  resolveEditUrl(url) {
    return replaceGitLabUrlType(url, "edit");
  }
};
let GitLabIntegration = _GitLabIntegration;
GitLabIntegration.factory = ({ config }) => {
  var _a;
  const configs = readGitLabIntegrationConfigs((_a = config.getOptionalConfigArray("integrations.gitlab")) != null ? _a : []);
  return basicIntegrations(configs.map((c) => new _GitLabIntegration(c)), (i) => i.config.host);
};
function replaceGitLabUrlType(url, type) {
  return url.replace(/\/\-\/(blob|tree|edit)\//, `/-/${type}/`);
}

function readGoogleGcsIntegrationConfig(config) {
  if (!config) {
    return {};
  }
  if (!config.has("clientEmail") && !config.has("privateKey")) {
    return {};
  }
  const privateKey = config.getString("privateKey").split("\\n").join("\n");
  const clientEmail = config.getString("clientEmail");
  return { clientEmail, privateKey };
}

class ScmIntegrations {
  static fromConfig(config) {
    return new ScmIntegrations({
      awsS3: AwsS3Integration.factory({ config }),
      azure: AzureIntegration.factory({ config }),
      bitbucket: BitbucketIntegration.factory({ config }),
      bitbucketCloud: BitbucketCloudIntegration.factory({ config }),
      bitbucketServer: BitbucketServerIntegration.factory({ config }),
      gerrit: GerritIntegration.factory({ config }),
      github: GitHubIntegration.factory({ config }),
      gitlab: GitLabIntegration.factory({ config })
    });
  }
  constructor(integrationsByType) {
    this.byType = integrationsByType;
  }
  get awsS3() {
    return this.byType.awsS3;
  }
  get azure() {
    return this.byType.azure;
  }
  get bitbucket() {
    return this.byType.bitbucket;
  }
  get bitbucketCloud() {
    return this.byType.bitbucketCloud;
  }
  get bitbucketServer() {
    return this.byType.bitbucketServer;
  }
  get gerrit() {
    return this.byType.gerrit;
  }
  get github() {
    return this.byType.github;
  }
  get gitlab() {
    return this.byType.gitlab;
  }
  list() {
    return Object.values(this.byType).flatMap((i) => i.list());
  }
  byUrl(url) {
    return Object.values(this.byType).map((i) => i.byUrl(url)).find(Boolean);
  }
  byHost(host) {
    return Object.values(this.byType).map((i) => i.byHost(host)).find(Boolean);
  }
  resolveUrl(options) {
    const integration = this.byUrl(options.base);
    if (!integration) {
      return defaultScmResolveUrl(options);
    }
    return integration.resolveUrl(options);
  }
  resolveEditUrl(url) {
    const integration = this.byUrl(url);
    if (!integration) {
      return url;
    }
    return integration.resolveEditUrl(url);
  }
}

export { AwsS3Integration, AzureIntegration, BitbucketCloudIntegration, BitbucketIntegration, BitbucketServerIntegration, DefaultGithubCredentialsProvider, GerritIntegration, GitHubIntegration, GitLabIntegration, GithubAppCredentialsMux, ScmIntegrations, SingleInstanceGithubCredentialsProvider, defaultScmResolveUrl, getAzureCommitsUrl, getAzureDownloadUrl, getAzureFileFetchUrl, getAzureRequestOptions, getBitbucketCloudDefaultBranch, getBitbucketCloudDownloadUrl, getBitbucketCloudFileFetchUrl, getBitbucketCloudRequestOptions, getBitbucketDefaultBranch, getBitbucketDownloadUrl, getBitbucketFileFetchUrl, getBitbucketRequestOptions, getBitbucketServerDefaultBranch, getBitbucketServerDownloadUrl, getBitbucketServerFileFetchUrl, getBitbucketServerRequestOptions, getGerritBranchApiUrl, getGerritCloneRepoUrl, getGerritFileContentsApiUrl, getGerritProjectsApiUrl, getGerritRequestOptions, getGitHubFileFetchUrl, getGitHubRequestOptions, getGitLabFileFetchUrl, getGitLabRequestOptions, parseGerritGitilesUrl, parseGerritJsonResponse, readAwsS3IntegrationConfig, readAwsS3IntegrationConfigs, readAzureIntegrationConfig, readAzureIntegrationConfigs, readBitbucketCloudIntegrationConfig, readBitbucketCloudIntegrationConfigs, readBitbucketIntegrationConfig, readBitbucketIntegrationConfigs, readBitbucketServerIntegrationConfig, readBitbucketServerIntegrationConfigs, readGerritIntegrationConfig, readGerritIntegrationConfigs, readGitHubIntegrationConfig, readGitHubIntegrationConfigs, readGitLabIntegrationConfig, readGitLabIntegrationConfigs, readGoogleGcsIntegrationConfig, replaceGitHubUrlType, replaceGitLabUrlType };
//# sourceMappingURL=index.esm.js.map
