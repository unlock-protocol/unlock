// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn:
    SENTRY_DSN ||
    'https://36ea0faad22f4f99a9abc32bd4cb9695@o555569.ingest.sentry.io/4504976441737216',
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,
  // ...
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
  debug: process.env.NODE_ENV === 'development',
  attachStacktrace: true,
  enabled: ['production', 'staging'].includes(process.env.NODE_ENV),
  environment: process.env.NODE_ENV,
  autoSessionTracking: true,
})
