import { NextResponse } from "next/server";

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
}

/** Raw place object as returned by the Serper Places endpoint (partial). */
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
}

interface SerperResponse {
  places?: SerperPlace[];
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
  try {
    const body = await request.json();
    query = typeof body?.query === "string" ? body.query.trim() : "";
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

  try {
    const upstream = await fetch("https://google.serper.dev/places", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query }),
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
    }));

    return NextResponse.json({ query, count: leads.length, leads });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach the lead provider. Please try again." },
      { status: 500 }
    );
  }
}
