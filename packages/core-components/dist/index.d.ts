/// <reference types="react" />
import * as React from 'react';
import React__default, { CSSProperties, ElementType, ReactNode, PropsWithChildren, ComponentClass, ErrorInfo, ComponentProps, ReactElement } from 'react';
import { ButtonProps as ButtonProps$1 } from '@material-ui/core/Button';
import { LinkProps as LinkProps$1 } from '@material-ui/core/Link';
import { LinkProps as LinkProps$2, NavLinkProps } from 'react-router-dom';
import CSS from 'csstype';
import { Options } from 'react-markdown';
import { TooltipProps } from '@material-ui/core/Tooltip';
import { TextTruncateProps } from 'react-text-truncate';
import { LinearProgressProps } from '@material-ui/core/LinearProgress';
import { CardHeaderProps } from '@material-ui/core/CardHeader';
import { BackstagePalette, BackstageTheme } from '@backstage/theme';
import { TabProps as TabProps$1 } from '@material-ui/core/Tab';
import { Column, MaterialTableProps } from '@material-table/core';
import { SparklinesProps, SparklinesLineProps } from 'react-sparklines';
import { IconComponent, SignInPageProps, ApiRef, ProfileInfoApi, BackstageIdentityApi, SessionApi, IdentityApi, ProfileInfo, BackstageUserIdentity } from '@backstage/core-plugin-api';
import * as _material_ui_styles from '@material-ui/styles';
import { WithStyles, Theme } from '@material-ui/core/styles';
import { BottomNavigationActionProps } from '@material-ui/core/BottomNavigationAction';
import { StyledComponentProps, StyleRules } from '@material-ui/core/styles/withStyles';
import MaterialBreadcrumbs from '@material-ui/core/Breadcrumbs';
import { Overrides } from '@material-ui/core/styles/overrides';

/**
 * Displays alerts from {@link @backstage/core-plugin-api#AlertApi}
 *
 * @public
 * @remarks
 *
 * Shown as SnackBar at the center top of the page by default. Configurable with props.
 */
declare type AlertDisplayProps = {
    anchorOrigin?: {
        vertical: 'top' | 'bottom';
        horizontal: 'left' | 'center' | 'right';
    };
};
/** @public */
declare function AlertDisplay(props: AlertDisplayProps): JSX.Element | null;

/** @public */
declare type AvatarClassKey = 'avatar';
/**
 * Properties for {@link Avatar}.
 *
 * @public
 */
interface AvatarProps {
    /**
     * A display name, which will be used to generate initials as a fallback in case a picture is not provided.
     */
    displayName?: string;
    /**
     * URL to avatar image source
     */
    picture?: string;
    /**
     * Custom styles applied to avatar
     */
    customStyles?: CSSProperties;
}
/**
 *  Component rendering an Avatar
 *
 * @public
 * @remarks
 *
 * Based on https://v4.mui.com/components/avatars/#avatar with some styling adjustment and two-letter initials
 */
declare function Avatar(props: AvatarProps): JSX.Element;

declare type LinkProps = LinkProps$1 & LinkProps$2 & {
    component?: ElementType<any>;
    noTrack?: boolean;
};
/**
 * Thin wrapper on top of material-ui's Link component, which...
 * - Makes the Link use react-router
 * - Captures Link clicks as analytics events.
 */
declare const Link: (props: LinkProps) => JSX.Element;

/**
 * Properties for {@link Button}
 *
 * @public
 * @remarks
 *
 * See {@link https://v4.mui.com/api/button/#props | Material-UI Button Props} for all properties
 */
declare type ButtonProps = ButtonProps$1 & Omit<LinkProps, 'variant' | 'color'>;
/**
 * Thin wrapper on top of material-ui's {@link https://v4.mui.com/components/buttons/ | Button} component
 *
 * @public
 * @remarks
 *
 * Makes the Button to utilise react-router
 */
declare const Button: (props: ButtonProps) => JSX.Element;

/**
 * Properties for {@link CodeSnippet}
 *
 * @public
 */
interface CodeSnippetProps {
    /**
     * Code Snippet text
     */
    text: string;
    /**
     * Language used by {@link CodeSnippetProps.text}
     */
    language: string;
    /**
     * Whether to show line number
     *
     * @remarks
     *
     * Default: false
     */
    showLineNumbers?: boolean;
    /**
     * Whether to show button to copy code snippet
     *
     * @remarks
     *
     * Default: false
     */
    showCopyCodeButton?: boolean;
    /**
     * Array of line numbers to highlight
     */
    highlightedNumbers?: number[];
    /**
     * Custom styles applied to code
     *
     * @remarks
     *
     * Passed to {@link https://react-syntax-highlighter.github.io/react-syntax-highlighter/ | react-syntax-highlighter}
     */
    customStyle?: any;
}
/**
 * Thin wrapper on top of {@link https://react-syntax-highlighter.github.io/react-syntax-highlighter/ | react-syntax-highlighter}
 * providing consistent theming and copy code button
 *
 * @public
 */
declare function CodeSnippet(props: CodeSnippetProps): JSX.Element;

/**
 * Properties for {@link CopyTextButton}
 *
 * @public
 */
interface CopyTextButtonProps {
    /**
     * The text to be copied
     */
    text: string;
    /**
     * Number of milliseconds that the tooltip is shown
     *
     * @remarks
     *
     * Default: 1000
     */
    tooltipDelay?: number;
    /**
     * Text to show in the tooltip when user has clicked the button
     *
     * @remarks
     *
     * Default: "Text copied to clipboard"
     */
    tooltipText?: string;
}
/**
 * Copy text button with visual feedback
 *
 * @public
 * @remarks
 *
 * Visual feedback takes form of:
 *  - a hover color
 *  - click ripple
 *  - Tooltip shown when user has clicked
 *
 * @example
 *
 * `<CopyTextButton text="My text that I want to be copied to the clipboard" />`
 */
declare function CopyTextButton(props: CopyTextButtonProps): JSX.Element;

/**
 * Properties for {@link CreateButton}
 *
 * @public
 */
declare type CreateButtonProps = {
    title: string;
} & Partial<Pick<LinkProps$2, 'to'>>;
/**
 * Responsive Button giving consistent UX for creation of different things
 *
 * @public
 */
declare function CreateButton(props: CreateButtonProps): JSX.Element | null;

/**
 * Types used to customize and provide data to {@link DependencyGraph}
 *
 * @packageDocumentation
 */

/**
 * Edge of {@link DependencyGraph}
 *
 * @public
 */
declare type DependencyEdge<T = {}> = T & {
    /**
     * ID of {@link DependencyNode} from where the Edge start
     */
    from: string;
    /**
     * ID of {@link DependencyNode} to where the Edge goes to
     */
    to: string;
    /**
     * Label assigned and rendered with the Edge
     */
    label?: string;
};
/**
 * Properties of {@link DependencyGraphTypes.RenderLabelFunction} for {@link DependencyGraphTypes.DependencyEdge}
 */
declare type RenderLabelProps<T = unknown> = {
    edge: DependencyEdge<T>;
};
/**
 * Custom React component for edge labels
 */
declare type RenderLabelFunction<T = {}> = (props: RenderLabelProps<T>) => React__default.ReactNode;
/**
 * Node of {@link DependencyGraph}
 *
 * @public
 */
declare type DependencyNode<T = {}> = T & {
    id: string;
};
/**
 * Properties of {@link DependencyGraphTypes.RenderNodeFunction} for {@link DependencyGraphTypes.DependencyNode}
 */
declare type RenderNodeProps<T = unknown> = {
    node: DependencyNode<T>;
};
/**
 * Custom React component for graph {@link DependencyGraphTypes.DependencyNode}
 */
declare type RenderNodeFunction<T = {}> = (props: RenderNodeProps<T>) => React__default.ReactNode;
/**
 * Graph direction
 *
 * @public
 */
declare enum Direction {
    /**
     * Top to Bottom
     */
    TOP_BOTTOM = "TB",
    /**
     * Bottom to Top
     */
    BOTTOM_TOP = "BT",
    /**
     * Left to Right
     */
    LEFT_RIGHT = "LR",
    /**
     * Right to Left
     */
    RIGHT_LEFT = "RL"
}
/**
 * Node alignment
 *
 * @public
 */
declare enum Alignment {
    /**
     * Up Left
     */
    UP_LEFT = "UL",
    /**
     * Up Right
     */
    UP_RIGHT = "UR",
    /**
     * Down Left
     */
    DOWN_LEFT = "DL",
    /**
     * Down Right
     */
    DOWN_RIGHT = "DR"
}
/**
 * Algorithm used to rand nodes in graph
 */
