import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'
import config from './config/config'
Sentry.init({
  ...config.sentry,
  integrations: [
    Sentry.httpIntegration({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],
  enabled: process.env.NODE_ENV === 'production',
  environment: process.env.NODE_ENV,
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.5,
})
