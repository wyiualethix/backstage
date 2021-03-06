import React, { useState, useEffect, useRef, useCallback, useLayoutEffect, lazy, Suspense, useMemo, Component as Component$3, Children, isValidElement, useContext, Fragment, createContext, forwardRef } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { Alert } from '@material-ui/lab';
import { useApi, alertApiRef, useAnalytics, errorApiRef, storageApiRef, useApp, oauthRequestApiRef, useApiHolder, configApiRef, useElementFilter, attachComponentData, discoveryApiRef } from '@backstage/core-plugin-api';
import pluralize from 'pluralize';
import { makeStyles, createStyles, useTheme, darken, lighten, withStyles, styled, ThemeProvider } from '@material-ui/core/styles';
import MaterialAvatar from '@material-ui/core/Avatar';
import Button$1 from '@material-ui/core/Button';
import classNames from 'classnames';
import Link$1 from '@material-ui/core/Link';
import { Link as Link$2, useSearchParams, useLocation, useResolvedPath, resolvePath } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';
import CopyIcon from '@material-ui/icons/FileCopy';
import useCopyToClipboard from 'react-use/lib/useCopyToClipboard';
import { LightAsync } from 'react-syntax-highlighter';
import dark from 'react-syntax-highlighter/dist/esm/styles/hljs/dark';
import docco from 'react-syntax-highlighter/dist/esm/styles/hljs/docco';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import AddCircleOutline from '@material-ui/icons/AddCircleOutline';
import * as d3Zoom from 'd3-zoom';
import * as d3Selection from 'd3-selection';
import useTheme$1 from '@material-ui/core/styles/useTheme';
import dagre from 'dagre';
import debounce from 'lodash/debounce';
import makeStyles$1 from '@material-ui/core/styles/makeStyles';
import * as d3Shape from 'd3-shape';
import isFinite from 'lodash/isFinite';
import useObservable from 'react-use/lib/useObservable';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import missingAnnotation from './components/EmptyState/assets/missingAnnotation.svg';
import noInformation from './components/EmptyState/assets/noInformation.svg';
import createComponent from './components/EmptyState/assets/createComponent.svg';
import noBuild from './components/EmptyState/assets/noBuild.svg';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ErrorOutline from '@material-ui/icons/ErrorOutline';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Divider from '@material-ui/core/Divider';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { createPortal } from 'react-dom';
import LinkIcon from '@material-ui/icons/Link';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import { isError, ResponseError, ForwardedError } from '@backstage/errors';
import TextTruncate from 'react-text-truncate';
import { useIsMounted, useDebouncedEffect, useLocalStorageValue, useAsync, useMountEffect } from '@react-hookz/web';
import LinearProgress from '@material-ui/core/LinearProgress';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Box from '@material-ui/core/Box';
import ArrowIcon from '@material-ui/icons/ArrowForward';
import { Circle, Line } from 'rc-progress';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import FormControl from '@material-ui/core/FormControl';
import InputBase from '@material-ui/core/InputBase';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import SvgIcon from '@material-ui/core/SvgIcon';
import MuiStepper from '@material-ui/core/Stepper';
import MuiStep from '@material-ui/core/Step';
import StepContent from '@material-ui/core/StepContent';
import StepLabel from '@material-ui/core/StepLabel';
import startCase from 'lodash/startCase';
import Table$1 from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Popover from '@material-ui/core/Popover';
import { isEqual, orderBy, isMatch, transform } from 'lodash';
import qs from 'qs';
import MuiBrokenImageIcon from '@material-ui/icons/BrokenImage';
import { Helmet } from 'react-helmet';
import { useLocation as useLocation$1, useNavigate, useParams, useRoutes, matchRoutes } from 'react-router';
import { createVersionedContext, createVersionedValueMap } from '@backstage/version-bridge';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import Drawer from '@material-ui/core/Drawer';
import MenuIcon from '@material-ui/icons/Menu';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import Badge from '@material-ui/core/Badge';
import TextField from '@material-ui/core/TextField';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import SearchIcon from '@material-ui/icons/Search';
import Collapse from '@material-ui/core/Collapse';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import Tab from '@material-ui/core/Tab';
import Tabs$1 from '@material-ui/core/Tabs';
import AddBox from '@material-ui/icons/AddBox';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import ViewColumn from '@material-ui/icons/ViewColumn';
import MTable, { MTableHeader, MTableToolbar, MTableBody } from '@material-table/core';
import AppBar from '@material-ui/core/AppBar';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import useWindowSize from 'react-use/lib/useWindowSize';
import { Sparklines, SparklinesLine } from 'react-sparklines';
import MicDropSvgUrl from './layout/ErrorPage/mic-drop.svg';
import MaterialBreadcrumbs from '@material-ui/core/Breadcrumbs';
import CardMedia from '@material-ui/core/CardMedia';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import FormHelperText from '@material-ui/core/FormHelperText';
import isEmpty from 'lodash/isEmpty';

function AlertDisplay(props) {
  const [messages, setMessages] = useState([]);
  const alertApi = useApi(alertApiRef);
  const { anchorOrigin = { vertical: "top", horizontal: "center" } } = props;
  useEffect(() => {
    const subscription = alertApi.alert$().subscribe((message) => setMessages((msgs) => msgs.concat(message)));
    return () => {
      subscription.unsubscribe();
    };
  }, [alertApi]);
  if (messages.length === 0) {
    return null;
  }
  const [firstMessage] = messages;
  const handleClose = () => {
    setMessages((msgs) => msgs.filter((msg) => msg !== firstMessage));
  };
  return /* @__PURE__ */ React.createElement(Snackbar, {
    open: true,
    anchorOrigin
  }, /* @__PURE__ */ React.createElement(Alert, {
    action: /* @__PURE__ */ React.createElement(IconButton, {
      color: "inherit",
      size: "small",
      onClick: handleClose,
      "data-testid": "error-button-close"
    }, /* @__PURE__ */ React.createElement(CloseIcon, null)),
    severity: firstMessage.severity
  }, /* @__PURE__ */ React.createElement("span", null, firstMessage.message.toString(), messages.length > 1 && /* @__PURE__ */ React.createElement("em", null, ` (${messages.length - 1} older ${pluralize("message", messages.length - 1)})`))));
}

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = hash >> i * 8 & 255;
    color += `00${value.toString(16)}`.substr(-2);
  }
  return color;
}
function extractInitials(value) {
  var _a;
  return (_a = value.match(/\b\w/g)) == null ? void 0 : _a.join("").substring(0, 2);
}

const useStyles$S = makeStyles((theme) => createStyles({
  avatar: {
    width: "4rem",
    height: "4rem",
    color: "#fff",
    fontWeight: theme.typography.fontWeightBold,
    letterSpacing: "1px",
    textTransform: "uppercase"
  }
}), { name: "BackstageAvatar" });
function Avatar(props) {
  const { displayName, picture, customStyles } = props;
  const classes = useStyles$S();
  let styles = { ...customStyles };
  if (!picture) {
    styles = {
      backgroundColor: stringToColor(displayName || ""),
      ...customStyles
    };
  }
  return /* @__PURE__ */ React.createElement(MaterialAvatar, {
    alt: displayName,
    src: picture,
    className: classes.avatar,
    style: styles
  }, displayName && extractInitials(displayName));
}

const useStyles$R = makeStyles({
  visuallyHidden: {
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    overflow: "hidden",
    position: "absolute",
    whiteSpace: "nowrap",
    height: 1,
    width: 1
  },
  externalLink: {
    position: "relative"
  }
}, { name: "Link" });
const isExternalUri = (uri) => /^([a-z+.-]+):/.test(uri);
const getNodeText = (node) => {
  var _a;
  if (node instanceof Array) {
    return node.map(getNodeText).join(" ").trim();
  }
  if (typeof node === "object" && node) {
    return getNodeText((_a = node == null ? void 0 : node.props) == null ? void 0 : _a.children);
  }
  if (["string", "number"].includes(typeof node)) {
    return String(node);
  }
  return "";
};
const Link = React.forwardRef(({ onClick, noTrack, ...props }, ref) => {
  const classes = useStyles$R();
  const analytics = useAnalytics();
  const to = String(props.to);
  const linkText = getNodeText(props.children) || to;
  const external = isExternalUri(to);
  const newWindow = external && !!/^https?:/.exec(to);
  const handleClick = (event) => {
    onClick == null ? void 0 : onClick(event);
    if (!noTrack) {
      analytics.captureEvent("click", linkText, { attributes: { to } });
    }
  };
  return external ? /* @__PURE__ */ React.createElement(Link$1, {
    ref,
    href: to,
    onClick: handleClick,
    ...newWindow ? { target: "_blank", rel: "noopener" } : {},
    ...props,
    className: classNames(classes.externalLink, props.className)
  }, props.children, /* @__PURE__ */ React.createElement("span", {
    className: classes.visuallyHidden
  }, ", Opens in a new window")) : /* @__PURE__ */ React.createElement(Link$1, {
    ref,
    component: Link$2,
    onClick: handleClick,
    ...props
  });
});

const LinkWrapper = React.forwardRef((props, ref) => /* @__PURE__ */ React.createElement(Link, {
  ref,
  ...props,
  color: "initial"
}));
const Button = React.forwardRef((props, ref) => /* @__PURE__ */ React.createElement(Button$1, {
  ref,
  component: LinkWrapper,
  ...props
}));

function CopyTextButton(props) {
  const {
    text,
    tooltipDelay = 1e3,
    tooltipText = "Text copied to clipboard"
  } = props;
  const errorApi = useApi(errorApiRef);
  const [open, setOpen] = useState(false);
  const [{ error }, copyToClipboard] = useCopyToClipboard();
  useEffect(() => {
    if (error) {
      errorApi.post(error);
    }
  }, [error, errorApi]);
  const handleCopyClick = (e) => {
    e.stopPropagation();
    setOpen(true);
    copyToClipboard(text);
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Tooltip, {
    id: "copy-test-tooltip",
    title: tooltipText,
    placement: "top",
    leaveDelay: tooltipDelay,
    onClose: () => setOpen(false),
    open
  }, /* @__PURE__ */ React.createElement(IconButton, {
    onClick: handleCopyClick
  }, /* @__PURE__ */ React.createElement(CopyIcon, null))));
}

function CodeSnippet(props) {
  const {
    text,
    language,
    showLineNumbers = false,
    highlightedNumbers,
    customStyle,
    showCopyCodeButton = false
  } = props;
  const theme = useTheme();
  const mode = theme.palette.type === "dark" ? dark : docco;
  const highlightColor = theme.palette.type === "dark" ? "#256bf3" : "#e6ffed";
  return /* @__PURE__ */ React.createElement("div", {
    style: { position: "relative" }
  }, /* @__PURE__ */ React.createElement(LightAsync, {
    customStyle,
    language,
    style: mode,
    showLineNumbers,
    wrapLines: true,
    lineNumberStyle: { color: theme.palette.textVerySubtle },
    lineProps: (lineNumber) => (highlightedNumbers == null ? void 0 : highlightedNumbers.includes(lineNumber)) ? {
      style: {
        backgroundColor: highlightColor
      }
    } : {}
  }, text), showCopyCodeButton && /* @__PURE__ */ React.createElement("div", {
    style: { position: "absolute", top: 0, right: 0 }
  }, /* @__PURE__ */ React.createElement(CopyTextButton, {
    text
  })));
}

function CreateButton(props) {
  const { title, to } = props;
  const isXSScreen = useMediaQuery((theme) => theme.breakpoints.down("xs"));
  if (!to) {
    return null;
  }
  return isXSScreen ? /* @__PURE__ */ React.createElement(IconButton, {
    component: Link$2,
    color: "primary",
    title,
    size: "small",
    to
  }, /* @__PURE__ */ React.createElement(AddCircleOutline, null)) : /* @__PURE__ */ React.createElement(Button$1, {
    component: Link$2,
    variant: "contained",
    color: "primary",
    to
  }, title);
}

var Direction = /* @__PURE__ */ ((Direction2) => {
  Direction2["TOP_BOTTOM"] = "TB";
  Direction2["BOTTOM_TOP"] = "BT";
  Direction2["LEFT_RIGHT"] = "LR";
  Direction2["RIGHT_LEFT"] = "RL";
  return Direction2;
})(Direction || {});
var Alignment = /* @__PURE__ */ ((Alignment2) => {
  Alignment2["UP_LEFT"] = "UL";
  Alignment2["UP_RIGHT"] = "UR";
  Alignment2["DOWN_LEFT"] = "DL";
  Alignment2["DOWN_RIGHT"] = "DR";
  return Alignment2;
})(Alignment || {});
var Ranker = /* @__PURE__ */ ((Ranker2) => {
  Ranker2["NETWORK_SIMPLEX"] = "network-simplex";
  Ranker2["TIGHT_TREE"] = "tight-tree";
  Ranker2["LONGEST_PATH"] = "longest-path";
  return Ranker2;
})(Ranker || {});
var LabelPosition = /* @__PURE__ */ ((LabelPosition2) => {
  LabelPosition2["LEFT"] = "l";
  LabelPosition2["RIGHT"] = "r";
  LabelPosition2["CENTER"] = "c";
  return LabelPosition2;
})(LabelPosition || {});

var types = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Direction: Direction,
  Alignment: Alignment,
  Ranker: Ranker,
  LabelPosition: LabelPosition
});

const useStyles$Q = makeStyles((theme) => ({
  node: {
    fill: theme.palette.primary.light,
    stroke: theme.palette.primary.light
  },
  text: {
    fill: theme.palette.primary.contrastText
  }
}), { name: "BackstageDependencyGraphDefaultNode" });
function DefaultNode({ node: { id } }) {
  const classes = useStyles$Q();
  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);
  const idRef = React.useRef(null);
  React.useLayoutEffect(() => {
    if (idRef.current) {
      let { height: renderedHeight, width: renderedWidth } = idRef.current.getBBox();
      renderedHeight = Math.round(renderedHeight);
      renderedWidth = Math.round(renderedWidth);
      if (renderedHeight !== height || renderedWidth !== width) {
        setWidth(renderedWidth);
        setHeight(renderedHeight);
      }
    }
  }, [width, height]);
  const padding = 10;
  const paddedWidth = width + padding * 2;
  const paddedHeight = height + padding * 2;
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", {
    className: classes.node,
    width: paddedWidth,
    height: paddedHeight,
    rx: 10
  }), /* @__PURE__ */ React.createElement("text", {
    ref: idRef,
    className: classes.text,
    y: paddedHeight / 2,
    x: paddedWidth / 2,
    textAnchor: "middle",
    alignmentBaseline: "middle"
  }, id));
}

const ARROW_MARKER_ID = "arrow-marker";
const NODE_TEST_ID = "node";
const EDGE_TEST_ID = "edge";
const LABEL_TEST_ID = "label";

const useStyles$P = makeStyles$1((theme) => ({
  node: {
    transition: `${theme.transitions.duration.shortest}ms`
  }
}), { name: "BackstageDependencyGraphNode" });
const renderDefault$1 = (props) => /* @__PURE__ */ React.createElement(DefaultNode, {
  ...props
});
function Node({
  render = renderDefault$1,
  setNode,
  node
}) {
  const { width, height, x = 0, y = 0 } = node;
  const nodeProps = node;
  const classes = useStyles$P();
  const nodeRef = React.useRef(null);
  React.useLayoutEffect(() => {
    if (nodeRef.current) {
      let { height: renderedHeight, width: renderedWidth } = nodeRef.current.getBBox();
      renderedHeight = Math.round(renderedHeight);
      renderedWidth = Math.round(renderedWidth);
      if (renderedHeight !== height || renderedWidth !== width) {
        setNode(node.id, {
          ...node,
          height: renderedHeight,
          width: renderedWidth
        });
      }
    }
  }, [node, width, height, setNode]);
  return /* @__PURE__ */ React.createElement("g", {
    ref: nodeRef,
    "data-testid": NODE_TEST_ID,
    className: classes.node,
    transform: `translate(${x - width / 2},${y - height / 2})`
  }, render({ node: nodeProps }));
}

const useStyles$O = makeStyles$1((theme) => ({
  text: {
    fill: theme.palette.textContrast
  }
}), { name: "BackstageDependencyGraphDefaultLabel" });
function DefaultLabel({ edge: { label } }) {
  const classes = useStyles$O();
  return /* @__PURE__ */ React.createElement("text", {
    className: classes.text,
    textAnchor: "middle"
  }, label);
}

const useStyles$N = makeStyles$1((theme) => ({
  path: {
    strokeWidth: 2,
    stroke: theme.palette.textSubtle,
    fill: "none",
    transition: `${theme.transitions.duration.shortest}ms`
  },
  label: {
    transition: `${theme.transitions.duration.shortest}ms`
  }
}), { name: "BackstageDependencyGraphEdge" });
const renderDefault = (props) => /* @__PURE__ */ React.createElement(DefaultLabel, {
  ...props
});
const createPath = d3Shape.line().x((d) => d.x).y((d) => d.y).curve(d3Shape.curveMonotoneX);
function Edge({
  render = renderDefault,
  setEdge,
  id,
  edge
}) {
  const { x = 0, y = 0, width, height, points } = edge;
  const labelProps = edge;
  const classes = useStyles$N();
  const labelRef = React.useRef(null);
  React.useLayoutEffect(() => {
    if (labelRef.current) {
      let { height: renderedHeight, width: renderedWidth } = labelRef.current.getBBox();
      renderedHeight = Math.round(renderedHeight);
      renderedWidth = Math.round(renderedWidth);
      if (renderedHeight !== height || renderedWidth !== width) {
        setEdge(id, {
          ...edge,
          height: renderedHeight,
          width: renderedWidth
        });
      }
    }
  }, [edge, height, width, setEdge, id]);
  let path = "";
  if (points) {
    const finitePoints = points.filter((point) => isFinite(point.x) && isFinite(point.y));
    path = createPath(finitePoints) || "";
  }
  return /* @__PURE__ */ React.createElement(React.Fragment, null, path && /* @__PURE__ */ React.createElement("path", {
    "data-testid": EDGE_TEST_ID,
    className: classes.path,
    markerEnd: `url(#${ARROW_MARKER_ID})`,
    d: path
  }), labelProps.label ? /* @__PURE__ */ React.createElement("g", {
    ref: labelRef,
    "data-testid": LABEL_TEST_ID,
    className: classes.label,
    transform: `translate(${x},${y})`
  }, render({ edge: labelProps })) : null);
}

const WORKSPACE_ID = "workspace";
function DependencyGraph(props) {
  var _a, _b;
  const {
    edges,
    nodes,
    renderNode,
    direction = Direction.TOP_BOTTOM,
    align,
    nodeMargin = 50,
    edgeMargin = 10,
    rankMargin = 50,
    paddingX = 0,
    paddingY = 0,
    acyclicer,
    ranker = Ranker.NETWORK_SIMPLEX,
    labelPosition = LabelPosition.RIGHT,
    labelOffset = 10,
    edgeRanks = 1,
    edgeWeight = 1,
    renderLabel,
    defs,
    zoom = "enabled",
    ...svgProps
  } = props;
  const theme = useTheme$1();
  const [containerWidth, setContainerWidth] = React.useState(100);
  const [containerHeight, setContainerHeight] = React.useState(100);
  const graph = React.useRef(new dagre.graphlib.Graph());
  const [graphWidth, setGraphWidth] = React.useState(((_a = graph.current.graph()) == null ? void 0 : _a.width) || 0);
  const [graphHeight, setGraphHeight] = React.useState(((_b = graph.current.graph()) == null ? void 0 : _b.height) || 0);
  const [graphNodes, setGraphNodes] = React.useState([]);
  const [graphEdges, setGraphEdges] = React.useState([]);
  const maxWidth = Math.max(graphWidth, containerWidth);
  const maxHeight = Math.max(graphHeight, containerHeight);
  const containerRef = React.useMemo(() => debounce((node) => {
    if (!node) {
      return;
    }
    const container = d3Selection.select(node);
    const workspace = d3Selection.select(node.getElementById(WORKSPACE_ID));
    function enableZoom() {
      container.call(d3Zoom.zoom().scaleExtent([1, 10]).on("zoom", (event) => {
        event.transform.x = Math.min(0, Math.max(event.transform.x, maxWidth - maxWidth * event.transform.k));
        event.transform.y = Math.min(0, Math.max(event.transform.y, maxHeight - maxHeight * event.transform.k));
        workspace.attr("transform", event.transform);
      }));
    }
    if (zoom === "enabled") {
      enableZoom();
    } else if (zoom === "enable-on-click") {
      container.on("click", () => enableZoom());
    }
    const { width: newContainerWidth, height: newContainerHeight } = node.getBoundingClientRect();
    if (containerWidth !== newContainerWidth) {
      setContainerWidth(newContainerWidth);
    }
    if (containerHeight !== newContainerHeight) {
      setContainerHeight(newContainerHeight);
    }
  }, 100), [containerHeight, containerWidth, maxWidth, maxHeight, zoom]);
  const setNodesAndEdges = React.useCallback(() => {
    const currentGraphNodes = graph.current.nodes();
    const currentGraphEdges = graph.current.edges();
    currentGraphNodes.forEach((nodeId) => {
      const remainingNode = nodes.some((node) => node.id === nodeId);
      if (!remainingNode) {
        graph.current.removeNode(nodeId);
      }
    });
    currentGraphEdges.forEach((e) => {
      const remainingEdge = edges.some((edge) => edge.from === e.v && edge.to === e.w);
      if (!remainingEdge) {
        graph.current.removeEdge(e.v, e.w);
      }
    });
    nodes.forEach((node) => {
      const existingNode = graph.current.nodes().find((nodeId) => node.id === nodeId);
      if (existingNode && graph.current.node(existingNode)) {
        const { width, height, x, y } = graph.current.node(existingNode);
        graph.current.setNode(existingNode, { ...node, width, height, x, y });
      } else {
        graph.current.setNode(node.id, { ...node, width: 0, height: 0 });
      }
    });
    edges.forEach((e) => {
      graph.current.setEdge(e.from, e.to, {
        ...e,
        label: e.label,
        width: 0,
        height: 0,
        labelpos: labelPosition,
        labeloffset: labelOffset,
        weight: edgeWeight,
        minlen: edgeRanks
      });
    });
  }, [edges, nodes, labelPosition, labelOffset, edgeWeight, edgeRanks]);
  const updateGraph = React.useMemo(() => debounce(() => {
    dagre.layout(graph.current);
    const { height, width } = graph.current.graph();
    const newHeight = Math.max(0, height || 0);
    const newWidth = Math.max(0, width || 0);
    setGraphWidth(newWidth);
    setGraphHeight(newHeight);
    setGraphNodes(graph.current.nodes());
    setGraphEdges(graph.current.edges());
  }, 250, { leading: true }), []);
  React.useEffect(() => {
    graph.current.setGraph({
      rankdir: direction,
      align,
      nodesep: nodeMargin,
      edgesep: edgeMargin,
      ranksep: rankMargin,
      marginx: paddingX,
      marginy: paddingY,
      acyclicer,
      ranker
    });
    setNodesAndEdges();
    updateGraph();
    return updateGraph.cancel;
  }, [
    acyclicer,
    align,
    direction,
    edgeMargin,
    paddingX,
    paddingY,
    nodeMargin,
    rankMargin,
    ranker,
    setNodesAndEdges,
    updateGraph
  ]);
  function setNode(id, node) {
    graph.current.setNode(id, node);
    updateGraph();
    return graph.current;
  }
  function setEdge(id, edge) {
    graph.current.setEdge(id, edge);
    updateGraph();
    return graph.current;
  }
  return /* @__PURE__ */ React.createElement("svg", {
    ref: containerRef,
    ...svgProps,
    width: "100%",
    height: maxHeight,
    viewBox: `0 0 ${maxWidth} ${maxHeight}`
  }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("marker", {
    id: ARROW_MARKER_ID,
    viewBox: "0 0 24 24",
    markerWidth: "14",
    markerHeight: "14",
    refX: "16",
    refY: "12",
    orient: "auto",
    markerUnits: "strokeWidth"
  }, /* @__PURE__ */ React.createElement("path", {
    fill: theme.palette.textSubtle,
    d: "M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"
  })), defs), /* @__PURE__ */ React.createElement("g", {
    id: WORKSPACE_ID
  }, /* @__PURE__ */ React.createElement("svg", {
    width: graphWidth,
    height: graphHeight,
    y: maxHeight / 2 - graphHeight / 2,
    x: maxWidth / 2 - graphWidth / 2,
    viewBox: `0 0 ${graphWidth} ${graphHeight}`
  }, graphEdges.map((e) => {
    const edge = graph.current.edge(e);
    if (!edge)
      return null;
    return /* @__PURE__ */ React.createElement(Edge, {
      key: `${e.v}-${e.w}`,
      id: e,
      setEdge,
      render: renderLabel,
      edge
    });
  }), graphNodes.map((id) => {
    const node = graph.current.node(id);
    if (!node)
      return null;
    return /* @__PURE__ */ React.createElement(Node, {
      key: id,
      setNode,
      render: renderNode,
      node
    });
  }))));
}