declare enum Ranker {
    /**
     * {@link https://en.wikipedia.org/wiki/Network_simplex_algorithm | Network Simplex} algorithm
     */
    NETWORK_SIMPLEX = "network-simplex",
    /**
     * Tight Tree algorithm
     */
    TIGHT_TREE = "tight-tree",
    /**
     * Longest path algorithm
     *
     * @remarks
     *
     * Simplest and fastest
     */
    LONGEST_PATH = "longest-path"
}
/**
 * Position of label in relation to the edge
 *
 * @public
 */
declare enum LabelPosition {
    LEFT = "l",
    RIGHT = "r",
    CENTER = "c"
}

type types_d_DependencyEdge<T = {}> = DependencyEdge<T>;
type types_d_RenderLabelProps<T = unknown> = RenderLabelProps<T>;
type types_d_RenderLabelFunction<T = {}> = RenderLabelFunction<T>;
type types_d_DependencyNode<T = {}> = DependencyNode<T>;
type types_d_RenderNodeProps<T = unknown> = RenderNodeProps<T>;
type types_d_RenderNodeFunction<T = {}> = RenderNodeFunction<T>;
type types_d_Direction = Direction;
declare const types_d_Direction: typeof Direction;
type types_d_Alignment = Alignment;
declare const types_d_Alignment: typeof Alignment;
type types_d_Ranker = Ranker;
declare const types_d_Ranker: typeof Ranker;
type types_d_LabelPosition = LabelPosition;
declare const types_d_LabelPosition: typeof LabelPosition;
declare namespace types_d {
  export {
    types_d_DependencyEdge as DependencyEdge,
    types_d_RenderLabelProps as RenderLabelProps,
    types_d_RenderLabelFunction as RenderLabelFunction,
    types_d_DependencyNode as DependencyNode,
    types_d_RenderNodeProps as RenderNodeProps,
    types_d_RenderNodeFunction as RenderNodeFunction,
    types_d_Direction as Direction,
    types_d_Alignment as Alignment,
    types_d_Ranker as Ranker,
    types_d_LabelPosition as LabelPosition,
  };
}

/**
 * Properties of {@link DependencyGraph}
 *
 * @public
 * @remarks
 * <NodeData> and <EdgeData> are useful when rendering custom or edge labels
 */
interface DependencyGraphProps<NodeData, EdgeData> extends React__default.SVGProps<SVGSVGElement> {
    /**
     * Edges of graph
     */
    edges: DependencyEdge<EdgeData>[];
    /**
     * Nodes of Graph
     */
    nodes: DependencyNode<NodeData>[];
    /**
     * Graph {@link DependencyGraphTypes.Direction | direction}
     *
     * @remarks
     *
     * Default: `DependencyGraphTypes.Direction.TOP_BOTTOM`
     */
    direction?: Direction;
    /**
     * Node {@link DependencyGraphTypes.Alignment | alignment}
     */
    align?: Alignment;
    /**
     * Margin between nodes on each rank
     *
     * @remarks
     *
     * Default: 50
     */
    nodeMargin?: number;
    /**
     * Margin between edges
     *
     * @remarks
     *
     * Default: 10
     */
    edgeMargin?: number;
    /**
     * Margin between each rank
     *
     * @remarks
     *
     * Default: 50
     */
    rankMargin?: number;
    /**
     * Margin on left and right of whole graph
     *
     * @remarks
     *
     * Default: 0
     */
    paddingX?: number;
    /**
     * Margin on top and bottom of whole graph
     *
     * @remarks
     *
     * Default: 0
     */
    paddingY?: number;
    /**
     * Heuristic used to find set of edges that will make graph acyclic
     */
    acyclicer?: 'greedy';
    /**
     * {@link DependencyGraphTypes.Ranker | Algorithm} used to rank nodes
     *
     * @remarks
     *
     * Default: `DependencyGraphTypes.Ranker.NETWORK_SIMPLEX`
     */
    ranker?: Ranker;
    /**
     * {@link DependencyGraphTypes.LabelPosition | Position} of label in relation to edge
     *
     * @remarks
     *
     * Default: `DependencyGraphTypes.LabelPosition.RIGHT`
     */
    labelPosition?: LabelPosition;
    /**
     * How much to move label away from edge
     *
     * @remarks
     *
     * Applies only when {@link DependencyGraphProps.labelPosition} is `DependencyGraphTypes.LabelPosition.LEFT` or
     * `DependencyGraphTypes.LabelPosition.RIGHT`
     */
    labelOffset?: number;
    /**
     * Minimum number of ranks to keep between connected nodes
     */
    edgeRanks?: number;
    /**
     * Weight applied to edges in graph
     */
    edgeWeight?: number;
    /**
     * Custom node rendering component
     */
    renderNode?: RenderNodeFunction<NodeData>;
    /**
     * Custom label rendering component
     */
    renderLabel?: RenderLabelFunction<EdgeData>;
    /**
     * {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Element/defs | Defs} shared by rendered SVG to be used by
     * {@link DependencyGraphProps.renderNode} and/or {@link DependencyGraphProps.renderLabel}
     */
    defs?: SVGDefsElement | SVGDefsElement[];
    /**
     * Controls zoom behavior of graph
     *
     * @remarks
     *
     * Default: `enabled`
     */
    zoom?: 'enabled' | 'disabled' | 'enable-on-click';
}
/**
 * Graph component used to visualize relations between entities
 *
 * @public
 */
declare function DependencyGraph<NodeData, EdgeData>(props: DependencyGraphProps<NodeData, EdgeData>): JSX.Element;

/** @public */
declare type DependencyGraphDefaultLabelClassKey = 'text';

/** @public */
declare type DependencyGraphDefaultNodeClassKey = 'node' | 'text';

/** @public */
declare type DependencyGraphEdgeClassKey = 'path' | 'label';

/** @public */
declare type DependencyGraphNodeClassKey = 'node';

/** @public */
declare type DismissableBannerClassKey = 'root' | 'topPosition' | 'icon' | 'content' | 'message' | 'info' | 'error';
/**
 * @public
 * @deprecated This type contained a typo, please use DismissableBannerClassKey instead
 */
declare type DismissbleBannerClassKey = DismissableBannerClassKey;
declare type Props$i = {
    variant: 'info' | 'error' | 'warning';
    message: ReactNode;
    id: string;
    fixed?: boolean;
};
/** @public */
declare const DismissableBanner: (props: Props$i) => JSX.Element;

/** @public */
declare type EmptyStateClassKey = 'root' | 'action' | 'imageContainer';
declare type Props$h = {
    title: string;
    description?: string | JSX.Element;
    missing: 'field' | 'info' | 'content' | 'data';
    action?: JSX.Element;
};
/**
 * Various placeholder views for empty state pages
 *
 * @public
 *
 */
declare function EmptyState(props: Props$h): JSX.Element;

/** @public */
declare type EmptyStateImageClassKey = 'generalImg';

declare type Props$g = {
    annotation: string;
    readMoreUrl?: string;
};
declare type MissingAnnotationEmptyStateClassKey = 'code';
declare function MissingAnnotationEmptyState(props: Props$g): JSX.Element;

/** @public */
declare type ErrorPanelClassKey = 'text' | 'divider';
/** @public */
declare type ErrorPanelProps = {
    error: Error;
    defaultExpanded?: boolean;
    title?: string;
};
/**
 * Renders a warning panel as the effect of an error.
 *
 * @public
 */
declare function ErrorPanel(props: PropsWithChildren<ErrorPanelProps>): JSX.Element;

declare type ResponseErrorPanelClassKey = 'text' | 'divider';
/**
 * Renders a warning panel as the effect of a failed server request.
 *
 * Has special treatment for ResponseError errors, to display rich
 * server-provided information about what happened.
 */
declare function ResponseErrorPanel(props: ErrorPanelProps): JSX.Element;

/** @public */
declare type FeatureCalloutCircleClassKey = '@keyframes pulsateSlightly' | '@keyframes pulsateAndFade' | 'featureWrapper' | 'backdrop' | 'dot' | 'pulseCircle' | 'text';
declare type Props$f = {
    featureId: string;
    title: string;
    description: string;
};
/**
 * One-time, round 'telescope' animation showing new feature.
 *
 * @public
 *
 */
declare function FeatureCalloutCircular(props: PropsWithChildren<Props$f>): JSX.Element;

declare type IconLinkVerticalProps = {
    color?: 'primary' | 'secondary';
    disabled?: boolean;
    href?: string;
    icon?: React__default.ReactNode;
    label: string;
    onClick?: React__default.MouseEventHandler<HTMLAnchorElement>;
    title?: string;
};
/** @public */
declare type IconLinkVerticalClassKey = 'link' | 'disabled' | 'primary' | 'secondary' | 'label';

/** @public */
declare type HeaderIconLinkRowClassKey = 'links';
declare type Props$e = {
    links: IconLinkVerticalProps[];
};
/**
 * HTML nav tag with links mapped inside
 *
 * @public
 *
 */
