import { PropsWithChildren } from 'react';
import { LoadingContextProps } from '../hooks/useLoading';
import { GroupsContextProps } from '../hooks/useGroups';
import { FilterContextProps } from '../hooks/useFilters';
import { ConfigContextProps } from '../hooks/useConfig';
import { CurrencyContextProps } from '../hooks/useCurrency';
import { BillingDateContextProps } from '../hooks/useLastCompleteBillingDate';
import { Group } from '../types';
declare type PartialPropsWithChildren<T> = PropsWithChildren<Partial<T>>;
export declare const MockGroups: Group[];
export declare type MockFilterProviderProps = PartialPropsWithChildren<FilterContextProps>;
export declare const MockFilterProvider: ({ children, ...context }: MockFilterProviderProps) => JSX.Element;
export declare type MockLoadingProviderProps = PartialPropsWithChildren<LoadingContextProps>;
export declare const MockLoadingProvider: ({ children, ...context }: MockLoadingProviderProps) => JSX.Element;
export declare type MockConfigProviderProps = PartialPropsWithChildren<ConfigContextProps>;
export declare const MockConfigProvider: ({ children, ...context }: MockConfigProviderProps) => JSX.Element;
export declare type MockCurrencyProviderProps = PartialPropsWithChildren<CurrencyContextProps>;
export declare const MockCurrencyProvider: ({ children, ...context }: MockCurrencyProviderProps) => JSX.Element;
export declare type MockBillingDateProviderProps = PartialPropsWithChildren<BillingDateContextProps>;
export declare const MockBillingDateProvider: ({ children, ...context }: MockBillingDateProviderProps) => JSX.Element;
export declare type MockScrollProviderProps = PropsWithChildren<{}>;
export declare const MockScrollProvider: ({ children }: MockScrollProviderProps) => JSX.Element;
export declare type MockGroupsProviderProps = PartialPropsWithChildren<GroupsContextProps>;
export declare const MockGroupsProvider: ({ children, ...context }: MockGroupsProviderProps) => JSX.Element;
export {};