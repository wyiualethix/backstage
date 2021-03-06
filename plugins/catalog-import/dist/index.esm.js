import { createApiRef, createRouteRef, createPlugin, createApiFactory, discoveryApiRef, identityApiRef, configApiRef, createRoutableExtension, useApi, useApp, errorApiRef } from '@backstage/core-plugin-api';
import { scmAuthApiRef, scmIntegrationsApiRef } from '@backstage/integration-react';
import { catalogApiRef, humanizeEntityRef, EntityRefLink } from '@backstage/plugin-catalog-react';
import { Octokit } from '@octokit/rest';
import { Base64 } from 'js-base64';
import parseGitUrl from 'git-url-parse';
import { trimEnd } from 'lodash';
import { InfoCard, Link, CodeSnippet, MarkdownContent, Page, Header, Content, ContentHeader, SupportButton } from '@backstage/core-components';
import { Typography, Chip, Button, CircularProgress, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, IconButton, Collapse, Grid, TextField, FormHelperText, Card, CardHeader, CardContent, Box, Checkbox, StepLabel, FormControlLabel, Stepper, Step, StepContent } from '@material-ui/core';
import React, { useReducer, useState, useCallback, useEffect, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import WorkIcon from '@material-ui/icons/Work';
import partition from 'lodash/partition';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { Autocomplete } from '@material-ui/lab';
import YAML from 'yaml';
import { assertError } from '@backstage/errors';
import useAsync from 'react-use/lib/useAsync';
import { stringifyEntityRef } from '@backstage/catalog-model';

const catalogImportApiRef = createApiRef({
  id: "plugin.catalog-import.service"
});

const getGithubIntegrationConfig = (scmIntegrationsApi, location) => {
  const integration = scmIntegrationsApi.github.byUrl(location);
  if (!integration) {
    return void 0;
  }
  const { name: repo, owner } = parseGitUrl(location);
  return {
    repo,
    owner,
    githubIntegrationConfig: integration.config
  };
};

function asInputRef(renderResult) {
  const { ref, ...rest } = renderResult;
  return {
    inputRef: ref,
    ...rest
  };
}
function getCatalogFilename(config) {
  var _a;
  return (_a = config.getOptionalString("catalog.import.entityFilename")) != null ? _a : "catalog-info.yaml";
}
function getBranchName(config) {
  var _a;
  return (_a = config.getOptionalString("catalog.import.pullRequestBranchName")) != null ? _a : "backstage-integration";
}

class CatalogImportClient {
  constructor(options) {
    this.discoveryApi = options.discoveryApi;
    this.scmAuthApi = options.scmAuthApi;
    this.identityApi = options.identityApi;
    this.scmIntegrationsApi = options.scmIntegrationsApi;
    this.catalogApi = options.catalogApi;
    this.configApi = options.configApi;
  }
  async analyzeUrl(url) {
    var _a;
    if (new URL(url).pathname.match(/\.ya?ml$/) || ((_a = new URL(url).searchParams.get("path")) == null ? void 0 : _a.match(/.ya?ml$/))) {
      const location = await this.catalogApi.addLocation({
        type: "url",
        target: url,
        dryRun: true
      });
      return {
        type: "locations",
        locations: [
          {
            exists: location.exists,
            target: location.location.target,
            entities: location.entities.map((e) => {
              var _a2;
              return {
                kind: e.kind,
                namespace: (_a2 = e.metadata.namespace) != null ? _a2 : "default",
                name: e.metadata.name
              };
            })
          }
        ]
      };
    }
    const ghConfig = getGithubIntegrationConfig(this.scmIntegrationsApi, url);
    if (!ghConfig) {
      const other = this.scmIntegrationsApi.byUrl(url);
      const catalogFilename = getCatalogFilename(this.configApi);
      if (other) {
        throw new Error(`The ${other.title} integration only supports full URLs to ${catalogFilename} files. Did you try to pass in the URL of a directory instead?`);
      }
      throw new Error(`This URL was not recognized as a valid GitHub URL because there was no configured integration that matched the given host name. You could try to paste the full URL to a ${catalogFilename} file instead.`);
    }
    const locations = await this.checkGitHubForExistingCatalogInfo({
      ...ghConfig,
      url
    });
    if (locations.length > 0) {
      return {
        type: "locations",
        locations
      };
    }
    return {
      type: "repository",
      integrationType: "github",
      url,
      generatedEntities: await this.generateEntityDefinitions({
        repo: url
      })
    };
  }
  async preparePullRequest() {
    var _a;
    const appTitle = (_a = this.configApi.getOptionalString("app.title")) != null ? _a : "Backstage";
    const appBaseUrl = this.configApi.getString("app.baseUrl");
    const catalogFilename = getCatalogFilename(this.configApi);
    return {
      title: `Add ${catalogFilename} config file`,
      body: `This pull request adds a **Backstage entity metadata file** to this repository so that the component can be added to the [${appTitle} software catalog](${appBaseUrl}).

After this pull request is merged, the component will become available.

For more information, read an [overview of the Backstage software catalog](https://backstage.io/docs/features/software-catalog/software-catalog-overview).`
    };
  }
  async submitPullRequest(options) {
    const { repositoryUrl, fileContent, title, body } = options;
    const ghConfig = getGithubIntegrationConfig(this.scmIntegrationsApi, repositoryUrl);
    if (ghConfig) {
      return await this.submitGitHubPrToRepo({
        ...ghConfig,
        repositoryUrl,
        fileContent,
        title,
        body
      });
    }
    throw new Error("unimplemented!");
  }
  async generateEntityDefinitions(options) {
    const { token } = await this.identityApi.getCredentials();
    const response = await fetch(`${await this.discoveryApi.getBaseUrl("catalog")}/analyze-location`, {
      headers: {
        "Content-Type": "application/json",
        ...token && { Authorization: `Bearer ${token}` }
      },
      method: "POST",
      body: JSON.stringify({
        location: { type: "url", target: options.repo }
      })
    }).catch((e) => {
      throw new Error(`Failed to generate entity definitions, ${e.message}`);
    });
    if (!response.ok) {
      throw new Error(`Failed to generate entity definitions. Received http response ${response.status}: ${response.statusText}`);
    }
    const payload = await response.json();
    return payload.generateEntities.map((x) => x.entity);
  }
  async checkGitHubForExistingCatalogInfo(options) {
    const { url, owner, repo, githubIntegrationConfig } = options;
    const { token } = await this.scmAuthApi.getCredentials({ url });
    const octo = new Octokit({
      auth: token,
      baseUrl: githubIntegrationConfig.apiBaseUrl
    });
    const catalogFilename = getCatalogFilename(this.configApi);
    const query = `repo:${owner}/${repo}+filename:${catalogFilename}`;
    const searchResult = await octo.search.code({ q: query }).catch((e) => {
      throw new Error(formatHttpErrorMessage("Couldn't search repository for metadata file.", e));
    });
    const exists = searchResult.data.total_count > 0;
    if (exists) {
      const repoInformation = await octo.repos.get({ owner, repo }).catch((e) => {
        throw new Error(formatHttpErrorMessage("Couldn't fetch repo data", e));
      });
      const defaultBranch = repoInformation.data.default_branch;
      return await Promise.all(searchResult.data.items.map((i) => `${trimEnd(url, "/")}/blob/${defaultBranch}/${i.path}`).map(async (target) => {
        const result = await this.catalogApi.addLocation({
          type: "url",
          target,
          dryRun: true
        });
        return {
          target,
          exists: result.exists,
          entities: result.entities.map((e) => {
            var _a;
            return {
              kind: e.kind,
              namespace: (_a = e.metadata.namespace) != null ? _a : "default",
              name: e.metadata.name
            };
          })
        };
      }));
    }
    return [];
  }
  async submitGitHubPrToRepo(options) {
    const {
      owner,
      repo,
      title,
      body,
      fileContent,
      repositoryUrl,
      githubIntegrationConfig
    } = options;
    const { token } = await this.scmAuthApi.getCredentials({
      url: repositoryUrl,
      additionalScope: {
        repoWrite: true
      }
    });
    const octo = new Octokit({
      auth: token,
      baseUrl: githubIntegrationConfig.apiBaseUrl
    });
    const branchName = getBranchName(this.configApi);
    const fileName = getCatalogFilename(this.configApi);
    const repoData = await octo.repos.get({
      owner,
      repo
    }).catch((e) => {
      throw new Error(formatHttpErrorMessage("Couldn't fetch repo data", e));
    });
    const parentRef = await octo.git.getRef({
      owner,
      repo,
      ref: `heads/${repoData.data.default_branch}`
    }).catch((e) => {
      throw new Error(formatHttpErrorMessage("Couldn't fetch default branch data", e));
    });
    await octo.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: parentRef.data.object.sha
    }).catch((e) => {
      throw new Error(formatHttpErrorMessage(`Couldn't create a new branch with name '${branchName}'`, e));
    });
    await octo.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: fileName,
      message: title,
      content: Base64.encode(fileContent),
      branch: branchName
    }).catch((e) => {
      throw new Error(formatHttpErrorMessage(`Couldn't create a commit with ${fileName} file added`, e));
    });
    const pullRequestResponse = await octo.pulls.create({
      owner,
      repo,
      title,
      head: branchName,
      body,
      base: repoData.data.default_branch
    }).catch((e) => {
      throw new Error(formatHttpErrorMessage(`Couldn't create a pull request for ${branchName} branch`, e));
    });
    return {
      link: pullRequestResponse.data.html_url,
      location: `https://${githubIntegrationConfig.host}/${owner}/${repo}/blob/${repoData.data.default_branch}/${fileName}`
    };
  }
}
function formatHttpErrorMessage(message, error) {
  return `${message}, received http response status code ${error.status}: ${error.message}`;
}