declare function HeaderIconLinkRow(props: Props$e): JSX.Element;

declare type Props$d = {
    scrollStep?: number;
    scrollSpeed?: number;
    minScrollDistance?: number;
};
/** @public */
declare type HorizontalScrollGridClassKey = 'root' | 'container' | 'fade' | 'fadeLeft' | 'fadeRight' | 'fadeHidden' | 'button' | 'buttonLeft' | 'buttonRight';
/**
 * Horizontal scrollable component with arrows to navigate
 *
 * @public
 *
 */
declare function HorizontalScrollGrid(props: PropsWithChildren<Props$d>): JSX.Element;

declare type Props$c = CSS.Properties & {
    shorthand?: boolean;
    alpha?: boolean;
};
declare type LifecycleClassKey = 'alpha' | 'beta';
declare function Lifecycle(props: Props$c): JSX.Element;

/**
 * The properties for the LogViewer component.
 *
 * @public
 */
interface LogViewerProps {
    /**
     * The text of the logs to display.
     *
     * The LogViewer component is optimized for appending content at the end of the text.
     */
    text: string;
    /**
     * Styling overrides for classes within the LogViewer component.
     */
    classes?: {
        root?: string;
    };
}
/**
 * A component that displays logs in a scrollable text area.
 *
 * The LogViewer has support for search and filtering, as well as displaying
 * text content with ANSI color escape codes.
 *
 * Since the LogViewer uses windowing to avoid rendering all contents at once, the
 * log is sized automatically to fill the available vertical space. This means
 * it may often be needed to wrap the LogViewer in a container that provides it
 * with a fixed amount of space.
 *
 * @public
 */
declare function LogViewer(props: LogViewerProps): JSX.Element;

/** @public Class keys for overriding LogViewer styles */
declare type LogViewerClassKey = 'root' | 'header' | 'log' | 'line' | 'lineSelected' | 'lineCopyButton' | 'lineNumber' | 'textHighlight' | 'textSelectedHighlight' | 'modifierBold' | 'modifierItalic' | 'modifierUnderline' | 'modifierForegroundBlack' | 'modifierForegroundRed' | 'modifierForegroundGreen' | 'modifierForegroundYellow' | 'modifierForegroundBlue' | 'modifierForegroundMagenta' | 'modifierForegroundCyan' | 'modifierForegroundWhite' | 'modifierForegroundGrey' | 'modifierBackgroundBlack' | 'modifierBackgroundRed' | 'modifierBackgroundGreen' | 'modifierBackgroundYellow' | 'modifierBackgroundBlue' | 'modifierBackgroundMagenta' | 'modifierBackgroundCyan' | 'modifierBackgroundWhite' | 'modifierBackgroundGrey';

declare type MarkdownContentClassKey = 'markdown';
declare type Props$b = {
    content: string;
    dialect?: 'gfm' | 'common-mark';
    linkTarget?: Options['linkTarget'];
};
/**
 * MarkdownContent
 * --
 * Renders markdown with the default dialect [gfm - GitHub flavored Markdown](https://github.github.com/gfm/) to backstage theme styled HTML.
 * If you just want to render to plain [CommonMark](https://commonmark.org/), set the dialect to `'common-mark'`
 */
declare function MarkdownContent(props: Props$b): JSX.Element;

declare type OAuthRequestDialogClassKey = 'dialog' | 'title' | 'contentList' | 'actionButtons';
declare function OAuthRequestDialog(_props: {}): JSX.Element;

declare type LoginRequestListItemClassKey = 'root';

declare type Props$a = {
    text: TextTruncateProps['text'];
    line?: TextTruncateProps['line'];
    element?: TextTruncateProps['element'];
    title?: TooltipProps['title'];
    placement?: TooltipProps['placement'];
};
declare type OverflowTooltipClassKey = 'container';
declare function OverflowTooltip(props: Props$a): JSX.Element;

declare function Progress(props: PropsWithChildren<LinearProgressProps>): JSX.Element;

/** @public */
declare type BottomLinkClassKey = 'root' | 'boxTitle' | 'arrow';
/** @public */
declare type BottomLinkProps = {
    link: string;
    title: string;
    onClick?: (event: React__default.MouseEvent<HTMLAnchorElement>) => void;
};
/**
 * Footer with link used in  {@link InfoCard } and {@link TabbedCard}
 *
 * @public
 *
 */
declare function BottomLink(props: BottomLinkProps): JSX.Element;

declare type SlackChannel = {
    name: string;
    href?: string;
};
/** @public */
declare type ErrorBoundaryProps = {
    slackChannel?: string | SlackChannel;
    onError?: (error: Error, errorInfo: string) => null;
};
declare type State = {
    error?: Error;
    errorInfo?: ErrorInfo;
};
/** @public */
declare const ErrorBoundary: ComponentClass<ErrorBoundaryProps, State>;

/** @public */
declare type InfoCardClassKey = 'noPadding' | 'header' | 'headerTitle' | 'headerSubheader' | 'headerAvatar' | 'headerAction' | 'headerContent';
/** @public */
declare type CardActionsTopRightClassKey = 'root';
/** @public */
declare type InfoCardVariants = 'flex' | 'fullHeight' | 'gridItem';
/**
 * InfoCard is used to display a paper-styled block on the screen, similar to a panel.
 *
 * You can custom style an InfoCard with the 'className' (outer container) and 'cardClassName' (inner container)
 * props. This is typically used with the material-ui makeStyles mechanism.
 *
 * The InfoCard serves as an error boundary. As a result, if you provide an 'errorBoundaryProps' property this
 * specifies the extra information to display in the error component that is displayed if an error occurs
 * in any descendent components.
 *
 * By default the InfoCard has no custom layout of its children, but is treated as a block element. A
 * couple common variants are provided and can be specified via the variant property:
 *
 * When the InfoCard is displayed as a grid item within a grid, you may want items to have the same height for all items.
 * Set to the 'gridItem' variant to display the InfoCard with full height suitable for Grid:
 *
 * `<InfoCard variant="gridItem">...</InfoCard>`
 */
declare type Props$9 = {
    title?: ReactNode;
    subheader?: ReactNode;
    divider?: boolean;
    deepLink?: BottomLinkProps;
    /** @deprecated Use errorBoundaryProps instead */
    slackChannel?: string;
    errorBoundaryProps?: ErrorBoundaryProps;
    variant?: InfoCardVariants;
    children?: ReactNode;
    headerStyle?: object;
    headerProps?: CardHeaderProps;
    icon?: ReactNode;
    action?: ReactNode;
    actionsClassName?: string;
    actions?: ReactNode;
    cardClassName?: string;
    actionsTopRight?: ReactNode;
    className?: string;
    noPadding?: boolean;
    titleTypographyProps?: object;
};
/**
 * Material-ui card with header , content and actions footer
 *
 * @public
 *
 */
declare function InfoCard(props: Props$9): JSX.Element;

/** @public */
declare type GaugeClassKey = 'root' | 'overlay' | 'description' | 'circle' | 'colorUnknown';
/** @public */
declare type GaugeProps = {
    value: number;
    fractional?: boolean;
    inverse?: boolean;
    unit?: string;
    max?: number;
    description?: ReactNode;
    getColor?: GaugePropsGetColor;
};
/** @public */
declare type GaugePropsGetColorOptions = {
    palette: BackstagePalette;
    value: number;
    inverse?: boolean;
    max?: number;
};
/** @public */
declare type GaugePropsGetColor = (args: GaugePropsGetColorOptions) => string;
/**
 * Circular Progress Bar
 *
 * @public
 *
 */
declare function Gauge(props: GaugeProps): JSX.Element;

declare type Props$8 = {
    title: string;
    subheader?: string;
    variant?: InfoCardVariants;
    /** Progress in % specified as decimal, e.g. "0.23" */
    progress: number;
    description?: ReactNode;
    icon?: ReactNode;
    inverse?: boolean;
    deepLink?: BottomLinkProps;
    getColor?: GaugePropsGetColor;
};
/** @public */
declare type GaugeCardClassKey = 'root';
/**
 * {@link Gauge} with header, subheader and footer
 *
 * @public
 *
 */
declare function GaugeCard(props: Props$8): JSX.Element;

declare type Props$7 = {
    /**
     * Progress value between 0.0 - 1.0.
     */
    value: number;
    getColor?: GaugePropsGetColor;
};
declare function LinearGauge(props: Props$7): JSX.Element | null;

