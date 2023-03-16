let baseUrl = 'https://paywall.unlock-protocol.com' // assume prod

const getURL = (url: string) => {
  try {
    return new URL(url)
  } catch {
    return null
  }
}

if (typeof window !== 'undefined') {
  const url = document?.currentScript?.getAttribute('src')
  if (url) {
    const paywallUrl = getURL(url)
    if (
      paywallUrl &&
      // check if is unlock
      [
        'paywall.unlock-protocol.com',
        'staging-paywall.unlock-protocol.com',
        'localhost',
      ].includes(paywallUrl.hostname)
    ) {
      baseUrl = paywallUrl.toString()
    }
  }
}

const endpoint = new URL(baseUrl)

export function getConfigUrl(url: string) {
  let unlockAppUrl: string
  let locksmithUri: string
  if (url.match('staging-paywall.unlock-protocol.com')) {
    unlockAppUrl = 'https://staging-app.unlock-protocol.com'
    locksmithUri = 'https://staging-locksmith.unlock-protocol.com'
  } else if (url.match('paywall.unlock-protocol.com')) {
    unlockAppUrl = 'https://app.unlock-protocol.com'
    locksmithUri = 'https://locksmith.unlock-protocol.com'
  } else {
    unlockAppUrl = 'http://localhost:3000'
    locksmithUri = 'http://localhost:8080'
  }
  return {
    locksmithUri,
    unlockAppUrl,
  }
}

export const { unlockAppUrl, locksmithUri } = getConfigUrl(endpoint.toString())
