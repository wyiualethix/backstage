'use strict';

var index = require('./index-a5d56062.cjs.js');
var eslint = require('eslint');
var path = require('path');
var fs = require('fs-extra');
var cliCommon = require('@backstage/cli-common');
var PackageGraph = require('./PackageGraph-89852111.cjs.js');
require('commander');
require('chalk');
require('semver');
require('@backstage/errors');
require('@manypkg/get-packages');
require('child_process');
require('util');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);

function isTestPath(filePath) {
  if (!cliCommon.isChildPath(path.join(index.paths.targetDir, "src"), filePath)) {
    return true;
  }
  const name = path.basename(filePath);
  return name.startsWith("setupTests.") || name.includes(".test.") || name.includes(".stories.");
}
async function command() {
  const pkgJsonPath = index.paths.resolveTarget("package.json");
  const pkg = await fs__default["default"].readJson(pkgJsonPath);
  if (pkg.workspaces) {
    throw new Error("Adding dependencies to the workspace root is not supported");
  }
  const packages = await PackageGraph.PackageGraph.listTargetPackages();
  const localPackageVersions = new Map(packages.map((p) => [p.packageJson.name, p.packageJson.version]));
  const eslint$1 = new eslint.ESLint({
    cwd: index.paths.targetDir,
    overrideConfig: {
      plugins: ["monorepo"],
      rules: {
        "import/no-extraneous-dependencies": [
          "error",
          {
            devDependencies: [
              `!${path.join(index.paths.targetDir, "src/**")}`,
              path.join(index.paths.targetDir, "src/**/*.test.*"),
              path.join(index.paths.targetDir, "src/**/*.stories.*"),
              path.join(index.paths.targetDir, "src/setupTests.*")
            ],
            optionalDependencies: true,
            peerDependencies: true,
            bundledDependencies: true
          }
        ]
      }
    },
    extensions: ["jsx", "ts", "tsx", "mjs", "cjs"]
  });
  const results = await eslint$1.lintFiles(["."]);
  const addedDeps = /* @__PURE__ */ new Set();
  const addedDevDeps = /* @__PURE__ */ new Set();
  const removedDevDeps = /* @__PURE__ */ new Set();
  for (const result of results) {
    for (const message of result.messages) {
      if (message.ruleId !== "import/no-extraneous-dependencies") {
        continue;
      }
      const match = message.message.match(/^'([^']*)' should be listed/);
      if (!match) {
        continue;
      }
      const packageName = match[1];
      if (!localPackageVersions.has(packageName)) {
        continue;
      }
      if (message.message.endsWith("not devDependencies.")) {
        addedDeps.add(packageName);
        removedDevDeps.add(packageName);
      } else if (isTestPath(result.filePath)) {
        addedDevDeps.add(packageName);
      } else {
        addedDeps.add(packageName);
      }
    }
  }
  if (addedDeps.size || addedDevDeps.size || removedDevDeps.size) {
    for (const name of addedDeps) {
      if (!pkg.dependencies) {
        pkg.dependencies = {};
      }
      pkg.dependencies[name] = `^${localPackageVersions.get(name)}`;
    }
    for (const name of addedDevDeps) {
      if (!pkg.devDependencies) {
        pkg.devDependencies = {};
      }
      pkg.devDependencies[name] = `^${localPackageVersions.get(name)}`;
    }
    for (const name of removedDevDeps) {
      delete pkg.devDependencies[name];
    }
    if (Object.keys(pkg.devDependencies).length === 0) {
      delete pkg.devDependencies;
    }
    if (pkg.dependencies) {
      pkg.dependencies = Object.fromEntries(Object.entries(pkg.dependencies).sort(([a], [b]) => a.localeCompare(b)));
    }
    if (pkg.devDependencies) {
      pkg.devDependencies = Object.fromEntries(Object.entries(pkg.devDependencies).sort(([a], [b]) => a.localeCompare(b)));
    }
    await fs__default["default"].writeJson(pkgJsonPath, pkg, { spaces: 2 });
  }
}

exports.command = command;
//# sourceMappingURL=fix-807e0935.cjs.js.map