const useStyles$M = makeStyles((theme) => {
  var _a;
  return {
    root: {
      padding: theme.spacing(0),
      marginBottom: theme.spacing(0),
      marginTop: theme.spacing(0),
      display: "flex",
      flexFlow: "row nowrap"
    },
    topPosition: {
      position: "relative",
      marginBottom: theme.spacing(6),
      marginTop: -theme.spacing(3),
      zIndex: "unset"
    },
    icon: {
      fontSize: 20
    },
    content: {
      width: "100%",
      maxWidth: "inherit",
      flexWrap: "nowrap"
    },
    message: {
      display: "flex",
      alignItems: "center",
      color: theme.palette.banner.text,
      "& a": {
        color: theme.palette.banner.link
      }
    },
    info: {
      backgroundColor: theme.palette.banner.info
    },
    error: {
      backgroundColor: theme.palette.banner.error
    },
    warning: {
      backgroundColor: (_a = theme.palette.banner.warning) != null ? _a : theme.palette.banner.error
    }
  };
}, { name: "BackstageDismissableBanner" });
const DismissableBanner = (props) => {
  var _a;
  const { variant, message, id, fixed = false } = props;
  const classes = useStyles$M();
  const storageApi = useApi(storageApiRef);
  const notificationsStore = storageApi.forBucket("notifications");
  const rawDismissedBanners = (_a = notificationsStore.snapshot("dismissedBanners").value) != null ? _a : [];
  const [dismissedBanners, setDismissedBanners] = useState(new Set(rawDismissedBanners));
  const observedItems = useObservable(notificationsStore.observe$("dismissedBanners"));
  useEffect(() => {
    var _a2;
    if (observedItems == null ? void 0 : observedItems.value) {
      const currentValue = (_a2 = observedItems == null ? void 0 : observedItems.value) != null ? _a2 : [];
      setDismissedBanners(new Set(currentValue));
    }
  }, [observedItems == null ? void 0 : observedItems.value]);
  const handleClick = () => {
    notificationsStore.set("dismissedBanners", [...dismissedBanners, id]);
  };
  return /* @__PURE__ */ React.createElement(Snackbar, {
    anchorOrigin: fixed ? { vertical: "bottom", horizontal: "center" } : { vertical: "top", horizontal: "center" },
    open: !dismissedBanners.has(id),
    classes: {
      root: classNames(classes.root, !fixed && classes.topPosition)
    }
  }, /* @__PURE__ */ React.createElement(SnackbarContent, {
    classes: {
      root: classNames(classes.content, classes[variant]),
      message: classes.message
    },
    message,
    action: [
      /* @__PURE__ */ React.createElement(IconButton, {
        key: "dismiss",
        title: "Permanently dismiss this message",
        color: "inherit",
        onClick: handleClick
      }, /* @__PURE__ */ React.createElement(CloseIcon, {
        className: classes.icon
      }))
    ]
  }));
};

const useStyles$L = makeStyles({
  generalImg: {
    width: "95%",
    zIndex: 2,
    position: "relative",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, 15%)"
  }
}, { name: "BackstageEmptyStateImage" });
const EmptyStateImage = ({ missing }) => {
  const classes = useStyles$L();
  switch (missing) {
    case "field":
      return /* @__PURE__ */ React.createElement("img", {
        src: missingAnnotation,
        className: classes.generalImg,
        alt: "annotation is missing"
      });
    case "info":
      return /* @__PURE__ */ React.createElement("img", {
        src: noInformation,
        alt: "no Information",
        className: classes.generalImg
      });
    case "content":
      return /* @__PURE__ */ React.createElement("img", {
        src: createComponent,
        alt: "create Component",
        className: classes.generalImg
      });
    case "data":
      return /* @__PURE__ */ React.createElement("img", {
        src: noBuild,
        alt: "no Build",
        className: classes.generalImg
      });
    default:
      return null;
  }
};

const useStyles$K = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2, 0, 0, 0)
  },
  action: {
    marginTop: theme.spacing(2)
  },
  imageContainer: {
    position: "relative"
  }
}), { name: "BackstageEmptyState" });
function EmptyState(props) {
  const { title, description, missing, action } = props;
  const classes = useStyles$K();
  return /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    direction: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
    className: classes.root,
    spacing: 2
  }, /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    xs: 12,
    md: 6
  }, /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    direction: "column"
  }, /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    xs: true
  }, /* @__PURE__ */ React.createElement(Typography, {
    variant: "h5"
  }, title)), /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    xs: true
  }, /* @__PURE__ */ React.createElement(Typography, {
    variant: "body1"
  }, description)), /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    xs: true,
    className: classes.action
  }, action))), /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    xs: 12,
    md: 6,
    className: classes.imageContainer
  }, /* @__PURE__ */ React.createElement(EmptyStateImage, {
    missing
  })));
}

const COMPONENT_YAML = `apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: example
  description: example.com
  annotations:
    ANNOTATION: value
spec:
  type: website
  lifecycle: production
  owner: user:guest`;
const useStyles$J = makeStyles((theme) => ({
  code: {
    borderRadius: 6,
    margin: `${theme.spacing(2)}px 0px`,
    background: theme.palette.type === "dark" ? "#444" : "#fff"
  }
}), { name: "BackstageMissingAnnotationEmptyState" });
function MissingAnnotationEmptyState(props) {
  const { annotation, readMoreUrl } = props;
  const url = readMoreUrl || "https://backstage.io/docs/features/software-catalog/well-known-annotations";
  const classes = useStyles$J();
  const description = /* @__PURE__ */ React.createElement(React.Fragment, null, "The ", /* @__PURE__ */ React.createElement("code", null, annotation), " annotation is missing. You need to add the annotation to your component if you want to enable this tool.");
  return /* @__PURE__ */ React.createElement(EmptyState, {
    missing: "field",
    title: "Missing Annotation",
    description,
    action: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Typography, {
      variant: "body1"
    }, "Add the annotation to your component YAML as shown in the highlighted example below:"), /* @__PURE__ */ React.createElement("div", {
      className: classes.code
    }, /* @__PURE__ */ React.createElement(CodeSnippet, {
      text: COMPONENT_YAML.replace("ANNOTATION", annotation),
      language: "yaml",
      showLineNumbers: true,
      highlightedNumbers: [6, 7],
      customStyle: { background: "inherit", fontSize: "115%" }
    })), /* @__PURE__ */ React.createElement(Button$1, {
      color: "primary",
      component: Link,
      to: url
    }, "Read more"))
  });
}

const getWarningTextColor = (severity, theme) => {
  const getColor = theme.palette.type === "light" ? darken : lighten;
  return getColor(theme.palette[severity].light, 0.6);
};
const getWarningBackgroundColor = (severity, theme) => {
  const getBackgroundColor = theme.palette.type === "light" ? lighten : darken;
  return getBackgroundColor(theme.palette[severity].light, 0.9);
};
const useErrorOutlineStyles = makeStyles((theme) => ({
  root: {
    marginRight: theme.spacing(1),
    fill: ({ severity }) => getWarningTextColor(severity, theme)
  }
}));
const ErrorOutlineStyled = ({ severity }) => {
  const classes = useErrorOutlineStyles({ severity });
  return /* @__PURE__ */ React.createElement(ErrorOutline, {
    classes
  });
};
const ExpandMoreIconStyled = ({ severity }) => {
  const classes = useErrorOutlineStyles({ severity });
  return /* @__PURE__ */ React.createElement(ExpandMoreIcon, {
    classes
  });
};
const useStyles$I = makeStyles((theme) => ({
  panel: {
    backgroundColor: ({ severity }) => getWarningBackgroundColor(severity, theme),
    color: ({ severity }) => getWarningTextColor(severity, theme),
    verticalAlign: "middle"
  },
  summary: {
    display: "flex",
    flexDirection: "row"
  },
  summaryText: {
    color: ({ severity }) => getWarningTextColor(severity, theme),
    fontWeight: "bold"
  },
  message: {
    width: "100%",
    display: "block",
    color: ({ severity }) => getWarningTextColor(severity, theme),
    backgroundColor: ({ severity }) => getWarningBackgroundColor(severity, theme)
  },
  details: {
    width: "100%",
    display: "block",
    color: theme.palette.textContrast,
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.border}`,
    padding: theme.spacing(2),
    fontFamily: "sans-serif"
  }
}), { name: "BackstageWarningPanel" });
const capitalize = (s) => {
  return s.charAt(0).toLocaleUpperCase("en-US") + s.slice(1);
};
function WarningPanel(props) {
  const {
    severity = "warning",
    title,
    message,
    children,
    defaultExpanded
  } = props;
  const classes = useStyles$I({ severity });
  const subTitle = capitalize(severity) + (title ? `: ${title}` : "");
  return /* @__PURE__ */ React.createElement(Accordion, {
    defaultExpanded: defaultExpanded != null ? defaultExpanded : false,
    className: classes.panel,
    role: "alert"
  }, /* @__PURE__ */ React.createElement(AccordionSummary, {
    expandIcon: /* @__PURE__ */ React.createElement(ExpandMoreIconStyled, {
      severity
    }),
    className: classes.summary
  }, /* @__PURE__ */ React.createElement(ErrorOutlineStyled, {
    severity
  }), /* @__PURE__ */ React.createElement(Typography, {
    className: classes.summaryText,
    variant: "subtitle1"
  }, subTitle)), (message || children) && /* @__PURE__ */ React.createElement(AccordionDetails, null, /* @__PURE__ */ React.createElement(Grid, {
    container: true
  }, message && /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    xs: 12
  }, /* @__PURE__ */ React.createElement(Typography, {
    className: classes.message,
    variant: "body1"
  }, message)), children && /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    xs: 12,
    className: classes.details
  }, children))));
}

const useStyles$H = makeStyles((theme) => ({
  text: {
    fontFamily: "monospace",
    whiteSpace: "pre",
    overflowX: "auto",
    marginRight: theme.spacing(2)
  },
  divider: {
    margin: theme.spacing(2)
  }
}), { name: "BackstageErrorPanel" });
const ErrorList = ({
  error,
  message,
  stack,
  children
}) => {
  const classes = useStyles$H();
  return /* @__PURE__ */ React.createElement(List, {
    dense: true
  }, /* @__PURE__ */ React.createElement(ListItem, {
    alignItems: "flex-start"
  }, /* @__PURE__ */ React.createElement(ListItemText, {
    classes: { secondary: classes.text },
    primary: "Error",
    secondary: error
  }), /* @__PURE__ */ React.createElement(CopyTextButton, {
    text: error
  })), /* @__PURE__ */ React.createElement(ListItem, {
    alignItems: "flex-start"
  }, /* @__PURE__ */ React.createElement(ListItemText, {
    classes: { secondary: classes.text },
    primary: "Message",
    secondary: message
  }), /* @__PURE__ */ React.createElement(CopyTextButton, {
    text: message
  })), stack && /* @__PURE__ */ React.createElement(ListItem, {
    alignItems: "flex-start"
  }, /* @__PURE__ */ React.createElement(ListItemText, {
    classes: { secondary: classes.text },
    primary: "Stack Trace",
    secondary: stack
  }), /* @__PURE__ */ React.createElement(CopyTextButton, {
    text: stack
  })), children);
};
function ErrorPanel(props) {
  const { title, error, defaultExpanded, children } = props;
  return /* @__PURE__ */ React.createElement(WarningPanel, {
    severity: "error",
    title: title != null ? title : error.message,
    defaultExpanded
  }, /* @__PURE__ */ React.createElement(ErrorList, {
    error: error.name,
    message: error.message,
    stack: error.stack,
    children
  }));
}

const useStyles$G = makeStyles((theme) => ({
  text: {
    fontFamily: "monospace",
    whiteSpace: "pre",
    overflowX: "auto",
    marginRight: theme.spacing(2)
  },
  divider: {
    margin: theme.spacing(2)
  }
}), { name: "BackstageResponseErrorPanel" });
function ResponseErrorPanel(props) {
  var _a;
  const { title, error, defaultExpanded } = props;
  const classes = useStyles$G();
  if (error.name !== "ResponseError") {
    return /* @__PURE__ */ React.createElement(ErrorPanel, {
      title: title != null ? title : error.message,
      defaultExpanded,
      error
    });
  }
  const { body, cause } = error;
  const { request, response } = body;
  const errorString = `${response.statusCode}: ${cause.name}`;
  const requestString = request && `${request.method} ${request.url}`;
  const messageString = cause.message.replace(/\\n/g, "\n");
  const stackString = (_a = cause.stack) == null ? void 0 : _a.replace(/\\n/g, "\n");
  const jsonString = JSON.stringify(body, void 0, 2);
  return /* @__PURE__ */ React.createElement(ErrorPanel, {
    title: title != null ? title : error.message,
    defaultExpanded,
    error: { name: errorString, message: messageString, stack: stackString }
  }, requestString && /* @__PURE__ */ React.createElement(ListItem, {
    alignItems: "flex-start"
  }, /* @__PURE__ */ React.createElement(ListItemText, {
    classes: { secondary: classes.text },
    primary: "Request",
    secondary: request ? `${requestString}` : void 0
  }), /* @__PURE__ */ React.createElement(CopyTextButton, {
    text: requestString
  })), /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Divider, {
    component: "li",
    className: classes.divider
  }), /* @__PURE__ */ React.createElement(ListItem, {
    alignItems: "flex-start"
  }, /* @__PURE__ */ React.createElement(ListItemText, {
    classes: { secondary: classes.text },
    primary: "Full Error as JSON"
  })), /* @__PURE__ */ React.createElement(CodeSnippet, {
    language: "json",
    text: jsonString,
    showCopyCodeButton: true
  })));
}

function createRootElement(id) {
  const rootContainer = document.createElement("div");
  rootContainer.setAttribute("id", id);
  return rootContainer;
}
function addRootElement(rootElem) {
  document.body.insertBefore(rootElem, document.body.lastElementChild.nextElementSibling);
}
function usePortal(id) {
  const rootElemRef = useRef(null);
  useEffect(function setupElement() {
    const existingParent = document.querySelector(`#${id}`);
    const parentElem = existingParent || createRootElement(id);
    if (!existingParent) {
      addRootElement(parentElem);
    }
    parentElem.appendChild(rootElemRef.current);
    return function removeElement() {
      rootElemRef.current.remove();
      if (parentElem.childNodes.length === -1) {
        parentElem.remove();
      }
    };
  }, [id]);
  function getRootElem() {
    if (!rootElemRef.current) {
      rootElemRef.current = document.createElement("div");
    }
    return rootElemRef.current;
  }
  return getRootElem();
}

const STATES_LOCAL_STORAGE_KEY = "core.calloutSeen";
function useCalloutStates() {
  const [states, setStates] = useState(() => {
    const raw = localStorage.getItem(STATES_LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  });
  const setState = useCallback((key, value) => {
    const raw = localStorage.getItem(STATES_LOCAL_STORAGE_KEY);
    const oldStates = raw ? JSON.parse(raw) : {};
    const newStates = { ...oldStates, [key]: value };
    setStates(newStates);
    localStorage.setItem(STATES_LOCAL_STORAGE_KEY, JSON.stringify(newStates));
  }, []);
  return { states, setState };
}
function useCalloutHasBeenSeen(featureId) {
  const { states, setState } = useCalloutStates();
  const markSeen = useCallback(() => {
    setState(featureId, true);
  }, [setState, featureId]);
  return { seen: states[featureId] === true, markSeen };
}
function useShowCallout(featureId) {
  const { seen, markSeen } = useCalloutHasBeenSeen(featureId);
  return { show: seen === false, hide: markSeen };
}

const useStyles$F = makeStyles({
  "@keyframes pulsateSlightly": {
    "0%": { transform: "scale(1.0)" },
    "100%": { transform: "scale(1.1)" }
  },
  "@keyframes pulsateAndFade": {
    "0%": { transform: "scale(1.0)", opacity: 0.9 },
    "100%": { transform: "scale(1.5)", opacity: 0 }
  },
  featureWrapper: {
    position: "relative"
  },
  backdrop: {
    zIndex: 2e3,
    position: "fixed",
    overflow: "hidden",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  },
  dot: {
    position: "absolute",
    backgroundColor: "transparent",
    borderRadius: "100%",
    border: "1px solid rgba(103, 146, 180, 0.98)",
    boxShadow: "0px 0px 0px 20000px rgba(0, 0, 0, 0.5)",
    zIndex: 2001,
    transformOrigin: "center center",
    animation: "$pulsateSlightly 1744ms 1.2s cubic-bezier(0.4, 0, 0.2, 1) alternate infinite"
  },
  pulseCircle: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
    borderRadius: "100%",
    border: "2px solid white",
    zIndex: 2001,
    transformOrigin: "center center",
    animation: "$pulsateAndFade 872ms 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite"
  },
  text: {
    position: "absolute",
    color: "white",
    zIndex: 2003
  }
}, { name: "BackstageFeatureCalloutCircular" });
function FeatureCalloutCircular(props) {
  const { featureId, title, description, children } = props;
  const { show, hide } = useShowCallout(featureId);
  const portalElement = usePortal("core.callout");
  const wrapperRef = useRef(null);
  const [placement, setPlacement] = useState();
  const classes = useStyles$F();
  const update = useCallback(() => {
    if (wrapperRef.current) {
      const wrapperBounds = wrapperRef.current.getBoundingClientRect();
      const longest = Math.max(wrapperBounds.width, wrapperBounds.height);
      const borderWidth = 800;
      const dotLeft = wrapperBounds.x - (longest - wrapperBounds.width) / 2 - borderWidth;
      const dotTop = wrapperBounds.y - (longest - wrapperBounds.height) / 2 - borderWidth;
      const dotSize = longest + 2 * borderWidth;
      const textWidth = 450;
      const textLeft = wrapperBounds.x + wrapperBounds.width / 2 - textWidth;
      const textTop = wrapperBounds.y - (longest - wrapperBounds.height) / 2 + longest + 20;
      setPlacement({
        dotLeft,
        dotTop,
        dotSize,
        borderWidth,
        textTop,
        textLeft,
        textWidth
      });
    }
  }, []);
  useEffect(() => {
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [update]);
  useLayoutEffect(update, [wrapperRef.current, update]);
  if (!show) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, children);
  }
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", {
    className: classes.featureWrapper,
    ref: wrapperRef
  }, children), createPortal(/* @__PURE__ */ React.createElement("div", {
    className: classes.backdrop
  }, /* @__PURE__ */ React.createElement(ClickAwayListener, {
    onClickAway: hide
  }, /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", {
    className: classes.dot,
    "data-testid": "dot",
    style: {
      left: placement == null ? void 0 : placement.dotLeft,
      top: placement == null ? void 0 : placement.dotTop,
      width: placement == null ? void 0 : placement.dotSize,
      height: placement == null ? void 0 : placement.dotSize,
      borderWidth: placement == null ? void 0 : placement.borderWidth
    },
    onClick: hide,
    onKeyDown: hide,
    role: "button",
    tabIndex: 0
  }, /* @__PURE__ */ React.createElement("div", {
    className: classes.pulseCircle
  })), /* @__PURE__ */ React.createElement("div", {
    className: classes.text,
    "data-testid": "text",
    style: {
      left: placement == null ? void 0 : placement.textLeft,
      top: placement == null ? void 0 : placement.textTop,
      width: placement == null ? void 0 : placement.textWidth
    }
  }, /* @__PURE__ */ React.createElement(Typography, {
    variant: "h2",
    paragraph: true
  }, title), /* @__PURE__ */ React.createElement(Typography, null, description))))), portalElement));
}

const useIconStyles = makeStyles((theme) => ({
  link: {
    display: "grid",
    justifyItems: "center",
    gridGap: 4,
    textAlign: "center"
  },
  disabled: {
    color: "gray",
    cursor: "default"
  },
  primary: {
    color: theme.palette.primary.main
  },
  secondary: {
    color: theme.palette.secondary.main
  },
  label: {
    fontSize: "0.7rem",
    textTransform: "uppercase",
    fontWeight: 600,
    letterSpacing: 1.2
  }
}), { name: "BackstageIconLinkVertical" });
function IconLinkVertical({
  color = "primary",
  disabled = false,
  href = "#",
  icon = /* @__PURE__ */ React.createElement(LinkIcon, null),
  label,
  onClick,
  title
}) {
  const classes = useIconStyles();
  if (disabled) {
    return /* @__PURE__ */ React.createElement(Link$1, {
      title,
      className: classNames(classes.link, classes.disabled),
      underline: "none"
    }, icon, /* @__PURE__ */ React.createElement("span", {
      className: classes.label
    }, label));
  }
  return /* @__PURE__ */ React.createElement(Link$1, {
    title,
    className: classNames(classes.link, classes[color]),
    to: href,
    component: Link,
    onClick
  }, icon, /* @__PURE__ */ React.createElement("span", {
    className: classes.label
  }, label));
}

const useStyles$E = makeStyles((theme) => ({
  links: {
    margin: theme.spacing(2, 0),
    display: "grid",
    gridAutoFlow: "column",
    gridAutoColumns: "min-content",
    gridGap: theme.spacing(3)
  }
}), { name: "BackstageHeaderIconLinkRow" });
function HeaderIconLinkRow(props) {
  const { links } = props;
  const classes = useStyles$E();
  return /* @__PURE__ */ React.createElement("nav", {
    className: classes.links
  }, links.map((link, index) => /* @__PURE__ */ React.createElement(IconLinkVertical, {
    key: index + 1,
    ...link
  })));
}

