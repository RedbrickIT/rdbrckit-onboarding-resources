import type { ResourceGroup, ResourceLink, ResourceSection } from "./types";
import { FALLBACK_SECTIONS } from "./fallback-content";

/**
 * Read side of the Strapi integration.
 *
 * Only ever called from server components, so the API token stays on the
 * server and is never sent to the browser.
 */

const STRAPI_URL = (process.env.STRAPI_URL ?? "").replace(/\/+$/, "");
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN ?? "";

/** How long a fetched copy of the content stays fresh, in seconds. */
const REVALIDATE_SECONDS = 60;

/**
 * Deep-populate query. Strapi 5 returns only top-level fields by default, and
 * `populate=*` stops one level down — the nested components have to be spelled
 * out to reach `groups -> links -> file`.
 */
const QUERY =
  "sort=order:asc&populate[groups][populate][links][populate][file]=true";

/* -------------------------------------------------------------------------
 * Response parsing
 *
 * Everything below treats the payload as untrusted: each field is checked
 * before use so a content-model change in Strapi degrades to the fallback
 * instead of throwing at render time.
 * ---------------------------------------------------------------------- */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

/**
 * Strapi's local upload provider returns root-relative URLs ("/uploads/x.png").
 * Cloud providers (S3, Cloudinary) return absolute ones. Normalise both to an
 * absolute URL the browser can hit directly.
 */
function toAbsoluteMediaUrl(url: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return STRAPI_URL ? `${STRAPI_URL}${url}` : url;
}

function parseLink(raw: unknown, index: number): ResourceLink | null {
  if (!isRecord(raw)) return null;

  const label = asString(raw.label);
  if (!label) return null;

  const file = isRecord(raw.file) ? raw.file : null;

  return {
    id: String(raw.id ?? `link-${index}`),
    label,
    url: asString(raw.url),
    fileUrl: toAbsoluteMediaUrl(file ? asString(file.url) : null),
  };
}

function parseGroup(raw: unknown, index: number): ResourceGroup | null {
  if (!isRecord(raw)) return null;

  const label = asString(raw.label);
  if (!label) return null;

  const links = Array.isArray(raw.links)
    ? raw.links
        .map((link, i) => parseLink(link, i))
        .filter((link): link is ResourceLink => link !== null)
    : [];

  // A group with no links would render as a bare label above an empty grid.
  if (links.length === 0) return null;

  return {
    id: String(raw.id ?? `group-${index}`),
    label,
    note: asString(raw.note),
    links,
  };
}

function parseSection(raw: unknown, index: number): ResourceSection | null {
  if (!isRecord(raw)) return null;

  const title = asString(raw.title);
  if (!title) return null;

  const groups = Array.isArray(raw.groups)
    ? raw.groups
        .map((group, i) => parseGroup(group, i))
        .filter((group): group is ResourceGroup => group !== null)
    : [];

  if (groups.length === 0) return null;

  return {
    id: String(raw.documentId ?? raw.id ?? `section-${index}`),
    title,
    groups,
  };
}

/* ---------------------------------------------------------------------- */

/**
 * Fetch the published resource sections, ordered by their `order` field.
 *
 * Falls back to the design's own content if Strapi isn't configured, can't be
 * reached, or has nothing published yet. The page always renders.
 */
export async function getResourceSections(): Promise<ResourceSection[]> {
  if (!STRAPI_URL) {
    console.warn(
      "[strapi] STRAPI_URL is not set — rendering fallback content. " +
        "See web/.env.local.example.",
    );
    return FALLBACK_SECTIONS;
  }

  try {
    const response = await fetch(
      `${STRAPI_URL}/api/resource-sections?${QUERY}`,
      {
        headers: STRAPI_API_TOKEN
          ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
          : {},
        next: { revalidate: REVALIDATE_SECONDS, tags: ["resource-sections"] },
      },
    );

    if (!response.ok) {
      console.warn(
        `[strapi] ${response.status} ${response.statusText} from ` +
          "/api/resource-sections — rendering fallback content.",
      );
      return FALLBACK_SECTIONS;
    }

    const payload: unknown = await response.json();
    const data = isRecord(payload) ? payload.data : null;

    if (!Array.isArray(data)) {
      console.warn(
        "[strapi] Unexpected response shape — rendering fallback content.",
      );
      return FALLBACK_SECTIONS;
    }

    const sections = data
      .map((section, i) => parseSection(section, i))
      .filter((section): section is ResourceSection => section !== null);

    if (sections.length === 0) {
      console.warn(
        "[strapi] No published sections found — rendering fallback content.",
      );
      return FALLBACK_SECTIONS;
    }

    return sections;
  } catch (error) {
    console.warn(
      "[strapi] Request failed — rendering fallback content.",
      error instanceof Error ? error.message : error,
    );
    return FALLBACK_SECTIONS;
  }
}
