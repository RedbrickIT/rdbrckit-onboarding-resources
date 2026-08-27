import { getPayload } from "payload";
import config from "@payload-config";

import type { Media, ResourceSection as PayloadSection } from "@/payload-types";
import type { ResourceGroup, ResourceLink, ResourceSection } from "./types";
import { FALLBACK_SECTIONS } from "./fallback-content";

/**
 * Read side of the CMS.
 *
 * Payload runs inside this Next.js app, so this talks to the database
 * directly through the Local API — no HTTP hop, no API token, no CORS.
 * Server components only.
 */

/** Deep enough to resolve the uploaded file on each link. */
const POPULATE_DEPTH = 2;

/**
 * A link's `file` is a Media document once populated, or a bare row id if it
 * wasn't. Only the populated form carries a URL worth rendering.
 */
function fileUrlOf(file: PayloadLink["file"]): string | null {
  if (!file || typeof file === "number") return null;
  const media = file as Media;
  return media.url && media.url.trim() !== "" ? media.url : null;
}

type PayloadGroup = NonNullable<PayloadSection["groups"]>[number];
type PayloadLink = NonNullable<PayloadGroup["links"]>[number];

function mapLink(link: PayloadLink, index: number): ResourceLink {
  return {
    id: link.id ?? `link-${index}`,
    label: link.label,
    url: link.url?.trim() ? link.url : null,
    fileUrl: fileUrlOf(link.file),
  };
}

function mapGroup(group: PayloadGroup, index: number): ResourceGroup | null {
  const links = (group.links ?? []).map(mapLink);

  // A group with no links would render as a bare label above an empty grid.
  if (links.length === 0) return null;

  return {
    id: group.id ?? `group-${index}`,
    label: group.label,
    note: group.note?.trim() ? group.note : null,
    links,
  };
}

function mapSection(section: PayloadSection): ResourceSection | null {
  const groups = (section.groups ?? [])
    .map(mapGroup)
    .filter((group): group is ResourceGroup => group !== null);

  if (groups.length === 0) return null;

  return {
    id: String(section.id),
    title: section.title,
    groups,
  };
}

/**
 * Fetch the resource sections in display order.
 *
 * Falls back to the design's own content if the CMS has nothing in it yet or
 * the database can't be reached, so the page always renders something.
 */
export async function getResourceSections(): Promise<ResourceSection[]> {
  try {
    const payload = await getPayload({ config });

    const { docs } = await payload.find({
      collection: "resource-sections",
      sort: "order",
      depth: POPULATE_DEPTH,
      limit: 100,
      // This is public page content; skip the access-control layer rather
      // than pretending to be a logged-in user.
      overrideAccess: true,
    });

    const sections = docs
      .map(mapSection)
      .filter((section): section is ResourceSection => section !== null);

    if (sections.length === 0) {
      console.warn(
        "[cms] No resource sections found — rendering fallback content. " +
          "Run `npm run seed` to populate them.",
      );
      return FALLBACK_SECTIONS;
    }

    return sections;
  } catch (error) {
    console.warn(
      "[cms] Query failed — rendering fallback content.",
      error instanceof Error ? error.message : error,
    );
    return FALLBACK_SECTIONS;
  }
}
