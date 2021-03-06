'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var backendCommon = require('@backstage/backend-common');
var lodash = require('lodash');
var luxon = require('luxon');
var errors = require('@backstage/errors');
var cron = require('cron');
var nodeAbortController = require('node-abort-controller');
var uuid = require('uuid');
var zod = require('zod');

const DB_MIGRATIONS_TABLE = "backstage_backend_tasks__knex_migrations";
const DB_TASKS_TABLE = "backstage_backend_tasks__tasks";

const migrationsDir = backendCommon.resolvePackagePath("@backstage/backend-tasks", "migrations");
async function migrateBackendTasks(knex) {
  await knex.migrate.latest({
    directory: migrationsDir,
    tableName: DB_MIGRATIONS_TABLE
  });
}

function validateId(id) {
  if (typeof id !== "string" || !id.trim()) {
    throw new errors.InputError(`${id} is not a valid ID, expected non-empty string`);
  }
}
function nowPlus(duration, knex) {
  var _a;
  const seconds = (_a = duration == null ? void 0 : duration.as("seconds")) != null ? _a : 0;
  if (!seconds) {
    return knex.fn.now();
  }
  return knex.client.config.client.includes("sqlite3") ? knex.raw(`datetime('now', ?)`, [`${seconds} seconds`]) : knex.raw(`now() + interval '${seconds} seconds'`);
}
async function sleep(duration, abortSignal) {
  if (abortSignal == null ? void 0 : abortSignal.aborted) {
    return;
  }
  await new Promise((resolve) => {
    let timeoutHandle = void 0;
    const done = () => {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
      abortSignal == null ? void 0 : abortSignal.removeEventListener("abort", done);
      resolve();
    };
    timeoutHandle = setTimeout(done, duration.as("milliseconds"));
    abortSignal == null ? void 0 : abortSignal.addEventListener("abort", done);
  });
}
function delegateAbortController(parent) {
  const delegate = new nodeAbortController.AbortController();
  if (parent) {
    if (parent.aborted) {
      delegate.abort();
    } else {
      const onParentAborted = () => {
        delegate.abort();
      };
      const onChildAborted = () => {
        parent.removeEventListener("abort", onParentAborted);
      };
      parent.addEventListener("abort", onParentAborted, { once: true });
      delegate.signal.addEventListener("abort", onChildAborted, { once: true });
    }
  }
  return delegate;
}

class LocalTaskWorker {
  constructor(taskId, fn, logger) {
    this.taskId = taskId;
    this.fn = fn;
    this.logger = logger;
  }
  start(settings, options) {
    this.logger.info(`Task worker starting: ${this.taskId}, ${JSON.stringify(settings)}`);
    let attemptNum = 1;
    (async () => {
      var _a;
      for (; ; ) {
        try {
          if (settings.initialDelayDuration) {
            await this.sleep(luxon.Duration.fromISO(settings.initialDelayDuration), options == null ? void 0 : options.signal);
          }
          while (!((_a = options == null ? void 0 : options.signal) == null ? void 0 : _a.aborted)) {
            const startTime = process.hrtime();
            await this.runOnce(settings, options == null ? void 0 : options.signal);
            const timeTaken = process.hrtime(startTime);
            await this.waitUntilNext(settings, (timeTaken[0] + timeTaken[1] / 1e9) * 1e3, options == null ? void 0 : options.signal);
          }
          this.logger.info(`Task worker finished: ${this.taskId}`);
          attemptNum = 0;
          break;
        } catch (e) {
          attemptNum += 1;
          this.logger.warn(`Task worker failed unexpectedly, attempt number ${attemptNum}, ${e}`);
          await sleep(luxon.Duration.fromObject({ seconds: 1 }));
        }
      }
    })();
  }
  trigger() {
    if (!this.abortWait) {
      throw new errors.ConflictError(`Task ${this.taskId} is currently running`);
    }
    this.abortWait.abort();
  }
  async runOnce(settings, signal) {
    const taskAbortController = delegateAbortController(signal);
    const timeoutHandle = setTimeout(() => {
      taskAbortController.abort();
    }, luxon.Duration.fromISO(settings.timeoutAfterDuration).as("milliseconds"));
    try {
      await this.fn(taskAbortController.signal);
    } catch (e) {
    }
    clearTimeout(timeoutHandle);
    taskAbortController.abort();
  }
  async waitUntilNext(settings, lastRunMillis, signal) {
    if (signal == null ? void 0 : signal.aborted) {
      return;
    }
    const isCron = !settings.cadence.startsWith("P");
    let dt;
    if (isCron) {
      const nextRun = +new cron.CronTime(settings.cadence).sendAt().toJSDate();
      dt = nextRun - Date.now();
    } else {
      dt = luxon.Duration.fromISO(settings.cadence).as("milliseconds") - lastRunMillis;
    }
    dt = Math.max(dt, 0);
    this.logger.debug(`task: ${this.taskId} will next occur around ${luxon.DateTime.now().plus(luxon.Duration.fromMillis(dt))}`);
    await this.sleep(luxon.Duration.fromMillis(dt), signal);
  }
  async sleep(duration, abortSignal) {
    this.abortWait = delegateAbortController(abortSignal);
    await sleep(duration, this.abortWait.signal);
    this.abortWait.abort();
    this.abortWait = void 0;
  }
}

