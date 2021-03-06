/// <reference types="react" />
import * as _backstage_core_components from '@backstage/core-components';
import { InfoCardVariants } from '@backstage/core-components';
import * as _backstage_core_plugin_api from '@backstage/core-plugin-api';
import { IconComponent } from '@backstage/core-plugin-api';

/** @public */
declare const orgPlugin: _backstage_core_plugin_api.BackstagePlugin<{}, {
    catalogIndex: _backstage_core_plugin_api.ExternalRouteRef<undefined, false>;
}>;
/** @public */
declare const EntityGroupProfileCard: (props: {
    variant?: _backstage_core_components.InfoCardVariants | undefined;
}) => JSX.Element;
/** @public */
declare const EntityMembersListCard: (props: {
    memberDisplayTitle?: string | undefined;
    pageSize?: number | undefined;
}) => JSX.Element;
/** @public */
declare const EntityOwnershipCard: (props: {
    variant?: _backstage_core_components.InfoCardVariants | undefined;
    entityFilterKind?: string[] | undefined;
    hideRelationsToggle?: boolean | undefined;
    relationsType?: string | undefined;
}) => JSX.Element;
/** @public */
declare const EntityUserProfileCard: (props: {
    variant?: _backstage_core_components.InfoCardVariants | undefined;
}) => JSX.Element;

/** @public */
declare const MembersListCard: (props: {
    memberDisplayTitle?: string;
    pageSize?: number;
}) => JSX.Element;

/** @public */
declare const GroupProfileCard: (props: {
    variant?: InfoCardVariants;
}) => JSX.Element;

/** @public */
declare const UserProfileCard: (props: {
    variant?: InfoCardVariants;
}) => JSX.Element;

/** @public */
declare const OwnershipCard: (props: {
    variant?: InfoCardVariants;
    entityFilterKind?: string[];
    hideRelationsToggle?: boolean;
    relationsType?: string;
}) => JSX.Element;

/**
 * MyGroupsSidebarItem can be added to your sidebar providing quick access to groups the logged in user is a member of
 *
 * @public
 */
declare const MyGroupsSidebarItem: (props: {
    singularTitle: string;
    pluralTitle: string;
    icon: IconComponent;
    filter?: Record<string, string | symbol | (string | symbol)[]>;
}) => JSX.Element | null;

export { EntityGroupProfileCard, EntityMembersListCard, EntityOwnershipCard, EntityUserProfileCard, GroupProfileCard, MembersListCard, MyGroupsSidebarItem, OwnershipCard, UserProfileCard, orgPlugin, orgPlugin as plugin };
