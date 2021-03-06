import { RELATION_HAS_PART } from '@backstage/catalog-model';
import React from 'react';
import { R as RelatedEntitiesCard, s as systemEntityColumns, a as asSystemEntities, b as systemEntityHelpLink } from './presets-13b889b9.esm.js';
import '@material-ui/core';
import '@backstage/plugin-catalog-react';
import '@backstage/core-components';

function HasSystemsCard(props) {
  const { variant = "gridItem" } = props;
  return /* @__PURE__ */ React.createElement(RelatedEntitiesCard, {
    variant,
    title: "Has systems",
    entityKind: "System",
    relationType: RELATION_HAS_PART,
    columns: systemEntityColumns,
    asRenderableEntities: asSystemEntities,
    emptyMessage: "No system is part of this domain",
    emptyHelpLink: systemEntityHelpLink
  });
}

export { HasSystemsCard };
//# sourceMappingURL=index-3763491b.esm.js.map
