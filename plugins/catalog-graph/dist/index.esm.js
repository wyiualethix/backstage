import { RELATION_OWNER_OF, RELATION_OWNED_BY, RELATION_CONSUMES_API, RELATION_API_CONSUMED_BY, RELATION_API_PROVIDED_BY, RELATION_PROVIDES_API, RELATION_HAS_PART, RELATION_PART_OF, RELATION_PARENT_OF, RELATION_CHILD_OF, RELATION_HAS_MEMBER, RELATION_MEMBER_OF, RELATION_DEPENDS_ON, RELATION_DEPENDENCY_OF, DEFAULT_NAMESPACE, stringifyEntityRef } from '@backstage/catalog-model';
import { DependencyGraph, DependencyGraphTypes } from '@backstage/core-components';
import { useApp, useApi, errorApiRef, createRouteRef, createExternalRouteRef, createPlugin, createComponentExtension, createRoutableExtension } from '@backstage/core-plugin-api';
import { makeStyles as makeStyles$2, useTheme, CircularProgress } from '@material-ui/core';
import classNames from 'classnames';
import React, { useState, useRef, useLayoutEffect, useCallback, useEffect, useMemo } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { humanizeEntityRef, catalogApiRef } from '@backstage/plugin-catalog-react';
import { makeStyles as makeStyles$1 } from '@material-ui/core/styles';
import WorkIcon from '@material-ui/icons/Work';
import useDebounce from 'react-use/lib/useDebounce';
import limiterFactory from 'p-limit';
import useAsyncFn from 'react-use/lib/useAsyncFn';

const useStyles$2 = makeStyles((theme) => ({
  text: {
    fill: theme.palette.textContrast
  },
  secondary: {
    fill: theme.palette.textSubtle
  }
}));
function CustomLabel({
  edge: { relations }
}) {
  const classes = useStyles$2();
  return /* @__PURE__ */ React.createElement("text", {
    className: classes.text,
    textAnchor: "middle"
  }, relations.map((r, i) => /* @__PURE__ */ React.createElement("tspan", {
    key: r,
    className: classNames(i > 0 && classes.secondary)
  }, i > 0 && /* @__PURE__ */ React.createElement("tspan", null, " / "), r)));
}

function EntityKindIcon({
  kind,
  ...props
}) {
  var _a;
  const app = useApp();
  const Icon = (_a = app.getSystemIcon(`kind:${kind.toLocaleLowerCase("en-US")}`)) != null ? _a : WorkIcon;
  return /* @__PURE__ */ React.createElement(Icon, {
    ...props
  });
}

