import { createApiRef, useApi, configApiRef, createRouteRef, useRouteRef, createPlugin, createApiFactory, discoveryApiRef, identityApiRef, fetchApiRef, createRoutableExtension } from '@backstage/core-plugin-api';
import { ResponseError, NotFoundError } from '@backstage/errors';
import { EventSourcePolyfill } from 'event-source-polyfill';
import React, { useReducer, useRef, useMemo, createContext, useContext, useState, useEffect, useCallback, Children } from 'react';
import { useParams, useNavigate as useNavigate$1, useOutlet, Routes, Route, useRoutes } from 'react-router-dom';
import { techdocsStorageApiRef as techdocsStorageApiRef$1, useTechDocsReaderPage, SHADOW_DOM_STYLE_LOAD_EVENT, useShadowDomStylesLoading, useTechDocsAddons, TechDocsAddonLocations, TechDocsShadowDom, TECHDOCS_ADDONS_WRAPPER_KEY, TechDocsReaderPageProvider, techdocsApiRef as techdocsApiRef$1 } from '@backstage/plugin-techdocs-react';
import useAsync from 'react-use/lib/useAsync';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import { Link, LogViewer, ErrorPage, useSidebarPinState, Content, HeaderLabel, Header, Page, ItemCardGrid, ItemCardHeader, Button as Button$1, WarningPanel, CodeSnippet, Progress, SubvalueCell, Table, EmptyState, PageWithHeader, ContentHeader, SupportButton, MissingAnnotationEmptyState } from '@backstage/core-components';
import { makeStyles, ListItemText, ListItem, Divider, TextField, InputAdornment, IconButton, CircularProgress, createStyles, Button, Drawer, Grid, Typography, lighten, alpha, useTheme, withStyles, Tooltip, ThemeProvider, SvgIcon, useMediaQuery, Portal, Toolbar, Box, Menu, Card, CardMedia, CardContent, CardActions } from '@material-ui/core';
import { HighlightedSearchResultText, SearchContextProvider, useSearch } from '@backstage/plugin-search-react';
import SearchIcon from '@material-ui/icons/Search';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { useNavigate, useOutlet as useOutlet$1 } from 'react-router';
import useDebounce from 'react-use/lib/useDebounce';
import { Alert, Skeleton } from '@material-ui/lab';
import Close from '@material-ui/icons/Close';
import { scmIntegrationsApiRef } from '@backstage/integration-react';
import DOMPurify from 'dompurify';
import { replaceGitHubUrlType } from '@backstage/integration';
import FeedbackOutlinedIcon from '@material-ui/icons/FeedbackOutlined';
import ReactDOM from 'react-dom';
import parseGitUrl from 'git-url-parse';
import MenuIcon from '@material-ui/icons/Menu';
import Helmet from 'react-helmet';
import CodeIcon from '@material-ui/icons/Code';
import { getEntityRelations, EntityRefLink, EntityRefLinks, useEntityList, humanizeEntityRef, useStarredEntities, CATALOG_FILTER_EXISTS, EntityListProvider, CatalogFilterLayout, UserListPicker, EntityOwnerPicker, EntityTagPicker, useEntity } from '@backstage/plugin-catalog-react';
import { RELATION_OWNED_BY, getCompoundEntityRef } from '@backstage/catalog-model';
import SettingsIcon from '@material-ui/icons/Settings';
import useCopyToClipboard from 'react-use/lib/useCopyToClipboard';
import { capitalize } from 'lodash';
import ShareIcon from '@material-ui/icons/Share';
import { withStyles as withStyles$1 } from '@material-ui/styles';
import Star from '@material-ui/icons/Star';
import StarBorder from '@material-ui/icons/StarBorder';

const techdocsStorageApiRef = createApiRef({
  id: "plugin.techdocs.storageservice"
});
const techdocsApiRef = createApiRef({
  id: "plugin.techdocs.service"
});

class TechDocsClient {
  constructor(options) {
    this.configApi = options.configApi;
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }
  async getApiOrigin() {
    return await this.discoveryApi.getBaseUrl("techdocs");
  }
  async getTechDocsMetadata(entityId) {
    const { kind, namespace, name } = entityId;
    const apiOrigin = await this.getApiOrigin();
    const requestUrl = `${apiOrigin}/metadata/techdocs/${namespace}/${kind}/${name}`;
    const request = await this.fetchApi.fetch(`${requestUrl}`);
    if (!request.ok) {
      throw await ResponseError.fromResponse(request);
    }
    return await request.json();
  }
  async getEntityMetadata(entityId) {
    const { kind, namespace, name } = entityId;
    const apiOrigin = await this.getApiOrigin();
    const requestUrl = `${apiOrigin}/metadata/entity/${namespace}/${kind}/${name}`;
    const request = await this.fetchApi.fetch(`${requestUrl}`);
    if (!request.ok) {
      throw await ResponseError.fromResponse(request);
    }
    return await request.json();
  }
}
class TechDocsStorageClient {
  constructor(options) {
    this.configApi = options.configApi;
    this.discoveryApi = options.discoveryApi;
    this.identityApi = options.identityApi;
    this.fetchApi = options.fetchApi;
  }
  async getApiOrigin() {
    return await this.discoveryApi.getBaseUrl("techdocs");
  }
  async getStorageUrl() {
    var _a;
    return (_a = this.configApi.getOptionalString("techdocs.storageUrl")) != null ? _a : `${await this.discoveryApi.getBaseUrl("techdocs")}/static/docs`;
  }
  async getBuilder() {
    return this.configApi.getString("techdocs.builder");
  }
  async getEntityDocs(entityId, path) {
    const { kind, namespace, name } = entityId;
    const storageUrl = await this.getStorageUrl();
    const url = `${storageUrl}/${namespace}/${kind}/${name}/${path}`;
    const request = await this.fetchApi.fetch(`${url.endsWith("/") ? url : `${url}/`}index.html`);
    let errorMessage = "";
    switch (request.status) {
      case 404:
        errorMessage = "Page not found. ";
        if (!path) {
          errorMessage += "This could be because there is no index.md file in the root of the docs directory of this repository.";
        }
        throw new NotFoundError(errorMessage);
      case 500:
        errorMessage = "Could not generate documentation or an error in the TechDocs backend. ";
        throw new Error(errorMessage);
    }
    return request.text();
  }
  async syncEntityDocs(entityId, logHandler = () => {
  }) {
    const { kind, namespace, name } = entityId;
    const apiOrigin = await this.getApiOrigin();
    const url = `${apiOrigin}/sync/${namespace}/${kind}/${name}`;
    const { token } = await this.identityApi.getCredentials();
    return new Promise((resolve, reject) => {
      const source = new EventSourcePolyfill(url, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      source.addEventListener("log", (e) => {
        if (e.data) {
          logHandler(JSON.parse(e.data));
        }
      });
      source.addEventListener("finish", (e) => {
        let updated = false;
        if (e.data) {
          ({ updated } = JSON.parse(e.data));
        }
        resolve(updated ? "updated" : "cached");
      });
      source.onerror = (e) => {
        source.close();
        switch (e.status) {
          case 404:
            reject(new NotFoundError(e.message));
            return;
          default:
            reject(new Error(e.data));
            return;
        }
      };
    });
  }
  async getBaseUrl(oldBaseUrl, entityId, path) {
    const { kind, namespace, name } = entityId;
    const apiOrigin = await this.getApiOrigin();
    const newBaseUrl = `${apiOrigin}/static/docs/${namespace}/${kind}/${name}/${path}`;
    return new URL(oldBaseUrl, newBaseUrl.endsWith("/") ? newBaseUrl : `${newBaseUrl}/`).toString();
  }
}

function calculateDisplayState({
  contentLoading,
  content,
  activeSyncState
}) {
  if (contentLoading) {
    return "CHECKING";
  }
  if (activeSyncState === "BUILD_READY_RELOAD") {
    return "CHECKING";
  }
  if (!content && activeSyncState === "CHECKING") {
    return "CHECKING";
  }
  if (!content && activeSyncState === "BUILDING") {
    return "INITIAL_BUILD";
  }
  if (!content) {
    return "CONTENT_NOT_FOUND";
  }
  if (activeSyncState === "BUILDING") {
    return "CONTENT_STALE_REFRESHING";
  }
  if (activeSyncState === "BUILD_READY") {
    return "CONTENT_STALE_READY";
  }
  if (activeSyncState === "ERROR") {
    return "CONTENT_STALE_ERROR";
  }
  return "CONTENT_FRESH";
}
function reducer(oldState, action) {
  const newState = { ...oldState };
  switch (action.type) {
    case "sync":
      if (action.state === "CHECKING") {
        newState.buildLog = [];
      }
      newState.activeSyncState = action.state;
      newState.syncError = action.syncError;
      break;
    case "contentLoading":
      newState.contentLoading = true;
      newState.contentError = void 0;
      break;
    case "content":
      if (typeof action.path === "string") {
        newState.path = action.path;
      }
      newState.contentLoading = false;
      newState.content = action.content;
      newState.contentError = action.contentError;
      break;
    case "buildLog":
      newState.buildLog = newState.buildLog.concat(action.log);
      break;
    default:
      throw new Error();
  }
  if (["BUILD_READY", "BUILD_READY_RELOAD"].includes(newState.activeSyncState) && ["contentLoading", "content"].includes(action.type)) {
    newState.activeSyncState = "UP_TO_DATE";
    newState.buildLog = [];
  }
  return newState;
}
function useReaderState(kind, namespace, name, path) {
  var _a, _b;
  const [state, dispatch] = useReducer(reducer, {
    activeSyncState: "CHECKING",
    path,
    contentLoading: true,
    buildLog: []
  });
  const techdocsStorageApi = useApi(techdocsStorageApiRef$1);
  const { retry: contentReload } = useAsyncRetry(async () => {
    dispatch({ type: "contentLoading" });
    try {
      const entityDocs = await techdocsStorageApi.getEntityDocs({ kind, namespace, name }, path);
      dispatch({ type: "content", content: entityDocs, path });
      return entityDocs;
    } catch (e) {
      dispatch({ type: "content", contentError: e, path });
    }
    return void 0;
  }, [techdocsStorageApi, kind, namespace, name, path]);
  const contentRef = useRef({
    content: void 0,
    reload: () => {
    }
  });
  contentRef.current = { content: state.content, reload: contentReload };
  useAsync(async () => {
    dispatch({ type: "sync", state: "CHECKING" });
    const buildingTimeout = setTimeout(() => {
      dispatch({ type: "sync", state: "BUILDING" });
    }, 1e3);
    try {
      const result = await techdocsStorageApi.syncEntityDocs({
        kind,
        namespace,
        name
      }, (log) => {
        dispatch({ type: "buildLog", log });
      });
      switch (result) {
        case "updated":
          if (!contentRef.current.content) {
            contentRef.current.reload();
            dispatch({ type: "sync", state: "BUILD_READY_RELOAD" });
          } else {
            dispatch({ type: "sync", state: "BUILD_READY" });
          }
          break;
        case "cached":
          dispatch({ type: "sync", state: "UP_TO_DATE" });
          break;
        default:
          dispatch({
            type: "sync",
            state: "ERROR",
            syncError: new Error("Unexpected return state")
          });
          break;
      }
    } catch (e) {
      dispatch({ type: "sync", state: "ERROR", syncError: e });
    } finally {
      clearTimeout(buildingTimeout);
    }
  }, [kind, name, namespace, techdocsStorageApi, dispatch, contentRef]);
  const displayState = useMemo(() => calculateDisplayState({
    activeSyncState: state.activeSyncState,
    contentLoading: state.contentLoading,
    content: state.content
  }), [state.activeSyncState, state.content, state.contentLoading]);
  return {
    state: displayState,
    contentReload,
    path: state.path,
    content: state.content,
    contentErrorMessage: (_a = state.contentError) == null ? void 0 : _a.toString(),
    syncErrorMessage: (_b = state.syncError) == null ? void 0 : _b.toString(),
    buildLog: state.buildLog
  };
}

const TechDocsReaderContext = createContext({});
const useTechDocsReader = () => useContext(TechDocsReaderContext);
const TechDocsReaderProvider = ({
  children
}) => {
  const { "*": path = "" } = useParams();
  const { entityRef } = useTechDocsReaderPage();
  const { kind, namespace, name } = entityRef;
  const value = useReaderState(kind, namespace, name, path);
  return /* @__PURE__ */ React.createElement(TechDocsReaderContext.Provider, {
    value
  }, children instanceof Function ? children(value) : children);
};
const withTechDocsReaderProvider = (Component) => (props) => /* @__PURE__ */ React.createElement(TechDocsReaderProvider, null, /* @__PURE__ */ React.createElement(Component, {
  ...props
}));

const useStyles$4 = makeStyles({
  flexContainer: {
    flexWrap: "wrap"
  },
  itemText: {
    width: "100%",
    marginBottom: "1rem"
  }
});
const TechDocsSearchResultListItem = (props) => {
  const {
    result,
    highlight,
    lineClamp = 5,
    asListItem = true,
    asLink = true,
    title
  } = props;
  const classes = useStyles$4();
  const TextItem = () => {
    const resultTitle = (highlight == null ? void 0 : highlight.fields.title) ? /* @__PURE__ */ React.createElement(HighlightedSearchResultText, {
      text: highlight.fields.title,
      preTag: highlight.preTag,
      postTag: highlight.postTag
    }) : result.title;
    const entityTitle = (highlight == null ? void 0 : highlight.fields.entityTitle) ? /* @__PURE__ */ React.createElement(HighlightedSearchResultText, {
      text: highlight.fields.entityTitle,
      preTag: highlight.preTag,
      postTag: highlight.postTag
    }) : result.entityTitle;
    const resultName = (highlight == null ? void 0 : highlight.fields.name) ? /* @__PURE__ */ React.createElement(HighlightedSearchResultText, {
      text: highlight.fields.name,
      preTag: highlight.preTag,
      postTag: highlight.postTag
    }) : result.name;
    return /* @__PURE__ */ React.createElement(ListItemText, {
      className: classes.itemText,
      primaryTypographyProps: { variant: "h6" },
      primary: title ? title : /* @__PURE__ */ React.createElement(React.Fragment, null, resultTitle, " | ", entityTitle != null ? entityTitle : resultName, " docs"),
      secondary: /* @__PURE__ */ React.createElement("span", {
        style: {
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: lineClamp,
          overflow: "hidden"
        }
      }, (highlight == null ? void 0 : highlight.fields.text) ? /* @__PURE__ */ React.createElement(HighlightedSearchResultText, {
        text: highlight.fields.text,
        preTag: highlight.preTag,
        postTag: highlight.postTag
      }) : result.text)
    });
  };
  const LinkWrapper = ({ children }) => asLink ? /* @__PURE__ */ React.createElement(Link, {
    to: result.location
  }, children) : /* @__PURE__ */ React.createElement(React.Fragment, null, children);
  const ListItemWrapper = ({ children }) => asListItem ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(ListItem, {
    alignItems: "flex-start",
    className: classes.flexContainer
  }, children), /* @__PURE__ */ React.createElement(Divider, {
    component: "li"
  })) : /* @__PURE__ */ React.createElement(React.Fragment, null, children);
  return /* @__PURE__ */ React.createElement(LinkWrapper, null, /* @__PURE__ */ React.createElement(ListItemWrapper, null, /* @__PURE__ */ React.createElement(TextItem, null)));
};