const generateGradientStops = (themeType) => {
  const luminance = themeType === "dark" ? "16%" : "97%";
  return `
    hsl(0, 0%, ${luminance}) 0%,
    hsla(0, 0%, ${luminance}, 0.987) 8.1%,
    hsla(0, 0%, ${luminance}, 0.951) 15.5%,
    hsla(0, 0%, ${luminance}, 0.896) 22.5%,
    hsla(0, 0%, ${luminance}, 0.825) 29%,
    hsla(0, 0%, ${luminance}, 0.741) 35.3%,
    hsla(0, 0%, ${luminance}, 0.648) 41.2%,
    hsla(0, 0%, ${luminance}, 0.55) 47.1%,
    hsla(0, 0%, ${luminance}, 0.45) 52.9%,
    hsla(0, 0%, ${luminance}, 0.352) 58.8%,
    hsla(0, 0%, ${luminance}, 0.259) 64.7%,
    hsla(0, 0%, ${luminance}, 0.175) 71%,
    hsla(0, 0%, ${luminance}, 0.104) 77.5%,
    hsla(0, 0%, ${luminance}, 0.049) 84.5%,
    hsla(0, 0%, ${luminance}, 0.013) 91.9%,
    hsla(0, 0%, ${luminance}, 0) 100%
  `;
};
const fadeSize = 100;
const fadePadding = 10;
const useStyles$D = makeStyles((theme) => ({
  root: {
    position: "relative",
    display: "flex",
    flexFlow: "row nowrap",
    alignItems: "center"
  },
  container: {
    overflow: "auto",
    scrollbarWidth: 0,
    "&::-webkit-scrollbar": {
      display: "none"
    }
  },
  fade: {
    position: "absolute",
    width: fadeSize,
    height: `calc(100% + ${fadePadding}px)`,
    transition: "opacity 300ms",
    pointerEvents: "none"
  },
  fadeLeft: {
    left: -fadePadding,
    background: `linear-gradient(90deg, ${generateGradientStops(theme.palette.type)})`
  },
  fadeRight: {
    right: -fadePadding,
    background: `linear-gradient(270deg, ${generateGradientStops(theme.palette.type)})`
  },
  fadeHidden: {
    opacity: 0
  },
  button: {
    position: "absolute"
  },
  buttonLeft: {
    left: -theme.spacing(2)
  },
  buttonRight: {
    right: -theme.spacing(2)
  }
}), { name: "BackstageHorizontalScrollGrid" });
function useScrollDistance(ref) {
  const [[scrollLeft, scrollRight], setScroll] = React.useState([0, 0]);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      setScroll([0, 0]);
      return;
    }
    const handleUpdate = () => {
      const left = el.scrollLeft;
      const right = el.scrollWidth - el.offsetWidth - el.scrollLeft;
      setScroll([left, right]);
    };
    handleUpdate();
    el.addEventListener("scroll", handleUpdate);
    window.addEventListener("resize", handleUpdate);
    return () => {
      el.removeEventListener("scroll", handleUpdate);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [ref]);
  return [scrollLeft, scrollRight];
}
function useSmoothScroll(ref, speed, minDistance) {
  const [scrollTarget, setScrollTarget] = React.useState(0);
  React.useLayoutEffect(() => {
    if (scrollTarget === 0) {
      return;
    }
    const startTime = performance.now();
    const id = requestAnimationFrame((frameTime) => {
      if (!ref.current) {
        return;
      }
      const frameDuration = frameTime - startTime;
      const scrollDistance = Math.abs(scrollTarget) * frameDuration / speed;
      const cappedScrollDistance = Math.max(minDistance, scrollDistance);
      const scrollAmount = cappedScrollDistance * Math.sign(scrollTarget);
      ref.current.scrollBy({ left: scrollAmount });
      const newScrollTarget = scrollTarget - scrollAmount;
      if (Math.sign(scrollTarget) !== Math.sign(newScrollTarget)) {
        setScrollTarget(0);
      } else {
        setScrollTarget(newScrollTarget);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [ref, scrollTarget, speed, minDistance]);
  return setScrollTarget;
}
function HorizontalScrollGrid(props) {
  const {
    scrollStep = 100,
    scrollSpeed = 50,
    minScrollDistance = 5,
    children,
    ...otherProps
  } = props;
  const classes = useStyles$D(props);
  const ref = React.useRef();
  const [scrollLeft, scrollRight] = useScrollDistance(ref);
  const setScrollTarget = useSmoothScroll(ref, scrollSpeed, minScrollDistance);
  const handleScrollClick = (forwards) => {
    const el = ref.current;
    if (!el) {
      return;
    }
    setScrollTarget(forwards ? scrollStep : -scrollStep);
  };
  return /* @__PURE__ */ React.createElement("div", {
    ...otherProps,
    className: classes.root
  }, /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    direction: "row",
    wrap: "nowrap",
    className: classes.container,
    ref
  }, children), /* @__PURE__ */ React.createElement("div", {
    className: classNames(classes.fade, classes.fadeLeft, {
      [classes.fadeHidden]: scrollLeft === 0
    })
  }), /* @__PURE__ */ React.createElement("div", {
    className: classNames(classes.fade, classes.fadeRight, {
      [classes.fadeHidden]: scrollRight === 0
    })
  }), scrollLeft > 0 && /* @__PURE__ */ React.createElement(IconButton, {
    title: "Scroll Left",
    onClick: () => handleScrollClick(false),
    className: classNames(classes.button, classes.buttonLeft, {})
  }, /* @__PURE__ */ React.createElement(ChevronLeftIcon, null)), scrollRight > 0 && /* @__PURE__ */ React.createElement(IconButton, {
    title: "Scroll Right",
    onClick: () => handleScrollClick(true),
    className: classNames(classes.button, classes.buttonRight, {})
  }, /* @__PURE__ */ React.createElement(ChevronRight, null)));
}

const useStyles$C = makeStyles({
  alpha: {
    color: "#ffffff",
    fontFamily: "serif",
    fontWeight: "normal",
    fontStyle: "italic"
  },
  beta: {
    color: "#4d65cc",
    fontFamily: "serif",
    fontWeight: "normal",
    fontStyle: "italic"
  }
}, { name: "BackstageLifecycle" });
function Lifecycle(props) {
  const classes = useStyles$C(props);
  const { shorthand, alpha } = props;
  return shorthand ? /* @__PURE__ */ React.createElement("span", {
    className: classes[alpha ? "alpha" : "beta"],
    style: { fontSize: "120%" }
  }, alpha ? /* @__PURE__ */ React.createElement(React.Fragment, null, "\u03B1") : /* @__PURE__ */ React.createElement(React.Fragment, null, "\u03B2")) : /* @__PURE__ */ React.createElement("span", {
    className: classes[alpha ? "alpha" : "beta"]
  }, alpha ? "Alpha" : "Beta");
}

const RealLogViewer = lazy(() => import('./esm/RealLogViewer-5b0c3451.esm.js').then((m) => ({ default: m.RealLogViewer })));
function LogViewer(props) {
  const { Progress } = useApp().getComponents();
  return /* @__PURE__ */ React.createElement(Suspense, {
    fallback: /* @__PURE__ */ React.createElement(Progress, null)
  }, /* @__PURE__ */ React.createElement(RealLogViewer, {
    ...props
  }));
}

const useStyles$B = makeStyles((theme) => ({
  markdown: {
    "& table": {
      borderCollapse: "collapse",
      border: `1px solid ${theme.palette.border}`
    },
    "& th, & td": {
      border: `1px solid ${theme.palette.border}`,
      padding: theme.spacing(1)
    },
    "& td": {
      wordBreak: "break-word",
      overflow: "hidden",
      verticalAlign: "middle",
      lineHeight: "1",
      margin: 0,
      padding: theme.spacing(3, 2, 3, 2.5),
      borderBottom: 0
    },
    "& th": {
      backgroundColor: theme.palette.background.paper
    },
    "& tr": {
      backgroundColor: theme.palette.background.paper
    },
    "& tr:nth-child(odd)": {
      backgroundColor: theme.palette.background.default
    },
    "& a": {
      color: theme.palette.link
    },
    "& img": {
      maxWidth: "100%"
    }
  }
}), { name: "BackstageMarkdownContent" });
const components = {
  code: ({ inline, className, children, ...props }) => {
    const text = String(children).replace(/\n+$/, "");
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? /* @__PURE__ */ React.createElement(CodeSnippet, {
      language: match[1],
      text
    }) : /* @__PURE__ */ React.createElement("code", {
      className,
      ...props
    }, children);
  }
};
function MarkdownContent(props) {
  const { content, dialect = "gfm", linkTarget } = props;
  const classes = useStyles$B();
  return /* @__PURE__ */ React.createElement(ReactMarkdown, {
    remarkPlugins: dialect === "gfm" ? [gfm] : [],
    className: classes.markdown,
    children: content,
    components,
    linkTarget
  });
}

const useItemStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(3)
  }
}), { name: "BackstageLoginRequestListItem" });
const LoginRequestListItem = ({ request, busy, setBusy }) => {
  const classes = useItemStyles();
  const [error, setError] = useState();
  const handleContinue = async () => {
    setBusy(true);
    try {
      await request.trigger();
    } catch (e) {
      setError(isError(e) ? e.message : "An unspecified error occurred");
    } finally {
      setBusy(false);
    }
  };
  const IconComponent = request.provider.icon;
  return /* @__PURE__ */ React.createElement(ListItem, {
    disabled: busy,
    classes: { root: classes.root }
  }, /* @__PURE__ */ React.createElement(ListItemAvatar, null, /* @__PURE__ */ React.createElement(IconComponent, {
    fontSize: "large"
  })), /* @__PURE__ */ React.createElement(ListItemText, {
    primary: request.provider.title,
    secondary: error && /* @__PURE__ */ React.createElement(Typography, {
      color: "error"
    }, error)
  }), /* @__PURE__ */ React.createElement(Button$1, {
    color: "primary",
    variant: "contained",
    onClick: handleContinue
  }, "Log in"));
};

const useStyles$A = makeStyles((theme) => ({
  dialog: {
    paddingTop: theme.spacing(1)
  },
  title: {
    minWidth: 0
  },
  titleHeading: {
    fontSize: theme.typography.h6.fontSize
  },
  contentList: {
    padding: 0
  },
  actionButtons: {
    padding: theme.spacing(2, 0)
  }
}), { name: "OAuthRequestDialog" });
function OAuthRequestDialog(_props) {
  const classes = useStyles$A();
  const [busy, setBusy] = useState(false);
  const oauthRequestApi = useApi(oauthRequestApiRef);
  const requests = useObservable(useMemo(() => oauthRequestApi.authRequest$(), [oauthRequestApi]), []);
  const handleRejectAll = () => {
    requests.forEach((request) => request.reject());
  };
  return /* @__PURE__ */ React.createElement(Dialog, {
    open: Boolean(requests.length),
    fullWidth: true,
    maxWidth: "xs",
    classes: { paper: classes.dialog },
    "aria-labelledby": "oauth-req-dialog-title"
  }, /* @__PURE__ */ React.createElement("main", null, /* @__PURE__ */ React.createElement(DialogTitle, {
    classes: { root: classes.title },
    id: "oauth-req-dialog-title"
  }, /* @__PURE__ */ React.createElement(Typography, {
    className: classes.titleHeading,
    variant: "h1"
  }, "Login Required")), /* @__PURE__ */ React.createElement(DialogContent, {
    dividers: true,
    classes: { root: classes.contentList }
  }, /* @__PURE__ */ React.createElement(List, null, requests.map((request) => /* @__PURE__ */ React.createElement(LoginRequestListItem, {
    key: request.provider.title,
    request,
    busy,
    setBusy
  }))))), /* @__PURE__ */ React.createElement(DialogActions, {
    classes: { root: classes.actionButtons }
  }, /* @__PURE__ */ React.createElement(Button$1, {
    onClick: handleRejectAll
  }, "Reject All")));
}

const useStyles$z = makeStyles({
  container: {
    overflow: "visible !important"
  }
}, { name: "BackstageOverflowTooltip" });
function OverflowTooltip(props) {
  var _a;
  const [hover, setHover] = useState(false);
  const isMounted = useIsMounted();
  const classes = useStyles$z();
  const handleToggled = (truncated) => {
    if (isMounted()) {
      setHover(truncated);
    }
  };
  return /* @__PURE__ */ React.createElement(Tooltip, {
    title: (_a = props.title) != null ? _a : props.text || "",
    placement: props.placement,
    disableHoverListener: !hover
  }, /* @__PURE__ */ React.createElement(TextTruncate, {
    text: props.text,
    line: props.line,
    onToggled: handleToggled,
    containerClassName: classes.container
  }));
}

function Progress(props) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const handle = setTimeout(() => setIsVisible(true), 250);
    return () => clearTimeout(handle);
  }, []);
  return isVisible ? /* @__PURE__ */ React.createElement(LinearProgress, {
    ...props,
    "data-testid": "progress"
  }) : /* @__PURE__ */ React.createElement("div", {
    style: { display: "none" }
  });
}

const useStyles$y = makeStyles((theme) => ({
  root: {
    maxWidth: "fit-content",
    padding: theme.spacing(2, 2, 2, 2.5)
  },
  boxTitle: {
    margin: 0,
    color: theme.palette.textSubtle
  },
  arrow: {
    color: theme.palette.textSubtle
  }
}), { name: "BackstageBottomLink" });
function BottomLink(props) {
  const { link, title, onClick } = props;
  const classes = useStyles$y();
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Divider, null), /* @__PURE__ */ React.createElement(Link, {
    to: link,
    onClick,
    underline: "none"
  }, /* @__PURE__ */ React.createElement(Box, {
    display: "flex",
    alignItems: "center",
    className: classes.root
  }, /* @__PURE__ */ React.createElement(Box, {
    className: classes.boxTitle,
    fontWeight: "fontWeightBold",
    m: 1
  }, /* @__PURE__ */ React.createElement(Typography, null, /* @__PURE__ */ React.createElement("strong", null, title))), /* @__PURE__ */ React.createElement(ArrowIcon, {
    className: classes.arrow
  }))));
}

const SlackLink = (props) => {
  const { slackChannel } = props;
  if (!slackChannel) {
    return null;
  } else if (typeof slackChannel === "string") {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, "Please contact ", slackChannel, " for help.");
  } else if (!slackChannel.href) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, "Please contact ", slackChannel.name, " for help.");
  }
  return /* @__PURE__ */ React.createElement(Button, {
    to: slackChannel.href,
    variant: "contained"
  }, slackChannel.name);
};
const ErrorBoundary = class ErrorBoundary2 extends Component$3 {
  constructor(props) {
    super(props);
    this.state = {
      error: void 0,
      errorInfo: void 0
    };
  }
  componentDidCatch(error, errorInfo) {
    console.error(`ErrorBoundary, error: ${error}, info: ${errorInfo}`);
    this.setState({ error, errorInfo });
  }
  render() {
    const { slackChannel, children } = this.props;
    const { error } = this.state;
    if (!error) {
      return children;
    }
    return /* @__PURE__ */ React.createElement(ErrorPanel, {
      title: "Something Went Wrong",
      error
    }, /* @__PURE__ */ React.createElement(SlackLink, {
      slackChannel
    }));
  }
};

const useStyles$x = makeStyles((theme) => ({
  noPadding: {
    padding: 0,
    "&:last-child": {
      paddingBottom: 0
    }
  },
  header: {
    padding: theme.spacing(2, 2, 2, 2.5)
  },
  headerTitle: {
    fontWeight: 700
  },
  headerSubheader: {
    paddingTop: theme.spacing(1)
  },
  headerAvatar: {},
  headerAction: {},
  headerContent: {},
  subheader: {
    display: "flex"
  }
}), { name: "BackstageInfoCard" });
const CardActionsTopRight = withStyles((theme) => ({
  root: {
    display: "inline-block",
    padding: theme.spacing(8, 8, 0, 0),
    float: "right"
  }
}), { name: "BackstageInfoCardCardActionsTopRight" })(CardActions);
const VARIANT_STYLES = {
  card: {
    flex: {
      display: "flex",
      flexDirection: "column"
    },
    fullHeight: {
      display: "flex",
      flexDirection: "column",
      height: "100%"
    },
    gridItem: {
      display: "flex",
      flexDirection: "column",
      height: "calc(100% - 10px)",
      marginBottom: "10px"
    }
  },
  cardContent: {
    fullHeight: {
      flex: 1
    },
    gridItem: {
      flex: 1
    }
  }
};
function InfoCard(props) {
  const {
    title,
    subheader,
    divider = true,
    deepLink,
    slackChannel,
    errorBoundaryProps,
    variant,
    children,
    headerStyle,
    headerProps,
    icon,
    action,
    actionsClassName,
    actions,
    cardClassName,
    actionsTopRight,
    className,
    noPadding,
    titleTypographyProps
  } = props;
  const classes = useStyles$x();
  let calculatedStyle = {};
  let calculatedCardStyle = {};
  if (variant) {
    const variants = variant.split(/[\s]+/g);
    variants.forEach((name) => {
      calculatedStyle = {
        ...calculatedStyle,
        ...VARIANT_STYLES.card[name]
      };
      calculatedCardStyle = {
        ...calculatedCardStyle,
        ...VARIANT_STYLES.cardContent[name]
      };
    });
  }
  const cardSubTitle = () => {
    return /* @__PURE__ */ React.createElement("div", {
      className: classes.headerSubheader
    }, subheader && /* @__PURE__ */ React.createElement("div", {
      className: classes.subheader
    }, subheader), icon);
  };
  const errProps = errorBoundaryProps || (slackChannel ? { slackChannel } : {});
  return /* @__PURE__ */ React.createElement(Card, {
    style: calculatedStyle,
    className
  }, /* @__PURE__ */ React.createElement(ErrorBoundary, {
    ...errProps
  }, title && /* @__PURE__ */ React.createElement(CardHeader, {
    classes: {
      root: classes.header,
      title: classes.headerTitle,
      subheader: classes.headerSubheader,
      avatar: classes.headerAvatar,
      action: classes.headerAction,
      content: classes.headerContent
    },
    title,
    subheader: cardSubTitle(),
    action,
    style: { ...headerStyle },
    titleTypographyProps,
    ...headerProps
  }), actionsTopRight && /* @__PURE__ */ React.createElement(CardActionsTopRight, null, actionsTopRight), divider && /* @__PURE__ */ React.createElement(Divider, null), /* @__PURE__ */ React.createElement(CardContent, {
    className: classNames(cardClassName, {
      [classes.noPadding]: noPadding
    }),
    style: calculatedCardStyle
  }, children), actions && /* @__PURE__ */ React.createElement(CardActions, {
    className: actionsClassName
  }, actions), deepLink && /* @__PURE__ */ React.createElement(BottomLink, {
    ...deepLink
  })));
}

const useStyles$w = makeStyles((theme) => ({
  root: {
    position: "relative",
    lineHeight: 0
  },
  overlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -60%)",
    fontSize: 45,
    fontWeight: "bold",
    color: theme.palette.textContrast
  },
  description: {
    fontSize: "100%",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    position: "absolute",
    wordBreak: "break-all",
    display: "inline-block"
  },
  circle: {
    width: "80%",
    transform: "translate(10%, 0)"
  },
  colorUnknown: {}
}), { name: "BackstageGauge" });
const defaultGaugeProps = {
  fractional: true,
  inverse: false,
  unit: "%",
  max: 100
};
const getProgressColor = ({
  palette,
  value,
  inverse,
  max
}) => {
  if (isNaN(value)) {
    return "#ddd";
  }
  const actualMax = max ? max : defaultGaugeProps.max;
  const actualValue = inverse ? actualMax - value : value;
  if (actualValue < actualMax / 3) {
    return palette.status.error;
  } else if (actualValue < actualMax * (2 / 3)) {
    return palette.status.warning;
  }
  return palette.status.ok;
};
function Gauge(props) {
  const [hoverRef, setHoverRef] = useState(null);
  const { getColor = getProgressColor } = props;
  const classes = useStyles$w(props);
  const { palette } = useTheme();
  const { value, fractional, inverse, unit, max, description } = {
    ...defaultGaugeProps,
    ...props
  };
  const asPercentage = fractional ? Math.round(value * max) : value;
  const asActual = max !== 100 ? Math.round(value) : asPercentage;
  const [isHovering, setIsHovering] = useState(false);
  useEffect(() => {
    const node = hoverRef;
    const handleMouseOver = () => setIsHovering(true);
    const handleMouseOut = () => setIsHovering(false);
    if (node && description) {
      node.addEventListener("mouseenter", handleMouseOver);
      node.addEventListener("mouseleave", handleMouseOut);
      return () => {
        node.removeEventListener("mouseenter", handleMouseOver);
        node.removeEventListener("mouseleave", handleMouseOut);
      };
    }
    return () => {
      setIsHovering(false);
    };
  }, [description, hoverRef]);
  return /* @__PURE__ */ React.createElement("div", {
    ref: setHoverRef,
    className: classes.root
  }, /* @__PURE__ */ React.createElement(Circle, {
    strokeLinecap: "butt",
    percent: asPercentage,
    strokeWidth: 12,
    trailWidth: 12,
    strokeColor: getColor({ palette, value: asActual, inverse, max }),
    className: classes.circle
  }), description && isHovering ? /* @__PURE__ */ React.createElement("div", {
    className: classes.description
  }, description) : /* @__PURE__ */ React.createElement("div", {
    className: classes.overlay
  }, isNaN(value) ? "N/A" : `${asActual}${unit}`));
}

const useStyles$v = makeStyles({
  root: {
    height: "100%",
    width: 250
  }
}, { name: "BackstageGaugeCard" });
function GaugeCard(props) {
  const classes = useStyles$v(props);
  const {
    title,
    subheader,
    progress,
    inverse,
    deepLink,
    description,
    icon,
    variant,
    getColor
  } = props;
  const gaugeProps = {
    inverse,
    description,
    getColor,
    value: progress
  };
  return /* @__PURE__ */ React.createElement("div", {
    className: classes.root
  }, /* @__PURE__ */ React.createElement(InfoCard, {
    title,
    subheader,
    deepLink,
    variant,
    icon
  }, /* @__PURE__ */ React.createElement(Gauge, {
    ...gaugeProps
  })));
}

function LinearGauge(props) {
  const { value, getColor = getProgressColor } = props;
  const { palette } = useTheme();
  if (isNaN(value)) {
    return null;
  }
  let percent = Math.round(value * 100 * 100) / 100;
  if (percent > 100) {
    percent = 100;
  }
  const strokeColor = getColor({
    palette,
    value: percent,
    inverse: false,
    max: 100
  });
  return /* @__PURE__ */ React.createElement(Tooltip, {
    title: `${percent}%`
  }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement(Line, {
    percent,
    strokeWidth: 4,
    trailWidth: 4,
    strokeColor
  })));
}

const useStyles$u = makeStyles(() => createStyles({
  icon: {
    position: "absolute",
    right: "4px",
    pointerEvents: "none"
  }
}), { name: "BackstageClosedDropdown" });
const ClosedDropdown = () => {
  const classes = useStyles$u();
  return /* @__PURE__ */ React.createElement(SvgIcon, {
    className: classes.icon,
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, /* @__PURE__ */ React.createElement("path", {
    d: "M7.5 8L6 9.5L12.0703 15.5703L18.1406 9.5L16.6406 8L12.0703 12.5703L7.5 8Z",
    fill: "#616161"
  }));
};

const useStyles$t = makeStyles(() => createStyles({
  icon: {
    position: "absolute",
    right: "4px",
    pointerEvents: "none"
  }
}), { name: "BackstageOpenedDropdown" });
const OpenedDropdown = () => {
  const classes = useStyles$t();
  return /* @__PURE__ */ React.createElement(SvgIcon, {
    className: classes.icon,
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, /* @__PURE__ */ React.createElement("path", {
    d: "M16.5 16L18 14.5L11.9297 8.42969L5.85938 14.5L7.35938 16L11.9297 11.4297L16.5 16Z",
    fill: "#616161"
  }));
};

const BootstrapInput = withStyles((theme) => createStyles({
  root: {
    "label + &": {
      marginTop: theme.spacing(3)
    }
  },
  input: {
    borderRadius: 4,
    position: "relative",
    backgroundColor: theme.palette.background.paper,
    border: "1px solid #ced4da",
    fontSize: 16,
    padding: "10px 26px 10px 12px",
    transition: theme.transitions.create(["border-color", "box-shadow"]),
    fontFamily: "Helvetica Neue",
    "&:focus": {
      background: theme.palette.background.paper,
      borderRadius: 4
    }
  }
}), { name: "BackstageSelectInputBase" })(InputBase);
const useStyles$s = makeStyles((theme) => createStyles({
  formControl: {
    margin: `${theme.spacing(1)} 0px`,
    maxWidth: 300
  },
  label: {
    transform: "initial",
    fontWeight: "bold",
    fontSize: 14,
    fontFamily: theme.typography.fontFamily,
    color: theme.palette.text.primary,
    "&.Mui-focused": {
      color: theme.palette.text.primary
    }
  },
  formLabel: {
    transform: "initial",
    fontWeight: "bold",
    fontSize: 14,
    fontFamily: theme.typography.fontFamily,
    color: theme.palette.text.primary,
    "&.Mui-focused": {
      color: theme.palette.text.primary
    }
  },
  chips: {
    display: "flex",
    flexWrap: "wrap"
  },
  chip: {
    margin: 2
  },
  checkbox: {},
  root: {
    display: "flex",
    flexDirection: "column"
  }
}), { name: "BackstageSelect" });
function SelectComponent(props) {
  const {
    multiple,
    items,
    label,
    placeholder,
    selected,
    onChange,
    triggerReset,
    native = false,
    disabled = false
  } = props;
  const classes = useStyles$s();
  const [value, setValue] = useState(selected || (multiple ? [] : ""));
  const [isOpen, setOpen] = useState(false);
  useEffect(() => {
    setValue(multiple ? [] : "");
  }, [triggerReset, multiple]);
  useEffect(() => {
    if (selected !== void 0) {
      setValue(selected);
    }
  }, [selected]);
  const handleChange = (event) => {
    setValue(event.target.value);
    onChange(event.target.value);
  };
  const handleClick = (event) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    setOpen((previous) => {
      if (multiple && !(event.target instanceof HTMLElement)) {
        return true;
      }
      return !previous;
    });
  };
  const handleClickAway = () => {
    setOpen(false);
  };
  const handleDelete = (selectedValue) => () => {
    const newValue = value.filter((chip) => chip !== selectedValue);
    setValue(newValue);
    onChange(newValue);
  };
  return /* @__PURE__ */ React.createElement("div", {
    className: classes.root
  }, /* @__PURE__ */ React.createElement(ClickAwayListener, {
    onClickAway: handleClickAway
  }, /* @__PURE__ */ React.createElement(FormControl, {
    className: classes.formControl
  }, /* @__PURE__ */ React.createElement(InputLabel, {
    className: classes.formLabel
  }, label), /* @__PURE__ */ React.createElement(Select, {
    "aria-label": label,
    value,
    native,
    disabled,
    "data-testid": "select",
    displayEmpty: true,
    multiple,
    onChange: handleChange,
    onClick: handleClick,
    open: isOpen,
    input: /* @__PURE__ */ React.createElement(BootstrapInput, null),
    label,
    tabIndex: 0,
    renderValue: (s) => {
      var _a;
      return multiple && value.length !== 0 ? /* @__PURE__ */ React.createElement("div", {
        className: classes.chips
      }, s.map((selectedValue) => {
        var _a2, _b;
        return /* @__PURE__ */ React.createElement(Chip, {
          key: (_a2 = items.find((el) => el.value === selectedValue)) == null ? void 0 : _a2.value,
          label: (_b = items.find((el) => el.value === selectedValue)) == null ? void 0 : _b.label,
          clickable: true,
          onDelete: handleDelete(selectedValue),
          className: classes.chip
        });
      })) : /* @__PURE__ */ React.createElement(Typography, null, value.length === 0 ? placeholder || "" : (_a = items.find((el) => el.value === s)) == null ? void 0 : _a.label);
    },
    IconComponent: () => !isOpen ? /* @__PURE__ */ React.createElement(ClosedDropdown, null) : /* @__PURE__ */ React.createElement(OpenedDropdown, null),
    MenuProps: {
      anchorOrigin: {
        vertical: "bottom",
        horizontal: "left"
      },
      transformOrigin: {
        vertical: "top",
        horizontal: "left"
      },
      getContentAnchorEl: null
    }
  }, placeholder && !multiple && /* @__PURE__ */ React.createElement(MenuItem, {
    value: []
  }, placeholder), native ? items && items.map((item) => /* @__PURE__ */ React.createElement("option", {
    value: item.value,
    key: item.value
  }, item.label)) : items && items.map((item) => /* @__PURE__ */ React.createElement(MenuItem, {
    key: item.value,
    value: item.value
  }, multiple && /* @__PURE__ */ React.createElement(Checkbox, {
    color: "primary",
    checked: value.includes(item.value) || false,
    className: classes.checkbox
  }), item.label))))));
}

const noop = () => {
};
const VerticalStepperContext = React.createContext({
  stepperLength: 0,
  stepIndex: 0,
  setStepIndex: noop,
  stepHistory: [],
  setStepHistory: noop,
  onStepChange: noop
});
function SimpleStepper(props) {
  const { children, elevated, onStepChange, activeStep = 0 } = props;
  const [stepIndex, setStepIndex] = useState(activeStep);
  const [stepHistory, setStepHistory] = useState([0]);
  useEffect(() => {
    setStepIndex(activeStep);
  }, [activeStep]);
  const steps = [];
  let endStep;
  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      if (child.props.end) {
        endStep = child;
      } else {
        steps.push(child);
      }
    }
  });
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(VerticalStepperContext.Provider, {
    value: {
      stepIndex,
      setStepIndex,
      stepHistory,
      setStepHistory,
      onStepChange,
      stepperLength: Children.count(children)
    }
  }, /* @__PURE__ */ React.createElement(MuiStepper, {
    activeStep: stepIndex,
    orientation: "vertical",
    elevation: elevated ? 2 : 0
  }, steps)), stepIndex >= Children.count(children) - 1 && endStep);
}

