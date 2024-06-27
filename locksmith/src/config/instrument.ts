import * as Sentry from '@sentry/node'
import config from '../config/config'

Sentry.init({
  ...config.sentry,
  integrations: [],
  enabled: process.env.NODE_ENV === 'production',
  environment: process.env.NODE_ENV,
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.5,
})
