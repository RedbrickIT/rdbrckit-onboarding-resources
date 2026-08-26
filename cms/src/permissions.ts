import type { Core } from '@strapi/strapi';

/**
 * Grant the Public role read-only access to the resource sections.
 *
 * The onboarding page is a public website, so its content is public by
 * definition — without this, /api/resource-sections returns 403 until someone
 * ticks the boxes by hand in Settings -> Roles -> Public.
 *
 * The grant is deliberately narrow: `find` and `findOne` on this one content
 * type, and nothing else. Every other content type, and every write action,
 * stays locked down.
 *
 * To lock the content down instead, set STRAPI_SKIP_PUBLIC_READ=true, revoke
 * the two permissions in the admin, and give the front end a read-only API
 * token via STRAPI_API_TOKEN — it supports both.
 */
const ACTIONS = [
  'api::resource-section.resource-section.find',
  'api::resource-section.resource-section.findOne',
];

export async function grantPublicReadAccess(strapi: Core.Strapi): Promise<void> {
  if (process.env.STRAPI_SKIP_PUBLIC_READ === 'true') return;

  const publicRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (!publicRole) {
    strapi.log.warn('[permissions] No Public role found — skipping.');
    return;
  }

  for (const action of ACTIONS) {
    const existing = await strapi
      .query('plugin::users-permissions.permission')
      .findOne({ where: { action, role: publicRole.id } });

    if (existing) continue;

    await strapi
      .query('plugin::users-permissions.permission')
      .create({ data: { action, role: publicRole.id } });

    strapi.log.info(`[permissions] Granted Public: ${action}`);
  }
}
