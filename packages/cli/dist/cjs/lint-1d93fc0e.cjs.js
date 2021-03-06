'use strict';

var Lockfile = require('./Lockfile-48dc675e.cjs.js');
require('minimatch');
require('@manypkg/get-packages');
require('./run-3d0b00b7.cjs.js');
require('chalk');
var index = require('./index-a5d56062.cjs.js');
var partition = require('lodash/partition');
require('fs-extra');
require('semver');
require('@yarnpkg/parsers');
require('@yarnpkg/lockfile');
require('child_process');
require('util');
require('@backstage/errors');
require('commander');
require('@backstage/cli-common');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var partition__default = /*#__PURE__*/_interopDefaultLegacy(partition);

const INCLUDED = [/^@backstage\//];
const includedFilter = (name) => INCLUDED.some((pattern) => pattern.test(name));
const FORBID_DUPLICATES = [
  /^@backstage\/core-app-api$/,
  /^@backstage\/plugin-/
];
const ALLOW_DUPLICATES = [
  /^@backstage\/core-plugin-api$/,
  /^@backstage\/plugin-.*-react$/,
  /^@backstage\/plugin-.*-node$/,
  /^@backstage\/plugin-.*-common$/
];
const forbiddenDuplicatesFilter = (name) => FORBID_DUPLICATES.some((pattern) => pattern.test(name)) && !ALLOW_DUPLICATES.some((pattern) => pattern.test(name));
var lint = async (cmd) => {
  const fix = Boolean(cmd.fix);
  let success = true;
  const lockfile = await Lockfile.Lockfile.load(index.paths.resolveTargetRoot("yarn.lock"));
  const result = lockfile.analyze({
    filter: includedFilter
  });
  logArray(result.invalidRanges, "The following packages versions are invalid and can't be analyzed:", (e) => `  ${e.name} @ ${e.range}`);
  if (fix) {
    lockfile.replaceVersions(result.newVersions);
    await lockfile.save();
  } else {
    const [newVersionsForbidden, newVersionsAllowed] = partition__default["default"](result.newVersions, ({ name }) => forbiddenDuplicatesFilter(name));
    if (newVersionsForbidden.length && !fix) {
      success = false;
    }
    logArray(newVersionsForbidden, "The following packages must be deduplicated, this can be done automatically with --fix", (e) => `  ${e.name} @ ${e.range} bumped from ${e.oldVersion} to ${e.newVersion}`);
    logArray(newVersionsAllowed, "The following packages can be deduplicated, this can be done automatically with --fix", (e) => `  ${e.name} @ ${e.range} bumped from ${e.oldVersion} to ${e.newVersion}`);
  }
  const [newRangesForbidden, newRangesAllowed] = partition__default["default"](result.newRanges, ({ name }) => forbiddenDuplicatesFilter(name));
  if (newRangesForbidden.length) {
    success = false;
  }
  logArray(newRangesForbidden, "The following packages must be deduplicated by updating dependencies in package.json", (e) => `  ${e.name} @ ${e.oldRange} should be changed to ${e.newRange}`);
  logArray(newRangesAllowed, "The following packages can be deduplicated by updating dependencies in package.json", (e) => `  ${e.name} @ ${e.oldRange} should be changed to ${e.newRange}`);
  if (!success) {
    throw new Error("Failed versioning check");
  }
};
function logArray(arr, header, each) {
  if (arr.length === 0) {
    return;
  }
  console.log(header);
  console.log();
  for (const e of arr) {
    console.log(each(e));
  }
  console.log();
}

exports["default"] = lint;
exports.forbiddenDuplicatesFilter = forbiddenDuplicatesFilter;
exports.includedFilter = includedFilter;
//# sourceMappingURL=lint-1d93fc0e.cjs.js.map
