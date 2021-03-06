'use strict';

var index = require('./index-a5d56062.cjs.js');
var run = require('./run-3d0b00b7.cjs.js');
require('commander');
require('chalk');
require('fs-extra');
require('semver');
require('@backstage/cli-common');
require('@backstage/errors');
require('child_process');
require('util');

function includesAnyOf(hayStack, ...needles) {
  for (const needle of needles) {
    if (hayStack.includes(needle)) {
      return true;
    }
  }
  return false;
}
var test = async (_opts, cmd) => {
  let parent = cmd;
  while (parent.parent) {
    parent = parent.parent;
  }
  const allArgs = parent.args;
  const args = allArgs.slice(allArgs.indexOf("test") + 1);
  if (!includesAnyOf(args, "-c", "--config")) {
    args.push("--config", index.paths.resolveOwn("config/jest.js"));
  }
  if (!includesAnyOf(args, "--no-passWithNoTests", "--passWithNoTests=false")) {
    args.push("--passWithNoTests");
  }
  if (!process.env.CI && !args.includes("--coverage") && !includesAnyOf(args, "--no-watch", "--watch=false", "--watchAll=false") && !includesAnyOf(args, "--watch", "--watchAll")) {
    const isGitRepo = () => run.runCheck("git", "rev-parse", "--is-inside-work-tree");
    const isMercurialRepo = () => run.runCheck("hg", "--cwd", ".", "root");
    if (await isGitRepo() || await isMercurialRepo()) {
      args.push("--watch");
    } else {
      args.push("--watchAll");
    }
  }
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = "test";
  }
  if (!process.env.TZ) {
    process.env.TZ = "UTC";
  }
  await require("jest").run(args);
};

exports["default"] = test;
//# sourceMappingURL=test-d40d6d84.cjs.js.map