const useStyles$3 = makeStyles({
  root: {
    width: "100%"
  }
});
const TechDocsSearchBar = (props) => {
  const { entityId, debounceTime = 150 } = props;
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const {
    term,
    setTerm,
    setFilters,
    result: { loading, value: searchVal }
  } = useSearch();
  const classes = useStyles$3();
  const [options, setOptions] = useState([]);
  useEffect(() => {
    let mounted = true;
    if (mounted && searchVal) {
      const searchResults = searchVal.results.slice(0, 10);
      setOptions(searchResults);
    }
    return () => {
      mounted = false;
    };
  }, [loading, searchVal]);
  const [value, setValue] = useState(term);
  useDebounce(() => setTerm(value), debounceTime, [value]);
  const { kind, name, namespace } = entityId;
  useEffect(() => {
    setFilters((prevFilters) => {
      return {
        ...prevFilters,
        kind,
        namespace,
        name
      };
    });
  }, [kind, namespace, name, setFilters]);
  const handleQuery = (e) => {
    if (!open) {
      setOpen(true);
    }
    setValue(e.target.value);
  };
  const handleSelection = (_, selection) => {
    if (selection == null ? void 0 : selection.document) {
      const { location } = selection.document;
      navigate(location);
    }
  };
  return /* @__PURE__ */ React.createElement(Autocomplete, {
    classes: { root: classes.root },
    "data-testid": "techdocs-search-bar",
    size: "small",
    open,
    getOptionLabel: () => "",
    filterOptions: (x) => {
      return x;
    },
    onClose: () => {
      setOpen(false);
    },
    onFocus: () => {
      setOpen(true);
    },
    onChange: handleSelection,
    blurOnSelect: true,
    noOptionsText: "No results found",
    value: null,
    options,
    renderOption: ({ document, highlight }) => /* @__PURE__ */ React.createElement(TechDocsSearchResultListItem, {
      result: document,
      lineClamp: 3,
      asListItem: false,
      asLink: false,
      title: document.title,
      highlight
    }),
    loading,
    renderInput: (params) => /* @__PURE__ */ React.createElement(TextField, {
      ...params,
      "data-testid": "techdocs-search-bar-input",
      variant: "outlined",
      fullWidth: true,
      placeholder: `Search ${entityId.name} docs`,
      value,
      onChange: handleQuery,
      InputProps: {
        ...params.InputProps,
        startAdornment: /* @__PURE__ */ React.createElement(InputAdornment, {
          position: "start"
        }, /* @__PURE__ */ React.createElement(IconButton, {
          "aria-label": "Query",
          disabled: true
        }, /* @__PURE__ */ React.createElement(SearchIcon, null))),
        endAdornment: /* @__PURE__ */ React.createElement(React.Fragment, null, loading ? /* @__PURE__ */ React.createElement(CircularProgress, {
          color: "inherit",
          size: 20
        }) : null, params.InputProps.endAdornment)
      }
    })
  });
};
const TechDocsSearch = (props) => {
  const initialState = {
    term: "",
    types: ["techdocs"],
    pageCursor: "",
    filters: props.entityId
  };
  return /* @__PURE__ */ React.createElement(SearchContextProvider, {
    initialState
  }, /* @__PURE__ */ React.createElement(TechDocsSearchBar, {
    ...props
  }));
};

const useDrawerStyles = makeStyles((theme) => createStyles({
  paper: {
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "75%"
    },
    [theme.breakpoints.up("md")]: {
      width: "50%"
    },
    padding: theme.spacing(2.5)
  },
  root: {
    height: "100%",
    overflow: "hidden"
  },
  logs: {
    background: theme.palette.background.default
  }
}));
const TechDocsBuildLogsDrawerContent = ({
  buildLog,
  onClose
}) => {
  const classes = useDrawerStyles();
  const logText = buildLog.length === 0 ? "Waiting for logs..." : buildLog.join("\n");
  return /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    direction: "column",
    className: classes.root,
    spacing: 0,
    wrap: "nowrap"
  }, /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    container: true,
    justifyContent: "space-between",
    alignItems: "center",
    spacing: 0,
    wrap: "nowrap"
  }, /* @__PURE__ */ React.createElement(Typography, {
    variant: "h5"
  }, "Build Details"), /* @__PURE__ */ React.createElement(IconButton, {
    key: "dismiss",
    title: "Close the drawer",
    onClick: onClose,
    color: "inherit"
  }, /* @__PURE__ */ React.createElement(Close, null))), /* @__PURE__ */ React.createElement(LogViewer, {
    text: logText,
    classes: { root: classes.logs }
  }));
};
const TechDocsBuildLogs = ({ buildLog }) => {
  const classes = useDrawerStyles();
  const [open, setOpen] = useState(false);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Button, {
    color: "inherit",
    onClick: () => setOpen(true)
  }, "Show Build Logs"), /* @__PURE__ */ React.createElement(Drawer, {
    classes: { paper: classes.paper },
    anchor: "right",
    open,
    onClose: () => setOpen(false)
  }, /* @__PURE__ */ React.createElement(TechDocsBuildLogsDrawerContent, {
    buildLog,
    onClose: () => setOpen(false)
  })));
};

const TechDocsNotFound = ({ errorMessage }) => {
  const techdocsBuilder = useApi(configApiRef).getOptionalString("techdocs.builder");
  let additionalInfo = "";
  if (techdocsBuilder !== "local") {
    additionalInfo = "Note that techdocs.builder is not set to 'local' in your config, which means this Backstage app will not generate docs if they are not found. Make sure the project's docs are generated and published by some external process (e.g. CI/CD pipeline). Or change techdocs.builder to 'local' to generate docs from this Backstage instance.";
  }
  return /* @__PURE__ */ React.createElement(ErrorPage, {
    status: "404",
    statusMessage: errorMessage || "Documentation not found",
    additionalInfo
  });
};