const rootRouteRef = createRouteRef({
  id: "catalog-import"
});
const catalogImportPlugin = createPlugin({
  id: "catalog-import",
  apis: [
    createApiFactory({
      api: catalogImportApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        scmAuthApi: scmAuthApiRef,
        identityApi: identityApiRef,
        scmIntegrationsApi: scmIntegrationsApiRef,
        catalogApi: catalogApiRef,
        configApi: configApiRef
      },
      factory: ({
        discoveryApi,
        scmAuthApi,
        identityApi,
        scmIntegrationsApi,
        catalogApi,
        configApi
      }) => new CatalogImportClient({
        discoveryApi,
        scmAuthApi,
        scmIntegrationsApi,
        identityApi,
        catalogApi,
        configApi
      })
    })
  ],
  routes: {
    importPage: rootRouteRef
  }
});
const CatalogImportPage = catalogImportPlugin.provide(createRoutableExtension({
  name: "CatalogImportPage",
  component: () => import('./esm/index-b86cf63c.esm.js').then((m) => m.ImportPage),
  mountPoint: rootRouteRef
}));

function useCatalogFilename() {
  const config = useApi(configApiRef);
  return getCatalogFilename(config);
}

const ImportInfoCard = (props) => {
  const {
    exampleLocationUrl = "https://github.com/backstage/backstage/blob/master/catalog-info.yaml",
    exampleRepositoryUrl = "https://github.com/backstage/backstage"
  } = props;
  const configApi = useApi(configApiRef);
  const appTitle = configApi.getOptional("app.title") || "Backstage";
  const catalogImportApi = useApi(catalogImportApiRef);
  const integrations = configApi.getConfig("integrations");
  const hasGithubIntegration = integrations.has("github");
  const catalogFilename = useCatalogFilename();
  return /* @__PURE__ */ React.createElement(InfoCard, {
    title: "Register an existing component",
    titleTypographyProps: { component: "h3" },
    deepLink: {
      title: "Learn more about the Software Catalog",
      link: "https://backstage.io/docs/features/software-catalog/software-catalog-overview"
    }
  }, /* @__PURE__ */ React.createElement(Typography, {
    variant: "body2",
    paragraph: true
  }, "Enter the URL to your source code repository to add it to ", appTitle, "."), /* @__PURE__ */ React.createElement(Typography, {
    component: "h4",
    variant: "h6"
  }, "Link to an existing entity file"), /* @__PURE__ */ React.createElement(Typography, {
    variant: "subtitle2",
    color: "textSecondary",
    paragraph: true
  }, "Example: ", /* @__PURE__ */ React.createElement("code", null, exampleLocationUrl)), /* @__PURE__ */ React.createElement(Typography, {
    variant: "body2",
    paragraph: true
  }, "The wizard analyzes the file, previews the entities, and adds them to the ", appTitle, " catalog."), hasGithubIntegration && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Typography, {
    component: "h4",
    variant: "h6"
  }, "Link to a repository", " ", /* @__PURE__ */ React.createElement(Chip, {
    label: "GitHub only",
    variant: "outlined",
    size: "small"
  })), /* @__PURE__ */ React.createElement(Typography, {
    variant: "subtitle2",
    color: "textSecondary",
    paragraph: true
  }, "Example: ", /* @__PURE__ */ React.createElement("code", null, exampleRepositoryUrl)), /* @__PURE__ */ React.createElement(Typography, {
    variant: "body2",
    paragraph: true
  }, "The wizard discovers all ", /* @__PURE__ */ React.createElement("code", null, catalogFilename), " files in the repository, previews the entities, and adds them to the ", appTitle, " ", "catalog."), catalogImportApi.preparePullRequest && /* @__PURE__ */ React.createElement(Typography, {
    variant: "body2",
    paragraph: true
  }, "If no entities are found, the wizard will prepare a Pull Request that adds an example ", /* @__PURE__ */ React.createElement("code", null, catalogFilename), " and prepares the ", appTitle, " catalog to load all entities as soon as the Pull Request is merged.")));
};

