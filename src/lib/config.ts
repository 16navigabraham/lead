/**
 * Shared limits for the lead extractor — single source of truth for both
 * the API route and the client UI, so what the user sees always matches
 * what the server will actually do.
 *
 * The Serper Places API is paginated and finite: each page returns a
 * bounded batch and results dry up after a number of pages. On top of that
 * we impose our own hard ceiling so a session can never run away with API
 * credits. The UI reads these to communicate the limit up front.
 */

/** Highest page number the API will request from the provider. */
export const MAX_PAGES = 20;

/** Approximate number of results the provider returns per page. */
export const RESULTS_PER_PAGE = 20;

/** Hard client-side ceiling on total unique leads per query. */
export const MAX_LEADS = 200;