const useStyles$1 = makeStyles$1((theme) => ({
  node: {
    fill: theme.palette.grey[300],
    stroke: theme.palette.grey[300],
    "&.primary": {
      fill: theme.palette.primary.light,
      stroke: theme.palette.primary.light
    },
    "&.secondary": {
      fill: theme.palette.secondary.light,
      stroke: theme.palette.secondary.light
    }
  },
  text: {
    fill: theme.palette.getContrastText(theme.palette.grey[300]),
    "&.primary": {
      fill: theme.palette.primary.contrastText
    },
    "&.secondary": {
      fill: theme.palette.secondary.contrastText
    },
    "&.focused": {
      fontWeight: "bold"
    }
  },
  clickable: {
    cursor: "pointer"
  }
}));
function CustomNode({
  node: {
    id,
    kind,
    namespace,
    name,
    color = "default",
    focused,
    title,
    onClick
  }
}) {
  const classes = useStyles$1();
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const idRef = useRef(null);
  useLayoutEffect(() => {
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
  const iconSize = height;
  const paddedIconWidth = kind ? iconSize + padding : 0;
  const paddedWidth = paddedIconWidth + width + padding * 2;
  const paddedHeight = height + padding * 2;
  const displayTitle = title != null ? title : kind && name && namespace ? humanizeEntityRef({ kind, name, namespace }) : id;
  return /* @__PURE__ */ React.createElement("g", {
    onClick,
    className: classNames(onClick && classes.clickable)
  }, /* @__PURE__ */ React.createElement("rect", {
    className: classNames(classes.node, color === "primary" && "primary", color === "secondary" && "secondary"),
    width: paddedWidth,
    height: paddedHeight,
    rx: 10
  }), kind && /* @__PURE__ */ React.createElement(EntityKindIcon, {
    kind,
    y: padding,
    x: padding,
    width: iconSize,
    height: iconSize,
    className: classNames(classes.text, focused && "focused", color === "primary" && "primary", color === "secondary" && "secondary")
  }), /* @__PURE__ */ React.createElement("text", {
    ref: idRef,
    className: classNames(classes.text, focused && "focused", color === "primary" && "primary", color === "secondary" && "secondary"),
    y: paddedHeight / 2,
    x: paddedIconWidth + (width + padding * 2) / 2,
    textAnchor: "middle",
    alignmentBaseline: "middle"
  }, displayTitle));
}

const ALL_RELATION_PAIRS = [
  [RELATION_OWNER_OF, RELATION_OWNED_BY],
  [RELATION_CONSUMES_API, RELATION_API_CONSUMED_BY],
  [RELATION_API_PROVIDED_BY, RELATION_PROVIDES_API],
  [RELATION_HAS_PART, RELATION_PART_OF],
  [RELATION_PARENT_OF, RELATION_CHILD_OF],
  [RELATION_HAS_MEMBER, RELATION_MEMBER_OF],
  [RELATION_DEPENDS_ON, RELATION_DEPENDENCY_OF]
];

var Direction = /* @__PURE__ */ ((Direction2) => {
  Direction2["TOP_BOTTOM"] = "TB";
  Direction2["BOTTOM_TOP"] = "BT";
  Direction2["LEFT_RIGHT"] = "LR";
  Direction2["RIGHT_LEFT"] = "RL";
  return Direction2;
})(Direction || {});

const limiter = limiterFactory(10);
function useEntityStore() {
  const catalogClient = useApi(catalogApiRef);
  const state = useRef({
    requestedEntities: /* @__PURE__ */ new Set(),
    outstandingEntities: /* @__PURE__ */ new Map(),
    cachedEntities: /* @__PURE__ */ new Map()
  });
  const [entities, setEntities] = useState({});
  const updateEntities = useCallback(() => {
    const { cachedEntities, requestedEntities } = state.current;
    const filteredEntities = {};
    requestedEntities.forEach((entityRef) => {
      const entity = cachedEntities.get(entityRef);
      if (entity) {
        filteredEntities[entityRef] = entity;
      }
    });
    setEntities(filteredEntities);
  }, [state, setEntities]);
  const [asyncState, fetch] = useAsyncFn(async () => {
    const { requestedEntities, outstandingEntities, cachedEntities } = state.current;
    await Promise.all(Array.from(requestedEntities).map((entityRef) => limiter(async () => {
      if (cachedEntities.has(entityRef)) {
        return;
      }
      if (outstandingEntities.has(entityRef)) {
        await outstandingEntities.get(entityRef);
        return;
      }
      const promise = catalogClient.getEntityByRef(entityRef);
      outstandingEntities.set(entityRef, promise);
      try {
        const entity = await promise;
        if (entity) {
          cachedEntities.set(entityRef, entity);
          updateEntities();
        }
      } finally {
        outstandingEntities.delete(entityRef);
      }
    })));
  }, [state, updateEntities]);
  const { loading, error } = asyncState;
  const requestEntities = useCallback((entityRefs) => {
    const n = new Set(entityRefs);
    const { requestedEntities } = state.current;
    if (n.size !== requestedEntities.size || Array.from(n).some((e) => !requestedEntities.has(e))) {
      state.current.requestedEntities = n;
      fetch();
      updateEntities();
    }
  }, [state, fetch, updateEntities]);
  return {
    entities,
    loading,
    error,
    requestEntities
  };
}

function useEntityRelationGraph({
  rootEntityRefs,
  filter: { maxDepth = Number.POSITIVE_INFINITY, relations, kinds } = {}
}) {
  const { entities, loading, error, requestEntities } = useEntityStore();
  useEffect(() => {
    const expectedEntities = /* @__PURE__ */ new Set([...rootEntityRefs]);
    const processedEntityRefs = /* @__PURE__ */ new Set();
    let nextDepthRefQueue = [...rootEntityRefs];
    let depth = 0;
    while (nextDepthRefQueue.length > 0 && (!isFinite(maxDepth) || depth < maxDepth)) {
      const entityRefQueue = nextDepthRefQueue;
      nextDepthRefQueue = [];
      while (entityRefQueue.length > 0) {
        const entityRef = entityRefQueue.shift();
        const entity = entities[entityRef];
        processedEntityRefs.add(entityRef);
        if (entity && entity.relations) {
          for (const rel of entity.relations) {
            if ((!relations || relations.includes(rel.type)) && (!kinds || kinds.some((kind) => rel.targetRef.startsWith(`${kind.toLocaleLowerCase("en-US")}:`)))) {
              if (!processedEntityRefs.has(rel.targetRef)) {
                nextDepthRefQueue.push(rel.targetRef);
                expectedEntities.add(rel.targetRef);
              }
            }
          }
        }
      }
      ++depth;
    }
    requestEntities([...expectedEntities]);
  }, [entities, rootEntityRefs, maxDepth, relations, kinds, requestEntities]);
  return {
    entities,
    loading,
    error
  };
}

function useEntityRelationNodesAndEdges({
  rootEntityRefs,
  maxDepth = Number.POSITIVE_INFINITY,
  unidirectional = true,
  mergeRelations = true,
  kinds,
  relations,
  onNodeClick,
  relationPairs = ALL_RELATION_PAIRS
}) {
  const [nodesAndEdges, setNodesAndEdges] = useState({});
  const { entities, loading, error } = useEntityRelationGraph({
    rootEntityRefs,
    filter: {
      maxDepth,
      kinds,
      relations
    }
  });
  useDebounce(() => {
    var _a;
    if (!entities || Object.keys(entities).length === 0) {
      setNodesAndEdges({});
      return;
    }
    const nodes = Object.entries(entities).map(([entityRef, entity]) => {
      var _a2, _b, _c;
      const focused = rootEntityRefs.includes(entityRef);
      const node = {
        id: entityRef,
        title: (_b = (_a2 = entity.metadata) == null ? void 0 : _a2.title) != null ? _b : void 0,
        kind: entity.kind,
        name: entity.metadata.name,
        namespace: (_c = entity.metadata.namespace) != null ? _c : DEFAULT_NAMESPACE,
        focused,
        color: focused ? "secondary" : "primary"
      };
      if (onNodeClick) {
        node.onClick = (event) => onNodeClick(node, event);
      }
      return node;
    });
    const edges = [];
    const visitedNodes = /* @__PURE__ */ new Set();
    const nodeQueue = [...rootEntityRefs];
    while (nodeQueue.length > 0) {
      const entityRef = nodeQueue.pop();
      const entity = entities[entityRef];
      visitedNodes.add(entityRef);
      if (entity) {
        (_a = entity == null ? void 0 : entity.relations) == null ? void 0 : _a.forEach((rel) => {
          var _a2;
          if (!entities[rel.targetRef]) {
            return;
          }
          if (relations && !relations.includes(rel.type)) {
            return;
          }
          if (kinds && !kinds.some((kind) => rel.targetRef.startsWith(`${kind.toLocaleLowerCase("en-US")}:`))) {
            return;
          }
          if (!unidirectional || !visitedNodes.has(rel.targetRef)) {
            if (mergeRelations) {
              const pair = (_a2 = relationPairs.find(([l, r]) => l === rel.type || r === rel.type)) != null ? _a2 : [rel.type];
              const [left] = pair;
              edges.push({
                from: left === rel.type ? entityRef : rel.targetRef,
                to: left === rel.type ? rel.targetRef : entityRef,
                relations: pair,
                label: "visible"
              });
            } else {
              edges.push({
                from: entityRef,
                to: rel.targetRef,
                relations: [rel.type],
                label: "visible"
              });
            }
          }
          if (!visitedNodes.has(rel.targetRef)) {
            nodeQueue.push(rel.targetRef);
            visitedNodes.add(rel.targetRef);
          }
        });
      }
    }
    setNodesAndEdges({ nodes, edges });
  }, 100, [
    entities,
    rootEntityRefs,
    kinds,
    relations,
    unidirectional,
    mergeRelations,
    onNodeClick,
    relationPairs
  ]);
  return {
    loading,
    error,
    ...nodesAndEdges
  };
}

const useStyles = makeStyles$2((theme) => ({
  progress: {
    position: "absolute",
    left: "50%",
    top: "50%",
    marginLeft: "-20px",
    marginTop: "-20px"
  },
  container: {
    position: "relative",
    width: "100%",
    display: "flex",
    flexDirection: "column"
  },
  graph: {
    width: "100%",
    flex: 1,
    "& path[marker-end]": {
      transition: "filter 0.1s ease-in-out"
    },
    "& path[marker-end]:hover": {
      filter: `drop-shadow(2px 2px 4px ${theme.palette.primary.dark});`
    },
    "& g[data-testid=label]": {
      transition: "transform 0s"
    }
  }
}));
const EntityRelationsGraph = (props) => {
  const {
    rootEntityNames,
    maxDepth = Number.POSITIVE_INFINITY,
    unidirectional = true,
    mergeRelations = true,
    kinds,
    relations,
    direction = Direction.LEFT_RIGHT,
    onNodeClick,
    relationPairs = ALL_RELATION_PAIRS,
    className,
    zoom = "enabled",
    renderNode,
    renderLabel
  } = props;
  const theme = useTheme();
  const classes = useStyles();
  const rootEntityRefs = useMemo(() => (Array.isArray(rootEntityNames) ? rootEntityNames : [rootEntityNames]).map((e) => stringifyEntityRef(e)), [rootEntityNames]);
  const errorApi = useApi(errorApiRef);
  const { loading, error, nodes, edges } = useEntityRelationNodesAndEdges({
    rootEntityRefs,
    maxDepth,
    unidirectional,
    mergeRelations,
    kinds,
    relations,
    onNodeClick,
    relationPairs
  });
  useEffect(() => {
    if (error) {
      errorApi.post(error);
    }
  }, [errorApi, error]);
  return /* @__PURE__ */ React.createElement("div", {
    className: classNames(classes.container, className)
  }, loading && /* @__PURE__ */ React.createElement(CircularProgress, {
    className: classes.progress
  }), nodes && edges && /* @__PURE__ */ React.createElement(DependencyGraph, {
    nodes,
    edges,
    renderNode: renderNode || CustomNode,
    renderLabel: renderLabel || CustomLabel,
    direction,
    className: classes.graph,
    paddingX: theme.spacing(4),
    paddingY: theme.spacing(4),
    labelPosition: DependencyGraphTypes.LabelPosition.RIGHT,
    labelOffset: theme.spacing(1),
    zoom
  }));
};

const catalogGraphRouteRef = createRouteRef({
  id: "catalog-graph"
});
const catalogEntityRouteRef = createExternalRouteRef({
  id: "catalog-entity",
  params: ["namespace", "kind", "name"],
  optional: true
});

const catalogGraphPlugin = createPlugin({
  id: "catalog-graph",
  routes: {
    catalogGraph: catalogGraphRouteRef
  },
  externalRoutes: {
    catalogEntity: catalogEntityRouteRef
  }
});

const EntityCatalogGraphCard = catalogGraphPlugin.provide(createComponentExtension({
  name: "EntityCatalogGraphCard",
  component: {
    lazy: () => import('./esm/index-5294ed16.esm.js').then((m) => m.CatalogGraphCard)
  }
}));
const CatalogGraphPage = catalogGraphPlugin.provide(createRoutableExtension({
  name: "CatalogGraphPage",
  component: () => import('./esm/index-97452b61.esm.js').then((m) => m.CatalogGraphPage),
  mountPoint: catalogGraphRouteRef
}));

export { ALL_RELATION_PAIRS, CatalogGraphPage, Direction, EntityCatalogGraphCard, EntityRelationsGraph, catalogGraphPlugin, catalogGraphRouteRef };
//# sourceMappingURL=index.esm.js.map
