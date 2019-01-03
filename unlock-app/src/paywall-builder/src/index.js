import { getIframe, add, show, hide } from './iframe'
import { getPaywallUrl, findPaywallUrl, findLocks } from './script'
import { listenForNewLocks } from './mutationobserver'

//window.onload = () => lockAndLoad(window, document)
listenForNewLocks(lock => openPaywall(lock), document.head)

function openPaywall(lock) {
  lockAndLoad(window, document, lock)
}

export default function lockAndLoad(window, document, lockAddress) {
  let paywallUrl = getPaywallUrl(window)
  // Setting window.unlock_url hard sets the domain and URI scheme - if this is set, no need to auto-detect
  if (!paywallUrl) {
    paywallUrl = findPaywallUrl(document)
  }

  // If there is no lock, do nothing!
  if (!lockAddress) {
    return
  }

  paywallUrl += `/paywall/${lockAddress}/`
  var iframe = getIframe(document, paywallUrl)

  if (!iframe) {
    return
  }

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
