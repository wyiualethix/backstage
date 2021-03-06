import { Logger } from 'winston';
import express from 'express';
import { Config } from '@backstage/config';

declare type RollbarEnvironment = 'production' | string;
declare enum RollbarLevel {
    debug = 10,
    info = 20,
    warning = 30,
    error = 40,
    critical = 50
}
declare enum RollbarFrameworkId {
    'unknown' = 0,
    'rails' = 1,
    'django' = 2,
    'pyramid' = 3,
    'node-js' = 4,
    'pylons' = 5,
    'php' = 6,
    'browser-js' = 7,
    'rollbar-system' = 8,
    'android' = 9,
    'ios' = 10,
    'mailgun' = 11,
    'logentries' = 12,
    'python' = 13,
    'ruby' = 14,
    'sidekiq' = 15,
    'flask' = 16,
    'celery' = 17,
    'rq' = 18
}
declare enum RollbarPlatformId {
    'unknown' = 0,
    'browser' = 1,
    'flash' = 2,
    'android' = 3,
    'ios' = 4,
    'heroku' = 5,
    'google-app-engine' = 6,
    'client' = 7
}
declare type RollbarItem = {
    publicItemId: number;
    integrationsData: null;
    levelLock: number;
    controllingId: number;
    lastActivatedTimestamp: number;
    assignedUserId: number;
    groupStatus: number;
    hash: string;
    id: number;
    environment: RollbarEnvironment;
    titleLock: number;
    title: string;
    lastOccurrenceId: number;
    lastOccurrenceTimestamp: number;
    platform: RollbarPlatformId;
    firstOccurrenceTimestamp: number;
    project_id: number;
    resolvedInVersion: string;
    status: 'enabled' | string;
    uniqueOccurrences: number;
    groupItemId: number;
    framework: RollbarFrameworkId;
    totalOccurrences: number;
    level: RollbarLevel;
    counter: number;
    lastModifiedBy: number;
    firstOccurrenceId: number;
    activatingOccurrenceId: number;
    lastResolvedTimestamp: number;
};

declare class RollbarApi {
    private readonly accessToken;
    private readonly logger;
    private projectMap;
    constructor(accessToken: string, logger: Logger);
    getAllProjects(): Promise<{
        id: number;
        name: string;
        status: string;
        accountId: number;
    }[]>;
    getProject(projectName: string): Promise<{
        id: number;
        name: string;
        status: string;
        accountId: number;
    }>;
    getProjectItems(projectName: string): Promise<{
        items: RollbarItem[];
        page: number;
        totalCount: number;
    }>;
    getTopActiveItems(projectName: string, options?: {
        hours: number;
        environment: string;
    }): Promise<{
        item: {
            id: number;
            counter: number;
            environment: string;
            framework: RollbarFrameworkId;
            lastOccurrenceTimestamp: number;
            level: number;
            occurrences: number;
            projectId: number;
            title: string;
            uniqueOccurrences: number;
        };
        counts: number[];
    }[]>;
    getOccuranceCounts(projectName: string, options?: {
        environment: string;
        item_id?: number;
    }): Promise<{
        timestamp: number;
        count: number;
    }[]>;
    getActivatedCounts(projectName: string, options?: {
        environment: string;
        item_id?: number;
    }): Promise<{
        timestamp: number;
        count: number;
    }[]>;
    private getProjectAccessTokens;
    private get;
    private getForProject;
    private getProjectMetadata;
    private getProjectMap;
}
declare function getRequestHeaders(token: string): {
    headers: {
        'X-Rollbar-Access-Token': string;
    };
};

interface RouterOptions {
    rollbarApi?: RollbarApi;
    logger: Logger;
    config: Config;
}
declare function createRouter(options: RouterOptions): Promise<express.Router>;

export { RollbarApi, RouterOptions, createRouter, getRequestHeaders };
