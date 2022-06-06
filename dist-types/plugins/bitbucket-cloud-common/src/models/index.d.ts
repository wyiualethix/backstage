/**
 * Bitbucket API
 * Code against the Bitbucket API to automate simple tasks, embed Bitbucket data into your own site, build mobile or desktop apps, or even add custom UI add-ons into Bitbucket itself using the Connect framework.
 *
 * The version of the OpenAPI document: 2.0
 * Contact: support@bitbucket.org
 *
 * NOTE: This file was auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/** @public */
export declare namespace Models {
    /**
     * An account object.
     * @public
     */
    interface Account extends ModelObject {
        /**
         * The status of the account. Currently the only possible value is "active", but more values may be added in the future.
         */
        account_status?: string;
        created_on?: string;
        display_name?: string;
        has_2fa_enabled?: boolean;
        links?: AccountLinks;
        /**
         * Account name defined by the owner. Should be used instead of the "username" field. Note that "nickname" cannot be used in place of "username" in URLs and queries, as "nickname" is not guaranteed to be unique.
         */
        nickname?: string;
        username?: string;
        uuid?: string;
        website?: string;
    }
    /**
     * @public
     */
    interface AccountLinks {
        avatar?: Link;
        followers?: Link;
        following?: Link;
        html?: Link;
        repositories?: Link;
        self?: Link;
    }
    /**
     * The author of a change in a repository
     * @public
     */
    interface Author extends ModelObject {
        /**
         * The raw author value from the repository. This may be the only value available if the author does not match a user in Bitbucket.
         */
        raw?: string;
        user?: Account;
    }
    /**
     * The common base type for both repository and snippet commits.
     * @public
     */
    interface BaseCommit extends ModelObject {
        author?: Author;
        date?: string;
        hash?: string;
        message?: string;
        parents?: Array<BaseCommit>;
        summary?: BaseCommitSummary;
    }
    /**
     * @public
     */
    interface BaseCommitSummary {
        /**
         * The user's content rendered as HTML.
         */
        html?: string;
        /**
         * The type of markup language the raw content is to be interpreted in.
         */
        markup?: BaseCommitSummaryMarkupEnum;
        /**
         * The text as it was typed by a user.
         */
        raw?: string;
    }
    /**
     * The type of markup language the raw content is to be interpreted in.
     * @public
     */
    const BaseCommitSummaryMarkupEnum: {
        readonly Markdown: "markdown";
        readonly Creole: "creole";
        readonly Plaintext: "plaintext";
    };
    /**
     * The type of markup language the raw content is to be interpreted in.
     * @public
     */
    type BaseCommitSummaryMarkupEnum = typeof BaseCommitSummaryMarkupEnum[keyof typeof BaseCommitSummaryMarkupEnum];
    /**
     * A branch object, representing a branch in a repository.
     * @public
     */
    interface Branch {
        links?: RefLinks;
        /**
         * The name of the ref.
         */
        name?: string;
        target?: Commit;
        type: string;
        /**
         * The default merge strategy for pull requests targeting this branch.
         */
        default_merge_strategy?: string;
        /**
         * Available merge strategies for pull requests targeting this branch.
         */
        merge_strategies?: Array<BranchMergeStrategiesEnum>;
    }
    /**
     * Available merge strategies for pull requests targeting this branch.
     * @public
     */
    const BranchMergeStrategiesEnum: {
        readonly MergeCommit: "merge_commit";
        readonly Squash: "squash";
        readonly FastForward: "fast_forward";
    };
    /**
     * Available merge strategies for pull requests targeting this branch.
     * @public
     */
    type BranchMergeStrategiesEnum = typeof BranchMergeStrategiesEnum[keyof typeof BranchMergeStrategiesEnum];
    /**
     * A repository commit object.
     * @public
     */
    interface Commit extends BaseCommit {
        participants?: Array<Participant>;
        repository?: Repository;
    }
    /**
     * A file object, representing a file at a commit in a repository
     * @public
     */
    interface CommitFile {
        [key: string]: unknown;
        attributes?: CommitFileAttributesEnum;
        commit?: Commit;
        /**
         * The escaped version of the path as it appears in a diff. If the path does not require escaping this will be the same as path.
         */
        escaped_path?: string;
        /**
         * The path in the repository
         */
        path?: string;
        type: string;
    }
    /**
     * @public
     */
    const CommitFileAttributesEnum: {
        readonly Link: "link";
        readonly Executable: "executable";
        readonly Subrepository: "subrepository";
        readonly Binary: "binary";
        readonly Lfs: "lfs";
    };
    /**
     * @public
     */
    type CommitFileAttributesEnum = typeof CommitFileAttributesEnum[keyof typeof CommitFileAttributesEnum];
    /**
     * A link to a resource related to this object.
     * @public
     */
    interface Link {
        href?: string;
        name?: string;
    }
    /**
     * Base type for most resource objects. It defines the common `type` element that identifies an object's type. It also identifies the element as Swagger's `discriminator`.
     * @public
     */
    interface ModelObject {
        [key: string]: unknown;
        type: string;
    }
    /**
     * A generic paginated list.
     * @public
     */
    interface Paginated<TResultItem> {
        /**
         * Link to the next page if it exists. The last page of a collection does not have this value. Use this link to navigate the result set and refrain from constructing your own URLs.
         */
        next?: string;
        /**
         * Page number of the current results. This is an optional element that is not provided in all responses.
         */
        page?: number;
        /**
         * Current number of objects on the existing page. The default value is 10 with 100 being the maximum allowed value. Individual APIs may enforce different values.
         */
        pagelen?: number;
        /**
         * Link to previous page if it exists. A collections first page does not have this value. This is an optional element that is not provided in all responses. Some result sets strictly support forward navigation and never provide previous links. Clients must anticipate that backwards navigation is not always available. Use this link to navigate the result set and refrain from constructing your own URLs.
         */
        previous?: string;
        /**
         * Total number of objects in the response. This is an optional element that is not provided in all responses, as it can be expensive to compute.
         */
        size?: number;
        /**
         * The values of the current page.
         */
        values?: Array<TResultItem> | Set<TResultItem>;
    }
    /**
     * A paginated list of repositories.
     * @public
     */
    interface PaginatedRepositories extends Paginated<Repository> {
        /**
         * The values of the current page.
         */
        values?: Set<Repository>;
    }
    /**
     * Object describing a user's role on resources like commits or pull requests.
     * @public
     */
    interface Participant extends ModelObject {
        approved?: boolean;
        /**
         * The ISO8601 timestamp of the participant's action. For approvers, this is the time of their approval. For commenters and pull request reviewers who are not approvers, this is the time they last commented, or null if they have not commented.
         */
        participated_on?: string;
        role?: ParticipantRoleEnum;
        state?: ParticipantStateEnum;
        user?: User;
    }
    /**
     * @public
     */
    const ParticipantRoleEnum: {
        readonly Participant: "PARTICIPANT";
        readonly Reviewer: "REVIEWER";
    };
    /**
     * @public
     */
    type ParticipantRoleEnum = typeof ParticipantRoleEnum[keyof typeof ParticipantRoleEnum];
    /**
     * @public
     */
    const ParticipantStateEnum: {
        readonly Approved: "approved";
        readonly ChangesRequested: "changes_requested";
        readonly Null: "null";
    };
    /**
     * @public
     */
    type ParticipantStateEnum = typeof ParticipantStateEnum[keyof typeof ParticipantStateEnum];
    /**
     * A Bitbucket project.
     *             Projects are used by teams to organize repositories.
     * @public
     */
    interface Project extends ModelObject {
        created_on?: string;
        description?: string;
        /**
         *
         * Indicates whether the project contains publicly visible repositories.
         * Note that private projects cannot contain public repositories.
         */
        has_publicly_visible_repos?: boolean;
        /**
         *
         * Indicates whether the project is publicly accessible, or whether it is
         * private to the team and consequently only visible to team members.
         * Note that private projects cannot contain public repositories.
         */
        is_private?: boolean;
        /**
         * The project's key.
         */
        key?: string;
        links?: ProjectLinks;
        /**
         * The name of the project.
         */
        name?: string;
        owner?: Team;
        updated_on?: string;
        /**
         * The project's immutable id.
         */
        uuid?: string;
    }
    /**
     * @public
     */
    interface ProjectLinks {
        avatar?: Link;
        html?: Link;
    }
    /**
     * @public
     */
    interface RefLinks {
        commits?: Link;
        html?: Link;
        self?: Link;
    }
    /**
     * A Bitbucket repository.
     * @public
     */
    interface Repository extends ModelObject {
        created_on?: string;
        description?: string;
        /**
         *
         * Controls the rules for forking this repository.
         *
         * * **allow_forks**: unrestricted forking
         * * **no_public_forks**: restrict forking to private forks (forks cannot
         *   be made public later)
         * * **no_forks**: deny all forking
         */
        fork_policy?: RepositoryForkPolicyEnum;
        /**
         * The concatenation of the repository owner's username and the slugified name, e.g. "evzijst/interruptingcow". This is the same string used in Bitbucket URLs.
         */
        full_name?: string;
        has_issues?: boolean;
        has_wiki?: boolean;
        is_private?: boolean;
        language?: string;
        links?: RepositoryLinks;
        mainbranch?: Branch;
        name?: string;
        owner?: Account;
        parent?: Repository;
        project?: Project;
        scm?: RepositoryScmEnum;
        size?: number;
        /**
         * The "sluggified" version of the repository's name. This contains only ASCII characters and can therefore be slightly different than the name
         */
        slug?: string;
        updated_on?: string;
        /**
         * The repository's immutable id. This can be used as a substitute for the slug segment in URLs. Doing this guarantees your URLs will survive renaming of the repository by its owner, or even transfer of the repository to a different user.
         */
        uuid?: string;
    }
    /**
     *
     * Controls the rules for forking this repository.
     *
     * * **allow_forks**: unrestricted forking
     * * **no_public_forks**: restrict forking to private forks (forks cannot
     *   be made public later)
     * * **no_forks**: deny all forking
     * @public
     */
    const RepositoryForkPolicyEnum: {
        readonly AllowForks: "allow_forks";
        readonly NoPublicForks: "no_public_forks";
        readonly NoForks: "no_forks";
    };
    /**
     *
     * Controls the rules for forking this repository.
     *
     * * **allow_forks**: unrestricted forking
     * * **no_public_forks**: restrict forking to private forks (forks cannot
     *   be made public later)
     * * **no_forks**: deny all forking
     * @public
     */
    type RepositoryForkPolicyEnum = typeof RepositoryForkPolicyEnum[keyof typeof RepositoryForkPolicyEnum];
    /**
     * @public
     */
    const RepositoryScmEnum: {
        readonly Git: "git";
    };
    /**
     * @public
     */
    type RepositoryScmEnum = typeof RepositoryScmEnum[keyof typeof RepositoryScmEnum];
    /**
     * @public
     */
    interface RepositoryLinks {
        avatar?: Link;
        clone?: Array<Link>;
        commits?: Link;
        downloads?: Link;
        forks?: Link;
        hooks?: Link;
        html?: Link;
        pullrequests?: Link;
        self?: Link;
        watchers?: Link;
    }
    /**
     * @public
     */
    interface SearchCodeSearchResult {
        readonly content_match_count?: number;
        readonly content_matches?: Array<SearchContentMatch>;
        file?: CommitFile;
        readonly path_matches?: Array<SearchSegment>;
        readonly type?: string;
    }
    /**
     * @public
     */
    interface SearchContentMatch {
        readonly lines?: Array<SearchLine>;
    }
    /**
     * @public
     */
    interface SearchLine {
        readonly line?: number;
        readonly segments?: Array<SearchSegment>;
    }
    /**
     * @public
     */
    interface SearchResultPage extends Paginated<SearchCodeSearchResult> {
        readonly query_substituted?: boolean;
        /**
         * The values of the current page.
         */
        readonly values?: Array<SearchCodeSearchResult>;
    }
    /**
     * @public
     */
    interface SearchSegment {
        readonly match?: boolean;
        readonly text?: string;
    }
    /**
     * A team object.
     * @public
     */
    interface Team extends Account {
    }
    /**
     * A user object.
     * @public
     */
    interface User extends Account {
        /**
         * The user's Atlassian account ID.
         */
        account_id?: string;
        is_staff?: boolean;
    }
}
