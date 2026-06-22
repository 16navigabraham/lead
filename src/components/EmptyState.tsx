import { RadarIcon } from "./icons";

/**
 * A composed, illustrative empty state — not a bare text block.
 * Renders a faux table skeleton behind a centered prompt so the
 * panel always reads as a designed surface, even with zero data.
 */
export function EmptyState() {
  return (
    <div className="relative overflow-hidden px-6 py-16 sm:py-24">
      {/* Ghosted faux-rows that hint at the data structure to come */}
      <div
        className="pointer-events-none absolute inset-0 flex flex-col gap-3 px-6 py-6 opacity-[0.35] [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]"
        aria-hidden="true"
      >
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-2.5 w-1/4 rounded bg-neutral-900" />
            <div className="h-2.5 w-1/6 rounded bg-neutral-900/70" />
            <div className="h-2.5 w-1/5 rounded bg-neutral-900/60" />
            <div className="ml-auto h-2.5 w-12 rounded bg-neutral-900/70" />
          </div>
        ))}
      </div>

      <div className="relative z-10 mx-auto flex max-w-sm flex-col items-center text-center">
        <div className="relative flex h-14 w-14 animate-float items-center justify-center rounded-2xl border border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md">
          <span className="absolute inset-0 rounded-2xl border border-neutral-700/50 animate-ping-ring" />
          <RadarIcon className="h-6 w-6 text-neutral-400" />
        </div>
        <h3 className="mt-5 text-base font-medium tracking-tight text-neutral-50">
          No leads extracted yet
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-neutral-400">
          Describe the businesses you&apos;re looking for — a niche and a
          location works best. Your structured results will appear here, ready
          to export.
        </p>
      </div>
    </div>
  );
}