const useStyles$2 = makeStyles((theme) => ({
  root: {
    marginBottom: theme.spacing(2)
  },
  message: {
    wordBreak: "break-word",
    overflowWrap: "anywhere"
  }
}));
const TechDocsStateIndicator = () => {
  let StateAlert = null;
  const classes = useStyles$2();
  const {
    state,
    contentReload,
    contentErrorMessage,
    syncErrorMessage,
    buildLog
  } = useTechDocsReader();
  if (state === "INITIAL_BUILD") {
    StateAlert = /* @__PURE__ */ React.createElement(Alert, {
      classes: { root: classes.root },
      variant: "outlined",
      severity: "info",
      icon: /* @__PURE__ */ React.createElement(CircularProgress, {
        size: "24px"
      }),
      action: /* @__PURE__ */ React.createElement(TechDocsBuildLogs, {
        buildLog
      })
    }, "Documentation is accessed for the first time and is being prepared. The subsequent loads are much faster.");
  }
  if (state === "CONTENT_STALE_REFRESHING") {
    StateAlert = /* @__PURE__ */ React.createElement(Alert, {
      variant: "outlined",
      severity: "info",
      icon: /* @__PURE__ */ React.createElement(CircularProgress, {
        size: "24px"
      }),
      action: /* @__PURE__ */ React.createElement(TechDocsBuildLogs, {
        buildLog
      }),
      classes: { root: classes.root }
    }, "A newer version of this documentation is being prepared and will be available shortly.");
  }
  if (state === "CONTENT_STALE_READY") {
    StateAlert = /* @__PURE__ */ React.createElement(Alert, {
      variant: "outlined",
      severity: "success",
      action: /* @__PURE__ */ React.createElement(Button, {
        color: "inherit",
        onClick: () => contentReload()
      }, "Refresh"),
      classes: { root: classes.root }
    }, "A newer version of this documentation is now available, please refresh to view.");
  }
  if (state === "CONTENT_STALE_ERROR") {
    StateAlert = /* @__PURE__ */ React.createElement(Alert, {
      variant: "outlined",
      severity: "error",
      action: /* @__PURE__ */ React.createElement(TechDocsBuildLogs, {
        buildLog
      }),
      classes: { root: classes.root, message: classes.message }
    }, "Building a newer version of this documentation failed.", " ", syncErrorMessage);
  }
  if (state === "CONTENT_NOT_FOUND") {
    StateAlert = /* @__PURE__ */ React.createElement(React.Fragment, null, syncErrorMessage && /* @__PURE__ */ React.createElement(Alert, {
      variant: "outlined",
      severity: "error",
      action: /* @__PURE__ */ React.createElement(TechDocsBuildLogs, {
        buildLog
      }),
      classes: { root: classes.root, message: classes.message }
    }, "Building a newer version of this documentation failed.", " ", syncErrorMessage), /* @__PURE__ */ React.createElement(TechDocsNotFound, {
      errorMessage: contentErrorMessage
    }));
  }
  return StateAlert;
};

const MKDOCS_CSS = /main\.[A-Fa-f0-9]{8}\.min\.css$/;
const GOOGLE_FONTS = /^https:\/\/fonts\.googleapis\.com/;
const GSTATIC_FONTS = /^https:\/\/fonts\.gstatic\.com/;
const isLink = (node) => node.nodeName === "LINK";
const isSafe$1 = (node) => {
  const href = (node == null ? void 0 : node.getAttribute("href")) || "";
  const isMkdocsCss = href.match(MKDOCS_CSS);
  const isGoogleFonts = href.match(GOOGLE_FONTS);
  const isGstaticFonts = href.match(GSTATIC_FONTS);
  return isMkdocsCss || isGoogleFonts || isGstaticFonts;
};
const removeUnsafeLinks = (node) => {
  if (isLink(node) && !isSafe$1(node)) {
    node.remove();
  }
  return node;
};

const isIframe = (node) => node.nodeName === "IFRAME";
const isSafe = (node, hosts) => {
  const src = node.getAttribute("src") || "";
  try {
    const { host } = new URL(src);
    return hosts.includes(host);
  } catch {
    return false;
  }
};
const removeUnsafeIframes = (hosts) => (node) => {
  if (isIframe(node) && !isSafe(node, hosts)) {
    node.remove();
  }
  return node;
};

const useSanitizerConfig = () => {
  const configApi = useApi(configApiRef);
  return useMemo(() => {
    return configApi.getOptionalConfig("techdocs.sanitizer");
  }, [configApi]);
};
const useSanitizerTransformer = () => {
  const config = useSanitizerConfig();
  return useCallback(async (dom) => {
    const hosts = config == null ? void 0 : config.getOptionalStringArray("allowedIframeHosts");
    DOMPurify.addHook("beforeSanitizeElements", removeUnsafeLinks);
    const tags = ["link"];
    if (hosts) {
      tags.push("iframe");
      DOMPurify.addHook("beforeSanitizeElements", removeUnsafeIframes(hosts));
    }
    return DOMPurify.sanitize(dom.innerHTML, {
      ADD_TAGS: tags,
      FORBID_TAGS: ["style"],
      WHOLE_DOCUMENT: true,
      RETURN_DOM: true
    });
  }, [config]);
};

var variables = ({ theme }) => `
/*==================  Variables  ==================*/
/*
  As the MkDocs output is rendered in shadow DOM, the CSS variable definitions on the root selector are not applied. Instead, they have to be applied on :host.
  As there is no way to transform the served main*.css yet (for example in the backend), we have to copy from main*.css and modify them.
*/

:host {
  /* FONT */
  --md-default-fg-color: ${theme.palette.text.primary};
  --md-default-fg-color--light: ${theme.palette.text.secondary};
  --md-default-fg-color--lighter: ${lighten(theme.palette.text.secondary, 0.7)};
  --md-default-fg-color--lightest: ${lighten(theme.palette.text.secondary, 0.3)};

  /* BACKGROUND */
  --md-default-bg-color:${theme.palette.background.default};
  --md-default-bg-color--light: ${theme.palette.background.paper};
  --md-default-bg-color--lighter: ${lighten(theme.palette.background.paper, 0.7)};
  --md-default-bg-color--lightest: ${lighten(theme.palette.background.paper, 0.3)};

  /* PRIMARY */
  --md-primary-fg-color: ${theme.palette.primary.main};
  --md-primary-fg-color--light: ${theme.palette.primary.light};
  --md-primary-fg-color--dark: ${theme.palette.primary.dark};
  --md-primary-bg-color: ${theme.palette.primary.contrastText};
  --md-primary-bg-color--light: ${lighten(theme.palette.primary.contrastText, 0.7)};

  /* ACCENT */
  --md-accent-fg-color: var(--md-primary-fg-color);

  /* SHADOW */
  --md-shadow-z1: ${theme.shadows[1]};
  --md-shadow-z2: ${theme.shadows[2]};
  --md-shadow-z3: ${theme.shadows[3]};

  /* EXTENSIONS */
  --md-admonition-fg-color: var(--md-default-fg-color);
  --md-admonition-bg-color: var(--md-default-bg-color);
  /* Admonitions and others are using SVG masks to define icons. These masks are defined as CSS variables. */
  --md-admonition-icon--note: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25z"/></svg>');
  --md-admonition-icon--abstract: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 5h16v2H4V5m0 4h16v2H4V9m0 4h16v2H4v-2m0 4h10v2H4v-2z"/></svg>');
  --md-admonition-icon--info: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13 9h-2V7h2m0 10h-2v-6h2m-1-9A10 10 0 002 12a10 10 0 0010 10 10 10 0 0010-10A10 10 0 0012 2z"/></svg>');
  --md-admonition-icon--tip: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17.55 11.2c-.23-.3-.5-.56-.76-.82-.65-.6-1.4-1.03-2.03-1.66C13.3 7.26 13 4.85 13.91 3c-.91.23-1.75.75-2.45 1.32-2.54 2.08-3.54 5.75-2.34 8.9.04.1.08.2.08.33 0 .22-.15.42-.35.5-.22.1-.46.04-.64-.12a.83.83 0 01-.15-.17c-1.1-1.43-1.28-3.48-.53-5.12C5.89 10 5 12.3 5.14 14.47c.04.5.1 1 .27 1.5.14.6.4 1.2.72 1.73 1.04 1.73 2.87 2.97 4.84 3.22 2.1.27 4.35-.12 5.96-1.6 1.8-1.66 2.45-4.32 1.5-6.6l-.13-.26c-.2-.46-.47-.87-.8-1.25l.05-.01m-3.1 6.3c-.28.24-.73.5-1.08.6-1.1.4-2.2-.16-2.87-.82 1.19-.28 1.89-1.16 2.09-2.05.17-.8-.14-1.46-.27-2.23-.12-.74-.1-1.37.18-2.06.17.38.37.76.6 1.06.76 1 1.95 1.44 2.2 2.8.04.14.06.28.06.43.03.82-.32 1.72-.92 2.27h.01z"/></svg>');
  --md-admonition-icon--success: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2m-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>');
  --md-admonition-icon--question: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.07 11.25l-.9.92C13.45 12.89 13 13.5 13 15h-2v-.5c0-1.11.45-2.11 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41a2 2 0 00-2-2 2 2 0 00-2 2H8a4 4 0 014-4 4 4 0 014 4 3.2 3.2 0 01-.93 2.25M13 19h-2v-2h2M12 2A10 10 0 002 12a10 10 0 0010 10 10 10 0 0010-10c0-5.53-4.5-10-10-10z"/></svg>');
  --md-admonition-icon--warning: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13 14h-2v-4h2m0 8h-2v-2h2M1 21h22L12 2 1 21z"/></svg>');
  --md-admonition-icon--failure: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12 6.47 2 12 2m3.59 5L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41 15.59 7z"/></svg>');
  --md-admonition-icon--danger: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11.5 20l4.86-9.73H13V4l-5 9.73h3.5V20M12 2c2.75 0 5.1 1 7.05 2.95C21 6.9 22 9.25 22 12s-1 5.1-2.95 7.05C17.1 21 14.75 22 12 22s-5.1-1-7.05-2.95C3 17.1 2 14.75 2 12s1-5.1 2.95-7.05C6.9 3 9.25 2 12 2z"/></svg>');
  --md-admonition-icon--bug: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14 12h-4v-2h4m0 6h-4v-2h4m6-6h-2.81a5.985 5.985 0 00-1.82-1.96L17 4.41 15.59 3l-2.17 2.17a6.002 6.002 0 00-2.83 0L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8z"/></svg>');
  --md-admonition-icon--example: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 13v-2h14v2H7m0 6v-2h14v2H7M7 7V5h14v2H7M3 8V5H2V4h2v4H3m-1 9v-1h3v4H2v-1h2v-.5H3v-1h1V17H2m2.25-7a.75.75 0 01.75.75c0 .2-.08.39-.21.52L3.12 13H5v1H2v-.92L4 11H2v-1h2.25z"/></svg>');
  --md-admonition-icon--quote: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14 17h3l2-4V7h-6v6h3M6 17h3l2-4V7H5v6h3l-2 4z"/></svg>');
  --md-footnotes-icon: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.42L5.83 13H21V7h-2z"/></svg>');
  --md-details-icon: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8.59 16.58 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.42z"/></svg>');
  --md-tasklist-icon: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>');
  --md-tasklist-icon--checked: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>');
  --md-nav-icon--prev: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 11v2H8l5.5 5.5-1.42 1.42L4.16 12l7.92-7.92L13.5 5.5 8 11h12z"/></svg>');
  --md-nav-icon--next: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8.59 16.58 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.42z"/></svg>');
  --md-toc-icon: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 9h14V7H3v2m0 4h14v-2H3v2m0 4h14v-2H3v2m16 0h2v-2h-2v2m0-10v2h2V7h-2m0 6h2v-2h-2v2z"/></svg>');
  --md-clipboard-icon: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12V1z"/></svg>');
  --md-search-result-icon: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h7c-.41-.25-.8-.56-1.14-.9-.33-.33-.61-.7-.86-1.1H6V4h7v5h5v1.18c.71.16 1.39.43 2 .82V8l-6-6m6.31 16.9c1.33-2.11.69-4.9-1.4-6.22-2.11-1.33-4.91-.68-6.22 1.4-1.34 2.11-.69 4.89 1.4 6.22 1.46.93 3.32.93 4.79.02L22 23.39 23.39 22l-3.08-3.1m-3.81.1a2.5 2.5 0 0 1-2.5-2.5 2.5 2.5 0 0 1 2.5-2.5 2.5 2.5 0 0 1 2.5 2.5 2.5 2.5 0 0 1-2.5 2.5z"/></svg>');
  --md-source-forks-icon: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm0 2.122a2.25 2.25 0 1 0-1.5 0v.878A2.25 2.25 0 0 0 5.75 8.5h1.5v2.128a2.251 2.251 0 1 0 1.5 0V8.5h1.5a2.25 2.25 0 0 0 2.25-2.25v-.878a2.25 2.25 0 1 0-1.5 0v.878a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 5 6.25v-.878zm3.75 7.378a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm3-8.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z"/></svg>');
  --md-source-repositories-icon: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 1 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 0 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 0 1 1-1h8zM5 12.25v3.25a.25.25 0 0 0 .4.2l1.45-1.087a.25.25 0 0 1 .3 0L8.6 15.7a.25.25 0 0 0 .4-.2v-3.25a.25.25 0 0 0-.25-.25h-3.5a.25.25 0 0 0-.25.25z"/></svg>');
  --md-source-stars-icon: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694v.001z"/></svg>');
  --md-source-version-icon: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M2.5 7.775V2.75a.25.25 0 0 1 .25-.25h5.025a.25.25 0 0 1 .177.073l6.25 6.25a.25.25 0 0 1 0 .354l-5.025 5.025a.25.25 0 0 1-.354 0l-6.25-6.25a.25.25 0 0 1-.073-.177zm-1.5 0V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .91.184 1.238.513l6.25 6.25a1.75 1.75 0 0 1 0 2.474l-5.026 5.026a1.75 1.75 0 0 1-2.474 0l-6.25-6.25A1.75 1.75 0 0 1 1 7.775zM6 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>');
  --md-version-icon: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--! Font Awesome Free 6.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2022 Fonticons, Inc.--><path d="m310.6 246.6-127.1 128c-7.1 6.3-15.3 9.4-23.5 9.4s-16.38-3.125-22.63-9.375l-127.1-128C.224 237.5-2.516 223.7 2.438 211.8S19.07 192 32 192h255.1c12.94 0 24.62 7.781 29.58 19.75s3.12 25.75-6.08 34.85z"/></svg>');
}

:host > * {
  /* CODE */
  --md-code-fg-color: ${theme.palette.text.primary};
  --md-code-bg-color: ${theme.palette.background.paper};
  --md-code-hl-color: ${alpha(theme.palette.warning.main, 0.5)};
  --md-code-hl-keyword-color: ${theme.palette.type === "dark" ? theme.palette.primary.light : theme.palette.primary.dark};
  --md-code-hl-function-color: ${theme.palette.type === "dark" ? theme.palette.secondary.light : theme.palette.secondary.dark};
  --md-code-hl-string-color: ${theme.palette.type === "dark" ? theme.palette.success.light : theme.palette.success.dark};
  --md-code-hl-number-color: ${theme.palette.type === "dark" ? theme.palette.error.light : theme.palette.error.dark};
  --md-code-hl-constant-color: var(--md-code-hl-function-color);
  --md-code-hl-special-color: var(--md-code-hl-function-color);
  --md-code-hl-name-color: var(--md-code-fg-color);
  --md-code-hl-comment-color: var(--md-default-fg-color--light);
  --md-code-hl-generic-color: var(--md-default-fg-color--light);
  --md-code-hl-variable-color: var(--md-default-fg-color--light);
  --md-code-hl-operator-color: var(--md-default-fg-color--light);
  --md-code-hl-punctuation-color: var(--md-default-fg-color--light);

  /* TYPESET */
  --md-typeset-font-size: 1rem;
  --md-typeset-color: var(--md-default-fg-color);
  --md-typeset-a-color: var(--md-accent-fg-color);
  --md-typeset-table-color: ${theme.palette.text.primary};
  --md-typeset-del-color: ${theme.palette.type === "dark" ? alpha(theme.palette.error.dark, 0.5) : alpha(theme.palette.error.light, 0.5)};
  --md-typeset-ins-color: ${theme.palette.type === "dark" ? alpha(theme.palette.success.dark, 0.5) : alpha(theme.palette.success.light, 0.5)};
  --md-typeset-mark-color: ${theme.palette.type === "dark" ? alpha(theme.palette.warning.dark, 0.5) : alpha(theme.palette.warning.light, 0.5)};
}

@media screen and (max-width: 76.1875em) {
  :host > * {
    /* TYPESET */
    --md-typeset-font-size: .9rem;
  }
}

@media screen and (max-width: 600px) {
  :host > * {
    /* TYPESET */
    --md-typeset-font-size: .7rem;
  }
}
`;

