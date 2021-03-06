import { ComponentType } from 'react';
import { Entity } from '@backstage/catalog-model';
/**
 * Metadata for TechDocs page
 *
 * @public
 */
export declare type TechDocsMetadata = {
    site_name: string;
    site_description: string;
};
/**
 * Metadata for TechDocs Entity
 *
 * @public
 */
export declare type TechDocsEntityMetadata = Entity & {
    locationMetadata?: {
        type: string;
        target: string;
    };
};
/**
 * Locations for which TechDocs addons may be declared and rendered.
 * @public
 */
export declare const TechDocsAddonLocations: Readonly<{
    /**
     * These addons fill up the header from the right, on the same line as the
     * title.
     */
    readonly Header: "Header";
    /**
     * These addons appear below the header and above all content; tooling addons
     * can be inserted for convenience.
     */
    readonly Subheader: "Subheader";
    /**
     * These addons are items added to the settings menu list and are designed to make
     * the reader experience customizable, for example accessibility options
     */
    readonly Settings: "Settings";
    /**
     * These addons appear left of the content and above the navigation.
     */
    readonly PrimarySidebar: "PrimarySidebar";
    /**
     * These addons appear right of the content and above the table of contents.
     */
    readonly SecondarySidebar: "SecondarySidebar";
    /**
     * A virtual location which allows mutation of all content within the shadow
     * root by transforming DOM nodes. These addons should return null on render.
     */
    readonly Content: "Content";
}>;
/**
 * Options for creating a TechDocs addon.
 * @public
 */
export declare type TechDocsAddonOptions<TAddonProps = {}> = {
    name: string;
    location: keyof typeof TechDocsAddonLocations;
    component: ComponentType<TAddonProps>;
};
