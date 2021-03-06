'use strict';

var openBrowser = require('react-dev-utils/openBrowser');
var utility = require('./utility-51f4a306.cjs.js');
var mkdocsServer = require('./mkdocsServer-0af6527d.cjs.js');
require('winston');
require('child_process');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var openBrowser__default = /*#__PURE__*/_interopDefaultLegacy(openBrowser);

async function serveMkdocs(opts) {
  const logger = utility.createLogger({ verbose: opts.verbose });
  const dockerAddr = `http://0.0.0.0:${opts.port}`;
  const localAddr = `http://127.0.0.1:${opts.port}`;
  const expectedDevAddr = opts.docker ? dockerAddr : localAddr;
  let boolOpenBrowserTriggered = false;
  const logFunc = (data) => {
    const logLines = data.toString().split("\n");
    const logPrefix = opts.docker ? "[docker/mkdocs]" : "[mkdocs]";
    logLines.forEach((line) => {
      if (line === "") {
        return;
      }
      logger.verbose(`${logPrefix} ${line}`);
      if (!boolOpenBrowserTriggered && line.includes(`Serving on ${expectedDevAddr}`)) {
        logger.info(`
Starting mkdocs server on ${localAddr}
`);
        openBrowser__default["default"](localAddr);
        boolOpenBrowserTriggered = true;
      }
    });
  };
  const childProcess = await mkdocsServer.runMkdocsServer({
    port: opts.port,
    dockerImage: opts.dockerImage,
    dockerEntrypoint: opts.dockerEntrypoint,
    useDocker: opts.docker,
    stdoutLogFunc: logFunc,
    stderrLogFunc: logFunc
  });
  await mkdocsServer.waitForSignal([childProcess]);
}

exports["default"] = serveMkdocs;
//# sourceMappingURL=mkdocs-3c3898e8.cjs.js.map
