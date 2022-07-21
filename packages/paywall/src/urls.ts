/* eslint-disable no-underscore-dangle */
let _unlockAppUrl: string
let _locksmithUri: string
const baseUrl =
  document?.currentScript?.getAttribute('src') || 'paywall.unlock-protocol.com' // assume prod

const endpoint = new URL(baseUrl)
const alpha = endpoint.searchParams.get('alpha')

if (baseUrl.match('staging-paywall.unlock-protocol.com')) {
  if (alpha) {
    _unlockAppUrl = 'https://staging-app.unlock-protocol.com/alpha'
  } else {
    _unlockAppUrl = 'https://staging-app.unlock-protocol.com'
  }
  _locksmithUri = 'https://staging-locksmith.unlock-protocol.com'
} else if (baseUrl.match('paywall.unlock-protocol.com')) {
  if (alpha) {
    _unlockAppUrl = 'https://app.unlock-protocol.com/alpha'
  } else {
    _unlockAppUrl = 'https://app.unlock-protocol.com'
  }
  _locksmithUri = 'https://locksmith.unlock-protocol.com'
} else {
  if (alpha) {
    _unlockAppUrl = 'http://localhost:3000/alpha'
  } else {
    _unlockAppUrl = 'http://localhost:3000'
  }
  _locksmithUri = 'http://localhost:8080'
}
export const unlockAppUrl: string = _unlockAppUrl
export const locksmithUri: string = _locksmithUri
