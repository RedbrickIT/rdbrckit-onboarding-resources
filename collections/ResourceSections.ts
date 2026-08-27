import { revalidatePath } from "next/cache";
import type { CollectionConfig } from "payload";

/**
 * Bust the cached home page.
 *
 * Best-effort on purpose: revalidatePath needs a Next.js request context, so
 * it throws when Payload writes from outside one — the seed script, a
 * migration, `payload run`. There is no page cache to bust in those cases
 * anyway, so swallowing it is correct rather than merely convenient. A write
 * must never fail because the cache hint couldn't be delivered.
 */
function revalidateHome(): void {
  try {
    revalidatePath("/");
  } catch {
    // Not inside a request — nothing to revalidate.
  }
}

/**
 * A titled band of the onboarding page, e.g. "Email Signatures".
 *
 * The nesting mirrors the design exactly: a section holds labelled groups,
 * and a group holds the dark pill buttons. Adding a section or group here
 * adds it to the page — no code change needed.
 */
export const ResourceSections: CollectionConfig = {
  slug: "resource-sections",
  labels: {
    singular: "Resource Section",
    plural: "Resource Sections",
  },
  access: {
    // The onboarding page is public, so its content is readable without auth.
    // Writes still require an admin account.
    read: () => true,
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "order", "updatedAt"],
    group: "Page Content",
  },
  defaultSort: "order",
  /**
   * Publishing a change repaints the page immediately rather than waiting out
   * the ISR window. Because Payload runs inside this Next.js app, this is a
   * direct call — no webhook, no shared secret, no network hop.
   */
  hooks: {
    afterChange: [revalidateHome],
    afterDelete: [revalidateHome],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description: 'Section heading, e.g. "Branding".',
      },
    },
    {
      name: "order",
      type: "number",
      required: true,
      defaultValue: 0,
      admin: {
        description: "Sections render on the page in ascending order.",
      },
    },
    {
      name: "groups",
      type: "array",
      labels: { singular: "Group", plural: "Groups" },
      admin: {
        initCollapsed: true,
        description:
          "Each group renders as a small-caps label above a row of buttons.",
        components: {
          // Show the group's own label on the collapsed row instead of
          // "Group 01", "Group 02".
          RowLabel: "/components/admin/RowLabels#GroupRowLabel",
        },
      },
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
          admin: {
            description: 'Group label, e.g. "Wallpapers". Rendered in caps.',
          },
        },
        {
          name: "note",
          type: "textarea",
          admin: {
            description: "Optional italic note rendered above the group label.",
          },
        },
        {
          name: "links",
          type: "array",
          labels: { singular: "Link", plural: "Links" },
          admin: {
            initCollapsed: true,
            components: {
              // Show the button text on the collapsed row, plus a note when
              // the link has no destination yet.
              RowLabel: "/components/admin/RowLabels#LinkRowLabel",
            },
          },
          fields: [
            {
              name: "label",
              type: "text",
              required: true,
              admin: { description: "The button text." },
            },
            {
              name: "file",
              type: "upload",
              relationTo: "media",
              admin: {
                description:
                  "Upload to serve a download. Takes precedence over URL.",
              },
            },
            {
              name: "url",
              type: "text",
              admin: {
                description:
                  "External link, opened in a new tab. Ignored when a file is attached.",
              },
            },
          ],
        },
      ],
    },
  ],
};
