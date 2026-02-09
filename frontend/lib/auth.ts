import { betterAuth } from 'better-auth';
import { jwt } from 'better-auth/plugins';
import { BETTER_AUTH_SECRET } from './constants';

export const auth = betterAuth({
  baseURL: 'http://localhost:3000',
  basePath: '/api/auth',
  database: {
    provider: 'better-auth/db/postgres',
    type: 'postgres',
    url: 'postgresql://neondb_owner:npg_ukfdnO1U6siv@ep-bitter-mountain-a7c5kvdr-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    jwt({
      secret: BETTER_AUTH_SECRET,
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24, // 24 hours
    updateAge: 60 * 60 * 12, // Update every 12 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // Cache for 5 minutes
    },
  },
  appName: 'Todo Pro',
  trustedOrigins: ['http://localhost:3000'],
});

export type Session = typeof auth.$Infer.Session;
