import { ComponentEntity, Entity, ResourceEntity, SystemEntity } from '@backstage/catalog-model';
import { TableColumn } from '@backstage/core-components';
export declare const componentEntityColumns: TableColumn<ComponentEntity>[];
export declare const componentEntityHelpLink: string;
export declare const asComponentEntities: (entities: Entity[]) => ComponentEntity[];
export declare const resourceEntityColumns: TableColumn<ResourceEntity>[];
export declare const resourceEntityHelpLink: string;
export declare const asResourceEntities: (entities: Entity[]) => ResourceEntity[];
export declare const systemEntityColumns: TableColumn<SystemEntity>[];
export declare const systemEntityHelpLink: string;
export declare const asSystemEntities: (entities: Entity[]) => SystemEntity[];
