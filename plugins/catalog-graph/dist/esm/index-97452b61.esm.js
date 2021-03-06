import { parseEntityRef, stringifyEntityRef } from '@backstage/catalog-model';
import { Select, Page, Header, Content, ContentHeader, SupportButton } from '@backstage/core-components';
import { useApi, alertApiRef, useRouteRef, useAnalytics } from '@backstage/core-plugin-api';
import { catalogApiRef, entityRouteRef, humanizeEntityRef } from '@backstage/plugin-catalog-react';
import { Box, makeStyles, FormControl, Typography, OutlinedInput, InputAdornment, IconButton, FormControlLabel, Checkbox, TextField, Switch, Grid, Paper } from '@material-ui/core';
import FilterListIcon from '@material-ui/icons/FilterList';
import ZoomOutMap from '@material-ui/icons/ZoomOutMap';
import { Autocomplete, ToggleButton } from '@material-ui/lab';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Direction, EntityRelationsGraph, ALL_RELATION_PAIRS } from '../index.esm.js';
import ClearIcon from '@material-ui/icons/Clear';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import useAsync from 'react-use/lib/useAsync';
import qs from 'qs';
import usePrevious from 'react-use/lib/usePrevious';
import 'classnames';
import '@material-ui/core/styles/makeStyles';
import '@material-ui/core/styles';
import '@material-ui/icons/Work';
import 'react-use/lib/useDebounce';
import 'p-limit';
import 'react-use/lib/useAsyncFn';

const DIRECTION_DISPLAY_NAMES = {
  [Direction.LEFT_RIGHT]: "Left to right",
  [Direction.RIGHT_LEFT]: "Right to left",
  [Direction.TOP_BOTTOM]: "Top to bottom",
  [Direction.BOTTOM_TOP]: "Bottom to top"
};
const DirectionFilter = ({ value, onChange }) => {
  const handleChange = useCallback((v) => onChange(v), [onChange]);
  return /* @__PURE__ */ React.createElement(Box, {
    pb: 1,
    pt: 1
  }, /* @__PURE__ */ React.createElement(Select, {
    label: "Direction",
    selected: value,
    items: Object.values(Direction).map((v) => ({
      label: DIRECTION_DISPLAY_NAMES[v],
      value: v
    })),
    onChange: handleChange
  }));
};

const useStyles$4 = makeStyles({
  formControl: {
    width: "100%",
    maxWidth: 300
  }
});
const MaxDepthFilter = ({ value, onChange }) => {
  const classes = useStyles$4();
  const handleChange = useCallback((event) => {
    const v = Number(event.target.value);
    onChange(v <= 0 ? Number.POSITIVE_INFINITY : v);
  }, [onChange]);
  const reset = useCallback(() => {
    onChange(Number.POSITIVE_INFINITY);
  }, [onChange]);
  return /* @__PURE__ */ React.createElement(Box, {
    pb: 1,
    pt: 1
  }, /* @__PURE__ */ React.createElement(FormControl, {
    variant: "outlined",
    className: classes.formControl
  }, /* @__PURE__ */ React.createElement(Typography, {
    variant: "button"
  }, "Max Depth"), /* @__PURE__ */ React.createElement(OutlinedInput, {
    type: "number",
    placeholder: "\u221E Infinite",
    value: isFinite(value) ? value : "",
    onChange: handleChange,
    endAdornment: /* @__PURE__ */ React.createElement(InputAdornment, {
      position: "end"
    }, /* @__PURE__ */ React.createElement(IconButton, {
      "aria-label": "clear max depth",
      onClick: reset,
      edge: "end"
    }, /* @__PURE__ */ React.createElement(ClearIcon, null))),
    inputProps: {
      "aria-label": "maxp"
    },
    labelWidth: 0
  })));
};

