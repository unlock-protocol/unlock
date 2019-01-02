export const DEFAULT_URL = 'http://localhost:3000'

export function getPaywallUrl(window) {
  return window.unlock_url
}

export function findPaywallUrl(document) {
  // Get the domain and URI scheme of host we're loading this script from
  let scripts = document.getElementsByTagName('script')
  for (let i = 0; i < scripts.length; i++) {
    let pattern = /static\/paywall/i
    if (pattern.test(scripts[i].getAttribute('src'))) {
      return scripts[i].getAttribute('src').replace('/static/paywall.js', '')
    }
  }
  return DEFAULT_URL
}

export function findLocks(document) {
  return document.querySelector('meta[name=lock]')
}