const useStyles$r = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(3),
    "& button": {
      marginRight: theme.spacing(1)
    }
  }
}), { name: "BackstageSimpleStepperFooter" });
const RestartBtn = ({ text, handleClick }) => /* @__PURE__ */ React.createElement(Button$1, {
  onClick: handleClick
}, text || "Reset");
const NextBtn = ({
  text,
  handleClick,
  disabled,
  last,
  stepIndex
}) => /* @__PURE__ */ React.createElement(Button$1, {
  variant: "contained",
  color: "primary",
  disabled,
  "data-testid": `nextButton-${stepIndex}`,
  onClick: handleClick
}, text || (last ? "Finish" : "Next"));
const BackBtn = ({ text, handleClick, disabled, stepIndex }) => /* @__PURE__ */ React.createElement(Button$1, {
  onClick: handleClick,
  "data-testid": `backButton-${stepIndex}`,
  disabled
}, text || "Back");
const SimpleStepperFooter = ({
  actions = {},
  children
}) => {
  const classes = useStyles$r();
  const {
    stepperLength,
    stepIndex,
    setStepIndex,
    stepHistory,
    setStepHistory,
    onStepChange
  } = useContext(VerticalStepperContext);
  const onChange = (newIndex, callback) => {
    if (callback) {
      callback();
    }
    if (onStepChange) {
      onStepChange(stepIndex, newIndex);
    }
    setStepIndex(newIndex);
  };
  const handleNext = () => {
    const newIndex = actions.nextStep ? actions.nextStep(stepIndex, stepperLength - 1) : stepIndex + 1;
    onChange(newIndex, actions.onNext);
    setStepHistory([...stepHistory, newIndex]);
  };
  const handleBack = () => {
    stepHistory.pop();
    onChange(stepHistory[stepHistory.length - 1], actions.onBack);
    setStepHistory([...stepHistory]);
  };
  const handleRestart = () => {
    onChange(0, actions.onRestart);
    setStepHistory([0]);
  };
  return /* @__PURE__ */ React.createElement("div", {
    className: classes.root
  }, [void 0, true].includes(actions.showBack) && stepIndex !== 0 && /* @__PURE__ */ React.createElement(BackBtn, {
    text: actions.backText,
    handleClick: handleBack,
    disabled: stepIndex === 0,
    stepIndex
  }), [void 0, true].includes(actions.showNext) && /* @__PURE__ */ React.createElement(NextBtn, {
    text: actions.nextText,
    handleClick: handleNext,
    disabled: !!stepperLength && stepIndex >= stepperLength || !!actions.canNext && !actions.canNext(),
    stepIndex
  }), actions.showRestart && stepIndex !== 0 && /* @__PURE__ */ React.createElement(RestartBtn, {
    text: actions.restartText,
    handleClick: handleRestart,
    stepIndex
  }), children);
};

const useStyles$q = makeStyles((theme) => ({
  end: {
    padding: theme.spacing(3)
  }
}), { name: "SimpleStepperStep" });
function SimpleStepperStep(props) {
  const { title, children, end, actions, ...muiProps } = props;
  const classes = useStyles$q();
  return end ? /* @__PURE__ */ React.createElement("div", {
    className: classes.end
  }, /* @__PURE__ */ React.createElement(Typography, {
    variant: "h6"
  }, title), children, /* @__PURE__ */ React.createElement(SimpleStepperFooter, {
    actions: { ...actions || {}, showNext: false }
  })) : /* @__PURE__ */ React.createElement(MuiStep, {
    ...muiProps
  }, /* @__PURE__ */ React.createElement(StepLabel, null, /* @__PURE__ */ React.createElement(Typography, {
    variant: "h6"
  }, title)), /* @__PURE__ */ React.createElement(StepContent, null, children, /* @__PURE__ */ React.createElement(SimpleStepperFooter, {
    actions
  })));
}

const useStyles$p = makeStyles((theme) => ({
  status: {
    fontWeight: 500,
    "&::before": {
      width: "0.7em",
      height: "0.7em",
      display: "inline-block",
      marginRight: 8,
      borderRadius: "50%",
      content: '""'
    }
  },
  ok: {
    "&::before": {
      backgroundColor: theme.palette.status.ok
    }
  },
  warning: {
    "&::before": {
      backgroundColor: theme.palette.status.warning
    }
  },
  error: {
    "&::before": {
      backgroundColor: theme.palette.status.error
    }
  },
  pending: {
    "&::before": {
      backgroundColor: theme.palette.status.pending
    }
  },
  running: {
    "&::before": {
      backgroundColor: theme.palette.status.running
    }
  },
  aborted: {
    "&::before": {
      backgroundColor: theme.palette.status.aborted
    }
  }
}), { name: "BackstageStatus" });
function StatusOK(props) {
  const classes = useStyles$p(props);
  return /* @__PURE__ */ React.createElement("span", {
    className: classNames(classes.status, classes.ok),
    "aria-label": "Status ok",
    "aria-hidden": "true",
    ...props
  });
}
function StatusWarning(props) {
  const classes = useStyles$p(props);
  return /* @__PURE__ */ React.createElement("span", {
    className: classNames(classes.status, classes.warning),
    "aria-label": "Status warning",
    "aria-hidden": "true",
    ...props
  });
}
function StatusError(props) {
  const classes = useStyles$p(props);
  return /* @__PURE__ */ React.createElement("span", {
    className: classNames(classes.status, classes.error),
    "aria-label": "Status error",
    "aria-hidden": "true",
    ...props
  });
}
function StatusPending(props) {
  const classes = useStyles$p(props);
  return /* @__PURE__ */ React.createElement("span", {
    className: classNames(classes.status, classes.pending),
    "aria-label": "Status pending",
    "aria-hidden": "true",
    ...props
  });
}
function StatusRunning(props) {
  const classes = useStyles$p(props);
  return /* @__PURE__ */ React.createElement("span", {
    className: classNames(classes.status, classes.running),
    "aria-label": "Status running",
    "aria-hidden": "true",
    ...props
  });
}
function StatusAborted(props) {
  const classes = useStyles$p(props);
  return /* @__PURE__ */ React.createElement("span", {
    className: classNames(classes.status, classes.aborted),
    "aria-label": "Status aborted",
    "aria-hidden": "true",
    ...props
  });
}

const tableTitleCellStyles = (theme) => createStyles({
  root: {
    fontWeight: "bolder",
    whiteSpace: "nowrap",
    paddingRight: theme.spacing(4),
    border: "0",
    verticalAlign: "top"
  }
});
const tableContentCellStyles = {
  root: {
    border: "0",
    verticalAlign: "top"
  }
};
const listStyles = (theme) => createStyles({
  root: {
    listStyle: "none",
    margin: theme.spacing(0, 0, -1, 0),
    padding: "0"
  }
});
const listItemStyles = (theme) => createStyles({
  root: {
    padding: theme.spacing(0, 0, 1, 0)
  },
  random: {}
});
const TitleCell = withStyles(tableTitleCellStyles, {
  name: "BackstageMetadataTableTitleCell"
})(TableCell);
const ContentCell = withStyles(tableContentCellStyles, {
  name: "BackstageMetadataTableCell"
})(TableCell);
const MetadataTable = ({
  dense,
  children
}) => /* @__PURE__ */ React.createElement(Table$1, {
  size: dense ? "small" : "medium"
}, /* @__PURE__ */ React.createElement(TableBody, null, children));
const MetadataTableItem = ({
  title,
  children,
  ...rest
}) => /* @__PURE__ */ React.createElement(TableRow, null, title && /* @__PURE__ */ React.createElement(TitleCell, null, title), /* @__PURE__ */ React.createElement(ContentCell, {
  colSpan: title ? 1 : 2,
  ...rest
}, children));
const MetadataList = withStyles(listStyles, {
  name: "BackstageMetadataTableList"
})(({ classes, children }) => /* @__PURE__ */ React.createElement("ul", {
  className: classes.root
}, children));
const MetadataListItem = withStyles(listItemStyles, {
  name: "BackstageMetadataTableListItem"
})(({ classes, children }) => /* @__PURE__ */ React.createElement("li", {
  className: classes.root
}, children));

const listStyle = createStyles({
  root: {
    margin: "0 0",
    listStyleType: "none"
  }
});
const nestedListStyle = (theme) => createStyles({
  root: {
    ...listStyle.root,
    paddingLeft: theme.spacing(1)
  }
});
const StyledList = withStyles(listStyle, {
  name: "BackstageStructuredMetadataTableList"
})(({ classes, children }) => /* @__PURE__ */ React.createElement(MetadataList, {
  classes
}, children));
const StyledNestedList = withStyles(nestedListStyle, {
  name: "BackstageStructuredMetadataTableNestedList"
})(({ classes, children }) => /* @__PURE__ */ React.createElement(MetadataList, {
  classes
}, children));
function renderList(list, nested) {
  const values = list.map((item, index) => /* @__PURE__ */ React.createElement(MetadataListItem, {
    key: index
  }, toValue(item)));
  return nested ? /* @__PURE__ */ React.createElement(StyledNestedList, null, values) : /* @__PURE__ */ React.createElement(StyledList, null, values);
}
function renderMap(map, nested, options) {
  const values = Object.keys(map).map((key) => {
    const value = toValue(map[key], true);
    const fmtKey = options && options.titleFormat ? options.titleFormat(key) : startCase(key);
    return /* @__PURE__ */ React.createElement(MetadataListItem, {
      key
    }, `${fmtKey}: `, value);
  });
  return nested ? /* @__PURE__ */ React.createElement(StyledNestedList, null, values) : /* @__PURE__ */ React.createElement(StyledList, null, values);
}
function toValue(value, options, nested) {
  if (React.isValidElement(value)) {
    return /* @__PURE__ */ React.createElement(Fragment, null, value);
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    return renderMap(value, options, nested);
  }
  if (Array.isArray(value)) {
    return renderList(value, nested);
  }
  if (typeof value === "boolean") {
    return /* @__PURE__ */ React.createElement(Fragment, null, value ? "\u2705" : "\u274C");
  }
  return /* @__PURE__ */ React.createElement(Fragment, null, value);
}
const ItemValue = ({ value, options }) => /* @__PURE__ */ React.createElement(Fragment, null, toValue(value, options));
const TableItem = ({
  title,
  value,
  options
}) => {
  return /* @__PURE__ */ React.createElement(MetadataTableItem, {
    title: options && options.titleFormat ? options.titleFormat(title) : startCase(title)
  }, /* @__PURE__ */ React.createElement(ItemValue, {
    value,
    options
  }));
};
function mapToItems(info, options) {
  return Object.keys(info).map((key) => /* @__PURE__ */ React.createElement(TableItem, {
    key,
    title: key,
    value: info[key],
    options
  }));
}
function StructuredMetadataTable(props) {
  const { metadata, dense = true, options } = props;
  const metadataItems = mapToItems(metadata, options || {});
  return /* @__PURE__ */ React.createElement(MetadataTable, {
    dense
  }, metadataItems);
}

function stringify(queryParams) {
  return qs.stringify(queryParams, {
    strictNullHandling: true
  });
}
function parse(queryString) {
  return qs.parse(queryString, {
    ignoreQueryPrefix: true,
    strictNullHandling: true
  });
}
function extractState(queryString, stateName) {
  const queryParams = parse(queryString);
  return queryParams[stateName];
}
function joinQueryString(queryString, stateName, state) {
  const queryParams = {
    ...parse(queryString),
    [stateName]: state
  };
  return stringify(queryParams);
}
function useQueryParamState(stateName, debounceTime = 250) {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamsString = searchParams.toString();
  const [queryParamState, setQueryParamState] = useState(extractState(searchParamsString, stateName));
  useEffect(() => {
    const newState = extractState(searchParamsString, stateName);
    setQueryParamState((oldState) => isEqual(newState, oldState) ? oldState : newState);
  }, [searchParamsString, setQueryParamState, stateName]);
  useDebouncedEffect(() => {
    const queryString = joinQueryString(searchParamsString, stateName, queryParamState);
    if (searchParamsString !== queryString) {
      setSearchParams(queryString, { replace: true });
    }
  }, [setSearchParams, queryParamState, searchParamsString, stateName], debounceTime);
  return [queryParamState, setQueryParamState];
}

const DEFAULT_SUPPORT_CONFIG = {
  url: "https://github.com/backstage/backstage/issues",
  items: [
    {
      title: "Support Not Configured",
      icon: "warning",
      links: [
        {
          title: "Add `app.support` config key",
          url: "https://github.com/backstage/backstage/blob/master/app-config.yaml"
        }
      ]
    }
  ]
};
function useSupportConfig() {
  const apiHolder = useApiHolder();
  const config = apiHolder.get(configApiRef);
  const supportConfig = config == null ? void 0 : config.getOptionalConfig("app.support");
  if (!supportConfig) {
    return DEFAULT_SUPPORT_CONFIG;
  }
  return {
    url: supportConfig.getString("url"),
    items: supportConfig.getConfigArray("items").flatMap((itemConf) => {
      var _a;
      return {
        title: itemConf.getString("title"),
        icon: itemConf.getOptionalString("icon"),
        links: ((_a = itemConf.getOptionalConfigArray("links")) != null ? _a : []).flatMap((linkConf) => ({
          url: linkConf.getString("url"),
          title: linkConf.getString("title")
        }))
      };
    })
  };
}

function useSystemIcon(key, props) {
  const app = useApp();
  const Icon = app.getSystemIcon(key);
  return Icon ? /* @__PURE__ */ React.createElement(Icon, {
    ...props
  }) : /* @__PURE__ */ React.createElement(MuiBrokenImageIcon, {
    ...props
  });
}
function BrokenImageIcon(props) {
  return useSystemIcon("brokenImage", props);
}
function CatalogIcon(props) {
  return useSystemIcon("catalog", props);
}
function ChatIcon(props) {
  return useSystemIcon("chat", props);
}
function DashboardIcon(props) {
  return useSystemIcon("dashboard", props);
}
function DocsIcon(props) {
  return useSystemIcon("docs", props);
}
function EmailIcon(props) {
  return useSystemIcon("email", props);
}
function GitHubIcon(props) {
  return useSystemIcon("github", props);
}
function GroupIcon(props) {
  return useSystemIcon("group", props);
}
function HelpIcon(props) {
  return useSystemIcon("help", props);
}
function UserIcon(props) {
  return useSystemIcon("user", props);
}
function WarningIcon(props) {
  return useSystemIcon("warning", props);
}

const useStyles$o = makeStyles({
  popoverList: {
    minWidth: 260,
    maxWidth: 400
  }
}, { name: "BackstageSupportButton" });
const SupportIcon = ({ icon }) => {
  var _a;
  const app = useApp();
  const Icon = icon ? (_a = app.getSystemIcon(icon)) != null ? _a : HelpIcon : HelpIcon;
  return /* @__PURE__ */ React.createElement(Icon, null);
};
const SupportLink = ({ link }) => {
  var _a;
  return /* @__PURE__ */ React.createElement(Link, {
    to: link.url
  }, (_a = link.title) != null ? _a : link.url);
};
const SupportListItem = ({ item }) => {
  var _a;
  return /* @__PURE__ */ React.createElement(ListItem, null, /* @__PURE__ */ React.createElement(ListItemIcon, null, /* @__PURE__ */ React.createElement(SupportIcon, {
    icon: item.icon
  })), /* @__PURE__ */ React.createElement(ListItemText, {
    primary: item.title,
    secondary: (_a = item.links) == null ? void 0 : _a.reduce((prev, link, idx) => [
      ...prev,
      idx > 0 && /* @__PURE__ */ React.createElement("br", {
        key: idx
      }),
      /* @__PURE__ */ React.createElement(SupportLink, {
        link,
        key: link.url
      })
    ], [])
  }));
};
function SupportButton(props) {
  const { title, children } = props;
  const { items } = useSupportConfig();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const classes = useStyles$o();
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const onClickHandler = (event) => {
    setAnchorEl(event.currentTarget);
    setPopoverOpen(true);
  };
  const popoverCloseHandler = () => {
    setPopoverOpen(false);
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Box, {
    display: "flex",
    ml: 1
  }, isSmallScreen ? /* @__PURE__ */ React.createElement(IconButton, {
    color: "primary",
    size: "small",
    onClick: onClickHandler,
    "data-testid": "support-button"
  }, /* @__PURE__ */ React.createElement(HelpIcon, null)) : /* @__PURE__ */ React.createElement(Button$1, {
    "data-testid": "support-button",
    "aria-label": "support",
    color: "primary",
    onClick: onClickHandler,
    startIcon: /* @__PURE__ */ React.createElement(HelpIcon, null)
  }, "Support")), /* @__PURE__ */ React.createElement(Popover, {
    "data-testid": "support-button-popover",
    open: popoverOpen,
    anchorEl,
    anchorOrigin: {
      vertical: "bottom",
      horizontal: "right"
    },
    transformOrigin: {
      vertical: "top",
      horizontal: "right"
    },
    onClose: popoverCloseHandler
  }, /* @__PURE__ */ React.createElement(List, {
    className: classes.popoverList
  }, title && /* @__PURE__ */ React.createElement(ListItem, {
    alignItems: "flex-start"
  }, /* @__PURE__ */ React.createElement(Typography, {
    variant: "subtitle1"
  }, title)), React.Children.map(children, (child, i) => /* @__PURE__ */ React.createElement(ListItem, {
    alignItems: "flex-start",
    key: `child-${i}`
  }, child)), items && items.map((item, i) => /* @__PURE__ */ React.createElement(SupportListItem, {
    item,
    key: `item-${i}`
  }))), /* @__PURE__ */ React.createElement(DialogActions, null, /* @__PURE__ */ React.createElement(Button$1, {
    color: "primary",
    onClick: popoverCloseHandler
  }, "Close"))));
}

const drawerWidthClosed = 72;
const iconPadding = 24;
const userBadgePadding = 18;
const sidebarConfig = {
  drawerWidthClosed,
  drawerWidthOpen: 224,
  defaultOpenDelayMs: 100,
  defaultCloseDelayMs: 0,
  defaultFadeDuration: 200,
  logoHeight: 32,
  iconContainerWidth: drawerWidthClosed,
  iconSize: drawerWidthClosed - iconPadding * 2,
  iconPadding,
  selectedIndicatorWidth: 3,
  userBadgePadding,
  userBadgeDiameter: drawerWidthClosed - userBadgePadding * 2,
  mobileSidebarHeight: 56
};
const makeSidebarConfig = (customSidebarConfig) => ({
  ...sidebarConfig,
  ...customSidebarConfig,
  iconContainerWidth: sidebarConfig.drawerWidthClosed,
  iconSize: sidebarConfig.drawerWidthClosed - sidebarConfig.iconPadding * 2,
  userBadgeDiameter: sidebarConfig.drawerWidthClosed - sidebarConfig.userBadgePadding * 2
});
const submenuConfig = {
  drawerWidthClosed: 0,
  drawerWidthOpen: 202,
  defaultOpenDelayMs: sidebarConfig.defaultOpenDelayMs + 200
};
const makeSidebarSubmenuConfig = (customSubmenuConfig) => ({
  ...submenuConfig,
  ...customSubmenuConfig
});
const SIDEBAR_INTRO_LOCAL_STORAGE = "@backstage/core/sidebar-intro-dismissed";
const SidebarConfigContext = createContext({
  sidebarConfig,
  submenuConfig
});
const SidebarItemWithSubmenuContext = createContext({
  isHoveredOn: false,
  setIsHoveredOn: () => {
  }
});

const LocalStorage = {
  getSidebarPinState() {
    let value;
    try {
      value = JSON.parse(window.localStorage.getItem("sidebarPinState" /* SIDEBAR_PIN_STATE */) || "true");
    } catch {
      return true;
    }
    return !!value;
  },
  setSidebarPinState(state) {
    return window.localStorage.setItem("sidebarPinState" /* SIDEBAR_PIN_STATE */, JSON.stringify(state));
  }
};

const defaultSidebarPinStateContext = {
  isPinned: true,
  toggleSidebarPinState: () => {
  },
  isMobile: false
};
const LegacySidebarPinStateContext = createContext(defaultSidebarPinStateContext);
const VersionedSidebarPinStateContext = createVersionedContext("sidebar-pin-state-context");
const SidebarPinStateProvider = ({
  children,
  value
}) => /* @__PURE__ */ React.createElement(LegacySidebarPinStateContext.Provider, {
  value
}, /* @__PURE__ */ React.createElement(VersionedSidebarPinStateContext.Provider, {
  value: createVersionedValueMap({ 1: value })
}, children));
const useSidebarPinState = () => {
  const versionedPinStateContext = useContext(VersionedSidebarPinStateContext);
  const legacyPinStateContext = useContext(LegacySidebarPinStateContext);
  if (versionedPinStateContext === void 0) {
    return legacyPinStateContext || defaultSidebarPinStateContext;
  }
  const pinStateContext = versionedPinStateContext.atVersion(1);
  if (pinStateContext === void 0) {
    throw new Error("No context found for version 1.");
  }
  return pinStateContext;
};

const useStyles$n = makeStyles((theme) => ({
  root: {
    width: "100%",
    transition: "padding-left 0.1s ease-out",
    isolation: "isolate",
    [theme.breakpoints.up("sm")]: {
      paddingLeft: (props) => props.isPinned ? props.sidebarConfig.drawerWidthOpen : props.sidebarConfig.drawerWidthClosed
    },
    [theme.breakpoints.down("xs")]: {
      paddingBottom: (props) => props.sidebarConfig.mobileSidebarHeight
    }
  },
  content: {
    zIndex: 0,
    isolation: "isolate",
    "&:focus": {
      outline: 0
    }
  }
}), { name: "BackstageSidebarPage" });
const PageContext = createContext({
  content: {
    contentRef: void 0
  }
});
function SidebarPage(props) {
  const [isPinned, setIsPinned] = useState(() => LocalStorage.getSidebarPinState());
  const { sidebarConfig } = useContext(SidebarConfigContext);
  const contentRef = useRef(null);
  const pageContext = useMemo(() => ({
    content: {
      contentRef
    }
  }), [contentRef]);
  useEffect(() => {
    LocalStorage.setSidebarPinState(isPinned);
  }, [isPinned]);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("xs"), { noSsr: true });
  const toggleSidebarPinState = () => setIsPinned(!isPinned);
  const classes = useStyles$n({ isPinned, sidebarConfig });
  return /* @__PURE__ */ React.createElement(SidebarPinStateProvider, {
    value: {
      isPinned,
      toggleSidebarPinState,
      isMobile
    }
  }, /* @__PURE__ */ React.createElement(PageContext.Provider, {
    value: pageContext
  }, /* @__PURE__ */ React.createElement("div", {
    className: classes.root
  }, props.children)));
}
function useContent() {
  const { content } = useContext(PageContext);
  const focusContent = useCallback(() => {
    var _a, _b;
    (_b = (_a = content == null ? void 0 : content.contentRef) == null ? void 0 : _a.current) == null ? void 0 : _b.focus();
  }, [content]);
  return { focusContent, contentRef: content == null ? void 0 : content.contentRef };
}

const defaultSidebarOpenStateContext = {
  isOpen: false,
  setOpen: () => {
  }
};
const LegacySidebarContext = createContext(defaultSidebarOpenStateContext);
const VersionedSidebarContext = createVersionedContext("sidebar-open-state-context");
const SidebarOpenStateProvider = ({
  children,
  value
}) => /* @__PURE__ */ React.createElement(LegacySidebarContext.Provider, {
  value
}, /* @__PURE__ */ React.createElement(VersionedSidebarContext.Provider, {
  value: createVersionedValueMap({ 1: value })
}, children));
const useSidebarOpenState = () => {
  const versionedOpenStateContext = useContext(VersionedSidebarContext);
  const legacyOpenStateContext = useContext(LegacySidebarContext);
  if (versionedOpenStateContext === void 0) {
    return legacyOpenStateContext || defaultSidebarOpenStateContext;
  }
  const openStateContext = versionedOpenStateContext.atVersion(1);
  if (openStateContext === void 0) {
    throw new Error("No context found for version 1.");
  }
  return openStateContext;
};

