import { JsonPrimitive as JsonPrimitive$1, JsonObject as JsonObject$1, JsonArray as JsonArray$1, JsonValue as JsonValue$1 } from '@backstage/types';

/**
 * A type representing all allowed JSON primitive values.
 *
 * @public
 * @deprecated Please use the same type from `@backstage/types` instead
 */
declare type JsonPrimitive = JsonPrimitive$1;
/**
 * A type representing all allowed JSON object values.
 *
 * @public
 * @deprecated Please use the same type from `@backstage/types` instead
 */
declare type JsonObject = JsonObject$1;
/**
 * A type representing all allowed JSON array values.
 *
 * @public
 * @deprecated Please use the same type from `@backstage/types` instead
 */
declare type JsonArray = JsonArray$1;
/**
 * A type representing all allowed JSON values.
 *
 * @public
 * @deprecated Please use the same type from `@backstage/types` instead
 */
declare type JsonValue = JsonValue$1;

/**
 * A serialized form of configuration data that carries additional context.
 *
 * @public
 */
declare type AppConfig = {
    /**
     * A string representing the source of this configuration data, for example a filepath.
     */
    context: string;
    /**
     * The configuration data itself.
     */
    data: JsonObject$1;
    /**
     * A list of keys that where filtered out from the configuration when it was loaded.
     *
     * This can be used to warn the user if they try to read any of these keys.
     */
    filteredKeys?: string[];
    /**
     * A list of deprecated keys that were found in the  configuration when it was loaded.
     *
     * This can be used to warn the user if they are using deprecated properties.
     */
    deprecatedKeys?: {
        key: string;
        description: string;
    }[];
};
/**
 * The interface used to represent static configuration at runtime.
 *
 * @public
 */
declare type Config = {
    /**
     * Subscribes to the configuration object in order to receive a notification
     * whenever any value within the configuration has changed.
     *
     * This method is optional to implement, and consumers need to check if it is
     * implemented before invoking it.
     */
    subscribe?(onChange: () => void): {
        unsubscribe: () => void;
    };
    /**
     * Checks whether the given key is present.
     */
    has(key: string): boolean;
    /**
     * Lists all available configuration keys.
     */
    keys(): string[];
    /**
     * Same as `getOptional`, but will throw an error if there's no value for the given key.
     */
    get<T = JsonValue$1>(key?: string): T;
    /**
     * Read out all configuration data for the given key.
     *
     * Usage of this method should be avoided as the typed alternatives provide
     * much better error reporting. The main use-case of this method is to determine
     * the type of a configuration value in the case where there are multiple possible
     * shapes of the configuration.
     */
    getOptional<T = JsonValue$1>(key?: string): T | undefined;
    /**
     * Same as `getOptionalConfig`, but will throw an error if there's no value for the given key.
     */
    getConfig(key: string): Config;
    /**
     * Creates a sub-view of the configuration object.
     * The configuration value at the position of the provided key must be an object.
     */
    getOptionalConfig(key: string): Config | undefined;
    /**
     * Same as `getOptionalConfigArray`, but will throw an error if there's no value for the given key.
     */
    getConfigArray(key: string): Config[];
    /**
     * Creates a sub-view of an array of configuration objects.
     * The configuration value at the position of the provided key must be an array of objects.
     */
    getOptionalConfigArray(key: string): Config[] | undefined;
    /**
     * Same as `getOptionalNumber`, but will throw an error if there's no value for the given key.
     */
    getNumber(key: string): number;
    /**
     * Reads a configuration value at the given key, expecting it to be a number.
     */
    getOptionalNumber(key: string): number | undefined;
    /**
     * Same as `getOptionalBoolean`, but will throw an error if there's no value for the given key.
     */
    getBoolean(key: string): boolean;
    /**
     * Reads a configuration value at the given key, expecting it to be a boolean.
     */
    getOptionalBoolean(key: string): boolean | undefined;
    /**
     * Same as `getOptionalString`, but will throw an error if there's no value for the given key.
     */
    getString(key: string): string;
    /**
     * Reads a configuration value at the given key, expecting it to be a string.
     */
    getOptionalString(key: string): string | undefined;
    /**
     * Same as `getOptionalStringArray`, but will throw an error if there's no value for the given key.
     */
    getStringArray(key: string): string[];
    /**
     * Reads a configuration value at the given key, expecting it to be an array of strings.
     */
    getOptionalStringArray(key: string): string[] | undefined;
};

/**
 * An implementation of the `Config` interface that uses a plain JavaScript object
 * for the backing data, with the ability of linking multiple readers together.
 *
 * @public
 */
declare class ConfigReader implements Config {
    private readonly data;
    private readonly context;
    private readonly fallback?;
    private readonly prefix;
    /**
     * A set of key paths that where removed from the config due to not being visible.
     *
     * This was added as a mutable private member to avoid changes to the public API.
     * Its only purpose of this is to warn users of missing visibility when running
     * the frontend in development mode.
     */
    private filteredKeys?;
    private notifiedFilteredKeys;
    /**
     * Instantiates the config reader from a list of application config objects.
     */
    static fromConfigs(configs: AppConfig[]): ConfigReader;
    constructor(data: JsonObject$1 | undefined, context?: string, fallback?: ConfigReader | undefined, prefix?: string);
    /** {@inheritdoc Config.has} */
    has(key: string): boolean;
    /** {@inheritdoc Config.keys} */
    keys(): string[];
    /** {@inheritdoc Config.get} */
    get<T = JsonValue$1>(key?: string): T;
    /** {@inheritdoc Config.getOptional} */
    getOptional<T = JsonValue$1>(key?: string): T | undefined;
    /** {@inheritdoc Config.getConfig} */
    getConfig(key: string): ConfigReader;
    /** {@inheritdoc Config.getOptionalConfig} */
    getOptionalConfig(key: string): ConfigReader | undefined;
    /** {@inheritdoc Config.getConfigArray} */
    getConfigArray(key: string): ConfigReader[];
    /** {@inheritdoc Config.getOptionalConfigArray} */
    getOptionalConfigArray(key: string): ConfigReader[] | undefined;
    /** {@inheritdoc Config.getNumber} */
    getNumber(key: string): number;
    /** {@inheritdoc Config.getOptionalNumber} */
    getOptionalNumber(key: string): number | undefined;
    /** {@inheritdoc Config.getBoolean} */
    getBoolean(key: string): boolean;
    /** {@inheritdoc Config.getOptionalBoolean} */
    getOptionalBoolean(key: string): boolean | undefined;
    /** {@inheritdoc Config.getString} */
    getString(key: string): string;
    /** {@inheritdoc Config.getOptionalString} */
    getOptionalString(key: string): string | undefined;
    /** {@inheritdoc Config.getStringArray} */
    getStringArray(key: string): string[];
    /** {@inheritdoc Config.getOptionalStringArray} */
    getOptionalStringArray(key: string): string[] | undefined;
    private fullKey;
    private copy;
    private readConfigValue;
    private readValue;
}

export { AppConfig, Config, ConfigReader, JsonArray, JsonObject, JsonPrimitive, JsonValue };
