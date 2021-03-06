'use strict';

var fs = require('fs-extra');
require('semver');
require('@yarnpkg/parsers');
require('@yarnpkg/lockfile');
var packages = require('./packages-9866e85e.cjs.js');
var index = require('./index-a5d56062.cjs.js');
var chalk = require('chalk');
var sortBy = require('lodash/sortBy');
var groupBy = require('lodash/groupBy');
var run = require('./run-3d0b00b7.cjs.js');
require('minimatch');
require('@manypkg/get-packages');
require('commander');
require('@backstage/cli-common');
require('@backstage/errors');
require('child_process');
require('util');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);
var sortBy__default = /*#__PURE__*/_interopDefaultLegacy(sortBy);
var groupBy__default = /*#__PURE__*/_interopDefaultLegacy(groupBy);

function createStepDefinition(config) {
  return config;
}

class AppRouteStep {
  constructor(data) {
    this.data = data;
  }
  async run() {
    var _a;
    const { path, element, packageName } = this.data;
    const appTsxPath = index.paths.resolveTargetRoot("packages/app/src/App.tsx");
    const contents = await fs__default["default"].readFile(appTsxPath, "utf-8");
    let failed = false;
    const contentsWithRoute = contents.replace(/(\s*)<\/FlatRoutes>/, `$1  <Route path="${path}" element={${element}} />$1</FlatRoutes>`);
    if (contentsWithRoute === contents) {
      failed = true;
    }
    const componentName = (_a = element.match(/[A-Za-z0-9]+/)) == null ? void 0 : _a[0];
    if (!componentName) {
      throw new Error(`Could not find component name in ${element}`);
    }
    const contentsWithImport = contentsWithRoute.replace(/^import /m, `import { ${componentName} } from '${packageName}';
import `);
    if (contentsWithImport === contentsWithRoute) {
      failed = true;
    }
    if (failed) {
      console.log("Failed to automatically add a route to package/app/src/App.tsx");
      console.log(`Action needed, add the following:`);
      console.log(`1. import { ${componentName} } from '${packageName}';`);
      console.log(`2. <Route path="${path}" element={${element}} />`);
    } else {
      await fs__default["default"].writeFile(appTsxPath, contentsWithImport);
    }
  }
}
const appRoute = createStepDefinition({
  type: "app-route",
  deserialize(obj, pkg) {
    const { path, element } = obj;
    if (!path || typeof path !== "string") {
      throw new Error("Invalid install step, 'path' must be a string");
    }
    if (!element || typeof element !== "string") {
      throw new Error("Invalid install step, 'element' must be a string");
    }
    return new AppRouteStep({ path, element, packageName: pkg.name });
  },
  create(data) {
    return new AppRouteStep(data);
  }
});

class DependenciesStep {
  constructor(data) {
    this.data = data;
  }
  async run() {
    const { dependencies: dependencies2 } = this.data;
    const byTarget = groupBy__default["default"](dependencies2, "target");
    for (const [target, deps] of Object.entries(byTarget)) {
      const pkgPath = index.paths.resolveTargetRoot(target, "package.json");
      const pkgJson = await fs__default["default"].readJson(pkgPath);
      const depTypes = /* @__PURE__ */ new Set();
      for (const dep of deps) {
        depTypes.add(dep.type);
        pkgJson[dep.type][dep.name] = dep.query;
      }
      for (const depType of depTypes) {
        pkgJson[depType] = Object.fromEntries(sortBy__default["default"](Object.entries(pkgJson[depType]), ([key]) => key));
      }
      await fs__default["default"].writeJson(pkgPath, pkgJson, { spaces: 2 });
    }
    console.log();
    console.log(`Running ${chalk__default["default"].blue("yarn install")} to install new versions`);
    console.log();
    await run.run("yarn", ["install"]);
  }
}
const dependencies = createStepDefinition({
  type: "dependencies",
  deserialize() {
    throw new Error("The dependency step may not be defined in JSON");
  },
  create(data) {
    return new DependenciesStep(data);
  }
});

