import type { Core } from '@strapi/strapi';
import { seedResourceSections } from './seed';
import { grantPublicReadAccess } from './permissions';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * Seeds the page content the first time this runs against an empty
   * database, and makes sure the Public role can read it. Both steps are
   * idempotent, so they are safe on every boot.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Neither step should ever stop the CMS from starting.
    try {
      await seedResourceSections(strapi);
    } catch (error) {
      strapi.log.error('[seed] Failed to seed resource sections.');
      strapi.log.error(error);
    }

    try {
      await grantPublicReadAccess(strapi);
    } catch (error) {
      strapi.log.error('[permissions] Failed to grant public read access.');
      strapi.log.error(error);
    }
  },
};
