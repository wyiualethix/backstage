import { AppTheme, IconComponent } from '@backstage/core-plugin-api';
import { AppComponents, AppOptions, AppIcons } from '@backstage/core-app-api';
/**
 * Creates a new Backstage App using a default set of components, icons and themes unless
 * they are explicitly provided.
 *
 * @public
 */
export declare function createApp(options?: Omit<AppOptions, keyof OptionalAppOptions> & OptionalAppOptions): import("@backstage/core-app-api").BackstageApp;
/**
 * The set of app options that {@link createApp} will provide defaults for
 * if they are not passed in explicitly.
 *
 * @public
 */
export declare type OptionalAppOptions = {
    /**
     * A set of icons to override the default icons with.
     *
     * The override is applied for each icon individually.
     *
     * @public
     */
    icons?: Partial<AppIcons> & {
        [key in string]: IconComponent;
    };
    /**
     * A set of themes that override all of the default app themes.
     *
     * If this option is provided none of the default themes will be used.
     *
     * @public
     */
    themes?: (Partial<AppTheme> & Omit<AppTheme, 'theme'>)[];
    /**
     * A set of components to override the default components with.
     *
     * The override is applied for each icon individually.
     *
     * @public
     */
    components?: Partial<AppComponents>;
};
