'use strict';

var yaml = require('yaml');
var config$1 = require('@backstage/config');
var config = require('./config-0d75b175.cjs.js');
require('@backstage/config-loader');
require('./index-a5d56062.cjs.js');
require('commander');
require('chalk');
require('fs-extra');
require('semver');
require('@backstage/cli-common');
require('@backstage/errors');
require('@manypkg/get-packages');
require('./PackageGraph-89852111.cjs.js');
require('path');
require('child_process');
require('util');

var print = async (opts) => {
  const { schema, appConfigs } = await config.loadCliConfig({
    args: opts.config,
    fromPackage: opts.package,
    mockEnv: opts.lax,
    fullVisibility: !opts.frontend
  });
  const visibility = getVisibilityOption(opts);
  const data = serializeConfigData(appConfigs, schema, visibility);
  if (opts.format === "json") {
    process.stdout.write(`${JSON.stringify(data, null, 2)}
`);
  } else {
    process.stdout.write(`${yaml.stringify(data)}
`);
  }
};
function getVisibilityOption(opts) {
  if (opts.frontend && opts.withSecrets) {
    throw new Error("Not allowed to combine frontend and secret config");
  }
  if (opts.frontend) {
    return "frontend";
  } else if (opts.withSecrets) {
    return "secret";
  }
  return "backend";
}
function serializeConfigData(appConfigs, schema, visibility) {
  if (visibility === "frontend") {
    const frontendConfigs = schema.process(appConfigs, {
      visibility: ["frontend"]
    });
    return config$1.ConfigReader.fromConfigs(frontendConfigs).get();
  } else if (visibility === "secret") {
    return config$1.ConfigReader.fromConfigs(appConfigs).get();
  }
  const sanitizedConfigs = schema.process(appConfigs, {
    valueTransform: (value, context) => context.visibility === "secret" ? "<secret>" : value
  });
  return config$1.ConfigReader.fromConfigs(sanitizedConfigs).get();
}

exports["default"] = print;
//# sourceMappingURL=print-e302d7bc.cjs.js.map
