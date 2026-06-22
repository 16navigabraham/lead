"use client";

import { useEffect } from "react";
import type { Lead } from "@/lib/types";
import {
  ClockIcon,
  CloseIcon,
  ExternalLinkIcon,
  GlobeIcon,
  MapPinIcon,
  PhoneIcon,
  StarIcon,
} from "./icons";

interface LeadDetailProps {
  lead: Lead | null;
  onClose: () => void;
}

function prettyHost(website: string): string {
  return website
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
}

/** Keyless OpenStreetMap embed centered on the lead's coordinates. */
function osmEmbedUrl(lat: number, lon: number): string {
  const d = 0.006; // ~600m bounding box for a tight, street-level frame
  const bbox = [lon - d, lat - d, lon + d, lat + d].join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
}

function mapsLink(lead: Lead): string {
  // CID resolves to the exact Google Maps listing — most precise option.
  if (lead.cid) return `https://www.google.com/maps?cid=${lead.cid}`;
  if (lead.latitude != null && lead.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${lead.latitude}%2C${lead.longitude}`;
  }
  const q = encodeURIComponent(`${lead.name} ${lead.address}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 px-6 py-4">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-800/80 bg-neutral-900/60 text-neutral-400">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
          {label}
        </p>
        <div className="mt-1 text-sm text-neutral-200">{children}</div>
      </div>
    </div>
  );
}

export function LeadDetail({ lead, onClose }: LeadDetailProps) {
  const open = lead !== null;

  // Close on Escape and lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* Scrim */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-neutral-950/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={lead ? `Details for ${lead.name}` : undefined}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-neutral-800/80 bg-neutral-950 shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {lead && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-neutral-800/80 px-6 py-5">
              <div className="min-w-0">
                {lead.category !== "—" && (
                  <span className="inline-block rounded-full border border-neutral-800/80 bg-neutral-900/60 px-2.5 py-0.5 text-[11px] text-neutral-400">
                    {lead.category}
                  </span>
                )}
                <h2 className="mt-2 truncate text-lg font-semibold tracking-tight text-neutral-50">
                  {lead.name}
                </h2>
                {lead.rating !== "—" && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-neutral-400">
                    <StarIcon className="h-3.5 w-3.5 text-neutral-50" />
                    <span className="font-mono tabular-nums text-neutral-200">
                      {lead.rating}
                    </span>
                    {lead.reviews !== "—" && <span>· {lead.reviews} reviews</span>}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 rounded-lg border border-neutral-800/80 bg-neutral-900/60 p-2 text-neutral-400 transition hover:border-neutral-700 hover:text-neutral-100 active:scale-[0.96]"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {/* Photo */}
              {lead.thumbnail && (
                <div className="px-6 pt-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={lead.thumbnail}
                    alt={`Photo of ${lead.name}`}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="h-40 w-full rounded-xl border border-neutral-800/80 object-cover"
                  />
                </div>
              )}

              {/* Map card */}
              <div className="px-6 pt-6">
                <div className="relative overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-900/40">
                  {lead.latitude != null && lead.longitude != null ? (
                    <iframe
                      title={`Map of ${lead.name}`}
                      src={osmEmbedUrl(lead.latitude, lead.longitude)}
                      className="h-48 w-full grayscale-[35%] contrast-110 [color-scheme:light]"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <div className="flex h-48 w-full flex-col items-center justify-center gap-2 text-neutral-600">
                      <MapPinIcon className="h-6 w-6" />
                      <span className="text-[13px]">No coordinates available</span>
                    </div>
                  )}
                  <a
                    href={mapsLink(lead)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg border border-neutral-700/80 bg-neutral-950/80 px-2.5 py-1.5 text-[12px] font-medium text-neutral-200 backdrop-blur-md transition hover:bg-neutral-900"
                  >
                    Open in Maps
                    <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Detail rows */}
              <div className="mt-4 divide-y divide-neutral-800/60">
                <DetailRow icon={<MapPinIcon className="h-4 w-4" />} label="Address">
                  {lead.address}
                </DetailRow>

                <DetailRow icon={<PhoneIcon className="h-4 w-4" />} label="Phone">
                  {lead.phone === "—" ? (
                    <span className="text-neutral-600">Not listed</span>
                  ) : (
                    <a
                      href={`tel:${lead.phone.replace(/\s+/g, "")}`}
                      className="font-mono text-[13px] text-neutral-200 transition hover:text-neutral-50"
                    >
                      {lead.phone}
                    </a>
                  )}
                </DetailRow>

                <DetailRow icon={<GlobeIcon className="h-4 w-4" />} label="Website">
                  {lead.website ? (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-zinc-400 underline-offset-4 transition hover:text-white hover:underline"
                    >
                      <span className="truncate">{prettyHost(lead.website)}</span>
                      <ExternalLinkIcon className="h-3 w-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-neutral-600">Not listed</span>
                  )}
                </DetailRow>

                {lead.hours && (
                  <DetailRow
                    icon={<ClockIcon className="h-4 w-4" />}
                    label="Opening hours"
                  >
                    <dl className="space-y-1">
                      {Object.entries(lead.hours).map(([day, time]) => (
                        <div
                          key={day}
                          className="flex justify-between gap-4 text-[13px]"
                        >
                          <dt className="text-neutral-400">{day}</dt>
                          <dd className="tabular-nums text-neutral-200">
                            {time}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </DetailRow>
                )}
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center gap-3 border-t border-neutral-800/80 px-6 py-4">
              <a
                href={`tel:${lead.phone.replace(/\s+/g, "")}`}
                aria-disabled={lead.phone === "—"}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-800/80 bg-neutral-900/60 px-4 py-2.5 text-[13px] font-medium text-neutral-200 transition hover:border-neutral-700 hover:bg-neutral-800/60 active:scale-[0.98] ${
                  lead.phone === "—" ? "pointer-events-none opacity-40" : ""
                }`}
              >
                <PhoneIcon className="h-4 w-4" />
                Call
              </a>
              <a
                href={lead.website || mapsLink(lead)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-neutral-50 px-4 py-2.5 text-[13px] font-medium text-neutral-950 transition hover:bg-neutral-200 active:scale-[0.98]"
              >
                {lead.website ? "Visit Site" : "View Map"}
                <ExternalLinkIcon className="h-4 w-4" />
              </a>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
