import { getIframe, add, show, hide } from './iframe'
import { findPaywallUrl } from './script'

export default function buildPaywall(window, document, lockAddress) {
  // If there is no lock, do nothing!
  if (!lockAddress) {
    return
  }

  const paywallUrl = findPaywallUrl(document) + `/paywall/${lockAddress}/`
  const iframe = getIframe(document, paywallUrl)

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
