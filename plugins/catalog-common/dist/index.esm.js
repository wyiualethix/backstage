import { createPermission } from '@backstage/plugin-permission-common';

const RESOURCE_TYPE_CATALOG_ENTITY = "catalog-entity";
const catalogEntityReadPermission = createPermission({
  name: "catalog.entity.read",
  attributes: {
    action: "read"
  },
  resourceType: RESOURCE_TYPE_CATALOG_ENTITY
});
const catalogEntityCreatePermission = createPermission({
  name: "catalog.entity.create",
  attributes: {
    action: "create"
  }
});
const catalogEntityDeletePermission = createPermission({
  name: "catalog.entity.delete",
  attributes: {
    action: "delete"
  },
  resourceType: RESOURCE_TYPE_CATALOG_ENTITY
});
const catalogEntityRefreshPermission = createPermission({
  name: "catalog.entity.refresh",
  attributes: {
    action: "update"
  },
  resourceType: RESOURCE_TYPE_CATALOG_ENTITY
});
const catalogLocationReadPermission = createPermission({
  name: "catalog.location.read",
  attributes: {
    action: "read"
  }
});
const catalogLocationCreatePermission = createPermission({
  name: "catalog.location.create",
  attributes: {
    action: "create"
  }
});
const catalogLocationDeletePermission = createPermission({
  name: "catalog.location.delete",
  attributes: {
    action: "delete"
  }
});

export { RESOURCE_TYPE_CATALOG_ENTITY, catalogEntityCreatePermission, catalogEntityDeletePermission, catalogEntityReadPermission, catalogEntityRefreshPermission, catalogLocationCreatePermission, catalogLocationDeletePermission, catalogLocationReadPermission };
//# sourceMappingURL=index.esm.js.map
