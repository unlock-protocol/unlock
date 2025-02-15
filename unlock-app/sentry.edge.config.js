import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

const sentryConfig = {
  dsn:
    SENTRY_DSN ||
    'https://36ea0faad22f4f99a9abc32bd4cb9695@o555569.ingest.sentry.io/4504976441737216',
  tracesSampleRate: 1.0,
  debug: process.env.NODE_ENV === 'development',
  attachStacktrace: true,
  enabled: ['production', 'staging'].includes(process.env.NODE_ENV),
  environment: process.env.NODE_ENV,
  autoSessionTracking: true,
}

Sentry.init(sentryConfig)