function init(initialUrl) {
  return {
    activeFlow: "unknown",
    activeState: "analyze",
    analysisUrl: initialUrl,
    previousStates: []
  };
}
function reducer(state, action) {
  switch (action.type) {
    case "onAnalysis": {
      if (state.activeState !== "analyze") {
        return state;
      }
      const { activeState, previousStates } = state;
      const [activeFlow, analysisUrl, analyzeResult, opts] = action.args;
      return {
        ...state,
        analysisUrl,
        activeFlow,
        analyzeResult,
        prepareResult: opts == null ? void 0 : opts.prepareResult,
        activeState: (opts == null ? void 0 : opts.prepareResult) === void 0 ? "prepare" : "review",
        previousStates: previousStates.concat(activeState)
      };
    }
    case "onPrepare": {
      if (state.activeState !== "prepare") {
        return state;
      }
      const { activeState, previousStates } = state;
      const [prepareResult, opts] = action.args;
      return {
        ...state,
        prepareResult,
        activeState: "review",
        previousStates: (opts == null ? void 0 : opts.notRepeatable) ? [] : previousStates.concat(activeState)
      };
    }
    case "onReview": {
      if (state.activeState !== "review") {
        return state;
      }
      const { activeState, previousStates } = state;
      const [reviewResult] = action.args;
      return {
        ...state,
        reviewResult,
        activeState: "finish",
        previousStates: previousStates.concat(activeState)
      };
    }
    case "onGoBack": {
      const { activeState, previousStates } = state;
      return {
        ...state,
        activeState: previousStates.length > 0 ? previousStates[previousStates.length - 1] : activeState,
        previousStates: previousStates.slice(0, previousStates.length - 1)
      };
    }
    case "onReset":
      return {
        ...init(action.initialUrl),
        prepareResult: state.prepareResult
      };
    default:
      throw new Error();
  }
}
const useImportState = (options) => {
  const [state, dispatch] = useReducer(reducer, options == null ? void 0 : options.initialUrl, init);
  const { activeFlow, activeState, analysisUrl, previousStates } = state;
  return {
    activeFlow,
    activeState,
    activeStepNumber: ["analyze", "prepare", "review", "finish"].indexOf(activeState),
    analysisUrl,
    analyzeResult: state.analyzeResult,
    prepareResult: state.prepareResult,
    reviewResult: state.reviewResult,
    onAnalysis: (flow, url, result, opts) => dispatch({
      type: "onAnalysis",
      args: [flow, url, result, opts]
    }),
    onPrepare: (result, opts) => dispatch({
      type: "onPrepare",
      args: [result, opts]
    }),
    onReview: (result) => dispatch({ type: "onReview", args: [result] }),
    onGoBack: previousStates.length > 0 ? () => dispatch({ type: "onGoBack" }) : void 0,
    onReset: () => dispatch({ type: "onReset", initialUrl: options == null ? void 0 : options.initialUrl })
  };
};

const useStyles$3 = makeStyles((theme) => ({
  wrapper: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
    position: "relative"
  },
  buttonProgress: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1)
  }
}));
const NextButton = (props) => {
  const { loading, ...buttonProps } = props;
  const classes = useStyles$3();
  return /* @__PURE__ */ React.createElement("div", {
    className: classes.wrapper
  }, /* @__PURE__ */ React.createElement(Button, {
    color: "primary",
    variant: "contained",
    ...buttonProps,
    disabled: props.disabled || props.loading
  }), props.loading && /* @__PURE__ */ React.createElement(CircularProgress, {
    size: "1.5rem",
    className: classes.buttonProgress
  }), props.loading);
};
const BackButton = (props) => {
  const classes = useStyles$3();
  return /* @__PURE__ */ React.createElement(Button, {
    variant: "outlined",
    className: classes.button,
    ...props
  }, props.children || "Back");
};