function isValidOptionalDurationString(d) {
  try {
    return !d || luxon.Duration.fromISO(d).isValid;
  } catch {
    return false;
  }
}
function isValidCronFormat(c) {
  try {
    if (!c) {
      return false;
    }
    new cron.CronTime(c);
    return true;
  } catch {
    return false;
  }
}
zod.z.object({
  version: zod.z.literal(1),
  initialDelayDuration: zod.z.string().optional().refine(isValidOptionalDurationString, {
    message: "Invalid duration, expecting ISO Period"
  }),
  recurringAtMostEveryDuration: zod.z.string().refine(isValidOptionalDurationString, {
    message: "Invalid duration, expecting ISO Period"
  }),
  timeoutAfterDuration: zod.z.string().refine(isValidOptionalDurationString, {
    message: "Invalid duration, expecting ISO Period"
  })
});
const taskSettingsV2Schema = zod.z.object({
  version: zod.z.literal(2),
  cadence: zod.z.string().refine(isValidCronFormat, { message: "Invalid cron" }).or(zod.z.string().refine(isValidOptionalDurationString, {
    message: "Invalid duration, expecting ISO Period"
  })),
  timeoutAfterDuration: zod.z.string().refine(isValidOptionalDurationString, {
    message: "Invalid duration, expecting ISO Period"
  }),
  initialDelayDuration: zod.z.string().optional().refine(isValidOptionalDurationString, {
    message: "Invalid duration, expecting ISO Period"
  })
});

