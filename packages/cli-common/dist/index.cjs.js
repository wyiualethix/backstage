'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');
var path = require('path');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);

function findRootPath(searchDir, filterFunc) {
  let path$1 = searchDir;
  for (let i = 0; i < 1e3; i++) {
    const packagePath = path.resolve(path$1, "package.json");
    const exists = fs__default["default"].existsSync(packagePath);
    if (exists && filterFunc(packagePath)) {
      return path$1;
    }
    const newPath = path.dirname(path$1);
    if (newPath === path$1) {
      return void 0;
    }
    path$1 = newPath;
  }
  throw new Error(`Iteration limit reached when searching for root package.json at ${searchDir}`);
}
function findOwnDir(searchDir) {
  const path = findRootPath(searchDir, () => true);
  if (!path) {
    throw new Error(`No package.json found while searching for package root of ${searchDir}`);
  }
  return path;
}
function findOwnRootDir(ownDir) {
  const isLocal = fs__default["default"].existsSync(path.resolve(ownDir, "src"));
  if (!isLocal) {
    throw new Error("Tried to access monorepo package root dir outside of Backstage repository");
  }
  return path.resolve(ownDir, "../..");
}
function findPaths(searchDir) {
  const ownDir = findOwnDir(searchDir);
  const targetDir = fs__default["default"].realpathSync(process.cwd()).replace(/^[a-z]:/, (str) => str.toLocaleUpperCase("en-US"));
  let ownRoot = "";
  const getOwnRoot = () => {
    if (!ownRoot) {
      ownRoot = findOwnRootDir(ownDir);
    }
    return ownRoot;
  };
  let targetRoot = "";
  const getTargetRoot = () => {
    var _a;
    if (!targetRoot) {
      targetRoot = (_a = findRootPath(targetDir, (path) => {
        var _a2;
        try {
          const content = fs__default["default"].readFileSync(path, "utf8");
          const data = JSON.parse(content);
          return Boolean((_a2 = data.workspaces) == null ? void 0 : _a2.packages);
        } catch (error) {
          throw new Error(`Failed to parse package.json file while searching for root, ${error}`);
        }
      })) != null ? _a : targetDir;
    }
    return targetRoot;
  };
  return {
    ownDir,
    get ownRoot() {
      return getOwnRoot();
    },
    targetDir,
    get targetRoot() {
      return getTargetRoot();
    },
    resolveOwn: (...paths) => path.resolve(ownDir, ...paths),
    resolveOwnRoot: (...paths) => path.resolve(getOwnRoot(), ...paths),
    resolveTarget: (...paths) => path.resolve(targetDir, ...paths),
    resolveTargetRoot: (...paths) => path.resolve(getTargetRoot(), ...paths)
  };
}
const BACKSTAGE_JSON = "backstage.json";

function isChildPath(base, path$1) {
  const relativePath = path.relative(base, path$1);
  if (relativePath === "") {
    return true;
  }
  const outsideBase = relativePath.startsWith("..");
  const differentDrive = path.isAbsolute(relativePath);
  return !outsideBase && !differentDrive;
}

exports.BACKSTAGE_JSON = BACKSTAGE_JSON;
exports.findPaths = findPaths;
exports.isChildPath = isChildPath;
//# sourceMappingURL=index.cjs.js.map