const useStyles$3 = makeStyles({
  formControl: {
    maxWidth: 300
  }
});
const SelectedKindsFilter = ({ value, onChange }) => {
  const classes = useStyles$3();
  const alertApi = useApi(alertApiRef);
  const catalogApi = useApi(catalogApiRef);
  const { error, value: kinds } = useAsync(async () => {
    return await catalogApi.getEntityFacets({ facets: ["kind"] }).then((response) => {
      var _a;
      return ((_a = response.facets.kind) == null ? void 0 : _a.map((f) => f.value).sort()) || [];
    });
  });
  useEffect(() => {
    if (error) {
      alertApi.post({
        message: `Failed to load entity kinds`,
        severity: "error"
      });
    }
  }, [error, alertApi]);
  const normalizedKinds = useMemo(() => kinds ? kinds.map((k) => k.toLocaleLowerCase("en-US")) : kinds, [kinds]);
  const handleChange = useCallback((_, v) => {
    onChange(normalizedKinds && normalizedKinds.every((r) => v.includes(r)) ? void 0 : v);
  }, [normalizedKinds, onChange]);
  const handleEmpty = useCallback(() => {
    onChange((value == null ? void 0 : value.length) ? value : void 0);
  }, [value, onChange]);
  if (!(kinds == null ? void 0 : kinds.length) || !(normalizedKinds == null ? void 0 : normalizedKinds.length) || error) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null);
  }
  return /* @__PURE__ */ React.createElement(Box, {
    pb: 1,
    pt: 1
  }, /* @__PURE__ */ React.createElement(Typography, {
    variant: "button"
  }, "Kinds"), /* @__PURE__ */ React.createElement(Autocomplete, {
    className: classes.formControl,
    multiple: true,
    limitTags: 4,
    disableCloseOnSelect: true,
    "aria-label": "Kinds",
    options: normalizedKinds,
    value: value != null ? value : normalizedKinds,
    getOptionLabel: (k) => {
      var _a;
      return (_a = kinds[normalizedKinds.indexOf(k)]) != null ? _a : k;
    },
    onChange: handleChange,
    onBlur: handleEmpty,
    renderOption: (option, { selected }) => {
      var _a;
      return /* @__PURE__ */ React.createElement(FormControlLabel, {
        control: /* @__PURE__ */ React.createElement(Checkbox, {
          icon: /* @__PURE__ */ React.createElement(CheckBoxOutlineBlankIcon, {
            fontSize: "small"
          }),
          checkedIcon: /* @__PURE__ */ React.createElement(CheckBoxIcon, {
            fontSize: "small"
          }),
          checked: selected
        }),
        label: (_a = kinds[normalizedKinds.indexOf(option)]) != null ? _a : option
      });
    },
    size: "small",
    popupIcon: /* @__PURE__ */ React.createElement(ExpandMoreIcon, {
      "data-testid": "selected-kinds-expand"
    }),
    renderInput: (params) => /* @__PURE__ */ React.createElement(TextField, {
      ...params,
      variant: "outlined"
    })
  }));
};

const useStyles$2 = makeStyles({
  formControl: {
    maxWidth: 300
  }
});
const SelectedRelationsFilter = ({
  relationPairs,
  value,
  onChange
}) => {
  const classes = useStyles$2();
  const relations = useMemo(() => relationPairs.flat(), [relationPairs]);
  const handleChange = useCallback((_, v) => {
    onChange(relations.every((r) => v.includes(r)) ? void 0 : v);
  }, [relations, onChange]);
  const handleEmpty = useCallback(() => {
    onChange((value == null ? void 0 : value.length) ? value : void 0);
  }, [value, onChange]);
  return /* @__PURE__ */ React.createElement(Box, {
    pb: 1,
    pt: 1
  }, /* @__PURE__ */ React.createElement(Typography, {
    variant: "button"
  }, "Relations"), /* @__PURE__ */ React.createElement(Autocomplete, {
    className: classes.formControl,
    multiple: true,
    limitTags: 4,
    disableCloseOnSelect: true,
    "aria-label": "Relations",
    options: relations,
    value: value != null ? value : relations,
    onChange: handleChange,
    onBlur: handleEmpty,
    renderOption: (option, { selected }) => /* @__PURE__ */ React.createElement(FormControlLabel, {
      control: /* @__PURE__ */ React.createElement(Checkbox, {
        icon: /* @__PURE__ */ React.createElement(CheckBoxOutlineBlankIcon, {
          fontSize: "small"
        }),
        checkedIcon: /* @__PURE__ */ React.createElement(CheckBoxIcon, {
          fontSize: "small"
        }),
        checked: selected
      }),
      label: option
    }),
    size: "small",
    popupIcon: /* @__PURE__ */ React.createElement(ExpandMoreIcon, {
      "data-testid": "selected-relations-expand"
    }),
    renderInput: (params) => /* @__PURE__ */ React.createElement(TextField, {
      ...params,
      variant: "outlined"
    })
  }));
};

