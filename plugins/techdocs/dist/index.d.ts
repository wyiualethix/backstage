/// <reference types="react" />
import { TechDocsMetadata, TechDocsEntityMetadata } from '@backstage/plugin-techdocs-react';
import { CompoundEntityRef, Entity } from '@backstage/catalog-model';
import * as _backstage_core_plugin_api from '@backstage/core-plugin-api';
import { DiscoveryApi, FetchApi, IdentityApi } from '@backstage/core-plugin-api';
import { Config } from '@backstage/config';
import * as React from 'react';
import React__default, { ReactNode, PropsWithChildren } from 'react';
import { ToolbarProps } from '@material-ui/core';
import { ResultHighlight } from '@backstage/plugin-search-common';
import { TableColumn, TableProps } from '@backstage/core-components';
import { UserListFilterKind } from '@backstage/plugin-catalog-react';
import { CSSProperties } from '@material-ui/styles';

/**
 * Helper function that gives the children of {@link TechDocsReaderPage} access to techdocs and entity metadata
 *
 * @public
 */
declare type TechDocsReaderPageRenderFunction = ({ techdocsMetadataValue, entityMetadataValue, entityRef, }: {
    techdocsMetadataValue?: TechDocsMetadata | undefined;
    entityMetadataValue?: TechDocsEntityMetadata | undefined;
    entityRef: CompoundEntityRef;
    /**
     * @deprecated You can continue pass this property, but directly to the `TechDocsReaderPageContent` component.
     */
    onReady?: () => void;
}) => JSX.Element;

/**
 * Utility API reference for the {@link TechDocsStorageApi}.
 *
 * @public
 * @deprecated Import from `@backstage/plugin-techdocs-react` instead
 */
declare const techdocsStorageApiRef: _backstage_core_plugin_api.ApiRef<TechDocsStorageApi>;
/**
 * Utility API reference for the {@link TechDocsApi}.
 *
 * @public
 * @deprecated Import from `@backstage/plugin-techdocs-react` instead
 */
declare const techdocsApiRef: _backstage_core_plugin_api.ApiRef<TechDocsApi>;
/**
 * The outcome of a docs sync operation.
 *
 * @public
 * @deprecated Import from `@backstage/plugin-techdocs-react` instead
 */
declare type SyncResult = 'cached' | 'updated';
/**
 * API which talks to TechDocs storage to fetch files to render.
 *
 * @public
 * @deprecated Import from `@backstage/plugin-techdocs-react` instead
 */
interface TechDocsStorageApi {
    getApiOrigin(): Promise<string>;
    getStorageUrl(): Promise<string>;
    getBuilder(): Promise<string>;
    getEntityDocs(entityId: CompoundEntityRef, path: string): Promise<string>;
    syncEntityDocs(entityId: CompoundEntityRef, logHandler?: (line: string) => void): Promise<SyncResult>;
    getBaseUrl(oldBaseUrl: string, entityId: CompoundEntityRef, path: string): Promise<string>;
}
/**
 * API to talk to techdocs-backend.
 *
 * @public
 * @deprecated Import from `@backstage/plugin-techdocs-react` instead
 */
interface TechDocsApi {
    getApiOrigin(): Promise<string>;
    getTechDocsMetadata(entityId: CompoundEntityRef): Promise<TechDocsMetadata>;
    getEntityMetadata(entityId: CompoundEntityRef): Promise<TechDocsEntityMetadata>;
}

/**
 * API to talk to `techdocs-backend`.
 *
 * @public
 */
declare class TechDocsClient implements TechDocsApi {
    configApi: Config;
    discoveryApi: DiscoveryApi;
    private fetchApi;
    constructor(options: {
        configApi: Config;
        discoveryApi: DiscoveryApi;
        fetchApi: FetchApi;
    });
    getApiOrigin(): Promise<string>;
    /**
     * Retrieve TechDocs metadata.
     *
     * When docs are built, we generate a techdocs_metadata.json and store it along with the generated
     * static files. It includes necessary data about the docs site. This method requests techdocs-backend
     * which retrieves the TechDocs metadata.
     *
     * @param entityId - Object containing entity data like name, namespace, etc.
     */
    getTechDocsMetadata(entityId: CompoundEntityRef): Promise<TechDocsMetadata>;
    /**
     * Retrieve metadata about an entity.
     *
     * This method requests techdocs-backend which uses the catalog APIs to respond with filtered
     * information required here.
     *
     * @param entityId - Object containing entity data like name, namespace, etc.
     */
    getEntityMetadata(entityId: CompoundEntityRef): Promise<TechDocsEntityMetadata>;
}
/**
 * API which talks to TechDocs storage to fetch files to render.
 *
 * @public
 */
