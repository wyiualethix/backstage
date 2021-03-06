import { ApiFactory, AppTheme, BackstagePlugin, IconComponent } from '@backstage/core-plugin-api';
import { ComponentType, ReactNode } from 'react';
/** @public */
export declare type DevAppPageOptions = {
    path?: string;
    element: JSX.Element;
    children?: JSX.Element;
    title?: string;
    icon?: IconComponent;
};
/**
 * DevApp builder that is similar to the App builder API, but creates an App
 * with the purpose of developing one or more plugins inside it.
 *
 * @public
 */
export declare class DevAppBuilder {
    private readonly plugins;
    private readonly apis;
    private readonly rootChildren;
    private readonly routes;
    private readonly sidebarItems;
    private defaultPage?;
    private themes?;
    /**
     * Register one or more plugins to render in the dev app
     */
    registerPlugin(...plugins: BackstagePlugin[]): DevAppBuilder;
    /**
     * Register an API factory to add to the app
     */
    registerApi<Api, Impl extends Api, Deps extends {
        [name in string]: unknown;
    }>(factory: ApiFactory<Api, Impl, Deps>): DevAppBuilder;
    /**
     * Adds a React node to place just inside the App Provider.
     *
     * Useful for adding more global components like the AlertDisplay.
     */
    addRootChild(node: ReactNode): DevAppBuilder;
    /**
     * Adds a page component along with accompanying sidebar item.
     *
     * If no path is provided one will be generated.
     * If no title is provided, no sidebar item will be created.
     */
    addPage(opts: DevAppPageOptions): DevAppBuilder;
    /**
     * Adds an array of themes to override the default theme.
     */
    addThemes(themes: AppTheme[]): this;
    /**
     * Build a DevApp component using the resources registered so far
     */
    build(): ComponentType<{}>;
    /**
     * Build and render directory to #root element, with react hot loading.
     */
    render(): void;
}
/**
 * Creates a dev app for rendering one or more plugins and exposing the touch points of the plugin.
 *
 * @public
 */
export declare function createDevApp(): DevAppBuilder;
