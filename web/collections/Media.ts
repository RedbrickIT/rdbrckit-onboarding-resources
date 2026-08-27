import type { CollectionConfig } from "payload";

/**
 * Uploaded files — wallpapers, account icons, anything a resource button
 * hands to the user.
 *
 * No image resizing is configured on purpose: wallpapers need to keep their
 * exact dimensions, and icons are handed over as-is. Payload would otherwise
 * be free to re-encode them.
 */
export const Media: CollectionConfig = {
  slug: "media",
  access: {
    // Files are linked from a public page, so they have to be publicly
    // readable. Everything else stays behind admin auth.
    read: () => true,
  },
  admin: {
    group: "System",
  },
  upload: {
    mimeTypes: ["image/*", "application/pdf", "application/zip"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      admin: {
        description:
          "Describes the file for screen readers. Optional for downloads.",
      },
    },
  ],
};
