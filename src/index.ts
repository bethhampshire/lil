import type { Core } from '@strapi/strapi';
import { watchPasswordChanges } from './auth/password-changes';

// Endpoints the public website needs. Intro call requests are create-only so
// submitted client details can never be read back through the public API.
const PUBLIC_ACTIONS = [
  'api::page.page.find',
  'api::page.page.findOne',
  'api::intro-call.intro-call.create',
];

// Users with the Therapist role can sign in to the website's /requests page.
const THERAPIST_ROLE = {
  type: 'therapist',
  name: 'Therapist',
  description: 'Can view intro call requests and update their status and booked date.',
};
const THERAPIST_ACTIONS = [
  'api::intro-call.intro-call.find',
  'api::intro-call.intro-call.findOne',
  'api::intro-call.intro-call.update',
];

async function grant(strapi: Core.Strapi, roleId: number, actions: string[]) {
  for (const action of actions) {
    const existing = await strapi.db
      .query('plugin::users-permissions.permission')
      .findOne({ where: { action, role: roleId } });

    if (!existing) {
      await strapi.db
        .query('plugin::users-permissions.permission')
        .create({ data: { action, role: roleId } });
    }
  }
}

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
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    watchPasswordChanges(strapi);

    const roles = strapi.db.query('plugin::users-permissions.role');

    const publicRole = await roles.findOne({ where: { type: 'public' } });
    if (publicRole) {
      await grant(strapi, publicRole.id, PUBLIC_ACTIONS);
    }

    let therapistRole = await roles.findOne({ where: { type: THERAPIST_ROLE.type } });
    if (!therapistRole) {
      therapistRole = await roles.create({ data: THERAPIST_ROLE });

      // First run: turn off public sign-up. Accounts are created by an admin in
      // Content Manager → User. (Can be re-enabled in Settings → Advanced settings.)
      const upStore = strapi.store({ type: 'plugin', name: 'users-permissions' });
      const advanced = ((await upStore.get({ key: 'advanced' })) ?? {}) as Record<string, unknown>;
      await upStore.set({ key: 'advanced', value: { ...advanced, allow_register: false } });
    }
    await grant(strapi, therapistRole.id, THERAPIST_ACTIONS);
  },
};
