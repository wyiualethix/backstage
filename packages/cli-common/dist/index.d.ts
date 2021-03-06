/**
 * A function that takes a set of path fragments and resolves them into a
 * single complete path, relative to some root.
 *
 * @public
 */
declare type ResolveFunc = (...paths: string[]) => string;
/**
 * Common paths and resolve functions used by the cli.
 * Currently assumes it is being executed within a monorepo.
 *
 * @public
 */
declare type Paths = {
    ownDir: string;
    ownRoot: string;
    targetDir: string;
    targetRoot: string;
    resolveOwn: ResolveFunc;
    resolveOwnRoot: ResolveFunc;
    resolveTarget: ResolveFunc;
    resolveTargetRoot: ResolveFunc;
};
/**
 * Find paths related to a package and its execution context.
 *
 * @public
 * @example
 *
 * const paths = findPaths(__dirname)
 */
declare function findPaths(searchDir: string): Paths;
/**
 * The name of the backstage's config file
 *
 * @public
 */
declare const BACKSTAGE_JSON = "backstage.json";

/**
 * Checks if path is the same as or a child path of base.
 *
 * @public
 */
declare function isChildPath(base: string, path: string): boolean;

export { BACKSTAGE_JSON, Paths, ResolveFunc, findPaths, isChildPath };