var reset = ({ theme }) => `
/*==================  Reset  ==================*/

body {
  --md-text-color: var(--md-default-fg-color);
  --md-text-link-color: var(--md-accent-fg-color);
  --md-text-font-family: ${theme.typography.fontFamily};
  font-family: var(--md-text-font-family);
  background-color: unset;
}
`;

var layout = ({ theme, sidebar }) => `
/*==================  Layout  ==================*/

.md-grid {
  max-width: 100%;
  margin: 0;
}

.md-nav {
  font-size: calc(var(--md-typeset-font-size) * 0.9);
}
.md-nav__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.md-nav__icon {
  height: 20px !important;
  width: 20px !important;
  margin-left:${theme.spacing(1)}px;
}
.md-nav__icon svg {
  margin: 0;
  width: 20px !important;
  height: 20px !important;
}
.md-nav__icon:after {
  width: 20px !important;
  height: 20px !important;
}

.md-main__inner {
  margin-top: 0;
}

.md-sidebar {
  bottom: 75px;
  position: fixed;
  width: 16rem;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-color: rgb(193, 193, 193) #eee;
  scrollbar-width: thin;
}
.md-sidebar .md-sidebar__scrollwrap {
  width: calc(16rem - 10px);
}
.md-sidebar--secondary {
  right: ${theme.spacing(3)}px;
}
.md-sidebar::-webkit-scrollbar {
  width: 5px;
}
.md-sidebar::-webkit-scrollbar-button {
  width: 5px;
  height: 5px;
}
.md-sidebar::-webkit-scrollbar-track {
  background: #eee;
  border: 1 px solid rgb(250, 250, 250);
  box-shadow: 0px 0px 3px #dfdfdf inset;
  border-radius: 3px;
}
.md-sidebar::-webkit-scrollbar-thumb {
  width: 5px;
  background: rgb(193, 193, 193);
  border: transparent;
  border-radius: 3px;
}
.md-sidebar::-webkit-scrollbar-thumb:hover {
  background: rgb(125, 125, 125);
}

.md-content {
  max-width: calc(100% - 16rem * 2);
  margin-left: 16rem;
  margin-bottom: 50px;
}

.md-footer {
  position: fixed;
  bottom: 0px;
}
.md-footer__title {
  background-color: unset;
}
.md-footer-nav__link {
  width: 16rem;
}

.md-dialog {
  background-color: unset;
}

@media screen and (min-width: 76.25em) {
  .md-sidebar {
    height: auto;
  }
}

@media screen and (max-width: 76.1875em) {
  .md-nav {
    transition: none !important;
    background-color: var(--md-default-bg-color)
  }
  .md-nav--primary .md-nav__title {
    cursor: auto;
    color: var(--md-default-fg-color);
    font-weight: 700;
    white-space: normal;
    line-height: 1rem;
    height: auto;
    display: flex;
    flex-flow: column;
    row-gap: 1.6rem;
    padding: 1.2rem .8rem .8rem;
    background-color: var(--md-default-bg-color);
  }
  .md-nav--primary .md-nav__title~.md-nav__list {
    box-shadow: none;
  }
  .md-nav--primary .md-nav__title ~ .md-nav__list > :first-child {
    border-top: none;
  }
  .md-nav--primary .md-nav__title .md-nav__button {
    display: none;
  }
  .md-nav--primary .md-nav__title .md-nav__icon {
    color: var(--md-default-fg-color);
    position: static;
    height: auto;
    margin: 0 0 0 -0.2rem;
  }
  .md-nav--primary > .md-nav__title [for="none"] {
    padding-top: 0;
  }
  .md-nav--primary .md-nav__item {
    border-top: none;
  }
  .md-nav--primary :is(.md-nav__title,.md-nav__item) {
    font-size : var(--md-typeset-font-size);
  }
  .md-nav .md-source {
    display: none;
  }

  .md-sidebar {
    height: 100%;
  }
  .md-sidebar--primary {
    width: 12.1rem !important;
    z-index: 200;
    left: ${sidebar.isPinned ? "calc(-12.1rem + 242px)" : "calc(-12.1rem + 72px)"} !important;
  }
  .md-sidebar--secondary:not([hidden]) {
    display: none;
  }

  .md-content {
    max-width: 100%;
    margin-left: 0;
  }

  .md-header__button {
    margin: 0.4rem 0;
    margin-left: 0.4rem;
    padding: 0;
  }

  .md-overlay {
    left: 0;
  }

  .md-footer {
    position: static;
    padding-left: 0;
  }
  .md-footer-nav__link {
    /* footer links begin to overlap at small sizes without setting width */
    width: 50%;
  }
}

@media screen and (max-width: 600px) {
  .md-sidebar--primary {
    left: -12.1rem !important;
    width: 12.1rem;
  }
}
`;

const headings = ["h1", "h2", "h3", "h4", "h5", "h6"];
var typeset = ({ theme }) => `
/*==================  Typeset  ==================*/

.md-typeset {
  font-size: var(--md-typeset-font-size);
}

${headings.reduce((style, heading) => {
  const styles = theme.typography[heading];
  const { lineHeight, fontFamily, fontWeight, fontSize } = styles;
  const calculate = (value) => {
    let factor = 1;
    if (typeof value === "number") {
      factor = value / 16 * 0.6;
    }
    if (typeof value === "string") {
      factor = value.replace("rem", "");
    }
    return `calc(${factor} * var(--md-typeset-font-size))`;
  };
  return style.concat(`
    .md-typeset ${heading} {
      color: var(--md-default-fg-color);
      line-height: ${lineHeight};
      font-family: ${fontFamily};
      font-weight: ${fontWeight};
      font-size: ${calculate(fontSize)};
    }
  `);
}, "")}

.md-typeset .md-content__button {
  color: var(--md-default-fg-color);
}

.md-typeset hr {
  border-bottom: 0.05rem dotted ${theme.palette.divider};
}

.md-typeset details {
  font-size: var(--md-typeset-font-size) !important;
}
.md-typeset details summary {
  padding-left: 2.5rem !important;
}
.md-typeset details summary:before,
.md-typeset details summary:after {
  top: 50% !important;
  width: 20px !important;
  height: 20px !important;
  transform: rotate(0deg) translateY(-50%) !important;
}
.md-typeset details[open] > summary:after {
  transform: rotate(90deg) translateX(-50%) !important;
}

.md-typeset blockquote {
  color: var(--md-default-fg-color--light);
  border-left: 0.2rem solid var(--md-default-fg-color--light);
}

.md-typeset table:not([class]) {
  font-size: var(--md-typeset-font-size);
  border: 1px solid var(--md-default-fg-color);
  border-bottom: none;
  border-collapse: collapse;
}
.md-typeset table:not([class]) th {
  font-weight: bold;
}
.md-typeset table:not([class]) td, .md-typeset table:not([class]) th {
  border-bottom: 1px solid var(--md-default-fg-color);
}

.md-typeset pre > code::-webkit-scrollbar-thumb {
  background-color: hsla(0, 0%, 0%, 0.32);
}
.md-typeset pre > code::-webkit-scrollbar-thumb:hover {
  background-color: hsla(0, 0%, 0%, 0.87);
}
`;