const useStyles$m = makeStyles((theme) => ({
  root: {
    flexGrow: 0,
    margin: theme.spacing(0, 2),
    color: theme.palette.navigation.color
  },
  selected: (props) => ({
    color: `${theme.palette.navigation.selectedColor}!important`,
    borderTop: `solid ${props.sidebarConfig.selectedIndicatorWidth}px ${theme.palette.navigation.indicator}`,
    marginTop: "-1px"
  }),
  label: {
    display: "none"
  }
}));
const MobileSidebarGroup = (props) => {
  const { to, label, icon, value } = props;
  const { sidebarConfig } = useContext(SidebarConfigContext);
  const classes = useStyles$m({ sidebarConfig });
  const location = useLocation();
  const { selectedMenuItemIndex, setSelectedMenuItemIndex } = useContext(MobileSidebarContext);
  const onChange = (_, value2) => {
    if (value2 === selectedMenuItemIndex) {
      setSelectedMenuItemIndex(-1);
    } else {
      setSelectedMenuItemIndex(value2);
    }
  };
  const selected = value === selectedMenuItemIndex && selectedMenuItemIndex >= 0 || !(value === selectedMenuItemIndex) && !(selectedMenuItemIndex >= 0) && to === location.pathname;
  return /* @__PURE__ */ React.createElement(BottomNavigationAction, {
    label,
    icon,
    component: Link,
    to: to ? to : location.pathname,
    onChange,
    value,
    selected,
    classes
  });
};
const SidebarGroup = (props) => {
  const { children, to, label, icon, value } = props;
  const { isMobile } = useSidebarPinState();
  return isMobile ? /* @__PURE__ */ React.createElement(MobileSidebarGroup, {
    to,
    label,
    icon,
    value
  }) : /* @__PURE__ */ React.createElement(React.Fragment, null, children);
};

const useStyles$l = makeStyles((theme) => ({
  root: {
    position: "fixed",
    backgroundColor: theme.palette.navigation.background,
    color: theme.palette.navigation.color,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: theme.zIndex.snackbar,
    borderTop: "1px solid #383838"
  },
  overlay: (props) => ({
    background: theme.palette.navigation.background,
    width: "100%",
    bottom: `${props.sidebarConfig.mobileSidebarHeight}px`,
    height: `calc(100% - ${props.sidebarConfig.mobileSidebarHeight}px)`,
    flex: "0 1 auto",
    overflow: "auto"
  }),
  overlayHeader: {
    display: "flex",
    color: theme.palette.bursts.fontColor,
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(2, 3)
  },
  overlayHeaderClose: {
    color: theme.palette.bursts.fontColor
  },
  marginMobileSidebar: (props) => ({
    marginBottom: `${props.sidebarConfig.mobileSidebarHeight}px`
  })
}));
const sortSidebarGroupsForPriority = (children) => orderBy(children, ({ props: { priority } }) => Number.isInteger(priority) ? priority : -1, "desc");
const sidebarGroupType = React.createElement(SidebarGroup).type;
const OverlayMenu = ({
  children,
  label = "Menu",
  open,
  onClose
}) => {
  const { sidebarConfig } = useContext(SidebarConfigContext);
  const classes = useStyles$l({ sidebarConfig });
  return /* @__PURE__ */ React.createElement(Drawer, {
    anchor: "bottom",
    open,
    onClose,
    ModalProps: {
      BackdropProps: { classes: { root: classes.marginMobileSidebar } }
    },
    classes: {
      root: classes.marginMobileSidebar,
      paperAnchorBottom: classes.overlay
    }
  }, /* @__PURE__ */ React.createElement(Box, {
    className: classes.overlayHeader
  }, /* @__PURE__ */ React.createElement(Typography, {
    variant: "h3"
  }, label), /* @__PURE__ */ React.createElement(IconButton, {
    onClick: onClose,
    classes: { root: classes.overlayHeaderClose }
  }, /* @__PURE__ */ React.createElement(CloseIcon, null))), /* @__PURE__ */ React.createElement(Box, {
    component: "nav"
  }, children));
};
const MobileSidebarContext = createContext({
  selectedMenuItemIndex: -1,
  setSelectedMenuItemIndex: () => {
  }
});
const MobileSidebar = (props) => {
  const { sidebarConfig } = useContext(SidebarConfigContext);
  const { children } = props;
  const classes = useStyles$l({ sidebarConfig });
  const location = useLocation$1();
  const [selectedMenuItemIndex, setSelectedMenuItemIndex] = useState(-1);
  useEffect(() => {
    setSelectedMenuItemIndex(-1);
  }, [location.pathname]);
  let sidebarGroups = useElementFilter(children, (elements) => elements.getElements().filter((child) => child.type === sidebarGroupType));
  if (!children) {
    return null;
  } else if (!sidebarGroups.length) {
    sidebarGroups.push(/* @__PURE__ */ React.createElement(SidebarGroup, {
      key: "default_menu",
      icon: /* @__PURE__ */ React.createElement(MenuIcon, null)
    }, children));
  } else {
    sidebarGroups = sortSidebarGroupsForPriority(sidebarGroups);
  }
  const shouldShowGroupChildren = selectedMenuItemIndex >= 0 && !sidebarGroups[selectedMenuItemIndex].props.to;
  return /* @__PURE__ */ React.createElement(SidebarOpenStateProvider, {
    value: { isOpen: true, setOpen: () => {
    } }
  }, /* @__PURE__ */ React.createElement(MobileSidebarContext.Provider, {
    value: { selectedMenuItemIndex, setSelectedMenuItemIndex }
  }, /* @__PURE__ */ React.createElement(OverlayMenu, {
    label: sidebarGroups[selectedMenuItemIndex] && sidebarGroups[selectedMenuItemIndex].props.label,
    open: shouldShowGroupChildren,
    onClose: () => setSelectedMenuItemIndex(-1)
  }, sidebarGroups[selectedMenuItemIndex] && sidebarGroups[selectedMenuItemIndex].props.children), /* @__PURE__ */ React.createElement(BottomNavigation, {
    className: classes.root,
    "data-testid": "mobile-sidebar-root",
    component: "nav"
  }, sidebarGroups)));
};

const useStyles$k = makeStyles((theme) => ({
  drawer: (props) => ({
    display: "flex",
    flexFlow: "column nowrap",
    alignItems: "flex-start",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: theme.zIndex.appBar,
    background: theme.palette.navigation.background,
    overflowX: "hidden",
    msOverflowStyle: "none",
    scrollbarWidth: "none",
    width: props.sidebarConfig.drawerWidthClosed,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.shortest
    }),
    "& > *": {
      flexShrink: 0
    },
    "&::-webkit-scrollbar": {
      display: "none"
    }
  }),
  drawerOpen: (props) => ({
    width: props.sidebarConfig.drawerWidthOpen,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.shorter
    })
  }),
  visuallyHidden: {
    top: 0,
    position: "absolute",
    zIndex: 1e3,
    transform: "translateY(-200%)",
    "&:focus": {
      transform: "translateY(5px)"
    }
  }
}), { name: "BackstageSidebar" });
const DesktopSidebar = (props) => {
  const { sidebarConfig } = useContext(SidebarConfigContext);
  const {
    openDelayMs = sidebarConfig.defaultOpenDelayMs,
    closeDelayMs = sidebarConfig.defaultCloseDelayMs,
    disableExpandOnHover,
    children
  } = props;
  const classes = useStyles$k({ sidebarConfig });
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"), { noSsr: true });
  const [state, setState] = useState(0 /* Closed */);
  const hoverTimerRef = useRef();
  const { isPinned, toggleSidebarPinState } = useSidebarPinState();
  const handleOpen = () => {
    if (isPinned || disableExpandOnHover) {
      return;
    }
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = void 0;
    }
    if (state !== 2 /* Open */ && !isSmallScreen) {
      hoverTimerRef.current = window.setTimeout(() => {
        hoverTimerRef.current = void 0;
        setState(2 /* Open */);
      }, openDelayMs);
      setState(1 /* Idle */);
    }
  };
  const handleClose = () => {
    if (isPinned || disableExpandOnHover) {
      return;
    }
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = void 0;
    }
    if (state === 1 /* Idle */) {
      setState(0 /* Closed */);
    } else if (state === 2 /* Open */) {
      hoverTimerRef.current = window.setTimeout(() => {
        hoverTimerRef.current = void 0;
        setState(0 /* Closed */);
      }, closeDelayMs);
    }
  };
  const isOpen = state === 2 /* Open */ && !isSmallScreen || isPinned;
  const setOpen = (open) => {
    if (open) {
      setState(2 /* Open */);
      toggleSidebarPinState();
    } else {
      setState(0 /* Closed */);
      toggleSidebarPinState();
    }
  };
  return /* @__PURE__ */ React.createElement("nav", {
    style: {},
    "aria-label": "sidebar nav"
  }, /* @__PURE__ */ React.createElement(A11ySkipSidebar, null), /* @__PURE__ */ React.createElement(SidebarOpenStateProvider, {
    value: { isOpen, setOpen }
  }, /* @__PURE__ */ React.createElement("div", {
    className: classes.root,
    "data-testid": "sidebar-root",
    onMouseEnter: disableExpandOnHover ? () => {
    } : handleOpen,
    onFocus: disableExpandOnHover ? () => {
    } : handleOpen,
    onMouseLeave: disableExpandOnHover ? () => {
    } : handleClose,
    onBlur: disableExpandOnHover ? () => {
    } : handleClose
  }, /* @__PURE__ */ React.createElement("div", {
    className: classNames(classes.drawer, {
      [classes.drawerOpen]: isOpen
    })
  }, children))));
};
const Sidebar = (props) => {
  var _a, _b;
  const sidebarConfig = makeSidebarConfig((_a = props.sidebarOptions) != null ? _a : {});
  const submenuConfig = makeSidebarSubmenuConfig((_b = props.submenuOptions) != null ? _b : {});
  const { children, disableExpandOnHover, openDelayMs, closeDelayMs } = props;
  const { isMobile } = useSidebarPinState();
  return isMobile ? /* @__PURE__ */ React.createElement(MobileSidebar, null, children) : /* @__PURE__ */ React.createElement(SidebarConfigContext.Provider, {
    value: { sidebarConfig, submenuConfig }
  }, /* @__PURE__ */ React.createElement(DesktopSidebar, {
    openDelayMs,
    closeDelayMs,
    disableExpandOnHover
  }, children));
};
function A11ySkipSidebar() {
  const { sidebarConfig } = useContext(SidebarConfigContext);
  const { focusContent, contentRef } = useContent();
  const classes = useStyles$k({ sidebarConfig });
  if (!(contentRef == null ? void 0 : contentRef.current)) {
    return null;
  }
  return /* @__PURE__ */ React.createElement(Button$1, {
    onClick: focusContent,
    variant: "contained",
    className: classNames(classes.visuallyHidden)
  }, "Skip to content");
}

function isLocationMatch(currentLocation, toLocation) {
  const toDecodedSearch = new URLSearchParams(toLocation.search).toString();
  const toQueryParameters = qs.parse(toDecodedSearch);
  const currentDecodedSearch = new URLSearchParams(currentLocation.search).toString();
  const currentQueryParameters = qs.parse(currentDecodedSearch);
  const matching = isEqual(toLocation.pathname, currentLocation.pathname) && isMatch(currentQueryParameters, toQueryParameters);
  return matching;
}

const useStyles$j = makeStyles((theme) => ({
  item: {
    height: 48,
    width: "100%",
    "&:hover": {
      background: "#6f6f6f",
      color: theme.palette.navigation.selectedColor
    },
    display: "flex",
    alignItems: "center",
    color: theme.palette.navigation.color,
    padding: 20,
    cursor: "pointer",
    position: "relative",
    background: "none",
    border: "none"
  },
  itemContainer: {
    width: "100%"
  },
  selected: {
    background: "#6f6f6f",
    color: "#FFF"
  },
  label: {
    margin: 14,
    marginLeft: 7,
    fontSize: 14,
    whiteSpace: "nowrap",
    overflow: "hidden",
    "text-overflow": "ellipsis"
  },
  dropdownArrow: {
    position: "absolute",
    right: 21
  },
  dropdown: {
    display: "flex",
    flexDirection: "column",
    alignItems: "end"
  },
  dropdownItem: {
    width: "100%",
    padding: "10px 0 10px 0",
    "&:hover": {
      background: "#6f6f6f",
      color: theme.palette.navigation.selectedColor
    }
  },
  textContent: {
    color: theme.palette.navigation.color,
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(1),
    fontSize: "14px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    "text-overflow": "ellipsis"
  }
}), { name: "BackstageSidebarSubmenuItem" });
const SidebarSubmenuItem = (props) => {
  const { title, to, icon: Icon, dropdownItems } = props;
  const classes = useStyles$j();
  const { setIsHoveredOn } = useContext(SidebarItemWithSubmenuContext);
  const closeSubmenu = () => {
    setIsHoveredOn(false);
  };
  const toLocation = useResolvedPath(to != null ? to : "");
  const currentLocation = useLocation();
  let isActive = isLocationMatch(currentLocation, toLocation);
  const [showDropDown, setShowDropDown] = useState(false);
  const handleClickDropdown = () => {
    setShowDropDown(!showDropDown);
  };
  if (dropdownItems !== void 0) {
    dropdownItems.some((item) => {
      const resolvedPath = resolvePath(item.to);
      isActive = isLocationMatch(currentLocation, resolvedPath);
      return isActive;
    });
    return /* @__PURE__ */ React.createElement("div", {
      className: classes.itemContainer
    }, /* @__PURE__ */ React.createElement(Tooltip, {
      title,
      enterDelay: 500,
      enterNextDelay: 500
    }, /* @__PURE__ */ React.createElement("button", {
      onClick: handleClickDropdown,
      onTouchStart: (e) => e.stopPropagation(),
      className: classNames(classes.item, isActive ? classes.selected : void 0)
    }, Icon && /* @__PURE__ */ React.createElement(Icon, {
      fontSize: "small"
    }), /* @__PURE__ */ React.createElement(Typography, {
      variant: "subtitle1",
      className: classes.label
    }, title), showDropDown ? /* @__PURE__ */ React.createElement(ArrowDropUpIcon, {
      className: classes.dropdownArrow
    }) : /* @__PURE__ */ React.createElement(ArrowDropDownIcon, {
      className: classes.dropdownArrow
    }))), dropdownItems && showDropDown && /* @__PURE__ */ React.createElement("div", {
      className: classes.dropdown
    }, dropdownItems.map((object, key) => /* @__PURE__ */ React.createElement(Tooltip, {
      key,
      title: object.title,
      enterDelay: 500,
      enterNextDelay: 500
    }, /* @__PURE__ */ React.createElement(Link, {
      to: object.to,
      underline: "none",
      className: classes.dropdownItem,
      onClick: closeSubmenu,
      onTouchStart: (e) => e.stopPropagation()
    }, /* @__PURE__ */ React.createElement(Typography, {
      className: classes.textContent
    }, object.title))))));
  }
  return /* @__PURE__ */ React.createElement("div", {
    className: classes.itemContainer
  }, /* @__PURE__ */ React.createElement(Tooltip, {
    title,
    enterDelay: 500,
    enterNextDelay: 500
  }, /* @__PURE__ */ React.createElement(Link, {
    to,
    underline: "none",
    className: classNames(classes.item, isActive ? classes.selected : void 0),
    onClick: closeSubmenu,
    onTouchStart: (e) => e.stopPropagation()
  }, Icon && /* @__PURE__ */ React.createElement(Icon, {
    fontSize: "small"
  }), /* @__PURE__ */ React.createElement(Typography, {
    variant: "subtitle1",
    className: classes.label
  }, title))));
};

const useStyles$i = makeStyles((theme) => ({
  root: {
    zIndex: 1e3,
    position: "relative",
    overflow: "visible",
    width: theme.spacing(7) + 1
  },
  drawer: (props) => {
    var _a, _b;
    return {
      display: "flex",
      flexFlow: "column nowrap",
      alignItems: "flex-start",
      position: "fixed",
      [theme.breakpoints.up("sm")]: {
        marginLeft: props.left,
        transition: theme.transitions.create("margin-left", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.shortest
        })
      },
      top: 0,
      bottom: 0,
      padding: 0,
      background: (_b = (_a = theme.palette.navigation.submenu) == null ? void 0 : _a.background) != null ? _b : "#404040",
      overflowX: "hidden",
      msOverflowStyle: "none",
      scrollbarWidth: "none",
      cursor: "default",
      width: props.submenuConfig.drawerWidthClosed,
      transitionDelay: `${props.submenuConfig.defaultOpenDelayMs}ms`,
      "& > *": {
        flexShrink: 0
      },
      "&::-webkit-scrollbar": {
        display: "none"
      }
    };
  },
  drawerOpen: (props) => ({
    width: props.submenuConfig.drawerWidthOpen,
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      position: "relative",
      paddingLeft: theme.spacing(3),
      left: 0,
      top: 0
    }
  }),
  title: {
    fontSize: 24,
    fontWeight: 500,
    color: "#FFF",
    padding: 20,
    [theme.breakpoints.down("xs")]: {
      display: "none"
    }
  }
}), { name: "BackstageSidebarSubmenu" });
const SidebarSubmenu = (props) => {
  const { isOpen } = useSidebarOpenState();
  const { sidebarConfig, submenuConfig } = useContext(SidebarConfigContext);
  const left = isOpen ? sidebarConfig.drawerWidthOpen : sidebarConfig.drawerWidthClosed;
  const classes = useStyles$i({ left, submenuConfig });
  const { isHoveredOn } = useContext(SidebarItemWithSubmenuContext);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  useEffect(() => {
    setIsSubmenuOpen(isHoveredOn);
  }, [isHoveredOn]);
  return /* @__PURE__ */ React.createElement("div", {
    className: classNames(classes.drawer, {
      [classes.drawerOpen]: isSubmenuOpen
    })
  }, /* @__PURE__ */ React.createElement(Typography, {
    variant: "h5",
    className: classes.title
  }, props.title), props.children);
};

const useStyles$h = makeStyles({
  iconContainer: {
    display: "flex",
    position: "relative",
    width: "100%"
  },
  arrow1: {
    right: "6px",
    position: "absolute"
  }
});
const DoubleArrowLeft = () => {
  const classes = useStyles$h();
  return /* @__PURE__ */ React.createElement("div", {
    className: classes.iconContainer
  }, /* @__PURE__ */ React.createElement("div", {
    className: classes.arrow1
  }, /* @__PURE__ */ React.createElement(ArrowBackIosIcon, {
    style: { fontSize: "12px" }
  })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(ArrowBackIosIcon, {
    style: { fontSize: "12px" }
  })));
};

const useStyles$g = makeStyles({
  iconContainer: {
    display: "flex",
    position: "relative",
    width: "100%"
  },
  arrow1: {
    right: "6px",
    position: "absolute"
  }
});
const DoubleArrowRight = () => {
  const classes = useStyles$g();
  return /* @__PURE__ */ React.createElement("div", {
    className: classes.iconContainer
  }, /* @__PURE__ */ React.createElement("div", {
    className: classes.arrow1
  }, /* @__PURE__ */ React.createElement(ArrowForwardIosIcon, {
    style: { fontSize: "12px" }
  })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(ArrowForwardIosIcon, {
    style: { fontSize: "12px" }
  })));
};

const makeSidebarStyles = (sidebarConfig) => makeStyles((theme) => {
  var _a, _b, _c, _d;
  return {
    root: {
      color: theme.palette.navigation.color,
      display: "flex",
      flexFlow: "row nowrap",
      alignItems: "center",
      height: 48,
      cursor: "pointer"
    },
    buttonItem: {
      background: "none",
      border: "none",
      width: "100%",
      margin: 0,
      padding: 0,
      textAlign: "inherit",
      font: "inherit"
    },
    closed: {
      width: sidebarConfig.drawerWidthClosed,
      justifyContent: "center"
    },
    open: {
      [theme.breakpoints.up("sm")]: {
        width: sidebarConfig.drawerWidthOpen
      }
    },
    highlightable: {
      "&:hover": {
        background: (_b = (_a = theme.palette.navigation.navItem) == null ? void 0 : _a.hoverBackground) != null ? _b : "#404040"
      }
    },
    highlighted: {
      background: (_d = (_c = theme.palette.navigation.navItem) == null ? void 0 : _c.hoverBackground) != null ? _d : "#404040"
    },
    label: {
      fontWeight: "bold",
      whiteSpace: "nowrap",
      lineHeight: "auto",
      flex: "3 1 auto",
      width: "110px",
      overflow: "hidden",
      "text-overflow": "ellipsis"
    },
    iconContainer: {
      boxSizing: "border-box",
      height: "100%",
      width: sidebarConfig.iconContainerWidth,
      marginRight: -theme.spacing(2),
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    searchRoot: {
      marginBottom: 12
    },
    searchField: {
      color: "#b5b5b5",
      fontWeight: "bold",
      fontSize: theme.typography.fontSize
    },
    searchFieldHTMLInput: {
      padding: theme.spacing(2, 0, 2)
    },
    searchContainer: {
      width: sidebarConfig.drawerWidthOpen - sidebarConfig.iconContainerWidth
    },
    secondaryAction: {
      width: theme.spacing(6),
      textAlign: "center",
      marginRight: theme.spacing(1)
    },
    closedItemIcon: {
      width: "100%",
      justifyContent: "center"
    },
    submenuArrow: {
      display: "flex"
    },
    expandButton: {
      background: "none",
      border: "none",
      color: theme.palette.navigation.color,
      width: "100%",
      cursor: "pointer",
      position: "relative",
      height: 48
    },
    arrows: {
      position: "absolute",
      right: 10
    },
    selected: {
      "&$root": {
        borderLeft: `solid ${sidebarConfig.selectedIndicatorWidth}px ${theme.palette.navigation.indicator}`,
        color: theme.palette.navigation.selectedColor
      },
      "&$closed": {
        width: sidebarConfig.drawerWidthClosed
      },
      "& $closedItemIcon": {
        paddingRight: sidebarConfig.selectedIndicatorWidth
      },
      "& $iconContainer": {
        marginLeft: -sidebarConfig.selectedIndicatorWidth
      }
    }
  };
}, { name: "BackstageSidebarItem" });
function useMemoStyles(sidebarConfig) {
  const useStyles = useMemo(() => makeSidebarStyles(sidebarConfig), [sidebarConfig]);
  return useStyles();
}
const useLocationMatch = (submenu, location) => useElementFilter(submenu.props.children, (elements) => {
  let active = false;
  elements.getElements().forEach(({
    props: { to, dropdownItems }
  }) => {
    if (!active) {
      if (dropdownItems == null ? void 0 : dropdownItems.length) {
        dropdownItems.forEach(({ to: _to }) => active = active || isLocationMatch(location, resolvePath(_to)));
        return;
      }
      if (to) {
        active = isLocationMatch(location, resolvePath(to));
      }
    }
  });
  return active;
}, [location.pathname]);
function isButtonItem(props) {
  return props.to === void 0;
}
const sidebarSubmenuType = React.createElement(SidebarSubmenu).type;
const WorkaroundNavLink = React.forwardRef(function WorkaroundNavLinkWithRef({
  to,
  end,
  style,
  className,
  activeStyle,
  caseSensitive,
  activeClassName = "active",
  "aria-current": ariaCurrentProp = "page",
  ...rest
}, ref) {
  let { pathname: locationPathname } = useLocation();
  let { pathname: toPathname } = useResolvedPath(to);
  if (!caseSensitive) {
    locationPathname = locationPathname.toLocaleLowerCase("en-US");
    toPathname = toPathname.toLocaleLowerCase("en-US");
  }
  let isActive = locationPathname === toPathname;
  if (!isActive && !end) {
    isActive = locationPathname.startsWith(`${toPathname}/`);
  }
  const ariaCurrent = isActive ? ariaCurrentProp : void 0;
  return /* @__PURE__ */ React.createElement(Link$2, {
    ...rest,
    to,
    ref,
    "aria-current": ariaCurrent,
    style: { ...style, ...isActive ? activeStyle : void 0 },
    className: classNames([
      className,
      isActive ? activeClassName : void 0
    ])
  });
});
const SidebarItemBase = forwardRef((props, ref) => {
  const {
    icon: Icon,
    text,
    hasNotifications = false,
    hasSubmenu = false,
    disableHighlight = false,
    onClick,
    children,
    className,
    ...navLinkProps
  } = props;
  const { sidebarConfig } = useContext(SidebarConfigContext);
  const classes = useMemoStyles(sidebarConfig);
  const { isOpen } = useSidebarOpenState();
  const divStyle = !isOpen && hasSubmenu ? { display: "flex", marginLeft: "24px" } : {};
  const displayItemIcon = /* @__PURE__ */ React.createElement("div", {
    style: divStyle
  }, /* @__PURE__ */ React.createElement(Icon, {
    fontSize: "small"
  }), !isOpen && hasSubmenu ? /* @__PURE__ */ React.createElement(ArrowRightIcon, null) : /* @__PURE__ */ React.createElement(React.Fragment, null));
  const itemIcon = /* @__PURE__ */ React.createElement(Badge, {
    color: "secondary",
    variant: "dot",
    overlap: "circular",
    invisible: !hasNotifications,
    className: classNames({ [classes.closedItemIcon]: !isOpen })
  }, displayItemIcon);
  const openContent = /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", {
    "data-testid": "login-button",
    className: classes.iconContainer
  }, itemIcon), text && /* @__PURE__ */ React.createElement(Typography, {
    variant: "subtitle2",
    className: classes.label
  }, text), /* @__PURE__ */ React.createElement("div", {
    className: classes.secondaryAction
  }, children));
  const content = isOpen ? openContent : itemIcon;
  const childProps = {
    onClick,
    className: classNames(className, classes.root, isOpen ? classes.open : classes.closed, isButtonItem(props) && classes.buttonItem, { [classes.highlightable]: !disableHighlight })
  };
  if (isButtonItem(props)) {
    return /* @__PURE__ */ React.createElement("button", {
      "aria-label": text,
      ...childProps,
      ref
    }, content);
  }
  return /* @__PURE__ */ React.createElement(WorkaroundNavLink, {
    ...childProps,
    activeClassName: classes.selected,
    to: props.to ? props.to : "",
    ref,
    "aria-label": text ? text : props.to,
    ...navLinkProps
  }, content);
});
const SidebarItemWithSubmenu = ({
  children,
  ...props
}) => {
  const { sidebarConfig } = useContext(SidebarConfigContext);
  const classes = useMemoStyles(sidebarConfig);
  const [isHoveredOn, setIsHoveredOn] = useState(false);
  const location = useLocation();
  const isActive = useLocationMatch(children, location);
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const handleMouseEnter = () => {
    setIsHoveredOn(true);
  };
  const handleMouseLeave = () => {
    setIsHoveredOn(false);
  };
  const arrowIcon = () => {
    if (isSmallScreen) {
      return isHoveredOn ? /* @__PURE__ */ React.createElement(ArrowDropUpIcon, {
        fontSize: "small",
        className: classes.submenuArrow
      }) : /* @__PURE__ */ React.createElement(ArrowDropDownIcon, {
        fontSize: "small",
        className: classes.submenuArrow
      });
    }
    return !isHoveredOn && /* @__PURE__ */ React.createElement(ArrowRightIcon, {
      fontSize: "small",
      className: classes.submenuArrow
    });
  };
  return /* @__PURE__ */ React.createElement(SidebarItemWithSubmenuContext.Provider, {
    value: {
      isHoveredOn,
      setIsHoveredOn
    }
  }, /* @__PURE__ */ React.createElement("div", {
    "data-testid": "item-with-submenu",
    onMouseLeave: handleMouseLeave,
    onTouchStart: isHoveredOn ? handleMouseLeave : handleMouseEnter,
    onMouseEnter: handleMouseEnter,
    className: classNames(isHoveredOn && classes.highlighted)
  }, /* @__PURE__ */ React.createElement(SidebarItemBase, {
    hasSubmenu: true,
    className: isActive ? classes.selected : "",
    ...props
  }, arrowIcon()), isHoveredOn && children));
};
const SidebarItem = forwardRef((props, ref) => {
  const [submenu] = useElementFilter(props.children, (elements) => elements.getElements().filter((child) => child.type === sidebarSubmenuType));
  if (submenu) {
    return /* @__PURE__ */ React.createElement(SidebarItemWithSubmenu, {
      ...props
    }, submenu);
  }
  return /* @__PURE__ */ React.createElement(SidebarItemBase, {
    ...props,
    ref
  });
});
function SidebarSearchField(props) {
  const { sidebarConfig } = useContext(SidebarConfigContext);
  const [input, setInput] = useState("");
  const classes = useMemoStyles(sidebarConfig);
  const Icon = props.icon ? props.icon : SearchIcon;
  const search = () => {
    props.onSearch(input);
    setInput("");
  };
  const handleEnter = (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      search();
    }
  };
  const handleInput = (ev) => {
    setInput(ev.target.value);
  };
  const handleInputClick = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
  };
  const handleItemClick = (ev) => {
    search();
    ev.preventDefault();
  };
  return /* @__PURE__ */ React.createElement("div", {
    className: classes.searchRoot
  }, /* @__PURE__ */ React.createElement(SidebarItem, {
    icon: Icon,
    to: props.to,
    onClick: handleItemClick,
    disableHighlight: true
  }, /* @__PURE__ */ React.createElement(TextField, {
    placeholder: "Search",
    value: input,
    onClick: handleInputClick,
    onChange: handleInput,
    onKeyDown: handleEnter,
    className: classes.searchContainer,
    InputProps: {
      disableUnderline: true,
      className: classes.searchField
    },
    inputProps: {
      className: classes.searchFieldHTMLInput
    }
  })));
}
const SidebarSpace = styled("div")({
  flex: 1
}, { name: "BackstageSidebarSpace" });
const SidebarSpacer = styled("div")({
  height: 8
}, { name: "BackstageSidebarSpacer" });
const SidebarDivider = styled("hr")({
  height: 1,
  width: "100%",
  background: "#383838",
  border: "none",
  margin: "12px 0px"
}, { name: "BackstageSidebarDivider" });
const styledScrollbar = (theme) => ({
  overflowY: "auto",
  "&::-webkit-scrollbar": {
    backgroundColor: theme.palette.background.default,
    width: "5px",
    borderRadius: "5px"
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: theme.palette.text.hint,
    borderRadius: "5px"
  }
});
const SidebarScrollWrapper = styled("div")(({ theme }) => {
  const scrollbarStyles = styledScrollbar(theme);
  return {
    flex: "0 1 auto",
    overflowX: "hidden",
    width: "calc(100% - 5px)",
    minHeight: "48px",
    overflowY: "hidden",
    "@media (hover: none)": scrollbarStyles,
    "&:hover": scrollbarStyles
  };
});
const SidebarExpandButton = () => {
  const { sidebarConfig } = useContext(SidebarConfigContext);
  const classes = useMemoStyles(sidebarConfig);
  const { isOpen, setOpen } = useSidebarOpenState();
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"), { noSsr: true });
  if (isSmallScreen) {
    return null;
  }
  const handleClick = () => {
    setOpen(!isOpen);
  };
  return /* @__PURE__ */ React.createElement("button", {
    onClick: handleClick,
    className: classes.expandButton,
    "aria-label": "Expand Sidebar",
    "data-testid": "sidebar-expand-button"
  }, /* @__PURE__ */ React.createElement("div", {
    className: classes.arrows
  }, isOpen ? /* @__PURE__ */ React.createElement(DoubleArrowLeft, null) : /* @__PURE__ */ React.createElement(DoubleArrowRight, null)));
};