const DEFAULT_WORK_CHECK_FREQUENCY = luxon.Duration.fromObject({ seconds: 5 });
class TaskWorker {
  constructor(taskId, fn, knex, logger, workCheckFrequency = DEFAULT_WORK_CHECK_FREQUENCY) {
    this.taskId = taskId;
    this.fn = fn;
    this.knex = knex;
    this.logger = logger;
    this.workCheckFrequency = workCheckFrequency;
  }
  async start(settings, options) {
    try {
      await this.persistTask(settings);
    } catch (e) {
      throw new Error(`Failed to persist task, ${e}`);
    }
    this.logger.info(`Task worker starting: ${this.taskId}, ${JSON.stringify(settings)}`);
    let attemptNum = 1;
    (async () => {
      var _a;
      for (; ; ) {
        try {
          if (settings.initialDelayDuration) {
            await sleep(luxon.Duration.fromISO(settings.initialDelayDuration), options == null ? void 0 : options.signal);
          }
          while (!((_a = options == null ? void 0 : options.signal) == null ? void 0 : _a.aborted)) {
            const runResult = await this.runOnce(options == null ? void 0 : options.signal);
            if (runResult.result === "abort") {
              break;
            }
            await sleep(this.workCheckFrequency, options == null ? void 0 : options.signal);
          }
          this.logger.info(`Task worker finished: ${this.taskId}`);
          attemptNum = 0;
          break;
        } catch (e) {
          attemptNum += 1;
          this.logger.warn(`Task worker failed unexpectedly, attempt number ${attemptNum}, ${e}`);
          await sleep(luxon.Duration.fromObject({ seconds: 1 }));
        }
      }
    })();
  }
  static async trigger(knex, taskId) {
    const rows = await knex(DB_TASKS_TABLE).select(knex.raw(1)).where("id", "=", taskId);
    if (rows.length !== 1) {
      throw new errors.NotFoundError(`Task ${taskId} does not exist`);
    }
    const updatedRows = await knex(DB_TASKS_TABLE).where("id", "=", taskId).whereNull("current_run_ticket").update({
      next_run_start_at: knex.fn.now()
    });
    if (updatedRows < 1) {
      throw new errors.ConflictError(`Task ${taskId} is currently running`);
    }
  }
  async runOnce(signal) {
    const findResult = await this.findReadyTask();
    if (findResult.result === "not-ready-yet" || findResult.result === "abort") {
      return findResult;
    }
    const taskSettings = findResult.settings;
    const ticket = uuid.v4();
    const claimed = await this.tryClaimTask(ticket, taskSettings);
    if (!claimed) {
      return { result: "not-ready-yet" };
    }
    const taskAbortController = delegateAbortController(signal);
    const timeoutHandle = setTimeout(() => {
      taskAbortController.abort();
    }, luxon.Duration.fromISO(taskSettings.timeoutAfterDuration).as("milliseconds"));
    try {
      await this.fn(taskAbortController.signal);
      taskAbortController.abort();
    } catch (e) {
      this.logger.error(e);
      await this.tryReleaseTask(ticket, taskSettings);
      return { result: "failed" };
    } finally {
      clearTimeout(timeoutHandle);
    }
    await this.tryReleaseTask(ticket, taskSettings);
    return { result: "completed" };
  }
  async persistTask(settings) {
    taskSettingsV2Schema.parse(settings);
    const isCron = !(settings == null ? void 0 : settings.cadence.startsWith("P"));
    let startAt;
    if (settings.initialDelayDuration) {
      startAt = nowPlus(luxon.Duration.fromISO(settings.initialDelayDuration), this.knex);
    } else if (isCron) {
      const time = new cron.CronTime(settings.cadence).sendAt().minus({ seconds: 1 }).toUTC().toISO();
      startAt = this.knex.client.config.client.includes("sqlite3") ? this.knex.raw("datetime(?)", [time]) : this.knex.raw(`?`, [time]);
    } else {
      startAt = this.knex.fn.now();
    }
    this.logger.debug(`task: ${this.taskId} configured to run at: ${startAt}`);
    await this.knex(DB_TASKS_TABLE).insert({
      id: this.taskId,
      settings_json: JSON.stringify(settings),
      next_run_start_at: startAt
    }).onConflict("id").merge(["settings_json"]);
  }
  async findReadyTask() {
    const [row] = await this.knex(DB_TASKS_TABLE).where("id", "=", this.taskId).select({
      settingsJson: "settings_json",
      ready: this.knex.raw(`CASE
            WHEN next_run_start_at <= ? AND current_run_ticket IS NULL THEN TRUE
            ELSE FALSE
          END`, [this.knex.fn.now()])
    });
    if (!row) {
      this.logger.info("No longer able to find task; aborting and assuming that it has been unregistered or expired");
      return { result: "abort" };
    } else if (!row.ready) {
      return { result: "not-ready-yet" };
    }
    try {
      const obj = JSON.parse(row.settingsJson);
      const settings = taskSettingsV2Schema.parse(obj);
      return { result: "ready", settings };
    } catch (e) {
      this.logger.info(`Task "${this.taskId}" is no longer able to parse task settings; aborting and assuming that a newer version of the task has been issued and being handled by other workers, ${e}`);
      return { result: "abort" };
    }
  }
  async tryClaimTask(ticket, settings) {
    const startedAt = this.knex.fn.now();
    const expiresAt = settings.timeoutAfterDuration ? nowPlus(luxon.Duration.fromISO(settings.timeoutAfterDuration), this.knex) : this.knex.raw("null");
    const rows = await this.knex(DB_TASKS_TABLE).where("id", "=", this.taskId).whereNull("current_run_ticket").update({
      current_run_ticket: ticket,
      current_run_started_at: startedAt,
      current_run_expires_at: expiresAt
    });
    return rows === 1;
  }
  async tryReleaseTask(ticket, settings) {
    const isCron = !(settings == null ? void 0 : settings.cadence.startsWith("P"));
    let nextRun;
    if (isCron) {
      const time = new cron.CronTime(settings.cadence).sendAt().toUTC().toISO();
      this.logger.debug(`task: ${this.taskId} will next occur around ${time}`);
      nextRun = this.knex.client.config.client.includes("sqlite3") ? this.knex.raw("datetime(?)", [time]) : this.knex.raw(`?`, [time]);
    } else {
      const dt = luxon.Duration.fromISO(settings.cadence).as("seconds");
      this.logger.debug(`task: ${this.taskId} will next occur around ${luxon.DateTime.now().plus({
        seconds: dt
      })}`);
      nextRun = this.knex.client.config.client.includes("sqlite3") ? this.knex.raw(`max(datetime(next_run_start_at, ?), datetime('now'))`, [`+${dt} seconds`]) : this.knex.raw(`greatest(next_run_start_at + interval '${dt} seconds', now())`);
    }
    const rows = await this.knex(DB_TASKS_TABLE).where("id", "=", this.taskId).where("current_run_ticket", "=", ticket).update({
      next_run_start_at: nextRun,
      current_run_ticket: this.knex.raw("null"),
      current_run_started_at: this.knex.raw("null"),
      current_run_expires_at: this.knex.raw("null")
    });
    return rows === 1;
  }
}

