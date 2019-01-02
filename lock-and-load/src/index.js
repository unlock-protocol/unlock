import { getIframe, add, show, hide } from './iframe'
import { getPaywallUrl, findPaywallUrl, findLocks } from './script'

export default function lockAndLoad(src, window, document) {
  const paywallUrl = getPaywallUrl(window)
  // Setting window.unlock_url hard sets the domain and URI scheme - if this is set, no need to auto-detect
  if (!paywallUrl) {
    src = findPaywallUrl(document)
  }

  const lockedNode = document.querySelector('meta[name=lock]')

  // If there is no lock, do nothing!
  if (lockedNode) {
    src += `/paywall/${content}/`
    const content = lockedNode.getAttribute('content')
    var iframe = getIframe(document, src)

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
}