const useStyles$f = makeStyles((theme) => ({
  introCard: (props) => ({
    color: "#b5b5b5",
    fontSize: 12,
    width: props.sidebarConfig.drawerWidthOpen,
    marginTop: 18,
    marginBottom: 12,
    paddingLeft: props.sidebarConfig.iconPadding,
    paddingRight: props.sidebarConfig.iconPadding
  }),
  introDismiss: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 12
  },
  introDismissLink: {
    color: "#dddddd",
    display: "flex",
    alignItems: "center",
    marginBottom: 4,
    "&:hover": {
      color: theme.palette.linkHover,
      transition: theme.transitions.create("color", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.shortest
      })
    }
  },
  introDismissText: {
    fontSize: "0.7rem",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1
  },
  introDismissIcon: {
    width: 18,
    height: 18,
    marginRight: 12
  }
}), { name: "BackstageSidebarIntro" });
function IntroCard(props) {
  const { sidebarConfig } = useContext(SidebarConfigContext);
  const classes = useStyles$f({ sidebarConfig });
  const { text, onClose } = props;
  const handleClose = () => onClose();
  return /* @__PURE__ */ React.createElement("div", {
    className: classes.introCard
  }, /* @__PURE__ */ React.createElement(Typography, {
    variant: "subtitle2"
  }, text), /* @__PURE__ */ React.createElement("div", {
    className: classes.introDismiss
  }, /* @__PURE__ */ React.createElement(Link$1, {
    component: "button",
    onClick: handleClose,
    underline: "none",
    className: classes.introDismissLink
  }, /* @__PURE__ */ React.createElement(CloseIcon, {
    className: classes.introDismissIcon
  }), /* @__PURE__ */ React.createElement(Typography, {
    component: "span",
    className: classes.introDismissText
  }, "Dismiss"))));
}
const SidebarIntroCard = (props) => {
  const { text, onDismiss } = props;
  const [collapsing, setCollapsing] = useState(false);
  const startDismissing = () => {
    setCollapsing(true);
  };
  return /* @__PURE__ */ React.createElement(Collapse, {
    in: !collapsing,
    onExited: onDismiss
  }, /* @__PURE__ */ React.createElement(IntroCard, {
    text,
    onClose: startDismissing
  }));
};
const starredIntroText = `Fun fact! As you explore all the awesome plugins in Backstage, you can actually pin them to this side nav.
Keep an eye out for the little star icon (\u2B50) next to the plugin name and give it a click!`;
const recentlyViewedIntroText = "And your recently viewed plugins will pop up here!";
function SidebarIntro(_props) {
  const { isOpen } = useSidebarOpenState();
  const defaultValue = {
    starredItemsDismissed: false,
    recentlyViewedItemsDismissed: false
  };
  const [dismissedIntro, setDismissedIntro] = useLocalStorageValue(SIDEBAR_INTRO_LOCAL_STORAGE);
  const { starredItemsDismissed, recentlyViewedItemsDismissed } = dismissedIntro != null ? dismissedIntro : {};
  const dismissStarred = () => {
    setDismissedIntro((state) => ({
      ...defaultValue,
      ...state,
      starredItemsDismissed: true
    }));
  };
  const dismissRecentlyViewed = () => {
    setDismissedIntro((state) => ({
      ...defaultValue,
      ...state,
      recentlyViewedItemsDismissed: true
    }));
  };
  if (!isOpen) {
    return null;
  }
  return /* @__PURE__ */ React.createElement(React.Fragment, null, !starredItemsDismissed && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(SidebarIntroCard, {
    text: starredIntroText,
    onDismiss: dismissStarred
  }), /* @__PURE__ */ React.createElement(SidebarDivider, null)), !recentlyViewedItemsDismissed && /* @__PURE__ */ React.createElement(SidebarIntroCard, {
    text: recentlyViewedIntroText,
    onDismiss: dismissRecentlyViewed
  }));
}

const useStyles$e = makeStyles((theme) => ({
  root: {
    gridArea: "pageContent",
    minWidth: 0,
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3)
    }
  },
  stretch: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1
  },
  noPadding: {
    padding: 0
  }
}), { name: "BackstageContent" });
function Content(props) {
  const { className, stretch, noPadding, children, ...restProps } = props;
  const { contentRef } = useContent();
  const classes = useStyles$e();
  return /* @__PURE__ */ React.createElement("article", {
    ref: contentRef,
    tabIndex: -1,
    ...restProps,
    className: classNames(classes.root, className, {
      [classes.stretch]: stretch,
      [classes.noPadding]: noPadding
    })
  }, children);
}

const useStyles$d = makeStyles((theme) => ({
  tabsWrapper: {
    gridArea: "pageSubheader",
    backgroundColor: theme.palette.background.paper,
    paddingLeft: theme.spacing(3),
    minWidth: 0
  },
  defaultTab: {
    padding: theme.spacing(3, 3),
    ...theme.typography.caption,
    textTransform: "uppercase",
    fontWeight: "bold",
    color: theme.palette.text.secondary
  },
  selected: {
    color: theme.palette.text.primary
  },
  tabRoot: {
    "&:hover": {
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary
    }
  }
}), { name: "BackstageHeaderTabs" });
function HeaderTabs(props) {
  const { tabs, onChange, selectedIndex } = props;
  const [selectedTab, setSelectedTab] = useState(selectedIndex != null ? selectedIndex : 0);
  const styles = useStyles$d();
  const handleChange = (_, index) => {
    if (selectedIndex === void 0) {
      setSelectedTab(index);
    }
    if (onChange)
      onChange(index);
  };
  useEffect(() => {
    if (selectedIndex !== void 0) {
      setSelectedTab(selectedIndex);
    }
  }, [selectedIndex]);
  return /* @__PURE__ */ React.createElement("div", {
    className: styles.tabsWrapper
  }, /* @__PURE__ */ React.createElement(Tabs$1, {
    selectionFollowsFocus: true,
    indicatorColor: "primary",
    textColor: "inherit",
    variant: "scrollable",
    scrollButtons: "auto",
    "aria-label": "scrollable auto tabs example",
    onChange: handleChange,
    value: selectedTab
  }, tabs.map((tab, index) => /* @__PURE__ */ React.createElement(Tab, {
    ...tab.tabProps,
    "data-testid": `header-tab-${index}`,
    label: tab.label,
    key: tab.id,
    value: index,
    className: styles.defaultTab,
    classes: { selected: styles.selected, root: styles.tabRoot }
  }))));
}

function useSelectedSubRoute(subRoutes) {
  var _a, _b, _c;
  const params = useParams();
  const routes = subRoutes.map(({ path, children }) => ({
    caseSensitive: false,
    path: `${path}/*`,
    element: children
  }));
  const sortedRoutes = routes.sort((a, b) => b.path.replace(/\/\*$/, "").localeCompare(a.path.replace(/\/\*$/, "")));
  const element = (_a = useRoutes(sortedRoutes)) != null ? _a : subRoutes[0].children;
  const [matchedRoute] = (_b = matchRoutes(sortedRoutes, `/${params["*"]}`)) != null ? _b : [];
  const foundIndex = matchedRoute ? subRoutes.findIndex((t) => `${t.path}/*` === matchedRoute.route.path) : 0;
  return {
    index: foundIndex === -1 ? 0 : foundIndex,
    element,
    route: (_c = subRoutes[foundIndex]) != null ? _c : subRoutes[0]
  };
}
function RoutedTabs(props) {
  const { routes } = props;
  const navigate = useNavigate();
  const { index, route, element } = useSelectedSubRoute(routes);
  const headerTabs = useMemo(() => routes.map((t) => ({
    id: t.path,
    label: t.title,
    tabProps: t.tabProps
  })), [routes]);
  const onTabChange = (tabIndex) => navigate(routes[tabIndex].path.replace(/\/\*$/, "").replace(/^\//, ""));
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(HeaderTabs, {
    tabs: headerTabs,
    selectedIndex: index,
    onChange: onTabChange
  }), /* @__PURE__ */ React.createElement(Content, null, /* @__PURE__ */ React.createElement(Helmet, {
    title: route.title
  }), element));
}

const Route = () => null;
attachComponentData(Route, "core.gatherMountPoints", true);
function createSubRoutesFromChildren(childrenProps) {
  const routeType = (/* @__PURE__ */ React.createElement(Route, {
    path: "",
    title: ""
  }, /* @__PURE__ */ React.createElement("div", null))).type;
  return Children.toArray(childrenProps).flatMap((child) => {
    if (!isValidElement(child)) {
      return [];
    }
    if (child.type === Fragment) {
      return createSubRoutesFromChildren(child.props.children);
    }
    if (child.type !== routeType) {
      throw new Error("Child of TabbedLayout must be an TabbedLayout.Route");
    }
    const { path, title, children, tabProps } = child.props;
    return [{ path, title, children, tabProps }];
  });
}
function TabbedLayout(props) {
  const routes = createSubRoutesFromChildren(props.children);
  return /* @__PURE__ */ React.createElement(RoutedTabs, {
    routes
  });
}
TabbedLayout.Route = Route;

const useSubvalueCellStyles = makeStyles((theme) => ({
  value: {
    marginBottom: "6px"
  },
  subvalue: {
    color: theme.palette.textSubtle,
    fontWeight: "normal"
  }
}), { name: "BackstageSubvalueCell" });
function SubvalueCell(props) {
  const { value, subvalue } = props;
  const classes = useSubvalueCellStyles();
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", {
    className: classes.value
  }, value), /* @__PURE__ */ React.createElement("div", {
    className: classes.subvalue
  }, subvalue));
}

const useFilterStyles$1 = makeStyles((theme) => ({
  root: {
    height: "100%",
    width: "315px",
    display: "flex",
    flexDirection: "column",
    marginRight: theme.spacing(3)
  },
  value: {
    fontWeight: "bold",
    fontSize: 18
  },
  header: {
    display: "flex",
    alignItems: "center",
    height: "60px",
    justifyContent: "space-between",
    borderBottom: `1px solid ${theme.palette.grey[500]}`
  },
  filters: {
    display: "flex",
    flexDirection: "column",
    "& > *": {
      marginTop: theme.spacing(2)
    }
  }
}), { name: "BackstageTableFilters" });
const Filters = (props) => {
  var _a;
  const classes = useFilterStyles$1();
  const { onChangeFilters } = props;
  const [selectedFilters, setSelectedFilters] = useState({
    ...props.selectedFilters
  });
  const [reset, triggerReset] = useState(false);
  const handleClick = () => {
    setSelectedFilters({});
    triggerReset((el) => !el);
  };
  useEffect(() => {
    onChangeFilters(selectedFilters);
  }, [selectedFilters, onChangeFilters]);
  return /* @__PURE__ */ React.createElement("div", {
    className: classes.root
  }, /* @__PURE__ */ React.createElement("div", {
    className: classes.header
  }, /* @__PURE__ */ React.createElement("div", {
    className: classes.value
  }, "Filters"), /* @__PURE__ */ React.createElement(Button$1, {
    color: "primary",
    onClick: handleClick
  }, "Clear all")), /* @__PURE__ */ React.createElement("div", {
    className: classes.filters
  }, ((_a = props.filters) == null ? void 0 : _a.length) && props.filters.map((filter) => /* @__PURE__ */ React.createElement(SelectComponent, {
    triggerReset: reset,
    key: filter.element.label,
    ...filter.element,
    selected: selectedFilters[filter.element.label],
    onChange: (el) => setSelectedFilters({
      ...selectedFilters,
      [filter.element.label]: el
    })
  }))));
};

const tableIcons = {
  Add: forwardRef((props, ref) => /* @__PURE__ */ React.createElement(AddBox, {
    ...props,
    ref
  })),
  Check: forwardRef((props, ref) => /* @__PURE__ */ React.createElement(Check, {
    ...props,
    ref
  })),
  Clear: forwardRef((props, ref) => /* @__PURE__ */ React.createElement(Clear, {
    ...props,
    ref
  })),
  Delete: forwardRef((props, ref) => /* @__PURE__ */ React.createElement(DeleteOutline, {
    ...props,
    ref
  })),
  DetailPanel: forwardRef((props, ref) => /* @__PURE__ */ React.createElement(ChevronRight, {
    ...props,
    ref
  })),
  Edit: forwardRef((props, ref) => /* @__PURE__ */ React.createElement(Edit, {
    ...props,
    ref
  })),
  Export: forwardRef((props, ref) => /* @__PURE__ */ React.createElement(SaveAlt, {
    ...props,
    ref
  })),
  Filter: forwardRef((props, ref) => /* @__PURE__ */ React.createElement(FilterList, {
    ...props,
    ref
  })),
  FirstPage: forwardRef((props, ref) => /* @__PURE__ */ React.createElement(FirstPage, {
    ...props,
    ref
  })),
  LastPage: forwardRef((props, ref) => /* @__PURE__ */ React.createElement(LastPage, {
    ...props,
    ref
  })),
  NextPage: forwardRef((props, ref) => /* @__PURE__ */ React.createElement(ChevronRight, {
    ...props,
    ref
  })),
  PreviousPage: forwardRef((props, ref) => /* @__PURE__ */ React.createElement(ChevronLeftIcon, {
    ...props,
    ref
  })),
  ResetSearch: forwardRef((props, ref) => /* @__PURE__ */ React.createElement(Clear, {
    ...props,
    ref
  })),
  Search: forwardRef((props, ref) => /* @__PURE__ */ React.createElement(FilterList, {
    ...props,
    ref
  })),
  SortArrow: forwardRef((props, ref) => /* @__PURE__ */ React.createElement(ArrowUpward, {
    ...props,
    ref
  })),
  ThirdStateCheck: forwardRef((props, ref) => /* @__PURE__ */ React.createElement(Remove, {
    ...props,
    ref
  })),
  ViewColumn: forwardRef((props, ref) => /* @__PURE__ */ React.createElement(ViewColumn, {
    ...props,
    ref
  }))
};
function extractValueByField(data, field) {
  const path = field.split(".");
  let value = data[path[0]];
  for (let i = 1; i < path.length; ++i) {
    if (value === void 0) {
      return value;
    }
    const f = path[i];
    value = value[f];
  }
  return value;
}
const StyledMTableHeader = withStyles((theme) => ({
  header: {
    padding: theme.spacing(1, 2, 1, 2.5),
    borderTop: `1px solid ${theme.palette.grey.A100}`,
    borderBottom: `1px solid ${theme.palette.grey.A100}`,
    color: theme.palette.textSubtle,
    fontWeight: theme.typography.fontWeightBold,
    position: "static",
    wordBreak: "normal"
  }
}), { name: "BackstageTableHeader" })(MTableHeader);
const StyledMTableToolbar = withStyles((theme) => ({
  root: {
    padding: theme.spacing(3, 0, 2.5, 2.5)
  },
  title: {
    "& > h6": {
      fontWeight: "bold"
    }
  },
  searchField: {
    paddingRight: theme.spacing(2)
  }
}), { name: "BackstageTableToolbar" })(MTableToolbar);
const useFilterStyles = makeStyles(() => ({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    whiteSpace: "nowrap"
  }
}), { name: "BackstageTableFiltersContainer" });
const useTableStyles = makeStyles(() => ({
  root: {
    display: "flex",
    alignItems: "start"
  }
}), { name: "BackstageTable" });
function convertColumns(columns, theme) {
  return columns.map((column) => {
    const headerStyle = {};
    let cellStyle = column.cellStyle || {};
    if (column.highlight) {
      headerStyle.color = theme.palette.textContrast;
      if (typeof cellStyle === "object") {
        cellStyle.fontWeight = theme.typography.fontWeightBold;
      } else {
        const cellStyleFn = cellStyle;
        cellStyle = (data, rowData, rowColumn) => {
          const style = cellStyleFn(data, rowData, rowColumn);
          return { ...style, fontWeight: theme.typography.fontWeightBold };
        };
      }
    }
    return {
      ...column,
      headerStyle,
      cellStyle
    };
  });
}
function removeDefaultValues(state, defaultState) {
  return transform(state, (result, value, key) => {
    if (!isEqual(value, defaultState[key])) {
      result[key] = value;
    }
  });
}
const defaultInitialState = {
  search: "",
  filtersOpen: false,
  filters: {}
};
function TableToolbar(toolbarProps) {
  const {
    toolbarRef,
    setSearch,
    hasFilters,
    selectedFiltersLength,
    toggleFilters
  } = toolbarProps;
  const filtersClasses = useFilterStyles();
  const onSearchChanged = useCallback((searchText) => {
    toolbarProps.onSearchChanged(searchText);
    setSearch(searchText);
  }, [toolbarProps, setSearch]);
  if (hasFilters) {
    return /* @__PURE__ */ React.createElement("div", {
      className: filtersClasses.root
    }, /* @__PURE__ */ React.createElement("div", {
      className: filtersClasses.root
    }, /* @__PURE__ */ React.createElement(IconButton, {
      onClick: toggleFilters,
      "aria-label": "filter list"
    }, /* @__PURE__ */ React.createElement(FilterList, null)), /* @__PURE__ */ React.createElement(Typography, {
      className: filtersClasses.title
    }, "Filters (", selectedFiltersLength, ")")), /* @__PURE__ */ React.createElement(StyledMTableToolbar, {
      ...toolbarProps,
      ref: toolbarRef,
      onSearchChanged
    }));
  }
  return /* @__PURE__ */ React.createElement(StyledMTableToolbar, {
    ...toolbarProps,
    ref: toolbarRef,
    onSearchChanged
  });
}
function Table(props) {
  const {
    data,
    columns,
    options,
    title,
    subtitle,
    filters,
    initialState,
    emptyContent,
    onStateChange,
    ...restProps
  } = props;
  const tableClasses = useTableStyles();
  const theme = useTheme();
  const calculatedInitialState = { ...defaultInitialState, ...initialState };
  const [filtersOpen, setFiltersOpen] = useState(calculatedInitialState.filtersOpen);
  const toggleFilters = useCallback(() => setFiltersOpen((v) => !v), [setFiltersOpen]);
  const [selectedFiltersLength, setSelectedFiltersLength] = useState(0);
  const [tableData, setTableData] = useState(data);
  const [selectedFilters, setSelectedFilters] = useState(calculatedInitialState.filters);
  const MTColumns = convertColumns(columns, theme);
  const [search, setSearch] = useState(calculatedInitialState.search);
  useEffect(() => {
    if (onStateChange) {
      const state = removeDefaultValues({
        search,
        filtersOpen,
        filters: selectedFilters
      }, defaultInitialState);
      onStateChange(state);
    }
  }, [search, filtersOpen, selectedFilters, onStateChange]);
  const defaultOptions = {
    headerStyle: {
      textTransform: "uppercase"
    }
  };
  const getFieldByTitle = useCallback((titleValue) => {
    var _a;
    return (_a = columns.find((el) => el.title === titleValue)) == null ? void 0 : _a.field;
  }, [columns]);
  useEffect(() => {
    if (typeof data === "function") {
      return;
    }
    if (!selectedFilters) {
      setTableData(data);
      return;
    }
    const selectedFiltersArray = Object.values(selectedFilters);
    if (data && selectedFiltersArray.flat().length) {
      const newData = data.filter((el) => !!Object.entries(selectedFilters).filter(([, value]) => !!value.length).every(([key, filterValue]) => {
        const fieldValue = extractValueByField(el, getFieldByTitle(key));
        if (Array.isArray(fieldValue) && Array.isArray(filterValue)) {
          return fieldValue.some((v) => filterValue.includes(v));
        } else if (Array.isArray(fieldValue)) {
          return fieldValue.includes(filterValue);
        } else if (Array.isArray(filterValue)) {
          return filterValue.includes(fieldValue);
        }
        return fieldValue === filterValue;
      }));
      setTableData(newData);
    } else {
      setTableData(data);
    }
    setSelectedFiltersLength(selectedFiltersArray.flat().length);
  }, [data, selectedFilters, getFieldByTitle]);
  const constructFilters = (filterConfig, dataValue) => {
    const extractDistinctValues = (field) => {
      const distinctValues = /* @__PURE__ */ new Set();
      const addValue = (value) => {
        if (value !== void 0 && value !== null) {
          distinctValues.add(value);
        }
      };
      if (dataValue) {
        dataValue.forEach((el) => {
          const value = extractValueByField(el, getFieldByTitle(field));
          if (Array.isArray(value)) {
            value.forEach(addValue);
          } else {
            addValue(value);
          }
        });
      }
      return distinctValues;
    };
    const constructSelect = (filter) => {
      return {
        placeholder: "All results",
        label: filter.column,
        multiple: filter.type === "multiple-select",
        items: [...extractDistinctValues(filter.column)].sort().map((value) => ({
          label: value,
          value
        }))
      };
    };
    return filterConfig.map((filter) => ({
      type: filter.type,
      element: constructSelect(filter)
    }));
  };
  const hasFilters = !!(filters == null ? void 0 : filters.length);
  const Toolbar = useCallback((toolbarProps) => {
    return /* @__PURE__ */ React.createElement(TableToolbar, {
      setSearch,
      hasFilters,
      selectedFiltersLength,
      toggleFilters,
      ...toolbarProps
    });
  }, [toggleFilters, hasFilters, selectedFiltersLength, setSearch]);
  const hasNoRows = typeof data !== "function" && data.length === 0;
  const columnCount = columns.length;
  const Body = useCallback((bodyProps) => {
    if (emptyContent && hasNoRows) {
      return /* @__PURE__ */ React.createElement("tbody", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", {
        colSpan: columnCount
      }, emptyContent)));
    }
    return /* @__PURE__ */ React.createElement(MTableBody, {
      ...bodyProps
    });
  }, [hasNoRows, emptyContent, columnCount]);
  return /* @__PURE__ */ React.createElement("div", {
    className: tableClasses.root
  }, filtersOpen && data && typeof data !== "function" && (filters == null ? void 0 : filters.length) && /* @__PURE__ */ React.createElement(Filters, {
    filters: constructFilters(filters, data),
    selectedFilters,
    onChangeFilters: setSelectedFilters
  }), /* @__PURE__ */ React.createElement(MTable, {
    components: {
      Header: StyledMTableHeader,
      Toolbar,
      Body
    },
    options: { ...defaultOptions, ...options },
    columns: MTColumns,
    icons: tableIcons,
    title: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Typography, {
      variant: "h5",
      component: "h2"
    }, title), subtitle && /* @__PURE__ */ React.createElement(Typography, {
      color: "textSecondary",
      variant: "body1"
    }, subtitle)),
    data: typeof data === "function" ? data : tableData,
    style: { width: "100%" },
    localization: { toolbar: { searchPlaceholder: "Filter" } },
    ...restProps
  }));
}