const useStyles$2 = makeStyles((theme) => ({
  nested: {
    paddingLeft: theme.spacing(4)
  }
}));
function sortEntities(entities) {
  return entities.sort((a, b) => humanizeEntityRef(a).localeCompare(humanizeEntityRef(b)));
}
const EntityListComponent = (props) => {
  const {
    locations,
    collapsed = false,
    locationListItemIcon,
    onItemClick,
    firstListItem,
    withLinks = false
  } = props;
  const app = useApp();
  const classes = useStyles$2();
  const [expandedUrls, setExpandedUrls] = useState([]);
  const handleClick = (url) => {
    setExpandedUrls((urls) => urls.includes(url) ? urls.filter((u) => u !== url) : urls.concat(url));
  };
  return /* @__PURE__ */ React.createElement(List, null, firstListItem, locations.map((r) => /* @__PURE__ */ React.createElement(React.Fragment, {
    key: r.target
  }, /* @__PURE__ */ React.createElement(ListItem, {
    dense: true,
    button: Boolean(onItemClick),
    onClick: () => onItemClick == null ? void 0 : onItemClick.call(undefined, r.target)
  }, /* @__PURE__ */ React.createElement(ListItemIcon, null, locationListItemIcon(r.target)), /* @__PURE__ */ React.createElement(ListItemText, {
    primary: r.target,
    secondary: `Entities: ${r.entities.length}`
  }), collapsed && /* @__PURE__ */ React.createElement(ListItemSecondaryAction, null, /* @__PURE__ */ React.createElement(IconButton, {
    edge: "end",
    onClick: () => handleClick(r.target)
  }, expandedUrls.includes(r.target) ? /* @__PURE__ */ React.createElement(ExpandLessIcon, null) : /* @__PURE__ */ React.createElement(ExpandMoreIcon, null)))), /* @__PURE__ */ React.createElement(Collapse, {
    in: !collapsed || expandedUrls.includes(r.target),
    timeout: "auto",
    unmountOnExit: true
  }, /* @__PURE__ */ React.createElement(List, {
    component: "div",
    disablePadding: true,
    dense: true
  }, sortEntities(r.entities).map((entity) => {
    var _a;
    const Icon = (_a = app.getSystemIcon(`kind:${entity.kind.toLocaleLowerCase("en-US")}`)) != null ? _a : WorkIcon;
    return /* @__PURE__ */ React.createElement(ListItem, {
      key: humanizeEntityRef(entity),
      className: classes.nested,
      ...withLinks ? {
        component: EntityRefLink,
        entityRef: entity,
        button: withLinks
      } : {}
    }, /* @__PURE__ */ React.createElement(ListItemIcon, null, /* @__PURE__ */ React.createElement(Icon, null)), /* @__PURE__ */ React.createElement(ListItemText, {
      primary: humanizeEntityRef(entity)
    }));
  }))))));
};

const StepFinishImportLocation = ({ prepareResult, onReset }) => {
  const continueButton = /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    spacing: 0
  }, /* @__PURE__ */ React.createElement(BackButton, {
    onClick: onReset
  }, "Register another"));
  if (prepareResult.type === "repository") {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Typography, {
      paragraph: true
    }, "The following Pull Request has been opened:", " ", /* @__PURE__ */ React.createElement(Link, {
      to: prepareResult.pullRequest.url,
      target: "_blank",
      rel: "noreferrer"
    }, prepareResult.pullRequest.url)), /* @__PURE__ */ React.createElement(Typography, {
      paragraph: true
    }, "Your entities will be imported as soon as the Pull Request is merged."), continueButton);
  }
  const [existingLocations, newLocations] = partition(prepareResult.locations, (l) => l.exists);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, newLocations.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Typography, null, "The following entities have been added to the catalog:"), /* @__PURE__ */ React.createElement(EntityListComponent, {
    locations: newLocations,
    locationListItemIcon: () => /* @__PURE__ */ React.createElement(LocationOnIcon, null),
    withLinks: true
  })), existingLocations.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Typography, null, "A refresh was triggered for the following locations:"), /* @__PURE__ */ React.createElement(EntityListComponent, {
    locations: existingLocations,
    locationListItemIcon: () => /* @__PURE__ */ React.createElement(LocationOnIcon, null),
    withLinks: true
  })), continueButton);
};

const StepInitAnalyzeUrl = (props) => {
  const {
    onAnalysis,
    analysisUrl = "",
    disablePullRequest = false,
    exampleLocationUrl = "https://github.com/backstage/backstage/blob/master/catalog-info.yaml"
  } = props;
  const errorApi = useApi(errorApiRef);
  const catalogImportApi = useApi(catalogImportApiRef);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      url: analysisUrl
    }
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(void 0);
  const handleResult = useCallback(async ({ url }) => {
    var _a, _b, _c;
    setSubmitted(true);
    try {
      const analysisResult = await catalogImportApi.analyzeUrl(url);
      switch (analysisResult.type) {
        case "repository":
          if (!disablePullRequest && analysisResult.generatedEntities.length > 0) {
            onAnalysis("no-location", url, analysisResult);
          } else {
            setError("Couldn't generate entities for your repository");
            setSubmitted(false);
          }
          break;
        case "locations": {
          if (analysisResult.locations.length === 1) {
            onAnalysis("single-location", url, analysisResult, {
              prepareResult: analysisResult
            });
          } else if (analysisResult.locations.length > 1) {
            onAnalysis("multiple-locations", url, analysisResult);
          } else {
            setError("There are no entities at this location");
            setSubmitted(false);
          }
          break;
        }
        default: {
          const err = `Received unknown analysis result of type ${analysisResult.type}. Please contact the support team.`;
          setError(err);
          setSubmitted(false);
          errorApi.post(new Error(err));
          break;
        }
      }
    } catch (e) {
      setError((_c = (_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.error) == null ? void 0 : _b.message) != null ? _c : e.message);
      setSubmitted(false);
    }
  }, [catalogImportApi, disablePullRequest, errorApi, onAnalysis]);
  return /* @__PURE__ */ React.createElement("form", {
    onSubmit: handleSubmit(handleResult)
  }, /* @__PURE__ */ React.createElement(TextField, {
    ...asInputRef(register("url", {
      required: true,
      validate: {
        httpsValidator: (value) => typeof value === "string" && value.match(/^http[s]?:\/\//) !== null || "Must start with http:// or https://."
      }
    })),
    fullWidth: true,
    id: "url",
    label: "Repository URL",
    placeholder: exampleLocationUrl,
    helperText: "Enter the full path to your entity file to start tracking your component",
    margin: "normal",
    variant: "outlined",
    error: Boolean(errors.url),
    required: true
  }), errors.url && /* @__PURE__ */ React.createElement(FormHelperText, {
    error: true
  }, errors.url.message), error && /* @__PURE__ */ React.createElement(FormHelperText, {
    error: true
  }, error), /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    spacing: 0
  }, /* @__PURE__ */ React.createElement(NextButton, {
    disabled: Boolean(errors.url) || !watch("url"),
    loading: submitted,
    type: "submit"
  }, "Analyze")));
};

