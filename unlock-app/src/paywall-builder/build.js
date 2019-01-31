import { getIframe, add, show, hide } from './iframe'
import { findPaywallUrl } from './script'

export default function buildPaywall(window, document, lockAddress, blocker) {
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
        show(iframe, document)
        blocker.remove()
      }
      if (event.data === 'unlocked' && locked) {
        locked = false
        hide(iframe, document)
        blocker.remove()
      }
    },
    false
  )
}
