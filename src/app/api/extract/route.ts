import { NextResponse } from "next/server";
import { MAX_PAGES } from "@/lib/config";

export const runtime = "nodejs";

/**
 * Shape of a single normalized lead returned to the client.
 * Every field carries a solid fallback so the UI never has to
 * guard against undefined values while rendering the grid.
 */
export interface Lead {
  name: string;
  phone: string;
  website: string;
  address: string;
  rating: string;
  reviews: string;
  category: string;
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
 * Raw place object as returned by the Serper Maps endpoint (partial).
 * We use /maps (not /places) because /places omits website, phone, and
 * often the address — /maps returns the full business record.
 */
interface SerperPlace {
  title?: string;
  phoneNumber?: string;
  website?: string;
  address?: string;
  rating?: number;
  ratingCount?: number;
  category?: string;
  type?: string;
  latitude?: number;
  longitude?: number;
  thumbnailUrl?: string;
  openingHours?: Record<string, string>;
  cid?: string;
}

interface SerperResponse {
  places?: SerperPlace[];
  /** Map center used for the search, e.g. "@19.02,72.86,12z". Required to paginate. */
  ll?: string;
}

export async function POST(request: Request) {
  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing SERPER_API_KEY. Add it to your .env file." },
      { status: 500 }
    );
  }

  let query = "";
  let page = 1;
  // Map center from a prior page-1 response; required by /maps to paginate.
  let ll = "";
  try {
    const body = await request.json();
    query = typeof body?.query === "string" ? body.query.trim() : "";
    ll = typeof body?.ll === "string" ? body.ll.trim() : "";
    // Clamp page to a sane range so we never hammer the provider.
    const requested = Number(body?.page);
    if (Number.isFinite(requested)) {
      page = Math.min(Math.max(Math.trunc(requested), 1), MAX_PAGES);
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Expected JSON with a `query` field." },
      { status: 400 }
    );
  }

  if (!query) {
    return NextResponse.json(
      { error: "Please provide a search query." },
      { status: 400 }
    );
  }

  // /maps requires the map center ("ll") to page past the first results.
  if (page > 1 && !ll) {
    return NextResponse.json(
      { error: "Pagination requires the map center from the first page." },
      { status: 400 }
    );
  }

  try {
    const payload: Record<string, unknown> = { q: query, page };
    if (ll) payload.ll = ll;

    const upstream = await fetch("https://google.serper.dev/maps", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      // Always hit the live API; results should reflect the current query.
      cache: "no-store",
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => "");
      return NextResponse.json(
        {
          error: `Lead provider responded with ${upstream.status}.`,
          detail: detail.slice(0, 500),
        },
        { status: 502 }
      );
    }

    const data = (await upstream.json()) as SerperResponse;
    const places = Array.isArray(data.places) ? data.places : [];

    const leads: Lead[] = places.map((place) => ({
      name: place.title?.trim() || "Unknown business",
      phone: place.phoneNumber?.trim() || "—",
      website: place.website?.trim() || "",
      address: place.address?.trim() || "—",
      rating:
        typeof place.rating === "number"
          ? place.rating.toFixed(1)
          : "—",
      reviews:
        typeof place.ratingCount === "number"
          ? place.ratingCount.toLocaleString("en-US")
          : "—",
      category: place.category?.trim() || place.type?.trim() || "—",
      latitude: typeof place.latitude === "number" ? place.latitude : null,
      longitude: typeof place.longitude === "number" ? place.longitude : null,
      thumbnail: place.thumbnailUrl?.trim() || "",
      hours:
        place.openingHours && Object.keys(place.openingHours).length > 0
          ? place.openingHours
          : null,
      cid: place.cid?.trim() || "",
    }));

    // More results likely exist if the provider filled the page AND we
    // haven't yet reached our own page ceiling.
    const hasMore = places.length > 0 && page < MAX_PAGES;

    return NextResponse.json({
      query,
      page,
      count: leads.length,
      leads,
      hasMore,
      // Echo the map center (from this response, or the one passed in) so the
      // client can request subsequent pages.
      ll: data.ll || ll || "",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach the lead provider. Please try again." },
      { status: 500 }
    );
  }
}
