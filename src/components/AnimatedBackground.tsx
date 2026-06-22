/**
 * Ambient, GPU-friendly backdrop: a masked moving grid plus two slowly
 * drifting aurora blobs. Purely decorative and pointer-transparent, so it
 * never interferes with the UI. Stays monochrome to honor the brand.
 */
export function AnimatedBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* Engineered grid */}
      <div className="absolute inset-0 bg-grid" />

      {/* Drifting aurora blobs */}
      <div
        className="aurora-blob aurora left-1/2 top-[-10rem] h-[28rem] w-[28rem] -translate-x-1/2 animate-aurora bg-neutral-700/30"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="aurora-blob aurora left-[12%] top-[18%] h-[20rem] w-[20rem] animate-aurora bg-neutral-600/20"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="aurora-blob aurora right-[8%] top-[8%] h-[22rem] w-[22rem] animate-aurora bg-neutral-500/15"
        style={{ animationDelay: "-12s" }}
      />
    </div>
  );
}
