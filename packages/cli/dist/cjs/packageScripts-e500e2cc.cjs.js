'use strict';

var fs = require('fs-extra');
var path = require('path');
var PackageGraph = require('./PackageGraph-89852111.cjs.js');
var packageRoles = require('./packageRoles-d9141e1e.cjs.js');
require('@manypkg/get-packages');
require('./index-a5d56062.cjs.js');
require('commander');
require('chalk');
require('semver');
require('@backstage/cli-common');
require('@backstage/errors');
require('child_process');
require('util');
require('zod');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);

const configArgPattern = /--config[=\s][^\s$]+/;
const noStartRoles = ["cli", "common-library"];
async function command() {
  const packages = await PackageGraph.PackageGraph.listTargetPackages();
  await Promise.all(packages.map(async ({ dir, packageJson }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const role = packageRoles.getRoleFromPackage(packageJson);
    if (!role) {
      return;
    }
    const roleInfo = packageRoles.getRoleInfo(role);
    const hasStart = !noStartRoles.includes(role);
    const needsPack = !(roleInfo.output.includes("bundle") || role === "cli");
    const scripts = (_a = packageJson.scripts) != null ? _a : {};
    const startCmd = ["start"];
    if ((_b = scripts.start) == null ? void 0 : _b.includes("--check")) {
      startCmd.push("--check");
    }
    if ((_c = scripts.start) == null ? void 0 : _c.includes("--config")) {
      startCmd.push(...(_d = scripts.start.match(configArgPattern)) != null ? _d : []);
    }
    const buildCmd = ["build"];
    if ((_e = scripts.build) == null ? void 0 : _e.includes("--minify")) {
      buildCmd.push("--minify");
    }
    if ((_f = scripts.build) == null ? void 0 : _f.includes("--experimental-type-build")) {
      buildCmd.push("--experimental-type-build");
    }
    if ((_g = scripts.build) == null ? void 0 : _g.includes("--config")) {
      buildCmd.push(...(_h = scripts.build.match(configArgPattern)) != null ? _h : []);
    }
    const testCmd = ["test"];
    if ((_i = scripts.test) == null ? void 0 : _i.startsWith("backstage-cli test")) {
      const args = scripts.test.slice("backstage-cli test".length).split(" ").filter(Boolean);
      if (args.includes("--passWithNoTests")) {
        args.splice(args.indexOf("--passWithNoTests"), 1);
      }
      testCmd.push(...args);
    }
    const expectedScripts = {
      ...hasStart && {
        start: `backstage-cli package ${startCmd.join(" ")}`
      },
      build: `backstage-cli package ${buildCmd.join(" ")}`,
      lint: "backstage-cli package lint",
      test: `backstage-cli package ${testCmd.join(" ")}`,
      clean: "backstage-cli package clean",
      ...needsPack && {
        postpack: "backstage-cli package postpack",
        prepack: "backstage-cli package prepack"
      }
    };
    let changed = false;
    const currentScripts = packageJson.scripts = packageJson.scripts || {};
    for (const [name, value] of Object.entries(expectedScripts)) {
      const currentScript = currentScripts[name];
      const isMissing = !currentScript;
      const isDifferent = currentScript !== value;
      const isBackstageScript = currentScript == null ? void 0 : currentScript.includes("backstage-cli");
      if (isMissing || isDifferent && isBackstageScript) {
        changed = true;
        currentScripts[name] = value;
      }
    }
    if (changed) {
      console.log(`Updating scripts for ${packageJson.name}`);
      await fs__default["default"].writeJson(path.resolve(dir, "package.json"), packageJson, {
        spaces: 2
      });
    }
  }));
}

exports.command = command;
//# sourceMappingURL=packageScripts-e500e2cc.cjs.js.map