/** @public */
declare type SelectInputBaseClassKey = 'root' | 'input';
/** @public */
declare type SelectClassKey = 'formControl' | 'label' | 'chips' | 'chip' | 'checkbox' | 'root';
/** @public */
declare type SelectItem = {
    label: string;
    value: string | number;
};
/** @public */
declare type SelectedItems = string | string[] | number | number[];
declare type SelectProps = {
    multiple?: boolean;
    items: SelectItem[];
    label: string;
    placeholder?: string;
    selected?: SelectedItems;
    onChange: (arg: SelectedItems) => void;
    triggerReset?: boolean;
    native?: boolean;
    disabled?: boolean;
};
/** @public */
declare function SelectComponent(props: SelectProps): JSX.Element;

/** @public */
declare type ClosedDropdownClassKey = 'icon';

declare type OpenedDropdownClassKey = 'icon';

interface StepperProps {
    elevated?: boolean;
    onStepChange?: (prevIndex: number, nextIndex: number) => void;
    activeStep?: number;
}
declare function SimpleStepper(props: PropsWithChildren<StepperProps>): JSX.Element;

declare type StepActions = {
    showNext?: boolean;
    canNext?: () => boolean;
    onNext?: () => void;
    nextStep?: (current: number, last: number) => number;
    nextText?: string;
    showBack?: boolean;
    backText?: string;
    onBack?: () => void;
    showRestart?: boolean;
    canRestart?: () => boolean;
    onRestart?: () => void;
    restartText?: string;
};
declare type StepProps = {
    title: string;
    children: React__default.ReactElement;
    end?: boolean;
    actions?: StepActions;
};

declare type SimpleStepperFooterClassKey = 'root';

declare type SimpleStepperStepClassKey = 'end';
declare function SimpleStepperStep(props: PropsWithChildren<StepProps>): JSX.Element;

declare type StatusClassKey = 'status' | 'ok' | 'warning' | 'error' | 'pending' | 'running' | 'aborted';
declare function StatusOK(props: PropsWithChildren<{}>): JSX.Element;
declare function StatusWarning(props: PropsWithChildren<{}>): JSX.Element;
declare function StatusError(props: PropsWithChildren<{}>): JSX.Element;
declare function StatusPending(props: PropsWithChildren<{}>): JSX.Element;
declare function StatusRunning(props: PropsWithChildren<{}>): JSX.Element;
declare function StatusAborted(props: PropsWithChildren<{}>): JSX.Element;

declare type MetadataTableTitleCellClassKey = 'root';
declare type MetadataTableCellClassKey = 'root';
declare type MetadataTableListClassKey = 'root';
declare type MetadataTableListItemClassKey = 'root' | 'random';

declare type StructuredMetadataTableListClassKey = 'root';
declare type StructuredMetadataTableNestedListClassKey = 'root';
declare type Props$6 = {
    metadata: {
        [key: string]: any;
    };
    dense?: boolean;
    options?: any;
};
declare function StructuredMetadataTable(props: Props$6): JSX.Element;

declare type SupportButtonProps = {
    title?: string;
    children?: React__default.ReactNode;
};
declare type SupportButtonClassKey = 'popoverList';
declare function SupportButton(props: SupportButtonProps): JSX.Element;

declare type SubRoute$1 = {
    path: string;
    title: string;
    children: JSX.Element;
    tabProps?: TabProps$1<React__default.ElementType, {
        component?: React__default.ElementType;
    }>;
};
/**
 * TabbedLayout is a compound component, which allows you to define a layout for
 * pages using a sub-navigation mechanism.
 *
 * Consists of two parts: TabbedLayout and TabbedLayout.Route
 *
 * @example
 * ```jsx
 * <TabbedLayout>
 *   <TabbedLayout.Route path="/example" title="Example tab">
 *     <div>This is rendered under /example/anything-here route</div>
 *   </TabbedLayout.Route>
 * </TabbedLayout>
 * ```
 */
declare function TabbedLayout(props: PropsWithChildren<{}>): JSX.Element;
declare namespace TabbedLayout {
    var Route: (props: SubRoute$1) => null;
}

declare type SubRoute = {
    path: string;
    title: string;
    children: JSX.Element;
    tabProps?: TabProps$1<React.ElementType, {
        component?: React.ElementType;
    }>;
};

declare function RoutedTabs(props: {
    routes: SubRoute[];
}): JSX.Element;

declare type TableFiltersClassKey = 'root' | 'value' | 'heder' | 'filters';
declare type SelectedFilters = {
    [key: string]: string | string[];
};

declare type SubvalueCellClassKey = 'value' | 'subvalue';
declare type SubvalueCellProps = {
    value: React__default.ReactNode;
    subvalue: React__default.ReactNode;
};
declare function SubvalueCell(props: SubvalueCellProps): JSX.Element;

declare type TableHeaderClassKey = 'header';
declare type TableToolbarClassKey = 'root' | 'title' | 'searchField';
/** @public */
declare type FiltersContainerClassKey = 'root' | 'title';
declare type TableClassKey = 'root';
interface TableColumn<T extends object = {}> extends Column<T> {
    highlight?: boolean;
    width?: string;
}
declare type TableFilter = {
    column: string;
    type: 'select' | 'multiple-select';
};
declare type TableState = {
    search?: string;
    filtersOpen?: boolean;
    filters?: SelectedFilters;
};
interface TableProps<T extends object = {}> extends MaterialTableProps<T> {
    columns: TableColumn<T>[];
    subtitle?: string;
    filters?: TableFilter[];
    initialState?: TableState;
    emptyContent?: ReactNode;
    onStateChange?: (state: TableState) => any;
}
declare function Table<T extends object = {}>(props: TableProps<T>): JSX.Element;

interface TabProps {
    content: any;
    label?: string;
    icon?: any;
}
interface TabsProps {
    tabs: TabProps[];
}
declare type TabsClassKey = 'root' | 'styledTabs' | 'appbar';
declare function Tabs(props: TabsProps): JSX.Element;

/** @public */
declare type TabClassKey = 'root' | 'selected';

declare type TabBarClassKey = 'indicator' | 'flexContainer' | 'root';

declare type TabIconClassKey = 'root';

declare function TrendLine(props: SparklinesProps & Pick<SparklinesLineProps, 'color'> & {
    title?: string;
}): JSX.Element | null;

declare type WarningPanelClassKey = 'panel' | 'summary' | 'summaryText' | 'message' | 'details';
declare type WarningProps = {
    title?: string;
    severity?: 'warning' | 'error' | 'info';
    message?: React__default.ReactNode;
    defaultExpanded?: boolean;
    children?: React__default.ReactNode;
};
/**
 * WarningPanel. Show a user friendly error message to a user similar to
 * ErrorPanel except that the warning panel only shows the warning message to
 * the user.
 *
 * @param severity - Ability to change the severity of the alert. Default value
 *        "warning"
 * @param title - A title for the warning. If not supplied, "Warning" will be
 *        used.
 * @param message - Optional more detailed user-friendly message elaborating on
 *        the cause of the error.
 * @param children - Objects to provide context, such as a stack trace or detailed
 *        error reporting. Will be available inside an unfolded accordion.
 */
declare function WarningPanel(props: WarningProps): JSX.Element;

declare type SetQueryParams<T> = (params: T) => void;
declare function useQueryParamState<T>(stateName: string, 
/** @deprecated Don't configure a custom debouceTime */
debounceTime?: number): [T | undefined, SetQueryParams<T>];

declare type SupportItemLink = {
    url: string;
    title: string;
};
declare type SupportItem = {
    title: string;
    icon?: string;
    links: SupportItemLink[];
};
declare type SupportConfig = {
    url: string;
    items: SupportItem[];
};
declare function useSupportConfig(): SupportConfig;

declare type IconComponentProps = ComponentProps<IconComponent>;
/**
 * Broken Image Icon
 *
 * @public
 *
 */
declare function BrokenImageIcon(props: IconComponentProps): JSX.Element;
/** @public */
declare function CatalogIcon(props: IconComponentProps): JSX.Element;
/** @public */
declare function ChatIcon(props: IconComponentProps): JSX.Element;
/** @public */
declare function DashboardIcon(props: IconComponentProps): JSX.Element;
/** @public */
declare function DocsIcon(props: IconComponentProps): JSX.Element;
/** @public */
declare function EmailIcon(props: IconComponentProps): JSX.Element;
/** @public */
declare function GitHubIcon(props: IconComponentProps): JSX.Element;
/** @public */
declare function GroupIcon(props: IconComponentProps): JSX.Element;
/** @public */
declare function HelpIcon(props: IconComponentProps): JSX.Element;
/** @public */
declare function UserIcon(props: IconComponentProps): JSX.Element;
/** @public */
declare function WarningIcon(props: IconComponentProps): JSX.Element;

/** @public */
declare type BackstageContentClassKey = 'root' | 'stretch' | 'noPadding';
declare type Props$5 = {
    stretch?: boolean;
    noPadding?: boolean;
    className?: string;
};
/**
 * The main content part inside a {@link Page}.
 *
 * @public
 *
 */