var animations = () => `
/*==================  Animations  ==================*/
/*
  Disable CSS animations on link colors as they lead to issues in dark mode.
  The dark mode color theme is applied later and theirfore there is always an animation from light to dark mode when navigation between pages.
*/
.md-dialog, .md-nav__link, .md-footer__link, .md-typeset a, .md-typeset a::before, .md-typeset .headerlink {
  transition: none;
}
`;

var extensions = ({ theme }) => `
/*==================  Extensions  ==================*/

/* HIGHLIGHT */
.highlight .md-clipboard:after {
  content: unset;
}

.highlight .nx {
  color: ${theme.palette.type === "dark" ? "#ff53a3" : "#ec407a"};
}

/* CODE HILITE */
.codehilite .gd {
  background-color: ${theme.palette.type === "dark" ? "rgba(248,81,73,0.65)" : "#fdd"};
}

.codehilite .gi {
  background-color: ${theme.palette.type === "dark" ? "rgba(46,160,67,0.65)" : "#dfd"};
}

/* TABBED */
.tabbed-set>input:nth-child(1):checked~.tabbed-labels>:nth-child(1),
.tabbed-set>input:nth-child(2):checked~.tabbed-labels>:nth-child(2),
.tabbed-set>input:nth-child(3):checked~.tabbed-labels>:nth-child(3),
.tabbed-set>input:nth-child(4):checked~.tabbed-labels>:nth-child(4),
.tabbed-set>input:nth-child(5):checked~.tabbed-labels>:nth-child(5),
.tabbed-set>input:nth-child(6):checked~.tabbed-labels>:nth-child(6),
.tabbed-set>input:nth-child(7):checked~.tabbed-labels>:nth-child(7),
.tabbed-set>input:nth-child(8):checked~.tabbed-labels>:nth-child(8),
.tabbed-set>input:nth-child(9):checked~.tabbed-labels>:nth-child(9),
.tabbed-set>input:nth-child(10):checked~.tabbed-labels>:nth-child(10),
.tabbed-set>input:nth-child(11):checked~.tabbed-labels>:nth-child(11),
.tabbed-set>input:nth-child(12):checked~.tabbed-labels>:nth-child(12),
.tabbed-set>input:nth-child(13):checked~.tabbed-labels>:nth-child(13),
.tabbed-set>input:nth-child(14):checked~.tabbed-labels>:nth-child(14),
.tabbed-set>input:nth-child(15):checked~.tabbed-labels>:nth-child(15),
.tabbed-set>input:nth-child(16):checked~.tabbed-labels>:nth-child(16),
.tabbed-set>input:nth-child(17):checked~.tabbed-labels>:nth-child(17),
.tabbed-set>input:nth-child(18):checked~.tabbed-labels>:nth-child(18),
.tabbed-set>input:nth-child(19):checked~.tabbed-labels>:nth-child(19),
.tabbed-set>input:nth-child(20):checked~.tabbed-labels>:nth-child(20) {
  color: var(--md-accent-fg-color);
  border-color: var(--md-accent-fg-color);
}

/* TASK-LIST */
.task-list-control .task-list-indicator::before {
  background-color: ${theme.palette.action.disabledBackground};
}
.task-list-control [type="checkbox"]:checked + .task-list-indicator:before {
 background-color: ${theme.palette.success.main};
}

/* ADMONITION */
.admonition {
  font-size: var(--md-typeset-font-size) !important;
}
.admonition .admonition-title {
  padding-left: 2.5rem !important;
}

.admonition .admonition-title:before {
  top: 50% !important;
  width: 20px !important;
  height: 20px !important;
  transform: translateY(-50%) !important;
}
`;

const rules = [
  variables,
  reset,
  layout,
  typeset,
  animations,
  extensions
];

const useSidebar = () => useSidebarPinState();
const useRuleStyles = () => {
  const sidebar = useSidebar();
  const theme = useTheme();
  return useMemo(() => {
    const options = { theme, sidebar };
    return rules.reduce((styles, rule) => styles + rule(options), "");
  }, [theme, sidebar]);
};
const useStylesTransformer = () => {
  const styles = useRuleStyles();
  return useCallback((dom) => {
    dom.getElementsByTagName("head")[0].insertAdjacentHTML("beforeend", `<style>${styles}</style>`);
    return dom;
  }, [styles]);
};

