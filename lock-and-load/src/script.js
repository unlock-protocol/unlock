export const DEFAULT_URL = 'http://localhost:3000'

export function getPaywallUrl(window) {
  return window.unlock_url
}

export function findPaywallUrl(document) {
  // Get the domain and URI scheme of host we're loading this script from
  const scripts = document.getElementsByTagName('script')
  const pattern = /static\/paywall/i
  for (let i = 0; i < scripts.length; i++) {
    const src = scripts[i].getAttribute('src')
    if (pattern.test(src)) {
      return src.replace('/static/paywall.min.js', '')
    }
  }
  return DEFAULT_URL
}

export function findLocks(document) {
  return document.querySelector('meta[name=lock]').getAttribute('content')
}