declare function Content(props: PropsWithChildren<Props$5>): JSX.Element;

/** @public */
declare type ContentHeaderClassKey = 'container' | 'leftItemsBox' | 'rightItemsBox' | 'description' | 'title';
declare type ContentHeaderTitleProps = {
    title?: string;
    className?: string;
};
declare type ContentHeaderProps = {
    title?: ContentHeaderTitleProps['title'];
    titleComponent?: ReactNode;
    description?: string;
    textAlign?: 'left' | 'right' | 'center';
};
/**
 *  A header at the top inside a {@link Content}.
 *
 * @public
 *
 */
declare function ContentHeader(props: PropsWithChildren<ContentHeaderProps>): JSX.Element;

interface IErrorPageProps {
    status: string;
    statusMessage: string;
    additionalInfo?: React__default.ReactNode;
    supportUrl?: string;
}
/** @public */
declare type ErrorPageClassKey = 'container' | 'title' | 'subtitle';
/**
 * Error page with status and description
 *
 * @public
 *
 */
declare function ErrorPage(props: IErrorPageProps): JSX.Element;

declare type MicDropClassKey = 'micDrop';

/** @public */
declare type HeaderClassKey = 'header' | 'leftItemsBox' | 'rightItemsBox' | 'title' | 'subtitle' | 'type' | 'breadcrumb' | 'breadcrumbType' | 'breadcrumbTitle';
declare type Props$4 = {
    component?: ReactNode;
    pageTitleOverride?: string;
    style?: CSSProperties;
    subtitle?: ReactNode;
    title: ReactNode;
    tooltip?: string;
    type?: string;
    typeLink?: string;
};
/**
 * Backstage main header with abstract color background in multiple variants
 *
 * @public
 *
 */
declare function Header(props: PropsWithChildren<Props$4>): JSX.Element;

/** @public */
declare type HeaderLabelClassKey = 'root' | 'label' | 'value';
declare type HeaderLabelContentProps = {
    value: React__default.ReactNode;
    className: string;
};
declare type HeaderLabelProps = {
    label: string;
    value?: HeaderLabelContentProps['value'];
    url?: string;
};
/**
 * Additional label to main {@link Header}
 *
 * @public
 *
 */
declare function HeaderLabel(props: HeaderLabelProps): JSX.Element;

/** @public */
declare type HeaderTabsClassKey = 'tabsWrapper' | 'defaultTab' | 'selected' | 'tabRoot';
declare type Tab = {
    id: string;
    label: string;
    tabProps?: TabProps$1<React__default.ElementType, {
        component?: React__default.ElementType;
    }>;
};
declare type HeaderTabsProps = {
    tabs: Tab[];
    onChange?: (index: number) => void;
    selectedIndex?: number;
};
/**
 * Horizontal Tabs component
 *
 * @public
 *
 */
declare function HeaderTabs(props: HeaderTabsProps): JSX.Element;

/**
 * Please use the HeaderWorldClock in the home plugin
 *
 * @public
 * @deprecated in favor of the HeaderWorldClock which is found in the to home plugin
 */
declare function HomepageTimer(_props: {}): JSX.Element | null;

declare type ItemCardProps = {
    description?: string;
    tags?: string[];
    title: string;
    /** @deprecated Use subtitle instead */
    type?: string;
    subtitle?: ReactNode;
    label: string;
    onClick?: () => void;
    href?: string;
};
/**
 * This card type has been deprecated. Instead use plain MUI Card and helpers
 * where appropriate.
 *
 * ```
 *   <Card>
 *     <CardMedia>
 *       <ItemCardHeader title="My Card" subtitle="neat!" />
 *     </CardMedia>
 *     <CardContent>
 *        Some text
 *     </CardContent>
 *     <CardActions>
 *       <Button color="primary" to="https://backstage.io">
 *         Get Started
 *       </Button>
 *     </CardActions>
 *   </Card>
 * ```
 *
 * @deprecated Use plain MUI `<Card>` and composable helpers instead.
 * @see https://material-ui.com/components/cards/
 */
declare function ItemCard(props: ItemCardProps): JSX.Element;

/** @public */
declare type ItemCardGridClassKey = 'root';
declare const styles$1: (theme: Theme) => _material_ui_styles.StyleRules<{}, "root">;
/** @public */
declare type ItemCardGridProps = Partial<WithStyles<typeof styles$1>> & {
    /**
     * The Card items of the grid.
     */
    children?: React__default.ReactNode;
};
/**
 * A default grid to use when arranging "item cards" - cards that let users
 * select among several options.
 *
 * The immediate children are expected to be MUI Card components.
 *
 * Styles for the grid can be overridden using the `classes` prop, e.g.:
 *
 * `<ItemCardGrid title="Hello" classes={{ root: myClassName }} />`
 *
 * This can be useful for e.g. overriding gridTemplateColumns to adapt the
 * minimum size of the cells to fit the content better.
 *
 * @public
 */
declare function ItemCardGrid(props: ItemCardGridProps): JSX.Element;

/** @public */
declare type ItemCardHeaderClassKey = 'root';
declare const styles: (theme: BackstageTheme) => _material_ui_styles.StyleRules<{}, "root">;
/** @public */
declare type ItemCardHeaderProps = Partial<WithStyles<typeof styles>> & {
    /**
     * A large title to show in the header, providing the main heading.
     *
     * Use this if you want to have the default styling and placement of a title.
     */
    title?: React__default.ReactNode;
    /**
     * A slightly smaller title to show in the header, providing additional
     * details.
     *
     * Use this if you want to have the default styling and placement of a
     * subtitle.
     */
    subtitle?: React__default.ReactNode;
    /**
     * Custom children to draw in the header.
     *
     * If the title and/or subtitle were specified, the children are drawn below
     * those.
     */
    children?: React__default.ReactNode;
};
/**
 * A simple card header, rendering a default look for "item cards" - cards that
 * are arranged in a grid for users to select among several options.
 *
 * This component expects to be placed within a MUI <CardMedia>.
 *
 * Styles for the header can be overridden using the `classes` prop, e.g.:
 *
 * `<ItemCardHeader title="Hello" classes={{ root: myClassName }} />`
 *
 * @public
 */
declare function ItemCardHeader(props: ItemCardHeaderProps): JSX.Element;

declare type PageClassKey = 'root';
declare type Props$3 = {
    themeId: string;
    children?: React__default.ReactNode;
};
declare function Page(props: Props$3): JSX.Element;

declare type PageWithHeaderProps = ComponentProps<typeof Header> & {
    themeId: string;
};
declare function PageWithHeader(props: PropsWithChildren<PageWithHeaderProps>): JSX.Element;

/**
 * Props for {@link ProxiedSignInPage}.
 *
 * @public
 */
declare type ProxiedSignInPageProps = SignInPageProps & {
    /**
     * The provider to use, e.g. "gcp-iap" or "awsalb". This must correspond to
     * a properly configured auth provider ID in the auth backend.
     */
    provider: string;
};
/**
 * A sign-in page that has no user interface of its own. Instead, it relies on
 * sign-in being performed by a reverse authenticating proxy that Backstage is
 * deployed behind, and leverages its session handling.
 *
 * @remarks
 *
 * This sign-in page is useful when you are using products such as Google
 * Identity-Aware Proxy or AWS Application Load Balancer or similar, to front
 * your Backstage installation. This sign-in page implementation will silently
 * and regularly punch through the proxy to the auth backend to refresh your
 * frontend session information, without requiring user interaction.
 *
 * @public
 */
declare const ProxiedSignInPage: (props: ProxiedSignInPageProps) => JSX.Element | null;

/** @public **/
declare type SidebarOptions = {
    drawerWidthClosed?: number;
    drawerWidthOpen?: number;
};
/** @public **/
declare type SubmenuOptions = {
    drawerWidthClosed?: number;
    drawerWidthOpen?: number;
};
declare const sidebarConfig: {
    drawerWidthClosed: number;
    drawerWidthOpen: number;
    defaultOpenDelayMs: number;
    defaultCloseDelayMs: number;
    defaultFadeDuration: number;
    logoHeight: number;
    iconContainerWidth: number;
    iconSize: number;
    iconPadding: number;
    selectedIndicatorWidth: number;
    userBadgePadding: number;
    userBadgeDiameter: number;
    mobileSidebarHeight: number;
};
declare const SIDEBAR_INTRO_LOCAL_STORAGE = "@backstage/core/sidebar-intro-dismissed";

/** @public */
declare type SidebarClassKey = 'drawer' | 'drawerOpen';
/** @public */
declare type SidebarProps = {
    openDelayMs?: number;
    closeDelayMs?: number;
    sidebarOptions?: SidebarOptions;
    submenuOptions?: SubmenuOptions;
    disableExpandOnHover?: boolean;
    children?: React__default.ReactNode;
};
/**
 * Passing children into the desktop or mobile sidebar depending on the context
 *
 * @public
 */
