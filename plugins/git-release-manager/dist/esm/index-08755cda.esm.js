import { createApiRef, createRouteRef, createPlugin, createApiFactory, configApiRef, githubAuthApiRef, createRoutableExtension } from '@backstage/core-plugin-api';
import { Octokit } from '@octokit/rest';
import { ScmIntegrations } from '@backstage/integration';
import React, { forwardRef, createContext, useContext } from 'react';
import { grey } from '@material-ui/core/colors';
import CallSplitIcon from '@material-ui/icons/CallSplit';
import ChatIcon from '@material-ui/icons/Chat';
import DynamicFeedIcon from '@material-ui/icons/DynamicFeed';
import GitHubIcon from '@material-ui/icons/GitHub';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import { Box, Divider as Divider$1, makeStyles, LinearProgress, Typography, ListItem, ListItemIcon, ListItemText, colors, IconButton, DialogContent, List, Slide, Dialog, DialogTitle, DialogActions, Button } from '@material-ui/core';
import { InfoCard, Progress } from '@backstage/core-components';
import { Alert } from '@material-ui/lab';
import CheckCircleOutline from '@material-ui/icons/CheckCircleOutline';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

const SEMVER_PARTS = {
  major: "major",
  minor: "minor",
  patch: "patch"
};
const DISABLE_CACHE = {
  headers: {
    "If-None-Match": ""
  }
};
const VERSIONING_STRATEGIES = {
  semver: "semver",
  calver: "calver"
};
const TAG_OBJECT_MESSAGE = "Tag generated by your friendly neighborhood Backstage Release Manager";

var constants = /*#__PURE__*/Object.freeze({
  __proto__: null,
  SEMVER_PARTS: SEMVER_PARTS,
  DISABLE_CACHE: DISABLE_CACHE,
  VERSIONING_STRATEGIES: VERSIONING_STRATEGIES,
  TAG_OBJECT_MESSAGE: TAG_OBJECT_MESSAGE
});

class GitReleaseManagerError extends Error {
  constructor(message) {
    super(message);
    this.name = "GitReleaseManagerError";
  }
}

