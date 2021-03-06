/// <reference types="react" />
import * as _backstage_core_plugin_api from '@backstage/core-plugin-api';
import { DiscoveryApi, IdentityApi, ConfigApi } from '@backstage/core-plugin-api';
import { Entity, CompoundEntityRef } from '@backstage/catalog-model';
import React from 'react';
import { InfoCardVariants } from '@backstage/core-components';
import { TextFieldProps } from '@material-ui/core/TextField/TextField';
import { FieldErrors, Controller, UseFormProps, SubmitHandler, UseFormReturn, UnpackNestedValue } from 'react-hook-form';
import { CatalogApi } from '@backstage/catalog-client';
import { ScmIntegrationRegistry } from '@backstage/integration';
import { ScmAuthApi } from '@backstage/integration-react';

/**
 * A plugin that helps the user in importing projects and YAML files into the
 * catalog.
 *
 * @public
 */
declare const catalogImportPlugin: _backstage_core_plugin_api.BackstagePlugin<{
    importPage: _backstage_core_plugin_api.RouteRef<undefined>;
}, {}>;
/**
 * The page for importing projects and YAML files into the catalog.
 *
 * @public
 */
declare const CatalogImportPage: () => JSX.Element;

/**
 * The default catalog import page.
 *
 * @public
 */
declare const DefaultImportPage: () => JSX.Element;

/**
 * Props for {@link EntityListComponent}.
 *
 * @public
 */
interface EntityListComponentProps {
    locations: Array<{
        target: string;
        entities: (Entity | CompoundEntityRef)[];
    }>;
    locationListItemIcon: (target: string) => React.ReactElement;
    collapsed?: boolean;
    firstListItem?: React.ReactElement;
    onItemClick?: (target: string) => void;
    withLinks?: boolean;
}
/**
 * Shows a result list of entities.
 *
 * @public
 */
declare const EntityListComponent: (props: EntityListComponentProps) => JSX.Element;

/**
 * Props for {@link ImportInfoCard}.
 *
 * @public
 */
interface ImportInfoCardProps {
    exampleLocationUrl?: string;
    exampleRepositoryUrl?: string;
}
/**
 * Shows information about the import process.
 *
 * @public
 */
declare const ImportInfoCard: (props: ImportInfoCardProps) => JSX.Element;

declare type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] : T[P] extends object ? RecursivePartial<T[P]> : T[P];
};
declare type PartialEntity = RecursivePartial<Entity>;

/**
 * Utility API reference for the {@link CatalogImportApi}.
 *
 * @public
 */
declare const catalogImportApiRef: _backstage_core_plugin_api.ApiRef<CatalogImportApi>;
/**
 * Result of the analysis.
 *
 * @public
 */
declare type AnalyzeResult = {
    type: 'locations';
    locations: Array<{
        target: string;
        exists?: boolean;
        entities: CompoundEntityRef[];
    }>;
} | {
    type: 'repository';
    url: string;
    integrationType: string;
    generatedEntities: PartialEntity[];
};
/**
 * API for driving catalog imports.
 *
 * @public
 */
interface CatalogImportApi {
    analyzeUrl(url: string): Promise<AnalyzeResult>;
    preparePullRequest?(): Promise<{
        title: string;
        body: string;
    }>;
    submitPullRequest(options: {
        repositoryUrl: string;
        fileContent: string;
        title: string;
        body: string;
    }): Promise<{
        link: string;
        location: string;
    }>;
}

/**
 * The default implementation of the {@link CatalogImportApi}.
 *
 * @public
 */
declare class CatalogImportClient implements CatalogImportApi {
    private readonly discoveryApi;
    private readonly identityApi;
    private readonly scmAuthApi;
    private readonly scmIntegrationsApi;
    private readonly catalogApi;
    private readonly configApi;
    constructor(options: {
        discoveryApi: DiscoveryApi;
        scmAuthApi: ScmAuthApi;
        identityApi: IdentityApi;
        scmIntegrationsApi: ScmIntegrationRegistry;
        catalogApi: CatalogApi;
        configApi: ConfigApi;
    });
    analyzeUrl(url: string): Promise<AnalyzeResult>;
    preparePullRequest(): Promise<{
        title: string;
        body: string;
    }>;
    submitPullRequest(options: {
        repositoryUrl: string;
        fileContent: string;
        title: string;
        body: string;
    }): Promise<{
        link: string;
        location: string;
    }>;
    private generateEntityDefinitions;
    private checkGitHubForExistingCatalogInfo;
    private submitGitHubPrToRepo;
}

