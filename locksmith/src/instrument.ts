import * as Sentry from '@sentry/node'
import config from './config/config'

Sentry.init({
  ...config.sentry,
  enabled: process.env.NODE_ENV === 'production',
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