class GitReleaseClient {
  constructor({
    configApi,
    githubAuthApi
  }) {
    this.getHost = () => {
      return this.host;
    };
    this.getRepoPath = ({ owner, repo }) => {
      return `${owner}/${repo}`;
    };
    this.getOwners = async () => {
      const { octokit } = await this.getOctokit();
      const orgListResponse = await octokit.paginate(octokit.orgs.listForAuthenticatedUser, { per_page: 100 });
      return {
        owners: orgListResponse.map((organization) => organization.login)
      };
    };
    this.getRepositories = async ({ owner }) => {
      const { octokit } = await this.getOctokit();
      const repositoryResponse = await octokit.paginate(octokit.repos.listForOrg, { org: owner, per_page: 100 }).catch(async (error) => {
        if (error.status === 404) {
          const userRepositoryResponse = await octokit.paginate(octokit.repos.listForUser, { username: owner, per_page: 100 });
          return userRepositoryResponse;
        }
        throw error;
      });
      return {
        repositories: repositoryResponse.map((repository) => repository.name)
      };
    };
    this.getUser = async () => {
      var _a;
      const { octokit } = await this.getOctokit();
      const userResponse = await octokit.users.getAuthenticated();
      return {
        user: {
          username: userResponse.data.login,
          email: (_a = userResponse.data.email) != null ? _a : void 0
        }
      };
    };
    this.getRecentCommits = async ({
      owner,
      repo,
      releaseBranchName
    }) => {
      const { octokit } = await this.getOctokit();
      const recentCommitsResponse = await octokit.repos.listCommits({
        owner,
        repo,
        ...releaseBranchName ? { sha: releaseBranchName } : {},
        ...DISABLE_CACHE
      });
      return {
        recentCommits: recentCommitsResponse.data.map((commit) => {
          var _a, _b, _c, _d;
          return {
            htmlUrl: commit.html_url,
            sha: commit.sha,
            author: {
              htmlUrl: (_a = commit.author) == null ? void 0 : _a.html_url,
              login: (_b = commit.author) == null ? void 0 : _b.login
            },
            commit: {
              message: commit.commit.message
            },
            firstParentSha: (_d = (_c = commit.parents) == null ? void 0 : _c[0]) == null ? void 0 : _d.sha
          };
        })
      };
    };
    this.getLatestRelease = async ({
      owner,
      repo
    }) => {
      const { octokit } = await this.getOctokit();
      const { data: latestReleases } = await octokit.repos.listReleases({
        owner,
        repo,
        per_page: 1,
        ...DISABLE_CACHE
      });
      if (latestReleases.length === 0) {
        return {
          latestRelease: null
        };
      }
      const latestRelease = latestReleases[0];
      return {
        latestRelease: {
          targetCommitish: latestRelease.target_commitish,
          tagName: latestRelease.tag_name,
          prerelease: latestRelease.prerelease,
          id: latestRelease.id,
          htmlUrl: latestRelease.html_url,
          body: latestRelease.body
        }
      };
    };
    this.getRepository = async ({ owner, repo }) => {
      var _a;
      const { octokit } = await this.getOctokit();
      const { data: repository } = await octokit.repos.get({
        owner,
        repo,
        ...DISABLE_CACHE
      });
      return {
        repository: {
          pushPermissions: (_a = repository.permissions) == null ? void 0 : _a.push,
          defaultBranch: repository.default_branch,
          name: repository.name
        }
      };
    };
    this.getCommit = async ({ owner, repo, ref }) => {
      var _a;
      const { octokit } = await this.getOctokit();
      const { data: commit } = await octokit.repos.getCommit({
        owner,
        repo,
        ref,
        ...DISABLE_CACHE
      });
      return {
        commit: {
          sha: commit.sha,
          htmlUrl: commit.html_url,
          commit: {
            message: commit.commit.message
          },
          createdAt: (_a = commit.commit.committer) == null ? void 0 : _a.date
        }
      };
    };
    this.getBranch = async ({ owner, repo, branch }) => {
      const { octokit } = await this.getOctokit();
      const { data: branchData } = await octokit.repos.getBranch({
        owner,
        repo,
        branch,
        ...DISABLE_CACHE
      });
      return {
        branch: {
          name: branchData.name,
          links: {
            html: branchData._links.html
          },
          commit: {
            sha: branchData.commit.sha,
            commit: {
              tree: {
                sha: branchData.commit.commit.tree.sha
              }
            }
          }
        }
      };
    };
    this.createRef = async ({ owner, repo, sha, ref }) => {
      const { octokit } = await this.getOctokit();
      const createRefResponse = await octokit.git.createRef({
        owner,
        repo,
        ref,
        sha
      });
      return {
        reference: {
          ref: createRefResponse.data.ref,
          objectSha: createRefResponse.data.object.sha
        }
      };
    };
    this.deleteRef = async ({ owner, repo, ref }) => {
      const { octokit } = await this.getOctokit();
      const createRefResponse = await octokit.git.deleteRef({
        owner,
        repo,
        ref
      });
      return {
        success: createRefResponse.status === 204
      };
    };
    this.getComparison = async ({
      owner,
      repo,
      base,
      head
    }) => {
      const { octokit } = await this.getOctokit();
      const compareCommitsResponse = await octokit.repos.compareCommits({
        owner,
        repo,
        base,
        head
      });
      return {
        comparison: {
          htmlUrl: compareCommitsResponse.data.html_url,
          aheadBy: compareCommitsResponse.data.ahead_by
        }
      };
    };
    this.createRelease = async ({
      owner,
      repo,
      tagName,
      name,
      targetCommitish,
      body
    }) => {
      const { octokit } = await this.getOctokit();
      const createReleaseResponse = await octokit.repos.createRelease({
        owner,
        repo,
        tag_name: tagName,
        name,
        target_commitish: targetCommitish,
        body,
        prerelease: true
      });
      return {
        release: {
          name: createReleaseResponse.data.name,
          htmlUrl: createReleaseResponse.data.html_url,
          tagName: createReleaseResponse.data.tag_name
        }
      };
    };
    this.createTagObject = async ({
      owner,
      repo,
      tag,
      object,
      taggerName,
      taggerEmail,
      message
    }) => {
      const { octokit } = await this.getOctokit();
      const { data: createdTagObject } = await octokit.git.createTag({
        owner,
        repo,
        message,
        tag,
        object,
        type: "commit",
        ...taggerEmail ? {
          tagger: {
            date: new Date().toISOString(),
            email: taggerEmail,
            name: taggerName
          }
        } : {}
      });
      return {
        tagObject: {
          tagName: createdTagObject.tag,
          tagSha: createdTagObject.sha
        }
      };
    };
    this.createCommit = async ({
      owner,
      repo,
      message,
      tree,
      parents
    }) => {
      const { octokit } = await this.getOctokit();
      const { data: commit } = await octokit.git.createCommit({
        owner,
        repo,
        message,
        tree,
        parents
      });
      return {
        commit: {
          message: commit.message,
          sha: commit.sha
        }
      };
    };
    this.updateRef = async ({
      owner,
      repo,
      ref,
      sha,
      force
    }) => {
      const { octokit } = await this.getOctokit();
      const { data: updatedRef } = await octokit.git.updateRef({
        owner,
        repo,
        ref,
        sha,
        force
      });
      return {
        reference: {
          ref: updatedRef.ref,
          object: {
            sha: updatedRef.object.sha
          }
        }
      };
    };
    this.merge = async ({ owner, repo, base, head }) => {
      const { octokit } = await this.getOctokit();
      const { data: merge } = await octokit.repos.merge({
        owner,
        repo,
        base,
        head
      });
      return {
        merge: {
          htmlUrl: merge.html_url,
          commit: {
            message: merge.commit.message,
            tree: {
              sha: merge.commit.tree.sha
            }
          }
        }
      };
    };
    this.updateRelease = async ({
      owner,
      repo,
      releaseId,
      tagName,
      body,
      prerelease
    }) => {
      const { octokit } = await this.getOctokit();
      const { data: updatedRelease } = await octokit.repos.updateRelease({
        owner,
        repo,
        release_id: releaseId,
        tag_name: tagName,
        body,
        prerelease
      });
      return {
        release: {
          name: updatedRelease.name,
          tagName: updatedRelease.tag_name,
          htmlUrl: updatedRelease.html_url
        }
      };
    };
    this.getAllTags = async ({ owner, repo }) => {
      const { octokit } = await this.getOctokit();
      const tags = await octokit.paginate(octokit.git.listMatchingRefs, {
        owner,
        repo,
        ref: "tags",
        per_page: 100,
        ...DISABLE_CACHE
      });
      return {
        tags: tags.map((tag) => ({
          tagName: tag.ref.replace("refs/tags/", ""),
          tagSha: tag.object.sha,
          tagType: tag.object.type
        })).reverse()
      };
    };
    this.getAllReleases = async ({ owner, repo }) => {
      const { octokit } = await this.getOctokit();
      const releases = await octokit.paginate(octokit.repos.listReleases, {
        owner,
        repo,
        per_page: 100,
        ...DISABLE_CACHE
      });
      return {
        releases: releases.map((release) => ({
          id: release.id,
          name: release.name,
          tagName: release.tag_name,
          createdAt: release.published_at,
          htmlUrl: release.html_url
        }))
      };
    };
    this.getTag = async ({ owner, repo, tagSha }) => {
      const { octokit } = await this.getOctokit();
      const singleTag = await octokit.git.getTag({
        owner,
        repo,
        tag_sha: tagSha
      });
      return {
        tag: {
          date: singleTag.data.tagger.date,
          username: singleTag.data.tagger.name,
          userEmail: singleTag.data.tagger.email,
          objectSha: singleTag.data.object.sha
        }
      };
    };
    this.githubAuthApi = githubAuthApi;
    const gitHubIntegrations = ScmIntegrations.fromConfig(configApi).github.list();
    const { host, apiBaseUrl } = this.getGithubIntegrationConfig({
      gitHubIntegrations
    });
    this.host = host;
    this.apiBaseUrl = apiBaseUrl;
  }
  getGithubIntegrationConfig({
    gitHubIntegrations
  }) {
    var _a, _b;
    const defaultIntegration = gitHubIntegrations.find(({ config: { host: host2 } }) => host2 === "github.com");
    const enterpriseIntegration = gitHubIntegrations.find(({ config: { host: host2 } }) => host2 !== "github.com");
    const host = (_a = enterpriseIntegration == null ? void 0 : enterpriseIntegration.config.host) != null ? _a : defaultIntegration == null ? void 0 : defaultIntegration.config.host;
    const apiBaseUrl = (_b = enterpriseIntegration == null ? void 0 : enterpriseIntegration.config.apiBaseUrl) != null ? _b : defaultIntegration == null ? void 0 : defaultIntegration.config.apiBaseUrl;
    if (!host) {
      throw new GitReleaseManagerError("Invalid API configuration: missing host");
    }
    if (!apiBaseUrl) {
      throw new GitReleaseManagerError("Invalid API configuration: missing apiBaseUrl");
    }
    return {
      host,
      apiBaseUrl
    };
  }
  async getOctokit() {
    const token = await this.githubAuthApi.getAccessToken(["repo"]);
    return {
      octokit: new Octokit({
        auth: token,
        baseUrl: this.apiBaseUrl
      })
    };
  }
}