const isSvgNeedingInlining = (attrName, attrVal, apiOrigin) => {
  const isSrcToSvg = attrName === "src" && attrVal.endsWith(".svg");
  const isRelativeUrl = !attrVal.match(/^([a-z]*:)?\/\//i);
  const pointsToOurBackend = attrVal.startsWith(apiOrigin);
  return isSrcToSvg && (isRelativeUrl || pointsToOurBackend);
};
const addBaseUrl = ({
  techdocsStorageApi,
  entityId,
  path
}) => {
  return async (dom) => {
    const apiOrigin = await techdocsStorageApi.getApiOrigin();
    const updateDom = async (list, attributeName) => {
      for (const elem of list) {
        if (elem.hasAttribute(attributeName)) {
          const elemAttribute = elem.getAttribute(attributeName);
          if (!elemAttribute)
            return;
          const newValue = await techdocsStorageApi.getBaseUrl(elemAttribute, entityId, path);
          if (isSvgNeedingInlining(attributeName, elemAttribute, apiOrigin)) {
            try {
              const svg = await fetch(newValue, { credentials: "include" });
              const svgContent = await svg.text();
              elem.setAttribute(attributeName, `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`);
            } catch (e) {
              elem.setAttribute("alt", `Error: ${elemAttribute}`);
            }
          } else {
            elem.setAttribute(attributeName, newValue);
          }
        }
      }
    };
    await Promise.all([
      updateDom(dom.querySelectorAll("img"), "src"),
      updateDom(dom.querySelectorAll("script"), "src"),
      updateDom(dom.querySelectorAll("source"), "src"),
      updateDom(dom.querySelectorAll("link"), "href"),
      updateDom(dom.querySelectorAll("a[download]"), "href")
    ]);
    return dom;
  };
};

const addGitFeedbackLink = (scmIntegrationsApi) => {
  return (dom) => {
    var _a;
    const sourceAnchor = dom.querySelector('[title="Edit this page"]');
    if (!sourceAnchor || !sourceAnchor.href) {
      return dom;
    }
    const sourceURL = new URL(sourceAnchor.href);
    const integration = scmIntegrationsApi.byUrl(sourceURL);
    if ((integration == null ? void 0 : integration.type) !== "github" && (integration == null ? void 0 : integration.type) !== "gitlab") {
      return dom;
    }
    const title = ((_a = dom.querySelector("article>h1")) == null ? void 0 : _a.childNodes[0].textContent) || "";
    const issueTitle = encodeURIComponent(`Documentation Feedback: ${title}`);
    const issueDesc = encodeURIComponent(`Page source:
${sourceAnchor.href}

Feedback:`);
    const gitUrl = (integration == null ? void 0 : integration.type) === "github" ? replaceGitHubUrlType(sourceURL.href, "blob") : sourceURL.href;
    const gitInfo = parseGitUrl(gitUrl);
    const repoPath = `/${gitInfo.organization}/${gitInfo.name}`;
    const feedbackLink = sourceAnchor.cloneNode();
    switch (integration == null ? void 0 : integration.type) {
      case "gitlab":
        feedbackLink.href = `${sourceURL.origin}${repoPath}/issues/new?issue[title]=${issueTitle}&issue[description]=${issueDesc}`;
        break;
      case "github":
        feedbackLink.href = `${sourceURL.origin}${repoPath}/issues/new?title=${issueTitle}&body=${issueDesc}`;
        break;
      default:
        return dom;
    }
    ReactDOM.render(React.createElement(FeedbackOutlinedIcon), feedbackLink);
    feedbackLink.style.paddingLeft = "5px";
    feedbackLink.title = "Leave feedback for this page";
    feedbackLink.id = "git-feedback-link";
    sourceAnchor == null ? void 0 : sourceAnchor.insertAdjacentElement("beforebegin", feedbackLink);
    return dom;
  };
};

const addSidebarToggle = () => {
  return (dom) => {
    const mkdocsToggleSidebar = dom.querySelector('.md-header label[for="__drawer"]');
    const article = dom.querySelector("article");
    if (!mkdocsToggleSidebar || !article) {
      return dom;
    }
    const toggleSidebar = mkdocsToggleSidebar.cloneNode();
    ReactDOM.render(React.createElement(MenuIcon), toggleSidebar);
    toggleSidebar.id = "toggle-sidebar";
    toggleSidebar.title = "Toggle Sidebar";
    toggleSidebar.classList.add("md-content__button");
    toggleSidebar.style.setProperty("padding", "0 0 0 5px");
    toggleSidebar.style.setProperty("margin", "0.4rem 0 0.4rem 0.4rem");
    article == null ? void 0 : article.prepend(toggleSidebar);
    return dom;
  };
};

const rewriteDocLinks = () => {
  return (dom) => {
    const updateDom = (list, attributeName) => {
      Array.from(list).filter((elem) => elem.hasAttribute(attributeName)).forEach((elem) => {
        const elemAttribute = elem.getAttribute(attributeName);
        if (elemAttribute) {
          if (elemAttribute.match(/^https?:\/\//i)) {
            elem.setAttribute("target", "_blank");
          }
          try {
            const normalizedWindowLocation = normalizeUrl(window.location.href);
            elem.setAttribute(attributeName, new URL(elemAttribute, normalizedWindowLocation).toString());
          } catch (_e) {
            elem.replaceWith(elem.textContent || elemAttribute);
          }
        }
      });
    };
    updateDom(Array.from(dom.getElementsByTagName("a")), "href");
    return dom;
  };
};
function normalizeUrl(input) {
  const url = new URL(input);
  if (!url.pathname.endsWith("/") && !url.pathname.endsWith(".html")) {
    url.pathname += "/";
  }
  return url.toString();
}

const addLinkClickListener = ({
  baseUrl,
  onClick
}) => {
  return (dom) => {
    Array.from(dom.getElementsByTagName("a")).forEach((elem) => {
      elem.addEventListener("click", (e) => {
        const target = elem;
        const href = target.getAttribute("href");
        if (!href)
          return;
        if (href.startsWith(baseUrl) && !elem.hasAttribute("download")) {
          e.preventDefault();
          onClick(e, href);
        }
      });
    });
    return dom;
  };
};

const CopyToClipboardTooltip = withStyles((theme) => ({
  tooltip: {
    fontSize: "inherit",
    color: theme.palette.text.primary,
    margin: 0,
    padding: theme.spacing(0.5),
    backgroundColor: "transparent",
    boxShadow: "none"
  }
}))(Tooltip);
const CopyToClipboardIcon = () => /* @__PURE__ */ React.createElement(SvgIcon, null, /* @__PURE__ */ React.createElement("path", {
  d: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
}));
const CopyToClipboardButton = ({ text }) => {
  const [open, setOpen] = useState(false);
  const handleClick = useCallback(() => {
    navigator.clipboard.writeText(text);
    setOpen(true);
  }, [text]);
  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);
  return /* @__PURE__ */ React.createElement(CopyToClipboardTooltip, {
    title: "Copied to clipboard",
    placement: "left",
    open,
    onClose: handleClose,
    leaveDelay: 1e3
  }, /* @__PURE__ */ React.createElement("button", {
    className: "md-clipboard md-icon",
    onClick: handleClick
  }, /* @__PURE__ */ React.createElement(CopyToClipboardIcon, null)));
};
const copyToClipboard = (theme) => {
  return (dom) => {
    var _a;
    const codes = dom.querySelectorAll("pre > code");
    for (const code of codes) {
      const text = code.textContent || "";
      const container = document.createElement("div");
      (_a = code == null ? void 0 : code.parentElement) == null ? void 0 : _a.prepend(container);
      ReactDOM.render(/* @__PURE__ */ React.createElement(ThemeProvider, {
        theme
      }, /* @__PURE__ */ React.createElement(CopyToClipboardButton, {
        text
      })), container);
    }
    return dom;
  };
};

const removeMkdocsHeader = () => {
  return (dom) => {
    var _a;
    (_a = dom.querySelector(".md-header")) == null ? void 0 : _a.remove();
    return dom;
  };
};

const simplifyMkdocsFooter = () => {
  return (dom) => {
    var _a, _b;
    (_a = dom.querySelector(".md-footer .md-copyright")) == null ? void 0 : _a.remove();
    (_b = dom.querySelector(".md-footer-copyright")) == null ? void 0 : _b.remove();
    return dom;
  };
};

const onCssReady = ({
  onLoading,
  onLoaded
}) => {
  return (dom) => {
    onLoading();
    dom.addEventListener(SHADOW_DOM_STYLE_LOAD_EVENT, function handleShadowDomStyleLoad() {
      onLoaded();
      dom.removeEventListener(SHADOW_DOM_STYLE_LOAD_EVENT, handleShadowDomStyleLoad);
    });
    return dom;
  };
};

const scrollIntoAnchor = () => {
  return (dom) => {
    setTimeout(() => {
      var _a;
      if (window.location.hash) {
        const hash = window.location.hash.slice(1);
        (_a = dom == null ? void 0 : dom.querySelector(`[id="${hash}"]`)) == null ? void 0 : _a.scrollIntoView();
      }
    }, 200);
    return dom;
  };
};

const transform = async (html, transformers) => {
  let dom;
  if (typeof html === "string") {
    dom = new DOMParser().parseFromString(html, "text/html").documentElement;
  } else if (html instanceof Element) {
    dom = html;
  } else {
    throw new Error("dom is not a recognized type");
  }
  for (const transformer of transformers) {
    dom = await transformer(dom);
  }
  return dom;
};

const MOBILE_MEDIA_QUERY = "screen and (max-width: 76.1875em)";
const useTechDocsReaderDom = (entityRef) => {
  const navigate = useNavigate$1();
  const theme = useTheme();
  const isMobileMedia = useMediaQuery(MOBILE_MEDIA_QUERY);
  const sanitizerTransformer = useSanitizerTransformer();
  const stylesTransformer = useStylesTransformer();
  const techdocsStorageApi = useApi(techdocsStorageApiRef$1);
  const scmIntegrationsApi = useApi(scmIntegrationsApiRef);
  const { state, path, content: rawPage } = useTechDocsReader();
  const [dom, setDom] = useState(null);
  const isStyleLoading = useShadowDomStylesLoading(dom);
  const updateSidebarPosition = useCallback(() => {
    if (!dom)
      return;
    const sidebars = dom.querySelectorAll(".md-sidebar");
    sidebars.forEach((element) => {
      var _a, _b;
      if (isMobileMedia) {
        element.style.top = "0px";
      } else {
        const domTop = (_a = dom.getBoundingClientRect().top) != null ? _a : 0;
        const tabs = dom.querySelector(".md-container > .md-tabs");
        const tabsHeight = (_b = tabs == null ? void 0 : tabs.getBoundingClientRect().height) != null ? _b : 0;
        element.style.top = `${Math.max(domTop, 0) + tabsHeight}px`;
      }
      element.style.setProperty("opacity", "1");
    });
  }, [dom, isMobileMedia]);
  useEffect(() => {
    window.addEventListener("resize", updateSidebarPosition);
    window.addEventListener("scroll", updateSidebarPosition, true);
    return () => {
      window.removeEventListener("resize", updateSidebarPosition);
      window.removeEventListener("scroll", updateSidebarPosition, true);
    };
  }, [dom, updateSidebarPosition]);
  const updateFooterWidth = useCallback(() => {
    if (!dom)
      return;
    const footer = dom.querySelector(".md-footer");
    if (footer) {
      footer.style.width = `${dom.getBoundingClientRect().width}px`;
    }
  }, [dom]);
  useEffect(() => {
    window.addEventListener("resize", updateFooterWidth);
    return () => {
      window.removeEventListener("resize", updateFooterWidth);
    };
  }, [dom, updateFooterWidth]);
  useEffect(() => {
    if (!isStyleLoading) {
      updateFooterWidth();
      updateSidebarPosition();
    }
  }, [state, isStyleLoading, updateFooterWidth, updateSidebarPosition]);
  const preRender = useCallback((rawContent, contentPath) => transform(rawContent, [
    sanitizerTransformer,
    addBaseUrl({
      techdocsStorageApi,
      entityId: entityRef,
      path: contentPath
    }),
    rewriteDocLinks(),
    addSidebarToggle(),
    removeMkdocsHeader(),
    simplifyMkdocsFooter(),
    addGitFeedbackLink(scmIntegrationsApi),
    stylesTransformer
  ]), [
    entityRef,
    scmIntegrationsApi,
    techdocsStorageApi,
    sanitizerTransformer,
    stylesTransformer
  ]);
  const postRender = useCallback(async (transformedElement) => transform(transformedElement, [
    scrollIntoAnchor(),
    copyToClipboard(theme),
    addLinkClickListener({
      baseUrl: window.location.origin,
      onClick: (event, url) => {
        var _a;
        const modifierActive = event.ctrlKey || event.metaKey;
        const parsedUrl = new URL(url);
        if (parsedUrl.hash) {
          if (modifierActive) {
            window.open(`${parsedUrl.pathname}${parsedUrl.hash}`, "_blank");
          } else {
            navigate(`${parsedUrl.pathname}${parsedUrl.hash}`);
            (_a = transformedElement == null ? void 0 : transformedElement.querySelector(`#${parsedUrl.hash.slice(1)}`)) == null ? void 0 : _a.scrollIntoView();
          }
        } else {
          if (modifierActive) {
            window.open(parsedUrl.pathname, "_blank");
          } else {
            navigate(parsedUrl.pathname);
          }
        }
      }
    }),
    onCssReady({
      onLoading: () => {
      },
      onLoaded: () => {
        var _a;
        (_a = transformedElement.querySelector(".md-nav__title")) == null ? void 0 : _a.removeAttribute("for");
      }
    }),
    onCssReady({
      onLoading: () => {
        const sidebars = Array.from(transformedElement.querySelectorAll(".md-sidebar"));
        sidebars.forEach((element) => {
          element.style.setProperty("opacity", "0");
        });
      },
      onLoaded: () => {
      }
    })
  ]), [theme, navigate]);
  useEffect(() => {
    if (!rawPage)
      return () => {
      };
    let shouldReplaceContent = true;
    preRender(rawPage, path).then(async (preTransformedDomElement) => {
      if (!(preTransformedDomElement == null ? void 0 : preTransformedDomElement.innerHTML)) {
        return;
      }
      if (!shouldReplaceContent) {
        return;
      }
      window.scroll({ top: 0 });
      const postTransformedDomElement = await postRender(preTransformedDomElement);
      setDom(postTransformedDomElement);
    });
    return () => {
      shouldReplaceContent = false;
    };
  }, [rawPage, path, preRender, postRender]);
  return dom;
};

const TechDocsReaderPageContentAddons = () => {
  const addons = useTechDocsAddons();
  const { shadowRoot } = useTechDocsReaderPage();
  const contentElement = shadowRoot == null ? void 0 : shadowRoot.querySelector('[data-md-component="content"]');
  const primarySidebarElement = shadowRoot == null ? void 0 : shadowRoot.querySelector('div[data-md-component="sidebar"][data-md-type="navigation"], div[data-md-component="navigation"]');
  let primarySidebarAddonLocation = primarySidebarElement == null ? void 0 : primarySidebarElement.querySelector('[data-techdocs-addons-location="primary sidebar"]');
  if (!primarySidebarAddonLocation) {
    primarySidebarAddonLocation = document.createElement("div");
    primarySidebarAddonLocation.setAttribute("data-techdocs-addons-location", "primary sidebar");
    primarySidebarElement == null ? void 0 : primarySidebarElement.prepend(primarySidebarAddonLocation);
  }
  const secondarySidebarElement = shadowRoot == null ? void 0 : shadowRoot.querySelector('div[data-md-component="sidebar"][data-md-type="toc"], div[data-md-component="toc"]');
  let secondarySidebarAddonLocation = secondarySidebarElement == null ? void 0 : secondarySidebarElement.querySelector('[data-techdocs-addons-location="secondary sidebar"]');
  if (!secondarySidebarAddonLocation) {
    secondarySidebarAddonLocation = document.createElement("div");
    secondarySidebarAddonLocation.setAttribute("data-techdocs-addons-location", "secondary sidebar");
    secondarySidebarElement == null ? void 0 : secondarySidebarElement.prepend(secondarySidebarAddonLocation);
  }
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Portal, {
    container: primarySidebarAddonLocation
  }, addons.renderComponentsByLocation(TechDocsAddonLocations.PrimarySidebar)), /* @__PURE__ */ React.createElement(Portal, {
    container: contentElement
  }, addons.renderComponentsByLocation(TechDocsAddonLocations.Content)), /* @__PURE__ */ React.createElement(Portal, {
    container: secondarySidebarAddonLocation
  }, addons.renderComponentsByLocation(TechDocsAddonLocations.SecondarySidebar)));
};

const useStyles$1 = makeStyles({
  search: {
    width: "100%",
    "@media (min-width: 76.1875em)": {
      width: "calc(100% - 34.4rem)",
      margin: "0 auto"
    }
  }
});
const TechDocsReaderPageContent = withTechDocsReaderProvider((props) => {
  const { withSearch = true, onReady } = props;
  const classes = useStyles$1();
  const {
    entityMetadata: { value: entityMetadata, loading: entityMetadataLoading },
    entityRef,
    setShadowRoot
  } = useTechDocsReaderPage();
  const dom = useTechDocsReaderDom(entityRef);
  const handleAppend = useCallback((newShadowRoot) => {
    setShadowRoot(newShadowRoot);
    if (onReady instanceof Function) {
      onReady();
    }
  }, [setShadowRoot, onReady]);
  if (entityMetadataLoading === false && !entityMetadata)
    return /* @__PURE__ */ React.createElement(ErrorPage, {
      status: "404",
      statusMessage: "PAGE NOT FOUND"
    });
  if (!dom) {
    return /* @__PURE__ */ React.createElement(Content, null, /* @__PURE__ */ React.createElement(Grid, {
      container: true
    }, /* @__PURE__ */ React.createElement(Grid, {
      xs: 12,
      item: true
    }, /* @__PURE__ */ React.createElement(TechDocsStateIndicator, null))));
  }
  return /* @__PURE__ */ React.createElement(Content, null, /* @__PURE__ */ React.createElement(Grid, {
    container: true
  }, /* @__PURE__ */ React.createElement(Grid, {
    xs: 12,
    item: true
  }, /* @__PURE__ */ React.createElement(TechDocsStateIndicator, null)), withSearch && /* @__PURE__ */ React.createElement(Grid, {
    className: classes.search,
    xs: "auto",
    item: true
  }, /* @__PURE__ */ React.createElement(TechDocsSearch, {
    entityId: entityRef
  })), /* @__PURE__ */ React.createElement(Grid, {
    xs: 12,
    item: true
  }, /* @__PURE__ */ React.createElement(TechDocsShadowDom, {
    element: dom,
    onAppend: handleAppend
  }, /* @__PURE__ */ React.createElement(TechDocsReaderPageContentAddons, null)))));
});
const Reader = TechDocsReaderPageContent;

