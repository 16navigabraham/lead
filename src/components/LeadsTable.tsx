import type { Lead } from "@/lib/types";
import { ArrowRightIcon, ExternalLinkIcon, StarIcon } from "./icons";

/** Strip protocol + trailing slash so website cells stay compact. */
function prettyHost(website: string): string {
  return website
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
}

function ratingTone(rating: string): string {
  const value = Number.parseFloat(rating);
  if (Number.isNaN(value)) return "text-neutral-500";
  if (value >= 4.5) return "text-neutral-50";
  if (value >= 4.0) return "text-neutral-300";
  return "text-neutral-400";
}

const headerCell =
  "px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500";

interface LeadsTableProps {
  leads: Lead[];
  onSelect: (lead: Lead) => void;
}

export function LeadsTable({ leads, onSelect }: LeadsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-neutral-800/80">
            <th className={`${headerCell} w-[28%]`}>Business</th>
            <th className={`${headerCell} w-[15%]`}>Phone</th>
            <th className={`${headerCell} w-[19%]`}>Website</th>
            <th className={`${headerCell} w-[26%]`}>Address</th>
            <th className={`${headerCell} w-[8%] text-right`}>Rating</th>
            <th className={`${headerCell} w-[4%]`}>
              <span className="sr-only">Details</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/60">
          {leads.map((lead, i) => (
            <tr
              key={`${lead.name}-${i}`}
              onClick={() => onSelect(lead)}
              style={{ animationDelay: `${Math.min(i * 45, 600)}ms` }}
              className="group cursor-pointer animate-fade-up opacity-0 transition-colors hover:bg-neutral-900/40"
            >
              <td className="max-w-0 px-6 py-4">
                <p className="truncate font-medium text-neutral-50">
                  {lead.name}
                </p>
                {lead.category !== "—" && (
                  <p className="mt-0.5 truncate text-[12px] text-neutral-500">
                    {lead.category}
                  </p>
                )}
              </td>

              <td className="px-6 py-4">
                {lead.phone === "—" ? (
                  <span className="text-neutral-600">—</span>
                ) : (
                  <a
                    href={`tel:${lead.phone.replace(/\s+/g, "")}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-mono text-[13px] text-neutral-300 transition-colors hover:text-neutral-50"
                  >
                    {lead.phone}
                  </a>
                )}
              </td>

              <td className="max-w-0 px-6 py-4">
                {lead.website ? (
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex max-w-full items-center gap-1.5 text-zinc-400 underline-offset-4 transition hover:text-white hover:underline"
                  >
                    <span className="truncate">{prettyHost(lead.website)}</span>
                    <ExternalLinkIcon className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                ) : (
                  <span className="text-neutral-600">—</span>
                )}
              </td>

              <td className="max-w-0 px-6 py-4">
                <p className="truncate text-neutral-400">{lead.address}</p>
              </td>

              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-1">
                  {lead.rating === "—" ? (
                    <span className="text-neutral-600">—</span>
                  ) : (
                    <>
                      <StarIcon
                        className={`h-3.5 w-3.5 ${ratingTone(lead.rating)}`}
                      />
                      <span
                        className={`font-mono text-[13px] tabular-nums ${ratingTone(
                          lead.rating
                        )}`}
                      >
                        {lead.rating}
                      </span>
                      {lead.reviews !== "—" && (
                        <span className="ml-1 text-[11px] tabular-nums text-neutral-600">
                          ({lead.reviews})
                        </span>
                      )}
                    </>
                  )}
                </div>
              </td>

              <td className="px-6 py-4 text-right">
                <ArrowRightIcon className="ml-auto h-4 w-4 text-neutral-700 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-neutral-300" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
