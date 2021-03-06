'use strict';

var fs = require('fs-extra');
var chalk = require('chalk');
var ora = require('ora');
var semver = require('semver');
var minimatch = require('minimatch');
var errors = require('@backstage/errors');
var path = require('path');
var run = require('./run-3d0b00b7.cjs.js');
var index = require('./index-a5d56062.cjs.js');
var Lockfile = require('./Lockfile-48dc675e.cjs.js');
var packages = require('./packages-9866e85e.cjs.js');
var lint = require('./lint-1d93fc0e.cjs.js');
var cliCommon = require('@backstage/cli-common');
var parallel = require('./parallel-8286d3fa.cjs.js');
var releaseManifests = require('@backstage/release-manifests');
require('global-agent/bootstrap');
require('child_process');
require('util');
require('commander');
require('@yarnpkg/parsers');
require('@yarnpkg/lockfile');
require('@manypkg/get-packages');
require('lodash/partition');
require('os');
require('worker_threads');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);
var ora__default = /*#__PURE__*/_interopDefaultLegacy(ora);
var semver__default = /*#__PURE__*/_interopDefaultLegacy(semver);
var minimatch__default = /*#__PURE__*/_interopDefaultLegacy(minimatch);

const DEP_TYPES = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies"
];
const DEFAULT_PATTERN_GLOB = "@backstage/*";
var bump = async (opts) => {
  var _a;
  const lockfilePath = index.paths.resolveTargetRoot("yarn.lock");
  const lockfile = await Lockfile.Lockfile.load(lockfilePath);
  let pattern = opts.pattern;
  if (!pattern) {
    console.log(`Using default pattern glob ${DEFAULT_PATTERN_GLOB}`);
    pattern = DEFAULT_PATTERN_GLOB;
  } else {
    console.log(`Using custom pattern glob ${pattern}`);
  }
  let findTargetVersion;
  let releaseManifest;
  if (semver__default["default"].valid(opts.release)) {
    releaseManifest = await releaseManifests.getManifestByVersion({ version: opts.release });
    findTargetVersion = createStrictVersionFinder({
      releaseManifest
    });
  } else {
    if (opts.release === "next") {
      const next = await releaseManifests.getManifestByReleaseLine({
        releaseLine: "next"
      });
      const main = await releaseManifests.getManifestByReleaseLine({
        releaseLine: "main"
      });
      releaseManifest = semver__default["default"].gt(next.releaseVersion, main.releaseVersion) ? next : main;
    } else {
      releaseManifest = await releaseManifests.getManifestByReleaseLine({
        releaseLine: opts.release
      });
    }
    findTargetVersion = createVersionFinder({
      releaseLine: opts.releaseLine,
      releaseManifest
    });
  }
  const dependencyMap = await packages.mapDependencies(index.paths.targetDir, pattern);
  const versionBumps = /* @__PURE__ */ new Map();
  const unlocked = Array();
  await parallel.runParallelWorkers({
    parallelismFactor: 4,
    items: dependencyMap.entries(),
    async worker([name, pkgs]) {
      var _a2, _b;
      let target;
      try {
        target = await findTargetVersion(name);
      } catch (error) {
        if (errors.isError(error) && error.name === "NotFoundError") {
          console.log(`Package info not found, ignoring package ${name}`);
          return;
        }
        throw error;
      }
      for (const pkg of pkgs) {
        if (semver__default["default"].satisfies(target, pkg.range)) {
          if (((_a2 = semver__default["default"].minVersion(pkg.range)) == null ? void 0 : _a2.version) !== target) {
            unlocked.push({ name, range: pkg.range, target });
          }
          continue;
        }
        versionBumps.set(pkg.name, ((_b = versionBumps.get(pkg.name)) != null ? _b : []).concat({
          name,
          location: pkg.location,
          range: `^${target}`,
          target
        }));
      }
    }
  });
  const filter = (name) => minimatch__default["default"](name, pattern);
  await parallel.runParallelWorkers({
    parallelismFactor: 4,
    items: lockfile.keys(),
    async worker(name) {
      var _a2;
      if (!filter(name)) {
        return;
      }
      let target;
      try {
        target = await findTargetVersion(name);
      } catch (error) {
        if (errors.isError(error) && error.name === "NotFoundError") {
          console.log(`Package info not found, ignoring package ${name}`);
          return;
        }
        throw error;
      }
      for (const entry of (_a2 = lockfile.get(name)) != null ? _a2 : []) {
        if (!semver__default["default"].satisfies(target, entry.range)) {
          continue;
        }
        unlocked.push({ name, range: entry.range, target });
      }
    }
  });
  console.log();
  if (versionBumps.size === 0 && unlocked.length === 0) {
    console.log(chalk__default["default"].green("All Backstage packages are up to date!"));
  } else {
    console.log(chalk__default["default"].yellow("Some packages are outdated, updating"));
    console.log();
    if (unlocked.length > 0) {
      const removed = /* @__PURE__ */ new Set();
      for (const { name, range, target } of unlocked) {
        const existingEntry = (_a = lockfile.get(name)) == null ? void 0 : _a.find((e) => e.range === range);
        if ((existingEntry == null ? void 0 : existingEntry.version) === target) {
          continue;
        }
        const key = JSON.stringify({ name, range });
        if (!removed.has(key)) {
          removed.add(key);
          console.log(`${chalk__default["default"].magenta("unlocking")} ${name}@${chalk__default["default"].yellow(range)} ~> ${chalk__default["default"].yellow(target)}`);
          lockfile.remove(name, range);
        }
      }
      await lockfile.save();
    }
    const breakingUpdates = /* @__PURE__ */ new Map();
    await parallel.runParallelWorkers({
      parallelismFactor: 4,
      items: versionBumps.entries(),
      async worker([name, deps]) {
        var _a2;
        const pkgPath = path.resolve(deps[0].location, "package.json");
        const pkgJson = await fs__default["default"].readJson(pkgPath);
        for (const dep of deps) {
          console.log(`${chalk__default["default"].cyan("bumping")} ${dep.name} in ${chalk__default["default"].cyan(name)} to ${chalk__default["default"].yellow(dep.range)}`);
          for (const depType of DEP_TYPES) {
            if (depType in pkgJson && dep.name in pkgJson[depType]) {
              const oldRange = pkgJson[depType][dep.name];
              pkgJson[depType][dep.name] = dep.range;
              const lockfileEntry = (_a2 = lockfile.get(dep.name)) == null ? void 0 : _a2.find((entry) => entry.range === oldRange);
              if (lockfileEntry) {
                const from = lockfileEntry.version;
                const to = dep.target;
                if (!semver__default["default"].satisfies(to, `^${from}`)) {
                  breakingUpdates.set(dep.name, { from, to });
                }
              }
            }
          }
        }
        await fs__default["default"].writeJson(pkgPath, pkgJson, { spaces: 2 });
      }
    });
    console.log();
    if (pattern === DEFAULT_PATTERN_GLOB) {
      await bumpBackstageJsonVersion(releaseManifest.releaseVersion);
    } else {
      console.log(chalk__default["default"].yellow(`Skipping backstage.json update as custom pattern is used`));
    }
    await runYarnInstall();
    if (breakingUpdates.size > 0) {
      console.log();
      console.log(chalk__default["default"].yellow("\u26A0\uFE0F  The following packages may have breaking changes:"));
      console.log();
      for (const [name, { from, to }] of Array.from(breakingUpdates.entries()).sort()) {
        console.log(`  ${chalk__default["default"].yellow(name)} : ${chalk__default["default"].yellow(from)} ~> ${chalk__default["default"].yellow(to)}`);
        let path;
        if (name.startsWith("@backstage/plugin-")) {
          path = `plugins/${name.replace("@backstage/plugin-", "")}`;
        } else if (name.startsWith("@backstage/")) {
          path = `packages/${name.replace("@backstage/", "")}`;
        }
        if (path) {
          console.log(`    https://github.com/backstage/backstage/blob/master/${path}/CHANGELOG.md`);
        }
        console.log();
      }
    } else {
      console.log();
    }
    console.log(chalk__default["default"].green("Version bump complete!"));
  }
  console.log();
  const dedupLockfile = await Lockfile.Lockfile.load(lockfilePath);
  const result = dedupLockfile.analyze({
    filter
  });
  if (result.newVersions.length > 0) {
    throw new Error("Duplicate versions present after package bump");
  }
  const forbiddenNewRanges = result.newRanges.filter(({ name }) => lint.forbiddenDuplicatesFilter(name));
  if (forbiddenNewRanges.length > 0) {
    throw new Error(`Version bump failed for ${forbiddenNewRanges.map((i) => i.name).join(", ")}`);
  }
};
function createStrictVersionFinder(options) {
  const releasePackages = new Map(options.releaseManifest.packages.map((p) => [p.name, p.version]));
  return async function findTargetVersion(name) {
    console.log(`Checking for updates of ${name}`);
    const manifestVersion = releasePackages.get(name);
    if (manifestVersion) {
      return manifestVersion;
    }
    throw new errors.NotFoundError(`Package ${name} not found in release manifest`);
  };
}
function createVersionFinder(options) {
  const {
    releaseLine = "latest",
    packageInfoFetcher = packages.fetchPackageInfo,
    releaseManifest
  } = options;
  const distTag = releaseLine === "main" ? "latest" : releaseLine;
  const found = /* @__PURE__ */ new Map();
  const releasePackages = new Map(releaseManifest == null ? void 0 : releaseManifest.packages.map((p) => [p.name, p.version]));
  return async function findTargetVersion(name) {
    const existing = found.get(name);
    if (existing) {
      return existing;
    }
    console.log(`Checking for updates of ${name}`);
    const manifestVersion = releasePackages.get(name);
    if (manifestVersion) {
      return manifestVersion;
    }
    const info = await packageInfoFetcher(name);
    const latestVersion = info["dist-tags"].latest;
    if (!latestVersion) {
      throw new Error(`No target 'latest' version found for ${name}`);
    }
    const taggedVersion = info["dist-tags"][distTag];
    if (distTag === "latest" || !taggedVersion) {
      found.set(name, latestVersion);
      return latestVersion;
    }
    const latestVersionDateStr = info.time[latestVersion];
    const taggedVersionDateStr = info.time[taggedVersion];
    if (!latestVersionDateStr) {
      throw new Error(`No time available for version '${latestVersion}' of ${name}`);
    }
    if (!taggedVersionDateStr) {
      throw new Error(`No time available for version '${taggedVersion}' of ${name}`);
    }
    const latestVersionRelease = new Date(latestVersionDateStr).getTime();
    const taggedVersionRelease = new Date(taggedVersionDateStr).getTime();
    if (latestVersionRelease > taggedVersionRelease) {
      found.set(name, latestVersion);
      return latestVersion;
    }
    found.set(name, taggedVersion);
    return taggedVersion;
  };
}
async function bumpBackstageJsonVersion(version) {
  const backstageJsonPath = index.paths.resolveTargetRoot(cliCommon.BACKSTAGE_JSON);
  const backstageJson = await fs__default["default"].readJSON(backstageJsonPath).catch((e) => {
    if (e.code === "ENOENT") {
      return;
    }
    throw e;
  });
  const prevVersion = backstageJson == null ? void 0 : backstageJson.version;
  if (prevVersion === version) {
    return;
  }
  const { yellow, cyan, green } = chalk__default["default"];
  if (prevVersion) {
    const from = encodeURIComponent(prevVersion);
    const to = encodeURIComponent(version);
    const link = `https://backstage.github.io/upgrade-helper/?from=${from}&to=${to}`;
    console.log(yellow(`Upgraded from release ${green(prevVersion)} to ${green(version)}, please review these template changes:`));
    console.log();
    console.log(`  ${cyan(link)}`);
    console.log();
  } else {
    console.log(yellow(`Your project is now at version ${version}, which has been written to ${cliCommon.BACKSTAGE_JSON}`));
  }
  await fs__default["default"].writeJson(backstageJsonPath, { ...backstageJson, version }, {
    spaces: 2,
    encoding: "utf8"
  });
}
async function runYarnInstall() {
  const spinner = ora__default["default"]({
    prefixText: `Running ${chalk__default["default"].blue("yarn install")} to install new versions`,
    spinner: "arc",
    color: "green"
  }).start();
  const installOutput = new Array();
  try {
    await run.run("yarn", ["install"], {
      env: {
        FORCE_COLOR: "true",
        ...Object.fromEntries(Object.entries(process.env).map(([name, value]) => name.startsWith("npm_") ? [name, void 0] : [name, value]))
      },
      stdoutLogFunc: (data) => installOutput.push(data),
      stderrLogFunc: (data) => installOutput.push(data)
    });
    spinner.succeed();
  } catch (error) {
    spinner.fail();
    process.stdout.write(Buffer.concat(installOutput));
    throw error;
  }
}

exports.bumpBackstageJsonVersion = bumpBackstageJsonVersion;
exports.createStrictVersionFinder = createStrictVersionFinder;
exports.createVersionFinder = createVersionFinder;
exports["default"] = bump;
//# sourceMappingURL=bump-9f978731.cjs.js.map