declare const Sidebar: (props: SidebarProps) => JSX.Element;

/**
 * Props of MobileSidebar
 *
 * @public
 */
declare type MobileSidebarProps = {
    children?: React__default.ReactNode;
};
/**
 * A navigation component for mobile screens, which sticks to the bottom.
 *
 * It alternates the normal sidebar by grouping the `SidebarItems` based on provided `SidebarGroup`s
 * either rendering them as a link or an overlay menu.
 * If no `SidebarGroup`s are provided the sidebar content is wrapped in an default overlay menu.
 *
 * @public
 */
declare const MobileSidebar: (props: MobileSidebarProps) => JSX.Element | null;

/**
 * Props for the `SidebarGroup`
 *
 * @public
 */
interface SidebarGroupProps extends BottomNavigationActionProps {
    /**
     * If the `SidebarGroup` should be a `Link`, `to` should be a pathname to that location
     */
    to?: string;
    /**
     * If the `SidebarGroup`s should be in a different order than in the normal `Sidebar`, you can provide
     * each `SidebarGroup` it's own priority to reorder them.
     */
    priority?: number;
    /**
     * React children
     */
    children?: React__default.ReactNode;
}
/**
 * Groups items of the `Sidebar` together.
 *
 * On bigger screens, this won't have any effect at the moment.
 * On small screens, it will add an action to the bottom navigation - either triggering an overlay menu or acting as a link
 *
 * @public
 */
declare const SidebarGroup: (props: SidebarGroupProps) => JSX.Element;

/**
 * Clickable item displayed when submenu item is clicked.
 * title: Text content of item
 * to: Path to navigate to when item is clicked
 *
 * @public
 */
declare type SidebarSubmenuItemDropdownItem = {
    title: string;
    to: string;
};
/**
 * Holds submenu item content.
 *
 * title: Text content of submenu item
 * to: Path to navigate to when item is clicked
 * icon: Icon displayed on the left of text content
 * dropdownItems: Optional array of dropdown items displayed when submenu item is clicked.
 *
 * @public
 */
declare type SidebarSubmenuItemProps = {
    title: string;
    to?: string;
    icon?: IconComponent;
    dropdownItems?: SidebarSubmenuItemDropdownItem[];
};
/**
 * Item used inside a submenu within the sidebar.
 *
 * @public
 */
declare const SidebarSubmenuItem: (props: SidebarSubmenuItemProps) => JSX.Element;

/**
 * Holds a title for text Header of a sidebar submenu and children
 * components to be rendered inside SidebarSubmenu
 *
 * @public
 */
declare type SidebarSubmenuProps = {
    title?: string;
    children: ReactNode;
};
/**
 * Used inside SidebarItem to display an expandable Submenu
 *
 * @public
 */
declare const SidebarSubmenu: (props: SidebarSubmenuProps) => JSX.Element;

declare type SidebarPageClassKey = 'root';
/**
 * Props for SidebarPage
 *
 * @public
 */
declare type SidebarPageProps = {
    children?: React__default.ReactNode;
};
declare function SidebarPage(props: SidebarPageProps): JSX.Element;
/**
 * This hook provides a react ref to the main content.
 * Allows to set an element as the main content and focus on that component.
 *
 * *Note: If `contentRef` is not set `focusContent` is noop. `Content` component sets this ref automatically*
 *
 * @public
 * @example
 * Focus current content
 * ```tsx
 *  const { focusContent} = useContent();
 * ...
 *  <Button onClick={focusContent}>
 *     focus main content
 *  </Button>
 * ```
 * @example
 * Set the reference to an Html element
 * ```
 *  const { contentRef } = useContent();
 * ...
 *  <article ref={contentRef} tabIndex={-1}>Main Content</article>
 * ```
 */
declare function useContent(): {
    focusContent: () => void;
    contentRef: React__default.MutableRefObject<HTMLElement | null> | undefined;
};

/** @public */
declare type SidebarItemClassKey = 'root' | 'buttonItem' | 'closed' | 'open' | 'highlightable' | 'highlighted' | 'label' | 'iconContainer' | 'searchRoot' | 'searchField' | 'searchFieldHTMLInput' | 'searchContainer' | 'secondaryAction' | 'closedItemIcon' | 'submenuArrow' | 'expandButton' | 'arrows' | 'selected';
declare type SidebarItemBaseProps = {
    icon: IconComponent;
    text?: string;
    hasNotifications?: boolean;
    hasSubmenu?: boolean;
    disableHighlight?: boolean;
    className?: string;
};
declare type SidebarItemButtonProps = SidebarItemBaseProps & {
    onClick: (ev: React__default.MouseEvent) => void;
    children?: ReactNode;
};
declare type SidebarItemLinkProps = SidebarItemBaseProps & {
    to: string;
    onClick?: (ev: React__default.MouseEvent) => void;
} & NavLinkProps;
declare type SidebarItemWithSubmenuProps = SidebarItemBaseProps & {
    to?: string;
    onClick?: (ev: React__default.MouseEvent) => void;
    children: ReactNode;
};
/**
 * SidebarItem with 'to' property will be a clickable link.
 * SidebarItem with 'onClick' property and without 'to' property will be a clickable button.
 * SidebarItem which wraps a SidebarSubmenu will be a clickable button which opens a submenu.
 */
declare type SidebarItemProps = SidebarItemLinkProps | SidebarItemButtonProps | SidebarItemWithSubmenuProps;
/**
 * Creates a `SidebarItem`
 *
 * If children contain a `SidebarSubmenu` component the `SidebarItem` will have a expandable submenu
 */
declare const SidebarItem: (props: SidebarItemProps) => JSX.Element;
declare type SidebarSearchFieldProps = {
    onSearch: (input: string) => void;
    to?: string;
    icon?: IconComponent;
};
declare function SidebarSearchField(props: SidebarSearchFieldProps): JSX.Element;
declare type SidebarSpaceClassKey = 'root';
declare const SidebarSpace: React__default.ComponentType<React__default.ClassAttributes<HTMLDivElement> & React__default.HTMLAttributes<HTMLDivElement> & StyledComponentProps<"root">>;
declare type SidebarSpacerClassKey = 'root';
declare const SidebarSpacer: React__default.ComponentType<React__default.ClassAttributes<HTMLDivElement> & React__default.HTMLAttributes<HTMLDivElement> & StyledComponentProps<"root">>;
declare type SidebarDividerClassKey = 'root';
declare const SidebarDivider: React__default.ComponentType<React__default.ClassAttributes<HTMLHRElement> & React__default.HTMLAttributes<HTMLHRElement> & StyledComponentProps<"root">>;
declare const SidebarScrollWrapper: React__default.ComponentType<React__default.ClassAttributes<HTMLDivElement> & React__default.HTMLAttributes<HTMLDivElement> & StyledComponentProps<"root">>;
/**
 * A button which allows you to expand the sidebar when clicked.
 * Use optionally to replace sidebar's expand-on-hover feature with expand-on-click.
 *
 * If you are using this you might want to set the `disableExpandOnHover` of the `Sidebar` to `true`.
 *
 * @public
 */
declare const SidebarExpandButton: () => JSX.Element | null;

/** @public */
declare type SidebarIntroClassKey = 'introCard' | 'introDismiss' | 'introDismissLink' | 'introDismissText' | 'introDismissIcon';
declare type IntroCardProps = {
    text: string;
    onClose: () => void;
};
/**
 * Closable card with information from Navigation Sidebar
 *
 * @public
 *
 */
declare function IntroCard(props: IntroCardProps): JSX.Element;
declare function SidebarIntro(_props: {}): JSX.Element | null;

/**
 * Types for the `SidebarContext`
 *
 * @public @deprecated
 * Use `SidebarOpenState` instead.
 */
declare type SidebarContextType = {
    isOpen: boolean;
    setOpen: (open: boolean) => void;
};
/**
 * The open state of the sidebar.
 *
 * @public
 */
declare type SidebarOpenState = {
    /**
     * Whether or not the sidebar is open and full-width. When `false`, the
     * sidebar is "closed" and typically only shows icons with no text.
     */
    isOpen: boolean;
    /**
     * A function to set whether or not the sidebar is open. Pass `true` to open
     * the sidebar. Pass `false` to close it.
     */
    setOpen: (open: boolean) => void;
};
/**
 * Context whether the `Sidebar` is open
 *
 * @public @deprecated
 * Use `<SidebarOpenStateProvider>` + `useSidebarOpenState()` instead.
 */
declare const LegacySidebarContext: React__default.Context<SidebarContextType>;
/**
 * Provides context for reading and updating sidebar state.
 *
 * @public
 */