const AutocompleteTextField = (props) => {
  const {
    name,
    options,
    required,
    errors,
    rules,
    loading = false,
    loadingText,
    helperText,
    errorHelperText,
    textFieldProps = {}
  } = props;
  return /* @__PURE__ */ React.createElement(Controller, {
    name,
    rules,
    render: ({ field: { onChange } }) => /* @__PURE__ */ React.createElement(Autocomplete, {
      loading,
      loadingText,
      options: options || [],
      autoSelect: true,
      freeSolo: true,
      onChange: (_event, value) => onChange(value),
      renderInput: (params) => /* @__PURE__ */ React.createElement(TextField, {
        ...params,
        helperText: (errors == null ? void 0 : errors[name]) && errorHelperText || helperText,
        error: Boolean(errors == null ? void 0 : errors[name]),
        margin: "normal",
        variant: "outlined",
        required,
        InputProps: {
          ...params.InputProps,
          endAdornment: /* @__PURE__ */ React.createElement(React.Fragment, null, loading ? /* @__PURE__ */ React.createElement(CircularProgress, {
            color: "inherit",
            size: "1em"
          }) : null, params.InputProps.endAdornment)
        },
        ...textFieldProps
      })
    })
  });
};

const PreparePullRequestForm = (props) => {
  const { defaultValues, onSubmit, render } = props;
  const methods = useForm({ mode: "onTouched", defaultValues });
  const { handleSubmit, watch, control, register, formState, setValue } = methods;
  return /* @__PURE__ */ React.createElement(FormProvider, {
    ...methods
  }, /* @__PURE__ */ React.createElement("form", {
    onSubmit: handleSubmit(onSubmit)
  }, render({ values: watch(), formState, register, control, setValue })));
};

const PreviewCatalogInfoComponent = (props) => {
  const { repositoryUrl, entities, classes } = props;
  const catalogFilename = useCatalogFilename();
  return /* @__PURE__ */ React.createElement(Card, {
    variant: "outlined",
    className: classes == null ? void 0 : classes.card
  }, /* @__PURE__ */ React.createElement(CardHeader, {
    title: /* @__PURE__ */ React.createElement("code", null, `${trimEnd(repositoryUrl, "/")}/${catalogFilename}`)
  }), /* @__PURE__ */ React.createElement(CardContent, {
    className: classes == null ? void 0 : classes.cardContent
  }, /* @__PURE__ */ React.createElement(CodeSnippet, {
    text: entities.map((e) => YAML.stringify(e)).join("---\n").trim(),
    language: "yaml"
  })));
};

const PreviewPullRequestComponent = (props) => {
  const { title, description, classes } = props;
  return /* @__PURE__ */ React.createElement(Card, {
    variant: "outlined",
    className: classes == null ? void 0 : classes.card
  }, /* @__PURE__ */ React.createElement(CardHeader, {
    title,
    subheader: "Create a new Pull Request"
  }), /* @__PURE__ */ React.createElement(CardContent, {
    className: classes == null ? void 0 : classes.cardContent
  }, /* @__PURE__ */ React.createElement(MarkdownContent, {
    content: description
  })));
};

