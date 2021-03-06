'use strict';

var winston = require('winston');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var winston__namespace = /*#__PURE__*/_interopNamespace(winston);

const convertTechDocsRefToLocationAnnotation = (techdocsRef) => {
  const [type, target] = techdocsRef.split(/:(.+)/);
  if (!type || !target) {
    throw new Error(`Can not parse --techdocs-ref ${techdocsRef}. Should be of type HOST:URL.`);
  }
  return { type, target };
};
const createLogger = ({
  verbose = false
}) => {
  const logger = winston__namespace.createLogger({
    level: verbose ? "verbose" : "info",
    transports: [
      new winston__namespace.transports.Console({ format: winston__namespace.format.simple() })
    ]
  });
  return logger;
};

exports.convertTechDocsRefToLocationAnnotation = convertTechDocsRefToLocationAnnotation;
exports.createLogger = createLogger;
//# sourceMappingURL=utility-51f4a306.cjs.js.map