declare const SidebarOpenStateProvider: ({ children, value, }: {
    children: ReactNode;
    value: SidebarOpenState;
}) => JSX.Element;
/**
 * Hook to read and update the sidebar's open state, which controls whether or
 * not the sidebar is open and full-width, or closed and only displaying icons.
 *
 * @public
 */
declare const useSidebarOpenState: () => SidebarOpenState;

/**
 * Type of `SidebarPinStateContext`
 *
 * @public @deprecated
 * Use `SidebarPinState` instead.
 */
declare type SidebarPinStateContextType = {
    isPinned: boolean;
    toggleSidebarPinState: () => any;
    isMobile?: boolean;
};
/**
 * The pin state of the sidebar.
 *
 * @public
 */
declare type SidebarPinState = {
    /**
     * Whether or not the sidebar is pinned to the `open` state. When `isPinned`
     * is `false`, the sidebar opens and closes on hover. When `true`, the
     * sidebar is permanently opened, regardless of user interaction.
     */
    isPinned: boolean;
    /**
     * A function to toggle the pin state of the sidebar.
     */
    toggleSidebarPinState: () => any;
    /**
     * Whether or not the sidebar is or should be rendered in a mobile-optimized
     * way.
     */
    isMobile?: boolean;
};
/**
 * Contains the state on how the `Sidebar` is rendered
 *
 * @public @deprecated
 * Use `<SidebarPinStateContextProvider>` + `useSidebarPinState()` instead.
 */
declare const LegacySidebarPinStateContext: React__default.Context<SidebarPinStateContextType>;
/**
 * Provides state for how the `Sidebar` is rendered
 *
 * @public
 */
declare const SidebarPinStateProvider: ({ children, value, }: {
    children: ReactNode;
    value: SidebarPinStateContextType;
}) => JSX.Element;
/**
 * Hook to read and update sidebar pin state, which controls whether or not the
 * sidebar is pinned open.
 *
 * @public
 */
declare const useSidebarPinState: () => SidebarPinState;

declare type SignInProviderConfig = {
    id: string;
    title: string;
    message: string;
    apiRef: ApiRef<ProfileInfoApi & BackstageIdentityApi & SessionApi>;
};
/** @public **/
declare type IdentityProviders = ('guest' | 'custom' | SignInProviderConfig)[];

declare type MultiSignInPageProps = SignInPageProps & {
    providers: IdentityProviders;
    title?: string;
    align?: 'center' | 'left';
};
declare type SingleSignInPageProps = SignInPageProps & {
    provider: SignInProviderConfig;
    auto?: boolean;
};
declare type Props$2 = MultiSignInPageProps | SingleSignInPageProps;
declare function SignInPage(props: Props$2): JSX.Element;

declare type SignInPageClassKey = 'container' | 'item';

/** @public */
declare type CustomProviderClassKey = 'form' | 'button';

/**
 * An implementation of the IdentityApi that is constructed using
 * various backstage user identity representations.
 *
 * @public
 */
declare class UserIdentity implements IdentityApi {
    private readonly identity;
    private readonly authApi;
    private readonly profile?;
    private profilePromise?;
    /**
     * Creates a new IdentityApi that acts as a Guest User.
     *
     * @public
     */
    static createGuest(): IdentityApi;
    /**
     * Creates a new IdentityApi using a legacy SignInResult object.
     *
     * @public
     */
    static fromLegacy(result: {
        /**
         * User ID that will be returned by the IdentityApi
         */
        userId: string;
        profile: ProfileInfo;
        /**
         * Function used to retrieve an ID token for the signed in user.
         */
        getIdToken?: () => Promise<string>;
        /**
         * Sign out handler that will be called if the user requests to sign out.
         */
        signOut?: () => Promise<void>;
    }): IdentityApi;
    /**
     * Creates a new IdentityApi implementation using a user identity
     * and an auth API that will be used to request backstage tokens.
     *
     * @public
     */
    static create(options: {
        identity: BackstageUserIdentity;
        authApi: ProfileInfoApi & BackstageIdentityApi & SessionApi;
        /**
         * Passing a profile synchronously allows the deprecated `getProfile` method to be
         * called by consumers of the {@link @backstage/core-plugin-api#IdentityApi}. If you
         * do not have any consumers of that method then this is safe to leave out.
         *
         * @deprecated Only provide this if you have plugins that call the synchronous `getProfile` method, which is also deprecated.
         */
        profile?: ProfileInfo;
    }): IdentityApi;
    private constructor();
    /** {@inheritdoc @backstage/core-plugin-api#IdentityApi.getUserId} */
    getUserId(): string;
    /** {@inheritdoc @backstage/core-plugin-api#IdentityApi.getIdToken} */
    getIdToken(): Promise<string | undefined>;
    /** {@inheritdoc @backstage/core-plugin-api#IdentityApi.getProfile} */
    getProfile(): ProfileInfo;
    /** {@inheritdoc @backstage/core-plugin-api#IdentityApi.getProfileInfo} */
    getProfileInfo(): Promise<ProfileInfo>;
    /** {@inheritdoc @backstage/core-plugin-api#IdentityApi.getBackstageIdentity} */
    getBackstageIdentity(): Promise<BackstageUserIdentity>;
    /** {@inheritdoc @backstage/core-plugin-api#IdentityApi.getCredentials} */
    getCredentials(): Promise<{
        token?: string | undefined;
    }>;
    /** {@inheritdoc @backstage/core-plugin-api#IdentityApi.signOut} */
    signOut(): Promise<void>;
}

declare type TabbedCardClassKey = 'root' | 'indicator';
/** @public */
declare type BoldHeaderClassKey = 'root' | 'title' | 'subheader';
declare type Props$1 = {
    /** @deprecated Use errorBoundaryProps instead */
    slackChannel?: string;
    errorBoundaryProps?: ErrorBoundaryProps;
    children?: ReactElement<TabProps$1>[];
    onChange?: (event: React__default.ChangeEvent<{}>, value: number | string) => void;
    title?: string;
    value?: number | string;
    deepLink?: BottomLinkProps;
};
declare function TabbedCard(props: PropsWithChildren<Props$1>): JSX.Element;
/** @public */
declare type CardTabClassKey = 'root' | 'selected';
declare type CardTabProps = TabProps$1 & {
    children: ReactNode;
};
/**
 * Card tab component used in {@link TabbedCard}
 *
 * @public
 *
 */
declare function CardTab(props: PropsWithChildren<CardTabProps>): JSX.Element;

declare type Props = ComponentProps<typeof MaterialBreadcrumbs>;
/** @public */
declare type BreadcrumbsClickableTextClassKey = 'root';
/** @public */
declare type BreadcrumbsStyledBoxClassKey = 'root';
/**
 * Breadcrumbs component to show navigation hierarchical structure
 *
 * @public
 *
 */
declare function Breadcrumbs(props: Props): JSX.Element;

