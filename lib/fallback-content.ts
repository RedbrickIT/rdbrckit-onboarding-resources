import type { ResourceSection } from "./types";

/**
 * The exact content of the Figma design, used when Strapi is unreachable or
 * has no published sections yet.
 *
 * This keeps the site rendering the real layout during local development
 * before the CMS is seeded, and keeps a Strapi outage from turning the page
 * into a blank band. Every link here has a null destination, so the buttons
 * render inert until the URLs and files are filled in through the admin panel.
 *
 * Once Strapi returns published sections, this is never used.
 */
export const FALLBACK_SECTIONS: ResourceSection[] = [
  {
    id: "email-signatures",
    title: "Email Signatures",
    groups: [
      {
        id: "static-generators",
        label: "Static Generators",
        note: "For employees on Redbrick Shared Services, Delivra, and Shift, email signatures are managed automatically. You do not need to use one of these static generators.",
        links: [
          { id: "sig-animoto", label: "Animoto", url: null, fileUrl: null },
          { id: "sig-leadpages", label: "Leadpages", url: null, fileUrl: null },
          { id: "sig-westholme", label: "Westholme", url: null, fileUrl: null },
        ],
      },
    ],
  },
  {
    id: "branding",
    title: "Branding",
    groups: [
      {
        id: "wallpapers",
        label: "Wallpapers",
        note: null,
        links: [
          {
            id: "wp-16-9",
            label: "Redbrick 2025 (16:9)",
            url: null,
            fileUrl: null,
          },
          {
            id: "wp-16-10",
            label: "Redbrick 2025 (16:10)",
            url: null,
            fileUrl: null,
          },
        ],
      },
      {
        id: "account-icons",
        label: "Account Icons",
        note: null,
        // The Figma design lists "Delivra" twice, once in each row. Confirmed
        // as a typo: the second one is Duplex.
        links: [
          { id: "ai-redbrick", label: "Redbrick", url: null, fileUrl: null },
          { id: "ai-animoto", label: "Animoto", url: null, fileUrl: null },
          { id: "ai-delivra", label: "Delivra", url: null, fileUrl: null },
          { id: "ai-leadpages", label: "Leadpages", url: null, fileUrl: null },
          { id: "ai-shift", label: "Shift", url: null, fileUrl: null },
          { id: "ai-duplex", label: "Duplex", url: null, fileUrl: null },
          { id: "ai-paved", label: "Paved", url: null, fileUrl: null },
        ],
      },
    ],
  },
];
