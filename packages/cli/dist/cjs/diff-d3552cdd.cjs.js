'use strict';

var fs = require('fs-extra');
var chalk = require('chalk');
var diff$1 = require('diff');
var path = require('path');
var inquirer = require('inquirer');
var handlebars = require('handlebars');
var recursive = require('recursive-readdir');
var index = require('./index-a5d56062.cjs.js');
require('commander');
require('semver');
require('@backstage/cli-common');
require('@backstage/errors');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);
var inquirer__default = /*#__PURE__*/_interopDefaultLegacy(inquirer);
var handlebars__default = /*#__PURE__*/_interopDefaultLegacy(handlebars);
var recursive__default = /*#__PURE__*/_interopDefaultLegacy(recursive);

function sortObjectKeys(obj) {
  const sortedKeys = Object.keys(obj).sort();
  for (const key of sortedKeys) {
    const value = obj[key];
    delete obj[key];
    obj[key] = value;
  }
}
class PackageJsonHandler {
  constructor(writeFunc, prompt, pkg, targetPkg, variant) {
    this.writeFunc = writeFunc;
    this.prompt = prompt;
    this.pkg = pkg;
    this.targetPkg = targetPkg;
    this.variant = variant;
  }
  static async handler({ path, write, missing, targetContents, templateContents }, prompt, variant) {
    console.log("Checking package.json");
    if (missing) {
      throw new Error(`${path} doesn't exist`);
    }
    const pkg = JSON.parse(templateContents);
    const targetPkg = JSON.parse(targetContents);
    const handler = new PackageJsonHandler(write, prompt, pkg, targetPkg, variant);
    await handler.handle();
  }
  static async appHandler(file, prompt) {
    return PackageJsonHandler.handler(file, prompt, "app");
  }
  async handle() {
    await this.syncField("main");
    if (this.variant !== "app") {
      await this.syncField("main:src");
    }
    await this.syncField("types");
    await this.syncFiles();
    await this.syncScripts();
    await this.syncPublishConfig();
    await this.syncDependencies("dependencies");
    await this.syncDependencies("peerDependencies", true);
    await this.syncDependencies("devDependencies");
    await this.syncReactDeps();
  }
  async syncField(fieldName, obj = this.pkg, targetObj = this.targetPkg, prefix, sort, optional) {
    const fullFieldName = chalk__default["default"].cyan(prefix ? `${prefix}[${fieldName}]` : fieldName);
    const newValue = obj[fieldName];
    const coloredNewValue = chalk__default["default"].cyan(JSON.stringify(newValue));
    if (fieldName in targetObj) {
      const oldValue = targetObj[fieldName];
      if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
        return;
      }
      const coloredOldValue = chalk__default["default"].cyan(JSON.stringify(oldValue));
      const msg = `package.json has mismatched field, ${fullFieldName}, change from ${coloredOldValue} to ${coloredNewValue}?`;
      if (await this.prompt(msg)) {
        targetObj[fieldName] = newValue;
        if (sort) {
          sortObjectKeys(targetObj);
        }
        await this.write();
      }
    } else if (fieldName in obj && optional !== true) {
      if (await this.prompt(`package.json is missing field ${fullFieldName}, set to ${coloredNewValue}?`)) {
        targetObj[fieldName] = newValue;
        if (sort) {
          sortObjectKeys(targetObj);
        }
        await this.write();
      }
    }
  }
  async syncFiles() {
    const { configSchema } = this.targetPkg;
    const hasSchemaFile = typeof configSchema === "string";
    if (!this.targetPkg.files) {
      const expected = hasSchemaFile ? ["dist", configSchema] : ["dist"];
      if (await this.prompt(`package.json is missing field "files", set to ${JSON.stringify(expected)}?`)) {
        this.targetPkg.files = expected;
        await this.write();
      }
    } else {
      const missing = [];
      if (!this.targetPkg.files.includes("dist")) {
        missing.push("dist");
      }
      if (hasSchemaFile && !this.targetPkg.files.includes(configSchema)) {
        missing.push(configSchema);
      }
      if (missing.length) {
        if (await this.prompt(`package.json is missing ${JSON.stringify(missing)} in the "files" field, add?`)) {
          this.targetPkg.files.push(...missing);
          await this.write();
        }
      }
    }
  }
  async syncScripts() {
    const pkgScripts = this.pkg.scripts;
    const targetScripts = this.targetPkg.scripts = this.targetPkg.scripts || {};
    if (!pkgScripts) {
      return;
    }
    const hasNewScript = Object.values(targetScripts).some((script) => String(script).includes("backstage-cli package "));
    if (hasNewScript) {
      return;
    }
    for (const key of Object.keys(pkgScripts)) {
      await this.syncField(key, pkgScripts, targetScripts, "scripts");
    }
  }
  async syncPublishConfig() {
    const pkgPublishConf = this.pkg.publishConfig;
    const targetPublishConf = this.targetPkg.publishConfig;
    if (!pkgPublishConf) {
      return;
    }
    if (!targetPublishConf) {
      if (await this.prompt("Missing publishConfig, do you want to add it?")) {
        this.targetPkg.publishConfig = pkgPublishConf;
        await this.write();
      }
      return;
    }
    for (const key of Object.keys(pkgPublishConf)) {
      if (!["access", "registry"].includes(key)) {
        await this.syncField(key, pkgPublishConf, targetPublishConf, "publishConfig");
      }
    }
  }
  async syncDependencies(fieldName, required = false) {
    const pkgDeps = this.pkg[fieldName];
    const targetDeps = this.targetPkg[fieldName] = this.targetPkg[fieldName] || {};
    if (!pkgDeps && !required) {
      return;
    }
    await this.syncField("@backstage/core", {}, targetDeps, fieldName, true);
    await this.syncField("@backstage/core-api", {}, targetDeps, fieldName, true);
    for (const key of Object.keys(pkgDeps)) {
      if (this.variant === "app" && key.startsWith("plugin-")) {
        continue;
      }
      await this.syncField(key, pkgDeps, targetDeps, fieldName, true, !required);
    }
  }
  async syncReactDeps() {
    const targetDeps = this.targetPkg.dependencies = this.targetPkg.dependencies || {};
    await this.syncField("react", {}, targetDeps, "dependencies");
    await this.syncField("react-dom", {}, targetDeps, "dependencies");
  }
  async write() {
    await this.writeFunc(`${JSON.stringify(this.targetPkg, null, 2)}
`);
  }
}
async function exactMatchHandler({ path, write, missing, targetContents, templateContents }, prompt) {
  console.log(`Checking ${path}`);
  const coloredPath = chalk__default["default"].cyan(path);
  if (missing) {
    if (await prompt(`Missing ${coloredPath}, do you want to add it?`)) {
      await write(templateContents);
    }
    return;
  }
  if (targetContents === templateContents) {
    return;
  }
  const diffs = diff$1.diffLines(targetContents, templateContents);
  for (const diff of diffs) {
    if (diff.added) {
      process.stdout.write(chalk__default["default"].green(`+${diff.value}`));
    } else if (diff.removed) {
      process.stdout.write(chalk__default["default"].red(`-${diff.value}`));
    } else {
      process.stdout.write(` ${diff.value}`);
    }
  }
  if (await prompt(`Outdated ${coloredPath}, do you want to apply the above patch?`)) {
    await write(templateContents);
  }
}
async function existsHandler({ path, write, missing, templateContents }, prompt) {
  console.log(`Making sure ${path} exists`);
  const coloredPath = chalk__default["default"].cyan(path);
  if (missing) {
    if (await prompt(`Missing ${coloredPath}, do you want to add it?`)) {
      await write(templateContents);
    }
    return;
  }
}
async function skipHandler({ path }) {
  console.log(`Skipping ${path}`);
}
const handlers = {
  skip: skipHandler,
  exists: existsHandler,
  exactMatch: exactMatchHandler,
  packageJson: PackageJsonHandler.handler,
  appPackageJson: PackageJsonHandler.appHandler
};
async function handleAllFiles(fileHandlers, files, promptFunc) {
  for (const file of files) {
    const path$1 = file.path.split(path.sep).join(path.posix.sep);
    const fileHandler = fileHandlers.find((handler) => handler.patterns.some((pattern) => typeof pattern === "string" ? pattern === path$1 : pattern.test(path$1)));
    if (fileHandler) {
      await fileHandler.handler(file, promptFunc);
    } else {
      throw new Error(`No template file handler found for ${path$1}`);
    }
  }
}

