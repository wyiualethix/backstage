/**
 * Contains mapping between Backstage release and package versions.
 * @public
 */
declare type ReleaseManifest = {
    releaseVersion: string;
    packages: {
        name: string;
        version: string;
    }[];
};
/**
 * Options for {@link getManifestByVersion}.
 * @public
 */
declare type GetManifestByVersionOptions = {
    version: string;
};
/**
 * Returns a release manifest based on supplied version.
 * @public
 */
declare function getManifestByVersion(options: GetManifestByVersionOptions): Promise<ReleaseManifest>;
/**
 * Options for {@link getManifestByReleaseLine}.
 * @public
 */
declare type GetManifestByReleaseLineOptions = {
    releaseLine: string;
};
/**
 * Returns a release manifest based on supplied release line.
 * @public
 */
declare function getManifestByReleaseLine(options: GetManifestByReleaseLineOptions): Promise<ReleaseManifest>;

export { GetManifestByReleaseLineOptions, GetManifestByVersionOptions, ReleaseManifest, getManifestByReleaseLine, getManifestByVersion };
