'use strict';

var index = require('./index-a5d56062.cjs.js');
var eslint = require('eslint');
require('commander');
require('chalk');
require('fs-extra');
require('semver');
require('@backstage/cli-common');
require('@backstage/errors');

var lint = async (directories, opts) => {
  const eslint$1 = new eslint.ESLint({
    cwd: index.paths.targetDir,
    fix: opts.fix,
    extensions: ["js", "jsx", "ts", "tsx", "mjs", "cjs"]
  });
  const results = await eslint$1.lintFiles(directories.length ? directories : ["."]);
  if (opts.fix) {
    await eslint.ESLint.outputFixes(results);
  }
  const formatter = await eslint$1.loadFormatter(opts.format);
  if (opts.format === "eslint-formatter-friendly") {
    process.chdir(index.paths.targetRoot);
  }
  const resultText = formatter.format(results);
  if (resultText) {
    console.log(resultText);
    process.exit(1);
  }
};

exports["default"] = lint;
//# sourceMappingURL=lint-b7c189ac.cjs.js.map