const rootRouteRef = createRouteRef({
  id: "techdocs:index-page"
});
const rootDocsRouteRef = createRouteRef({
  id: "techdocs:reader-page",
  params: ["namespace", "kind", "name"]
});
const rootCatalogDocsRouteRef = createRouteRef({
  id: "techdocs:catalog-reader-view"
});

const skeleton = /* @__PURE__ */ React.createElement(Skeleton, {
  animation: "wave",
  variant: "text",
  height: 40
});
const TechDocsReaderPageHeader = (props) => {
  const { children } = props;
  const addons = useTechDocsAddons();
  const configApi = useApi(configApiRef);
  const {
    title,
    setTitle,
    subtitle,
    setSubtitle,
    entityRef,
    metadata: { value: metadata, loading: metadataLoading },
    entityMetadata: { value: entityMetadata, loading: entityMetadataLoading }
  } = useTechDocsReaderPage();
  useEffect(() => {
    if (!metadata)
      return;
    setTitle((prevTitle) => {
      const { site_name } = metadata;
      return prevTitle || site_name;
    });
    setSubtitle((prevSubtitle) => {
      let { site_description } = metadata;
      if (!site_description || site_description === "None") {
        site_description = "Home";
      }
      return prevSubtitle || site_description;
    });
  }, [metadata, setTitle, setSubtitle]);
  const appTitle = configApi.getOptional("app.title") || "Backstage";
  const tabTitle = [subtitle, title, appTitle].filter(Boolean).join(" | ");
  const { locationMetadata, spec } = entityMetadata || {};
  const lifecycle = spec == null ? void 0 : spec.lifecycle;
  const ownedByRelations = entityMetadata ? getEntityRelations(entityMetadata, RELATION_OWNED_BY) : [];
  const docsRootLink = useRouteRef(rootRouteRef)();
  const labels = /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(HeaderLabel, {
    label: "Component",
    value: /* @__PURE__ */ React.createElement(EntityRefLink, {
      color: "inherit",
      entityRef,
      defaultKind: "Component"
    })
  }), ownedByRelations.length > 0 && /* @__PURE__ */ React.createElement(HeaderLabel, {
    label: "Owner",
    value: /* @__PURE__ */ React.createElement(EntityRefLinks, {
      color: "inherit",
      entityRefs: ownedByRelations,
      defaultKind: "group"
    })
  }), lifecycle ? /* @__PURE__ */ React.createElement(HeaderLabel, {
    label: "Lifecycle",
    value: lifecycle
  }) : null, locationMetadata && locationMetadata.type !== "dir" && locationMetadata.type !== "file" ? /* @__PURE__ */ React.createElement(HeaderLabel, {
    label: "",
    value: /* @__PURE__ */ React.createElement("a", {
      href: locationMetadata.target,
      target: "_blank",
      rel: "noopener noreferrer"
    }, /* @__PURE__ */ React.createElement(CodeIcon, {
      style: { marginTop: "-25px", fill: "#fff" }
    }))
  }) : null);
  const noEntMetadata = !entityMetadataLoading && entityMetadata === void 0;
  const noTdMetadata = !metadataLoading && metadata === void 0;
  if (noEntMetadata || noTdMetadata)
    return null;
  return /* @__PURE__ */ React.createElement(Header, {
    type: "Documentation",
    typeLink: docsRootLink,
    title: title || skeleton,
    subtitle: subtitle || skeleton
  }, /* @__PURE__ */ React.createElement(Helmet, {
    titleTemplate: "%s"
  }, /* @__PURE__ */ React.createElement("title", null, tabTitle)), labels, children, addons.renderComponentsByLocation(TechDocsAddonLocations.Header));
};

const useStyles = makeStyles((theme) => ({
  root: {
    gridArea: "pageSubheader",
    flexDirection: "column",
    minHeight: "auto",
    padding: theme.spacing(3, 3, 0)
  }
}));
const TechDocsReaderPageSubheader = ({
  toolbarProps
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);
  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);
  const {
    entityMetadata: { value: entityMetadata, loading: entityMetadataLoading }
  } = useTechDocsReaderPage();
  const addons = useTechDocsAddons();
  const subheaderAddons = addons.renderComponentsByLocation(TechDocsAddonLocations.Subheader);
  const settingsAddons = addons.renderComponentsByLocation(TechDocsAddonLocations.Settings);
  if (!subheaderAddons && !settingsAddons)
    return null;
  if (entityMetadataLoading === false && !entityMetadata)
    return null;
  return /* @__PURE__ */ React.createElement(Toolbar, {
    classes,
    ...toolbarProps
  }, /* @__PURE__ */ React.createElement(Box, {
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
    flexWrap: "wrap"
  }, subheaderAddons, settingsAddons ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Tooltip, {
    title: "Settings"
  }, /* @__PURE__ */ React.createElement(IconButton, {
    "aria-controls": "tech-docs-reader-page-settings",
    "aria-haspopup": "true",
    onClick: handleClick
  }, /* @__PURE__ */ React.createElement(SettingsIcon, null))), /* @__PURE__ */ React.createElement(Menu, {
    id: "tech-docs-reader-page-settings",
    getContentAnchorEl: null,
    anchorEl,
    anchorOrigin: { vertical: "bottom", horizontal: "right" },
    open: Boolean(anchorEl),
    onClose: handleClose,
    keepMounted: true
  }, settingsAddons)) : null));
};

const TechDocsReaderLayout = ({
  withSearch,
  withHeader = true
}) => {
  return /* @__PURE__ */ React.createElement(Page, {
    themeId: "documentation"
  }, withHeader && /* @__PURE__ */ React.createElement(TechDocsReaderPageHeader, null), /* @__PURE__ */ React.createElement(TechDocsReaderPageSubheader, null), /* @__PURE__ */ React.createElement(TechDocsReaderPageContent, {
    withSearch
  }));
};
const TechDocsReaderPage$1 = (props) => {
  const { kind, name, namespace } = useParams();
  const { children, entityRef = { kind, name, namespace } } = props;
  const outlet = useOutlet();
  if (!children) {
    const childrenList = outlet ? Children.toArray(outlet.props.children) : [];
    const page = childrenList.find((child) => {
      var _a, _b;
      const { type } = child;
      return !((_b = (_a = type == null ? void 0 : type.__backstage_data) == null ? void 0 : _a.map) == null ? void 0 : _b.get(TECHDOCS_ADDONS_WRAPPER_KEY));
    });
    return /* @__PURE__ */ React.createElement(TechDocsReaderPageProvider, {
      entityRef
    }, page || /* @__PURE__ */ React.createElement(TechDocsReaderLayout, null));
  }
  return /* @__PURE__ */ React.createElement(TechDocsReaderPageProvider, {
    entityRef
  }, ({ metadata, entityMetadata, onReady }) => /* @__PURE__ */ React.createElement(Page, {
    themeId: "documentation"
  }, children instanceof Function ? children({
    entityRef,
    techdocsMetadataValue: metadata.value,
    entityMetadataValue: entityMetadata.value,
    onReady
  }) : children));
};

function toLowerMaybe(str, config) {
  return config.getOptionalBoolean("techdocs.legacyUseCaseSensitiveTripletPaths") ? str : str.toLocaleLowerCase("en-US");
}

const DocsCardGrid = (props) => {
  const { entities } = props;
  const getRouteToReaderPageFor = useRouteRef(rootDocsRouteRef);
  const config = useApi(configApiRef);
  if (!entities)
    return null;
  return /* @__PURE__ */ React.createElement(ItemCardGrid, {
    "data-testid": "docs-explore"
  }, !(entities == null ? void 0 : entities.length) ? null : entities.map((entity, index) => {
    var _a, _b;
    return /* @__PURE__ */ React.createElement(Card, {
      key: index
    }, /* @__PURE__ */ React.createElement(CardMedia, null, /* @__PURE__ */ React.createElement(ItemCardHeader, {
      title: (_a = entity.metadata.title) != null ? _a : entity.metadata.name
    })), /* @__PURE__ */ React.createElement(CardContent, null, entity.metadata.description), /* @__PURE__ */ React.createElement(CardActions, null, /* @__PURE__ */ React.createElement(Button$1, {
      to: getRouteToReaderPageFor({
        namespace: toLowerMaybe((_b = entity.metadata.namespace) != null ? _b : "default", config),
        kind: toLowerMaybe(entity.kind, config),
        name: toLowerMaybe(entity.metadata.name, config)
      }),
      color: "primary",
      "data-testid": "read_docs"
    }, "Read Docs")));
  }));
};

const EntityListDocsGrid = () => {
  const { loading, error, entities } = useEntityList();
  if (error) {
    return /* @__PURE__ */ React.createElement(WarningPanel, {
      severity: "error",
      title: "Could not load available documentation."
    }, /* @__PURE__ */ React.createElement(CodeSnippet, {
      language: "text",
      text: error.toString()
    }));
  }
  if (loading || !entities) {
    return /* @__PURE__ */ React.createElement(Progress, null);
  }
  entities.sort((a, b) => {
    var _a, _b;
    return ((_a = a.metadata.title) != null ? _a : a.metadata.name).localeCompare((_b = b.metadata.title) != null ? _b : b.metadata.name);
  });
  return /* @__PURE__ */ React.createElement(DocsCardGrid, {
    entities
  });
};

const YellowStar = withStyles$1({
  root: {
    color: "#f3ba37"
  }
})(Star);
const actionFactories = {
  createCopyDocsUrlAction(copyToClipboard) {
    return (row) => {
      return {
        icon: () => /* @__PURE__ */ React.createElement(ShareIcon, {
          fontSize: "small"
        }),
        tooltip: "Click to copy documentation link to clipboard",
        onClick: () => copyToClipboard(`${window.location.origin}${row.resolved.docsUrl}`)
      };
    };
  },
  createStarEntityAction(isStarredEntity, toggleStarredEntity) {
    return ({ entity }) => {
      const isStarred = isStarredEntity(entity);
      return {
        cellStyle: { paddingLeft: "1em" },
        icon: () => isStarred ? /* @__PURE__ */ React.createElement(YellowStar, null) : /* @__PURE__ */ React.createElement(StarBorder, null),
        tooltip: isStarred ? "Remove from favorites" : "Add to favorites",
        onClick: () => toggleStarredEntity(entity)
      };
    };
  }
};