const useStyles$1 = makeStyles({
  root: {
    width: "100%",
    maxWidth: 300
  }
});
const SwitchFilter = ({ label, value, onChange }) => {
  const classes = useStyles$1();
  const handleChange = useCallback((event) => {
    onChange(event.target.checked);
  }, [onChange]);
  return /* @__PURE__ */ React.createElement(Box, {
    pb: 1,
    pt: 1
  }, /* @__PURE__ */ React.createElement(FormControlLabel, {
    control: /* @__PURE__ */ React.createElement(Switch, {
      checked: value,
      onChange: handleChange,
      name: label,
      color: "primary"
    }),
    label,
    className: classes.root
  }));
};

function useCatalogGraphPage({
  initialState = {}
}) {
  const location = useLocation();
  const query = useMemo(() => qs.parse(location.search, { arrayLimit: 0, ignoreQueryPrefix: true }) || {}, [location.search]);
  const [rootEntityNames, setRootEntityNames] = useState(() => {
    var _a;
    return (Array.isArray(query.rootEntityRefs) ? query.rootEntityRefs : (_a = initialState == null ? void 0 : initialState.rootEntityRefs) != null ? _a : []).map((r) => parseEntityRef(r));
  });
  const [maxDepth, setMaxDepth] = useState(() => {
    var _a;
    return typeof query.maxDepth === "string" ? parseMaxDepth(query.maxDepth) : (_a = initialState == null ? void 0 : initialState.maxDepth) != null ? _a : Number.POSITIVE_INFINITY;
  });
  const [selectedRelations, setSelectedRelations] = useState(() => Array.isArray(query.selectedRelations) ? query.selectedRelations : initialState == null ? void 0 : initialState.selectedRelations);
  const [selectedKinds, setSelectedKinds] = useState(() => {
    var _a;
    return (_a = Array.isArray(query.selectedKinds) ? query.selectedKinds : initialState == null ? void 0 : initialState.selectedKinds) == null ? void 0 : _a.map((k) => k.toLocaleLowerCase("en-US"));
  });
  const [unidirectional, setUnidirectional] = useState(() => {
    var _a;
    return typeof query.unidirectional === "string" ? query.unidirectional === "true" : (_a = initialState == null ? void 0 : initialState.unidirectional) != null ? _a : true;
  });
  const [mergeRelations, setMergeRelations] = useState(() => {
    var _a;
    return typeof query.mergeRelations === "string" ? query.mergeRelations === "true" : (_a = initialState == null ? void 0 : initialState.mergeRelations) != null ? _a : true;
  });
  const [direction, setDirection] = useState(() => {
    var _a;
    return typeof query.direction === "string" ? query.direction : (_a = initialState == null ? void 0 : initialState.direction) != null ? _a : Direction.LEFT_RIGHT;
  });
  const [showFilters, setShowFilters] = useState(() => {
    var _a;
    return typeof query.showFilters === "string" ? query.showFilters === "true" : (_a = initialState == null ? void 0 : initialState.showFilters) != null ? _a : true;
  });
  const toggleShowFilters = useCallback(() => setShowFilters((s) => !s), [setShowFilters]);
  const prevQueryParams = usePrevious(location.search);
  useEffect(() => {
    if (location.search === prevQueryParams) {
      return;
    }
    if (Array.isArray(query.rootEntityRefs)) {
      setRootEntityNames(query.rootEntityRefs.map((r) => parseEntityRef(r)));
    }
    if (typeof query.maxDepth === "string") {
      setMaxDepth(parseMaxDepth(query.maxDepth));
    }
    if (Array.isArray(query.selectedKinds)) {
      setSelectedKinds(query.selectedKinds);
    }
    if (Array.isArray(query.selectedRelations)) {
      setSelectedRelations(query.selectedRelations);
    }
    if (typeof query.unidirectional === "string") {
      setUnidirectional(query.unidirectional === "true");
    }
    if (typeof query.mergeRelations === "string") {
      setMergeRelations(query.mergeRelations === "true");
    }
    if (typeof query.direction === "string") {
      setDirection(query.direction);
    }
    if (typeof query.showFilters === "string") {
      setShowFilters(query.showFilters === "true");
    }
  }, [
    prevQueryParams,
    location.search,
    query,
    setRootEntityNames,
    setMaxDepth,
    setSelectedKinds,
    setSelectedRelations,
    setUnidirectional,
    setMergeRelations,
    setDirection,
    setShowFilters
  ]);
  const previousRootEntityRefs = usePrevious(rootEntityNames.map((e) => stringifyEntityRef(e)));
  useEffect(() => {
    const rootEntityRefs = rootEntityNames.map((e) => stringifyEntityRef(e));
    const newParams = qs.stringify({
      rootEntityRefs,
      maxDepth: isFinite(maxDepth) ? maxDepth : "\u221E",
      selectedKinds,
      selectedRelations,
      unidirectional,
      mergeRelations,
      direction,
      showFilters
    }, { arrayFormat: "brackets", addQueryPrefix: true });
    const newUrl = `${window.location.pathname}${newParams}`;
    if (!previousRootEntityRefs || rootEntityRefs.length === previousRootEntityRefs.length && rootEntityRefs.every((v, i) => v === previousRootEntityRefs[i])) {
      window.history.replaceState(null, document.title, newUrl);
    } else {
      window.history.pushState(null, document.title, newUrl);
    }
  }, [
    rootEntityNames,
    maxDepth,
    selectedKinds,
    selectedRelations,
    unidirectional,
    mergeRelations,
    direction,
    showFilters,
    previousRootEntityRefs
  ]);
  return {
    rootEntityNames,
    setRootEntityNames,
    maxDepth,
    setMaxDepth,
    selectedRelations,
    setSelectedRelations,
    selectedKinds,
    setSelectedKinds,
    unidirectional,
    setUnidirectional,
    mergeRelations,
    setMergeRelations,
    direction,
    setDirection,
    showFilters,
    toggleShowFilters
  };
}
function parseMaxDepth(value) {
  return value === "\u221E" ? Number.POSITIVE_INFINITY : Number(value);
}

