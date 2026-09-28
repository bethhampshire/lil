/**
 * intro-call router
 */

import { factories } from '@strapi/strapi';

const staffOnly = { policies: ['global::is-current-session'] };

export default factories.createCoreRouter('api::intro-call.intro-call', {
  config: {
    find: staffOnly,
    findOne: staffOnly,
    update: staffOnly,
  },
});
