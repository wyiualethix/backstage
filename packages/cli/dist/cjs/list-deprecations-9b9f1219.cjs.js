'use strict';

var chalk = require('chalk');
var eslint = require('eslint');
var path = require('path');
var index = require('./index-a5d56062.cjs.js');
var PackageGraph = require('./PackageGraph-89852111.cjs.js');
require('commander');
require('fs-extra');
require('semver');
require('@backstage/cli-common');
require('@backstage/errors');
require('@manypkg/get-packages');
require('child_process');
require('util');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);

async function command(opts) {
  const packages = await PackageGraph.PackageGraph.listTargetPackages();
  const eslint$1 = new eslint.ESLint({
    cwd: index.paths.targetDir,
    overrideConfig: {
      plugins: ["deprecation"],
      rules: {
        "deprecation/deprecation": "error"
      },
      parserOptions: {
        project: [index.paths.resolveTargetRoot("tsconfig.json")]
      }
    },
    extensions: ["jsx", "ts", "tsx", "mjs", "cjs"]
  });
  const { stderr } = process;
  if (stderr.isTTY) {
    stderr.write("Initializing TypeScript...");
  }
  const deprecations = [];
  for (const [index$1, pkg] of packages.entries()) {
    const results = await eslint$1.lintFiles(path.join(pkg.dir, "src"));
    for (const result of results) {
      for (const message of result.messages) {
        if (message.ruleId !== "deprecation/deprecation") {
          continue;
        }
        const path$1 = path.relative(index.paths.targetRoot, result.filePath);
        deprecations.push({
          path: path$1,
          message: message.message,
          line: message.line,
          column: message.column
        });
      }
    }
    if (stderr.isTTY) {
      stderr.clearLine(0);
      stderr.cursorTo(0);
      stderr.write(`Scanning packages ${index$1 + 1}/${packages.length}`);
    }
  }
  if (stderr.isTTY) {
    stderr.clearLine(0);
    stderr.cursorTo(0);
  }
  if (opts.json) {
    console.log(JSON.stringify(deprecations, null, 2));
  } else {
    for (const d of deprecations) {
      const location = `${d.path}:${d.line}:${d.column}`;
      const wrappedMessage = d.message.replace(/\r?\n\s*/g, " ");
      console.log(`${location} - ${chalk__default["default"].yellow(wrappedMessage)}`);
    }
  }
  if (deprecations.length > 0) {
    process.exit(1);
  }
}

exports.command = command;
//# sourceMappingURL=list-deprecations-9b9f1219.cjs.js.map