const useStyles$1 = makeStyles((theme) => ({
  previewCard: {
    marginTop: theme.spacing(1)
  },
  previewCardContent: {
    paddingTop: 0
  }
}));
function generateEntities(entities, componentName, owner) {
  return entities.map((e) => ({
    ...e,
    apiVersion: e.apiVersion,
    kind: e.kind,
    metadata: {
      ...e.metadata,
      name: componentName
    },
    spec: {
      ...e.spec,
      ...owner ? { owner } : {}
    }
  }));
}
const StepPrepareCreatePullRequest = (props) => {
  var _a, _b, _c, _d, _e, _f;
  const { analyzeResult, onPrepare, onGoBack, renderFormFields } = props;
  const classes = useStyles$1();
  const catalogApi = useApi(catalogApiRef);
  const catalogImportApi = useApi(catalogImportApiRef);
  const errorApi = useApi(errorApiRef);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState();
  const catalogFilename = useCatalogFilename();
  const {
    loading: prDefaultsLoading,
    value: prDefaults,
    error: prDefaultsError
  } = useAsync(() => catalogImportApi.preparePullRequest(), [catalogImportApi.preparePullRequest]);
  useEffect(() => {
    if (prDefaultsError) {
      errorApi.post(prDefaultsError);
    }
  }, [prDefaultsError, errorApi]);
  const { loading: groupsLoading, value: groups } = useAsync(async () => {
    const groupEntities = await catalogApi.getEntities({
      filter: { kind: "group" }
    });
    return groupEntities.items.map((e) => humanizeEntityRef(e, { defaultKind: "group" })).sort();
  });
  const handleResult = useCallback(async (data) => {
    setSubmitted(true);
    try {
      const pr = await catalogImportApi.submitPullRequest({
        repositoryUrl: analyzeResult.url,
        title: data.title,
        body: data.body,
        fileContent: generateEntities(analyzeResult.generatedEntities, data.componentName, data.owner).map((e) => YAML.stringify(e)).join("---\n")
      });
      onPrepare({
        type: "repository",
        url: analyzeResult.url,
        integrationType: analyzeResult.integrationType,
        pullRequest: {
          url: pr.link
        },
        locations: [
          {
            target: pr.location,
            entities: generateEntities(analyzeResult.generatedEntities, data.componentName, data.owner).map((e) => ({
              kind: e.kind,
              namespace: e.metadata.namespace,
              name: e.metadata.name
            }))
          }
        ]
      }, { notRepeatable: true });
    } catch (e) {
      assertError(e);
      setError(e.message);
      setSubmitted(false);
    }
  }, [
    analyzeResult.generatedEntities,
    analyzeResult.integrationType,
    analyzeResult.url,
    catalogImportApi,
    onPrepare
  ]);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Typography, null, "You entered a link to a ", analyzeResult.integrationType, " repository but a", " ", /* @__PURE__ */ React.createElement("code", null, catalogFilename), " could not be found. Use this form to open a Pull Request that creates one."), !prDefaultsLoading && /* @__PURE__ */ React.createElement(PreparePullRequestForm, {
    onSubmit: handleResult,
    defaultValues: {
      title: (_a = prDefaults == null ? void 0 : prDefaults.title) != null ? _a : "",
      body: (_b = prDefaults == null ? void 0 : prDefaults.body) != null ? _b : "",
      owner: ((_d = (_c = analyzeResult.generatedEntities[0]) == null ? void 0 : _c.spec) == null ? void 0 : _d.owner) || "",
      componentName: ((_f = (_e = analyzeResult.generatedEntities[0]) == null ? void 0 : _e.metadata) == null ? void 0 : _f.name) || "",
      useCodeowners: false
    },
    render: ({ values, formState, register, setValue }) => /* @__PURE__ */ React.createElement(React.Fragment, null, renderFormFields({
      values,
      formState,
      register,
      setValue,
      groups: groups != null ? groups : [],
      groupsLoading
    }), /* @__PURE__ */ React.createElement(Box, {
      marginTop: 2
    }, /* @__PURE__ */ React.createElement(Typography, {
      variant: "h6"
    }, "Preview Pull Request")), /* @__PURE__ */ React.createElement(PreviewPullRequestComponent, {
      title: values.title,
      description: values.body,
      classes: {
        card: classes.previewCard,
        cardContent: classes.previewCardContent
      }
    }), /* @__PURE__ */ React.createElement(Box, {
      marginTop: 2,
      marginBottom: 1
    }, /* @__PURE__ */ React.createElement(Typography, {
      variant: "h6"
    }, "Preview Entities")), /* @__PURE__ */ React.createElement(PreviewCatalogInfoComponent, {
      entities: generateEntities(analyzeResult.generatedEntities, values.componentName, values.owner),
      repositoryUrl: analyzeResult.url,
      classes: {
        card: classes.previewCard,
        cardContent: classes.previewCardContent
      }
    }), error && /* @__PURE__ */ React.createElement(FormHelperText, {
      error: true
    }, error), /* @__PURE__ */ React.createElement(Grid, {
      container: true,
      spacing: 0
    }, onGoBack && /* @__PURE__ */ React.createElement(BackButton, {
      onClick: onGoBack,
      disabled: submitted
    }), /* @__PURE__ */ React.createElement(NextButton, {
      type: "submit",
      disabled: Boolean(formState.errors.title || formState.errors.body || formState.errors.owner),
      loading: submitted
    }, "Create PR")))
  }));
};

const StepPrepareSelectLocations = ({
  analyzeResult,
  prepareResult,
  onPrepare,
  onGoBack
}) => {
  const [selectedUrls, setSelectedUrls] = useState((prepareResult == null ? void 0 : prepareResult.locations.map((l) => l.target)) || []);
  const [existingLocations, locations] = partition(analyzeResult == null ? void 0 : analyzeResult.locations, (l) => l.exists);
  const handleResult = useCallback(async () => {
    onPrepare({
      type: "locations",
      locations: locations.filter((l) => selectedUrls.includes(l.target))
    });
  }, [locations, onPrepare, selectedUrls]);
  const onItemClick = (url) => {
    setSelectedUrls((urls) => urls.includes(url) ? urls.filter((u) => u !== url) : urls.concat(url));
  };
  const onSelectAll = () => {
    setSelectedUrls((urls) => urls.length < locations.length ? locations.map((l) => l.target) : []);
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, locations.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Typography, null, "Select one or more locations that are present in your git repository:"), /* @__PURE__ */ React.createElement(EntityListComponent, {
    firstListItem: /* @__PURE__ */ React.createElement(ListItem, {
      dense: true,
      button: true,
      onClick: onSelectAll
    }, /* @__PURE__ */ React.createElement(ListItemIcon, null, /* @__PURE__ */ React.createElement(Checkbox, {
      edge: "start",
      checked: selectedUrls.length === locations.length,
      indeterminate: selectedUrls.length > 0 && selectedUrls.length < locations.length,
      tabIndex: -1,
      disableRipple: true
    })), /* @__PURE__ */ React.createElement(ListItemText, {
      primary: "Select All"
    })),
    onItemClick,
    locations,
    locationListItemIcon: (target) => /* @__PURE__ */ React.createElement(Checkbox, {
      edge: "start",
      checked: selectedUrls.includes(target),
      tabIndex: -1,
      disableRipple: true
    }),
    collapsed: true
  })), existingLocations.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Typography, null, "These locations already exist in the catalog:"), /* @__PURE__ */ React.createElement(EntityListComponent, {
    locations: existingLocations,
    locationListItemIcon: () => /* @__PURE__ */ React.createElement(LocationOnIcon, null),
    withLinks: true,
    collapsed: true
  })), /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    spacing: 0
  }, onGoBack && /* @__PURE__ */ React.createElement(BackButton, {
    onClick: onGoBack
  }), /* @__PURE__ */ React.createElement(NextButton, {
    disabled: selectedUrls.length === 0,
    onClick: handleResult
  }, "Review")));
};