const inquirerPromptFunc = async (msg) => {
  const { result } = await inquirer__default["default"].prompt({
    type: "confirm",
    name: "result",
    message: chalk__default["default"].blue(msg)
  });
  return result;
};
const makeCheckPromptFunc = () => {
  let failed = false;
  const promptFunc = async (msg) => {
    failed = true;
    console.log(chalk__default["default"].red(`[Check Failed] ${msg}`));
    return false;
  };
  const finalize = () => {
    if (failed) {
      throw new Error("Check failed, the plugin is not in sync with the latest template");
    }
  };
  return [promptFunc, finalize];
};
const yesPromptFunc = async (msg) => {
  console.log(`Accepting: "${msg}"`);
  return true;
};

async function readTemplateFile(templateFile, templateVars) {
  const contents = await fs__default["default"].readFile(templateFile, "utf8");
  if (!templateFile.endsWith(".hbs")) {
    return contents;
  }
  const packageVersionProvider = index.createPackageVersionProvider(void 0);
  return handlebars__default["default"].compile(contents)(templateVars, {
    helpers: {
      versionQuery(name, hint) {
        return packageVersionProvider(name, typeof hint === "string" ? hint : void 0);
      }
    }
  });
}
async function readTemplate(templateDir, templateVars) {
  const templateFilePaths = await recursive__default["default"](templateDir).catch((error) => {
    throw new Error(`Failed to read template directory: ${error.message}`);
  });
  const templatedFiles = new Array();
  for (const templateFile of templateFilePaths) {
    const path$1 = path.relative(templateDir, templateFile).replace(/\.hbs$/, "");
    const contents = await readTemplateFile(templateFile, templateVars);
    templatedFiles.push({ path: path$1, contents });
  }
  return templatedFiles;
}
async function diffTemplatedFiles(targetDir, templatedFiles) {
  const fileDiffs = new Array();
  for (const { path: path$1, contents: templateContents } of templatedFiles) {
    const targetPath = path.resolve(targetDir, path$1);
    const targetExists = await fs__default["default"].pathExists(targetPath);
    const write = async (contents) => {
      await fs__default["default"].ensureDir(path.dirname(targetPath));
      await fs__default["default"].writeFile(targetPath, contents, "utf8");
    };
    if (targetExists) {
      const targetContents = await fs__default["default"].readFile(targetPath, "utf8");
      fileDiffs.push({
        path: path$1,
        write,
        missing: false,
        targetContents,
        templateContents
      });
    } else {
      fileDiffs.push({
        path: path$1,
        write,
        missing: true,
        targetContents: "",
        templateContents
      });
    }
  }
  return fileDiffs;
}
async function diffTemplateFiles(template, templateData) {
  const templateDir = index.paths.resolveOwn("templates", template);
  const templatedFiles = await readTemplate(templateDir, templateData);
  const fileDiffs = await diffTemplatedFiles(index.paths.targetDir, templatedFiles);
  return fileDiffs;
}

