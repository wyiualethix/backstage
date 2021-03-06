'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pluginPermissionCommon = require('@backstage/plugin-permission-common');

const RESOURCE_TYPE_CATALOG_ENTITY = "catalog-entity";
const catalogEntityReadPermission = pluginPermissionCommon.createPermission({
  name: "catalog.entity.read",
  attributes: {
    action: "read"
  },
  resourceType: RESOURCE_TYPE_CATALOG_ENTITY
});
const catalogEntityCreatePermission = pluginPermissionCommon.createPermission({
  name: "catalog.entity.create",
  attributes: {
    action: "create"
  }
});
const catalogEntityDeletePermission = pluginPermissionCommon.createPermission({
  name: "catalog.entity.delete",
  attributes: {
    action: "delete"
  },
  resourceType: RESOURCE_TYPE_CATALOG_ENTITY
});
const catalogEntityRefreshPermission = pluginPermissionCommon.createPermission({
  name: "catalog.entity.refresh",
  attributes: {
    action: "update"
  },
  resourceType: RESOURCE_TYPE_CATALOG_ENTITY
});
const catalogLocationReadPermission = pluginPermissionCommon.createPermission({
  name: "catalog.location.read",
  attributes: {
    action: "read"
  }
});
const catalogLocationCreatePermission = pluginPermissionCommon.createPermission({
  name: "catalog.location.create",
  attributes: {
    action: "create"
  }
});
const catalogLocationDeletePermission = pluginPermissionCommon.createPermission({
  name: "catalog.location.delete",
  attributes: {
    action: "delete"
  }
});

exports.RESOURCE_TYPE_CATALOG_ENTITY = RESOURCE_TYPE_CATALOG_ENTITY;
exports.catalogEntityCreatePermission = catalogEntityCreatePermission;
exports.catalogEntityDeletePermission = catalogEntityDeletePermission;
exports.catalogEntityReadPermission = catalogEntityReadPermission;
exports.catalogEntityRefreshPermission = catalogEntityRefreshPermission;
exports.catalogLocationCreatePermission = catalogLocationCreatePermission;
exports.catalogLocationDeletePermission = catalogLocationDeletePermission;
exports.catalogLocationReadPermission = catalogLocationReadPermission;
//# sourceMappingURL=index.cjs.js.map