const gitReleaseManagerApiRef = createApiRef({
  id: "plugin.git-release-manager.service"
});

const rootRouteRef = createRouteRef({
  id: "git-release-manager"
});

const calverRegexp = /(rc|version)-([0-9]{4}\.[0-9]{2}\.[0-9]{2})_([0-9]+)/;
function getCalverTagParts(tag) {
  const match = tag.match(calverRegexp);
  if (match === null || match.length < 4) {
    const error = {
      title: "Invalid tag",
      subtitle: `Expected calver matching "${calverRegexp}", found "${tag}"`
    };
    return {
      error
    };
  }
  const tagParts = {
    prefix: match[1],
    calver: match[2],
    patch: parseInt(match[3], 10)
  };
  return {
    tagParts
  };
}

const semverRegexp = /(rc|version)-([0-9]+)\.([0-9]+)\.([0-9]+)/;
function getSemverTagParts(tag) {
  const match = tag.match(semverRegexp);
  if (match === null || match.length < 4) {
    const error = {
      title: "Invalid tag",
      subtitle: `Expected semver matching "${semverRegexp}", found "${tag}"`
    };
    return {
      error
    };
  }
  if (tag.match(calverRegexp)) {
    const error = {
      title: "Invalid tag",
      subtitle: `Expected semver matching "${semverRegexp}", found calver "${tag}"`
    };
    return {
      error
    };
  }
  const tagParts = {
    prefix: match[1],
    major: parseInt(match[2], 10),
    minor: parseInt(match[3], 10),
    patch: parseInt(match[4], 10)
  };
  return {
    tagParts
  };
}

function getTagParts({
  project,
  tag
}) {
  if (project.versioningStrategy === "calver") {
    return getCalverTagParts(tag);
  }
  return getSemverTagParts(tag);
}

function isCalverTagParts(project, _tagParts) {
  return project.versioningStrategy === "calver";
}

