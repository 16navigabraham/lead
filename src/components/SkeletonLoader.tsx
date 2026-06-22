/**
 * Elegant pulsing skeleton grid shown while extraction is in flight.
 * Mirrors the real table's column rhythm so the transition feels seamless.
 */
export function SkeletonLoader() {
  return (
    <div className="divide-y divide-neutral-800/60" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="shimmer-sweep grid grid-cols-12 items-center gap-4 px-6 py-4"
        >
          <div className="col-span-3 space-y-2">
            <div className="h-3.5 w-4/5 animate-pulse rounded bg-neutral-900" />
            <div className="h-2.5 w-1/3 animate-pulse rounded bg-neutral-900/70" />
          </div>
          <div className="col-span-2">
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-neutral-900" />
          </div>
          <div className="col-span-2">
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-neutral-900" />
          </div>
          <div className="col-span-3">
            <div className="h-3.5 w-11/12 animate-pulse rounded bg-neutral-900" />
          </div>
          <div className="col-span-2 flex justify-end">
            <div className="h-3.5 w-10 animate-pulse rounded bg-neutral-900" />
          </div>
        </div>
      ))}
    </div>
  );
}
