import { DateTime } from 'luxon';
import { JsonValue } from '@backstage/types';
/**
 * @public
 *
 * Response type for checks.
 */
export interface CheckResponse {
    /**
     * Identifier of the Check
     */
    id: string;
    /**
     * Type identifier for the check.
     * Can be used to determine storage options, logical routing to correct FactChecker implementation
     * or to help frontend render correct component types based on this
     */
    type: string;
    /**
     * Human readable name of the Check
     */
    name: string;
    /**
     * Description of the Check
     */
    description: string;
    /**
     * A collection of references to fact rows used to run this checks against
     */
    factIds: string[];
    /**
     * Metadata related to a check.
     * Can contain links, additional description texts and other actionable data.
     *
     * Currently loosely typed, but in the future when patterns emerge, key shapes can be defined
     */
    metadata?: Record<string, any>;
}
/**
 * @public
 *
 * Individual fact response type.
 * Keyed by the name of the fact
 */
export declare type FactResponse = {
    [id: string]: {
        /**
         * Reference and unique identifier of the fact row
         */
        id: string;
        /**
         * Type of the individual fact value
         *
         * Numbers are split into integers and floating point values.
         * `set` indicates a collection of values
         */
        type: 'integer' | 'float' | 'string' | 'boolean' | 'datetime' | 'set';
        /**
         * Description of the individual fact
         */
        description: string;
        /**
         * Actual value of the fact
         */
        value: number | string | boolean | DateTime | [];
        /**
         * An optional SemVer version identifying when this fact was added to the FactSchema
         */
        since?: string;
        /**
         * Metadata related to an individual fact.
         * Can contain links, additional description texts and other actionable data.
         *
         * Currently loosely typed, but in the future when patterns emerge, key shapes can be defined
         */
        metadata?: Record<string, any>;
    };
};
/**
 * Generic CheckResult
 *
 * Contains information about the facts used to calculate the check result
 * and information about the check itself. Both may include metadata to be able to display additional information.
 * A collection of these should be parseable by the frontend to display scorecards
 *
 * @public
 */
export declare type CheckResult = {
    facts: FactResponse;
    check: CheckResponse;
    result: JsonValue;
};
/**
 * CheckResult of type Boolean.
 *
 * @public
 */
export interface BooleanCheckResult extends CheckResult {
    result: boolean;
}
/**
 * Response type for bulk check opretation. Contains a list of entities and their respective check results.
 *
 * @public
 */
export declare type BulkCheckResponse = Array<{
    entity: string;
    results: CheckResult[];
}>;
