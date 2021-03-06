'use strict';

var path = require('path');
var fs = require('fs-extra');
var Docker = require('dockerode');
var pluginTechdocsNode = require('@backstage/plugin-techdocs-node');
var backendCommon = require('@backstage/backend-common');
var config = require('@backstage/config');
var utility = require('./utility-51f4a306.cjs.js');
var process$1 = require('process');
require('winston');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var Docker__default = /*#__PURE__*/_interopDefaultLegacy(Docker);

async function generate(opts) {
  const logger = utility.createLogger({ verbose: opts.verbose });
  const sourceDir = path.resolve(opts.sourceDir);
  const outputDir = path.resolve(opts.outputDir);
  const omitTechdocsCorePlugin = opts.omitTechdocsCoreMkdocsPlugin;
  const dockerImage = opts.dockerImage;
  const pullImage = opts.pull;
  const legacyCopyReadmeMdToIndexMd = opts.legacyCopyReadmeMdToIndexMd;
  logger.info(`Using source dir ${sourceDir}`);
  logger.info(`Will output generated files in ${outputDir}`);
  logger.verbose("Creating output directory if it does not exist.");
  await fs__default["default"].ensureDir(outputDir);
  const config$1 = new config.ConfigReader({
    techdocs: {
      generator: {
        runIn: opts.docker ? "docker" : "local",
        dockerImage,
        pullImage,
        legacyCopyReadmeMdToIndexMd,
        mkdocs: {
          omitTechdocsCorePlugin
        }
      }
    }
  });
  const dockerClient = new Docker__default["default"]();
  const containerRunner = new backendCommon.DockerContainerRunner({ dockerClient });
  let parsedLocationAnnotation = {};
  if (opts.techdocsRef) {
    try {
      parsedLocationAnnotation = utility.convertTechDocsRefToLocationAnnotation(opts.techdocsRef);
    } catch (err) {
      logger.error(err.message);
    }
  }
  const techdocsGenerator = await pluginTechdocsNode.TechdocsGenerator.fromConfig(config$1, {
    logger,
    containerRunner
  });
  logger.info("Generating documentation...");
  await techdocsGenerator.run({
    inputDir: sourceDir,
    outputDir,
    ...opts.techdocsRef ? {
      parsedLocationAnnotation
    } : {},
    logger,
    etag: opts.etag,
    ...process.env.LOG_LEVEL === "debug" ? { logStream: process$1.stdout } : {}
  });
  logger.info("Done!");
}

exports["default"] = generate;
//# sourceMappingURL=generate-b637bb78.cjs.js.map
