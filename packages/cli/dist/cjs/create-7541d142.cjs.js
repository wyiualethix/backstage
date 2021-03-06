'use strict';

var os = require('os');
var fs = require('fs-extra');
var path = require('path');
var chalk = require('chalk');
var inquirer = require('inquirer');
var camelCase = require('lodash/camelCase');
var upperFirst = require('lodash/upperFirst');
var index = require('./index-a5d56062.cjs.js');
var tasks = require('./tasks-ff51899d.cjs.js');
var Lockfile = require('./Lockfile-48dc675e.cjs.js');
require('minimatch');
require('@manypkg/get-packages');
require('./run-3d0b00b7.cjs.js');
var partition = require('lodash/partition');
var errors = require('@backstage/errors');
require('commander');
require('semver');
require('@backstage/cli-common');
require('handlebars');
require('ora');
require('util');
require('recursive-readdir');
require('child_process');
require('@yarnpkg/parsers');
require('@yarnpkg/lockfile');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var os__default = /*#__PURE__*/_interopDefaultLegacy(os);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);
var inquirer__default = /*#__PURE__*/_interopDefaultLegacy(inquirer);
var camelCase__default = /*#__PURE__*/_interopDefaultLegacy(camelCase);
var upperFirst__default = /*#__PURE__*/_interopDefaultLegacy(upperFirst);
var partition__default = /*#__PURE__*/_interopDefaultLegacy(partition);

function createFactory(config) {
  return config;
}

function pluginIdPrompt() {
  return {
    type: "input",
    name: "id",
    message: "Enter the ID of the plugin [required]",
    validate: (value) => {
      if (!value) {
        return "Please enter the ID of the plugin";
      } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)) {
        return "Plugin IDs must be lowercase and contain only letters, digits, and dashes.";
      }
      return true;
    }
  };
}
function ownerPrompt() {
  return {
    type: "input",
    name: "owner",
    message: "Enter an owner to add to CODEOWNERS [optional]",
    when: (opts) => Boolean(opts.codeOwnersPath),
    validate: (value) => {
      if (!value) {
        return true;
      }
      const ownerIds = tasks.parseOwnerIds(value);
      if (!ownerIds) {
        return "The owner must be a space separated list of team names (e.g. @org/team-name), usernames (e.g. @username), or the email addresses (e.g. user@example.com).";
      }
      return true;
    }
  };
}

async function executePluginPackageTemplate(ctx, options) {
  const { targetDir } = options;
  let lockfile;
  try {
    lockfile = await Lockfile.Lockfile.load(index.paths.resolveTargetRoot("yarn.lock"));
  } catch {
  }
  tasks.Task.section("Checking Prerequisites");
  const shortPluginDir = path.relative(index.paths.targetRoot, targetDir);
  await tasks.Task.forItem("availability", shortPluginDir, async () => {
    if (await fs__default["default"].pathExists(targetDir)) {
      throw new Error(`A package with the same plugin ID already exists at ${chalk__default["default"].cyan(shortPluginDir)}. Please try again with a different ID.`);
    }
  });
  const tempDir = await tasks.Task.forItem("creating", "temp dir", async () => {
    return await ctx.createTemporaryDirectory("backstage-create");
  });
  tasks.Task.section("Executing Template");
  await tasks.templatingTask(index.paths.resolveOwn("templates", options.templateName), tempDir, options.values, index.createPackageVersionProvider(lockfile));
  const pkgJsonPath = path.resolve(tempDir, "package.json");
  if (await fs__default["default"].pathExists(pkgJsonPath)) {
    const pkgJson = await fs__default["default"].readJson(pkgJsonPath);
    await fs__default["default"].writeJson(pkgJsonPath, pkgJson, { spaces: 2 });
  }
  tasks.Task.section("Installing");
  await tasks.Task.forItem("moving", shortPluginDir, async () => {
    await fs__default["default"].move(tempDir, targetDir).catch((error) => {
      throw new Error(`Failed to move package from ${tempDir} to ${targetDir}, ${error.message}`);
    });
  });
  ctx.markAsModified();
}

