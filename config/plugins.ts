import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'users-permissions': {
    config: {
      // Sessions for the /requests dashboard last a working day, not the 30 day default.
      jwt: {
        expiresIn: env('JWT_EXPIRES_IN', '8h'),
      },
    },
  },
});

export default config;
