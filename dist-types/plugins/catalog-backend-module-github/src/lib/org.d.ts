import { GroupEntity, UserEntity } from '@backstage/catalog-model';
export declare function buildOrgHierarchy(groups: GroupEntity[]): void;
export declare function assignGroupsToUsers(users: UserEntity[], groupMemberUsers: Map<string, string[]>): void;
export declare function buildMemberOf(groups: GroupEntity[], users: UserEntity[]): void;