const frontendPlugin = createFactory({
  name: "plugin",
  description: "A new frontend plugin",
  optionsDiscovery: async () => ({
    codeOwnersPath: await tasks.getCodeownersFilePath(index.paths.targetRoot)
  }),
  optionsPrompts: [pluginIdPrompt(), ownerPrompt()],
  async create(options, ctx) {
    const { id } = options;
    const name = ctx.scope ? `@${ctx.scope}/plugin-${id}` : `backstage-plugin-${id}`;
    const extensionName = `${upperFirst__default["default"](camelCase__default["default"](id))}Page`;
    tasks.Task.log();
    tasks.Task.log(`Creating frontend plugin ${chalk__default["default"].cyan(name)}`);
    const targetDir = ctx.isMonoRepo ? index.paths.resolveTargetRoot("plugins", id) : index.paths.resolveTargetRoot(`backstage-plugin-${id}`);
    await executePluginPackageTemplate(ctx, {
      targetDir,
      templateName: "default-plugin",
      values: {
        id,
        name,
        extensionName,
        pluginVar: `${camelCase__default["default"](id)}Plugin`,
        pluginVersion: ctx.defaultVersion,
        privatePackage: ctx.private,
        npmRegistry: ctx.npmRegistry
      }
    });
    if (await fs__default["default"].pathExists(index.paths.resolveTargetRoot("packages/app"))) {
      await tasks.Task.forItem("app", "adding dependency", async () => {
        await tasks.addPackageDependency(index.paths.resolveTargetRoot("packages/app/package.json"), {
          dependencies: {
            [name]: `^${ctx.defaultVersion}`
          }
        });
      });
      await tasks.Task.forItem("app", "adding import", async () => {
        var _a;
        const pluginsFilePath = index.paths.resolveTargetRoot("packages/app/src/App.tsx");
        if (!await fs__default["default"].pathExists(pluginsFilePath)) {
          return;
        }
        const content = await fs__default["default"].readFile(pluginsFilePath, "utf8");
        const revLines = content.split("\n").reverse();
        const lastImportIndex = revLines.findIndex((line) => line.match(/ from ("|').*("|')/));
        const lastRouteIndex = revLines.findIndex((line) => line.match(/<\/FlatRoutes/));
        if (lastImportIndex !== -1 && lastRouteIndex !== -1) {
          const importLine = `import { ${extensionName} } from '${name}';`;
          if (!content.includes(importLine)) {
            revLines.splice(lastImportIndex, 0, importLine);
          }
          const componentLine = `<Route path="/${id}" element={<${extensionName} />} />`;
          if (!content.includes(componentLine)) {
            const [indentation] = (_a = revLines[lastRouteIndex + 1].match(/^\s*/)) != null ? _a : [];
            revLines.splice(lastRouteIndex + 1, 0, indentation + componentLine);
          }
          const newContent = revLines.reverse().join("\n");
          await fs__default["default"].writeFile(pluginsFilePath, newContent, "utf8");
        }
      });
    }
    if (options.owner) {
      await tasks.addCodeownersEntry(`/plugins/${id}`, options.owner);
    }
    await tasks.Task.forCommand("yarn install", { cwd: targetDir, optional: true });
    await tasks.Task.forCommand("yarn lint --fix", {
      cwd: targetDir,
      optional: true
    });
  }
});

const backendPlugin = createFactory({
  name: "backend-plugin",
  description: "A new backend plugin",
  optionsDiscovery: async () => ({
    codeOwnersPath: await tasks.getCodeownersFilePath(index.paths.targetRoot)
  }),
  optionsPrompts: [pluginIdPrompt(), ownerPrompt()],
  async create(options, ctx) {
    const id = `${options.id}-backend`;
    const name = ctx.scope ? `@${ctx.scope}/plugin-${id}` : `backstage-plugin-${id}`;
    tasks.Task.log();
    tasks.Task.log(`Creating backend plugin ${chalk__default["default"].cyan(name)}`);
    const targetDir = ctx.isMonoRepo ? index.paths.resolveTargetRoot("plugins", id) : index.paths.resolveTargetRoot(`backstage-plugin-${id}`);
    await executePluginPackageTemplate(ctx, {
      targetDir,
      templateName: "default-backend-plugin",
      values: {
        id,
        name,
        pluginVar: `${camelCase__default["default"](id)}Plugin`,
        pluginVersion: ctx.defaultVersion,
        privatePackage: ctx.private,
        npmRegistry: ctx.npmRegistry
      }
    });
    if (await fs__default["default"].pathExists(index.paths.resolveTargetRoot("packages/backend"))) {
      await tasks.Task.forItem("backend", "adding dependency", async () => {
        await tasks.addPackageDependency(index.paths.resolveTargetRoot("packages/backend/package.json"), {
          dependencies: {
            [name]: `^${ctx.defaultVersion}`
          }
        });
      });
    }
    if (options.owner) {
      await tasks.addCodeownersEntry(`/plugins/${id}`, options.owner);
    }
    await tasks.Task.forCommand("yarn install", { cwd: targetDir, optional: true });
    await tasks.Task.forCommand("yarn lint --fix", {
      cwd: targetDir,
      optional: true
    });
  }
});

const pluginCommon = createFactory({
  name: "plugin-common",
  description: "A new isomorphic common plugin package",
  optionsDiscovery: async () => ({
    codeOwnersPath: await tasks.getCodeownersFilePath(index.paths.targetRoot)
  }),
  optionsPrompts: [pluginIdPrompt(), ownerPrompt()],
  async create(options, ctx) {
    const { id } = options;
    const suffix = `${id}-common`;
    const name = ctx.scope ? `@${ctx.scope}/plugin-${suffix}` : `backstage-plugin-${suffix}`;
    tasks.Task.log();
    tasks.Task.log(`Creating backend plugin ${chalk__default["default"].cyan(name)}`);
    const targetDir = ctx.isMonoRepo ? index.paths.resolveTargetRoot("plugins", suffix) : index.paths.resolveTargetRoot(`backstage-plugin-${suffix}`);
    await executePluginPackageTemplate(ctx, {
      targetDir,
      templateName: "default-common-plugin-package",
      values: {
        id,
        name,
        privatePackage: ctx.private,
        npmRegistry: ctx.npmRegistry,
        pluginVersion: ctx.defaultVersion
      }
    });
    if (options.owner) {
      await tasks.addCodeownersEntry(`/plugins/${suffix}`, options.owner);
    }
    await tasks.Task.forCommand("yarn install", { cwd: targetDir, optional: true });
    await tasks.Task.forCommand("yarn lint --fix", {
      cwd: targetDir,
      optional: true
    });
  }
});

const scaffolderModule = createFactory({
  name: "scaffolder-module",
  description: "An module exporting custom actions for @backstage/plugin-scaffolder-backend",
  optionsDiscovery: async () => ({
    codeOwnersPath: await tasks.getCodeownersFilePath(index.paths.targetRoot)
  }),
  optionsPrompts: [
    {
      type: "input",
      name: "id",
      message: "Enter the name of the module [required]",
      validate: (value) => {
        if (!value) {
          return "Please enter the name of the module";
        } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)) {
          return "Module names must be lowercase and contain only letters, digits, and dashes.";
        }
        return true;
      }
    },
    ownerPrompt()
  ],
  async create(options, ctx) {
    const { id } = options;
    const slug = `scaffolder-backend-module-${id}`;
    let name = `backstage-plugin-${slug}`;
    if (ctx.scope) {
      if (ctx.scope === "backstage") {
        name = `@backstage/plugin-${slug}`;
      } else {
        name = `@${ctx.scope}/backstage-plugin-${slug}`;
      }
    }
    tasks.Task.log();
    tasks.Task.log(`Creating module ${chalk__default["default"].cyan(name)}`);
    const targetDir = ctx.isMonoRepo ? index.paths.resolveTargetRoot("plugins", slug) : index.paths.resolveTargetRoot(`backstage-plugin-${slug}`);
    await executePluginPackageTemplate(ctx, {
      targetDir,
      templateName: "scaffolder-module",
      values: {
        id,
        name,
        privatePackage: ctx.private,
        npmRegistry: ctx.npmRegistry,
        pluginVersion: ctx.defaultVersion
      }
    });
    if (options.owner) {
      await tasks.addCodeownersEntry(`/plugins/${slug}`, options.owner);
    }
    await tasks.Task.forCommand("yarn install", { cwd: targetDir, optional: true });
    await tasks.Task.forCommand("yarn lint --fix", {
      cwd: targetDir,
      optional: true
    });
  }
});

var factories = /*#__PURE__*/Object.freeze({
  __proto__: null,
  frontendPlugin: frontendPlugin,
  backendPlugin: backendPlugin,
  pluginCommon: pluginCommon,
  scaffolderModule: scaffolderModule
});

function applyPromptMessageTransforms(prompt, transforms) {
  return {
    ...prompt,
    message: prompt.message && (async (answers) => {
      if (typeof prompt.message === "function") {
        return transforms.message(await prompt.message(answers));
      }
      return transforms.message(await prompt.message);
    }),
    validate: prompt.validate && (async (...args) => {
      const result = await prompt.validate(...args);
      if (typeof result === "string") {
        return transforms.error(result);
      }
      return result;
    })
  };
}
class FactoryRegistry {
  static async interactiveSelect(preselected) {
    let selected = preselected;
    if (!selected) {
      const answers = await inquirer__default["default"].prompt([
        {
          type: "list",
          name: "name",
          message: "What do you want to create?",
          choices: Array.from(this.factoryMap.values()).map((factory2) => ({
            name: `${factory2.name} - ${factory2.description}`,
            value: factory2.name
          }))
        }
      ]);
      selected = answers.name;
    }
    const factory = this.factoryMap.get(selected);
    if (!factory) {
      throw new Error(`Unknown selection '${selected}'`);
    }
    return factory;
  }
  static async populateOptions(factory, provided) {
    let currentOptions = provided;
    if (factory.optionsDiscovery) {
      const discoveredOptions = await factory.optionsDiscovery();
      currentOptions = {
        ...currentOptions,
        ...discoveredOptions
      };
    }
    if (factory.optionsPrompts) {
      const [hasAnswers, needsAnswers] = partition__default["default"](factory.optionsPrompts, (option) => option.name in currentOptions);
      for (const option of hasAnswers) {
        const value = provided[option.name];
        if (option.validate) {
          const result = option.validate(value);
          if (result !== true) {
            throw new Error(`Invalid option '${option.name}'. ${result}`);
          }
        }
      }
      currentOptions = await inquirer__default["default"].prompt(needsAnswers.map((option) => applyPromptMessageTransforms(option, {
        message: chalk__default["default"].blue,
        error: chalk__default["default"].red
      })), currentOptions);
    }
    return currentOptions;
  }
}
FactoryRegistry.factoryMap = new Map(Object.values(factories).map((factory) => [factory.name, factory]));

function parseOptions(optionStrings) {
  const options = {};
  for (const str of optionStrings) {
    const [key] = str.split("=", 1);
    const value = str.slice(key.length + 1);
    if (!key || str[key.length] !== "=") {
      throw new Error(`Invalid option '${str}', must be of the format <key>=<value>`);
    }
    options[key] = value;
  }
  return options;
}
var create = async (opts) => {
  var _a;
  const factory = await FactoryRegistry.interactiveSelect(opts.select);
  const providedOptions = parseOptions(opts.option);
  const options = await FactoryRegistry.populateOptions(factory, providedOptions);
  let isMonoRepo = false;
  try {
    const rootPackageJson = await fs__default["default"].readJson(index.paths.resolveTargetRoot("package.json"));
    if (rootPackageJson.workspaces) {
      isMonoRepo = true;
    }
  } catch (error) {
    errors.assertError(error);
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
  let defaultVersion = "0.1.0";
  try {
    const rootLernaJson = await fs__default["default"].readJson(index.paths.resolveTargetRoot("lerna.json"));
    if (rootLernaJson.version) {
      defaultVersion = rootLernaJson.version;
    }
  } catch (error) {
    errors.assertError(error);
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
  const tempDirs = new Array();
  async function createTemporaryDirectory(name) {
    const dir = await fs__default["default"].mkdtemp(path.join(os__default["default"].tmpdir(), name));
    tempDirs.push(dir);
    return dir;
  }
  let modified = false;
  try {
    await factory.create(options, {
      isMonoRepo,
      defaultVersion,
      scope: (_a = opts.scope) == null ? void 0 : _a.replace(/^@/, ""),
      npmRegistry: opts.npmRegistry,
      private: Boolean(opts.private),
      createTemporaryDirectory,
      markAsModified() {
        modified = true;
      }
    });
    tasks.Task.log();
    tasks.Task.log(`\u{1F389}  Successfully created ${factory.name}`);
    tasks.Task.log();
  } catch (error) {
    errors.assertError(error);
    tasks.Task.error(error.message);
    if (modified) {
      tasks.Task.log("It seems that something went wrong in the creation process \u{1F914}");
      tasks.Task.log();
      tasks.Task.log("We have left the changes that were made intact in case you want to");
      tasks.Task.log("continue manually, but you can also revert the changes and try again.");
      tasks.Task.error(`\u{1F525}  Failed to create ${factory.name}!`);
    }
  } finally {
    for (const dir of tempDirs) {
      try {
        await fs__default["default"].remove(dir);
      } catch (error) {
        console.error(`Failed to remove temporary directory '${dir}', ${error}`);
      }
    }
  }
};

exports["default"] = create;
//# sourceMappingURL=create-7541d142.cjs.js.map
