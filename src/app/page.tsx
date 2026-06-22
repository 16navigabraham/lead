"use client";

import { useCallback, useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { EmptyState } from "@/components/EmptyState";
import { LeadsTable } from "@/components/LeadsTable";
import { LeadDetail } from "@/components/LeadDetail";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { CountUp } from "@/components/CountUp";
import { DownloadIcon } from "@/components/icons";
import { downloadCsv } from "@/lib/csv";
import type { ExtractResponse, Lead } from "@/lib/types";

export default function Home() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleExtract = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setSubmittedQuery(trimmed);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      const data = (await res.json()) as Partial<ExtractResponse> & {
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setLeads(data.leads ?? []);
    } catch (err) {
      setLeads([]);
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleDownload = useCallback(() => {
    if (leads.length === 0) return;
    downloadCsv(leads, submittedQuery || "leads");
  }, [leads, submittedQuery]);

  const showTable = !loading && leads.length > 0;
  const showEmpty = !loading && leads.length === 0;

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
                      lead{leads.length === 1 ? "" : "s"} for “{submittedQuery}”
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