function chunkArray(array, chunkSize) {
  if (chunkSize <= 0) {
    return [array];
  }
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return /* @__PURE__ */ React.createElement("div", {
    role: "tabpanel",
    hidden: value !== index,
    "aria-labelledby": `scrollable-auto-tab-${index}`,
    ...other
  }, value === index && /* @__PURE__ */ React.createElement(Box, {
    p: 3
  }, children));
};

const useStyles$c = makeStyles(() => ({
  root: {
    color: "#6E6E6E",
    overflow: "visible",
    fontSize: "1.5rem",
    textAlign: "center",
    borderRadius: "50%",
    backgroundColor: "#E6E6E6",
    marginLeft: (props) => props.isNext ? "auto" : "0",
    marginRight: (props) => props.isNext ? "0" : "10px",
    "&:hover": {
      backgroundColor: "#E6E6E6",
      opacity: "1"
    }
  }
}), { name: "BackstageTabIcon" });
const StyledIcon = (props) => {
  const classes = useStyles$c(props);
  const { ariaLabel, onClick } = props;
  return /* @__PURE__ */ React.createElement(IconButton, {
    onClick,
    className: classes.root,
    size: "small",
    disableRipple: true,
    disableFocusRipple: true,
    "aria-label": ariaLabel
  }, props.children);
};

const tabMarginLeft = (isFirstNav, isFirstIndex) => {
  if (isFirstIndex) {
    if (isFirstNav) {
      return "20px";
    }
    return "0";
  }
  return "40px";
};
const useStyles$b = makeStyles((theme) => ({
  root: {
    textTransform: "none",
    height: "64px",
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.pxToRem(13),
    color: theme.palette.textSubtle,
    marginLeft: (props) => tabMarginLeft(props.isFirstNav, props.isFirstIndex),
    width: "130px",
    minWidth: "130px",
    "&:hover": {
      outline: "none",
      backgroundColor: "transparent",
      color: theme.palette.textSubtle
    }
  }
}), { name: "BackstageTab" });
const StyledTab = (props) => {
  const classes = useStyles$b(props);
  const { isFirstNav, isFirstIndex, ...rest } = props;
  return /* @__PURE__ */ React.createElement(Tab, {
    classes,
    disableRipple: true,
    ...rest
  });
};

const useStyles$a = makeStyles((theme) => ({
  indicator: {
    display: "flex",
    justifyContent: "center",
    backgroundColor: theme.palette.tabbar.indicator,
    height: "4px"
  },
  flexContainer: {
    alignItems: "center"
  },
  root: {
    "&:last-child": {
      marginLeft: "auto"
    }
  }
}), { name: "BackstageTabBar" });
const StyledTabs = (props) => {
  const classes = useStyles$a(props);
  return /* @__PURE__ */ React.createElement(Tabs$1, {
    classes,
    ...props,
    TabIndicatorProps: { children: /* @__PURE__ */ React.createElement("span", null) }
  });
};

const useStyles$9 = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    width: "100%"
  },
  styledTabs: {
    backgroundColor: theme.palette.background.paper
  },
  appbar: {
    boxShadow: "none",
    backgroundColor: theme.palette.background.paper,
    paddingLeft: "10px",
    paddingRight: "10px"
  }
}), { name: "BackstageTabs" });
function Tabs(props) {
  const { tabs } = props;
  const classes = useStyles$9();
  const [value, setValue] = useState([0, 0]);
  const [navIndex, setNavIndex] = useState(0);
  const [numberOfChunkedElement, setNumberOfChunkedElement] = useState(0);
  const [chunkedTabs, setChunkedTabs] = useState([[]]);
  const wrapper = useRef();
  const { width } = useWindowSize();
  const handleChange = (_, newValue) => {
    setValue([navIndex, newValue]);
  };
  const navigateToPrevChunk = () => {
    setNavIndex(navIndex - 1);
  };
  const navigateToNextChunk = () => {
    setNavIndex(navIndex + 1);
  };
  const hasNextNavIndex = () => navIndex + 1 < chunkedTabs.length;
  useEffect(() => {
    const padding = 20;
    const numberOfTabIcons = navIndex === 0 ? 1 : 2;
    const wrapperWidth = wrapper.current.offsetWidth - padding - numberOfTabIcons * 30;
    const flattenIndex = value[0] * numberOfChunkedElement + value[1];
    const newChunkedElementSize = Math.floor(wrapperWidth / 170);
    setNumberOfChunkedElement(newChunkedElementSize);
    setChunkedTabs(chunkArray(tabs, newChunkedElementSize));
    setValue([
      Math.floor(flattenIndex / newChunkedElementSize),
      flattenIndex % newChunkedElementSize
    ]);
  }, [width, tabs]);
  const currentIndex = navIndex === value[0] ? value[1] : false;
  return /* @__PURE__ */ React.createElement("div", {
    className: classes.root
  }, /* @__PURE__ */ React.createElement(AppBar, {
    ref: wrapper,
    className: classes.appbar,
    position: "static"
  }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(StyledTabs, {
    value: currentIndex,
    onChange: handleChange,
    selectionFollowsFocus: true
  }, navIndex !== 0 && /* @__PURE__ */ React.createElement(StyledIcon, {
    onClick: navigateToPrevChunk,
    ariaLabel: "navigate-before"
  }, /* @__PURE__ */ React.createElement(NavigateBeforeIcon, null)), chunkedTabs[navIndex].map((tab, index) => /* @__PURE__ */ React.createElement(StyledTab, {
    value: index,
    isFirstIndex: index === 0,
    isFirstNav: navIndex === 0,
    key: index,
    icon: tab.icon || void 0,
    label: tab.label || void 0
  })), hasNextNavIndex() && /* @__PURE__ */ React.createElement(StyledIcon, {
    isNext: true,
    onClick: navigateToNextChunk,
    ariaLabel: "navigate-next"
  }, /* @__PURE__ */ React.createElement(NavigateNextIcon, null))))), currentIndex !== false ? chunkedTabs[navIndex].map((tab, index) => /* @__PURE__ */ React.createElement(TabPanel, {
    key: index,
    value: index,
    index: currentIndex
  }, tab.content)) : /* @__PURE__ */ React.createElement(TabPanel, {
    key: "panel_outside_chunked_array",
    value: value[1],
    index: value[1]
  }, chunkedTabs[value[0]][value[1]].content));
}

function color(data, theme) {
  const lastNum = data[data.length - 1];
  if (!lastNum)
    return void 0;
  if (lastNum >= 0.9)
    return theme.palette.status.ok;
  if (lastNum >= 0.5)
    return theme.palette.status.warning;
  return theme.palette.status.error;
}
function TrendLine(props) {
  var _a;
  const theme = useTheme();
  if (!props.data)
    return null;
  return /* @__PURE__ */ React.createElement(Sparklines, {
    width: 120,
    height: 30,
    min: 0,
    max: 1,
    ...props
  }, props.title && /* @__PURE__ */ React.createElement("title", null, props.title), /* @__PURE__ */ React.createElement(SparklinesLine, {
    color: (_a = props.color) != null ? _a : color(props.data, theme)
  }));
}

const useStyles$8 = (props) => makeStyles((theme) => ({
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    textAlign: props.textAlign
  },
  leftItemsBox: {
    flex: "1 1 auto",
    minWidth: 0,
    overflow: "visible"
  },
  rightItemsBox: {
    flex: "0 1 auto",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginLeft: theme.spacing(1),
    minWidth: 0,
    overflow: "visible"
  },
  description: {},
  title: {
    display: "inline-flex",
    marginBottom: 0
  }
}), { name: "BackstageContentHeader" });
const ContentHeaderTitle = ({
  title = "Unknown page",
  className
}) => /* @__PURE__ */ React.createElement(Typography, {
  variant: "h4",
  component: "h2",
  className,
  "data-testid": "header-title"
}, title);
function ContentHeader(props) {
  const {
    description,
    title,
    titleComponent: TitleComponent = void 0,
    children,
    textAlign = "left"
  } = props;
  const classes = useStyles$8({ textAlign })();
  const renderedTitle = TitleComponent ? TitleComponent : /* @__PURE__ */ React.createElement(ContentHeaderTitle, {
    title,
    className: classes.title
  });
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Helmet, {
    title
  }), /* @__PURE__ */ React.createElement("div", {
    className: classes.container
  }, /* @__PURE__ */ React.createElement("div", {
    className: classes.leftItemsBox
  }, renderedTitle, description && /* @__PURE__ */ React.createElement(Typography, {
    className: classes.description,
    variant: "body2"
  }, description)), /* @__PURE__ */ React.createElement("div", {
    className: classes.rightItemsBox
  }, children)));
}

const useStyles$7 = makeStyles((theme) => ({
  micDrop: {
    maxWidth: "60%",
    position: "absolute",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    [theme.breakpoints.down("xs")]: {
      maxWidth: "96%",
      position: "relative",
      bottom: "unset",
      right: "unset",
      margin: `${theme.spacing(10)}px auto ${theme.spacing(4)}px`
    }
  }
}), { name: "BackstageErrorPageMicDrop" });
const MicDrop = () => {
  const classes = useStyles$7();
  return /* @__PURE__ */ React.createElement("img", {
    src: MicDropSvgUrl,
    className: classes.micDrop,
    alt: "Girl dropping mic from her hands"
  });
};

const useStyles$6 = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(8),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2)
    }
  },
  title: {
    paddingBottom: theme.spacing(5),
    [theme.breakpoints.down("xs")]: {
      paddingBottom: theme.spacing(4),
      fontSize: 32
    }
  },
  subtitle: {
    color: theme.palette.textSubtle
  }
}), { name: "BackstageErrorPage" });
function ErrorPage(props) {
  const { status, statusMessage, additionalInfo, supportUrl } = props;
  const classes = useStyles$6();
  const navigate = useNavigate();
  const support = useSupportConfig();
  return /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    spacing: 0,
    className: classes.container
  }, /* @__PURE__ */ React.createElement(MicDrop, null), /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    xs: 12,
    sm: 8,
    md: 4
  }, /* @__PURE__ */ React.createElement(Typography, {
    "data-testid": "error",
    variant: "body1",
    className: classes.subtitle
  }, "ERROR ", status, ": ", statusMessage), /* @__PURE__ */ React.createElement(Typography, {
    variant: "body1",
    className: classes.subtitle
  }, additionalInfo), /* @__PURE__ */ React.createElement(Typography, {
    variant: "h2",
    className: classes.title
  }, "Looks like someone dropped the mic!"), /* @__PURE__ */ React.createElement(Typography, {
    variant: "h6"
  }, /* @__PURE__ */ React.createElement(Link, {
    to: "#",
    "data-testid": "go-back-link",
    onClick: () => navigate(-1)
  }, "Go back"), "... or please", " ", /* @__PURE__ */ React.createElement(Link, {
    to: supportUrl || support.url
  }, "contact support"), " if you think this is a bug.")));
}

const ClickableText = withStyles({
  root: {
    textDecoration: "underline",
    cursor: "pointer"
  }
}, { name: "BackstageBreadcrumbsClickableText" })(Typography);
const StyledBox = withStyles({
  root: {
    textDecoration: "underline",
    color: "inherit"
  }
}, { name: "BackstageBreadcrumbsStyledBox" })(Box);
function Breadcrumbs(props) {
  const { children, ...restProps } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const childrenArray = React.Children.toArray(children);
  const [firstPage, secondPage, ...expandablePages] = childrenArray;
  const currentPage = expandablePages.length ? expandablePages.pop() : childrenArray[childrenArray.length - 1];
  const hasHiddenBreadcrumbs = childrenArray.length > 3;
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  return /* @__PURE__ */ React.createElement(Fragment, null, /* @__PURE__ */ React.createElement(MaterialBreadcrumbs, {
    "aria-label": "breadcrumb",
    ...restProps
  }, childrenArray.length > 1 && /* @__PURE__ */ React.createElement(StyledBox, {
    clone: true
  }, firstPage), childrenArray.length > 2 && /* @__PURE__ */ React.createElement(StyledBox, {
    clone: true
  }, secondPage), hasHiddenBreadcrumbs && /* @__PURE__ */ React.createElement(ClickableText, {
    onClick: handleClick
  }, "..."), /* @__PURE__ */ React.createElement(Box, {
    style: { fontStyle: "italic" }
  }, currentPage)), /* @__PURE__ */ React.createElement(Popover, {
    open,
    anchorEl,
    onClose: handleClose,
    anchorOrigin: {
      vertical: "bottom",
      horizontal: "left"
    },
    transformOrigin: {
      vertical: "top",
      horizontal: "left"
    }
  }, /* @__PURE__ */ React.createElement(List, null, expandablePages.map((pageLink, index) => /* @__PURE__ */ React.createElement(ListItem, {
    key: index,
    button: true
  }, /* @__PURE__ */ React.createElement(StyledBox, {
    clone: true
  }, pageLink))))));
}

const useStyles$5 = makeStyles((theme) => ({
  header: {
    gridArea: "pageHeader",
    padding: theme.spacing(3),
    width: "100%",
    boxShadow: theme.shadows[4],
    position: "relative",
    zIndex: 100,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundImage: theme.page.backgroundImage,
    backgroundPosition: "center",
    backgroundSize: "cover",
    [theme.breakpoints.down("sm")]: {
      flexWrap: "wrap"
    }
  },
  leftItemsBox: {
    maxWidth: "100%",
    flexGrow: 1
  },
  rightItemsBox: {
    width: "auto"
  },
  title: {
    color: theme.palette.bursts.fontColor,
    wordBreak: "break-word",
    fontSize: theme.typography.h3.fontSize,
    marginBottom: 0
  },
  subtitle: {
    color: theme.palette.bursts.fontColor,
    opacity: 0.8,
    display: "inline-block",
    marginTop: theme.spacing(1),
    maxWidth: "75ch"
  },
  type: {
    textTransform: "uppercase",
    fontSize: 11,
    opacity: 0.8,
    marginBottom: theme.spacing(1),
    color: theme.palette.bursts.fontColor
  },
  breadcrumb: {
    color: theme.palette.bursts.fontColor
  },
  breadcrumbType: {
    fontSize: "inherit",
    opacity: 0.7,
    marginRight: -theme.spacing(0.3),
    marginBottom: theme.spacing(0.3)
  },
  breadcrumbTitle: {
    fontSize: "inherit",
    marginLeft: -theme.spacing(0.3),
    marginBottom: theme.spacing(0.3)
  }
}), { name: "BackstageHeader" });
const TypeFragment = ({
  type,
  typeLink,
  classes,
  pageTitle
}) => {
  if (!type) {
    return null;
  }
  if (!typeLink) {
    return /* @__PURE__ */ React.createElement(Typography, {
      className: classes.type
    }, type);
  }
  return /* @__PURE__ */ React.createElement(Breadcrumbs, {
    className: classes.breadcrumb
  }, /* @__PURE__ */ React.createElement(Link, {
    to: typeLink
  }, type), /* @__PURE__ */ React.createElement(Typography, null, pageTitle));
};
const TitleFragment = ({ pageTitle, classes, tooltip }) => {
  const FinalTitle = /* @__PURE__ */ React.createElement(Typography, {
    className: classes.title,
    variant: "h1"
  }, pageTitle);
  if (!tooltip) {
    return FinalTitle;
  }
  return /* @__PURE__ */ React.createElement(Tooltip, {
    title: tooltip,
    placement: "top-start"
  }, FinalTitle);
};
const SubtitleFragment = ({ classes, subtitle }) => {
  if (!subtitle) {
    return null;
  }
  if (typeof subtitle !== "string") {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, subtitle);
  }
  return /* @__PURE__ */ React.createElement(Typography, {
    className: classes.subtitle,
    variant: "subtitle2",
    component: "span"
  }, subtitle);
};
function Header(props) {
  const {
    children,
    pageTitleOverride,
    style,
    subtitle,
    title,
    tooltip,
    type,
    typeLink
  } = props;
  const classes = useStyles$5();
  const configApi = useApi(configApiRef);
  const appTitle = configApi.getOptionalString("app.title") || "Backstage";
  const documentTitle = pageTitleOverride || title;
  const pageTitle = title || pageTitleOverride;
  const titleTemplate = `${documentTitle} | %s | ${appTitle}`;
  const defaultTitle = `${documentTitle} | ${appTitle}`;
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Helmet, {
    titleTemplate,
    defaultTitle
  }), /* @__PURE__ */ React.createElement("header", {
    style,
    className: classes.header
  }, /* @__PURE__ */ React.createElement(Box, {
    className: classes.leftItemsBox
  }, /* @__PURE__ */ React.createElement(TypeFragment, {
    classes,
    type,
    typeLink,
    pageTitle
  }), /* @__PURE__ */ React.createElement(TitleFragment, {
    classes,
    pageTitle,
    tooltip
  }), /* @__PURE__ */ React.createElement(SubtitleFragment, {
    classes,
    subtitle
  })), /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    className: classes.rightItemsBox,
    spacing: 4
  }, children)));
}

const useStyles$4 = makeStyles((theme) => ({
  root: {
    textAlign: "left"
  },
  label: {
    color: theme.palette.common.white,
    fontWeight: "bold",
    letterSpacing: 0,
    fontSize: theme.typography.fontSize,
    marginBottom: theme.spacing(1) / 2,
    lineHeight: 1
  },
  value: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: theme.typography.fontSize,
    lineHeight: 1
  }
}), { name: "BackstageHeaderLabel" });
const HeaderLabelContent = ({ value, className }) => /* @__PURE__ */ React.createElement(Typography, {
  className
}, value);
function HeaderLabel(props) {
  const { label, value, url } = props;
  const classes = useStyles$4();
  const content = /* @__PURE__ */ React.createElement(HeaderLabelContent, {
    className: classes.value,
    value: value || "<Unknown>"
  });
  return /* @__PURE__ */ React.createElement(Grid, {
    item: true
  }, /* @__PURE__ */ React.createElement("span", {
    className: classes.root
  }, /* @__PURE__ */ React.createElement(Typography, {
    className: classes.label
  }, label), url ? /* @__PURE__ */ React.createElement(Link, {
    to: url
  }, content) : content));
}

const timeFormat = {
  hour: "2-digit",
  minute: "2-digit"
};
function getTimes(configApi) {
  const d = new Date();
  const lang = window.navigator.language;
  const clocks = [];
  if (!configApi.has("homepage.clocks")) {
    return clocks;
  }
  const clockConfigs = configApi.getConfigArray("homepage.clocks");
  for (const clock of clockConfigs) {
    if (clock.has("label") && clock.has("timezone")) {
      let label = clock.getString("label");
      const options = {
        timeZone: clock.getString("timezone"),
        ...timeFormat
      };
      try {
        new Date().toLocaleString(lang, options);
      } catch (e) {
        console.warn(`The timezone ${options.timeZone} is invalid. Defaulting to GMT`);
        options.timeZone = "GMT";
        label = "GMT";
      }
      const time = d.toLocaleTimeString(lang, options);
      clocks.push({ time, label });
    }
  }
  return clocks;
}
function HomepageTimer(_props) {
  const configApi = useApi(configApiRef);
  const defaultTimes = [];
  const [clocks, setTimes] = React.useState(defaultTimes);
  React.useEffect(() => {
    setTimes(getTimes(configApi));
    const intervalId = setInterval(() => {
      setTimes(getTimes(configApi));
    }, 1e3);
    return () => {
      clearInterval(intervalId);
    };
  }, [configApi]);
  if (clocks.length !== 0) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, clocks.map((clock) => /* @__PURE__ */ React.createElement(HeaderLabel, {
      label: clock.label,
      value: clock.time,
      key: clock.label
    })));
  }
  return null;
}

const styles$1 = (theme) => createStyles({
  root: {
    color: theme.palette.common.white,
    padding: theme.spacing(2, 2, 3),
    backgroundImage: theme.palette.bursts.gradient.linear,
    backgroundPosition: 0,
    backgroundSize: "inherit"
  }
});
const useStyles$3 = makeStyles(styles$1, { name: "BackstageItemCardHeader" });
function ItemCardHeader(props) {
  const { title, subtitle, children } = props;
  const classes = useStyles$3(props);
  return /* @__PURE__ */ React.createElement("div", {
    className: classes.root
  }, subtitle && /* @__PURE__ */ React.createElement(Typography, {
    variant: "subtitle2",
    component: "h3"
  }, subtitle), title && /* @__PURE__ */ React.createElement(Typography, {
    variant: "h6",
    component: "h4"
  }, title), children);
}

function ItemCard(props) {
  const { description, tags, title, type, subtitle, label, onClick, href } = props;
  return /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(CardMedia, null, /* @__PURE__ */ React.createElement(ItemCardHeader, {
    title,
    subtitle: subtitle || type
  })), /* @__PURE__ */ React.createElement(CardContent, null, (tags == null ? void 0 : tags.length) ? /* @__PURE__ */ React.createElement(Box, null, tags.map((tag, i) => /* @__PURE__ */ React.createElement(Chip, {
    size: "small",
    label: tag,
    key: i
  }))) : null, description), /* @__PURE__ */ React.createElement(CardActions, null, !href && /* @__PURE__ */ React.createElement(Button, {
    to: "#",
    onClick,
    color: "primary"
  }, label), href && /* @__PURE__ */ React.createElement(Button, {
    to: href,
    color: "primary"
  }, label)));
}

const styles = (theme) => createStyles({
  root: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(22em, 1fr))",
    gridAutoRows: "1fr",
    gridGap: theme.spacing(2)
  }
});
const useStyles$2 = makeStyles(styles, { name: "BackstageItemCardGrid" });
function ItemCardGrid(props) {
  const { children, ...otherProps } = props;
  const classes = useStyles$2(otherProps);
  return /* @__PURE__ */ React.createElement("div", {
    className: classes.root,
    ...otherProps
  }, children);
}

const useStyles$1 = makeStyles(() => ({
  root: ({ isMobile }) => ({
    display: "grid",
    gridTemplateAreas: "'pageHeader pageHeader pageHeader' 'pageSubheader pageSubheader pageSubheader' 'pageNav pageContent pageSidebar'",
    gridTemplateRows: "max-content auto 1fr",
    gridTemplateColumns: "auto 1fr auto",
    height: isMobile ? "100%" : "100vh",
    overflowY: "auto"
  })
}), { name: "BackstagePage" });
function Page(props) {
  const { themeId, children } = props;
  const { isMobile } = useSidebarPinState();
  const classes = useStyles$1({ isMobile });
  return /* @__PURE__ */ React.createElement(ThemeProvider, {
    theme: (baseTheme) => ({
      ...baseTheme,
      page: baseTheme.getPageTheme({ themeId })
    })
  }, /* @__PURE__ */ React.createElement("main", {
    className: classes.root
  }, children));
}