declare class TechDocsStorageClient implements TechDocsStorageApi {
    configApi: Config;
    discoveryApi: DiscoveryApi;
    identityApi: IdentityApi;
    private fetchApi;
    constructor(options: {
        configApi: Config;
        discoveryApi: DiscoveryApi;
        identityApi: IdentityApi;
        fetchApi: FetchApi;
    });
    getApiOrigin(): Promise<string>;
    getStorageUrl(): Promise<string>;
    getBuilder(): Promise<string>;
    /**
     * Fetch HTML content as text for an individual docs page in an entity's docs site.
     *
     * @param entityId - Object containing entity data like name, namespace, etc.
     * @param path - The unique path to an individual docs page e.g. overview/what-is-new
     * @returns HTML content of the docs page as string
     * @throws Throws error when the page is not found.
     */
    getEntityDocs(entityId: CompoundEntityRef, path: string): Promise<string>;
    /**
     * Check if docs are on the latest version and trigger rebuild if not
     *
     * @param entityId - Object containing entity data like name, namespace, etc.
     * @param logHandler - Callback to receive log messages from the build process
     * @returns Whether documents are currently synchronized to newest version
     * @throws Throws error on error from sync endpoint in Techdocs Backend
     */
    syncEntityDocs(entityId: CompoundEntityRef, logHandler?: (line: string) => void): Promise<SyncResult>;
    getBaseUrl(oldBaseUrl: string, entityId: CompoundEntityRef, path: string): Promise<string>;
}

/**
 * @public
 * A state representation that is used to configure the UI of <Reader />
 */
declare type ContentStateTypes = 
/** There is nothing to display but a loading indicator */
'CHECKING'
/** There is no content yet -> present a full screen loading page */
 | 'INITIAL_BUILD'
/** There is content, but the backend is about to update it */
 | 'CONTENT_STALE_REFRESHING'
/** There is content, but after a reload, the content will be different */
 | 'CONTENT_STALE_READY'
/** There is content, the backend tried to update it, but failed */
 | 'CONTENT_STALE_ERROR'
/** There is nothing to see but a "not found" page. Is also shown on page load errors */
 | 'CONTENT_NOT_FOUND'
/** There is only the latest and greatest content */
 | 'CONTENT_FRESH';
/**
 * @public shared reader state
 */
declare type ReaderState = {
    state: ContentStateTypes;
    path: string;
    contentReload: () => void;
    content?: string;
    contentErrorMessage?: string;
    syncErrorMessage?: string;
    buildLog: string[];
};

/**
 * @public Render function for {@link TechDocsReaderProvider}
 */
declare type TechDocsReaderProviderRenderFunction = (value: ReaderState) => JSX.Element;
/**
 * @public Props for {@link TechDocsReaderProvider}
 */
declare type TechDocsReaderProviderProps = {
    children: TechDocsReaderProviderRenderFunction | ReactNode;
};
/**
 * Provides shared building process state to the reader page components.
 *
 * @public
 */
declare const TechDocsReaderProvider: ({ children, }: TechDocsReaderProviderProps) => JSX.Element;

/**
 * Props for {@link TechDocsReaderLayout}
 * @public
 */
declare type TechDocsReaderLayoutProps = {
    /**
     * Show or hide the header, defaults to true.
     */
    withHeader?: boolean;
    /**
     * Show or hide the content search bar, defaults to true.
     */
    withSearch?: boolean;
};
/**
 * Default TechDocs reader page structure composed with a header and content
 * @public
 */
