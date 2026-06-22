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
}

export interface ExtractResponse {
  query: string;
  count: number;
  leads: Lead[];
}
