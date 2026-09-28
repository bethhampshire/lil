import type { Core } from '@strapi/strapi';

/**
 * Strapi's users-permissions JWTs stay valid until they expire, even after an
 * admin changes the user's password. We record when each password changes so
 * the `global::is-current-session` policy can reject tokens issued before it.
 */

const store = (strapi: Core.Strapi) => strapi.store({ type: 'plugin', name: 'password-changes' });
const key = (userId: number | string) => `user-${userId}`;

export async function recordPasswordChange(strapi: Core.Strapi, userId: number | string) {
  await store(strapi).set({ key: key(userId), value: Date.now() });
}

export async function getPasswordChangedAt(strapi: Core.Strapi, userId: number | string) {
  const value = await store(strapi).get({ key: key(userId) });
  return typeof value === 'number' ? value : null;
}

export function watchPasswordChanges(strapi: Core.Strapi) {
  strapi.db.lifecycles.subscribe({
    models: ['plugin::users-permissions.user'],
    async afterUpdate(event) {
      const data = event.params.data as Record<string, unknown> | undefined;
      const id = (event.result as { id?: number } | undefined)?.id;
      if (data?.password && id !== undefined) {
        await recordPasswordChange(strapi, id);
      }
    },
  });
}
