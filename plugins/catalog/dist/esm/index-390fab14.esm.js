import { RELATION_DEPENDENCY_OF } from '@backstage/catalog-model';
import React from 'react';
import { R as RelatedEntitiesCard, c as componentEntityColumns, d as componentEntityHelpLink, e as asComponentEntities } from './presets-13b889b9.esm.js';
import '@material-ui/core';
import '@backstage/plugin-catalog-react';
import '@backstage/core-components';

function DependencyOfComponentsCard(props) {
  const { variant = "gridItem", title = "Dependency of components" } = props;
  return /* @__PURE__ */ React.createElement(RelatedEntitiesCard, {
    variant,
    title,
    entityKind: "Component",
    relationType: RELATION_DEPENDENCY_OF,
    columns: componentEntityColumns,
    emptyMessage: "No component depends on this component",
    emptyHelpLink: componentEntityHelpLink,
    asRenderableEntities: asComponentEntities
  });
}

export { DependencyOfComponentsCard };
//# sourceMappingURL=index-390fab14.esm.js.map
