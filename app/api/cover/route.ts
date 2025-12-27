
// app/api/cover/route.ts
import { NextResponse } from "next/server";

type GoogleBooksVolume = {
  volumeInfo?: {
    title?: string;
    authors?: string[];
    industryIdentifiers?: { type: string; identifier: string }[];
    imageLinks?: {
      smallThumbnail?: string;
      thumbnail?: string;
    };
  };
};

type OpenLibrarySearchDoc = {
  cover_i?: number;
  isbn?: string[];
};

const PLACEHOLDER = "https://placehold.co/300x450?text=No+Cover";

function buildOpenLibraryCoverFromIsbn(isbn: string, size: string) {
  const s = size.toUpperCase(); // S | M | L
  return `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-${s}.jpg`;
}

function buildOpenLibraryCoverFromId(coverId: number, size: string) {
  const s = size.toUpperCase();
  return `https://covers.openlibrary.org/b/id/${coverId}-${s}.jpg`;
}

function normalizeGoogleThumb(url?: string) {
  if (!url) return undefined;
  // Google sometimes returns http, switch to https
  return url.replace(/^http:/, "https:");
}

async function searchGoogleBooksForTitle(title: string, key?: string) {
  const q = encodeURIComponent(title);
  const api = key
    ? `https://www.googleapis.com/books/v1/volumes?q=intitle:${q}&maxResults=1&key=${key}`
    : `https://www.googleapis.com/books/v1/volumes?q=intitle:${q}&maxResults=1`;

  const res = await fetch(api, { cache: "no-store" });
  if (!res.ok) return null;

  const data = (await res.json()) as { items?: GoogleBooksVolume[] };
  const item = data.items?.[0];
  if (!item?.volumeInfo) return null;

  const identifiers = item.volumeInfo.industryIdentifiers || [];
  const isbn13 = identifiers.find((id) => id.type === "ISBN_13")?.identifier;
  const isbn10 = identifiers.find((id) => id.type === "ISBN_10")?.identifier;
  const thumb =
    normalizeGoogleThumb(item.volumeInfo.imageLinks?.thumbnail) ||
    normalizeGoogleThumb(item.volumeInfo.imageLinks?.smallThumbnail);

  return {
    isbn: isbn13 || isbn10,
    thumbnail: thumb,
    source: "google",
  };
}

async function searchOpenLibraryForTitle(title: string) {
  const q = encodeURIComponent(title);
  const url = `https://openlibrary.org/search.json?title=${q}&limit=1`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;

  const data = (await res.json()) as { docs?: OpenLibrarySearchDoc[] };
  const doc = data.docs?.[0];
  if (!doc) return null;

  const isbn = doc.isbn?.[0];
  const coverId = doc.cover_i;

  return {
    isbn,
    coverId,
    source: "openlibrary",
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // Inputs
  const isbn = searchParams.get("isbn");
  const title = searchParams.get("title");
  const size = (searchParams.get("size") || "M").toUpperCase(); // S | M | L
  const format = (searchParams.get("format") || "image").toLowerCase(); // "image" | "json"

  let coverUrl: string | null = null;
  let resolvedIsbn: string | null = null;
  let source: "google" | "openlibrary" | "direct" | "none" = "none";

  try {
    // 1) If ISBN is provided, use Open Library directly
    if (isbn) {
      resolvedIsbn = isbn;
      coverUrl = buildOpenLibraryCoverFromIsbn(isbn, size);
      source = "openlibrary";
    }

    // 2) If no ISBN and we have a title, try Google Books first
    if (!coverUrl && title) {
      const google = await searchGoogleBooksForTitle(title, process.env.GOOGLE_BOOKS_API_KEY);
      if (google) {
        if (google.thumbnail) {
          coverUrl = google.thumbnail;
          source = "google";
        }
        if (!coverUrl && google.isbn) {
          resolvedIsbn = google.isbn;
          coverUrl = buildOpenLibraryCoverFromIsbn(google.isbn, size);
          source = "openlibrary";
        }
      }
    }

    // 3) If still no cover, try Open Library search by title
    if (!coverUrl && title) {
      const ol = await searchOpenLibraryForTitle(title);
      if (ol?.isbn) {
        resolvedIsbn = ol.isbn;
        coverUrl = buildOpenLibraryCoverFromIsbn(ol.isbn, size);
        source = "openlibrary";
      } else if (ol?.coverId) {
        coverUrl = buildOpenLibraryCoverFromId(ol.coverId, size);
        source = "openlibrary";
      }
    }

    // 4) Final fallback
    if (!coverUrl) {
      coverUrl = PLACEHOLDER;
      source = "none";
    }

    // If caller requested metadata, return JSON instead of image
    if (format === "json") {
      return NextResponse.json({
        ok: !!coverUrl,
        isbn: resolvedIsbn,
        source,
        coverUrl,
      });
    }

    // Proxy the image (avoids CORS issues)
    const imgRes = await fetch(coverUrl);
    if (!imgRes.ok) {
      const phRes = await fetch(PLACEHOLDER);
      const buf = await phRes.arrayBuffer();
      return new NextResponse(buf, {
        status: 200,
        headers: {
          "Content-Type": phRes.headers.get("content-type") || "image/png",
          "Cache-Control": "public, max-age=86400",
          "X-Cover-Source": source,
        },
      });
    }

    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    const buf = await imgRes.arrayBuffer();

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
        "X-Cover-Source": source,
        ...(resolvedIsbn ? { "X-ISBN": resolvedIsbn } : {}),
      },
    });
  } catch (err) {
    console.error("Cover route error:", err);
    // Defensive fallback
    const phRes = await fetch(PLACEHOLDER);
    const buf = await phRes.arrayBuffer();
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": phRes.headers.get("content-type") || "image/png",
        "Cache-Control": "public, max-age=3600",
        "X-Cover-Source": "error",
      },
    });
  }
}
