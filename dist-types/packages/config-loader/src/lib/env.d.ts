import { AppConfig } from '@backstage/config';
/**
 * Read runtime configuration from the environment.
 *
 * Only environment variables prefixed with APP_CONFIG_ will be considered.
 *
 * For each variable, the prefix will be removed, and rest of the key will
 * be split by '_'. Each part will then be used as keys to build up a nested
 * config object structure. The treatment of the entire environment variable
 * is case-sensitive.
 *
 * The value of the variable should be JSON serialized, as it will be parsed
 * and the type will be kept intact. For example "true" and true are treated
 * differently, as well as "42" and 42.
 *
 * For example, to set the config app.title to "My Title", use the following:
 *
 * APP_CONFIG_app_title='"My Title"'
 *
 * @public
 */
export declare function readEnvConfig(env: {
    [name: string]: string | undefined;
}): AppConfig[];