declare const TechDocsReaderLayout: ({ withSearch, withHeader, }: TechDocsReaderLayoutProps) => JSX.Element;
/**
 * @public
 */
declare type TechDocsReaderPageProps = {
    entityRef?: CompoundEntityRef;
    children?: TechDocsReaderPageRenderFunction | ReactNode;
};

/**
 * Props for {@link TechDocsReaderPageHeader}
 *
 * @public
 * @deprecated No need to pass down properties anymore. The component consumes data from `TechDocsReaderPageContext` instead. Use the {@link @backstage/plugin-techdocs-react#useTechDocsReaderPage} hook for custom header.
 */
declare type TechDocsReaderPageHeaderProps = PropsWithChildren<{
    entityRef?: CompoundEntityRef;
    entityMetadata?: TechDocsEntityMetadata;
    techDocsMetadata?: TechDocsMetadata;
}>;
/**
 * Renders the reader page header.
 * This component does not accept props, please use
 * the Tech Docs add-ons to customize it
 * @public
 */
declare const TechDocsReaderPageHeader: (props: TechDocsReaderPageHeaderProps) => JSX.Element | null;

/**
 * Props for {@link TechDocsReaderPageContent}
 * @public
 */
declare type TechDocsReaderPageContentProps = {
    /**
     * @deprecated No need to pass down entityRef as property anymore. Consumes the entityName from `TechDocsReaderPageContext`. Use the {@link @backstage/plugin-techdocs-react#useTechDocsReaderPage} hook for custom reader page content.
     */
    entityRef?: CompoundEntityRef;
    /**
     * Show or hide the search bar, defaults to true.
     */
    withSearch?: boolean;
    /**
     * Callback called when the content is rendered.
     */
    onReady?: () => void;
};
/**
 * Renders the reader page content
 * @public
 */
declare const TechDocsReaderPageContent: (props: TechDocsReaderPageContentProps) => JSX.Element;
/**
 * Component responsible for rendering TechDocs documentation
 * @public
 * @deprecated use `TechDocsReaderPageContent` component instead.
 */
declare const Reader: (props: TechDocsReaderPageContentProps) => JSX.Element;

/**
 * Renders the reader page subheader.
 * Please use the Tech Docs add-ons to customize it
 * @public
 */
declare const TechDocsReaderPageSubheader: ({ toolbarProps, }: {
    toolbarProps?: ToolbarProps<"div", {}> | undefined;
}) => JSX.Element | null;

/**
 * Props for {@link TechDocsSearchResultListItem}.
 *
 * @public
 */
declare type TechDocsSearchResultListItemProps = {
    result: any;
    highlight?: ResultHighlight;
    lineClamp?: number;
    asListItem?: boolean;
    asLink?: boolean;
    title?: string;
};
/**
 * Component which renders documentation and related metadata.
 *
 * @public
 */
declare const TechDocsSearchResultListItem: (props: TechDocsSearchResultListItemProps) => JSX.Element;

/**
 * Props for {@link TechDocsSearch}
 *
 * @public
 */
declare type TechDocsSearchProps = {
    entityId: CompoundEntityRef;
    debounceTime?: number;
};
/**
 * Component used to render search bar on TechDocs page, scoped to
 *
 * @public
 */
declare const TechDocsSearch: (props: TechDocsSearchProps) => JSX.Element;

/**
 * Component responsible to get entities from entity list context and pass down to DocsCardGrid
 *
 * @public
 */
declare const EntityListDocsGrid: () => JSX.Element;

/**
 * Props for {@link DocsCardGrid}
 *
 * @public
 */
declare type DocsCardGridProps = {
    entities: Entity[] | undefined;
};
/**
 * Component which accepts a list of entities and renders a item card for each entity
 *
 * @public
 */
declare const DocsCardGrid: (props: DocsCardGridProps) => JSX.Element | null;

/**
 * Generic representing the metadata structure for a docs table row.
 *
 * @public
 */
declare type DocsTableRow = {
    entity: Entity;
    resolved: {
        docsUrl: string;
        ownedByRelationsTitle: string;
        ownedByRelations: CompoundEntityRef[];
    };
};

