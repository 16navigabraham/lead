export interface Lead {
  name: string;
  phone: string;
  website: string;
  address: string;
  rating: string;
  /** Number of reviews backing the rating, as a display string ("—" when absent). */
  reviews: string;
  /** Business category, e.g. "Dental clinic" ("—" when absent). */
  category: string;
  /** Geo coordinates for the map card; null when the provider omits them. */
  latitude: number | null;
  longitude: number | null;
  /** Photo thumbnail URL ("" when absent). */
  thumbnail: string;
  /** Opening hours keyed by day, or null when absent. */
  hours: Record<string, string> | null;
  /** Google Maps CID for a precise place link ("" when absent). */
  cid: string;
}

/**
 * Stable identity for a lead used to dedupe across paginated fetches.
 * Coordinates are most reliable; otherwise fall back to name + address.
 */
export function leadKey(lead: Lead): string {
  if (lead.latitude != null && lead.longitude != null) {
    return `geo:${lead.latitude.toFixed(5)},${lead.longitude.toFixed(5)}`;
  }
  return `na:${lead.name.toLowerCase()}|${lead.address.toLowerCase()}`;
}

/** Append `incoming` to `existing`, skipping any leads already present. */
export function mergeLeads(existing: Lead[], incoming: Lead[]): Lead[] {
  const seen = new Set(existing.map(leadKey));
  const merged = [...existing];
  for (const lead of incoming) {
    const key = leadKey(lead);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(lead);
    }
  }
  return merged;
}

export interface ExtractResponse {
  query: string;
  page: number;
  count: number;
  leads: Lead[];
  hasMore: boolean;
  /** Map center to reuse when paginating subsequent pages. */
  ll: string;
}
