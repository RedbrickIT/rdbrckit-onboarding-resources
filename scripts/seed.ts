import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Populate the CMS with the content of the Figma design.
 *
 * Run with `npm run seed`. Idempotent by refusing to run when the collection
 * already holds anything, so it can never duplicate or clobber edited content.
 *
 * Link destinations are left blank on purpose — the labels and grouping come
 * from the design, but the URLs and files have to be supplied through the
 * admin. The page renders a link with no destination as an inert pill.
 */
const SEED_SECTIONS = [
  {
    title: "Email Signatures",
    order: 1,
    groups: [
      {
        label: "Static Generators",
        note: "For employees on Redbrick Shared Services, Delivra, and Shift, email signatures are managed automatically. You do not need to use one of these static generators.",
        links: [
          { label: "Animoto" },
          { label: "Leadpages" },
          { label: "Westholme" },
        ],
      },
    ],
  },
  {
    title: "Branding",
    order: 2,
    groups: [
      {
        label: "Wallpapers",
        links: [
          { label: "Redbrick 2025 (16:9)" },
          { label: "Redbrick 2025 (16:10)" },
        ],
      },
      {
        label: "Account Icons",
        // The Figma design lists "Delivra" twice, once in each row. Confirmed
        // as a typo: the second one is Duplex.
        links: [
          { label: "Redbrick" },
          { label: "Animoto" },
          { label: "Delivra" },
          { label: "Leadpages" },
          { label: "Shift" },
          { label: "Duplex" },
          { label: "Paved" },
        ],
      },
    ],
  },
];

const payload = await getPayload({ config });

const existing = await payload.count({ collection: "resource-sections" });

if (existing.totalDocs > 0) {
  payload.logger.info(
    `Found ${existing.totalDocs} existing resource sections — nothing to do.`,
  );
} else {
  for (const section of SEED_SECTIONS) {
    await payload.create({ collection: "resource-sections", data: section });
    payload.logger.info(`Created section: ${section.title}`);
  }
  payload.logger.info(`Seeded ${SEED_SECTIONS.length} resource sections.`);
}

process.exit(0);