/**
 * Props for {@link EntityListDocsTable}.
 *
 * @public
 */
declare type EntityListDocsTableProps = {
    columns?: TableColumn<DocsTableRow>[];
    actions?: TableProps<DocsTableRow>['actions'];
};
/**
 * Component which renders a table with entities from catalog.
 *
 * @public
 */
declare const EntityListDocsTable: {
    (props: EntityListDocsTableProps): JSX.Element;
    columns: {
        createNameColumn(): TableColumn<DocsTableRow>;
        createOwnerColumn(): TableColumn<DocsTableRow>;
        createTypeColumn(): TableColumn<DocsTableRow>;
    };
    actions: {
        createCopyDocsUrlAction(copyToClipboard: Function): (row: DocsTableRow) => {
            icon: () => JSX.Element;
            tooltip: string;
            onClick: () => any;
        };
        createStarEntityAction(isStarredEntity: Function, toggleStarredEntity: Function): ({ entity }: DocsTableRow) => {
            cellStyle: {
                paddingLeft: string;
            };
            icon: () => JSX.Element;
            tooltip: string;
            onClick: () => any;
        };
    };
};

/**
 * Props for {@link DocsTable}.
 *
 * @public
 */
declare type DocsTableProps = {
    entities: Entity[] | undefined;
    title?: string | undefined;
    loading?: boolean | undefined;
    columns?: TableColumn<DocsTableRow>[];
    actions?: TableProps<DocsTableRow>['actions'];
};
/**
 * Component which renders a table documents
 *
 * @public
 */
declare const DocsTable: {
    (props: DocsTableProps): JSX.Element | null;
    columns: {
        createNameColumn(): TableColumn<DocsTableRow>;
        createOwnerColumn(): TableColumn<DocsTableRow>;
        createTypeColumn(): TableColumn<DocsTableRow>;
    };
    actions: {
        createCopyDocsUrlAction(copyToClipboard: Function): (row: DocsTableRow) => {
            icon: () => JSX.Element;
            tooltip: string;
            onClick: () => any;
        };
        createStarEntityAction(isStarredEntity: Function, toggleStarredEntity: Function): ({ entity }: DocsTableRow) => {
            cellStyle: {
                paddingLeft: string;
            };
            icon: () => JSX.Element;
            tooltip: string;
            onClick: () => any;
        };
    };
};

/**
 * Props for {@link DefaultTechDocsHome}
 *
 * @public
 */
declare type DefaultTechDocsHomeProps = {
    initialFilter?: UserListFilterKind;
    columns?: TableColumn<DocsTableRow>[];
    actions?: TableProps<DocsTableRow>['actions'];
};
/**
 * Component which renders a default documentation landing page.
 *
 * @public
 */
declare const DefaultTechDocsHome: (props: DefaultTechDocsHomeProps) => JSX.Element;

/**
 * Available panel types
 *
 * @public
 */
declare type PanelType = 'DocsCardGrid' | 'DocsTable';
/**
 * Type representing a TechDocsCustomHome panel.
 *
 * @public
 */
interface PanelConfig {
    title: string;
    description: string;
    panelType: PanelType;
    panelCSS?: CSSProperties;
    filterPredicate: ((entity: Entity) => boolean) | string;
}
/**
 * Type representing a TechDocsCustomHome tab.
 *
 * @public
 */
interface TabConfig {
    label: string;
    panels: PanelConfig[];
}
/**
 * Type representing a list of TechDocsCustomHome tabs.
 *
 * @public
 */
declare type TabsConfig = TabConfig[];
/**
 * Props for {@link TechDocsCustomHome}
 *
 * @public
 */
declare type TechDocsCustomHomeProps = {
    tabsConfig: TabsConfig;
};

/**
 * Props for {@link TechDocsPageWrapper}
 *
 * @public
 */
declare type TechDocsPageWrapperProps = {
    children?: React__default.ReactNode;
};
/**
 * Component wrapping a techdocs page with Page and Header components
 *
 * @public
 */
declare const TechDocsPageWrapper: (props: TechDocsPageWrapperProps) => JSX.Element;

