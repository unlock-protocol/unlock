import startupWhenReady from './startup'
import '../static/iframe.css'
import constants from './constants'

export default function startup() {
  const env = process.env.UNLOCK_ENV || 'dev'
  const startupConstants = constants[env]

  startupWhenReady(window, startupConstants)
}