const fileHandlers = [
  {
    patterns: ["package.json"],
    handler: handlers.packageJson
  },
  {
    patterns: [".eslintrc.js"],
    handler: handlers.exists
  },
  {
    patterns: ["README.md", "tsconfig.json", /^src\//, /^dev\//],
    handler: handlers.skip
  }
];
var diff = async (opts) => {
  let promptFunc = inquirerPromptFunc;
  let finalize = () => {
  };
  if (opts.check) {
    [promptFunc, finalize] = makeCheckPromptFunc();
  } else if (opts.yes) {
    promptFunc = yesPromptFunc;
  }
  const data = await readPluginData();
  const templateFiles = await diffTemplateFiles("default-plugin", data);
  await handleAllFiles(fileHandlers, templateFiles, promptFunc);
  finalize();
};
async function readPluginData() {
  let name;
  let privatePackage;
  let pluginVersion;
  let npmRegistry;
  try {
    const pkg = require(index.paths.resolveTarget("package.json"));
    name = pkg.name;
    privatePackage = pkg.private;
    pluginVersion = pkg.version;
    const scope = name.split("/")[0];
    if (`${scope}:registry` in pkg.publishConfig) {
      const registryURL = pkg.publishConfig[`${scope}:registry`];
      npmRegistry = `"${scope}:registry" : "${registryURL}"`;
    } else
      npmRegistry = "";
  } catch (error) {
    throw new Error(`Failed to read target package, ${error}`);
  }
  const pluginTsContents = await fs__default["default"].readFile(index.paths.resolveTarget("src/plugin.ts"), "utf8");
  const pluginIdMatch = pluginTsContents.match(/id: ['"`](.+?)['"`]/);
  if (!pluginIdMatch) {
    throw new Error(`Failed to parse plugin.ts, no plugin ID found`);
  }
  const id = pluginIdMatch[1];
  return { id, name, privatePackage, pluginVersion, npmRegistry };
}

exports["default"] = diff;
//# sourceMappingURL=diff-d3552cdd.cjs.js.map