const StepReviewLocation = ({
  prepareResult,
  onReview,
  onGoBack
}) => {
  const catalogApi = useApi(catalogApiRef);
  const configApi = useApi(configApiRef);
  const appTitle = configApi.getOptional("app.title") || "Backstage";
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState();
  const exists = prepareResult.type === "locations" && prepareResult.locations.some((l) => l.exists) ? true : false;
  const handleClick = useCallback(async () => {
    setSubmitted(true);
    try {
      let refreshed = new Array();
      if (prepareResult.type === "locations") {
        refreshed = await Promise.all(prepareResult.locations.filter((l) => l.exists).map(async (l) => {
          var _a;
          const ref = stringifyEntityRef((_a = l.entities[0]) != null ? _a : l);
          await catalogApi.refreshEntity(ref);
          return { target: l.target };
        }));
      }
      const locations = await Promise.all(prepareResult.locations.filter((l) => !l.exists).map(async (l) => {
        const result = await catalogApi.addLocation({
          type: "url",
          target: l.target
        });
        return {
          target: result.location.target,
          entities: result.entities
        };
      }));
      onReview({
        ...prepareResult,
        ...{ refreshed },
        locations
      });
    } catch (e) {
      assertError(e);
      if (prepareResult.type === "repository" && e.message.startsWith("Location was added but has no entities specified yet")) {
        onReview({
          ...prepareResult,
          locations: prepareResult.locations.map((l) => ({
            target: l.target,
            entities: []
          }))
        });
      } else {
        setError(e.message);
        setSubmitted(false);
      }
    }
  }, [prepareResult, onReview, catalogApi]);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, prepareResult.type === "repository" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Typography, {
    paragraph: true
  }, "The following Pull Request has been opened:", " ", /* @__PURE__ */ React.createElement(Link, {
    to: prepareResult.pullRequest.url,
    target: "_blank",
    rel: "noopener noreferrer"
  }, prepareResult.pullRequest.url)), /* @__PURE__ */ React.createElement(Typography, {
    paragraph: true
  }, "You can already import the location and ", appTitle, " will fetch the entities as soon as the Pull Request is merged.")), /* @__PURE__ */ React.createElement(Typography, null, exists ? "The following locations already exist in the catalog:" : "The following entities will be added to the catalog:"), /* @__PURE__ */ React.createElement(EntityListComponent, {
    locations: prepareResult.locations,
    locationListItemIcon: () => /* @__PURE__ */ React.createElement(LocationOnIcon, null)
  }), error && /* @__PURE__ */ React.createElement(FormHelperText, {
    error: true
  }, error), /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    spacing: 0
  }, onGoBack && /* @__PURE__ */ React.createElement(BackButton, {
    onClick: onGoBack,
    disabled: submitted
  }), /* @__PURE__ */ React.createElement(NextButton, {
    disabled: submitted,
    loading: submitted,
    onClick: () => handleClick()
  }, exists ? "Refresh" : "Import")));
};

