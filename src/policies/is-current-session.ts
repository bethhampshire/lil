/**
 * Rejects users-permissions tokens that were issued before the user's
 * password was last changed, so changing a password in Strapi logs out
 * every existing session for that user.
 */

import type { Core } from '@strapi/strapi';
import { getPasswordChangedAt } from '../auth/password-changes';

export default async (policyContext: any, _config: unknown, { strapi }: { strapi: Core.Strapi }) => {
  const user = policyContext.state.user;
  if (!user) return false;

  const token = await strapi.plugin('users-permissions').service('jwt').getToken(policyContext);
  if (!token?.iat) return false;

  const changedAt = await getPasswordChangedAt(strapi, user.id);
  return changedAt === null || token.iat >= Math.floor(changedAt / 1000);
};
