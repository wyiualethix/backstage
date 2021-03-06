'use strict';

var fs = require('fs-extra');
var util = require('util');
var chalk = require('chalk');
var inquirer = require('inquirer');
var child_process = require('child_process');
var path = require('path');
var camelCase = require('lodash/camelCase');
var upperFirst = require('lodash/upperFirst');
var os = require('os');
var errors = require('@backstage/errors');
var tasks = require('./tasks-ff51899d.cjs.js');
var index = require('./index-a5d56062.cjs.js');
var Lockfile = require('./Lockfile-48dc675e.cjs.js');
require('minimatch');
require('@manypkg/get-packages');
require('./run-3d0b00b7.cjs.js');
require('handlebars');
require('ora');
require('recursive-readdir');
require('commander');
require('semver');
require('@backstage/cli-common');
require('@yarnpkg/parsers');
require('@yarnpkg/lockfile');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);
var inquirer__default = /*#__PURE__*/_interopDefaultLegacy(inquirer);
var camelCase__default = /*#__PURE__*/_interopDefaultLegacy(camelCase);
var upperFirst__default = /*#__PURE__*/_interopDefaultLegacy(upperFirst);
var os__default = /*#__PURE__*/_interopDefaultLegacy(os);

const exec = util.promisify(child_process.exec);
async function checkExists(destination) {
  await tasks.Task.forItem("checking", destination, async () => {
    if (await fs__default["default"].pathExists(destination)) {
      const existing = chalk__default["default"].cyan(destination.replace(`${index.paths.targetRoot}/`, ""));
      throw new Error(`A plugin with the same name already exists: ${existing}
Please try again with a different plugin ID`);
    }
  });
}
const sortObjectByKeys = (obj) => {
  return Object.keys(obj).sort().reduce((result, key) => {
    result[key] = obj[key];
    return result;
  }, {});
};
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const addExportStatement = async (file, exportStatement) => {
  const newContents = fs__default["default"].readFileSync(file, "utf8").split("\n").filter(Boolean).concat([exportStatement]).concat([""]).join("\n");
  await fs__default["default"].writeFile(file, newContents, "utf8");
};
async function addPluginDependencyToApp(rootDir, pluginPackage, versionStr) {
  const packageFilePath = "packages/app/package.json";
  const packageFile = path.resolve(rootDir, packageFilePath);
  await tasks.Task.forItem("processing", packageFilePath, async () => {
    const packageFileContent = await fs__default["default"].readFile(packageFile, "utf-8");
    const packageFileJson = JSON.parse(packageFileContent);
    const dependencies = packageFileJson.dependencies;
    if (dependencies[pluginPackage]) {
      throw new Error(`Plugin ${pluginPackage} already exists in ${packageFile}`);
    }
    dependencies[pluginPackage] = `^${versionStr}`;
    packageFileJson.dependencies = sortObjectByKeys(dependencies);
    const newContents = `${JSON.stringify(packageFileJson, null, 2)}
`;
    await fs__default["default"].writeFile(packageFile, newContents, "utf-8").catch((error) => {
      throw new Error(`Failed to add plugin as dependency to app: ${packageFile}: ${error.message}`);
    });
  });
}
async function addPluginExtensionToApp(pluginId, extensionName, pluginPackage) {
  const pluginsFilePath = index.paths.resolveTargetRoot("packages/app/src/App.tsx");
  if (!await fs__default["default"].pathExists(pluginsFilePath)) {
    return;
  }
  await tasks.Task.forItem("processing", pluginsFilePath, async () => {
    var _a;
    const content = await fs__default["default"].readFile(pluginsFilePath, "utf8");
    const revLines = content.split("\n").reverse();
    const lastImportIndex = revLines.findIndex((line) => line.match(/ from ("|').*("|')/));
    const lastRouteIndex = revLines.findIndex((line) => line.match(/<\/FlatRoutes/));
    if (lastImportIndex !== -1 && lastRouteIndex !== -1) {
      revLines.splice(lastImportIndex, 0, `import { ${extensionName} } from '${pluginPackage}';`);
      const [indentation] = (_a = revLines[lastRouteIndex + 1].match(/^\s*/)) != null ? _a : [];
      revLines.splice(lastRouteIndex + 1, 0, `${indentation}<Route path="/${pluginId}" element={<${extensionName} />}/>`);
      const newContent = revLines.reverse().join("\n");
      await fs__default["default"].writeFile(pluginsFilePath, newContent, "utf8");
    }
  });
}
async function cleanUp(tempDir) {
  await tasks.Task.forItem("remove", "temporary directory", async () => {
    await fs__default["default"].remove(tempDir);
  });
}
async function buildPlugin(pluginFolder) {
  const commands = [
    "yarn install",
    "yarn lint --fix",
    "yarn tsc",
    "yarn build"
  ];
  for (const command of commands) {
    try {
      await tasks.Task.forItem("executing", command, async () => {
        process.chdir(pluginFolder);
        await exec(command);
      }).catch((error) => {
        process.stdout.write(error.stderr);
        process.stdout.write(error.stdout);
        throw new Error(`Warning: Could not execute command ${chalk__default["default"].cyan(command)}`);
      });
    } catch (error) {
      errors.assertError(error);
      tasks.Task.error(error.message);
      break;
    }
  }
}
async function movePlugin(tempDir, destination, id) {
  await tasks.Task.forItem("moving", id, async () => {
    await fs__default["default"].move(tempDir, destination).catch((error) => {
      throw new Error(`Failed to move plugin from ${tempDir} to ${destination}: ${error.message}`);
    });
  });
}
var createPlugin = async (opts) => {
  const codeownersPath = await tasks.getCodeownersFilePath(index.paths.targetRoot);
  const questions = [
    {
      type: "input",
      name: "id",
      message: chalk__default["default"].blue("Enter an ID for the plugin [required]"),
      validate: (value) => {
        if (!value) {
          return chalk__default["default"].red("Please enter an ID for the plugin");
        } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)) {
          return chalk__default["default"].red("Plugin IDs must be lowercase and contain only letters, digits, and dashes.");
        }
        return true;
      }
    }
  ];
  if (codeownersPath) {
    questions.push({
      type: "input",
      name: "owner",
      message: chalk__default["default"].blue("Enter the owner(s) of the plugin. If specified, this will be added to CODEOWNERS for the plugin path. [optional]"),
      validate: (value) => {
        if (!value) {
          return true;
        }
        const ownerIds = tasks.parseOwnerIds(value);
        if (!ownerIds) {
          return chalk__default["default"].red("The owner must be a space separated list of team names (e.g. @org/team-name), usernames (e.g. @username), or the email addresses of users (e.g. user@example.com).");
        }
        return true;
      }
    });
  }
  const answers = await inquirer__default["default"].prompt(questions);
  const pluginId = opts.backend && !answers.id.endsWith("-backend") ? `${answers.id}-backend` : answers.id;
  const name = opts.scope ? `@${opts.scope.replace(/^@/, "")}/plugin-${pluginId}` : `plugin-${pluginId}`;
  const pluginVar = `${camelCase__default["default"](answers.id)}Plugin`;
  const extensionName = `${upperFirst__default["default"](camelCase__default["default"](answers.id))}Page`;
  const npmRegistry = opts.npmRegistry && opts.scope ? opts.npmRegistry : "";
  const privatePackage = opts.private === false ? false : true;
  const isMonoRepo = await fs__default["default"].pathExists(index.paths.resolveTargetRoot("lerna.json"));
  const appPackage = index.paths.resolveTargetRoot("packages/app");
  const templateDir = index.paths.resolveOwn(opts.backend ? "templates/default-backend-plugin" : "templates/default-plugin");
  const pluginDir = isMonoRepo ? index.paths.resolveTargetRoot("plugins", pluginId) : index.paths.resolveTargetRoot(pluginId);
  const { version: pluginVersion } = isMonoRepo ? await fs__default["default"].readJson(index.paths.resolveTargetRoot("lerna.json")) : { version: "0.1.0" };
  let lockfile;
  try {
    lockfile = await Lockfile.Lockfile.load(index.paths.resolveTargetRoot("yarn.lock"));
  } catch (error) {
    console.warn(`No yarn.lock available, ${error}`);
  }
  tasks.Task.log();
  tasks.Task.log("Creating the plugin...");
  tasks.Task.section("Checking if the plugin ID is available");
  await checkExists(pluginDir);
  tasks.Task.section("Creating a temporary plugin directory");
  const tempDir = await fs__default["default"].mkdtemp(path.join(os__default["default"].tmpdir(), `backstage-plugin-${pluginId}`));
  try {
    tasks.Task.section("Preparing files");
    await tasks.templatingTask(templateDir, tempDir, {
      ...answers,
      pluginVar,
      pluginVersion,
      extensionName,
      name,
      privatePackage,
      npmRegistry
    }, index.createPackageVersionProvider(lockfile));
    tasks.Task.section("Moving to final location");
    await movePlugin(tempDir, pluginDir, pluginId);
    tasks.Task.section("Building the plugin");
    await buildPlugin(pluginDir);
    if (await fs__default["default"].pathExists(appPackage) && !opts.backend) {
      tasks.Task.section("Adding plugin as dependency in app");
      await addPluginDependencyToApp(index.paths.targetRoot, name, pluginVersion);
      tasks.Task.section("Import plugin in app");
      await addPluginExtensionToApp(pluginId, extensionName, name);
    }
    if (answers.owner) {
      await tasks.addCodeownersEntry(`/plugins/${pluginId}`, answers.owner);
    }
    tasks.Task.log();
    tasks.Task.log(`\u{1F947}  Successfully created ${chalk__default["default"].cyan(`${name}`)}`);
    tasks.Task.log();
    tasks.Task.exit();
  } catch (error) {
    errors.assertError(error);
    tasks.Task.error(error.message);
    tasks.Task.log("It seems that something went wrong when creating the plugin \u{1F914}");
    tasks.Task.log("We are going to clean up, and then you can try again.");
    tasks.Task.section("Cleanup");
    await cleanUp(tempDir);
    tasks.Task.error("\u{1F525}  Failed to create plugin!");
    tasks.Task.exit(1);
  }
};

exports.addExportStatement = addExportStatement;
exports.addPluginDependencyToApp = addPluginDependencyToApp;
exports.addPluginExtensionToApp = addPluginExtensionToApp;
exports.capitalize = capitalize;
exports["default"] = createPlugin;
exports.movePlugin = movePlugin;
//# sourceMappingURL=createPlugin-41209fec.cjs.js.map