/**
 * The configuration of the stepper.
 *
 * @public
 */
declare type ImportFlows = 'unknown' | 'single-location' | 'multiple-locations' | 'no-location';
/**
 * Result of the prepare state.
 *
 * @public
 */
declare type PrepareResult = {
    type: 'locations';
    locations: Array<{
        exists?: boolean;
        target: string;
        entities: CompoundEntityRef[];
    }>;
} | {
    type: 'repository';
    url: string;
    integrationType: string;
    pullRequest: {
        url: string;
    };
    locations: Array<{
        target: string;
        entities: CompoundEntityRef[];
    }>;
};
declare type ReviewResult = {
    type: 'locations';
    locations: Array<{
        target: string;
        entities: Entity[];
    }>;
    refreshed: Array<{
        target: string;
    }>;
} | {
    type: 'repository';
    url: string;
    integrationType: string;
    pullRequest: {
        url: string;
    };
    locations: Array<{
        target: string;
        entities: Entity[];
    }>;
};
declare type onAnalysisFn = (flow: ImportFlows, url: string, result: AnalyzeResult, opts?: {
    prepareResult?: PrepareResult;
}) => void;
declare type onPrepareFn = (result: PrepareResult, opts?: {
    notRepeatable?: boolean;
}) => void;
declare type onReviewFn = (result: ReviewResult) => void;
declare type State = {
    activeState: 'analyze';
    onAnalysis: onAnalysisFn;
} | {
    activeState: 'prepare';
    analyzeResult: AnalyzeResult;
    prepareResult?: PrepareResult;
    onPrepare: onPrepareFn;
} | {
    activeState: 'review';
    analyzeResult: AnalyzeResult;
    prepareResult: PrepareResult;
    onReview: onReviewFn;
} | {
    activeState: 'finish';
    analyzeResult: AnalyzeResult;
    prepareResult: PrepareResult;
    reviewResult: ReviewResult;
};
declare type ImportState = State & {
    activeFlow: ImportFlows;
    activeStepNumber: number;
    analysisUrl?: string;
    onGoBack?: () => void;
    onReset: () => void;
};

declare type StepperApis = {
    catalogImportApi: CatalogImportApi;
};

declare type StepConfiguration = {
    stepLabel: React.ReactElement;
    content: React.ReactElement;
};
/**
 * Defines the details of the stepper.
 *
 * @public
 */
interface StepperProvider {
    analyze: (s: Extract<ImportState, {
        activeState: 'analyze';
    }>, opts: {
        apis: StepperApis;
    }) => StepConfiguration;
    prepare: (s: Extract<ImportState, {
        activeState: 'prepare';
    }>, opts: {
        apis: StepperApis;
    }) => StepConfiguration;
    review: (s: Extract<ImportState, {
        activeState: 'review';
    }>, opts: {
        apis: StepperApis;
    }) => StepConfiguration;
    finish: (s: Extract<ImportState, {
        activeState: 'finish';
    }>, opts: {
        apis: StepperApis;
    }) => StepConfiguration;
}
/**
 * The default stepper generation function.
 *
 * Override this function to customize the import flow. Each flow should at
 * least override the prepare operation.
 *
 * @param flow - the name of the active flow
 * @param defaults - the default steps
 * @public
 */
declare function defaultGenerateStepper(flow: ImportFlows, defaults: StepperProvider): StepperProvider;

/**
 * Props for {@link ImportStepper}.
 *
 * @public
 */
interface ImportStepperProps {
    initialUrl?: string;
    generateStepper?: (flow: ImportFlows, defaults: StepperProvider) => StepperProvider;
    variant?: InfoCardVariants;
}
/**
 * The stepper that holds the different import stages.
 *
 * @public
 */
declare const ImportStepper: (props: ImportStepperProps) => JSX.Element;

/**
 * Props for {@link StepInitAnalyzeUrl}.
 *
 * @public
 */
interface StepInitAnalyzeUrlProps {
    onAnalysis: (flow: ImportFlows, url: string, result: AnalyzeResult, opts?: {
        prepareResult?: PrepareResult;
    }) => void;
    disablePullRequest?: boolean;
    analysisUrl?: string;
    exampleLocationUrl?: string;
}
/**
 * A form that lets the user input a url and analyze it for existing locations or potential entities.
 *
 * @param onAnalysis - is called when the analysis was successful
 * @param analysisUrl - a url that can be used as a default value
 * @param disablePullRequest - if true, repositories without entities will abort the wizard
 * @public
 */
