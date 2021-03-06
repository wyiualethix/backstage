'use strict';

var fs = require('fs-extra');
var chalk = require('chalk');
var yaml = require('yaml');
var inquirer = require('inquirer');
var index$1 = require('./index-a5d56062.cjs.js');
var crypto = require('crypto');
var openBrowser = require('react-dev-utils/openBrowser');
var request = require('@octokit/request');
var express = require('express');
var fetch = require('node-fetch');
require('commander');
require('semver');
require('@backstage/cli-common');
require('@backstage/errors');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);
var inquirer__default = /*#__PURE__*/_interopDefaultLegacy(inquirer);
var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto);
var openBrowser__default = /*#__PURE__*/_interopDefaultLegacy(openBrowser);
var express__default = /*#__PURE__*/_interopDefaultLegacy(express);
var fetch__default = /*#__PURE__*/_interopDefaultLegacy(fetch);

const MANIFEST_DATA = {
  default_events: ["create", "delete", "push", "repository"],
  default_permissions: {
    contents: "read",
    metadata: "read"
  },
  name: "Backstage-<changeme>",
  url: "https://backstage.io",
  description: "GitHub App for Backstage",
  public: false
};
const FORM_PAGE = `
<html>
  <body>
    <form id="form" action="ACTION_URL" method="post">
      <input type="hidden" name="manifest" value="MANIFEST_JSON">
      <input type="submit" value="Continue">
    </form>
    <script>
      document.getElementById("form").submit()
    <\/script>
  </body>
</html>
`;
class GithubCreateAppServer {
  constructor(actionUrl, readWrite) {
    this.actionUrl = actionUrl;
    this.readWrite = readWrite;
    this.formHandler = (_req, res) => {
      const baseUrl = this.baseUrl;
      if (!baseUrl) {
        throw new Error("baseUrl is not set");
      }
      const manifest = {
        ...MANIFEST_DATA,
        redirect_url: `${baseUrl}/callback`,
        hook_attributes: {
          url: this.webhookUrl,
          active: false
        },
        ...this.readWrite && {
          default_permissions: {
            contents: "write",
            actions: "write",
            metadata: "read"
          }
        }
      };
      const manifestJson = JSON.stringify(manifest).replace(/\"/g, "&quot;");
      let body = FORM_PAGE;
      body = body.replace("MANIFEST_JSON", manifestJson);
      body = body.replace("ACTION_URL", this.actionUrl);
      res.setHeader("content-type", "text/html");
      res.send(body);
    };
    const webhookId = crypto__default["default"].randomBytes(15).toString("base64").replace(/[\+\/]/g, "");
    this.webhookUrl = `https://smee.io/${webhookId}`;
  }
  static async run(options) {
    const encodedOrg = encodeURIComponent(options.org);
    const actionUrl = `https://github.com/organizations/${encodedOrg}/settings/apps/new`;
    const server = new GithubCreateAppServer(actionUrl, options.readWrite);
    return server.start();
  }
  async start() {
    const app = express__default["default"]();
    app.get("/", this.formHandler);
    const callPromise = new Promise((resolve, reject) => {
      app.get("/callback", (req, res) => {
        request.request(`POST /app-manifests/${encodeURIComponent(req.query.code)}/conversions`).then(({ data }) => {
          resolve({
            name: data.name,
            slug: data.slug,
            appId: data.id,
            webhookUrl: this.webhookUrl,
            clientId: data.client_id,
            clientSecret: data.client_secret,
            webhookSecret: data.webhook_secret,
            privateKey: data.pem
          });
          res.redirect(302, `${data.html_url}/installations/new`);
        }, reject);
      });
    });
    this.baseUrl = await this.listen(app);
    openBrowser__default["default"](this.baseUrl);
    return callPromise;
  }
  async listen(app) {
    return new Promise((resolve, reject) => {
      const listener = app.listen(0, () => {
        const info = listener.address();
        if (typeof info !== "object" || info === null) {
          reject(new Error(`Unexpected listener info '${info}'`));
          return;
        }
        const { port } = info;
        resolve(`http://localhost:${port}`);
      });
    });
  }
}

var index = async (org) => {
  const answers = await inquirer__default["default"].prompt([
    {
      type: "list",
      name: "appType",
      message: chalk__default["default"].blue("What will the app be used for [required]"),
      choices: ["Read and Write (needed by Software Templates)", "Read only"]
    }
  ]);
  const readWrite = answers.appType !== "Read only";
  await verifyGithubOrg(org);
  const { slug, name, ...config } = await GithubCreateAppServer.run({
    org,
    readWrite
  });
  const fileName = `github-app-${slug}-credentials.yaml`;
  const content = `# Name: ${name}
${yaml.stringify(config)}`;
  await fs__default["default"].writeFile(index$1.paths.resolveTargetRoot(fileName), content);
  console.log(`GitHub App configuration written to ${chalk__default["default"].cyan(fileName)}`);
  console.log(chalk__default["default"].yellow("This file contains sensitive credentials, it should not be committed to version control and handled with care!"));
  console.log("Here's an example on how to update the integrations section in app-config.yaml");
  console.log(chalk__default["default"].green(`
integrations:
  github:
    - host: github.com
      apps:
        - $include: ${fileName}`));
};
async function verifyGithubOrg(org) {
  let response;
  try {
    response = await fetch__default["default"](`https://api.github.com/orgs/${encodeURIComponent(org)}`);
  } catch (e) {
    console.log(chalk__default["default"].yellow("Warning: Unable to verify existence of GitHub organization. ", e));
  }
  if ((response == null ? void 0 : response.status) === 404) {
    const questions = [
      {
        type: "confirm",
        name: "shouldCreateOrg",
        message: `GitHub organization ${chalk__default["default"].cyan(org)} does not exist. Would you like to create a new Organization instead?`
      }
    ];
    const answers = await inquirer__default["default"].prompt(questions);
    if (!answers.shouldCreateOrg) {
      console.log(chalk__default["default"].yellow("GitHub organization must exist to create GitHub app"));
      process.exit(1);
    }
    openBrowser__default["default"]("https://github.com/account/organizations/new");
    console.log(chalk__default["default"].yellow("Please re-run this command when you have created your new organization"));
    process.exit(0);
  }
}

exports["default"] = index;
//# sourceMappingURL=index-be0f39da.cjs.js.map
