const baseUrl =
  document?.currentScript?.getAttribute('src') ||
  'https://paywall.unlock-protocol.com' // assume prod

const endpoint = new URL(baseUrl)
const alpha = !!endpoint.searchParams.get('alpha')
const legacy = !!endpoint.searchParams.get('legacy')

export function getConfigUrl(
  url: string,
  { legacy, alpha }: Partial<Record<'legacy' | 'alpha', boolean>>
) {
  let unlockAppUrl: string
  let locksmithUri: string
  if (url.match('staging-paywall.unlock-protocol.com')) {
    if (legacy) {
      unlockAppUrl = 'https://staging-app.unlock-protocol.com/legacy'
    } else if (alpha) {
      unlockAppUrl = 'https://staging-app.unlock-protocol.com/alpha'
    } else {
      unlockAppUrl = 'https://staging-app.unlock-protocol.com'
    }
    locksmithUri = 'https://staging-locksmith.unlock-protocol.com'
  } else if (url.match('paywall.unlock-protocol.com')) {
    if (legacy) {
      unlockAppUrl = 'https://app.unlock-protocol.com/legacy'
    } else if (alpha) {
      unlockAppUrl = 'https://app.unlock-protocol.com/alpha'
    } else {
      unlockAppUrl = 'https://app.unlock-protocol.com'
    }
    locksmithUri = 'https://locksmith.unlock-protocol.com'
  } else {
    if (legacy) {
      unlockAppUrl = 'http://localhost:3000/legacy'
    } else if (alpha) {
      unlockAppUrl = 'http://localhost:3000/alpha'
    } else {
      unlockAppUrl = 'http://localhost:3000'
    }
    locksmithUri = 'http://localhost:8080'
  }

  return {
    locksmithUri,
    unlockAppUrl,
  }
}

export const { unlockAppUrl, locksmithUri } = getConfigUrl(baseUrl, {
  legacy,
  alpha,
})
