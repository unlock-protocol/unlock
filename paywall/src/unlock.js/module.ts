import startupWhenReady from './startup'
import constants from './constants'

// Using require here so that we can use CSS modules without creating types for each declaration
const styles = require('../static/iframe.css')

export default function startup() {
  // Styles will be deferred until here, where they will load. This
  // prevents issues with `document` being undefined in SSR
  styles.use()

  const env = process.env.UNLOCK_ENV || 'dev'
  const startupConstants = constants[env]

  startupWhenReady(window, startupConstants)
}
