import { Typography } from '@material-ui/core';
import { useEntity, useRelatedEntities, EntityTable } from '@backstage/plugin-catalog-react';
import React from 'react';
import { InfoCard, Progress, ResponseErrorPanel, Link } from '@backstage/core-components';

function RelatedEntitiesCard(props) {
  const {
    variant = "gridItem",
    title,
    columns,
    entityKind,
    relationType,
    emptyMessage,
    emptyHelpLink,
    asRenderableEntities
  } = props;
  const { entity } = useEntity();
  const { entities, loading, error } = useRelatedEntities(entity, {
    type: relationType,
    kind: entityKind
  });
  if (loading) {
    return /* @__PURE__ */ React.createElement(InfoCard, {
      variant,
      title
    }, /* @__PURE__ */ React.createElement(Progress, null));
  }
  if (error) {
    return /* @__PURE__ */ React.createElement(InfoCard, {
      variant,
      title
    }, /* @__PURE__ */ React.createElement(ResponseErrorPanel, {
      error
    }));
  }
  return /* @__PURE__ */ React.createElement(EntityTable, {
    title,
    variant,
    emptyContent: /* @__PURE__ */ React.createElement("div", {
      style: { textAlign: "center" }
    }, /* @__PURE__ */ React.createElement(Typography, {
      variant: "body1"
    }, emptyMessage), /* @__PURE__ */ React.createElement(Typography, {
      variant: "body2"
    }, /* @__PURE__ */ React.createElement(Link, {
      to: emptyHelpLink
    }, "Learn how to change this."))),
    columns,
    entities: asRenderableEntities(entities || [])
  });
}

const componentEntityColumns = [
  EntityTable.columns.createEntityRefColumn({ defaultKind: "component" }),
  EntityTable.columns.createOwnerColumn(),
  EntityTable.columns.createSpecTypeColumn(),
  EntityTable.columns.createSpecLifecycleColumn(),
  EntityTable.columns.createMetadataDescriptionColumn()
];
const componentEntityHelpLink = "https://backstage.io/docs/features/software-catalog/descriptor-format#kind-component";
const asComponentEntities = (entities) => entities;
const resourceEntityColumns = [
  EntityTable.columns.createEntityRefColumn({ defaultKind: "resource" }),
  EntityTable.columns.createOwnerColumn(),
  EntityTable.columns.createSpecTypeColumn(),
  EntityTable.columns.createSpecLifecycleColumn(),
  EntityTable.columns.createMetadataDescriptionColumn()
];
const resourceEntityHelpLink = "https://backstage.io/docs/features/software-catalog/descriptor-format#kind-resource";
const asResourceEntities = (entities) => entities;
const systemEntityColumns = [
  EntityTable.columns.createEntityRefColumn({ defaultKind: "system" }),
  EntityTable.columns.createOwnerColumn(),
  EntityTable.columns.createMetadataDescriptionColumn()
];
const systemEntityHelpLink = "https://backstage.io/docs/features/software-catalog/descriptor-format#kind-system";
const asSystemEntities = (entities) => entities;

export { RelatedEntitiesCard as R, asSystemEntities as a, systemEntityHelpLink as b, componentEntityColumns as c, componentEntityHelpLink as d, asComponentEntities as e, asResourceEntities as f, resourceEntityHelpLink as g, resourceEntityColumns as r, systemEntityColumns as s };
//# sourceMappingURL=presets-13b889b9.esm.js.map
