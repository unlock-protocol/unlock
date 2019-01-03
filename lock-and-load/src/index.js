import { getIframe, add, show, hide } from './iframe'
import { getPaywallUrl, findPaywallUrl, findLocks } from './script'

window.onload = () => lockAndLoad(window, document)

export default function lockAndLoad(window, document) {
  let paywallUrl = getPaywallUrl(window)
  // Setting window.unlock_url hard sets the domain and URI scheme - if this is set, no need to auto-detect
  if (!paywallUrl) {
    paywallUrl = findPaywallUrl(document)
  }

  const lockAddress = findLocks(document)

  // If there is no lock, do nothing!
  if (!lockAddress) return

  paywallUrl += `/paywall/${lockAddress}/`
  var iframe = getIframe(document, paywallUrl)

  add(document, iframe)

  let locked = false
  window.addEventListener(
    'message',
    event => {
      if (event.data === 'locked' && !locked) {
        locked = true
        show(iframe)
      }
      if (event.data === 'unlocked') {
        locked = false
        hide(iframe)
      }
    },
    false
  )
}