class PluginTaskSchedulerImpl {
  constructor(databaseFactory, logger) {
    this.databaseFactory = databaseFactory;
    this.logger = logger;
    this.localTasksById = /* @__PURE__ */ new Map();
  }
  async triggerTask(id) {
    const localTask = this.localTasksById.get(id);
    if (localTask) {
      localTask.trigger();
      return;
    }
    const knex = await this.databaseFactory();
    await TaskWorker.trigger(knex, id);
  }
  async scheduleTask(task) {
    var _a;
    validateId(task.id);
    const scope = (_a = task.scope) != null ? _a : "global";
    if (scope === "global") {
      const knex = await this.databaseFactory();
      const worker = new TaskWorker(task.id, task.fn, knex, this.logger.child({ task: task.id }));
      await worker.start({
        version: 2,
        cadence: parseDuration(task.frequency),
        initialDelayDuration: task.initialDelay && parseDuration(task.initialDelay),
        timeoutAfterDuration: parseDuration(task.timeout)
      }, {
        signal: task.signal
      });
    } else {
      const worker = new LocalTaskWorker(task.id, task.fn, this.logger);
      worker.start({
        version: 2,
        cadence: parseDuration(task.frequency),
        initialDelayDuration: task.initialDelay && parseDuration(task.initialDelay),
        timeoutAfterDuration: parseDuration(task.timeout)
      }, {
        signal: task.signal
      });
      this.localTasksById.set(task.id, worker);
    }
  }
  createScheduledTaskRunner(schedule) {
    return {
      run: async (task) => {
        await this.scheduleTask({ ...task, ...schedule });
      }
    };
  }
}
function parseDuration(frequency) {
  if ("cron" in frequency) {
    return frequency.cron;
  }
  if (luxon.Duration.isDuration(frequency)) {
    return frequency.toISO();
  }
  return luxon.Duration.fromObject(frequency).toISO();
}

class PluginTaskSchedulerJanitor {
  constructor(options) {
    this.knex = options.knex;
    this.waitBetweenRuns = options.waitBetweenRuns;
    this.logger = options.logger;
  }
  async start(abortSignal) {
    while (!(abortSignal == null ? void 0 : abortSignal.aborted)) {
      try {
        await this.runOnce();
      } catch (e) {
        this.logger.warn(`Error while performing janitorial tasks, ${e}`);
      }
      await sleep(this.waitBetweenRuns, abortSignal);
    }
  }
  async runOnce() {
    const dbNull = this.knex.raw("null");
    const tasks = await this.knex(DB_TASKS_TABLE).where("current_run_expires_at", "<", this.knex.fn.now()).update({
      current_run_ticket: dbNull,
      current_run_started_at: dbNull,
      current_run_expires_at: dbNull
    }).returning(["id"]);
    if (typeof tasks === "number") {
      if (tasks > 0) {
        this.logger.warn(`${tasks} tasks timed out and were lost`);
      }
    } else {
      for (const { id } of tasks) {
        this.logger.warn(`Task timed out and was lost: ${id}`);
      }
    }
  }
}

class TaskScheduler {
  constructor(databaseManager, logger) {
    this.databaseManager = databaseManager;
    this.logger = logger;
  }
  static fromConfig(config, options) {
    var _a;
    const databaseManager = (_a = options == null ? void 0 : options.databaseManager) != null ? _a : backendCommon.DatabaseManager.fromConfig(config);
    const logger = ((options == null ? void 0 : options.logger) || backendCommon.getRootLogger()).child({
      type: "taskManager"
    });
    return new TaskScheduler(databaseManager, logger);
  }
  forPlugin(pluginId) {
    const databaseFactory = lodash.once(async () => {
      const knex = await this.databaseManager.forPlugin(pluginId).getClient();
      await migrateBackendTasks(knex);
      const janitor = new PluginTaskSchedulerJanitor({
        knex,
        waitBetweenRuns: luxon.Duration.fromObject({ minutes: 1 }),
        logger: this.logger
      });
      janitor.start();
      return knex;
    });
    return new PluginTaskSchedulerImpl(databaseFactory, this.logger.child({ plugin: pluginId }));
  }
}

exports.TaskScheduler = TaskScheduler;
//# sourceMappingURL=index.cjs.js.map