/**
 * Component responsible for updating TechDocs filters
 *
 * @public
 */
declare const TechDocsPicker: () => null;

/**
 * The Backstage plugin that renders technical documentation for your components
 *
 * @public
 */
declare const techdocsPlugin: _backstage_core_plugin_api.BackstagePlugin<{
    root: _backstage_core_plugin_api.RouteRef<undefined>;
    docRoot: _backstage_core_plugin_api.RouteRef<{
        name: string;
        kind: string;
        namespace: string;
    }>;
    entityContent: _backstage_core_plugin_api.RouteRef<undefined>;
}, {}>;
/**
 * Routable extension used to render docs
 *
 * @public
 */
declare const TechdocsPage: () => JSX.Element;
/**
 * Routable extension used to render docs on Entity page
 *
 * @public
 */
declare const EntityTechdocsContent: (props: {
    children?: React.ReactNode;
}) => JSX.Element | null;
/**
 * Component which takes a custom tabs config object and renders a documentation landing page.
 *
 * @public
 */
declare const TechDocsCustomHome: (props: TechDocsCustomHomeProps) => JSX.Element;
/**
 * Responsible for rendering the provided router element
 *
 * @public
 */
declare const TechDocsIndexPage: () => JSX.Element;
/**
 * Component responsible for composing a TechDocs reader page experience
 *
 * @public
 */
declare const TechDocsReaderPage: (props: TechDocsReaderPageProps) => JSX.Element;

/**
 * Helper that takes in entity and returns true/false if TechDocs is available for the entity
 *
 * @public
 */
declare const isTechDocsAvailable: (entity: Entity) => boolean;
/**
 * Responsible for registering routes for TechDocs, TechDocs Homepage and separate TechDocs page
 *
 * @public
 */
declare const Router: () => JSX.Element;
/**
 * Responsible for registering route to view docs on Entity page
 *
 * @public
 */
declare const EmbeddedDocsRouter: (props: PropsWithChildren<{}>) => JSX.Element | null;

/**
 * The Backstage plugin that renders technical documentation for your components
 *
 * @packageDocumentation
 */

/**
 * @deprecated Import from `@backstage/plugin-techdocs-react` instead
 *
 * @public
 */
declare type DeprecatedTechDocsMetadata = TechDocsMetadata;
/**
 * @deprecated Import from `@backstage/plugin-techdocs-react` instead
 *
 * @public
 */
declare type DeprecatedTechDocsEntityMetadata = TechDocsEntityMetadata;

export { ContentStateTypes, DefaultTechDocsHome, DefaultTechDocsHomeProps, DocsCardGrid, DocsCardGridProps, DocsTable, DocsTableProps, DocsTableRow, EmbeddedDocsRouter, EntityListDocsGrid, EntityListDocsTable, EntityListDocsTableProps, EntityTechdocsContent, PanelConfig, PanelType, Reader, ReaderState, Router, SyncResult, TabConfig, TabsConfig, TechDocsApi, TechDocsClient, TechDocsCustomHome, TechDocsCustomHomeProps, DeprecatedTechDocsEntityMetadata as TechDocsEntityMetadata, TechDocsIndexPage, DeprecatedTechDocsMetadata as TechDocsMetadata, TechDocsPageWrapper, TechDocsPageWrapperProps, TechDocsPicker, TechDocsReaderLayout, TechDocsReaderLayoutProps, TechDocsReaderPage, TechDocsReaderPageContent, TechDocsReaderPageContentProps, TechDocsReaderPageHeader, TechDocsReaderPageHeaderProps, TechDocsReaderPageProps, TechDocsReaderPageRenderFunction, TechDocsReaderPageSubheader, TechDocsReaderProvider, TechDocsReaderProviderProps, TechDocsReaderProviderRenderFunction, TechDocsSearch, TechDocsSearchProps, TechDocsSearchResultListItem, TechDocsSearchResultListItemProps, TechDocsStorageApi, TechDocsStorageClient, TechdocsPage, isTechDocsAvailable, techdocsPlugin as plugin, techdocsApiRef, techdocsPlugin, techdocsStorageApiRef };
