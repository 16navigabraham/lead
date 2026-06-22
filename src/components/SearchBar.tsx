"use client";

import { type FormEvent } from "react";
import { ArrowRightIcon, SearchIcon, SpinnerIcon } from "./icons";

interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function SearchBar({
  query,
  onQueryChange,
  onSubmit,
  loading,
}: SearchBarProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!loading && query.trim()) onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="e.g. Dental clinics in Austin, Texas"
            spellCheck={false}
            autoComplete="off"
            className="w-full rounded-xl border border-neutral-800/80 bg-neutral-900/50 py-3.5 pl-11 pr-4 text-[15px] text-neutral-50 placeholder:text-neutral-500 outline-none backdrop-blur-md transition-all duration-200 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-700"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-neutral-50 px-5 py-3.5 text-[15px] font-medium text-neutral-950 transition duration-200 hover:bg-neutral-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
        >
          {loading ? (
            <>
              <SpinnerIcon className="h-4 w-4" />
              Extracting
            </>
          ) : (
            <>
              Extract Leads
              <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
