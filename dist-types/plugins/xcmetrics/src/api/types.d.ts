export declare type BuildStatus = 'succeeded' | 'failed' | 'stopped';
export declare type Build = {
    userid: string;
    warningCount: number;
    duration: number;
    startTimestamp: string;
    isCi: boolean;
    startTimestampMicroseconds: number;
    category: string;
    endTimestampMicroseconds: number;
    day: string;
    compilationEndTimestamp: string;
    tag: string;
    projectName: string;
    compilationEndTimestampMicroseconds: number;
    errorCount: number;
    id: string;
    buildStatus: BuildStatus;
    compilationDuration: number;
    schema: string;
    compiledCount: number;
    endTimestamp: string;
    userid256: string;
    machineName: string;
    wasSuspended: boolean;
};
export declare type BuildStatusResult = Pick<Build, 'id' | 'buildStatus'>;
export declare type BuildCount = {
    day: string;
    errors: number;
    builds: number;
};
export declare type BuildError = {
    detail: string;
    characterRangeEnd: number;
    id: string;
    endingColumn: number;
    parentIdentifier: string;
    day: string;
    type: string;
    title: string;
    endingLine: number;
    severity: number;
    startingLine: number;
    parentType: string;
    buildIdentifier: string;
    startingColumn: number;
    characterRangeStart: number;
    documentURL: string;
};
export declare type BuildHost = {
    id: string;
    swapFreeMb: number;
    hostOsFamily: string;
    isVirtual: boolean;
    uptimeSeconds: number;
    hostModel: string;
    hostOsVersion: string;
    day: string;
    cpuCount: number;
    swapTotalMb: number;
    hostOs: string;
    hostArchitecture: string;
    memoryTotalMb: number;
    timezone: string;
    cpuModel: string;
    buildIdentifier: string;
    memoryFreeMb: number;
    cpuSpeedGhz: number;
};
export declare type BuildMetadata = {
    [key: string]: string;
};
export declare type BuildTime = {
    day: string;
    durationP50: number;
    durationP95: number;
    totalDuration: number;
};
export declare type BuildWarning = {
    detail: string | null;
    characterRangeEnd: number;
    documentURL: string;
    endingColumn: number;
    id: string;
    parentIdentifier: string;
    day: string;
    type: string;
    title: string;
    endingLine: number;
    severity: number;
    startingLine: number;
    parentType: string;
    clangFlag: string;
    startingColumn: number;
    buildIdentifier: string;
    characterRangeStart: number;
};
export declare type PaginationResult<T> = {
    items: T[];
    metadata: {
        per: number;
        total: number;
        page: number;
    };
};
export declare type Target = {
    id: string;
    category: string;
    startTimestamp: string;
    compilationEndTimestampMicroseconds: number;
    endTimestampMicroseconds: number;
    endTimestamp: string;
    fetchedFromCache: boolean;
    errorCount: number;
    day: string;
    warningCount: number;
    compilationEndTimestamp: string;
    compilationDuration: number;
    compiledCount: number;
    duration: number;
    buildIdentifier: string;
    name: string;
    startTimestampMicroseconds: number;
};
export declare type Xcode = {
    buildNumber: string;
    id: string;
    buildIdentifier: string;
    day: string;
    version: string;
};
export declare type BuildResponse = {
    build: Build;
    targets: Target[];
    xcode?: Xcode;
};
export declare type BuildFilters = {
    from: string;
    to: string;
    buildStatus?: BuildStatus;
    project?: string;
};
export interface XcmetricsApi {
    getBuild(id: string): Promise<BuildResponse>;
    getBuilds(limit?: number): Promise<Build[]>;
    getFilteredBuilds(filters: BuildFilters, page?: number, perPage?: number): Promise<PaginationResult<Build>>;
    getBuildErrors(buildId: string): Promise<BuildError[]>;
    getBuildCounts(days: number): Promise<BuildCount[]>;
    getBuildHost(buildId: string): Promise<BuildHost>;
    getBuildMetadata(buildId: string): Promise<BuildMetadata>;
    getBuildTimes(days: number): Promise<BuildTime[]>;
    getBuildStatuses(limit: number): Promise<BuildStatusResult[]>;
    getBuildWarnings(buildId: string): Promise<BuildWarning[]>;
    getProjects(): Promise<string[]>;
}
export declare const xcmetricsApiRef: import("@backstage/core-plugin-api").ApiRef<XcmetricsApi>;
