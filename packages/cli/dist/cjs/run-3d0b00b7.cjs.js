'use strict';

var child_process = require('child_process');
var index = require('./index-a5d56062.cjs.js');
var util = require('util');
var errors = require('@backstage/errors');

const execFile = util.promisify(child_process.execFile);
async function run(name, args = [], options = {}) {
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
  const child = child_process.spawn(name, args, {
    stdio,
    shell: true,
    ...options,
    env
  });
  if (stdoutLogFunc && child.stdout) {
    child.stdout.on("data", stdoutLogFunc);
  }
  if (stderrLogFunc && child.stderr) {
    child.stderr.on("data", stderrLogFunc);
  }
  await waitForExit(child, name);
}
async function runPlain(cmd, ...args) {
  try {
    const { stdout } = await execFile(cmd, args, { shell: true });
    return stdout.trim();
  } catch (error) {
    errors.assertError(error);
    if ("stderr" in error) {
      process.stderr.write(error.stderr);
    }
    if (typeof error.code === "number") {
      throw new index.ExitCodeError(error.code, [cmd, ...args].join(" "));
    }
    throw new errors.ForwardedError("Unknown execution error", error);
  }
}
async function runCheck(cmd, ...args) {
  try {
    await execFile(cmd, args, { shell: true });
    return true;
  } catch (error) {
    return false;
  }
}
async function waitForExit(child, name) {
  if (typeof child.exitCode === "number") {
    if (child.exitCode) {
      throw new index.ExitCodeError(child.exitCode, name);
    }
    return;
  }
  await new Promise((resolve, reject) => {
    child.once("error", (error) => reject(error));
    child.once("exit", (code) => {
      if (code) {
        reject(new index.ExitCodeError(code, name));
      } else {
        resolve();
      }
    });
  });
}

exports.run = run;
exports.runCheck = runCheck;
exports.runPlain = runPlain;
//# sourceMappingURL=run-3d0b00b7.cjs.js.map
