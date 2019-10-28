import startupWhenReady from './startup'

declare var __ENVIRONMENT_VARIABLES__: any

// Using require here so that we can use CSS modules without creating types for each declaration
const styles = require('../static/iframe.css')

export default function startup() {
  // Styles will be deferred until here, where they will load. This
  // prevents issues with `document` being undefined in SSR
  styles.use()

  startupWhenReady(window, __ENVIRONMENT_VARIABLES__)
}
