export const DEFAULT_URL = 'http://localhost:3001'

export function findPaywallUrl(document) {
  // Get the domain and URI scheme of host we're loading this script from
  const scripts = document.getElementsByTagName('script')
  const pattern = /static\/paywall/i
  for (let i = 0; i < scripts.length; i++) {
    const src = scripts[i].getAttribute('src')
    if (pattern.test(src)) {
      const paywallHost = scripts[i].getAttribute('data-unlock-url')
      if (paywallHost) return paywallHost
      return src.substring(0, src.indexOf('/static/paywall'))
    }
  }
  return DEFAULT_URL
}

export function findLocks(head) {
  const lock = head.querySelector('meta[name=lock]')
  return lock && lock.getAttribute('content')
}