function getBumpedTag({
  project,
  tag,
  bumpLevel
}) {
  const tagParts = getTagParts({ project, tag });
  if (tagParts.error !== void 0) {
    return {
      error: tagParts.error
    };
  }
  if (isCalverTagParts(project, tagParts.tagParts)) {
    return getPatchedCalverTag(tagParts.tagParts);
  }
  return getBumpedSemverTag(tagParts.tagParts, bumpLevel);
}
function getPatchedCalverTag(tagParts) {
  const bumpedTagParts = {
    ...tagParts,
    patch: tagParts.patch + 1
  };
  const bumpedTag = `${bumpedTagParts.prefix}-${bumpedTagParts.calver}_${bumpedTagParts.patch}`;
  return {
    bumpedTag,
    tagParts: bumpedTagParts,
    error: void 0
  };
}
function getBumpedSemverTag(tagParts, semverBumpLevel) {
  const { bumpedTagParts } = getBumpedSemverTagParts(tagParts, semverBumpLevel);
  const bumpedTag = `${bumpedTagParts.prefix}-${bumpedTagParts.major}.${bumpedTagParts.minor}.${bumpedTagParts.patch}`;
  return {
    bumpedTag,
    tagParts: bumpedTagParts,
    error: void 0
  };
}
function getBumpedSemverTagParts(tagParts, semverBumpLevel) {
  const bumpedTagParts = {
    ...tagParts
  };
  if (semverBumpLevel === "major") {
    bumpedTagParts.major = bumpedTagParts.major + 1;
    bumpedTagParts.minor = 0;
    bumpedTagParts.patch = 0;
  }
  if (semverBumpLevel === "minor") {
    bumpedTagParts.minor = bumpedTagParts.minor + 1;
    bumpedTagParts.patch = 0;
  }
  if (semverBumpLevel === "patch") {
    bumpedTagParts.patch = bumpedTagParts.patch + 1;
  }
  return {
    bumpedTagParts
  };
}

function getShortCommitHash(hash) {
  const shortCommitHash = hash.substr(0, 7);
  if (shortCommitHash.length < 7) {
    throw new GitReleaseManagerError("Invalid shortCommitHash: less than 7 characters");
  }
  return shortCommitHash;
}

function isProjectValid(project) {
  var _a, _b;
  return ((_a = project == null ? void 0 : project.owner) == null ? void 0 : _a.length) > 0 && ((_b = project == null ? void 0 : project.repo) == null ? void 0 : _b.length) > 0 && ["semver", "calver"].includes(project == null ? void 0 : project.versioningStrategy);
}

const validateTagName = ({
  project,
  tagName
}) => {
  if (!tagName) {
    return {
      tagNameError: null
    };
  }
  if (project.versioningStrategy === "calver") {
    const { error: error2 } = getCalverTagParts(tagName);
    return {
      tagNameError: error2
    };
  }
  const { error } = getSemverTagParts(tagName);
  return {
    tagNameError: error
  };
};

var helpers = /*#__PURE__*/Object.freeze({
  __proto__: null,
  calverRegexp: calverRegexp,
  getCalverTagParts: getCalverTagParts,
  getBumpedSemverTagParts: getBumpedSemverTagParts,
  getBumpedTag: getBumpedTag,
  getSemverTagParts: getSemverTagParts,
  semverRegexp: semverRegexp,
  getShortCommitHash: getShortCommitHash,
  getTagParts: getTagParts,
  isCalverTagParts: isCalverTagParts,
  isProjectValid: isProjectValid,
  validateTagName: validateTagName
});

const TEST_IDS = {
  info: {
    info: "grm--info",
    infoFeaturePlus: "grm--info-feature-plus"
  },
  createRc: {
    cta: "grm--create-rc--cta",
    semverSelect: "grm--create-rc--semver-select"
  },
  promoteRc: {
    mockedPromoteRcBody: "grm-mocked-promote-rc-body",
    notRcWarning: "grm--promote-rc--not-rc-warning",
    promoteRc: "grm--promote-rc",
    cta: "grm--promote-rc-body--cta"
  },
  patch: {
    error: "grm--patch-body--error",
    loading: "grm--patch-body--loading",
    notPrerelease: "grm--patch-body--not-prerelease--info",
    body: "grm--patch-body"
  },
  form: {
    owner: {
      loading: "grm--form--owner--loading",
      select: "grm--form--owner--select",
      error: "grm--form--owner--error",
      empty: "grm--form--owner--empty"
    },
    repo: {
      loading: "grm--form--repo--loading",
      select: "grm--form--repo--select",
      error: "grm--form--repo--error",
      empty: "grm--form--repo--empty"
    },
    versioningStrategy: {
      radioGroup: "grm--form--versioning-strategy--radio-group"
    }
  },
  components: {
    divider: "grm--divider",
    noLatestRelease: "grm--no-latest-release",
    circularProgress: "grm--circular-progress",
    responseStepListDialogContent: "grm--response-step-list--dialog-content",
    responseStepListItem: "grm--response-step-list-item",
    responseStepListItemIconSuccess: "grm--response-step-list-item--item-icon--success",
    responseStepListItemIconFailure: "grm--response-step-list-item--item-icon--failure",
    responseStepListItemIconLink: "grm--response-step-list-item--item-icon--link",
    responseStepListItemIconDefault: "grm--response-step-list-item--item-icon--default",
    differ: {
      current: "grm--differ-current",
      next: "grm--differ-next",
      icons: {
        tag: "grm--differ--icons--tag",
        branch: "grm--differ--icons--branch",
        github: "grm--differ--icons--git",
        slack: "grm--differ--icons--slack",
        versioning: "grm--differ--icons--versioning"
      }
    },
    linearProgressWithLabel: "grm--linear-progress-with-label"
  }
};

var testIds = /*#__PURE__*/Object.freeze({
  __proto__: null,
  TEST_IDS: TEST_IDS
});

