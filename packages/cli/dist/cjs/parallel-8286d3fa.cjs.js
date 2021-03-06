'use strict';

var os = require('os');
var worker_threads = require('worker_threads');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var os__default = /*#__PURE__*/_interopDefaultLegacy(os);

const defaultParallelism = Math.ceil(os__default["default"].cpus().length / 2);
const PARALLEL_ENV_VAR = "BACKSTAGE_CLI_BUILD_PARALLEL";
function parseParallelismOption(parallel) {
  if (parallel === void 0 || parallel === null) {
    return defaultParallelism;
  } else if (typeof parallel === "boolean") {
    return parallel ? defaultParallelism : 1;
  } else if (typeof parallel === "number" && Number.isInteger(parallel)) {
    if (parallel < 1) {
      return 1;
    }
    return parallel;
  } else if (typeof parallel === "string") {
    if (parallel === "true") {
      return parseParallelismOption(true);
    } else if (parallel === "false") {
      return parseParallelismOption(false);
    }
    const parsed = Number(parallel);
    if (Number.isInteger(parsed)) {
      return parseParallelismOption(parsed);
    }
  }
  throw Error(`Parallel option value '${parallel}' is not a boolean or integer`);
}
function getEnvironmentParallelism() {
  return parseParallelismOption(process.env[PARALLEL_ENV_VAR]);
}
async function runParallelWorkers(options) {
  const { parallelismFactor = 1, parallelismSetting, items, worker } = options;
  const parallelism = parallelismSetting ? parseParallelismOption(parallelismSetting) : getEnvironmentParallelism();
  const sharedIterator = items[Symbol.iterator]();
  const sharedIterable = {
    [Symbol.iterator]: () => sharedIterator
  };
  const workerCount = Math.max(Math.floor(parallelismFactor * parallelism), 1);
  return Promise.all(Array(workerCount).fill(0).map(async () => {
    for (const value of sharedIterable) {
      await worker(value);
    }
  }));
}
async function runWorkerQueueThreads(options) {
  const items = Array.from(options.items);
  const {
    workerFactory,
    workerData,
    threadCount = Math.min(getEnvironmentParallelism(), items.length)
  } = options;
  const iterator = items[Symbol.iterator]();
  const results = new Array();
  let itemIndex = 0;
  await Promise.all(Array(threadCount).fill(0).map(async () => {
    const thread = new worker_threads.Worker(`(${workerQueueThread})(${workerFactory})`, {
      eval: true,
      workerData
    });
    return new Promise((resolve, reject) => {
      thread.on("message", (message) => {
        if (message.type === "start" || message.type === "result") {
          if (message.type === "result") {
            results[message.index] = message.result;
          }
          const { value, done } = iterator.next();
          if (done) {
            thread.postMessage({ type: "done" });
          } else {
            thread.postMessage({
              type: "item",
              index: itemIndex,
              item: value
            });
            itemIndex += 1;
          }
        } else if (message.type === "error") {
          const error = new Error(message.error.message);
          error.name = message.error.name;
          error.stack = message.error.stack;
          reject(error);
        }
      });
      thread.on("error", reject);
      thread.on("exit", (code) => {
        if (code !== 0) {
          reject(new Error(`Worker thread exited with code ${code}`));
        } else {
          resolve();
        }
      });
    });
  }));
  return results;
}
function workerQueueThread(workerFuncFactory) {
  const { parentPort, workerData } = require("worker_threads");
  Promise.resolve().then(() => workerFuncFactory(workerData)).then((workerFunc) => {
    parentPort.on("message", async (message) => {
      if (message.type === "done") {
        parentPort.close();
        return;
      }
      if (message.type === "item") {
        try {
          const result = await workerFunc(message.item);
          parentPort.postMessage({
            type: "result",
            index: message.index,
            result
          });
        } catch (error) {
          parentPort.postMessage({ type: "error", error });
        }
      }
    });
    parentPort.postMessage({ type: "start" });
  }, (error) => parentPort.postMessage({ type: "error", error }));
}
async function runWorkerThreads(options) {
  const { worker, workerData, threadCount = 1, onMessage } = options;
  return Promise.all(Array(threadCount).fill(0).map(async () => {
    const thread = new worker_threads.Worker(`(${workerThread})(${worker})`, {
      eval: true,
      workerData
    });
    return new Promise((resolve, reject) => {
      thread.on("message", (message) => {
        if (message.type === "result") {
          resolve(message.result);
        } else if (message.type === "error") {
          reject(message.error);
        } else if (message.type === "message") {
          onMessage == null ? void 0 : onMessage(message.message);
        }
      });
      thread.on("error", reject);
      thread.on("exit", (code) => {
        reject(new Error(`Unexpected worker thread exit with code ${code}`));
      });
    });
  }));
}
function workerThread(workerFunc) {
  const { parentPort, workerData } = require("worker_threads");
  const sendMessage = (message) => {
    parentPort.postMessage({ type: "message", message });
  };
  workerFunc(workerData, sendMessage).then((result) => {
    parentPort.postMessage({
      type: "result",
      index: 0,
      result
    });
  }, (error) => {
    parentPort.postMessage({ type: "error", error });
  });
}

exports.getEnvironmentParallelism = getEnvironmentParallelism;
exports.runParallelWorkers = runParallelWorkers;
exports.runWorkerQueueThreads = runWorkerQueueThreads;
exports.runWorkerThreads = runWorkerThreads;
//# sourceMappingURL=parallel-8286d3fa.cjs.js.map
