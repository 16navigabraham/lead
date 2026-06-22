"use client";

import { useCallback, useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { EmptyState } from "@/components/EmptyState";
import { LeadsTable } from "@/components/LeadsTable";
import { LeadDetail } from "@/components/LeadDetail";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { CountUp } from "@/components/CountUp";
import { ArrowRightIcon, DownloadIcon, SpinnerIcon } from "@/components/icons";
import { downloadCsv } from "@/lib/csv";
import { mergeLeads, type ExtractResponse, type Lead } from "@/lib/types";
import { MAX_LEADS } from "@/lib/config";

export default function Home() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [noNewNotice, setNoNewNotice] = useState(false);

  // Single fetch for a given query + page. Returns the parsed payload.
  const fetchPage = useCallback(async (q: string, p: number) => {
    const res = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q, page: p }),
    });
    const data = (await res.json()) as Partial<ExtractResponse> & {
      error?: string;
    };
    if (!res.ok) {
      throw new Error(data.error || "Something went wrong. Please try again.");
    }
    return data;
  }, []);

  // Fresh search: resets the list to page 1.
  const handleExtract = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setNoNewNotice(false);
    setHasSearched(true);
    setSubmittedQuery(trimmed);
    setPage(1);

    try {
      const data = await fetchPage(trimmed, 1);
      setLeads(data.leads ?? []);
      setHasMore(Boolean(data.hasMore));
    } catch (err) {
      setLeads([]);
      setHasMore(false);
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }, [query, fetchPage]);

  // Load more: fetches subsequent pages and appends only new (deduped) leads.
  // Auto-advances past pages that yield nothing new (Serper can repeat).
  const handleLoadMore = useCallback(async () => {
    if (!submittedQuery || loadingMore || loading) return;
    if (leads.length >= MAX_LEADS) return;

    setLoadingMore(true);
    setError(null);
    setNoNewNotice(false);

    try {
      let nextPage = page + 1;
      let added = 0;
      let keepGoing = true;
      // Work off a local snapshot so dedupe math is synchronous and accurate.
      let current = leads;

      // Try up to 3 successive pages to find genuinely new results.
      for (let attempt = 0; attempt < 3 && keepGoing; attempt++) {
        const data = await fetchPage(submittedQuery, nextPage);
        const incoming = data.leads ?? [];

        let merged = mergeLeads(current, incoming);

        // Enforce the hard ceiling: never hold more than MAX_LEADS.
        if (merged.length > MAX_LEADS) {
          merged = merged.slice(0, MAX_LEADS);
          keepGoing = false;
        }

        added += merged.length - current.length;
        current = merged;

        setLeads(merged);
        setPage(nextPage);

        // Stop offering "more" once the provider runs dry OR we hit the cap.
        const providerHasMore = Boolean(data.hasMore);
        keepGoing = keepGoing && providerHasMore && current.length < MAX_LEADS;
        setHasMore(keepGoing);

        if (added > 0 || !providerHasMore || current.length >= MAX_LEADS) break;
        nextPage += 1;
      }

      if (added === 0) setNoNewNotice(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoadingMore(false);
    }
  }, [submittedQuery, page, loadingMore, loading, leads, fetchPage]);

  const handleDownload = useCallback(() => {
    if (leads.length === 0) return;
    downloadCsv(leads, submittedQuery || "leads");
  }, [leads, submittedQuery]);

  const showTable = !loading && leads.length > 0;
  const showEmpty = !loading && leads.length === 0;
  const reachedCap = leads.length >= MAX_LEADS;

  return (
    <main className="canvas-glow relative min-h-screen w-full">
      <AnimatedBackground />
      <div className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
        {/* ── Header ───────────────────────────────────────────── */}
        <header className="flex animate-fade-up flex-col items-start opacity-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800/80 bg-neutral-900/50 px-3 py-1 text-[12px] text-neutral-400 backdrop-blur-md">
            <span className="relative flex h-2 w-2 items-center justify-center">
              <span className="absolute h-2 w-2 animate-ping-ring rounded-full bg-emerald-400/70" />
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Lead Intelligence
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            <span className="text-shimmer">Query-Based Lead Extractor</span>
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-neutral-400">
            Describe a market in plain language. We surface verified business
            contacts — names, phones, websites, and ratings — ready to export.
          </p>
        </header>

        {/* ── Search ───────────────────────────────────────────── */}
        <section className="mt-10">
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            onSubmit={handleExtract}
            loading={loading}
          />
        </section>

        {/* ── Results panel ────────────────────────────────────── */}
        <section className="mt-8 animate-fade-in">
          <div className="overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-md">
            {/* Panel toolbar */}
            <div className="flex items-center justify-between gap-4 border-b border-neutral-800/80 px-6 py-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-50">Results</p>
                <p className="mt-0.5 truncate text-[13px] text-neutral-500">
                  {loading ? (
                    "Extracting leads…"
                  ) : leads.length > 0 ? (
                    <>
                      <CountUp
                        value={leads.length}
                        className="font-medium text-neutral-300"
                      />{" "}
                      of up to {MAX_LEADS} leads for “{submittedQuery}”
                    </>
                  ) : hasSearched ? (
                    `No results for “${submittedQuery}”`
                  ) : (
                    "Awaiting your first query"
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownload}
                disabled={leads.length === 0 || loading}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-neutral-800/80 bg-neutral-900/60 px-3.5 py-2 text-[13px] font-medium text-neutral-200 transition duration-200 hover:border-neutral-700 hover:bg-neutral-800/60 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
              >
                <DownloadIcon className="h-4 w-4" />
                Export CSV
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="border-b border-red-900/40 bg-red-950/30 px-6 py-3 text-[13px] text-red-300">
                {error}
              </div>
            )}

            {/* Body */}
            {loading && <SkeletonLoader />}
            {showTable && (
              <LeadsTable leads={leads} onSelect={setSelectedLead} />
            )}
            {showEmpty && <EmptyState />}

            {/* Load more footer — only once we have at least one page of leads */}
            {showTable && (
              <div className="flex flex-col items-center gap-4 border-t border-neutral-800/80 px-6 py-6">
                {/* Progress toward the fetch limit */}
                <div className="w-full max-w-xs">
                  <div className="mb-1.5 flex items-center justify-between text-[11px] text-neutral-500">
                    <span>{leads.length} fetched</span>
                    <span>limit {MAX_LEADS}</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-800/80">
                    <div
                      className="h-full rounded-full bg-neutral-400 transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.min(
                          (leads.length / MAX_LEADS) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {reachedCap ? (
                  <p className="text-center text-[12px] text-neutral-500">
                    Reached the fetch limit of {MAX_LEADS} leads. Export your
                    results, or refine the query for a different set.
                  </p>
                ) : hasMore ? (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="group inline-flex items-center gap-2 rounded-xl border border-neutral-800/80 bg-neutral-900/60 px-5 py-2.5 text-[13px] font-medium text-neutral-200 backdrop-blur-md transition duration-200 hover:border-neutral-700 hover:bg-neutral-800/60 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <SpinnerIcon className="h-4 w-4" />
                        Loading more
                      </>
                    ) : (
                      <>
                        Load more results
                        <ArrowRightIcon className="h-4 w-4 rotate-90 transition-transform duration-200 group-hover:translate-y-0.5" />
                      </>
                    )}
                  </button>
                ) : (
                  <p className="text-[12px] text-neutral-600">
                    End of results · {leads.length} unique lead
                    {leads.length === 1 ? "" : "s"} found
                  </p>
                )}

                {noNewNotice && hasMore && !reachedCap && (
                  <p className="text-center text-[12px] text-neutral-500">
                    No new results on the next pages — the provider&apos;s
                    listings for this query are limited. Try a more specific
                    query for different leads.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        <LeadDetail lead={selectedLead} onClose={() => setSelectedLead(null)} />

        <footer className="mt-10 text-center text-[12px] text-neutral-600">
          Powered by live places data · Results reflect your exact query
        </footer>
      </div>
    </main>
  );
}
