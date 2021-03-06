import lodash from 'lodash';
import Ajv from 'ajv';

const DEFAULT_NAMESPACE = "default";
const ANNOTATION_VIEW_URL = "backstage.io/view-url";
const ANNOTATION_EDIT_URL = "backstage.io/edit-url";

class DefaultNamespaceEntityPolicy {
  constructor(namespace = DEFAULT_NAMESPACE) {
    this.namespace = namespace;
  }
  async enforce(entity) {
    if (entity.metadata.namespace) {
      return entity;
    }
    return lodash.merge({ metadata: { namespace: this.namespace } }, entity);
  }
}

class CommonValidatorFunctions {
  static isValidPrefixAndOrSuffix(value, separator, isValidPrefix, isValidSuffix) {
    if (typeof value !== "string") {
      return false;
    }
    const parts = value.split(separator);
    if (parts.length === 1) {
      return isValidSuffix(parts[0]);
    } else if (parts.length === 2) {
      return isValidPrefix(parts[0]) && isValidSuffix(parts[1]);
    }
    return false;
  }
  static isJsonSafe(value) {
    try {
      return lodash.isEqual(value, JSON.parse(JSON.stringify(value)));
    } catch {
      return false;
    }
  }
  static isValidDnsSubdomain(value) {
    return typeof value === "string" && value.length >= 1 && value.length <= 253 && value.split(".").every(CommonValidatorFunctions.isValidDnsLabel);
  }
  static isValidDnsLabel(value) {
    return typeof value === "string" && value.length >= 1 && value.length <= 63 && /^[a-z0-9]+(\-[a-z0-9]+)*$/.test(value);
  }
  static isValidTag(value) {
    return typeof value === "string" && value.length >= 1 && value.length <= 63 && /^[a-z0-9+#]+(\-[a-z0-9+#]+)*$/.test(value);
  }
  static isValidUrl(value) {
    if (typeof value !== "string") {
      return false;
    }
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
  static isValidString(value) {
    var _a;
    return typeof value === "string" && ((_a = value == null ? void 0 : value.trim()) == null ? void 0 : _a.length) >= 1;
  }
  static isNonEmptyString(value) {
    var _a;
    return typeof value === "string" && ((_a = value == null ? void 0 : value.trim()) == null ? void 0 : _a.length) >= 1;
  }
}

var $schema$b = "http://json-schema.org/draft-07/schema";
var $id$b = "EntityEnvelope";
var description$b = "The envelope skeleton parts of an entity - whatever is necessary to be able to give it a ref and pass to further validation / policy checking.";
var examples$a = [
	{
		apiVersion: "backstage.io/v1alpha1",
		kind: "Component",
		metadata: {
			name: "LoremService"
		}
	}
];
var type$3 = "object";
var required$2 = [
	"apiVersion",
	"kind",
	"metadata"
];
var additionalProperties$2 = true;
var properties$2 = {
	apiVersion: {
		type: "string",
		description: "The version of specification format for this particular entity that this is written against.",
		minLength: 1,
		examples: [
			"backstage.io/v1alpha1",
			"my-company.net/v1",
			"1.0"
		]
	},
	kind: {
		type: "string",
		description: "The high level entity type being described.",
		minLength: 1,
		examples: [
			"API",
			"Component",
			"Domain",
			"Group",
			"Location",
			"Resource",
			"System",
			"Template",
			"User"
		]
	},
	metadata: {
		type: "object",
		required: [
			"name"
		],
		additionalProperties: true,
		properties: {
			name: {
				type: "string",
				description: "The name of the entity. Must be unique within the catalog at any given point in time, for any given namespace + kind pair.",
				examples: [
					"metadata-proxy"
				],
				minLength: 1
			},
			namespace: {
				type: "string",
				description: "The namespace that the entity belongs to.",
				"default": "default",
				examples: [
					"default",
					"admin"
				],
				minLength: 1
			}
		}
	}
};
var entityEnvelopeSchema = {
	$schema: $schema$b,
	$id: $id$b,
	description: description$b,
	examples: examples$a,
	type: type$3,
	required: required$2,
	additionalProperties: additionalProperties$2,
	properties: properties$2
};

var $schema$a = "http://json-schema.org/draft-07/schema";
var $id$a = "Entity";
var description$a = "The parts of the format that's common to all versions/kinds of entity.";
var examples$9 = [
	{
		apiVersion: "backstage.io/v1alpha1",
		kind: "Component",
		metadata: {
			name: "LoremService",
			description: "Creates Lorems like a pro.",
			labels: {
				product_name: "Random value Generator"
			},
			annotations: {
				docs: "https://github.com/..../tree/develop/doc"
			}
		},
		spec: {
			type: "service",
			lifecycle: "production",
			owner: "tools"
		}
	}
];
var type$2 = "object";
var required$1 = [
	"apiVersion",
	"kind",
	"metadata"
];
var additionalProperties$1 = false;
var properties$1 = {
	apiVersion: {
		type: "string",
		description: "The version of specification format for this particular entity that this is written against.",
		minLength: 1,
		examples: [
			"backstage.io/v1alpha1",
			"my-company.net/v1",
			"1.0"
		]
	},
	kind: {
		type: "string",
		description: "The high level entity type being described.",
		minLength: 1,
		examples: [
			"API",
			"Component",
			"Domain",
			"Group",
			"Location",
			"Resource",
			"System",
			"Template",
			"User"
		]
	},
	metadata: {
		$ref: "EntityMeta"
	},
	spec: {
		type: "object",
		description: "The specification data describing the entity itself."
	},
	relations: {
		type: "array",
		description: "The relations that this entity has with other entities.",
		items: {
			$ref: "common#relation"
		}
	},
	status: {
		$ref: "common#status"
	}
};
var entitySchema = {
	$schema: $schema$a,
	$id: $id$a,
	description: description$a,
	examples: examples$9,
	type: type$2,
	required: required$1,
	additionalProperties: additionalProperties$1,
	properties: properties$1
};

var $schema$9 = "http://json-schema.org/draft-07/schema";
var $id$9 = "EntityMeta";
var description$9 = "Metadata fields common to all versions/kinds of entity.";
var examples$8 = [
	{
		uid: "e01199ab-08cc-44c2-8e19-5c29ded82521",
		etag: "lsndfkjsndfkjnsdfkjnsd==",
		name: "my-component-yay",
		namespace: "the-namespace",
		labels: {
			"backstage.io/custom": "ValueStuff"
		},
		annotations: {
			"example.com/bindings": "are-secret"
		},
		tags: [
			"java",
			"data"
		]
	}
];
var type$1 = "object";
var required = [
	"name"
];
var additionalProperties = true;
var properties = {
	uid: {
		type: "string",
		description: "A globally unique ID for the entity. This field can not be set by the user at creation time, and the server will reject an attempt to do so. The field will be populated in read operations. The field can (optionally) be specified when performing update or delete operations, but the server is free to reject requests that do so in such a way that it breaks semantics.",
		examples: [
			"e01199ab-08cc-44c2-8e19-5c29ded82521"
		],
		minLength: 1
	},
	etag: {
		type: "string",
		description: "An opaque string that changes for each update operation to any part of the entity, including metadata. This field can not be set by the user at creation time, and the server will reject an attempt to do so. The field will be populated in read operations. The field can (optionally) be specified when performing update or delete operations, and the server will then reject the operation if it does not match the current stored value.",
		examples: [
			"lsndfkjsndfkjnsdfkjnsd=="
		],
		minLength: 1
	},
	name: {
		type: "string",
		description: "The name of the entity. Must be unique within the catalog at any given point in time, for any given namespace + kind pair.",
		examples: [
			"metadata-proxy"
		],
		minLength: 1
	},
	namespace: {
		type: "string",
		description: "The namespace that the entity belongs to.",
		"default": "default",
		examples: [
			"default",
			"admin"
		],
		minLength: 1
	},
	title: {
		type: "string",
		description: "A display name of the entity, to be presented in user interfaces instead of the name property, when available.",
		examples: [
			"React SSR Template"
		],
		minLength: 1
	},
	description: {
		type: "string",
		description: "A short (typically relatively few words, on one line) description of the entity."
	},
	labels: {
		type: "object",
		description: "Key/value pairs of identifying information attached to the entity.",
		additionalProperties: true,
		patternProperties: {
			"^.+$": {
				type: "string"
			}
		}
	},
	annotations: {
		type: "object",
		description: "Key/value pairs of non-identifying auxiliary information attached to the entity.",
		additionalProperties: true,
		patternProperties: {
			"^.+$": {
				type: "string"
			}
		}
	},
	tags: {
		type: "array",
		description: "A list of single-valued strings, to for example classify catalog entities in various ways.",
		items: {
			type: "string",
			minLength: 1
		}
	},
	links: {
		type: "array",
		description: "A list of external hyperlinks related to the entity. Links can provide additional contextual information that may be located outside of Backstage itself. For example, an admin dashboard or external CMS page.",
		items: {
			type: "object",
			required: [
				"url"
			],
			properties: {
				url: {
					type: "string",
					description: "A url in a standard uri format.",
					examples: [
						"https://admin.example-org.com"
					],
					minLength: 1
				},
				title: {
					type: "string",
					description: "A user friendly display name for the link.",
					examples: [
						"Admin Dashboard"
					],
					minLength: 1
				},
				icon: {
					type: "string",
					description: "A key representing a visual icon to be displayed in the UI.",
					examples: [
						"dashboard"
					],
					minLength: 1
				}
			}
		}
	}
};
var entityMetaSchema = {
	$schema: $schema$9,
	$id: $id$9,
	description: description$9,
	examples: examples$8,
	type: type$1,
	required: required,
	additionalProperties: additionalProperties,
	properties: properties
};

var $schema$8 = "http://json-schema.org/draft-07/schema";
var $id$8 = "common";
var type = "object";
var description$8 = "Common definitions to import from other schemas";
var definitions = {
	reference: {
		$id: "#reference",
		type: "object",
		description: "A reference by name to another entity.",
		required: [
			"kind",
			"namespace",
			"name"
		],
		additionalProperties: false,
		properties: {
			kind: {
				type: "string",
				description: "The kind field of the entity.",
				minLength: 1
			},
			namespace: {
				type: "string",
				description: "The metadata.namespace field of the entity.",
				minLength: 1
			},
			name: {
				type: "string",
				description: "The metadata.name field of the entity.",
				minLength: 1
			}
		}
	},
	relation: {
		$id: "#relation",
		type: "object",
		description: "A directed relation from one entity to another.",
		required: [
			"type",
			"target"
		],
		additionalProperties: false,
		properties: {
			type: {
				type: "string",
				minLength: 1,
				pattern: "^\\w+$",
				description: "The type of relation."
			},
			target: {
				$ref: "#reference"
			},
			targetRef: {
				type: "string",
				minLength: 1,
				description: "The entity ref of the target of this relation."
			}
		}
	},
	status: {
		$id: "#status",
		type: "object",
		description: "The current status of the entity, as claimed by various sources.",
		required: [
		],
		additionalProperties: true,
		properties: {
			items: {
				type: "array",
				items: {
					$ref: "#statusItem"
				}
			}
		}
	},
	statusItem: {
		$id: "#statusItem",
		type: "object",
		description: "A specific status item on a well known format.",
		required: [
			"type",
			"level",
			"message"
		],
		additionalProperties: true,
		properties: {
			type: {
				type: "string",
				minLength: 1
			},
			level: {
				$ref: "#statusLevel",
				description: "The status level / severity of the status item."
			},
			message: {
				type: "string",
				description: "A brief message describing the status, intended for human consumption."
			},
			error: {
				$ref: "#error",
				description: "An optional serialized error object related to the status."
			}
		}
	},
	statusLevel: {
		$id: "#statusLevel",
		type: "string",
		description: "A status level / severity.",
		"enum": [
			"info",
			"warning",
			"error"
		]
	},
	error: {
		$id: "#error",
		type: "object",
		description: "A serialized error object.",
		required: [
			"name",
			"message"
		],
		additionalProperties: true,
		properties: {
			name: {
				type: "string",
				examples: [
					"Error",
					"InputError"
				],
				description: "The type name of the error",
				minLength: 1
			},
			message: {
				type: "string",
				description: "The message of the error"
			},
			code: {
				type: "string",
				description: "An error code associated with the error"
			},
			stack: {
				type: "string",
				description: "An error stack trace"
			}
		}
	}
};
var commonSchema = {
	$schema: $schema$8,
	$id: $id$8,
	type: type,
	description: description$8,
	definitions: definitions
};

const compiledSchemaCache = /* @__PURE__ */ new Map();
const refDependencyCandidates = [
  entityEnvelopeSchema,
  entitySchema,
  entityMetaSchema,
  commonSchema
];
function throwAjvError(errors) {
  if (!(errors == null ? void 0 : errors.length)) {
    throw new TypeError("Unknown error");
  }
  const error = errors[0];
  throw new TypeError(`${error.instancePath || "<root>"} ${error.message}${error.params ? ` - ${Object.entries(error.params).map(([key, val]) => `${key}: ${val}`).join(", ")}` : ""}`);
}
function compileAjvSchema(schema, options = {}) {
  var _a;
  const disableCache = (_a = options == null ? void 0 : options.disableCache) != null ? _a : false;
  const cacheKey = disableCache ? "" : JSON.stringify(schema);
  if (!disableCache) {
    const cached = compiledSchemaCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }
  const extraSchemas = getExtraSchemas(schema);
  const ajv = new Ajv({
    allowUnionTypes: true,
    allErrors: true,
    validateSchema: true
  });
  if (extraSchemas.length) {
    ajv.addSchema(extraSchemas, void 0, void 0, true);
  }
  const compiled = ajv.compile(schema);
  if (!disableCache) {
    compiledSchemaCache.set(cacheKey, compiled);
  }
  return compiled;
}
function getExtraSchemas(schema) {
  if (typeof schema !== "object") {
    return [];
  }
  const seen = /* @__PURE__ */ new Set();
  if (schema.$id) {
    seen.add(schema.$id);
  }
  const selected = new Array();
  const todo = [schema];
  while (todo.length) {
    const current = todo.pop();
    for (const ref of getAllRefs(current)) {
      if (!seen.has(ref)) {
        seen.add(ref);
        const match = refDependencyCandidates.find((c) => c.$id === ref);
        if (match) {
          selected.push(match);
          todo.push(match);
        }
      }
    }
  }
  return selected;
}
function* getAllRefs(schema) {
  const todo = [schema];
  while (todo.length) {
    const current = todo.pop();
    if (typeof current === "object" && current) {
      for (const [key, value] of Object.entries(current)) {
        if (key === "$ref" && typeof value === "string") {
          yield value.split("#")[0];
        } else {
          todo.push(value);
        }
      }
    }
  }
}

function entityEnvelopeSchemaValidator(schema) {
  const validate = compileAjvSchema(schema ? schema : entityEnvelopeSchema);
  return (data) => {
    const result = validate(data);
    if (result === true) {
      return data;
    }
    throw throwAjvError(validate.errors);
  };
}

function entityKindSchemaValidator(schema) {
  const validate = compileAjvSchema(schema);
  return (data) => {
    var _a;
    const result = validate(data);
    if (result === true) {
      return data;
    }
    const softCandidates = (_a = validate.errors) == null ? void 0 : _a.filter((e) => ["/kind", "/apiVersion"].includes(e.instancePath));
    if ((softCandidates == null ? void 0 : softCandidates.length) && softCandidates.every((e) => e.keyword === "enum")) {
      return false;
    }
    throw throwAjvError(validate.errors);
  };
}

function entitySchemaValidator(schema) {
  const validate = compileAjvSchema(schema ? schema : entitySchema);
  return (data) => {
    const result = validate(data);
    if (result === true) {
      return data;
    }
    throw throwAjvError(validate.errors);
  };
}

class KubernetesValidatorFunctions {
  static isValidApiVersion(value) {
    return CommonValidatorFunctions.isValidPrefixAndOrSuffix(value, "/", CommonValidatorFunctions.isValidDnsSubdomain, (n) => n.length >= 1 && n.length <= 63 && /^[a-z0-9A-Z]+$/.test(n));
  }
  static isValidKind(value) {
    return typeof value === "string" && value.length >= 1 && value.length <= 63 && /^[a-zA-Z][a-z0-9A-Z]*$/.test(value);
  }
  static isValidObjectName(value) {
    return typeof value === "string" && value.length >= 1 && value.length <= 63 && /^([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]$/.test(value);
  }
  static isValidNamespace(value) {
    return CommonValidatorFunctions.isValidDnsLabel(value);
  }
  static isValidLabelKey(value) {
    return CommonValidatorFunctions.isValidPrefixAndOrSuffix(value, "/", CommonValidatorFunctions.isValidDnsSubdomain, KubernetesValidatorFunctions.isValidObjectName);
  }
  static isValidLabelValue(value) {
    return value === "" || KubernetesValidatorFunctions.isValidObjectName(value);
  }
  static isValidAnnotationKey(value) {
    return CommonValidatorFunctions.isValidPrefixAndOrSuffix(value, "/", CommonValidatorFunctions.isValidDnsSubdomain, KubernetesValidatorFunctions.isValidObjectName);
  }
  static isValidAnnotationValue(value) {
    return typeof value === "string";
  }
}

const defaultValidators = {
  isValidApiVersion: KubernetesValidatorFunctions.isValidApiVersion,
  isValidKind: KubernetesValidatorFunctions.isValidKind,
  isValidEntityName: KubernetesValidatorFunctions.isValidObjectName,
  isValidNamespace: KubernetesValidatorFunctions.isValidNamespace,
  isValidLabelKey: KubernetesValidatorFunctions.isValidLabelKey,
  isValidLabelValue: KubernetesValidatorFunctions.isValidLabelValue,
  isValidAnnotationKey: KubernetesValidatorFunctions.isValidAnnotationKey,
  isValidAnnotationValue: KubernetesValidatorFunctions.isValidAnnotationValue,
  isValidTag: (value) => {
    return typeof value === "string" && value.length >= 1 && value.length <= 63 && /^[a-z0-9:+#]+(\-[a-z0-9:+#]+)*$/.test(value);
  }
};
function makeValidator(overrides = {}) {
  return {
    ...defaultValidators,
    ...overrides
  };
}

class FieldFormatEntityPolicy {
  constructor(validators = makeValidator()) {
    this.validators = validators;
  }
  async enforce(entity) {
    var _a, _b, _c, _d, _e, _f, _g;
    function require(field, value, validator) {
      if (value === void 0 || value === null) {
        throw new Error(`${field} must have a value`);
      }
      let isValid;
      try {
        isValid = validator(value);
      } catch (e) {
        throw new Error(`${field} could not be validated, ${e}`);
      }
      if (!isValid) {
        let expectation;
        switch (validator.name) {
          case "isValidLabelValue":
          case "isValidObjectName":
            expectation = "a string that is sequences of [a-zA-Z0-9] separated by any of [-_.], at most 63 characters in total";
            break;
          case "isValidLabelKey":
          case "isValidApiVersion":
          case "isValidAnnotationKey":
            expectation = "a valid prefix and/or suffix";
            break;
          case "isValidNamespace":
          case "isValidDnsLabel":
            expectation = "a string that is sequences of [a-z0-9] separated by [-], at most 63 characters in total";
            break;
          case "isValidTag":
            expectation = "a string that is sequences of [a-z0-9+#] separated by [-], at most 63 characters in total";
            break;
          case "isValidAnnotationValue":
            expectation = "a string";
            break;
          case "isValidKind":
            expectation = "a string that is a sequence of [a-zA-Z][a-z0-9A-Z], at most 63 characters in total";
            break;
          case "isValidUrl":
            expectation = "a string that is a valid url";
            break;
          case "isValidString":
          case "isNonEmptyString":
            expectation = "a non empty string";
            break;
          default:
            expectation = void 0;
            break;
        }
        const message = expectation ? ` expected ${expectation} but found "${value}".` : "";
        throw new Error(`"${field}" is not valid;${message} To learn more about catalog file format, visit: https://github.com/backstage/backstage/blob/master/docs/architecture-decisions/adr002-default-catalog-file-format.md`);
      }
    }
    function optional(field, value, validator) {
      return value === void 0 || require(field, value, validator);
    }
    require("apiVersion", entity.apiVersion, this.validators.isValidApiVersion);
    require("kind", entity.kind, this.validators.isValidKind);
    require("metadata.name", entity.metadata.name, this.validators.isValidEntityName);
    optional("metadata.namespace", entity.metadata.namespace, this.validators.isValidNamespace);
    for (const [k, v] of Object.entries((_a = entity.metadata.labels) != null ? _a : [])) {
      require(`labels.${k}`, k, this.validators.isValidLabelKey);
      require(`labels.${k}`, v, this.validators.isValidLabelValue);
    }
    for (const [k, v] of Object.entries((_b = entity.metadata.annotations) != null ? _b : [])) {
      require(`annotations.${k}`, k, this.validators.isValidAnnotationKey);
      require(`annotations.${k}`, v, this.validators.isValidAnnotationValue);
    }
    const tags = (_c = entity.metadata.tags) != null ? _c : [];
    for (let i = 0; i < tags.length; ++i) {
      require(`tags.${i}`, tags[i], this.validators.isValidTag);
    }
    const links = (_d = entity.metadata.links) != null ? _d : [];
    for (let i = 0; i < links.length; ++i) {
      require(`links.${i}.url`, (_e = links[i]) == null ? void 0 : _e.url, CommonValidatorFunctions.isValidUrl);
      optional(`links.${i}.title`, (_f = links[i]) == null ? void 0 : _f.title, CommonValidatorFunctions.isNonEmptyString);
      optional(`links.${i}.icon`, (_g = links[i]) == null ? void 0 : _g.icon, KubernetesValidatorFunctions.isValidObjectName);
    }
    return entity;
  }
}

const defaultKnownFields = ["apiVersion", "kind", "metadata", "spec"];
class NoForeignRootFieldsEntityPolicy {
  constructor(knownFields = defaultKnownFields) {
    this.knownFields = knownFields;
  }
  async enforce(entity) {
    for (const field of Object.keys(entity)) {
      if (!this.knownFields.includes(field)) {
        throw new Error(`Unknown field ${field}`);
      }
    }
    return entity;
  }
}

class SchemaValidEntityPolicy {
  async enforce(entity) {
    if (!this.validate) {
      const ajv = new Ajv({ allowUnionTypes: true });
      this.validate = ajv.addSchema([commonSchema, entityMetaSchema], void 0, void 0, true).compile(entitySchema);
    }
    const result = this.validate(entity);
    if (result === true) {
      return entity;
    }
    const [error] = this.validate.errors || [];
    if (!error) {
      throw new Error(`Malformed envelope, Unknown error`);
    }
    throw new Error(`Malformed envelope, ${error.instancePath || "<root>"} ${error.message}`);
  }
}

function parseRefString(ref) {
  let colonI = ref.indexOf(":");
  const slashI = ref.indexOf("/");
  if (slashI !== -1 && slashI < colonI) {
    colonI = -1;
  }
  const kind = colonI === -1 ? void 0 : ref.slice(0, colonI);
  const namespace = slashI === -1 ? void 0 : ref.slice(colonI + 1, slashI);
  const name = ref.slice(Math.max(colonI + 1, slashI + 1));
  if (kind === "" || namespace === "" || name === "") {
    throw new TypeError(`Entity reference "${ref}" was not on the form [<kind>:][<namespace>/]<name>`);
  }
  return { kind, namespace, name };
}
function getCompoundEntityRef(entity) {
  return {
    kind: entity.kind,
    namespace: entity.metadata.namespace || DEFAULT_NAMESPACE,
    name: entity.metadata.name
  };
}
function parseEntityRef(ref, context) {
  var _a, _b, _c, _d;
  if (!ref) {
    throw new Error(`Entity reference must not be empty`);
  }
  const defaultKind = context == null ? void 0 : context.defaultKind;
  const defaultNamespace = (context == null ? void 0 : context.defaultNamespace) || DEFAULT_NAMESPACE;
  let kind;
  let namespace;
  let name;
  if (typeof ref === "string") {
    const parsed = parseRefString(ref);
    kind = (_a = parsed.kind) != null ? _a : defaultKind;
    namespace = (_b = parsed.namespace) != null ? _b : defaultNamespace;
    name = parsed.name;
  } else {
    kind = (_c = ref.kind) != null ? _c : defaultKind;
    namespace = (_d = ref.namespace) != null ? _d : defaultNamespace;
    name = ref.name;
  }
  if (!kind) {
    const textual = JSON.stringify(ref);
    throw new Error(`Entity reference ${textual} had missing or empty kind (e.g. did not start with "component:" or similar)`);
  } else if (!namespace) {
    const textual = JSON.stringify(ref);
    throw new Error(`Entity reference ${textual} had missing or empty namespace`);
  } else if (!name) {
    const textual = JSON.stringify(ref);
    throw new Error(`Entity reference ${textual} had missing or empty name`);
  }
  return { kind, namespace, name };
}
function stringifyEntityRef(ref) {
  var _a, _b;
  let kind;
  let namespace;
  let name;
  if ("metadata" in ref) {
    kind = ref.kind;
    namespace = (_a = ref.metadata.namespace) != null ? _a : DEFAULT_NAMESPACE;
    name = ref.metadata.name;
  } else {
    kind = ref.kind;
    namespace = (_b = ref.namespace) != null ? _b : DEFAULT_NAMESPACE;
    name = ref.name;
  }
  return `${kind.toLocaleLowerCase("en-US")}:${namespace.toLocaleLowerCase("en-US")}/${name.toLocaleLowerCase("en-US")}`;
}

class AllEntityPolicies {
  constructor(policies) {
    this.policies = policies;
  }
  async enforce(entity) {
    let result = entity;
    for (const policy of this.policies) {
      const output = await policy.enforce(result);
      if (!output) {
        throw new Error(`Policy ${policy.constructor.name} did not return a result`);
      }
      result = output;
    }
    return result;
  }
}
class AnyEntityPolicy {
  constructor(policies) {
    this.policies = policies;
  }
  async enforce(entity) {
    for (const policy of this.policies) {
      const output = await policy.enforce(entity);
      if (output) {
        return output;
      }
    }
    throw new Error(`The entity did not match any known policy`);
  }
}
const EntityPolicies = {
  allOf(policies) {
    return new AllEntityPolicies(policies);
  },
  oneOf(policies) {
    return new AnyEntityPolicy(policies);
  }
};

var $schema$7 = "http://json-schema.org/draft-07/schema";
var $id$7 = "ApiV1alpha1";
var description$7 = "An API describes an interface that can be exposed by a component. The API can be defined in different formats, like OpenAPI, AsyncAPI, GraphQL, gRPC, or other formats.";
var examples$7 = [
	{
		apiVersion: "backstage.io/v1alpha1",
		kind: "API",
		metadata: {
			name: "artist-api",
			description: "Retrieve artist details",
			labels: {
				product_name: "Random value Generator"
			},
			annotations: {
				docs: "https://github.com/..../tree/develop/doc"
			}
		},
		spec: {
			type: "openapi",
			lifecycle: "production",
			owner: "artist-relations-team",
			system: "artist-engagement-portal",
			definition: "openapi: \"3.0.0\"\ninfo:..."
		}
	}
];
var allOf$7 = [
	{
		$ref: "Entity"
	},
	{
		type: "object",
		required: [
			"spec"
		],
		properties: {
			apiVersion: {
				"enum": [
					"backstage.io/v1alpha1",
					"backstage.io/v1beta1"
				]
			},
			kind: {
				"enum": [
					"API"
				]
			},
			spec: {
				type: "object",
				required: [
					"type",
					"lifecycle",
					"owner",
					"definition"
				],
				properties: {
					type: {
						type: "string",
						description: "The type of the API definition.",
						examples: [
							"openapi",
							"asyncapi",
							"graphql",
							"grpc"
						],
						minLength: 1
					},
					lifecycle: {
						type: "string",
						description: "The lifecycle state of the API.",
						examples: [
							"experimental",
							"production",
							"deprecated"
						],
						minLength: 1
					},
					owner: {
						type: "string",
						description: "An entity reference to the owner of the API.",
						examples: [
							"artist-relations-team",
							"user:john.johnson"
						],
						minLength: 1
					},
					system: {
						type: "string",
						description: "An entity reference to the system that the API belongs to.",
						minLength: 1
					},
					definition: {
						type: "string",
						description: "The definition of the API, based on the format defined by the type.",
						minLength: 1
					}
				}
			}
		}
	}
];
var schema$7 = {
	$schema: $schema$7,
	$id: $id$7,
	description: description$7,
	examples: examples$7,
	allOf: allOf$7
};

function ajvCompiledJsonSchemaValidator(schema) {
  const validator = entityKindSchemaValidator(schema);
  return {
    async check(data) {
      return validator(data) === data;
    }
  };
}

const apiEntityV1alpha1Validator = ajvCompiledJsonSchemaValidator(schema$7);

var $schema$6 = "http://json-schema.org/draft-07/schema";
var $id$6 = "ComponentV1alpha1";
var description$6 = "A Component describes a software component. It is typically intimately linked to the source code that constitutes the component, and should be what a developer may regard a \"unit of software\", usually with a distinct deployable or linkable artifact.";
var examples$6 = [
	{
		apiVersion: "backstage.io/v1alpha1",
		kind: "Component",
		metadata: {
			name: "LoremService",
			description: "Creates Lorems like a pro.",
			labels: {
				product_name: "Random value Generator"
			},
			annotations: {
				docs: "https://github.com/..../tree/develop/doc"
			}
		},
		spec: {
			type: "service",
			lifecycle: "production",
			owner: "tools"
		}
	}
];
var allOf$6 = [
	{
		$ref: "Entity"
	},
	{
		type: "object",
		required: [
			"spec"
		],
		properties: {
			apiVersion: {
				"enum": [
					"backstage.io/v1alpha1",
					"backstage.io/v1beta1"
				]
			},
			kind: {
				"enum": [
					"Component"
				]
			},
			spec: {
				type: "object",
				required: [
					"type",
					"lifecycle",
					"owner"
				],
				properties: {
					type: {
						type: "string",
						description: "The type of component.",
						examples: [
							"service",
							"website",
							"library"
						],
						minLength: 1
					},
					lifecycle: {
						type: "string",
						description: "The lifecycle state of the component.",
						examples: [
							"experimental",
							"production",
							"deprecated"
						],
						minLength: 1
					},
					owner: {
						type: "string",
						description: "An entity reference to the owner of the component.",
						examples: [
							"artist-relations-team",
							"user:john.johnson"
						],
						minLength: 1
					},
					system: {
						type: "string",
						description: "An entity reference to the system that the component belongs to.",
						minLength: 1
					},
					subcomponentOf: {
						type: "string",
						description: "An entity reference to another component of which the component is a part.",
						minLength: 1
					},
					providesApis: {
						type: "array",
						description: "An array of entity references to the APIs that are provided by the component.",
						items: {
							type: "string",
							minLength: 1
						}
					},
					consumesApis: {
						type: "array",
						description: "An array of entity references to the APIs that are consumed by the component.",
						items: {
							type: "string",
							minLength: 1
						}
					},
					dependsOn: {
						type: "array",
						description: "An array of references to other entities that the component depends on to function.",
						items: {
							type: "string",
							minLength: 1
						}
					}
				}
			}
		}
	}
];
var schema$6 = {
	$schema: $schema$6,
	$id: $id$6,
	description: description$6,
	examples: examples$6,
	allOf: allOf$6
};

const componentEntityV1alpha1Validator = ajvCompiledJsonSchemaValidator(schema$6);

var $schema$5 = "http://json-schema.org/draft-07/schema";
var $id$5 = "DomainV1alpha1";
var description$5 = "A Domain groups a collection of systems that share terminology, domain models, business purpose, or documentation, i.e. form a bounded context.";
var examples$5 = [
	{
		apiVersion: "backstage.io/v1alpha1",
		kind: "Domain",
		metadata: {
			name: "artists",
			description: "Everything about artists"
		},
		spec: {
			owner: "artist-relations-team"
		}
	}
];
var allOf$5 = [
	{
		$ref: "Entity"
	},
	{
		type: "object",
		required: [
			"spec"
		],
		properties: {
			apiVersion: {
				"enum": [
					"backstage.io/v1alpha1",
					"backstage.io/v1beta1"
				]
			},
			kind: {
				"enum": [
					"Domain"
				]
			},
			spec: {
				type: "object",
				required: [
					"owner"
				],
				properties: {
					owner: {
						type: "string",
						description: "An entity reference to the owner of the component.",
						examples: [
							"artist-relations-team",
							"user:john.johnson"
						],
						minLength: 1
					}
				}
			}
		}
	}
];
var schema$5 = {
	$schema: $schema$5,
	$id: $id$5,
	description: description$5,
	examples: examples$5,
	allOf: allOf$5
};

const domainEntityV1alpha1Validator = ajvCompiledJsonSchemaValidator(schema$5);

var $schema$4 = "http://json-schema.org/draft-07/schema";
var $id$4 = "GroupV1alpha1";
var description$4 = "A group describes an organizational entity, such as for example a team, a business unit, or a loose collection of people in an interest group. Members of these groups are modeled in the catalog as kind User.";
var examples$4 = [
	{
		apiVersion: "backstage.io/v1alpha1",
		kind: "Group",
		metadata: {
			name: "infrastructure",
			description: "The infra business unit"
		},
		spec: {
			type: "business-unit",
			profile: {
				displayName: "Infrastructure",
				email: "infrastructure@example.com",
				picture: "https://example.com/groups/bu-infrastructure.jpeg"
			},
			parent: "ops",
			children: [
				"backstage",
				"other"
			]
		}
	}
];
var allOf$4 = [
	{
		$ref: "Entity"
	},
	{
		type: "object",
		required: [
			"spec"
		],
		properties: {
			apiVersion: {
				"enum": [
					"backstage.io/v1alpha1",
					"backstage.io/v1beta1"
				]
			},
			kind: {
				"enum": [
					"Group"
				]
			},
			spec: {
				type: "object",
				required: [
					"type",
					"children"
				],
				properties: {
					type: {
						type: "string",
						description: "The type of group. There is currently no enforced set of values for this field, so it is left up to the adopting organization to choose a nomenclature that matches their org hierarchy.",
						examples: [
							"team",
							"business-unit",
							"product-area",
							"root"
						],
						minLength: 1
					},
					profile: {
						type: "object",
						description: "Optional profile information about the group, mainly for display purposes. All fields of this structure are also optional. The email would be a group email of some form, that the group may wish to be used for contacting them. The picture is expected to be a URL pointing to an image that's representative of the group, and that a browser could fetch and render on a group page or similar.",
						properties: {
							displayName: {
								type: "string",
								description: "A simple display name to present to users.",
								examples: [
									"Infrastructure"
								],
								minLength: 1
							},
							email: {
								type: "string",
								description: "An email where this entity can be reached.",
								examples: [
									"infrastructure@example.com"
								],
								minLength: 1
							},
							picture: {
								type: "string",
								description: "The URL of an image that represents this entity.",
								examples: [
									"https://example.com/groups/bu-infrastructure.jpeg"
								],
								minLength: 1
							}
						}
					},
					parent: {
						type: "string",
						description: "The immediate parent group in the hierarchy, if any. Not all groups must have a parent; the catalog supports multi-root hierarchies. Groups may however not have more than one parent. This field is an entity reference.",
						examples: [
							"ops"
						],
						minLength: 1
					},
					children: {
						type: "array",
						description: "The immediate child groups of this group in the hierarchy (whose parent field points to this group). The list must be present, but may be empty if there are no child groups. The items are not guaranteed to be ordered in any particular way. The entries of this array are entity references.",
						items: {
							type: "string",
							examples: [
								"backstage",
								"other"
							],
							minLength: 1
						}
					},
					members: {
						type: "array",
						description: "The users that are members of this group. The entries of this array are entity references.",
						items: {
							type: "string",
							examples: [
								"jdoe"
							],
							minLength: 1
						}
					}
				}
			}
		}
	}
];
var schema$4 = {
	$schema: $schema$4,
	$id: $id$4,
	description: description$4,
	examples: examples$4,
	allOf: allOf$4
};

const groupEntityV1alpha1Validator = ajvCompiledJsonSchemaValidator(schema$4);

var $schema$3 = "http://json-schema.org/draft-07/schema";
var $id$3 = "LocationV1alpha1";
var description$3 = "A location is a marker that references other places to look for catalog data.";
var examples$3 = [
	{
		apiVersion: "backstage.io/v1alpha1",
		kind: "Location",
		metadata: {
			name: "org-data"
		},
		spec: {
			type: "url",
			targets: [
				"http://github.com/myorg/myproject/org-data-dump/catalog-info-staff.yaml",
				"http://github.com/myorg/myproject/org-data-dump/catalog-info-consultants.yaml"
			]
		}
	}
];
var allOf$3 = [
	{
		$ref: "Entity"
	},
	{
		type: "object",
		required: [
			"spec"
		],
		properties: {
			apiVersion: {
				"enum": [
					"backstage.io/v1alpha1",
					"backstage.io/v1beta1"
				]
			},
			kind: {
				"enum": [
					"Location"
				]
			},
			spec: {
				type: "object",
				required: [
				],
				properties: {
					type: {
						type: "string",
						description: "The single location type, that's common to the targets specified in the spec. If it is left out, it is inherited from the location type that originally read the entity data.",
						examples: [
							"url"
						],
						minLength: 1
					},
					target: {
						type: "string",
						description: "A single target as a string. Can be either an absolute path/URL (depending on the type), or a relative path such as ./details/catalog-info.yaml which is resolved relative to the location of this Location entity itself.",
						examples: [
							"./details/catalog-info.yaml"
						],
						minLength: 1
					},
					targets: {
						type: "array",
						description: "A list of targets as strings. They can all be either absolute paths/URLs (depending on the type), or relative paths such as ./details/catalog-info.yaml which are resolved relative to the location of this Location entity itself.",
						items: {
							type: "string",
							examples: [
								"./details/catalog-info.yaml",
								"http://github.com/myorg/myproject/org-data-dump/catalog-info-staff.yaml"
							],
							minLength: 1
						}
					},
					presence: {
						type: "string",
						description: "Whether the presence of the location target is required and it should be considered an error if it can not be found",
						"default": "required",
						examples: [
							"required"
						],
						"enum": [
							"required",
							"optional"
						]
					}
				}
			}
		}
	}
];
var schema$3 = {
	$schema: $schema$3,
	$id: $id$3,
	description: description$3,
	examples: examples$3,
	allOf: allOf$3
};

const locationEntityV1alpha1Validator = ajvCompiledJsonSchemaValidator(schema$3);

const RELATION_OWNED_BY = "ownedBy";
const RELATION_OWNER_OF = "ownerOf";
const RELATION_CONSUMES_API = "consumesApi";
const RELATION_API_CONSUMED_BY = "apiConsumedBy";
const RELATION_PROVIDES_API = "providesApi";
const RELATION_API_PROVIDED_BY = "apiProvidedBy";
const RELATION_DEPENDS_ON = "dependsOn";
const RELATION_DEPENDENCY_OF = "dependencyOf";
const RELATION_PARENT_OF = "parentOf";
const RELATION_CHILD_OF = "childOf";
const RELATION_MEMBER_OF = "memberOf";
const RELATION_HAS_MEMBER = "hasMember";
const RELATION_PART_OF = "partOf";
const RELATION_HAS_PART = "hasPart";

var $schema$2 = "http://json-schema.org/draft-07/schema";
var $id$2 = "ResourceV1alpha1";
var description$2 = "A resource describes the infrastructure a system needs to operate, like BigTable databases, Pub/Sub topics, S3 buckets or CDNs. Modelling them together with components and systems allows to visualize resource footprint, and create tooling around them.";
var examples$2 = [
	{
		apiVersion: "backstage.io/v1alpha1",
		kind: "Resource",
		metadata: {
			name: "artists-db",
			description: "Stores artist details"
		},
		spec: {
			type: "database",
			owner: "artist-relations-team",
			system: "artist-engagement-portal"
		}
	}
];
var allOf$2 = [
	{
		$ref: "Entity"
	},
	{
		type: "object",
		required: [
			"spec"
		],
		properties: {
			apiVersion: {
				"enum": [
					"backstage.io/v1alpha1",
					"backstage.io/v1beta1"
				]
			},
			kind: {
				"enum": [
					"Resource"
				]
			},
			spec: {
				type: "object",
				required: [
					"type",
					"owner"
				],
				properties: {
					type: {
						type: "string",
						description: "The type of resource.",
						examples: [
							"database",
							"s3-bucket",
							"cluster"
						],
						minLength: 1
					},
					owner: {
						type: "string",
						description: "An entity reference to the owner of the resource.",
						examples: [
							"artist-relations-team",
							"user:john.johnson"
						],
						minLength: 1
					},
					dependsOn: {
						type: "array",
						description: "An array of references to other entities that the resource depends on to function.",
						items: {
							type: "string",
							minLength: 1
						}
					},
					system: {
						type: "string",
						description: "An entity reference to the system that the resource belongs to.",
						minLength: 1
					}
				}
			}
		}
	}
];
var schema$2 = {
	$schema: $schema$2,
	$id: $id$2,
	description: description$2,
	examples: examples$2,
	allOf: allOf$2
};

const resourceEntityV1alpha1Validator = ajvCompiledJsonSchemaValidator(schema$2);

var $schema$1 = "http://json-schema.org/draft-07/schema";
var $id$1 = "SystemV1alpha1";
var description$1 = "A system is a collection of resources and components. The system may expose or consume one or several APIs. It is viewed as abstraction level that provides potential consumers insights into exposed features without needing a too detailed view into the details of all components. This also gives the owning team the possibility to decide about published artifacts and APIs.";
var examples$1 = [
	{
		apiVersion: "backstage.io/v1alpha1",
		kind: "System",
		metadata: {
			name: "artist-engagement-portal",
			description: "Handy tools to keep artists in the loop"
		},
		spec: {
			owner: "artist-relations-team",
			domain: "artists"
		}
	}
];
var allOf$1 = [
	{
		$ref: "Entity"
	},
	{
		type: "object",
		required: [
			"spec"
		],
		properties: {
			apiVersion: {
				"enum": [
					"backstage.io/v1alpha1",
					"backstage.io/v1beta1"
				]
			},
			kind: {
				"enum": [
					"System"
				]
			},
			spec: {
				type: "object",
				required: [
					"owner"
				],
				properties: {
					owner: {
						type: "string",
						description: "An entity reference to the owner of the component.",
						examples: [
							"artist-relations-team",
							"user:john.johnson"
						],
						minLength: 1
					},
					domain: {
						type: "string",
						description: "An entity reference to the domain that the system belongs to.",
						examples: [
							"artists"
						],
						minLength: 1
					}
				}
			}
		}
	}
];
var schema$1 = {
	$schema: $schema$1,
	$id: $id$1,
	description: description$1,
	examples: examples$1,
	allOf: allOf$1
};

const systemEntityV1alpha1Validator = ajvCompiledJsonSchemaValidator(schema$1);

var $schema = "http://json-schema.org/draft-07/schema";
var $id = "UserV1alpha1";
var description = "A user describes a person, such as an employee, a contractor, or similar. Users belong to Group entities in the catalog. These catalog user entries are connected to the way that authentication within the Backstage ecosystem works. See the auth section of the docs for a discussion of these concepts.";
var examples = [
	{
		apiVersion: "backstage.io/v1alpha1",
		kind: "User",
		metadata: {
			name: "jdoe"
		},
		spec: {
			profile: {
				displayName: "Jenny Doe",
				email: "jenny-doe@example.com",
				picture: "https://example.com/staff/jenny-with-party-hat.jpeg"
			},
			memberOf: [
				"team-b",
				"employees"
			]
		}
	}
];
var allOf = [
	{
		$ref: "Entity"
	},
	{
		type: "object",
		required: [
			"spec"
		],
		properties: {
			apiVersion: {
				"enum": [
					"backstage.io/v1alpha1",
					"backstage.io/v1beta1"
				]
			},
			kind: {
				"enum": [
					"User"
				]
			},
			spec: {
				type: "object",
				required: [
					"memberOf"
				],
				properties: {
					profile: {
						type: "object",
						description: "Optional profile information about the user, mainly for display purposes. All fields of this structure are also optional. The email would be a primary email of some form, that the user may wish to be used for contacting them. The picture is expected to be a URL pointing to an image that's representative of the user, and that a browser could fetch and render on a profile page or similar.",
						properties: {
							displayName: {
								type: "string",
								description: "A simple display name to present to users.",
								examples: [
									"Jenny Doe"
								],
								minLength: 1
							},
							email: {
								type: "string",
								description: "An email where this user can be reached.",
								examples: [
									"jenny-doe@example.com"
								],
								minLength: 1
							},
							picture: {
								type: "string",
								description: "The URL of an image that represents this user.",
								examples: [
									"https://example.com/staff/jenny-with-party-hat.jpeg"
								],
								minLength: 1
							}
						}
					},
					memberOf: {
						type: "array",
						description: "The list of groups that the user is a direct member of (i.e., no transitive memberships are listed here). The list must be present, but may be empty if the user is not member of any groups. The items are not guaranteed to be ordered in any particular way. The entries of this array are entity references.",
						items: {
							type: "string",
							examples: [
								"team-b",
								"employees"
							],
							minLength: 1
						}
					}
				}
			}
		}
	}
];
var schema = {
	$schema: $schema,
	$id: $id,
	description: description,
	examples: examples,
	allOf: allOf
};

const userEntityV1alpha1Validator = ajvCompiledJsonSchemaValidator(schema);

const ANNOTATION_LOCATION = "backstage.io/managed-by-location";
const ANNOTATION_ORIGIN_LOCATION = "backstage.io/managed-by-origin-location";
const ANNOTATION_SOURCE_LOCATION = "backstage.io/source-location";

function parseLocationRef(ref) {
  if (typeof ref !== "string") {
    throw new TypeError(`Unable to parse location ref '${ref}', unexpected argument ${typeof ref}`);
  }
  const splitIndex = ref.indexOf(":");
  if (splitIndex < 0) {
    throw new TypeError(`Unable to parse location ref '${ref}', expected '<type>:<target>', e.g. 'url:https://host/path'`);
  }
  const type = ref.substring(0, splitIndex).trim();
  const target = ref.substring(splitIndex + 1).trim();
  if (!type || !target) {
    throw new TypeError(`Unable to parse location ref '${ref}', expected '<type>:<target>', e.g. 'url:https://host/path'`);
  }
  if (type === "http" || type === "https") {
    throw new TypeError(`Invalid location ref '${ref}', please prefix it with 'url:', e.g. 'url:${ref}'`);
  }
  return { type, target };
}
function stringifyLocationRef(ref) {
  const { type, target } = ref;
  if (!type) {
    throw new TypeError(`Unable to stringify location ref, empty type`);
  } else if (!target) {
    throw new TypeError(`Unable to stringify location ref, empty target`);
  }
  return `${type}:${target}`;
}
function getEntitySourceLocation(entity) {
  var _a, _b, _c, _d, _e;
  const locationRef = (_e = (_b = (_a = entity.metadata) == null ? void 0 : _a.annotations) == null ? void 0 : _b[ANNOTATION_SOURCE_LOCATION]) != null ? _e : (_d = (_c = entity.metadata) == null ? void 0 : _c.annotations) == null ? void 0 : _d[ANNOTATION_LOCATION];
  if (!locationRef) {
    throw new Error(`Entity '${stringifyEntityRef(entity)}' is missing location`);
  }
  return parseLocationRef(locationRef);
}

export { ANNOTATION_EDIT_URL, ANNOTATION_LOCATION, ANNOTATION_ORIGIN_LOCATION, ANNOTATION_SOURCE_LOCATION, ANNOTATION_VIEW_URL, CommonValidatorFunctions, DEFAULT_NAMESPACE, DefaultNamespaceEntityPolicy, EntityPolicies, FieldFormatEntityPolicy, KubernetesValidatorFunctions, NoForeignRootFieldsEntityPolicy, RELATION_API_CONSUMED_BY, RELATION_API_PROVIDED_BY, RELATION_CHILD_OF, RELATION_CONSUMES_API, RELATION_DEPENDENCY_OF, RELATION_DEPENDS_ON, RELATION_HAS_MEMBER, RELATION_HAS_PART, RELATION_MEMBER_OF, RELATION_OWNED_BY, RELATION_OWNER_OF, RELATION_PARENT_OF, RELATION_PART_OF, RELATION_PROVIDES_API, SchemaValidEntityPolicy, apiEntityV1alpha1Validator, componentEntityV1alpha1Validator, domainEntityV1alpha1Validator, entityEnvelopeSchemaValidator, entityKindSchemaValidator, entitySchemaValidator, getCompoundEntityRef, getEntitySourceLocation, groupEntityV1alpha1Validator, locationEntityV1alpha1Validator, makeValidator, parseEntityRef, parseLocationRef, resourceEntityV1alpha1Validator, stringifyEntityRef, stringifyLocationRef, systemEntityV1alpha1Validator, userEntityV1alpha1Validator };
//# sourceMappingURL=index.esm.js.map
