/* eslint-disable no-underscore-dangle */
let _unlockAppUrl: string
let _locksmithUri: string
const baseUrl =
  document?.currentScript?.getAttribute('src') || 'paywall.unlock-protocol.com' // assume prod

if (baseUrl.match('staging-paywall.unlock-protocol.com')) {
  _unlockAppUrl = 'https://staging-app.unlock-protocol.com'
  _locksmithUri = 'https://staging-locksmith.unlock-protocol.com'
} else if (baseUrl.match('paywall.unlock-protocol.com')) {
  _unlockAppUrl = 'https://app.unlock-protocol.com'
  _locksmithUri = 'https://locksmith.unlock-protocol.com'
} else {
  _unlockAppUrl = 'http://0.0.0.0:3000'
  _locksmithUri = 'http://0.0.0.0:8080'
}
export const unlockAppUrl: string = _unlockAppUrl
export const locksmithUri: string = _locksmithUri
