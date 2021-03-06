import React, { useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import { makeStyles } from '@material-ui/core';
import { catalogApiRef, CATALOG_FILTER_EXISTS, useEntityOwnership } from '@backstage/plugin-catalog-react';
import { T as TechDocsPageWrapper, D as DocsTable, a as DocsCardGrid } from './index-a5aa1ac0.esm.js';
import { Content, Progress, WarningPanel, CodeSnippet, HeaderTabs, ContentHeader, SupportButton } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import '@backstage/errors';
import 'event-source-polyfill';
import 'react-router-dom';
import '@backstage/plugin-techdocs-react';
import 'react-use/lib/useAsyncRetry';
import '@backstage/plugin-search-react';
import '@material-ui/icons/Search';
import '@material-ui/lab/Autocomplete';
import 'react-router';
import 'react-use/lib/useDebounce';
import '@material-ui/lab';
import '@material-ui/icons/Close';
import '@backstage/integration-react';
import 'dompurify';
import '@backstage/integration';
import '@material-ui/icons/FeedbackOutlined';
import 'react-dom';
import 'git-url-parse';
import '@material-ui/icons/Menu';
import 'react-helmet';
import '@material-ui/icons/Code';
import '@backstage/catalog-model';
import '@material-ui/icons/Settings';
import 'react-use/lib/useCopyToClipboard';
import 'lodash';
import '@material-ui/icons/Share';
import '@material-ui/styles';
import '@material-ui/icons/Star';
import '@material-ui/icons/StarBorder';

const panels = {
  DocsTable,
  DocsCardGrid
};
const CustomPanel = ({
  config,
  entities,
  index
}) => {
  const useStyles = makeStyles({
    panelContainer: {
      marginBottom: "2rem",
      ...config.panelCSS ? config.panelCSS : {}
    }
  });
  const classes = useStyles();
  const { loading: loadingOwnership, isOwnedEntity } = useEntityOwnership();
  const Panel = panels[config.panelType];
  const shownEntities = entities.filter((entity) => {
    if (config.filterPredicate === "ownedByUser") {
      if (loadingOwnership) {
        return false;
      }
      return isOwnedEntity(entity);
    }
    return typeof config.filterPredicate === "function" && config.filterPredicate(entity);
  });
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(ContentHeader, {
    title: config.title,
    description: config.description
  }, index === 0 ? /* @__PURE__ */ React.createElement(SupportButton, null, "Discover documentation in your ecosystem.") : null), /* @__PURE__ */ React.createElement("div", {
    className: classes.panelContainer
  }, /* @__PURE__ */ React.createElement(Panel, {
    "data-testid": "techdocs-custom-panel",
    entities: shownEntities
  })));
};
const TechDocsCustomHome = (props) => {
  const { tabsConfig } = props;
  const [selectedTab, setSelectedTab] = useState(0);
  const catalogApi = useApi(catalogApiRef);
  const {
    value: entities,
    loading,
    error
  } = useAsync(async () => {
    const response = await catalogApi.getEntities({
      filter: {
        "metadata.annotations.backstage.io/techdocs-ref": CATALOG_FILTER_EXISTS
      },
      fields: [
        "apiVersion",
        "kind",
        "metadata",
        "relations",
        "spec.owner",
        "spec.type"
      ]
    });
    return response.items.filter((entity) => {
      var _a;
      return !!((_a = entity.metadata.annotations) == null ? void 0 : _a["backstage.io/techdocs-ref"]);
    });
  });
  const currentTabConfig = tabsConfig[selectedTab];
  if (loading) {
    return /* @__PURE__ */ React.createElement(TechDocsPageWrapper, null, /* @__PURE__ */ React.createElement(Content, null, /* @__PURE__ */ React.createElement(Progress, null)));
  }
  if (error) {
    return /* @__PURE__ */ React.createElement(TechDocsPageWrapper, null, /* @__PURE__ */ React.createElement(Content, null, /* @__PURE__ */ React.createElement(WarningPanel, {
      severity: "error",
      title: "Could not load available documentation."
    }, /* @__PURE__ */ React.createElement(CodeSnippet, {
      language: "text",
      text: error.toString()
    }))));
  }
  return /* @__PURE__ */ React.createElement(TechDocsPageWrapper, null, /* @__PURE__ */ React.createElement(HeaderTabs, {
    selectedIndex: selectedTab,
    onChange: (index) => setSelectedTab(index),
    tabs: tabsConfig.map(({ label }, index) => ({
      id: index.toString(),
      label
    }))
  }), /* @__PURE__ */ React.createElement(Content, {
    "data-testid": "techdocs-content"
  }, currentTabConfig.panels.map((config, index) => /* @__PURE__ */ React.createElement(CustomPanel, {
    key: index,
    config,
    entities: !!entities ? entities : [],
    index
  }))));
};

export { TechDocsCustomHome };
//# sourceMappingURL=TechDocsCustomHome-38c20d17.esm.js.map
