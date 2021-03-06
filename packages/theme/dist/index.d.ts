import { Theme, ThemeOptions } from '@material-ui/core';
import { Palette, PaletteOptions } from '@material-ui/core/styles/createPalette';
import { Overrides } from '@material-ui/core/styles/overrides';

/**
 * Backstage specific additions to the material-ui palette.
 *
 * @public
 */
declare type BackstagePaletteAdditions = {
    status: {
        ok: string;
        warning: string;
        error: string;
        pending: string;
        running: string;
        aborted: string;
    };
    border: string;
    textContrast: string;
    textVerySubtle: string;
    textSubtle: string;
    highlight: string;
    errorBackground: string;
    warningBackground: string;
    infoBackground: string;
    errorText: string;
    infoText: string;
    warningText: string;
    linkHover: string;
    link: string;
    gold: string;
    navigation: {
        background: string;
        indicator: string;
        color: string;
        selectedColor: string;
        navItem?: {
            hoverBackground: string;
        };
        submenu?: {
            background: string;
        };
    };
    tabbar: {
        indicator: string;
    };
    bursts: {
        fontColor: string;
        slackChannelText: string;
        backgroundColor: {
            default: string;
        };
        gradient: {
            linear: string;
        };
    };
    pinSidebarButton: {
        icon: string;
        background: string;
    };
    banner: {
        info: string;
        error: string;
        text: string;
        link: string;
        warning?: string;
    };
};
/**
 * The full Backstage palette.
 *
 * @public
 */
declare type BackstagePalette = Palette & BackstagePaletteAdditions;
/**
 * The full Backstage palette options.
 *
 * @public
 */
declare type BackstagePaletteOptions = PaletteOptions & BackstagePaletteAdditions;
/**
 * Selector for what page theme to use.
 *
 * @public
 */
declare type PageThemeSelector = {
    themeId: string;
};
/**
 * A Backstage theme.
 *
 * @public
 */
interface BackstageTheme extends Theme {
    palette: BackstagePalette;
    page: PageTheme;
    getPageTheme: (selector: PageThemeSelector) => PageTheme;
}
/**
 * Backstage theme options.
 *
 * @public
 * @remarks
 *
 * This is essentially a partial theme definition made by the user, that then
 * gets merged together with defaults and other values to form the final
 * {@link BackstageTheme}.
 *
 */
interface BackstageThemeOptions extends ThemeOptions {
    palette: BackstagePaletteOptions;
    page: PageTheme;
    getPageTheme: (selector: PageThemeSelector) => PageTheme;
}
/**
 * A simpler configuration for creating a new theme that just tweaks some parts
 * of the backstage one.
 *
 * @public
 */
declare type SimpleThemeOptions = {
    palette: BackstagePaletteOptions;
    defaultPageTheme: string;
    pageTheme?: Record<string, PageTheme>;
    fontFamily?: string;
};
/**
 * The theme definitions for a given layout page.
 *
 * @public
 */
declare type PageTheme = {
    colors: string[];
    shape: string;
    backgroundImage: string;
};

/**
 * The default Backstage light theme.
 *
 * @public
 */
declare const lightTheme: BackstageTheme;
/**
 * The default Backstage dark theme.
 *
 * @public
 */
declare const darkTheme: BackstageTheme;

/**
 * A helper for creating theme options.
 *
 * @public
 */
declare function createThemeOptions(options: SimpleThemeOptions): BackstageThemeOptions;
/**
 * A helper for creating theme overrides.
 *
 * @public
 */
declare function createThemeOverrides(theme: BackstageTheme): Overrides;
/**
 * Creates a Backstage MUI theme using a palette. The theme is created with the
 * common Backstage options and component styles.
 *
 * @public
 */
declare function createTheme(options: SimpleThemeOptions): BackstageTheme;

/**
 * The default predefined burst shapes.
 *
 * @public
 * @remarks
 *
 * How to add a shape:
 *
 * 1. Get the svg shape from figma, should be ~1400 wide, ~400 high
 *    and only the white-to-transparent mask, no colors.
 * 2. Run it through https://jakearchibald.github.io/svgomg/
 * 3. Run that through https://github.com/tigt/mini-svg-data-uri
 *    with something like https://npm.runkit.com/mini-svg-data-uri
 * 4. Wrap the output in `url("")`
 * 5. Give it a name and paste it into the `shapes` object below.
 */
declare const shapes: Record<string, string>;
/**
 * The color range variants that are used in e.g. colorful bursts.
 *
 * @public
 */
declare const colorVariants: Record<string, string[]>;
/**
 * Utility to not have to write colors and shapes twice.
 *
 * @public
 * @remarks
 *
 * As the background shapes and colors are decorative, we place them onto the
 * page as a css background-image instead of an html element of its own.
 */
declare function genPageTheme(colors: string[], shape: string): PageTheme;
/**
 * All of the builtin page themes.
 *
 * @public
 */
declare const pageTheme: Record<string, PageTheme>;

export { BackstagePalette, BackstagePaletteAdditions, BackstagePaletteOptions, BackstageTheme, BackstageThemeOptions, PageTheme, PageThemeSelector, SimpleThemeOptions, colorVariants, createTheme, createThemeOptions, createThemeOverrides, darkTheme, genPageTheme, lightTheme, pageTheme, shapes };
