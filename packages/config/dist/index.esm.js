import cloneDeep from 'lodash/cloneDeep';
import mergeWith from 'lodash/mergeWith';

const CONFIG_KEY_PART_PATTERN = /^[a-z][a-z0-9]*(?:[-_][a-z][a-z0-9]*)*$/i;
function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function typeOf(value) {
  if (value === null) {
    return "null";
  } else if (Array.isArray(value)) {
    return "array";
  }
  const type = typeof value;
  if (type === "number" && isNaN(value)) {
    return "nan";
  }
  if (type === "string" && value === "") {
    return "empty-string";
  }
  return type;
}
const errors = {
  type(key, context, typeName, expected) {
    return `Invalid type in config for key '${key}' in '${context}', got ${typeName}, wanted ${expected}`;
  },
  missing(key) {
    return `Missing required config value at '${key}'`;
  },
  convert(key, context, expected) {
    return `Unable to convert config value for key '${key}' in '${context}' to a ${expected}`;
  }
};
class ConfigReader {
  constructor(data, context = "mock-config", fallback, prefix = "") {
    this.data = data;
    this.context = context;
    this.fallback = fallback;
    this.prefix = prefix;
    this.notifiedFilteredKeys = /* @__PURE__ */ new Set();
  }
  static fromConfigs(configs) {
    if (configs.length === 0) {
      return new ConfigReader(void 0);
    }
    return configs.reduce((previousReader, { data, context, filteredKeys, deprecatedKeys }) => {
      const reader = new ConfigReader(data, context, previousReader);
      reader.filteredKeys = filteredKeys;
      if (deprecatedKeys) {
        for (const { key, description } of deprecatedKeys) {
          console.warn(`The configuration key '${key}' of ${context} is deprecated and may be removed soon. ${description || ""}`);
        }
      }
      return reader;
    }, void 0);
  }
  has(key) {
    var _a, _b;
    const value = this.readValue(key);
    if (value !== void 0) {
      return true;
    }
    return (_b = (_a = this.fallback) == null ? void 0 : _a.has(key)) != null ? _b : false;
  }
  keys() {
    var _a, _b;
    const localKeys = this.data ? Object.keys(this.data) : [];
    const fallbackKeys = (_b = (_a = this.fallback) == null ? void 0 : _a.keys()) != null ? _b : [];
    return [.../* @__PURE__ */ new Set([...localKeys, ...fallbackKeys])];
  }
  get(key) {
    const value = this.getOptional(key);
    if (value === void 0) {
      throw new Error(errors.missing(this.fullKey(key != null ? key : "")));
    }
    return value;
  }
  getOptional(key) {
    var _a, _b;
    const value = cloneDeep(this.readValue(key));
    const fallbackValue = (_a = this.fallback) == null ? void 0 : _a.getOptional(key);
    if (value === void 0) {
      if (process.env.NODE_ENV === "development") {
        if (fallbackValue === void 0 && key) {
          const fullKey = this.fullKey(key);
          if (((_b = this.filteredKeys) == null ? void 0 : _b.includes(fullKey)) && !this.notifiedFilteredKeys.has(fullKey)) {
            this.notifiedFilteredKeys.add(fullKey);
            console.warn(`Failed to read configuration value at '${fullKey}' as it is not visible. See https://backstage.io/docs/conf/defining#visibility for instructions on how to make it visible.`);
          }
        }
      }
      return fallbackValue;
    } else if (fallbackValue === void 0) {
      return value;
    }
    return mergeWith({}, { value: fallbackValue }, { value }, (into, from) => !isObject(from) || !isObject(into) ? from : void 0).value;
  }
  getConfig(key) {
    const value = this.getOptionalConfig(key);
    if (value === void 0) {
      throw new Error(errors.missing(this.fullKey(key)));
    }
    return value;
  }
  getOptionalConfig(key) {
    var _a;
    const value = this.readValue(key);
    const fallbackConfig = (_a = this.fallback) == null ? void 0 : _a.getOptionalConfig(key);
    if (isObject(value)) {
      return this.copy(value, key, fallbackConfig);
    }
    if (value !== void 0) {
      throw new TypeError(errors.type(this.fullKey(key), this.context, typeOf(value), "object"));
    }
    return fallbackConfig;
  }
  getConfigArray(key) {
    const value = this.getOptionalConfigArray(key);
    if (value === void 0) {
      throw new Error(errors.missing(this.fullKey(key)));
    }
    return value;
  }
  getOptionalConfigArray(key) {
    var _a;
    const configs = this.readConfigValue(key, (values) => {
      if (!Array.isArray(values)) {
        return { expected: "object-array" };
      }
      for (const [index, value] of values.entries()) {
        if (!isObject(value)) {
          return { expected: "object-array", value, key: `${key}[${index}]` };
        }
      }
      return true;
    });
    if (!configs) {
      if (process.env.NODE_ENV === "development") {
        const fullKey = this.fullKey(key);
        if (((_a = this.filteredKeys) == null ? void 0 : _a.some((k) => k.startsWith(fullKey))) && !this.notifiedFilteredKeys.has(key)) {
          this.notifiedFilteredKeys.add(key);
          console.warn(`Failed to read configuration array at '${key}' as it does not have any visible elements. See https://backstage.io/docs/conf/defining#visibility for instructions on how to make it visible.`);
        }
      }
      return void 0;
    }
    return configs.map((obj, index) => this.copy(obj, `${key}[${index}]`));
  }
  getNumber(key) {
    const value = this.getOptionalNumber(key);
    if (value === void 0) {
      throw new Error(errors.missing(this.fullKey(key)));
    }
    return value;
  }
  getOptionalNumber(key) {
    const value = this.readConfigValue(key, (val) => typeof val === "number" || typeof val === "string" || { expected: "number" });
    if (typeof value === "number" || value === void 0) {
      return value;
    }
    const number = Number(value);
    if (!Number.isFinite(number)) {
      throw new Error(errors.convert(this.fullKey(key), this.context, "number"));
    }
    return number;
  }
  getBoolean(key) {
    const value = this.getOptionalBoolean(key);
    if (value === void 0) {
      throw new Error(errors.missing(this.fullKey(key)));
    }
    return value;
  }
  getOptionalBoolean(key) {
    return this.readConfigValue(key, (value) => typeof value === "boolean" || { expected: "boolean" });
  }
  getString(key) {
    const value = this.getOptionalString(key);
    if (value === void 0) {
      throw new Error(errors.missing(this.fullKey(key)));
    }
    return value;
  }
  getOptionalString(key) {
    return this.readConfigValue(key, (value) => typeof value === "string" && value !== "" || { expected: "string" });
  }
  getStringArray(key) {
    const value = this.getOptionalStringArray(key);
    if (value === void 0) {
      throw new Error(errors.missing(this.fullKey(key)));
    }
    return value;
  }
  getOptionalStringArray(key) {
    return this.readConfigValue(key, (values) => {
      if (!Array.isArray(values)) {
        return { expected: "string-array" };
      }
      for (const [index, value] of values.entries()) {
        if (typeof value !== "string" || value === "") {
          return { expected: "string-array", value, key: `${key}[${index}]` };
        }
      }
      return true;
    });
  }
  fullKey(key) {
    return `${this.prefix}${this.prefix ? "." : ""}${key}`;
  }
  copy(data, key, fallback) {
    const reader = new ConfigReader(data, this.context, fallback, this.fullKey(key));
    reader.filteredKeys = this.filteredKeys;
    return reader;
  }
  readConfigValue(key, validate) {
    var _a, _b;
    const value = this.readValue(key);
    if (value === void 0) {
      if (process.env.NODE_ENV === "development") {
        const fullKey = this.fullKey(key);
        if (((_a = this.filteredKeys) == null ? void 0 : _a.includes(fullKey)) && !this.notifiedFilteredKeys.has(fullKey)) {
          this.notifiedFilteredKeys.add(fullKey);
          console.warn(`Failed to read configuration value at '${fullKey}' as it is not visible. See https://backstage.io/docs/conf/defining#visibility for instructions on how to make it visible.`);
        }
      }
      return (_b = this.fallback) == null ? void 0 : _b.readConfigValue(key, validate);
    }
    const result = validate(value);
    if (result !== true) {
      const { key: keyName = key, value: theValue = value, expected } = result;
      throw new TypeError(errors.type(this.fullKey(keyName), this.context, typeOf(theValue), expected));
    }
    return value;
  }
  readValue(key) {
    const parts = key ? key.split(".") : [];
    for (const part of parts) {
      if (!CONFIG_KEY_PART_PATTERN.test(part)) {
        throw new TypeError(`Invalid config key '${key}'`);
      }
    }
    if (this.data === void 0) {
      return void 0;
    }
    let value = this.data;
    for (const [index, part] of parts.entries()) {
      if (isObject(value)) {
        value = value[part];
      } else if (value !== void 0) {
        const badKey = this.fullKey(parts.slice(0, index).join("."));
        throw new TypeError(errors.type(badKey, this.context, typeOf(value), "object"));
      }
    }
    return value;
  }
}

export { ConfigReader };
//# sourceMappingURL=index.esm.js.map
