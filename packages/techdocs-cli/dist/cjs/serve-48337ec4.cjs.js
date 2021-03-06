'use strict';

var path = require('path');
var openBrowser = require('react-dev-utils/openBrowser');
var cliCommon = require('@backstage/cli-common');
var serveHandler = require('serve-handler');
var http = require('http');
var httpProxy = require('http-proxy');
var utility = require('./utility-51f4a306.cjs.js');
var mkdocsServer = require('./mkdocsServer-0af6527d.cjs.js');
require('winston');
require('child_process');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var openBrowser__default = /*#__PURE__*/_interopDefaultLegacy(openBrowser);
var serveHandler__default = /*#__PURE__*/_interopDefaultLegacy(serveHandler);
var http__default = /*#__PURE__*/_interopDefaultLegacy(http);
var httpProxy__default = /*#__PURE__*/_interopDefaultLegacy(httpProxy);

class HTTPServer {
  constructor(backstageBundleDir, backstagePort, mkdocsPort, verbose) {
    this.proxyEndpoint = "/api/techdocs/";
    this.backstageBundleDir = backstageBundleDir;
    this.backstagePort = backstagePort;
    this.mkdocsPort = mkdocsPort;
    this.verbose = verbose;
  }
  createProxy() {
    const proxy = httpProxy__default["default"].createProxyServer({
      target: `http://localhost:${this.mkdocsPort}`
    });
    return (request) => {
      var _a;
      const proxyEndpointPath = new RegExp(`^${this.proxyEndpoint}`, "i");
      const forwardPath = ((_a = request.url) == null ? void 0 : _a.replace(proxyEndpointPath, "")) || "";
      return [proxy, forwardPath];
    };
  }
  async serve() {
    return new Promise((resolve, reject) => {
      const proxyHandler = this.createProxy();
      const server = http__default["default"].createServer((request, response) => {
        var _a;
        if ((_a = request.url) == null ? void 0 : _a.startsWith(this.proxyEndpoint)) {
          const [proxy, forwardPath] = proxyHandler(request);
          proxy.on("error", (error) => {
            reject(error);
          });
          response.setHeader("Access-Control-Allow-Origin", "*");
          response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
          request.url = forwardPath;
          proxy.web(request, response);
          return;
        }
        if (request.url === "/.detect") {
          response.setHeader("Content-Type", "text/plain");
          response.end("techdocs-cli-server");
          return;
        }
        serveHandler__default["default"](request, response, {
          public: this.backstageBundleDir,
          trailingSlash: true,
          rewrites: [{ source: "**", destination: "index.html" }]
        });
      });
      const logger = utility.createLogger({ verbose: false });
      server.listen(this.backstagePort, () => {
        if (this.verbose) {
          logger.info(`[techdocs-preview-bundle] Running local version of Backstage at http://localhost:${this.backstagePort}`);
        }
        resolve(server);
      });
      server.on("error", (error) => {
        reject(error);
      });
    });
  }
}

function findPreviewBundlePath() {
  try {
    return path__default["default"].join(path__default["default"].dirname(require.resolve("techdocs-cli-embedded-app/package.json")), "dist");
  } catch {
    return cliCommon.findPaths(__dirname).resolveOwn("dist/embedded-app");
  }
}
async function serve(opts) {
  const logger = utility.createLogger({ verbose: opts.verbose });
  const isDevMode = Object.keys(process.env).includes("TECHDOCS_CLI_DEV_MODE") ? true : false;
  const backstagePort = 3e3;
  const backstageBackendPort = 7007;
  const mkdocsDockerAddr = `http://0.0.0.0:${opts.mkdocsPort}`;
  const mkdocsLocalAddr = `http://127.0.0.1:${opts.mkdocsPort}`;
  const mkdocsExpectedDevAddr = opts.docker ? mkdocsDockerAddr : mkdocsLocalAddr;
  let mkdocsServerHasStarted = false;
  const mkdocsLogFunc = (data) => {
    const logLines = data.toString().split("\n");
    const logPrefix = opts.docker ? "[docker/mkdocs]" : "[mkdocs]";
    logLines.forEach((line) => {
      if (line === "") {
        return;
      }
      logger.verbose(`${logPrefix} ${line}`);
      if (!mkdocsServerHasStarted && line.includes(`Serving on ${mkdocsExpectedDevAddr}`)) {
        mkdocsServerHasStarted = true;
      }
    });
  };
  logger.info("Starting mkdocs server.");
  const mkdocsChildProcess = await mkdocsServer.runMkdocsServer({
    port: opts.mkdocsPort,
    dockerImage: opts.dockerImage,
    dockerEntrypoint: opts.dockerEntrypoint,
    useDocker: opts.docker,
    stdoutLogFunc: mkdocsLogFunc,
    stderrLogFunc: mkdocsLogFunc
  });
  for (let attempt = 0; attempt < 30; attempt++) {
    await new Promise((r) => setTimeout(r, 3e3));
    if (mkdocsServerHasStarted) {
      break;
    }
    logger.info("Waiting for mkdocs server to start...");
  }
  if (!mkdocsServerHasStarted) {
    logger.error("mkdocs server did not start. Exiting. Try re-running command with -v option for more details.");
  }
  const port = isDevMode ? backstageBackendPort : backstagePort;
  const httpServer = new HTTPServer(findPreviewBundlePath(), port, opts.mkdocsPort, opts.verbose);
  httpServer.serve().catch((err) => {
    logger.error(err);
    mkdocsChildProcess.kill();
    process.exit(1);
  }).then(() => {
    openBrowser__default["default"](`http://localhost:${port}/docs/default/component/local/`);
    logger.info(`Serving docs in Backstage at http://localhost:${port}/docs/default/component/local/
Opening browser.`);
  });
  await mkdocsServer.waitForSignal([mkdocsChildProcess]);
}

exports["default"] = serve;
//# sourceMappingURL=serve-48337ec4.cjs.js.map
