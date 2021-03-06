'use strict';

var backendCommon = require('@backstage/backend-common');
var pluginTechdocsNode = require('@backstage/plugin-techdocs-node');
var utility = require('./utility-51f4a306.cjs.js');
var PublisherConfig = require('./PublisherConfig-7a0dc71c.cjs.js');
require('winston');
require('@backstage/config');

async function migrate(opts) {
  const logger = utility.createLogger({ verbose: opts.verbose });
  const config = PublisherConfig.PublisherConfig.getValidConfig(opts);
  const discovery = backendCommon.SingleHostDiscovery.fromConfig(config);
  const publisher = await pluginTechdocsNode.Publisher.fromConfig(config, { logger, discovery });
  if (!publisher.migrateDocsCase) {
    throw new Error(`Migration not implemented for ${opts.publisherType}`);
  }
  const { isAvailable } = await publisher.getReadiness();
  if (!isAvailable) {
    throw new Error("");
  }
  const removeOriginal = opts.removeOriginal;
  const numericConcurrency = parseInt(opts.concurrency, 10);
  if (!Number.isInteger(numericConcurrency) || numericConcurrency <= 0) {
    throw new Error(`Concurrency must be a number greater than 1. ${opts.concurrency} provided.`);
  }
  await publisher.migrateDocsCase({
    concurrency: numericConcurrency,
    removeOriginal
  });
}

exports["default"] = migrate;
//# sourceMappingURL=migrate-122ec4bf.cjs.js.map
