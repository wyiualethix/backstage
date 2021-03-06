/// <reference types="react" />
import * as _backstage_core_plugin_api from '@backstage/core-plugin-api';

/**
 * Properties for creating an issue in a remote issue tracker.
 *
 * @public
 */
declare type ReportIssueTemplate = {
    /**
     * The title of the issue.
     */
    title: string;
    /**
     * The body or description of the issue.
     */
    body: string;
};
/**
 * A function for returning a custom issue template, given a selection of text
 * on a TechDocs page.
 *
 * @public
 */
declare type ReportIssueTemplateBuilder = ({ selection, }: {
    selection: Selection;
}) => ReportIssueTemplate;

/**
 * Props customizing the <ReportIssue /> Addon.
 *
 * @public
 */
declare type ReportIssueProps = {
    /**
     * Number of milliseconds after a user highlights some text before the report
     * issue link appears above the highlighted text. Defaults to 500ms.
     */
    debounceTime?: number;
    /**
     * An optional function defining how a custom issue title and body should be
     * constructed, given some selected text.
     */
    templateBuilder?: ReportIssueTemplateBuilder;
};

/**
 * The TechDocs addons contrib plugin
 *
 * @public
 */
declare const techdocsModuleAddonsContribPlugin: _backstage_core_plugin_api.BackstagePlugin<{}, {}>;
/**
 * TechDocs addon that lets you expand/collapse the TechDocs main navigation
 * and keep the preferred state in local storage. The addon will render as
 * a button next to the site name if the documentation has nested navigation.
 *
 * @example
 * Here's a simple example:
 * ```
 * import {
 *   DefaultTechDocsHome,
 *   TechDocsIndexPage,
 *   TechDocsReaderPage,
 * } from '@backstage/plugin-techdocs';
 * import { TechDocsAddons } from '@backstage/plugin-techdocs-react/alpha';
 * import { ExpandableNavigation } from '@backstage/plugin-techdocs-module-addons-contrib';
 *
 *
 * const AppRoutes = () => {
 *   <FlatRoutes>
 *     // other plugin routes
 *     <Route path="/docs" element={<TechDocsIndexPage />}>
 *       <DefaultTechDocsHome />
 *     </Route>
 *     <Route
 *       path="/docs/:namespace/:kind/:name/*"
 *       element={<TechDocsReaderPage />}
 *     >
 *       <TechDocsAddons>
 *         <ExpandableNavigation />
 *       </TechDocsAddons>
 *     </Route>
 *   </FlatRoutes>;
 * };
 * ```
 *
 * @public
 */
declare const ExpandableNavigation: () => JSX.Element | null;
/**
 * TechDocs addon that lets you select text and open GitHub/Gitlab issues
 *
 * @remarks
 * Before using it, you should set up an `edit_uri` for your pages as explained {@link https://backstage.io/docs/features/techdocs/faqs#is-it-possible-for-users-to-suggest-changes-or-provide-feedback-on-a-techdocs-page | here} and remember, it only works for Github or Gitlab.
 *
 * @example
 * Here's a simple example:
 * ```
 * import {
 *   DefaultTechDocsHome,
 *   TechDocsIndexPage,
 *   TechDocsReaderPage,
 * } from '@backstage/plugin-techdocs';
 * import { TechDocsAddons } from '@backstage/plugin-techdocs-react';
 * import { ReportIssue } from '@backstage/plugin-techdocs-module-addons-contrib';
 *
 *
 * const AppRoutes = () => {
 *   <FlatRoutes>
 *     // other plugin routes
 *     <Route path="/docs" element={<TechDocsIndexPage />}>
 *       <DefaultTechDocsHome />
 *     </Route>
 *     <Route
 *       path="/docs/:namespace/:kind/:name/*"
 *       element={<TechDocsReaderPage />}
 *     >
 *       <TechDocsAddons>
 *         <ReportIssue />
 *       </TechDocsAddons>
 *     </Route>
 *   </FlatRoutes>;
 * };
 * ```
 *
 * @example
 * Here's an example with `debounceTime` and `templateBuilder` props:
 * ```
 * import {
 *   DefaultTechDocsHome,
 *   TechDocsIndexPage,
 *   TechDocsReaderPage,
 * } from '@backstage/plugin-techdocs';
 * import { TechDocsAddons } from '@backstage/plugin-techdocs-react';
 * import { ReportIssue } from '@backstage/plugin-techdocs-module-addons-contrib';
 *
 * const templateBuilder = ({ selection }: ReportIssueTemplateBuilder) => (({
 *  title: 'Custom issue title',
 *  body: `Custom issue body: ${selection.toString()}`
 * }))
 *
 * const AppRoutes = () => {
 *   <FlatRoutes>
 *     // other plugin routes
 *     <Route path="/docs" element={<TechDocsIndexPage />}>
 *       <DefaultTechDocsHome />
 *     </Route>
 *     <Route
 *       path="/docs/:namespace/:kind/:name/*"
 *       element={<TechDocsReaderPage />}
 *     >
 *       <TechDocsAddons>
 *         <ReportIssue debounceTime={300} templateBuilder={templateBuilder} />
 *       </TechDocsAddons>
 *     </Route>
 *   </FlatRoutes>;
 * ```
 * @param props - Object that can optionally contain `debounceTime` and `templateBuilder` properties.
 * @public
 */
declare const ReportIssue: (props: ReportIssueProps) => JSX.Element | null;
/**
 * This TechDocs addon allows users to customize text size on documentation pages, they can select how much they want to increase or decrease the font size via slider or buttons.
 *
 * @remarks
 * The default value for the font size is 100% of the HTML font size, if the theme does not have a `htmlFontSize` in its typography object, the addon will assume 16px as 100%, and remember, this setting is kept in the browser local storage.
 *
 * @example
 * Here's a simple example:
 * ```
 * import {
 *   DefaultTechDocsHome,
 *   TechDocsIndexPage,
 *   TechDocsReaderPage,
 * } from '@backstage/plugin-techdocs';
 * import { TechDocsAddons } from '@backstage/plugin-techdocs-react';
 * import { TextSize } from '@backstage/plugin-techdocs-module-addons-contrib';
 *
 *
 * const AppRoutes = () => {
 *   <FlatRoutes>
 *     // other plugin routes
 *     <Route path="/docs" element={<TechDocsIndexPage />}>
 *       <DefaultTechDocsHome />
 *     </Route>
 *     <Route
 *       path="/docs/:namespace/:kind/:name/*"
 *       element={<TechDocsReaderPage />}
 *     >
 *       <TechDocsAddons>
 *         <TextSize />
 *       </TechDocsAddons>
 *     </Route>
 *   </FlatRoutes>;
 * };
 * ```
 *
 * @public
 */
declare const TextSize: () => JSX.Element | null;

export { ExpandableNavigation, ReportIssue, ReportIssueProps, ReportIssueTemplate, ReportIssueTemplateBuilder, TextSize, techdocsModuleAddonsContribPlugin };
