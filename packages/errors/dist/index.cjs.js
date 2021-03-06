'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var serializeError$1 = require('serialize-error');

function isError(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const maybe = value;
  if (typeof maybe.name !== "string" || maybe.name === "") {
    return false;
  }
  if (typeof maybe.message !== "string") {
    return false;
  }
  return true;
}
function assertError(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`Encountered invalid error, not an object, got '${value}'`);
  }
  const maybe = value;
  if (typeof maybe.name !== "string" || maybe.name === "") {
    throw new Error(`Encountered error object without a name, got '${value}'`);
  }
  if (typeof maybe.message !== "string") {
    throw new Error(`Encountered error object without a message, got '${value}'`);
  }
}

function serializeError(error, options) {
  const serialized = serializeError$1.serializeError(error);
  const result = {
    name: "Unknown",
    message: "<no reason given>",
    ...serialized
  };
  if (!(options == null ? void 0 : options.includeStack)) {
    delete result.stack;
  }
  return result;
}
function deserializeError(data) {
  const result = serializeError$1.deserializeError(data);
  if (!data.stack) {
    result.stack = void 0;
  }
  return result;
}
function stringifyError(error) {
  if (isError(error)) {
    const str = String(error);
    return str !== "[object Object]" ? str : `${error.name}: ${error.message}`;
  }
  return `unknown error '${error}'`;
}

async function parseErrorResponseBody(response) {
  var _a;
  try {
    const text = await response.text();
    if (text) {
      if ((_a = response.headers.get("content-type")) == null ? void 0 : _a.startsWith("application/json")) {
        try {
          const body = JSON.parse(text);
          if (body.error && body.response) {
            return body;
          }
        } catch {
        }
      }
      return {
        error: {
          name: "Error",
          message: `Request failed with status ${response.status} ${response.statusText}, ${text}`
        },
        response: {
          statusCode: response.status
        }
      };
    }
  } catch {
  }
  return {
    error: {
      name: "Error",
      message: `Request failed with status ${response.status} ${response.statusText}`
    },
    response: {
      statusCode: response.status
    }
  };
}

class CustomErrorBase extends Error {
  constructor(message, cause) {
    var _a;
    let fullMessage = message;
    if (cause !== void 0) {
      const causeStr = stringifyError(cause);
      if (fullMessage) {
        fullMessage += `; caused by ${causeStr}`;
      } else {
        fullMessage = `caused by ${causeStr}`;
      }
    }
    super(fullMessage);
    (_a = Error.captureStackTrace) == null ? void 0 : _a.call(Error, this, this.constructor);
    this.name = this.constructor.name;
    this.cause = isError(cause) ? cause : void 0;
  }
}

class InputError extends CustomErrorBase {
}
class AuthenticationError extends CustomErrorBase {
}
class NotAllowedError extends CustomErrorBase {
}
class NotFoundError extends CustomErrorBase {
}
class ConflictError extends CustomErrorBase {
}
class NotModifiedError extends CustomErrorBase {
}
class ForwardedError extends CustomErrorBase {
  constructor(message, cause) {
    super(message, cause);
    this.name = isError(cause) ? cause.name : "Error";
  }
}

class ResponseError extends Error {
  constructor(props) {
    super(props.message);
    this.name = "ResponseError";
    this.response = props.response;
    this.body = props.data;
    this.cause = props.cause;
  }
  static async fromResponse(response) {
    const data = await parseErrorResponseBody(response);
    const status = data.response.statusCode || response.status;
    const statusText = data.error.name || response.statusText;
    const message = `Request failed with ${status} ${statusText}`;
    const cause = deserializeError(data.error);
    return new ResponseError({
      message,
      response,
      data,
      cause
    });
  }
}

exports.AuthenticationError = AuthenticationError;
exports.ConflictError = ConflictError;
exports.CustomErrorBase = CustomErrorBase;
exports.ForwardedError = ForwardedError;
exports.InputError = InputError;
exports.NotAllowedError = NotAllowedError;
exports.NotFoundError = NotFoundError;
exports.NotModifiedError = NotModifiedError;
exports.ResponseError = ResponseError;
exports.assertError = assertError;
exports.deserializeError = deserializeError;
exports.isError = isError;
exports.parseErrorResponseBody = parseErrorResponseBody;
exports.serializeError = serializeError;
exports.stringifyError = stringifyError;
//# sourceMappingURL=index.cjs.js.map
