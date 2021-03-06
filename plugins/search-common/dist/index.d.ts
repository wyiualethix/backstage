/// <reference types="node" />
import { Permission } from '@backstage/plugin-permission-common';
import { JsonObject } from '@backstage/types';
import { Readable, Transform, Writable } from 'stream';

/**
 * @public
 */
interface SearchQuery {
    term: string;
    filters?: JsonObject;
    types?: string[];
    pageCursor?: string;
}
/**
 * Metadata for result relevant document fields with matched terms highlighted
 * via wrapping in associated pre/post tags. The UI is expected to parse these
 * field excerpts by replacing wrapping tags with applicable UI elements for rendering.
 * @public
 */
interface ResultHighlight {
    /**
     * Prefix tag for wrapping terms to be highlighted.
     */
    preTag: string;
    /**
     * Postfix tag for wrapping terms to be highlighted.
     */
    postTag: string;
    fields: {
        /**
         * Matched document fields and associated excerpts containing highlighted
         * terms wrapped in preTag and postTag to be parsed and rendered in the UI.
         */
        [field: string]: string;
    };
}
/**
 * @public
 */
interface Result<TDocument extends SearchDocument> {
    type: string;
    document: TDocument;
    highlight?: ResultHighlight;
}
/**
 * @public
 */
interface ResultSet<TDocument extends SearchDocument> {
    results: Result<TDocument>[];
    nextPageCursor?: string;
    previousPageCursor?: string;
}
/**
 * @public
 */
declare type SearchResult = Result<SearchDocument>;
/**
 * @public
 */
declare type SearchResultSet = ResultSet<SearchDocument>;
/**
 * @public
 */
declare type IndexableResult = Result<IndexableDocument>;
/**
 * @public
 */
declare type IndexableResultSet = ResultSet<IndexableDocument>;
/**
 * Base properties that all search documents must include.
 * @public
 */
interface SearchDocument {
    /**
     * The primary name of the document (e.g. name, title, identifier, etc).
     */
    title: string;
    /**
     * Free-form text of the document (e.g. description, content, etc).
     */
    text: string;
    /**
     * The relative or absolute URL of the document (target when a search result
     * is clicked).
     */
    location: string;
}
/**
 * Properties related to indexing of documents. This type is only useful for
 * backends working directly with documents being inserted or retrieved from
 * search indexes. When dealing with documents in the frontend, use
 * {@link SearchDocument}.
 * @public
 */
declare type IndexableDocument = SearchDocument & {
    /**
     * Optional authorization information to be used when determining whether this
     * search result should be visible to a given user.
     */
    authorization?: {
        /**
         * Identifier for the resource.
         */
        resourceRef: string;
    };
};
/**
 * Information about a specific document type. Intended to be used in the
 * {@link @backstage/plugin-search-backend-node#IndexBuilder} to collect information
 * about the types stored in the index.
 * @public
 */
declare type DocumentTypeInfo = {
    /**
     * The {@link @backstage/plugin-permission-common#Permission} that controls
     * visibility of resources associated with this collator's documents.
     */
    visibilityPermission?: Permission;
};
/**
 * Factory class for instantiating collators.
 * @public
 */
interface DocumentCollatorFactory {
    /**
     * The type or name of the document set returned by this collator. Used as an
     * index name by Search Engines.
     */
    readonly type: string;
    /**
     * The {@link @backstage/plugin-permission-common#Permission} that controls
     * visibility of resources associated with this collator's documents.
     */
    readonly visibilityPermission?: Permission;
    /**
     * Instantiates and resolves a document collator.
     */
    getCollator(): Promise<Readable>;
}
/**
 * Factory class for instantiating decorators.
 * @public
 */
interface DocumentDecoratorFactory {
    /**
     * An optional array of document/index types on which this decorator should
     * be applied. If no types are provided, this decorator will be applied to
     * all document/index types.
     */
    readonly types?: string[];
    /**
     * Instantiates and resolves a document decorator.
     */
    getDecorator(): Promise<Transform>;
}
/**
 * A type of function responsible for translating an abstract search query into
 * a concrete query relevant to a particular search engine.
 * @public
 */
declare type QueryTranslator = (query: SearchQuery) => unknown;
/**
 * Options when querying a search engine.
 * @public
 */
declare type QueryRequestOptions = {
    token?: string;
};
/**
 * Interface that must be implemented by specific search engines, responsible
 * for performing indexing and querying and translating abstract queries into
 * concrete, search engine-specific queries.
 * @public
 */
interface SearchEngine {
    /**
     * Override the default translator provided by the SearchEngine.
     */
    setTranslator(translator: QueryTranslator): void;
    /**
     * Factory method for getting a search engine indexer for a given document
     * type.
     *
     * @param type - The type or name of the document set for which an indexer
     *   should be retrieved. This corresponds to the `type` property on the
     *   document collator/decorator factories and will most often be used to
     *   identify an index or group to which documents should be written.
     */
    getIndexer(type: string): Promise<Writable>;
    /**
     * Perform a search query against the SearchEngine.
     */
    query(query: SearchQuery, options?: QueryRequestOptions): Promise<IndexableResultSet>;
}

export { DocumentCollatorFactory, DocumentDecoratorFactory, DocumentTypeInfo, IndexableDocument, IndexableResult, IndexableResultSet, QueryRequestOptions, QueryTranslator, Result, ResultHighlight, ResultSet, SearchDocument, SearchEngine, SearchQuery, SearchResult, SearchResultSet };
