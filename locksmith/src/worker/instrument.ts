import * as Sentry from '@sentry/node'
import config from '../config/config'
Sentry.init({
  ...config.sentry,
  integrations: [],
  enabled: true, // process.env.NODE_ENV === 'production',
  environment: process.env.NODE_ENV,
})
