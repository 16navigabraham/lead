import type { Lead } from "./types";

/** RFC-4180-safe escaping: wrap in quotes and double any inner quotes. */
function escapeCell(value: string): string {
  const needsQuoting = /[",\n\r]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuoting ? `"${escaped}"` : escaped;
}

/** Turn the lead array into a clean CSV string with a header row. */
export function leadsToCsv(leads: Lead[]): string {
  const headers = [
    "Name",
    "Category",
    "Phone",
    "Website",
    "Address",
    "Rating",
    "Reviews",
    "Latitude",
    "Longitude",
  ];
  const rows = leads.map((lead) =>
    [
      lead.name,
      lead.category,
      lead.phone,
      lead.website,
      lead.address,
      lead.rating,
      lead.reviews,
      lead.latitude?.toString() ?? "",
      lead.longitude?.toString() ?? "",
    ]
      .map(escapeCell)
      .join(",")
  );
  return [headers.join(","), ...rows].join("\r\n");
}

/**
 * Client-side, dependency-free CSV download via a Blob + object URL.
 * Cleans up the temporary anchor and URL immediately after triggering.
 */
export function downloadCsv(leads: Lead[], query: string): void {
  const csv = leadsToCsv(leads);
  // Prepend a BOM so Excel renders UTF-8 characters correctly.
  const blob = new Blob(["﻿", csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);

  const slug =
    query
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "leads";

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${slug}-leads.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