declare type BackstageComponentsNameToClassKey = {
    BackstageAvatar: AvatarClassKey;
    BackstageDependencyGraphDefaultLabel: DependencyGraphDefaultLabelClassKey;
    BackstageDependencyGraphDefaultNode: DependencyGraphDefaultNodeClassKey;
    BackstageDependencyGraphEdge: DependencyGraphEdgeClassKey;
    BackstageDependencyGraphNode: DependencyGraphNodeClassKey;
    BackstageDismissableBanner: DismissableBannerClassKey;
    BackstageEmptyState: EmptyStateClassKey;
    BackstageEmptyStateImage: EmptyStateImageClassKey;
    BackstageMissingAnnotationEmptyState: MissingAnnotationEmptyStateClassKey;
    BackstageErrorPanel: ErrorPanelClassKey;
    BackstageFeatureCalloutCircular: FeatureCalloutCircleClassKey;
    BackstageHeaderIconLinkRow: HeaderIconLinkRowClassKey;
    BackstageIconLinkVertical: IconLinkVerticalClassKey;
    BackstageHorizontalScrollGrid: HorizontalScrollGridClassKey;
    BackstageLifecycle: LifecycleClassKey;
    BackstageMarkdownContent: MarkdownContentClassKey;
    BackstageLoginRequestListItem: LoginRequestListItemClassKey;
    BackstageLogViewer: LogViewerClassKey;
    OAuthRequestDialog: OAuthRequestDialogClassKey;
    BackstageOverflowTooltip: OverflowTooltipClassKey;
    BackstageGauge: GaugeClassKey;
    BackstageGaugeCard: GaugeCardClassKey;
    BackstageResponseErrorPanel: ResponseErrorPanelClassKey;
    BackstageSelectInputBase: SelectInputBaseClassKey;
    BackstageSelect: SelectClassKey;
    BackstageClosedDropdown: ClosedDropdownClassKey;
    BackstageOpenedDropdown: OpenedDropdownClassKey;
    BackstageSimpleStepperFooter: SimpleStepperFooterClassKey;
    SimpleStepperStep: SimpleStepperStepClassKey;
    BackstageStatus: StatusClassKey;
    BackstageMetadataTableTitleCell: MetadataTableTitleCellClassKey;
    BackstageMetadataTableCell: MetadataTableCellClassKey;
    BackstageMetadataTableList: MetadataTableListClassKey;
    BackstageMetadataTableListItem: MetadataTableListItemClassKey;
    BackstageStructuredMetadataTableList: StructuredMetadataTableListClassKey;
    BackstageStructuredMetadataTableNestedList: StructuredMetadataTableNestedListClassKey;
    BackstageSupportButton: SupportButtonClassKey;
    BackstageTableFilters: TableFiltersClassKey;
    BackstageSubvalueCell: SubvalueCellClassKey;
    BackstageTableHeader: TableHeaderClassKey;
    BackstageTableToolbar: TableToolbarClassKey;
    BackstageTableFiltersContainer: FiltersContainerClassKey;
    BackstageTable: TableClassKey;
    BackstageTabBar: TabBarClassKey;
    BackstageTabIcon: TabIconClassKey;
    BackstageTabs: TabsClassKey;
    BackstageTab: TabClassKey;
    BackstageWarningPanel: WarningPanelClassKey;
    BackstageBottomLink: BottomLinkClassKey;
    BackstageBreadcrumbsClickableText: BreadcrumbsClickableTextClassKey;
    BackstageBreadcrumbsStyledBox: BreadcrumbsStyledBoxClassKey;
    BackstageContent: BackstageContentClassKey;
    BackstageContentHeader: ContentHeaderClassKey;
    BackstageErrorPage: ErrorPageClassKey;
    BackstageErrorPageMicDrop: MicDropClassKey;
    BackstageHeader: HeaderClassKey;
    BackstageHeaderLabel: HeaderLabelClassKey;
    BackstageHeaderTabs: HeaderTabsClassKey;
    BackstageInfoCard: InfoCardClassKey;
    BackstageInfoCardCardActionsTopRight: CardActionsTopRightClassKey;
    BackstageItemCardGrid: ItemCardGridClassKey;
    BackstageItemCardHeader: ItemCardHeaderClassKey;
    BackstagePage: PageClassKey;
    BackstageSidebar: SidebarClassKey;
    BackstageSidebarSpace: SidebarSpaceClassKey;
    BackstageSidebarSpacer: SidebarSpacerClassKey;
    BackstageSidebarDivider: SidebarDividerClassKey;
    BackstageSidebarIntro: SidebarIntroClassKey;
    BackstageSidebarItem: SidebarItemClassKey;
    BackstageSidebarPage: SidebarPageClassKey;
    BackstageCustomProvider: CustomProviderClassKey;
    BackstageSignInPage: SignInPageClassKey;
    BackstageTabbedCard: TabbedCardClassKey;
    BackstageTabbedCardBoldHeader: BoldHeaderClassKey;
    BackstageCardTab: CardTabClassKey;
};
/** @public */
declare type BackstageOverrides = Overrides & {
    [Name in keyof BackstageComponentsNameToClassKey]?: Partial<StyleRules<BackstageComponentsNameToClassKey[Name]>>;
};

export { AlertDisplay, AlertDisplayProps, Avatar, AvatarClassKey, AvatarProps, BackstageContentClassKey, BackstageOverrides, BoldHeaderClassKey, BottomLink, BottomLinkClassKey, BottomLinkProps, Breadcrumbs, BreadcrumbsClickableTextClassKey, BreadcrumbsStyledBoxClassKey, BrokenImageIcon, Button, ButtonProps, CardActionsTopRightClassKey, CardTab, CardTabClassKey, CatalogIcon, ChatIcon, ClosedDropdownClassKey, CodeSnippet, CodeSnippetProps, Content, ContentHeader, ContentHeaderClassKey, CopyTextButton, CopyTextButtonProps, CreateButton, CreateButtonProps, CustomProviderClassKey, DashboardIcon, DependencyGraph, DependencyGraphDefaultLabelClassKey, DependencyGraphDefaultNodeClassKey, DependencyGraphEdgeClassKey, DependencyGraphNodeClassKey, DependencyGraphProps, types_d as DependencyGraphTypes, DismissableBanner, DismissableBannerClassKey, DismissbleBannerClassKey, DocsIcon, EmailIcon, EmptyState, EmptyStateClassKey, EmptyStateImageClassKey, ErrorBoundary, ErrorBoundaryProps, ErrorPage, ErrorPageClassKey, ErrorPanel, ErrorPanelClassKey, ErrorPanelProps, FeatureCalloutCircleClassKey, FeatureCalloutCircular, FiltersContainerClassKey, Gauge, GaugeCard, GaugeCardClassKey, GaugeClassKey, GaugeProps, GaugePropsGetColor, GaugePropsGetColorOptions, GitHubIcon, GroupIcon, Header, HeaderClassKey, HeaderIconLinkRow, HeaderIconLinkRowClassKey, HeaderLabel, HeaderLabelClassKey, HeaderTabs, HeaderTabsClassKey, HelpIcon, HomepageTimer, HorizontalScrollGrid, HorizontalScrollGridClassKey, IconLinkVerticalClassKey, IconLinkVerticalProps, IdentityProviders, InfoCard, InfoCardClassKey, InfoCardVariants, IntroCard, ItemCard, ItemCardGrid, ItemCardGridClassKey, ItemCardGridProps, ItemCardHeader, ItemCardHeaderClassKey, ItemCardHeaderProps, Lifecycle, LifecycleClassKey, LinearGauge, Link, LinkProps, LogViewer, LogViewerClassKey, LogViewerProps, LoginRequestListItemClassKey, MarkdownContent, MarkdownContentClassKey, MetadataTableCellClassKey, MetadataTableListClassKey, MetadataTableListItemClassKey, MetadataTableTitleCellClassKey, MicDropClassKey, MissingAnnotationEmptyState, MissingAnnotationEmptyStateClassKey, MobileSidebar, MobileSidebarProps, OAuthRequestDialog, OAuthRequestDialogClassKey, OpenedDropdownClassKey, OverflowTooltip, OverflowTooltipClassKey, Page, PageClassKey, PageWithHeader, Progress, ProxiedSignInPage, ProxiedSignInPageProps, ResponseErrorPanel, ResponseErrorPanelClassKey, RoutedTabs, SIDEBAR_INTRO_LOCAL_STORAGE, SelectComponent as Select, SelectClassKey, SelectInputBaseClassKey, SelectItem, SelectedItems, Sidebar, SidebarClassKey, LegacySidebarContext as SidebarContext, SidebarContextType, SidebarDivider, SidebarDividerClassKey, SidebarExpandButton, SidebarGroup, SidebarGroupProps, SidebarIntro, SidebarIntroClassKey, SidebarItem, SidebarItemClassKey, SidebarOpenState, SidebarOpenStateProvider, SidebarOptions, SidebarPage, SidebarPageClassKey, SidebarPageProps, SidebarPinState, LegacySidebarPinStateContext as SidebarPinStateContext, SidebarPinStateContextType, SidebarPinStateProvider, SidebarProps, SidebarScrollWrapper, SidebarSearchField, SidebarSpace, SidebarSpaceClassKey, SidebarSpacer, SidebarSpacerClassKey, SidebarSubmenu, SidebarSubmenuItem, SidebarSubmenuItemDropdownItem, SidebarSubmenuItemProps, SidebarSubmenuProps, SignInPage, SignInPageClassKey, SignInProviderConfig, SimpleStepper, SimpleStepperFooterClassKey, SimpleStepperStep, SimpleStepperStepClassKey, StatusAborted, StatusClassKey, StatusError, StatusOK, StatusPending, StatusRunning, StatusWarning, StructuredMetadataTable, StructuredMetadataTableListClassKey, StructuredMetadataTableNestedListClassKey, SubmenuOptions, SubvalueCell, SubvalueCellClassKey, SupportButton, SupportButtonClassKey, SupportConfig, SupportItem, SupportItemLink, Tab, TabBarClassKey, TabClassKey, TabIconClassKey, TabbedCard, TabbedCardClassKey, TabbedLayout, Table, TableClassKey, TableColumn, TableFilter, TableFiltersClassKey, TableHeaderClassKey, TableProps, TableState, TableToolbarClassKey, Tabs, TabsClassKey, TrendLine, UserIcon, UserIdentity, WarningIcon, WarningPanel, WarningPanelClassKey, sidebarConfig, useContent, useQueryParamState, useSidebarOpenState, useSidebarPinState, useSupportConfig };