const useStyles = makeStyles((theme) => ({
  content: {
    minHeight: 0
  },
  container: {
    height: "100%",
    maxHeight: "100%",
    minHeight: 0
  },
  fullHeight: {
    maxHeight: "100%",
    display: "flex",
    minHeight: 0
  },
  graphWrapper: {
    position: "relative",
    flex: 1,
    minHeight: 0,
    display: "flex"
  },
  graph: {
    flex: 1,
    minHeight: 0
  },
  legend: {
    position: "absolute",
    bottom: 0,
    right: 0,
    padding: theme.spacing(1),
    "& .icon": {
      verticalAlign: "bottom"
    }
  },
  filters: {
    display: "grid",
    gridGap: theme.spacing(1),
    gridAutoRows: "auto",
    [theme.breakpoints.up("lg")]: {
      display: "block"
    },
    [theme.breakpoints.only("md")]: {
      gridTemplateColumns: "repeat(3, 1fr)"
    },
    [theme.breakpoints.only("sm")]: {
      gridTemplateColumns: "repeat(2, 1fr)"
    },
    [theme.breakpoints.down("xs")]: {
      gridTemplateColumns: "repeat(1, 1fr)"
    }
  }
}));
const CatalogGraphPage = (props) => {
  const { relationPairs = ALL_RELATION_PAIRS, initialState } = props;
  const navigate = useNavigate();
  const classes = useStyles();
  const catalogEntityRoute = useRouteRef(entityRouteRef);
  const {
    maxDepth,
    setMaxDepth,
    selectedKinds,
    setSelectedKinds,
    selectedRelations,
    setSelectedRelations,
    unidirectional,
    setUnidirectional,
    mergeRelations,
    setMergeRelations,
    direction,
    setDirection,
    rootEntityNames,
    setRootEntityNames,
    showFilters,
    toggleShowFilters
  } = useCatalogGraphPage({ initialState });
  const analytics = useAnalytics();
  const onNodeClick = useCallback((node, event) => {
    var _a, _b;
    const nodeEntityName = parseEntityRef(node.id);
    if (event.shiftKey) {
      const path = catalogEntityRoute({
        kind: nodeEntityName.kind.toLocaleLowerCase("en-US"),
        namespace: nodeEntityName.namespace.toLocaleLowerCase("en-US"),
        name: nodeEntityName.name
      });
      analytics.captureEvent("click", (_a = node.title) != null ? _a : humanizeEntityRef(nodeEntityName), { attributes: { to: path } });
      navigate(path);
    } else {
      analytics.captureEvent("click", (_b = node.title) != null ? _b : humanizeEntityRef(nodeEntityName));
      setRootEntityNames([nodeEntityName]);
    }
  }, [catalogEntityRoute, navigate, setRootEntityNames, analytics]);
  return /* @__PURE__ */ React.createElement(Page, {
    themeId: "home"
  }, /* @__PURE__ */ React.createElement(Header, {
    title: "Catalog Graph",
    subtitle: rootEntityNames.map((e) => humanizeEntityRef(e)).join(", ")
  }), /* @__PURE__ */ React.createElement(Content, {
    stretch: true,
    className: classes.content
  }, /* @__PURE__ */ React.createElement(ContentHeader, {
    titleComponent: /* @__PURE__ */ React.createElement(ToggleButton, {
      value: "show filters",
      selected: showFilters,
      onChange: () => toggleShowFilters()
    }, /* @__PURE__ */ React.createElement(FilterListIcon, null), " Filters")
  }, /* @__PURE__ */ React.createElement(SupportButton, null, "Start tracking your component in by adding it to the software catalog.")), /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    alignItems: "stretch",
    className: classes.container
  }, showFilters && /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    xs: 12,
    lg: 2,
    className: classes.filters
  }, /* @__PURE__ */ React.createElement(MaxDepthFilter, {
    value: maxDepth,
    onChange: setMaxDepth
  }), /* @__PURE__ */ React.createElement(SelectedKindsFilter, {
    value: selectedKinds,
    onChange: setSelectedKinds
  }), /* @__PURE__ */ React.createElement(SelectedRelationsFilter, {
    value: selectedRelations,
    onChange: setSelectedRelations,
    relationPairs
  }), /* @__PURE__ */ React.createElement(DirectionFilter, {
    value: direction,
    onChange: setDirection
  }), /* @__PURE__ */ React.createElement(SwitchFilter, {
    value: unidirectional,
    onChange: setUnidirectional,
    label: "Simplified"
  }), /* @__PURE__ */ React.createElement(SwitchFilter, {
    value: mergeRelations,
    onChange: setMergeRelations,
    label: "Merge Relations"
  })), /* @__PURE__ */ React.createElement(Grid, {
    item: true,
    xs: true,
    className: classes.fullHeight
  }, /* @__PURE__ */ React.createElement(Paper, {
    className: classes.graphWrapper
  }, /* @__PURE__ */ React.createElement(Typography, {
    variant: "caption",
    color: "textSecondary",
    display: "block",
    className: classes.legend
  }, /* @__PURE__ */ React.createElement(ZoomOutMap, {
    className: "icon"
  }), " Use pinch & zoom to move around the diagram. Click to change active node, shift click to navigate to entity."), /* @__PURE__ */ React.createElement(EntityRelationsGraph, {
    rootEntityNames,
    maxDepth,
    kinds: selectedKinds && selectedKinds.length > 0 ? selectedKinds : void 0,
    relations: selectedRelations && selectedRelations.length > 0 ? selectedRelations : void 0,
    mergeRelations,
    unidirectional,
    onNodeClick,
    direction,
    relationPairs,
    className: classes.graph,
    zoom: "enabled"
  }))))));
};

export { CatalogGraphPage };
//# sourceMappingURL=index-97452b61.esm.js.map
