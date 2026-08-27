import type { CollectionConfig } from "payload";

/**
 * Admin panel accounts. Payload's `auth: true` supplies the email/password
 * fields, login, and session handling; the first user is created through the
 * admin's own onboarding screen.
 */
export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
    group: "System",
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
  ],
};
