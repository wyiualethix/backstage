'use strict';

var path = require('path');
var utility = require('./utility-51f4a306.cjs.js');
var backendCommon = require('@backstage/backend-common');
var pluginTechdocsNode = require('@backstage/plugin-techdocs-node');
var PublisherConfig = require('./PublisherConfig-7a0dc71c.cjs.js');
require('winston');
require('@backstage/config');

async function publish(opts) {
  const logger = utility.createLogger({ verbose: opts.verbose });
  const config = PublisherConfig.PublisherConfig.getValidConfig(opts);
  const discovery = backendCommon.SingleHostDiscovery.fromConfig(config);
  const publisher = await pluginTechdocsNode.Publisher.fromConfig(config, { logger, discovery });
  const { isAvailable } = await publisher.getReadiness();
  if (!isAvailable) {
    return Promise.reject(new Error(""));
  }
  const [namespace, kind, name] = opts.entity.split("/");
  const entity = {
    kind,
    metadata: {
      namespace,
      name
    }
  };
  const directory = path.resolve(opts.directory);
  await publisher.publish({ entity, directory });
  return true;
}

exports["default"] = publish;
//# sourceMappingURL=publish-efa348a5.cjs.js.map
