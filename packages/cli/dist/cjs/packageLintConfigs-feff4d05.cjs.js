'use strict';

var fs = require('fs-extra');
var path = require('path');
var PackageGraph = require('./PackageGraph-89852111.cjs.js');
var run = require('./run-3d0b00b7.cjs.js');
require('@manypkg/get-packages');
require('./index-a5d56062.cjs.js');
require('commander');
require('chalk');
require('semver');
require('@backstage/cli-common');
require('@backstage/errors');
require('child_process');
require('util');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);

const PREFIX = `module.exports = require('@backstage/cli/config/eslint-factory')`;
async function command() {
  const packages = await PackageGraph.PackageGraph.listTargetPackages();
  const oldConfigs = [
    require.resolve("@backstage/cli/config/eslint.js"),
    require.resolve("@backstage/cli/config/eslint.backend.js")
  ];
  const configPaths = new Array();
  await Promise.all(packages.map(async ({ dir, packageJson }) => {
    var _a;
    const configPath = path.resolve(dir, ".eslintrc.js");
    if (!await fs__default["default"].pathExists(configPath)) {
      console.log(`Skipping ${packageJson.name}, missing .eslintrc.js`);
      return;
    }
    let existingConfig;
    try {
      existingConfig = require(configPath);
    } catch (error) {
      console.log(`Skipping ${packageJson.name}, failed to load .eslintrc.js, ${error}`);
      return;
    }
    const extendsArray = (_a = existingConfig.extends) != null ? _a : [];
    const extendIndex = extendsArray.findIndex((p) => oldConfigs.includes(p));
    if (extendIndex === -1) {
      console.log(`Skipping ${packageJson.name}, .eslintrc.js does not extend the legacy config`);
      return;
    }
    extendsArray.splice(extendIndex, 1);
    if (extendsArray.length === 0) {
      delete existingConfig.extends;
    }
    if (Object.keys(existingConfig).length > 0) {
      await fs__default["default"].writeFile(configPath, `${PREFIX}(__dirname, ${JSON.stringify(existingConfig, null, 2)});
`);
    } else {
      await fs__default["default"].writeFile(configPath, `${PREFIX}(__dirname);
`);
    }
    configPaths.push(configPath);
  }));
  let hasPrettier = false;
  try {
    require.resolve("prettier");
    hasPrettier = true;
  } catch {
  }
  if (hasPrettier) {
    await run.runPlain("prettier", "--write", ...configPaths);
  }
}

exports.command = command;
//# sourceMappingURL=packageLintConfigs-feff4d05.cjs.js.map