function defaultGenerateStepper(flow, defaults) {
  switch (flow) {
    case "single-location":
      return {
        ...defaults,
        prepare: () => ({
          stepLabel: /* @__PURE__ */ React.createElement(StepLabel, {
            optional: /* @__PURE__ */ React.createElement(Typography, {
              variant: "caption"
            }, "Discovered Locations: 1")
          }, "Select Locations"),
          content: /* @__PURE__ */ React.createElement(React.Fragment, null)
        })
      };
    case "multiple-locations":
      return {
        ...defaults,
        prepare: (state, opts) => {
          if (state.analyzeResult.type !== "locations") {
            return defaults.prepare(state, opts);
          }
          return {
            stepLabel: /* @__PURE__ */ React.createElement(StepLabel, {
              optional: /* @__PURE__ */ React.createElement(Typography, {
                variant: "caption"
              }, "Discovered Locations: ", state.analyzeResult.locations.length)
            }, "Select Locations"),
            content: /* @__PURE__ */ React.createElement(StepPrepareSelectLocations, {
              analyzeResult: state.analyzeResult,
              prepareResult: state.prepareResult,
              onPrepare: state.onPrepare,
              onGoBack: state.onGoBack
            })
          };
        }
      };
    case "no-location":
      return {
        ...defaults,
        prepare: (state, opts) => {
          if (state.analyzeResult.type !== "repository") {
            return defaults.prepare(state, opts);
          }
          return {
            stepLabel: /* @__PURE__ */ React.createElement(StepLabel, null, "Create Pull Request"),
            content: /* @__PURE__ */ React.createElement(StepPrepareCreatePullRequest, {
              analyzeResult: state.analyzeResult,
              onPrepare: state.onPrepare,
              onGoBack: state.onGoBack,
              renderFormFields: ({
                values,
                setValue,
                formState,
                groupsLoading,
                groups,
                register
              }) => /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Box, {
                marginTop: 2
              }, /* @__PURE__ */ React.createElement(Typography, {
                variant: "h6"
              }, "Pull Request Details")), /* @__PURE__ */ React.createElement(TextField, {
                ...asInputRef(register("title", {
                  required: true
                })),
                label: "Pull Request Title",
                placeholder: "Add Backstage catalog entity descriptor files",
                margin: "normal",
                variant: "outlined",
                fullWidth: true,
                error: Boolean(formState.errors.title),
                required: true
              }), /* @__PURE__ */ React.createElement(TextField, {
                ...asInputRef(register("body", {
                  required: true
                })),
                label: "Pull Request Body",
                placeholder: "A describing text with Markdown support",
                margin: "normal",
                variant: "outlined",
                fullWidth: true,
                error: Boolean(formState.errors.body),
                multiline: true,
                required: true
              }), /* @__PURE__ */ React.createElement(Box, {
                marginTop: 2
              }, /* @__PURE__ */ React.createElement(Typography, {
                variant: "h6"
              }, "Entity Configuration")), /* @__PURE__ */ React.createElement(TextField, {
                ...asInputRef(register("componentName", { required: true })),
                label: "Name of the created component",
                placeholder: "my-component",
                margin: "normal",
                variant: "outlined",
                fullWidth: true,
                error: Boolean(formState.errors.componentName),
                required: true
              }), !values.useCodeowners && /* @__PURE__ */ React.createElement(AutocompleteTextField, {
                name: "owner",
                errors: formState.errors,
                options: groups || [],
                loading: groupsLoading,
                loadingText: "Loading groups\u2026",
                helperText: "Select an owner from the list or enter a reference to a Group or a User",
                errorHelperText: "required value",
                textFieldProps: {
                  label: "Entity Owner",
                  placeholder: "my-group"
                },
                rules: { required: true },
                required: true
              }), /* @__PURE__ */ React.createElement(FormControlLabel, {
                control: /* @__PURE__ */ React.createElement(Checkbox, {
                  ...asInputRef(register("useCodeowners")),
                  onChange: (_, value) => {
                    if (value) {
                      setValue("owner", "");
                    }
                  }
                }),
                label: /* @__PURE__ */ React.createElement(React.Fragment, null, "Use ", /* @__PURE__ */ React.createElement("em", null, "CODEOWNERS"), " file as Entity Owner")
              }), /* @__PURE__ */ React.createElement(FormHelperText, null, "WARNING: This may fail if no CODEOWNERS file is found at the target location."))
            })
          };
        }
      };
    default:
      return defaults;
  }
}
const defaultStepper = {
  analyze: (state, { apis }) => ({
    stepLabel: /* @__PURE__ */ React.createElement(StepLabel, null, "Select URL"),
    content: /* @__PURE__ */ React.createElement(StepInitAnalyzeUrl, {
      key: "analyze",
      analysisUrl: state.analysisUrl,
      onAnalysis: state.onAnalysis,
      disablePullRequest: !apis.catalogImportApi.preparePullRequest
    })
  }),
  prepare: (state) => ({
    stepLabel: /* @__PURE__ */ React.createElement(StepLabel, {
      optional: /* @__PURE__ */ React.createElement(Typography, {
        variant: "caption"
      }, "Optional")
    }, "Import Actions"),
    content: /* @__PURE__ */ React.createElement(BackButton, {
      onClick: state.onGoBack
    })
  }),
  review: (state) => ({
    stepLabel: /* @__PURE__ */ React.createElement(StepLabel, null, "Review"),
    content: /* @__PURE__ */ React.createElement(StepReviewLocation, {
      prepareResult: state.prepareResult,
      onReview: state.onReview,
      onGoBack: state.onGoBack
    })
  }),
  finish: (state) => ({
    stepLabel: /* @__PURE__ */ React.createElement(StepLabel, null, "Finish"),
    content: /* @__PURE__ */ React.createElement(StepFinishImportLocation, {
      prepareResult: state.prepareResult,
      onReset: state.onReset
    })
  })
};

const useStyles = makeStyles(() => ({
  stepperRoot: {
    padding: 0
  }
}));
const ImportStepper = (props) => {
  const {
    initialUrl,
    generateStepper = defaultGenerateStepper,
    variant
  } = props;
  const catalogImportApi = useApi(catalogImportApiRef);
  const classes = useStyles();
  const state = useImportState({ initialUrl });
  const states = useMemo(() => generateStepper(state.activeFlow, defaultStepper), [generateStepper, state.activeFlow]);
  const render = (step) => {
    return /* @__PURE__ */ React.createElement(Step, null, step.stepLabel, /* @__PURE__ */ React.createElement(StepContent, null, step.content));
  };
  return /* @__PURE__ */ React.createElement(InfoCard, {
    variant
  }, /* @__PURE__ */ React.createElement(Stepper, {
    classes: { root: classes.stepperRoot },
    activeStep: state.activeStepNumber,
    orientation: "vertical"
  }, render(states.analyze(state, { apis: { catalogImportApi } })), render(states.prepare(state, { apis: { catalogImportApi } })), render(states.review(state, { apis: { catalogImportApi } })), render(states.finish(state, { apis: { catalogImportApi } }))));
};

const DefaultImportPage = () => {
  const configApi = useApi(configApiRef);
  const appTitle = configApi.getOptional("app.title") || "Backstage";
  return /* @__PURE__ */ React.createElement(Page, {
    themeId: "home"
  }, /* @__PURE__ */ React.createElement(Header, {
    title: "Register an existing component"
  }), /* @__PURE__ */ React.createElement(Content, null, /* @__PURE__ */ React.createElement(ContentHeader, {
    title: `Start tracking your component in ${appTitle}`
  }, /* @__PURE__ */ React.createElement(SupportButton, null, "Start tracking your component in ", appTitle, " by adding it to the software catalog.")), /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    spacing: 2,
    direction: "row-reverse"
  }, /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    xs: 12,
    md: 4,
    lg: 6,
    xl: 8
  }, /* @__PURE__ */ React.createElement(ImportInfoCard, null)), /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    xs: 12,
    md: 8,
    lg: 6,
    xl: 4
  }, /* @__PURE__ */ React.createElement(ImportStepper, null)))));
};

export { AutocompleteTextField, CatalogImportClient, CatalogImportPage, DefaultImportPage, EntityListComponent, ImportInfoCard, ImportStepper, PreparePullRequestForm, PreviewCatalogInfoComponent, PreviewPullRequestComponent, StepInitAnalyzeUrl, StepPrepareCreatePullRequest, catalogImportApiRef, catalogImportPlugin, defaultGenerateStepper, catalogImportPlugin as plugin };
//# sourceMappingURL=index.esm.js.map
