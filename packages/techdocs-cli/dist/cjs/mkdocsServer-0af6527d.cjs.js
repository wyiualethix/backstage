'use strict';

var child_process = require('child_process');

const run = async (name, args = [], options = {}) => {
  var _a;
  const { stdoutLogFunc, stderrLogFunc } = options;
  const env = {
    ...process.env,
    FORCE_COLOR: "true",
    ...(_a = options.env) != null ? _a : {}
  };
  const stdio = [
    "inherit",
    stdoutLogFunc ? "pipe" : "inherit",
    stderrLogFunc ? "pipe" : "inherit"
  ];
  const childProcess = child_process.spawn(name, args, {
    stdio,
    ...options,
    env
  });
  if (stdoutLogFunc && childProcess.stdout) {
    childProcess.stdout.on("data", stdoutLogFunc);
  }
  if (stderrLogFunc && childProcess.stderr) {
    childProcess.stderr.on("data", stderrLogFunc);
  }
  return childProcess;
};
async function waitForSignal(childProcesses) {
  const promises = [];
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      childProcesses.forEach((childProcess) => {
        childProcess.kill();
      });
    });
  }
  childProcesses.forEach((childProcess) => {
    if (typeof childProcess.exitCode === "number") {
      if (childProcess.exitCode) {
        throw new Error(`Non zero exit code from child process`);
      }
      return;
    }
    promises.push(new Promise((resolve, reject) => {
      childProcess.once("error", reject);
      childProcess.once("exit", resolve);
    }));
  });
  await Promise.all(promises);
}

const runMkdocsServer = async (options) => {
  var _a, _b, _c;
  const port = (_a = options.port) != null ? _a : "8000";
  const useDocker = (_b = options.useDocker) != null ? _b : true;
  const dockerImage = (_c = options.dockerImage) != null ? _c : "spotify/techdocs";
  if (useDocker) {
    return await run("docker", [
      "run",
      "--rm",
      "-w",
      "/content",
      "-v",
      `${process.cwd()}:/content`,
      "-p",
      `${port}:${port}`,
      "-it",
      ...options.dockerEntrypoint ? ["--entrypoint", options.dockerEntrypoint] : [],
      dockerImage,
      "serve",
      "--dev-addr",
      `0.0.0.0:${port}`
    ], {
      stdoutLogFunc: options.stdoutLogFunc,
      stderrLogFunc: options.stderrLogFunc
    });
  }
  return await run("mkdocs", ["serve", "--dev-addr", `127.0.0.1:${port}`], {
    stdoutLogFunc: options.stdoutLogFunc,
    stderrLogFunc: options.stderrLogFunc
  });
};

exports.runMkdocsServer = runMkdocsServer;
exports.waitForSignal = waitForSignal;
//# sourceMappingURL=mkdocsServer-0af6527d.cjs.js.map