const Differ = ({ current, next, icon }) => {
  return /* @__PURE__ */ React.createElement(React.Fragment, null, icon && /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement(Icon, {
    icon
  }), " "), !!current && /* @__PURE__ */ React.createElement("span", {
    "data-testid": TEST_IDS.components.differ.current,
    style: { color: grey[700] }
  }, current != null ? current : "None"), current && next && /* @__PURE__ */ React.createElement("span", null, "  \u2192  "), next && /* @__PURE__ */ React.createElement("span", {
    "data-testid": TEST_IDS.components.differ.next,
    style: { fontWeight: "bold" }
  }, next));
};
function Icon({ icon }) {
  switch (icon) {
    case "tag":
      return /* @__PURE__ */ React.createElement(LocalOfferIcon, {
        "data-testid": TEST_IDS.components.differ.icons.tag,
        style: { verticalAlign: "middle" },
        fontSize: "small"
      });
    case "branch":
      return /* @__PURE__ */ React.createElement(CallSplitIcon, {
        "data-testid": TEST_IDS.components.differ.icons.branch,
        style: { verticalAlign: "middle" },
        fontSize: "small"
      });
    case "github":
      return /* @__PURE__ */ React.createElement(GitHubIcon, {
        "data-testid": TEST_IDS.components.differ.icons.github,
        style: { verticalAlign: "middle" },
        fontSize: "small"
      });
    case "slack":
      return /* @__PURE__ */ React.createElement(ChatIcon, {
        "data-testid": TEST_IDS.components.differ.icons.slack,
        style: { verticalAlign: "middle" },
        fontSize: "small"
      });
    case "versioning":
      return /* @__PURE__ */ React.createElement(DynamicFeedIcon, {
        "data-testid": TEST_IDS.components.differ.icons.versioning,
        style: { verticalAlign: "middle" },
        fontSize: "small"
      });
    default:
      throw new GitReleaseManagerError("Invalid Differ icon");
  }
}

const Divider = () => {
  return /* @__PURE__ */ React.createElement(Box, {
    marginTop: 2,
    marginBottom: 2,
    "data-testid": TEST_IDS.components.divider
  }, /* @__PURE__ */ React.createElement(Divider$1, null));
};

const useStyles$1 = makeStyles(() => ({
  feature: {
    marginBottom: "3em"
  }
}));
const InfoCardPlus = ({ children }) => {
  const classes = useStyles$1();
  return /* @__PURE__ */ React.createElement("div", {
    style: { position: "relative" },
    "data-testid": TEST_IDS.info.infoFeaturePlus
  }, /* @__PURE__ */ React.createElement(InfoCard, {
    className: classes.feature
  }, children));
};

const STATUSES = {
  FAILURE: "FAILURE",
  ONGOING: "ONGOING",
  SUCCESS: "SUCCESS"
};
const ICONS = {
  SUCCESS: "\u{1F680}",
  FAILURE: "\u{1F525}"
};
const getFontSize = (progress) => 125 + Math.ceil(progress / Math.PI);
function LinearProgressWithLabel(props) {
  const roundedValue = Math.ceil(props.progress);
  const progress = roundedValue < 100 ? roundedValue : 100;
  const failure = props.responseSteps.some((responseStep) => responseStep.icon === "failure");
  let status = STATUSES.ONGOING;
  if (!failure && progress === 100)
    status = STATUSES.SUCCESS;
  if (failure)
    status = STATUSES.FAILURE;
  const CompletionEmoji = () => {
    if (status === STATUSES.ONGOING)
      return null;
    if (status === STATUSES.FAILURE)
      return /* @__PURE__ */ React.createElement("span", null, ` ${ICONS.FAILURE} `);
    return /* @__PURE__ */ React.createElement("span", null, ` ${ICONS.SUCCESS} `);
  };
  return /* @__PURE__ */ React.createElement(Box, {
    display: "flex",
    alignItems: "center",
    width: "90%",
    alignSelf: "center",
    flexDirection: "column"
  }, /* @__PURE__ */ React.createElement(Box, {
    width: "100%"
  }, /* @__PURE__ */ React.createElement(LinearProgress, {
    variant: "determinate",
    value: progress
  })), /* @__PURE__ */ React.createElement(Box, null, /* @__PURE__ */ React.createElement(Typography, {
    variant: "body2",
    "data-testid": TEST_IDS.components.linearProgressWithLabel,
    style: {
      marginTop: 8,
      minWidth: 35,
      color: failure ? "#ff0033" : "#1DB954",
      fontWeight: "bold",
      fontSize: `${getFontSize(progress)}%`,
      transition: "font-size 250ms ease"
    }
  }, /* @__PURE__ */ React.createElement(CompletionEmoji, null), `${progress}%`, /* @__PURE__ */ React.createElement(CompletionEmoji, null))));
}

const NoLatestRelease = () => {
  return /* @__PURE__ */ React.createElement(Box, {
    marginBottom: 2
  }, /* @__PURE__ */ React.createElement(Alert, {
    "data-testid": TEST_IDS.components.noLatestRelease,
    severity: "warning"
  }, "Unable to find any Release"));
};