class MessageStep {
  constructor(data) {
    this.data = data;
  }
  async run() {
    console.log(this.data.message);
  }
}
const message = createStepDefinition({
  type: "message",
  deserialize(obj) {
    const { message: msg } = obj;
    if (!msg || typeof msg !== "string" && !Array.isArray(msg)) {
      throw new Error("Invalid install step, 'message' must be a string or array");
    }
    return new MessageStep({ message: [msg].flat().join("") });
  },
  create(data) {
    return new MessageStep(data);
  }
});

var stepDefinitionMap = /*#__PURE__*/Object.freeze({
  __proto__: null,
  appRoute: appRoute,
  dependencies: dependencies,
  message: message
});

const stepDefinitions = Object.values(stepDefinitionMap);
async function fetchPluginPackage(id) {
  const searchNames = [`@backstage/plugin-${id}`, `backstage-plugin-${id}`, id];
  for (const name of searchNames) {
    try {
      const packageInfo = await packages.fetchPackageInfo(name);
      return packageInfo;
    } catch (error) {
      if (error.name !== "NotFoundError") {
        throw error;
      }
    }
  }
  throw new index.NotFoundError(`No matching package found for '${id}', tried ${searchNames.join(", ")}`);
}
class PluginInstaller {
  constructor(steps) {
    this.steps = steps;
  }
  static async resolveSteps(pkg, versionToInstall) {
    var _a, _b;
    const steps = [];
    const dependencies$1 = [];
    dependencies$1.push({
      target: "packages/app",
      type: "dependencies",
      name: pkg.name,
      query: versionToInstall || `^${pkg.version}`
    });
    steps.push({
      type: "dependencies",
      step: dependencies.create({ dependencies: dependencies$1 })
    });
    for (const step of (_b = (_a = pkg.experimentalInstallationRecipe) == null ? void 0 : _a.steps) != null ? _b : []) {
      const { type } = step;
      const definition = stepDefinitions.find((d) => d.type === type);
      if (definition) {
        steps.push({
          type,
          step: definition.deserialize(step, pkg)
        });
      } else {
        throw new Error(`Unsupported step type: ${type}`);
      }
    }
    return steps;
  }
  async run() {
    for (const { type, step } of this.steps) {
      console.log(`Running step ${type}`);
      await step.run();
    }
  }
}
async function installPluginAndPeerPlugins(pkg) {
  const pluginDeps = /* @__PURE__ */ new Map();
  pluginDeps.set(pkg.name, { pkg });
  await loadPeerPluginDeps(pkg, pluginDeps);
  console.log(`Installing ${pkg.name} AND any peer plugin dependencies.`);
  for (const [_pluginDepName, pluginDep] of pluginDeps.entries()) {
    const { pkg: pluginDepPkg, versionToInstall } = pluginDep;
    console.log(`Installing plugin: ${pluginDepPkg.name}: ${versionToInstall || pluginDepPkg.version}`);
    const steps = await PluginInstaller.resolveSteps(pluginDepPkg, versionToInstall);
    const installer = new PluginInstaller(steps);
    await installer.run();
  }
}
async function loadPackageJson(plugin) {
  if (plugin.endsWith("package.json")) {
    return await fs__default["default"].readJson(plugin);
  }
  return await fetchPluginPackage(plugin);
}
async function loadPeerPluginDeps(pkg, pluginMap) {
  var _a, _b;
  for (const [pluginId, pluginVersion] of Object.entries((_b = (_a = pkg.experimentalInstallationRecipe) == null ? void 0 : _a.peerPluginDependencies) != null ? _b : {})) {
    const depPkg = await loadPackageJson(pluginId);
    if (!pluginMap.get(depPkg.name)) {
      pluginMap.set(depPkg.name, {
        pkg: depPkg,
        versionToInstall: pluginVersion
      });
      await loadPeerPluginDeps(depPkg, pluginMap);
    }
  }
}
var install = async (pluginId, cmd) => {
  const from = pluginId || (cmd == null ? void 0 : cmd.from);
  if (!from) {
    throw new Error("Missing both <plugin-id> or a package.json file path in the --from flag.");
  }
  const pkg = await loadPackageJson(from);
  await installPluginAndPeerPlugins(pkg);
};

exports["default"] = install;
//# sourceMappingURL=install-d962d8ff.cjs.js.map
