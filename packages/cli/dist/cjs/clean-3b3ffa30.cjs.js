'use strict';

var fs = require('fs-extra');
var index = require('./index-a5d56062.cjs.js');
require('commander');
require('chalk');
require('semver');
require('@backstage/cli-common');
require('@backstage/errors');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);

async function clean() {
  await fs__default["default"].remove(index.paths.resolveTarget("dist"));
  await fs__default["default"].remove(index.paths.resolveTarget("dist-types"));
  await fs__default["default"].remove(index.paths.resolveTarget("coverage"));
}

exports["default"] = clean;
//# sourceMappingURL=clean-3b3ffa30.cjs.js.map