const useStyles = makeStyles({
  item: {
    transition: `opacity ${(props) => props.animationDelay <= 0 ? 0 : Math.ceil(props.animationDelay / 2)}ms ease-in`,
    overflow: "hidden",
    "&:before": {
      flex: "none"
    }
  },
  hidden: {
    opacity: 0,
    height: 0,
    minHeight: 0
  },
  shown: {
    opacity: 1
  }
});
const ResponseStepListItem = ({
  responseStep,
  animationDelay = 300
}) => {
  const classes = useStyles({ animationDelay });
  function ItemIcon() {
    if (responseStep.icon === "success") {
      return /* @__PURE__ */ React.createElement(CheckCircleOutline, {
        "data-testid": TEST_IDS.components.responseStepListItemIconSuccess,
        style: { color: colors.green[500] }
      });
    }
    if (responseStep.icon === "failure") {
      return /* @__PURE__ */ React.createElement(ErrorOutlineIcon, {
        "data-testid": TEST_IDS.components.responseStepListItemIconFailure,
        style: { color: colors.red[500] }
      });
    }
    if (responseStep.link) {
      return /* @__PURE__ */ React.createElement(IconButton, {
        "data-testid": TEST_IDS.components.responseStepListItemIconLink,
        style: { padding: 0 },
        "aria-label": "link",
        onClick: () => {
          const newTab = window.open(responseStep.link, "_blank");
          newTab == null ? void 0 : newTab.focus();
        }
      }, /* @__PURE__ */ React.createElement(OpenInNewIcon, {
        color: "primary"
      }));
    }
    return /* @__PURE__ */ React.createElement(FiberManualRecordIcon, {
      "data-testid": TEST_IDS.components.responseStepListItemIconDefault,
      fontSize: "small",
      style: { opacity: 0.85 }
    });
  }
  return /* @__PURE__ */ React.createElement(ListItem, {
    className: `${classes.item}`,
    "data-testid": TEST_IDS.components.responseStepListItem
  }, /* @__PURE__ */ React.createElement(ListItemIcon, null, /* @__PURE__ */ React.createElement(ItemIcon, null)), /* @__PURE__ */ React.createElement(ListItemText, {
    primary: responseStep.message,
    secondary: responseStep.secondaryMessage
  }));
};

const ResponseStepList = ({
  responseSteps,
  animationDelay,
  loading = false,
  denseList = false,
  children
}) => {
  return /* @__PURE__ */ React.createElement(React.Fragment, null, loading || responseSteps.length === 0 ? /* @__PURE__ */ React.createElement("div", {
    "data-testid": TEST_IDS.components.circularProgress,
    style: {
      textAlign: "center",
      margin: 10,
      display: "flex",
      justifyContent: "center"
    }
  }, /* @__PURE__ */ React.createElement(Progress, null)) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(DialogContent, {
    "data-testid": TEST_IDS.components.responseStepListDialogContent
  }, /* @__PURE__ */ React.createElement(List, {
    dense: denseList
  }, responseSteps.map((responseStep, index) => {
    if (!responseStep) {
      return null;
    }
    return /* @__PURE__ */ React.createElement(ResponseStepListItem, {
      key: `ResponseStepListItem-${index}`,
      responseStep,
      index,
      animationDelay
    });
  })), children)));
};

const Transition = forwardRef(function Transition2(props, ref) {
  return /* @__PURE__ */ React.createElement(Slide, {
    direction: "up",
    ref,
    ...props
  });
});

const RefetchContext = createContext(void 0);
const useRefetchContext = () => {
  const refetch = useContext(RefetchContext);
  if (!refetch) {
    throw new GitReleaseManagerError("refetch not found");
  }
  return {
    fetchGitBatchInfo: refetch.fetchGitBatchInfo
  };
};

const ResponseStepDialog = ({
  progress,
  responseSteps,
  title
}) => {
  const { fetchGitBatchInfo } = useRefetchContext();
  return /* @__PURE__ */ React.createElement(Dialog, {
    open: true,
    maxWidth: "md",
    fullWidth: true,
    TransitionComponent: Transition
  }, /* @__PURE__ */ React.createElement(DialogTitle, null, title), /* @__PURE__ */ React.createElement(ResponseStepList, {
    responseSteps
  }), /* @__PURE__ */ React.createElement(LinearProgressWithLabel, {
    progress,
    responseSteps
  }), /* @__PURE__ */ React.createElement(DialogActions, {
    style: { padding: 20 }
  }, /* @__PURE__ */ React.createElement(Button, {
    onClick: () => fetchGitBatchInfo(),
    disabled: progress < 100,
    variant: "contained",
    size: "large",
    color: "primary"
  }, "Ok")));
};

var components = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Differ: Differ,
  Divider: Divider,
  InfoCardPlus: InfoCardPlus,
  LinearProgressWithLabel: LinearProgressWithLabel,
  NoLatestRelease: NoLatestRelease,
  ResponseStepDialog: ResponseStepDialog,
  ResponseStepList: ResponseStepList,
  ResponseStepListItem: ResponseStepListItem
});

const mockReleaseStats = {
  releases: {
    "1.0": {
      baseVersion: "1.0",
      createdAt: "2021-01-01T10:11:12Z",
      htmlUrl: "html_url",
      candidates: [
        {
          tagName: "rc-1.0.1",
          tagSha: "sha-1.0.1",
          tagType: "tag"
        },
        {
          tagName: "rc-1.0.0",
          tagSha: "sha-1.0.0",
          tagType: "tag"
        }
      ],
      versions: []
    },
    "1.1": {
      baseVersion: "1.1",
      createdAt: "2021-01-01T10:11:12Z",
      htmlUrl: "html_url",
      candidates: [
        {
          tagName: "rc-1.1.2",
          tagSha: "sha-1.1.2",
          tagType: "tag"
        },
        {
          tagName: "rc-1.1.1",
          tagSha: "sha-1.1.1",
          tagType: "tag"
        },
        {
          tagName: "rc-1.1.0",
          tagSha: "sha-1.1.0",
          tagType: "tag"
        }
      ],
      versions: [
        {
          tagName: "version-1.1.3",
          tagSha: "sha-1.1.3",
          tagType: "tag"
        },
        {
          tagName: "version-1.1.2",
          tagSha: "sha-1.1.2",
          tagType: "tag"
        }
      ]
    }
  },
  unmappableTags: [],
  unmatchedReleases: [],
  unmatchedTags: []
};

