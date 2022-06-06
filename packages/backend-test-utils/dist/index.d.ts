import { Knex } from 'knex';

/** @public */
declare function isDockerDisabledForTests(): boolean;

/**
 * The possible databases to test against.
 *
 * @public
 */
declare type TestDatabaseId = 'POSTGRES_13' | 'POSTGRES_9' | 'MYSQL_8' | 'SQLITE_3';

/**
 * Encapsulates the creation of ephemeral test database instances for use
 * inside unit or integration tests.
 *
 * @public
 */
declare class TestDatabases {
    private readonly instanceById;
    private readonly supportedIds;
    /**
     * Creates an empty `TestDatabases` instance, and sets up Jest to clean up
     * all of its acquired resources after all tests finish.
     *
     * You typically want to create just a single instance like this at the top
     * of your test file or `describe` block, and then call `init` many times on
     * that instance inside the individual tests. Spinning up a "physical"
     * database instance takes a considerable amount of time, slowing down tests.
     * But initializing a new logical database inside that instance using `init`
     * is very fast.
     */
    static create(options?: {
        ids?: TestDatabaseId[];
        disableDocker?: boolean;
    }): TestDatabases;
    private constructor();
    supports(id: TestDatabaseId): boolean;
    eachSupportedId(): [TestDatabaseId][];
    /**
     * Returns a fresh, unique, empty logical database on an instance of the
     * given database ID platform.
     *
     * @param id - The ID of the database platform to use, e.g. 'POSTGRES_13'
     * @returns A `Knex` connection object
     */
    init(id: TestDatabaseId): Promise<Knex>;
    private initAny;
    private initPostgres;
    private initMysql;
    private initSqlite;
    private shutdown;
}

/**
 * Sets up handlers for request mocking
 * @public
 * @param worker - service worker
 */
declare function setupRequestMockHandlers(worker: {
    listen: (t: any) => void;
    close: () => void;
    resetHandlers: () => void;
}): void;

export { TestDatabaseId, TestDatabases, isDockerDisabledForTests, setupRequestMockHandlers };