function customTitle(entity) {
  return entity.metadata.title || entity.metadata.name;
}
const columnFactories = {
  createNameColumn() {
    return {
      title: "Document",
      field: "entity.metadata.name",
      highlight: true,
      render: (row) => /* @__PURE__ */ React.createElement(SubvalueCell, {
        value: /* @__PURE__ */ React.createElement(Link, {
          to: row.resolved.docsUrl
        }, customTitle(row.entity)),
        subvalue: row.entity.metadata.description
      })
    };
  },
  createOwnerColumn() {
    return {
      title: "Owner",
      field: "resolved.ownedByRelationsTitle",
      render: ({ resolved }) => /* @__PURE__ */ React.createElement(EntityRefLinks, {
        entityRefs: resolved.ownedByRelations,
        defaultKind: "group"
      })
    };
  },
  createTypeColumn() {
    return {
      title: "Type",
      field: "entity.spec.type"
    };
  }
};

const DocsTable = (props) => {
  const { entities, title, loading, columns, actions } = props;
  const [, copyToClipboard] = useCopyToClipboard();
  const getRouteToReaderPageFor = useRouteRef(rootDocsRouteRef);
  const config = useApi(configApiRef);
  if (!entities)
    return null;
  const documents = entities.map((entity) => {
    var _a;
    const ownedByRelations = getEntityRelations(entity, RELATION_OWNED_BY);
    return {
      entity,
      resolved: {
        docsUrl: getRouteToReaderPageFor({
          namespace: toLowerMaybe((_a = entity.metadata.namespace) != null ? _a : "default", config),
          kind: toLowerMaybe(entity.kind, config),
          name: toLowerMaybe(entity.metadata.name, config)
        }),
        ownedByRelations,
        ownedByRelationsTitle: ownedByRelations.map((r) => humanizeEntityRef(r, { defaultKind: "group" })).join(", ")
      }
    };
  });
  const defaultColumns = [
    columnFactories.createNameColumn(),
    columnFactories.createOwnerColumn(),
    columnFactories.createTypeColumn()
  ];
  const defaultActions = [
    actionFactories.createCopyDocsUrlAction(copyToClipboard)
  ];
  return /* @__PURE__ */ React.createElement(React.Fragment, null, loading || documents && documents.length > 0 ? /* @__PURE__ */ React.createElement(Table, {
    isLoading: loading,
    options: {
      paging: true,
      pageSize: 20,
      search: true,
      actionsColumnIndex: -1
    },
    data: documents,
    columns: columns || defaultColumns,
    actions: actions || defaultActions,
    title: title ? `${title} (${documents.length})` : `All (${documents.length})`
  }) : /* @__PURE__ */ React.createElement(EmptyState, {
    missing: "data",
    title: "No documents to show",
    description: "Create your own document. Check out our Getting Started Information",
    action: /* @__PURE__ */ React.createElement(Button$1, {
      color: "primary",
      to: "https://backstage.io/docs/features/techdocs/getting-started",
      variant: "contained"
    }, "DOCS")
  }));
};
DocsTable.columns = columnFactories;
DocsTable.actions = actionFactories;

const EntityListDocsTable = (props) => {
  var _a, _b;
  const { columns, actions } = props;
  const { loading, error, entities, filters } = useEntityList();
  const { isStarredEntity, toggleStarredEntity } = useStarredEntities();
  const [, copyToClipboard] = useCopyToClipboard();
  const title = capitalize((_b = (_a = filters.user) == null ? void 0 : _a.value) != null ? _b : "all");
  const defaultActions = [
    actionFactories.createCopyDocsUrlAction(copyToClipboard),
    actionFactories.createStarEntityAction(isStarredEntity, toggleStarredEntity)
  ];
  if (error) {
    return /* @__PURE__ */ React.createElement(WarningPanel, {
      severity: "error",
      title: "Could not load available documentation."
    }, /* @__PURE__ */ React.createElement(CodeSnippet, {
      language: "text",
      text: error.toString()
    }));
  }
  return /* @__PURE__ */ React.createElement(DocsTable, {
    title,
    entities,
    loading,
    actions: actions || defaultActions,
    columns
  });
};
EntityListDocsTable.columns = columnFactories;
EntityListDocsTable.actions = actionFactories;

const TechDocsPageWrapper = (props) => {
  var _a;
  const { children } = props;
  const configApi = useApi(configApiRef);
  const generatedSubtitle = `Documentation available in ${(_a = configApi.getOptionalString("organization.name")) != null ? _a : "Backstage"}`;
  return /* @__PURE__ */ React.createElement(PageWithHeader, {
    title: "Documentation",
    subtitle: generatedSubtitle,
    themeId: "documentation"
  }, children);
};

class TechDocsFilter {
  getCatalogFilters() {
    return {
      "metadata.annotations.backstage.io/techdocs-ref": CATALOG_FILTER_EXISTS
    };
  }
}
const TechDocsPicker = () => {
  const { updateFilters } = useEntityList();
  useEffect(() => {
    updateFilters({
      techdocs: new TechDocsFilter()
    });
  }, [updateFilters]);
  return null;
};

const DefaultTechDocsHome = (props) => {
  const { initialFilter = "all", columns, actions } = props;
  return /* @__PURE__ */ React.createElement(TechDocsPageWrapper, null, /* @__PURE__ */ React.createElement(Content, null, /* @__PURE__ */ React.createElement(ContentHeader, {
    title: ""
  }, /* @__PURE__ */ React.createElement(SupportButton, null, "Discover documentation in your ecosystem.")), /* @__PURE__ */ React.createElement(EntityListProvider, null, /* @__PURE__ */ React.createElement(CatalogFilterLayout, null, /* @__PURE__ */ React.createElement(CatalogFilterLayout.Filters, null, /* @__PURE__ */ React.createElement(TechDocsPicker, null), /* @__PURE__ */ React.createElement(UserListPicker, {
    initialFilter
  }), /* @__PURE__ */ React.createElement(EntityOwnerPicker, null), /* @__PURE__ */ React.createElement(EntityTagPicker, null)), /* @__PURE__ */ React.createElement(CatalogFilterLayout.Content, null, /* @__PURE__ */ React.createElement(EntityListDocsTable, {
    actions,
    columns
  }))))));
};

const techdocsPlugin = createPlugin({
  id: "techdocs",
  apis: [
    createApiFactory({
      api: techdocsStorageApiRef$1,
      deps: {
        configApi: configApiRef,
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
        fetchApi: fetchApiRef
      },
      factory: ({ configApi, discoveryApi, identityApi, fetchApi }) => new TechDocsStorageClient({
        configApi,
        discoveryApi,
        identityApi,
        fetchApi
      })
    }),
    createApiFactory({
      api: techdocsApiRef$1,
      deps: {
        configApi: configApiRef,
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef
      },
      factory: ({ configApi, discoveryApi, fetchApi }) => new TechDocsClient({
        configApi,
        discoveryApi,
        fetchApi
      })
    })
  ],
  routes: {
    root: rootRouteRef,
    docRoot: rootDocsRouteRef,
    entityContent: rootCatalogDocsRouteRef
  }
});
const TechdocsPage = techdocsPlugin.provide(createRoutableExtension({
  name: "TechdocsPage",
  component: () => Promise.resolve().then(function () { return Router$1; }).then((m) => m.Router),
  mountPoint: rootRouteRef
}));
const EntityTechdocsContent = techdocsPlugin.provide(createRoutableExtension({
  name: "EntityTechdocsContent",
  component: () => Promise.resolve().then(function () { return Router$1; }).then((m) => m.EmbeddedDocsRouter),
  mountPoint: rootCatalogDocsRouteRef
}));
const TechDocsCustomHome = techdocsPlugin.provide(createRoutableExtension({
  name: "TechDocsCustomHome",
  component: () => import('./TechDocsCustomHome-38c20d17.esm.js').then((m) => m.TechDocsCustomHome),
  mountPoint: rootRouteRef
}));
const TechDocsIndexPage$2 = techdocsPlugin.provide(createRoutableExtension({
  name: "TechDocsIndexPage",
  component: () => Promise.resolve().then(function () { return TechDocsIndexPage$1; }).then((m) => m.TechDocsIndexPage),
  mountPoint: rootRouteRef
}));
const TechDocsReaderPage = techdocsPlugin.provide(createRoutableExtension({
  name: "TechDocsReaderPage",
  component: () => import('./index-779d10dc.esm.js').then((m) => m.TechDocsReaderPage),
  mountPoint: rootDocsRouteRef
}));

const EntityPageDocs = ({ entity }) => {
  const entityRef = getCompoundEntityRef(entity);
  return /* @__PURE__ */ React.createElement(TechDocsReaderPage, {
    entityRef
  }, /* @__PURE__ */ React.createElement(TechDocsReaderPageSubheader, null), /* @__PURE__ */ React.createElement(TechDocsReaderPageContent, {
    withSearch: false
  }));
};

const TechDocsIndexPage = () => {
  const outlet = useOutlet$1();
  return outlet || /* @__PURE__ */ React.createElement(DefaultTechDocsHome, null);
};

var TechDocsIndexPage$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  TechDocsIndexPage: TechDocsIndexPage
});

const TECHDOCS_ANNOTATION = "backstage.io/techdocs-ref";
const isTechDocsAvailable = (entity) => {
  var _a, _b;
  return Boolean((_b = (_a = entity == null ? void 0 : entity.metadata) == null ? void 0 : _a.annotations) == null ? void 0 : _b[TECHDOCS_ANNOTATION]);
};
const Router = () => {
  return /* @__PURE__ */ React.createElement(Routes, null, /* @__PURE__ */ React.createElement(Route, {
    path: "/",
    element: /* @__PURE__ */ React.createElement(TechDocsIndexPage, null)
  }), /* @__PURE__ */ React.createElement(Route, {
    path: "/:namespace/:kind/:name/*",
    element: /* @__PURE__ */ React.createElement(TechDocsReaderPage$1, null)
  }));
};
const EmbeddedDocsRouter = (props) => {
  var _a;
  const { children } = props;
  const { entity } = useEntity();
  const element = useRoutes([
    {
      path: "/*",
      element: /* @__PURE__ */ React.createElement(EntityPageDocs, {
        entity
      }),
      children: [
        {
          path: "/*",
          element: children
        }
      ]
    }
  ]);
  const projectId = (_a = entity.metadata.annotations) == null ? void 0 : _a[TECHDOCS_ANNOTATION];
  if (!projectId) {
    return /* @__PURE__ */ React.createElement(MissingAnnotationEmptyState, {
      annotation: TECHDOCS_ANNOTATION
    });
  }
  return element;
};

var Router$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  isTechDocsAvailable: isTechDocsAvailable,
  Router: Router,
  EmbeddedDocsRouter: EmbeddedDocsRouter
});

export { DocsTable as D, EntityTechdocsContent as E, Reader as R, TechDocsPageWrapper as T, DocsCardGrid as a, TechDocsReaderPage$1 as b, TechDocsReaderLayout as c, TechDocsCustomHome as d, TechDocsIndexPage$2 as e, TechdocsPage as f, TechDocsReaderPage as g, techdocsStorageApiRef as h, techdocsApiRef as i, TechDocsClient as j, TechDocsStorageClient as k, TechDocsReaderProvider as l, TechDocsReaderPageHeader as m, TechDocsReaderPageContent as n, TechDocsReaderPageSubheader as o, TechDocsSearchResultListItem as p, TechDocsSearch as q, EntityListDocsGrid as r, EntityListDocsTable as s, techdocsPlugin as t, DefaultTechDocsHome as u, TechDocsPicker as v, isTechDocsAvailable as w, Router as x, EmbeddedDocsRouter as y };
//# sourceMappingURL=index-a5aa1ac0.esm.js.map