var stats = /*#__PURE__*/Object.freeze({
  __proto__: null,
  mockReleaseStats: mockReleaseStats
});

const mockUsername = "mock_username";
const mockEmail = "mock_email";
const mockOwner = "mock_owner";
const mockRepo = "mock_repo";
const A_CALVER_VERSION = "2020.01.01_1";
const MOCK_RELEASE_NAME_CALVER = `Version ${A_CALVER_VERSION}`;
const MOCK_RELEASE_BRANCH_NAME_CALVER = `rc/${A_CALVER_VERSION}`;
const MOCK_RELEASE_CANDIDATE_TAG_NAME_CALVER = `rc-${A_CALVER_VERSION}`;
const MOCK_RELEASE_VERSION_TAG_NAME_CALVER = `version-${A_CALVER_VERSION}`;
const A_SEMVER_VERSION = "1.2.3";
const MOCK_RELEASE_NAME_SEMVER = `Version ${A_SEMVER_VERSION}`;
const MOCK_RELEASE_BRANCH_NAME_SEMVER = `rc/${A_SEMVER_VERSION}`;
const MOCK_RELEASE_CANDIDATE_TAG_NAME_SEMVER = `rc-${A_SEMVER_VERSION}`;
const MOCK_RELEASE_VERSION_TAG_NAME_SEMVER = `version-${A_SEMVER_VERSION}`;
const createMockTag = (overrides) => ({
  tag: {
    date: "2000-01-01T10:00:00.000Z",
    objectSha: "mock_tag_object_sha",
    userEmail: mockEmail,
    username: mockUsername,
    ...overrides
  }
});
const createMockCommit = (overrides) => ({
  commit: {
    commit: {
      message: "mock_commit_commit_message"
    },
    htmlUrl: "https://mock_commit_html_url",
    sha: "mock_commit_sha",
    createdAt: "2000-01-01T10:00:00.000Z",
    ...overrides
  }
});
const mockUser = {
  username: mockUsername,
  email: mockEmail
};
const mockSemverProject = {
  owner: mockOwner,
  repo: mockRepo,
  versioningStrategy: "semver",
  isProvidedViaProps: false
};
const mockCalverProject = {
  owner: mockOwner,
  repo: mockRepo,
  versioningStrategy: "calver",
  isProvidedViaProps: false
};
const mockSearchCalver = `?versioningStrategy=${mockCalverProject.versioningStrategy}&owner=${mockCalverProject.owner}&repo=${mockCalverProject.repo}`;
const mockSearchSemver = `?versioningStrategy=${mockSemverProject.versioningStrategy}&owner=${mockSemverProject.owner}&repo=${mockSemverProject.repo}`;
const mockDefaultBranch = "mock_defaultBranch";
const mockNextGitInfoSemver = {
  rcBranch: MOCK_RELEASE_BRANCH_NAME_SEMVER,
  rcReleaseTag: MOCK_RELEASE_CANDIDATE_TAG_NAME_SEMVER,
  releaseName: MOCK_RELEASE_NAME_SEMVER
};
const mockNextGitInfoCalver = {
  rcBranch: MOCK_RELEASE_BRANCH_NAME_CALVER,
  rcReleaseTag: MOCK_RELEASE_CANDIDATE_TAG_NAME_CALVER,
  releaseName: MOCK_RELEASE_NAME_CALVER
};
const mockTagParts = {
  prefix: "rc",
  calver: "2020.01.01",
  patch: 1
};
const mockCtaMessage = "Patch Release Candidate";
const mockBumpedTag = "rc-2020.01.01_1337";
const createMockRelease = ({
  id = 1,
  prerelease = false,
  ...rest
} = {}) => ({
  id,
  htmlUrl: "https://mock_release_html_url",
  prerelease,
  tagName: MOCK_RELEASE_CANDIDATE_TAG_NAME_CALVER,
  targetCommitish: MOCK_RELEASE_BRANCH_NAME_CALVER,
  ...rest
});
const mockReleaseCandidateCalver = createMockRelease({
  prerelease: true,
  tagName: MOCK_RELEASE_CANDIDATE_TAG_NAME_CALVER,
  targetCommitish: MOCK_RELEASE_BRANCH_NAME_CALVER
});
const mockReleaseVersionCalver = createMockRelease({
  prerelease: false,
  tagName: MOCK_RELEASE_VERSION_TAG_NAME_CALVER,
  targetCommitish: MOCK_RELEASE_BRANCH_NAME_CALVER
});
const mockReleaseCandidateSemver = createMockRelease({
  prerelease: true,
  tagName: MOCK_RELEASE_CANDIDATE_TAG_NAME_SEMVER,
  targetCommitish: MOCK_RELEASE_BRANCH_NAME_SEMVER
});
const mockReleaseVersionSemver = createMockRelease({
  prerelease: false,
  tagName: MOCK_RELEASE_VERSION_TAG_NAME_SEMVER,
  targetCommitish: MOCK_RELEASE_BRANCH_NAME_SEMVER
});
const createMockBranch = ({
  ...rest
} = {}) => ({
  name: MOCK_RELEASE_BRANCH_NAME_SEMVER,
  commit: {
    sha: "mock_branch_commit_sha",
    commit: {
      tree: {
        sha: "mock_branch_commit_commit_tree_sha"
      }
    }
  },
  links: {
    html: "https://mock_branch_links_html"
  },
  ...rest
});
const mockReleaseBranch = createMockBranch();
const createMockRecentCommit = ({
  ...rest
}) => ({
  author: {
    htmlUrl: "https://author_html_url",
    login: "author_login"
  },
  commit: {
    message: "commit_message"
  },
  sha: "mock_sha",
  firstParentSha: "mock_first_parent_sha",
  htmlUrl: "https://mock_htmlUrl",
  ...rest
});
const mockSelectedPatchCommit = createMockRecentCommit({
  sha: "mock_sha_selected_patch_commit"
});

