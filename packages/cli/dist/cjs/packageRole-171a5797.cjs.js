'use strict';

var fs = require('fs-extra');
var path = require('path');
var getPackages = require('@manypkg/get-packages');
var index = require('./index-a5d56062.cjs.js');
var packageRoles = require('./packageRoles-d9141e1e.cjs.js');
require('commander');
require('chalk');
require('semver');
require('@backstage/cli-common');
require('@backstage/errors');
require('zod');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);

var packageRole = async () => {
  const { packages } = await getPackages.getPackages(index.paths.targetDir);
  await Promise.all(packages.map(async ({ dir, packageJson: pkg }) => {
    const { name } = pkg;
    const existingRole = packageRoles.getRoleFromPackage(pkg);
    if (existingRole) {
      return;
    }
    const detectedRole = packageRoles.detectRoleFromPackage(pkg);
    if (!detectedRole) {
      console.error(`No role detected for package ${name}`);
      return;
    }
    console.log(`Detected package role of ${name} as ${detectedRole}`);
    let newPkg = pkg;
    const pkgKeys = Object.keys(pkg);
    if (pkgKeys.includes("backstage")) {
      newPkg.backstage = {
        ...newPkg.backstage,
        role: detectedRole
      };
    } else {
      const index = Math.max(pkgKeys.indexOf("version"), pkgKeys.indexOf("private"), pkgKeys.indexOf("publishConfig")) + 1 || pkgKeys.length;
      const pkgEntries = Object.entries(pkg);
      pkgEntries.splice(index, 0, ["backstage", { role: detectedRole }]);
      newPkg = Object.fromEntries(pkgEntries);
    }
    await fs__default["default"].writeJson(path.resolve(dir, "package.json"), newPkg, {
      spaces: 2
    });
  }));
};

exports["default"] = packageRole;
//# sourceMappingURL=packageRole-171a5797.cjs.js.map
