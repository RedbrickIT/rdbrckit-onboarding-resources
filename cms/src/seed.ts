import type { Core } from '@strapi/strapi';

/**
 * Content of the original Figma design, used to populate a brand-new CMS.
 *
 * Link destinations are intentionally blank — the labels and grouping come
 * from the design, but the actual URLs and files have to be supplied through
 * the admin panel. The front end renders a link with no destination as an
 * inert pill, so the page looks right from the first boot.
 */
const SEED_SECTIONS = [
  {
    title: 'Email Signatures',
    order: 1,
    groups: [
      {
        label: 'Static Generators',
        note: 'For employees on Redbrick Shared Services, Delivra, and Shift, email signatures are managed automatically. You do not need to use one of these static generators.',
        links: [
          { label: 'Animoto' },
          { label: 'Leadpages' },
          { label: 'Westholme' },
        ],
      },
    ],
  },
  {
    title: 'Branding',
    order: 2,
    groups: [
      {
        label: 'Wallpapers',
        links: [
          { label: 'Redbrick 2025 (16:9)' },
          { label: 'Redbrick 2025 (16:10)' },
        ],
      },
      {
        label: 'Account Icons',
        // "Delivra" appears twice in the Figma design, once in each row.
        // Seeded as drawn; delete the duplicate in the admin if it was a typo.
        links: [
          { label: 'Redbrick' },
          { label: 'Animoto' },
          { label: 'Delivra' },
          { label: 'Leadpages' },
          { label: 'Shift' },
          { label: 'Delivra' },
          { label: 'Paved' },
        ],
      },
    ],
  },
];

const UID = 'api::resource-section.resource-section' as const;

/**
 * Populate the resource sections on first boot.
 *
 * Only ever runs against a completely empty collection, so it is safe to leave
 * enabled — it will not overwrite, duplicate, or resurrect edited content.
 * Set STRAPI_SKIP_SEED=true to disable it entirely.
 */
export async function seedResourceSections(strapi: Core.Strapi): Promise<void> {
  if (process.env.STRAPI_SKIP_SEED === 'true') return;

  const existing = await strapi.documents(UID).count({ status: 'draft' });
  if (existing > 0) return;

  strapi.log.info('[seed] Empty CMS — creating the resource sections.');

  for (const section of SEED_SECTIONS) {
    await strapi.documents(UID).create({
      data: section,
      status: 'published',
    });
  }

  strapi.log.info(
    `[seed] Created ${SEED_SECTIONS.length} resource sections.`
  );
}