var testHelpers$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  mockUsername: mockUsername,
  mockEmail: mockEmail,
  mockOwner: mockOwner,
  mockRepo: mockRepo,
  A_CALVER_VERSION: A_CALVER_VERSION,
  MOCK_RELEASE_NAME_CALVER: MOCK_RELEASE_NAME_CALVER,
  MOCK_RELEASE_BRANCH_NAME_CALVER: MOCK_RELEASE_BRANCH_NAME_CALVER,
  MOCK_RELEASE_CANDIDATE_TAG_NAME_CALVER: MOCK_RELEASE_CANDIDATE_TAG_NAME_CALVER,
  MOCK_RELEASE_VERSION_TAG_NAME_CALVER: MOCK_RELEASE_VERSION_TAG_NAME_CALVER,
  A_SEMVER_VERSION: A_SEMVER_VERSION,
  MOCK_RELEASE_NAME_SEMVER: MOCK_RELEASE_NAME_SEMVER,
  MOCK_RELEASE_BRANCH_NAME_SEMVER: MOCK_RELEASE_BRANCH_NAME_SEMVER,
  MOCK_RELEASE_CANDIDATE_TAG_NAME_SEMVER: MOCK_RELEASE_CANDIDATE_TAG_NAME_SEMVER,
  MOCK_RELEASE_VERSION_TAG_NAME_SEMVER: MOCK_RELEASE_VERSION_TAG_NAME_SEMVER,
  createMockTag: createMockTag,
  createMockCommit: createMockCommit,
  mockUser: mockUser,
  mockSemverProject: mockSemverProject,
  mockCalverProject: mockCalverProject,
  mockSearchCalver: mockSearchCalver,
  mockSearchSemver: mockSearchSemver,
  mockDefaultBranch: mockDefaultBranch,
  mockNextGitInfoSemver: mockNextGitInfoSemver,
  mockNextGitInfoCalver: mockNextGitInfoCalver,
  mockTagParts: mockTagParts,
  mockCtaMessage: mockCtaMessage,
  mockBumpedTag: mockBumpedTag,
  createMockRelease: createMockRelease,
  mockReleaseCandidateCalver: mockReleaseCandidateCalver,
  mockReleaseVersionCalver: mockReleaseVersionCalver,
  mockReleaseCandidateSemver: mockReleaseCandidateSemver,
  mockReleaseVersionSemver: mockReleaseVersionSemver,
  createMockBranch: createMockBranch,
  mockReleaseBranch: mockReleaseBranch,
  createMockRecentCommit: createMockRecentCommit,
  mockSelectedPatchCommit: mockSelectedPatchCommit
});

var testHelpers = /*#__PURE__*/Object.freeze({
  __proto__: null,
  stats: stats,
  testHelpers: testHelpers$1,
  testIds: testIds
});

const gitReleaseManagerPlugin = createPlugin({
  id: "git-release-manager",
  routes: {
    root: rootRouteRef
  },
  apis: [
    createApiFactory({
      api: gitReleaseManagerApiRef,
      deps: {
        configApi: configApiRef,
        githubAuthApi: githubAuthApiRef
      },
      factory: ({ configApi, githubAuthApi }) => {
        return new GitReleaseClient({
          configApi,
          githubAuthApi
        });
      }
    })
  ]
});
const GitReleaseManagerPage = gitReleaseManagerPlugin.provide(createRoutableExtension({
  name: "GitReleaseManagerPage",
  component: () => import('./GitReleaseManager-b1a11869.esm.js').then((m) => m.GitReleaseManager),
  mountPoint: rootRouteRef
}));

const internals = {
  components,
  constants,
  helpers,
  testHelpers
};

export { Differ as D, GitReleaseManagerError as G, InfoCardPlus as I, LinearProgressWithLabel as L, NoLatestRelease as N, ResponseStepDialog as R, SEMVER_PARTS as S, TAG_OBJECT_MESSAGE as T, VERSIONING_STRATEGIES as V, getBumpedSemverTagParts as a, gitReleaseManagerApiRef as b, TEST_IDS as c, calverRegexp as d, Transition as e, getBumpedTag as f, getSemverTagParts as g, getTagParts as h, RefetchContext as i, isProjectValid as j, internals as k, gitReleaseManagerPlugin as l, GitReleaseManagerPage as m, semverRegexp as s, validateTagName as v };
//# sourceMappingURL=index-08755cda.esm.js.map