import { JsonObject } from '@backstage/types';

/**
 * An object that is shaped like an `Error`.
 *
 * @public
 */
declare type ErrorLike = {
    name: string;
    message: string;
    stack?: string;
    [unknownKeys: string]: unknown;
};
/**
 * Checks whether an unknown value is an {@link ErrorLike} object, which guarantees that it's
 * an object that has at least two string properties: a non-empty `name` and `message`.
 *
 * @public
 * @param value - an unknown value
 * @returns true if the value is an {@link ErrorLike} object, false otherwise
 */
declare function isError(value: unknown): value is ErrorLike;
/**
 * Asserts that an unknown value is an {@link ErrorLike} object, which guarantees that it's
 * an object that has at least two string properties: a non-empty `name` and `message`.
 *
 * If the value is not an {@link ErrorLike} object, an error is thrown.
 *
 * @public
 * @param value - an unknown value
 */
declare function assertError(value: unknown): asserts value is ErrorLike;

/**
 * A base class that custom Error classes can inherit from.
 *
 * @public
 * @example
 *```ts
 * class MyCustomError extends CustomErrorBase {}
 *
 * const e = new MyCustomError('Some message', cause);
 * // e.name === 'MyCustomError'
 * // e.message === 'Some message'
 * // e.cause === cause
 * // e.stack is set if the runtime supports it
 * ```
 */
declare class CustomErrorBase extends Error {
    /**
     * An inner error that caused this error to be thrown, if any.
     */
    readonly cause?: Error | undefined;
    constructor(message?: string, cause?: Error | unknown);
}

/**
 * The given inputs are malformed and cannot be processed.
 *
 * @public
 */
declare class InputError extends CustomErrorBase {
}
/**
 * The request requires authentication, which was not properly supplied.
 *
 * @public
 */
declare class AuthenticationError extends CustomErrorBase {
}
/**
 * The authenticated caller is not allowed to perform this request.
 *
 * @public
 */
declare class NotAllowedError extends CustomErrorBase {
}
/**
 * The requested resource could not be found.
 *
 * Note that this error usually is used to indicate that an entity with a given
 * ID does not exist, rather than signalling that an entire route is missing.
 *
 * @public
 */
declare class NotFoundError extends CustomErrorBase {
}
/**
 * The request could not complete due to a conflict in the current state of the
 * resource.
 *
 * @public
 */
declare class ConflictError extends CustomErrorBase {
}
/**
 * The requested resource has not changed since last request.
 *
 * @public
 */
declare class NotModifiedError extends CustomErrorBase {
}
/**
 * An error that forwards an underlying cause with additional context in the message.
 *
 * The `name` property of the error will be inherited from the `cause` if
 * possible, and will otherwise be set to `'Error'`.
 *
 * @public
 */
declare class ForwardedError extends CustomErrorBase {
    constructor(message: string, cause: Error | unknown);
}

/**
 * The serialized form of an Error.
 *
 * @public
 */
declare type SerializedError = JsonObject & {
    /** The name of the exception that was thrown */
    name: string;
    /** The message of the exception that was thrown */
    message: string;
    /** A stringified stack trace; may not be present */
    stack?: string;
    /** A custom code (not necessarily the same as an HTTP response code); may not be present */
    code?: string;
};
/**
 * Serializes an error object to a JSON friendly form.
 *
 * @public
 * @param error - The error.
 * @param options - Optional serialization options.
 */
declare function serializeError(error: Error, options?: {
    /** Include stack trace in the output (default false) */
    includeStack?: boolean;
}): SerializedError;
/**
 * Deserializes a serialized error object back to an Error.
 *
 * @public
 */
declare function deserializeError<T extends Error = Error>(data: SerializedError): T;
/**
 * Stringifies an error, including its name and message where available.
 *
 * @param error - The error.
 * @public
 */
declare function stringifyError(error: unknown): string;

/**
 * A standard shape of JSON data returned as the body of backend errors.
 *
 * @public
 */
declare type ErrorResponseBody = {
    /** Details of the error that was caught */
    error: SerializedError;
    /** Details about the incoming request */
    request?: {
        /** The HTTP method of the request */
        method: string;
        /** The URL of the request (excluding protocol and host/port) */
        url: string;
    };
    /** Details about the response */
    response: {
        /** The numeric HTTP status code that was returned */
        statusCode: number;
    };
};
/**
 * Attempts to construct an ErrorResponseBody out of a failed server request.
 * Assumes that the response has already been checked to be not ok. This
 * function consumes the body of the response, and assumes that it hasn't
 * been consumed before.
 *
 * The code is forgiving, and constructs a useful synthetic body as best it can
 * if the response body wasn't on the expected form.
 *
 * @public
 * @param response - The response of a failed request
 */
declare function parseErrorResponseBody(response: Response): Promise<ErrorResponseBody>;

/**
 * An error thrown as the result of a failed server request.
 *
 * The server is expected to respond on the ErrorResponseBody format.
 *
 * @public
 */
declare class ResponseError extends Error {
    /**
     * The actual response, as seen by the client.
     *
     * Note that the body of this response is always consumed. Its parsed form is
     * in the `body` field.
     */
    readonly response: Response;
    /**
     * The parsed JSON error body, as sent by the server.
     */
    readonly body: ErrorResponseBody;
    /**
     * The Error cause, as seen by the remote server. This is parsed out of the
     * JSON error body.
     *
     * This error always has the plain Error constructor, however all
     * serializable enumerable fields on the remote error including its name are
     * preserved. Therefore, if you want to check the error type, use its name
     * property rather than checking typeof or its constructor or prototype.
     */
    readonly cause: Error;
    /**
     * Constructs a ResponseError based on a failed response.
     *
     * Assumes that the response has already been checked to be not ok. This
     * function consumes the body of the response, and assumes that it hasn't
     * been consumed before.
     */
    static fromResponse(response: Response): Promise<ResponseError>;
    private constructor();
}

export { AuthenticationError, ConflictError, CustomErrorBase, ErrorLike, ErrorResponseBody, ForwardedError, InputError, NotAllowedError, NotFoundError, NotModifiedError, ResponseError, SerializedError, assertError, deserializeError, isError, parseErrorResponseBody, serializeError, stringifyError };