declare const StepInitAnalyzeUrl: (props: StepInitAnalyzeUrlProps) => JSX.Element;

/**
 * Props for {@link AutocompleteTextField}.
 *
 * @public
 */
interface AutocompleteTextFieldProps<TFieldValue extends string> {
    name: TFieldValue;
    options: string[];
    required?: boolean;
    errors?: FieldErrors;
    rules?: React.ComponentProps<typeof Controller>['rules'];
    loading?: boolean;
    loadingText?: string;
    helperText?: React.ReactNode;
    errorHelperText?: string;
    textFieldProps?: Omit<TextFieldProps, 'required' | 'fullWidth'>;
}
/**
 * An autocompletion text field for the catalog import flows.
 *
 * @public
 */
declare const AutocompleteTextField: <TFieldValue extends string>(props: AutocompleteTextFieldProps<TFieldValue>) => JSX.Element;

/**
 * Props for {@link PreparePullRequestForm}.
 *
 * @public
 */
declare type PreparePullRequestFormProps<TFieldValues extends Record<string, any>> = Pick<UseFormProps<TFieldValues>, 'defaultValues'> & {
    onSubmit: SubmitHandler<TFieldValues>;
    render: (props: Pick<UseFormReturn<TFieldValues>, 'formState' | 'register' | 'control' | 'setValue'> & {
        values: UnpackNestedValue<TFieldValues>;
    }) => React.ReactNode;
};
/**
 * A form wrapper that creates a form that is used to prepare a pull request. It
 * hosts the form logic.
 *
 * @param defaultValues - the default values of the form
 * @param onSubmit - a callback that is executed when the form is submitted
 *   (initiated by a button of type="submit")
 * @param render - render the form elements
 * @public
 */
declare const PreparePullRequestForm: <TFieldValues extends Record<string, any>>(props: PreparePullRequestFormProps<TFieldValues>) => JSX.Element;

/**
 * Props for {@link PreviewCatalogInfoComponent}.
 *
 * @public
 */
interface PreviewCatalogInfoComponentProps {
    repositoryUrl: string;
    entities: Entity[];
    classes?: {
        card?: string;
        cardContent?: string;
    };
}
/**
 * Previews information about an entity to create.
 *
 * @public
 */
declare const PreviewCatalogInfoComponent: (props: PreviewCatalogInfoComponentProps) => JSX.Element;

/**
 * Props for {@link PreviewPullRequestComponent}.
 *
 * @public
 */
interface PreviewPullRequestComponentProps {
    title: string;
    description: string;
    classes?: {
        card?: string;
        cardContent?: string;
    };
}
/**
 * Previews a pull request.
 *
 * @public
 */
declare const PreviewPullRequestComponent: (props: PreviewPullRequestComponentProps) => JSX.Element;

declare type FormData = {
    title: string;
    body: string;
    componentName: string;
    owner: string;
    useCodeowners: boolean;
};
/**
 * Props for {@link StepPrepareCreatePullRequest}.
 *
 * @public
 */
interface StepPrepareCreatePullRequestProps {
    analyzeResult: Extract<AnalyzeResult, {
        type: 'repository';
    }>;
    onPrepare: (result: PrepareResult, opts?: {
        notRepeatable?: boolean;
    }) => void;
    onGoBack?: () => void;
    renderFormFields: (props: Pick<UseFormReturn<FormData>, 'register' | 'setValue' | 'formState'> & {
        values: UnpackNestedValue<FormData>;
        groups: string[];
        groupsLoading: boolean;
    }) => React.ReactNode;
}
/**
 * Prepares a pull request.
 *
 * @public
 */
declare const StepPrepareCreatePullRequest: (props: StepPrepareCreatePullRequestProps) => JSX.Element;

export { AnalyzeResult, AutocompleteTextField, AutocompleteTextFieldProps, CatalogImportApi, CatalogImportClient, CatalogImportPage, DefaultImportPage, EntityListComponent, EntityListComponentProps, ImportFlows, ImportInfoCard, ImportInfoCardProps, ImportState, ImportStepper, ImportStepperProps, PreparePullRequestForm, PreparePullRequestFormProps, PrepareResult, PreviewCatalogInfoComponent, PreviewCatalogInfoComponentProps, PreviewPullRequestComponent, PreviewPullRequestComponentProps, StepInitAnalyzeUrl, StepInitAnalyzeUrlProps, StepPrepareCreatePullRequest, StepPrepareCreatePullRequestProps, catalogImportApiRef, catalogImportPlugin, defaultGenerateStepper, catalogImportPlugin as plugin };
