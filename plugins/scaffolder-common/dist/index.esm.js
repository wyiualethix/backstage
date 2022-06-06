import { entityKindSchemaValidator } from '@backstage/catalog-model';

var $schema = "http://json-schema.org/draft-07/schema";
var $id = "TemplateV1beta3";
var description = "A Template describes a scaffolding task for use with the Scaffolder. It describes the required parameters as well as a series of steps that will be taken to execute the scaffolding task.";
var examples = [
	{
		apiVersion: "scaffolder.backstage.io/v1beta3",
		kind: "Template",
		metadata: {
			name: "react-ssr-template",
			title: "React SSR Template",
			description: "Next.js application skeleton for creating isomorphic web applications.",
			tags: [
				"recommended",
				"react"
			]
		},
		spec: {
			owner: "artist-relations-team",
			parameters: {
				required: [
					"name",
					"description",
					"repoUrl"
				],
				properties: {
					name: {
						title: "Name",
						type: "string",
						description: "Unique name of the component"
					},
					description: {
						title: "Description",
						type: "string",
						description: "Description of the component"
					},
					repoUrl: {
						title: "Pick a repository",
						type: "string",
						"ui:field": "RepoUrlPicker"
					}
				}
			},
			steps: [
				{
					id: "fetch",
					name: "Fetch",
					action: "fetch:plain",
					parameters: {
						url: "./template"
					}
				},
				{
					id: "publish",
					name: "Publish to GitHub",
					action: "publish:github",
					parameters: {
						repoUrl: "${{ parameters.repoUrl }}"
					},
					"if": "${{ parameters.repoUrl }}"
				}
			],
			output: {
				catalogInfoUrl: "${{ steps.publish.output.catalogInfoUrl }}"
			}
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
					"scaffolder.backstage.io/v1beta3"
				]
			},
			kind: {
				"enum": [
					"Template"
				]
			},
			spec: {
				type: "object",
				required: [
					"type",
					"steps"
				],
				properties: {
					type: {
						type: "string",
						description: "The type of component created by the template. The software catalog accepts any type value, but an organization should take great care to establish a proper taxonomy for these. Tools including Backstage itself may read this field and behave differently depending on its value. For example, a website type component may present tooling in the Backstage interface that is specific to just websites.",
						examples: [
							"service",
							"website",
							"library"
						],
						minLength: 1
					},
					owner: {
						type: "string",
						description: "The user (or group) owner of the template",
						minLength: 1
					},
					parameters: {
						oneOf: [
							{
								type: "object",
								description: "The JSONSchema describing the inputs for the template."
							},
							{
								type: "array",
								description: "A list of separate forms to collect parameters.",
								items: {
									type: "object",
									description: "The JSONSchema describing the inputs for the template."
								}
							}
						]
					},
					steps: {
						type: "array",
						description: "A list of steps to execute.",
						items: {
							type: "object",
							description: "A description of the step to execute.",
							required: [
								"action"
							],
							properties: {
								id: {
									type: "string",
									description: "The ID of the step, which can be used to refer to its outputs."
								},
								name: {
									type: "string",
									description: "The name of the step, which will be displayed in the UI during the scaffolding process."
								},
								action: {
									type: "string",
									description: "The name of the action to execute."
								},
								input: {
									type: "object",
									description: "A templated object describing the inputs to the action."
								},
								"if": {
									type: [
										"string",
										"boolean"
									],
									description: "A templated condition that skips the step when evaluated to false. If the condition is true or not defined, the step is executed. The condition is true, if the input is not `false`, `undefined`, `null`, `\"\"`, `0`, or `[]`."
								}
							}
						}
					},
					output: {
						type: "object",
						description: "A templated object describing the outputs of the scaffolding task.",
						properties: {
							links: {
								type: "array",
								description: "A list of external hyperlinks, typically pointing to resources created or updated by the template",
								items: {
									type: "object",
									required: [
									],
									properties: {
										url: {
											type: "string",
											description: "A url in a standard uri format.",
											examples: [
												"https://github.com/my-org/my-new-repo"
											],
											minLength: 1
										},
										entityRef: {
											type: "string",
											description: "An entity reference to an entity in the catalog.",
											examples: [
												"Component:default/my-app"
											],
											minLength: 1
										},
										title: {
											type: "string",
											description: "A user friendly display name for the link.",
											examples: [
												"View new repo"
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
						},
						additionalProperties: {
							type: "string"
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

const validator = entityKindSchemaValidator(schema);
const templateEntityV1beta3Validator = {
  async check(data) {
    return validator(data) === data;
  }
};

export { templateEntityV1beta3Validator };
//# sourceMappingURL=index.esm.js.map