function PageWithHeader(props) {
  const { themeId, children, ...restProps } = props;
  return /* @__PURE__ */ React.createElement(Page, {
    themeId
  }, /* @__PURE__ */ React.createElement(Header, {
    ...restProps
  }), children);
}

const proxiedSessionSchema = z.object({
  providerInfo: z.object({}).catchall(z.unknown()).optional(),
  profile: z.object({
    email: z.string().optional(),
    displayName: z.string().optional(),
    picture: z.string().optional()
  }),
  backstageIdentity: z.object({
    token: z.string(),
    identity: z.object({
      type: z.literal("user"),
      userEntityRef: z.string(),
      ownershipEntityRefs: z.array(z.string())
    })
  })
});

const DEFAULTS = {
  defaultTokenExpiryMillis: 5 * 60 * 1e3,
  tokenExpiryMarginMillis: 5 * 60 * 1e3
};
function tokenToExpiry(jwtToken) {
  const fallback = new Date(Date.now() + DEFAULTS.defaultTokenExpiryMillis);
  if (!jwtToken) {
    return fallback;
  }
  const [_header, rawPayload, _signature] = jwtToken.split(".");
  const payload = JSON.parse(atob(rawPayload));
  if (typeof payload.exp !== "number") {
    return fallback;
  }
  return new Date(payload.exp * 1e3 - DEFAULTS.tokenExpiryMarginMillis);
}
class ProxiedSignInIdentity {
  constructor(options) {
    this.options = options;
    this.abortController = new AbortController();
    this.state = { type: "empty" };
  }
  async start() {
    await this.getSessionAsync();
  }
  getUserId() {
    const { backstageIdentity } = this.getSessionSync();
    const ref = backstageIdentity.identity.userEntityRef;
    const match = /^([^:/]+:)?([^:/]+\/)?([^:/]+)$/.exec(ref);
    if (!match) {
      throw new TypeError(`Invalid user entity reference "${ref}"`);
    }
    return match[3];
  }
  async getIdToken() {
    const session = await this.getSessionAsync();
    return session.backstageIdentity.token;
  }
  getProfile() {
    const session = this.getSessionSync();
    return session.profile;
  }
  async getProfileInfo() {
    const session = await this.getSessionAsync();
    return session.profile;
  }
  async getBackstageIdentity() {
    const session = await this.getSessionAsync();
    return session.backstageIdentity.identity;
  }
  async getCredentials() {
    const session = await this.getSessionAsync();
    return {
      token: session.backstageIdentity.token
    };
  }
  async signOut() {
    this.abortController.abort();
  }
  getSessionSync() {
    if (this.state.type === "active") {
      return this.state.session;
    } else if (this.state.type === "fetching" && this.state.previous) {
      return this.state.previous;
    }
    throw new Error("No session available. Try reloading your browser page.");
  }
  async getSessionAsync() {
    if (this.state.type === "fetching") {
      return this.state.promise;
    } else if (this.state.type === "active" && new Date() < this.state.expiresAt) {
      return this.state.session;
    }
    const previous = this.state.type === "active" ? this.state.session : void 0;
    const promise = this.fetchSession().then((session) => {
      this.state = {
        type: "active",
        session,
        expiresAt: tokenToExpiry(session.backstageIdentity.token)
      };
      return session;
    }, (error) => {
      this.state = {
        type: "failed",
        error
      };
      throw error;
    });
    this.state = {
      type: "fetching",
      promise,
      previous
    };
    return promise;
  }
  async fetchSession() {
    const baseUrl = await this.options.discoveryApi.getBaseUrl("auth");
    const response = await fetch(`${baseUrl}/${this.options.provider}/refresh`, {
      signal: this.abortController.signal,
      headers: { "x-requested-with": "XMLHttpRequest" },
      credentials: "include"
    });
    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    return proxiedSessionSchema.parse(await response.json());
  }
}

const ProxiedSignInPage = (props) => {
  const discoveryApi = useApi(discoveryApiRef);
  const [{ status, error }, { execute }] = useAsync(async () => {
    const identity = new ProxiedSignInIdentity({
      provider: props.provider,
      discoveryApi
    });
    await identity.start();
    props.onSignInSuccess(identity);
  });
  useMountEffect(execute);
  if (status === "loading") {
    return /* @__PURE__ */ React.createElement(Progress, null);
  } else if (error) {
    return /* @__PURE__ */ React.createElement(ErrorPanel, {
      title: "You do not appear to be signed in. Please try reloading the browser page.",
      error
    });
  }
  return null;
};

class GuestUserIdentity {
  getUserId() {
    return "guest";
  }
  async getIdToken() {
    return void 0;
  }
  getProfile() {
    return {
      email: "guest@example.com",
      displayName: "Guest"
    };
  }
  async getProfileInfo() {
    return {
      email: "guest@example.com",
      displayName: "Guest"
    };
  }
  async getBackstageIdentity() {
    const userEntityRef = `user:default/guest`;
    return {
      type: "user",
      userEntityRef,
      ownershipEntityRefs: [userEntityRef]
    };
  }
  async getCredentials() {
    return {};
  }
  async signOut() {
  }
}

function parseJwtPayload(token) {
  const [_header, payload, _signature] = token.split(".");
  return JSON.parse(atob(payload));
}
class LegacyUserIdentity {
  constructor(result) {
    this.result = result;
  }
  getUserId() {
    return this.result.userId;
  }
  static fromResult(result) {
    return new LegacyUserIdentity(result);
  }
  async getIdToken() {
    var _a, _b;
    return (_b = (_a = this.result).getIdToken) == null ? void 0 : _b.call(_a);
  }
  getProfile() {
    return this.result.profile;
  }
  async getProfileInfo() {
    return this.result.profile;
  }
  async getBackstageIdentity() {
    const token = await this.getIdToken();
    if (!token) {
      const userEntityRef = `user:default/${this.getUserId()}`;
      return {
        type: "user",
        userEntityRef,
        ownershipEntityRefs: [userEntityRef]
      };
    }
    const { sub, ent } = parseJwtPayload(token);
    return {
      type: "user",
      userEntityRef: sub,
      ownershipEntityRefs: ent != null ? ent : []
    };
  }
  async getCredentials() {
    var _a, _b;
    const token = await ((_b = (_a = this.result).getIdToken) == null ? void 0 : _b.call(_a));
    return { token };
  }
  async signOut() {
    var _a, _b;
    return (_b = (_a = this.result).signOut) == null ? void 0 : _b.call(_a);
  }
}

class UserIdentity {
  constructor(identity, authApi, profile) {
    this.identity = identity;
    this.authApi = authApi;
    this.profile = profile;
  }
  static createGuest() {
    return new GuestUserIdentity();
  }
  static fromLegacy(result) {
    return LegacyUserIdentity.fromResult(result);
  }
  static create(options) {
    return new UserIdentity(options.identity, options.authApi, options.profile);
  }
  getUserId() {
    const ref = this.identity.userEntityRef;
    const match = /^([^:/]+:)?([^:/]+\/)?([^:/]+)$/.exec(ref);
    if (!match) {
      throw new TypeError(`Invalid user entity reference "${ref}"`);
    }
    return match[3];
  }
  async getIdToken() {
    const identity = await this.authApi.getBackstageIdentity();
    return identity.token;
  }
  getProfile() {
    if (!this.profile) {
      throw new Error("The identity API does not implement synchronous profile fetching, use getProfileInfo() instead");
    }
    return this.profile;
  }
  async getProfileInfo() {
    if (this.profilePromise) {
      return await this.profilePromise;
    }
    try {
      this.profilePromise = this.authApi.getProfile();
      return await this.profilePromise;
    } catch (ex) {
      this.profilePromise = void 0;
      throw ex;
    }
  }
  async getBackstageIdentity() {
    return this.identity;
  }
  async getCredentials() {
    const identity = await this.authApi.getBackstageIdentity();
    return { token: identity.token };
  }
  async signOut() {
    return this.authApi.signOut();
  }
}

const useStyles = makeStyles({
  container: {
    padding: 0,
    listStyle: "none"
  },
  item: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: "400px",
    margin: 0,
    padding: 0
  }
}, { name: "BackstageSignInPage" });
const GridItem = ({ children }) => {
  const classes = useStyles();
  return /* @__PURE__ */ React.createElement(Grid, {
    component: "li",
    item: true,
    classes
  }, children);
};

const Component$2 = ({ config, onSignInSuccess }) => {
  const { apiRef, title, message } = config;
  const authApi = useApi(apiRef);
  const errorApi = useApi(errorApiRef);
  const handleLogin = async () => {
    try {
      const identityResponse = await authApi.getBackstageIdentity({
        instantPopup: true
      });
      if (!identityResponse) {
        throw new Error(`The ${title} provider is not configured to support sign-in`);
      }
      const profile = await authApi.getProfile();
      onSignInSuccess(UserIdentity.create({
        identity: identityResponse.identity,
        profile,
        authApi
      }));
    } catch (error) {
      errorApi.post(new ForwardedError("Login failed", error));
    }
  };
  return /* @__PURE__ */ React.createElement(GridItem, null, /* @__PURE__ */ React.createElement(InfoCard, {
    variant: "fullHeight",
    title,
    actions: /* @__PURE__ */ React.createElement(Button$1, {
      color: "primary",
      variant: "outlined",
      onClick: handleLogin
    }, "Sign In")
  }, /* @__PURE__ */ React.createElement(Typography, {
    variant: "body1"
  }, message)));
};
const loader$2 = async (apis, apiRef) => {
  const authApi = apis.get(apiRef);
  const identityResponse = await authApi.getBackstageIdentity({
    optional: true
  });
  if (!identityResponse) {
    return void 0;
  }
  const profile = await authApi.getProfile();
  return UserIdentity.create({
    identity: identityResponse.identity,
    profile,
    authApi
  });
};
const commonProvider = { Component: Component$2, loader: loader$2 };

const Component$1 = ({ onSignInSuccess }) => /* @__PURE__ */ React.createElement(GridItem, null, /* @__PURE__ */ React.createElement(InfoCard, {
  title: "Guest",
  variant: "fullHeight",
  actions: /* @__PURE__ */ React.createElement(Button$1, {
    color: "primary",
    variant: "outlined",
    onClick: () => onSignInSuccess(new GuestUserIdentity())
  }, "Enter")
}, /* @__PURE__ */ React.createElement(Typography, {
  variant: "body1"
}, "Enter as a Guest User.", /* @__PURE__ */ React.createElement("br", null), "You will not have a verified identity,", /* @__PURE__ */ React.createElement("br", null), "meaning some features might be unavailable.")));
const loader$1 = async () => {
  return new GuestUserIdentity();
};
const guestProvider = { Component: Component$1, loader: loader$1 };

const ID_TOKEN_REGEX = /^[a-z0-9_\-]+\.[a-z0-9_\-]+\.[a-z0-9_\-]+$/i;
const useFormStyles = makeStyles((theme) => ({
  form: {
    display: "flex",
    flexFlow: "column nowrap"
  },
  button: {
    alignSelf: "center",
    marginTop: theme.spacing(2)
  }
}), { name: "BackstageCustomProvider" });
const asInputRef = (renderResult) => {
  const { ref, ...rest } = renderResult;
  return {
    inputRef: ref,
    ...rest
  };
};
const Component = ({ onSignInSuccess }) => {
  const classes = useFormStyles();
  const { register, handleSubmit, formState } = useForm({
    mode: "onChange"
  });
  const { errors } = formState;
  const handleResult = ({ userId }) => {
    onSignInSuccess(UserIdentity.fromLegacy({
      userId,
      profile: {
        email: `${userId}@example.com`
      }
    }));
  };
  return /* @__PURE__ */ React.createElement(GridItem, null, /* @__PURE__ */ React.createElement(InfoCard, {
    title: "Custom User",
    variant: "fullHeight"
  }, /* @__PURE__ */ React.createElement(Typography, {
    variant: "body1"
  }, "Enter your own User ID and credentials.", /* @__PURE__ */ React.createElement("br", null), "This selection will not be stored."), /* @__PURE__ */ React.createElement("form", {
    className: classes.form,
    onSubmit: handleSubmit(handleResult)
  }, /* @__PURE__ */ React.createElement(FormControl, null, /* @__PURE__ */ React.createElement(TextField, {
    ...asInputRef(register("userId", { required: true })),
    label: "User ID",
    margin: "normal",
    error: Boolean(errors.userId)
  }), errors.userId && /* @__PURE__ */ React.createElement(FormHelperText, {
    error: true
  }, errors.userId.message)), /* @__PURE__ */ React.createElement(FormControl, null, /* @__PURE__ */ React.createElement(TextField, {
    ...asInputRef(register("idToken", {
      required: false,
      validate: (token) => !token || ID_TOKEN_REGEX.test(token) || "Token is not a valid OpenID Connect JWT Token"
    })),
    label: "ID Token (optional)",
    margin: "normal",
    autoComplete: "off",
    error: Boolean(errors.idToken)
  }), errors.idToken && /* @__PURE__ */ React.createElement(FormHelperText, {
    error: true
  }, errors.idToken.message)), /* @__PURE__ */ React.createElement(Button$1, {
    type: "submit",
    color: "primary",
    variant: "outlined",
    className: classes.button,
    disabled: !(formState == null ? void 0 : formState.isDirty) || !isEmpty(errors)
  }, "Continue"))));
};
const loader = async () => void 0;
const customProvider = { Component, loader };

class IdentityApiSignOutProxy {
  constructor(config) {
    this.config = config;
  }
  static from(config) {
    return new IdentityApiSignOutProxy(config);
  }
  getUserId() {
    if (!this.config.identityApi.getUserId) {
      throw new Error(`SignOutProxy IdentityApi.getUserId is not implemented`);
    }
    return this.config.identityApi.getUserId();
  }
  getIdToken() {
    if (!this.config.identityApi.getIdToken) {
      throw new Error(`SignOutProxy IdentityApi.getIdToken is not implemented`);
    }
    return this.config.identityApi.getIdToken();
  }
  getProfile() {
    if (!this.config.identityApi.getProfile) {
      throw new Error(`SignOutProxy IdentityApi.getProfile is not implemented`);
    }
    return this.config.identityApi.getProfile();
  }
  getProfileInfo() {
    return this.config.identityApi.getProfileInfo();
  }
  getBackstageIdentity() {
    return this.config.identityApi.getBackstageIdentity();
  }
  getCredentials() {
    return this.config.identityApi.getCredentials();
  }
  signOut() {
    return this.config.signOut();
  }
}

const PROVIDER_STORAGE_KEY = "@backstage/core:SignInPage:provider";
const signInProviders = {
  guest: guestProvider,
  custom: customProvider,
  common: commonProvider
};
function validateIDs(id, providers) {
  if (id in providers)
    throw new Error(`"${id}" ID is duplicated. IDs of identity providers have to be unique.`);
}
function getSignInProviders(identityProviders) {
  const providers = identityProviders.reduce((acc, config) => {
    if (typeof config === "string") {
      validateIDs(config, acc);
      acc[config] = { components: signInProviders[config], id: config };
      return acc;
    }
    const { id } = config;
    validateIDs(id, acc);
    acc[id] = { components: signInProviders.common, id, config };
    return acc;
  }, {});
  return providers;
}
const useSignInProviders = (providers, onSignInSuccess) => {
  const errorApi = useApi(errorApiRef);
  const apiHolder = useApiHolder();
  const [loading, setLoading] = useState(true);
  const handleWrappedResult = useCallback((identityApi) => {
    onSignInSuccess(IdentityApiSignOutProxy.from({
      identityApi,
      signOut: async () => {
        var _a;
        localStorage.removeItem(PROVIDER_STORAGE_KEY);
        await ((_a = identityApi.signOut) == null ? void 0 : _a.call(identityApi));
      }
    }));
  }, [onSignInSuccess]);
  useLayoutEffect(() => {
    var _a;
    if (!loading) {
      return void 0;
    }
    const selectedProviderId = localStorage.getItem(PROVIDER_STORAGE_KEY);
    if (selectedProviderId === null) {
      setLoading(false);
      return void 0;
    }
    const provider = providers[selectedProviderId];
    if (!provider) {
      setLoading(false);
      return void 0;
    }
    let didCancel = false;
    provider.components.loader(apiHolder, (_a = provider.config) == null ? void 0 : _a.apiRef).then((result) => {
      if (didCancel) {
        return;
      }
      if (result) {
        handleWrappedResult(result);
      } else {
        setLoading(false);
      }
    }).catch((error) => {
      if (didCancel) {
        return;
      }
      localStorage.removeItem(PROVIDER_STORAGE_KEY);
      errorApi.post(error);
      setLoading(false);
    });
    return () => {
      didCancel = true;
    };
  }, [
    loading,
    errorApi,
    onSignInSuccess,
    apiHolder,
    providers,
    handleWrappedResult
  ]);
  const elements = useMemo(() => Object.keys(providers).map((key) => {
    const provider = providers[key];
    const { Component } = provider.components;
    const handleSignInSuccess = (result) => {
      localStorage.setItem(PROVIDER_STORAGE_KEY, provider.id);
      handleWrappedResult(result);
    };
    return /* @__PURE__ */ React.createElement(Component, {
      key: provider.id,
      config: provider.config,
      onSignInSuccess: handleSignInSuccess
    });
  }), [providers, handleWrappedResult]);
  return [loading, elements];
};

const MultiSignInPage = ({
  onSignInSuccess,
  providers = [],
  title,
  align = "left"
}) => {
  const configApi = useApi(configApiRef);
  const classes = useStyles();
  const signInProviders = getSignInProviders(providers);
  const [loading, providerElements] = useSignInProviders(signInProviders, onSignInSuccess);
  if (loading) {
    return /* @__PURE__ */ React.createElement(Progress, null);
  }
  return /* @__PURE__ */ React.createElement(Page, {
    themeId: "home"
  }, /* @__PURE__ */ React.createElement(Header, {
    title: configApi.getString("app.title")
  }), /* @__PURE__ */ React.createElement(Content, null, title && /* @__PURE__ */ React.createElement(ContentHeader, {
    title,
    textAlign: align
  }), /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    justifyContent: align === "center" ? align : "flex-start",
    spacing: 2,
    component: "ul",
    classes
  }, providerElements)));
};
const SingleSignInPage = ({
  provider,
  auto,
  onSignInSuccess
}) => {
  const classes = useStyles();
  const authApi = useApi(provider.apiRef);
  const configApi = useApi(configApiRef);
  const [error, setError] = useState();
  const [showLoginPage, setShowLoginPage] = useState(false);
  const login = async ({ checkExisting, showPopup }) => {
    try {
      let identityResponse;
      if (checkExisting) {
        identityResponse = await authApi.getBackstageIdentity({
          optional: true
        });
      }
      if (!identityResponse && (showPopup || auto)) {
        setShowLoginPage(true);
        identityResponse = await authApi.getBackstageIdentity({
          instantPopup: true
        });
        if (!identityResponse) {
          throw new Error(`The ${provider.title} provider is not configured to support sign-in`);
        }
      }
      if (!identityResponse) {
        setShowLoginPage(true);
        return;
      }
      const profile = await authApi.getProfile();
      onSignInSuccess(UserIdentity.create({
        identity: identityResponse.identity,
        authApi,
        profile
      }));
    } catch (err) {
      setError(err);
      setShowLoginPage(true);
    }
  };
  useMountEffect(() => login({ checkExisting: true }));
  return showLoginPage ? /* @__PURE__ */ React.createElement(Page, {
    themeId: "home"
  }, /* @__PURE__ */ React.createElement(Header, {
    title: configApi.getString("app.title")
  }), /* @__PURE__ */ React.createElement(Content, null, /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    justifyContent: "center",
    spacing: 2,
    component: "ul",
    classes
  }, /* @__PURE__ */ React.createElement(GridItem, null, /* @__PURE__ */ React.createElement(InfoCard, {
    variant: "fullHeight",
    title: provider.title,
    actions: /* @__PURE__ */ React.createElement(Button$1, {
      color: "primary",
      variant: "outlined",
      onClick: () => {
        login({ showPopup: true });
      }
    }, "Sign In")
  }, /* @__PURE__ */ React.createElement(Typography, {
    variant: "body1"
  }, provider.message), error && error.name !== "PopupRejectedError" && /* @__PURE__ */ React.createElement(Typography, {
    variant: "body1",
    color: "error"
  }, error.message)))))) : /* @__PURE__ */ React.createElement(Progress, null);
};
function SignInPage(props) {
  if ("provider" in props) {
    return /* @__PURE__ */ React.createElement(SingleSignInPage, {
      ...props
    });
  }
  return /* @__PURE__ */ React.createElement(MultiSignInPage, {
    ...props
  });
}

const useTabsStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(0, 2, 0, 2.5),
    minHeight: theme.spacing(3)
  },
  indicator: {
    backgroundColor: theme.palette.info.main,
    height: theme.spacing(0.3)
  }
}), { name: "BackstageTabbedCard" });
const BoldHeader = withStyles((theme) => ({
  root: { padding: theme.spacing(2, 2, 2, 2.5), display: "inline-block" },
  title: { fontWeight: 700 },
  subheader: { paddingTop: theme.spacing(1) }
}), { name: "BackstageTabbedCardBoldHeader" })(CardHeader);
function TabbedCard(props) {
  const {
    slackChannel,
    errorBoundaryProps,
    children,
    title,
    deepLink,
    value,
    onChange
  } = props;
  const tabsClasses = useTabsStyles();
  const [selectedIndex, selectIndex] = useState(0);
  const handleChange = onChange ? onChange : (_ev, newSelectedIndex) => selectIndex(newSelectedIndex);
  let selectedTabContent;
  if (!value) {
    React.Children.map(children, (child, index) => {
      if (React.isValidElement(child) && index === selectedIndex) {
        selectedTabContent = child == null ? void 0 : child.props.children;
      }
    });
  } else {
    React.Children.map(children, (child) => {
      if (React.isValidElement(child) && (child == null ? void 0 : child.props.value) === value) {
        selectedTabContent = child == null ? void 0 : child.props.children;
      }
    });
  }
  const errProps = errorBoundaryProps || (slackChannel ? { slackChannel } : {});
  return /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(ErrorBoundary, {
    ...errProps
  }, title && /* @__PURE__ */ React.createElement(BoldHeader, {
    title
  }), /* @__PURE__ */ React.createElement(Tabs$1, {
    selectionFollowsFocus: true,
    classes: tabsClasses,
    value: value || selectedIndex,
    onChange: handleChange
  }, children), /* @__PURE__ */ React.createElement(Divider, null), /* @__PURE__ */ React.createElement(CardContent, null, selectedTabContent), deepLink && /* @__PURE__ */ React.createElement(BottomLink, {
    ...deepLink
  })));
}
const useCardTabStyles = makeStyles((theme) => ({
  root: {
    minWidth: theme.spacing(6),
    minHeight: theme.spacing(3),
    margin: theme.spacing(0, 2, 0, 0),
    padding: theme.spacing(0.5, 0, 0.5, 0),
    textTransform: "none",
    "&:hover": {
      opacity: 1,
      backgroundColor: "transparent",
      color: theme.palette.text.primary
    }
  },
  selected: {
    fontWeight: "bold"
  }
}), { name: "BackstageCardTab" });
function CardTab(props) {
  const { children, ...restProps } = props;
  const classes = useCardTabStyles();
  return /* @__PURE__ */ React.createElement(Tab, {
    disableRipple: true,
    classes,
    ...restProps
  });
}

export { AlertDisplay, Avatar, BottomLink, Breadcrumbs, BrokenImageIcon, Button, CardTab, CatalogIcon, ChatIcon, CodeSnippet, Content, ContentHeader, CopyTextButton, CreateButton, DashboardIcon, DependencyGraph, types as DependencyGraphTypes, DismissableBanner, DocsIcon, EmailIcon, EmptyState, ErrorBoundary, ErrorPage, ErrorPanel, FeatureCalloutCircular, Gauge, GaugeCard, GitHubIcon, GroupIcon, Header, HeaderIconLinkRow, HeaderLabel, HeaderTabs, HelpIcon, HomepageTimer, HorizontalScrollGrid, InfoCard, IntroCard, ItemCard, ItemCardGrid, ItemCardHeader, Lifecycle, LinearGauge, Link, LogViewer, MarkdownContent, MissingAnnotationEmptyState, MobileSidebar, OAuthRequestDialog, OverflowTooltip, Page, PageWithHeader, Progress, ProxiedSignInPage, ResponseErrorPanel, RoutedTabs, SIDEBAR_INTRO_LOCAL_STORAGE, SelectComponent as Select, Sidebar, LegacySidebarContext as SidebarContext, SidebarDivider, SidebarExpandButton, SidebarGroup, SidebarIntro, SidebarItem, SidebarOpenStateProvider, SidebarPage, LegacySidebarPinStateContext as SidebarPinStateContext, SidebarPinStateProvider, SidebarScrollWrapper, SidebarSearchField, SidebarSpace, SidebarSpacer, SidebarSubmenu, SidebarSubmenuItem, SignInPage, SimpleStepper, SimpleStepperStep, StatusAborted, StatusError, StatusOK, StatusPending, StatusRunning, StatusWarning, StructuredMetadataTable, SubvalueCell, SupportButton, TabbedCard, TabbedLayout, Table, Tabs, TrendLine, UserIcon, UserIdentity, WarningIcon, WarningPanel, sidebarConfig, useContent, useQueryParamState, useSidebarOpenState, useSidebarPinState, useSupportConfig };
//# sourceMappingURL=index.esm.js.map
