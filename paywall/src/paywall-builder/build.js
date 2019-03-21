import { getIframe, add, show, hide } from './iframe'
import { findPaywallUrl } from './script'
import {
  POST_MESSAGE_LOCKED,
  POST_MESSAGE_UNLOCKED,
  POST_MESSAGE_REDIRECT,
  POST_MESSAGE_SCROLL_POSITION,
} from './constants'
import { errorBlocker } from './blocker'

// Currently, the constraint on the banner is that it starts out at
// 30% of height, but at least 375px
const baseBannerHeight = window => {
  const viewportHeight = window.innerHeight
  const minHeight = 375
  const minHeightPct = 100 * (minHeight / viewportHeight)
  // So here we determine which of the 2 options is the larger, so we
  // can use it as the basis to scroll from
  return minHeightPct > 30 ? minHeightPct : 30
}
let scrollPolling = true
// iOS allows the page to scroll even when the paywall is up. Our
// solution to this is to make the paywall grow to obscure the page
// content as the user scrolls down the page. We register the
// scroll-handling function here to preserve the context of the actual
// page, not the iframe.
export const scrollLoop = (window, document, iframe, origin) => {
  const disablePolling = () => {
    scrollPolling = false
  }
  if (!scrollPolling) return disablePolling // the page is unlocked
  const pageTop = window.pageYOffset
  const viewportHeight = window.innerHeight
  const pageHeight = document.documentElement.scrollHeight
  const maximumScroll = pageHeight - viewportHeight
  // Avoiding a divide-by-zero error when the page does not scroll!
  if (maximumScroll === 0) {
    return disablePolling
  }

  const scrollPosition =
    baseBannerHeight(window) + 100 * (pageTop / maximumScroll)
  iframe.contentWindow.postMessage(
    { type: POST_MESSAGE_SCROLL_POSITION, payload: scrollPosition },
    origin
  )

  window.requestAnimationFrame(() =>
    scrollLoop(window, document, iframe, origin)
  )
  return disablePolling
}

export function redirect(window, paywallUrl) {
  const redirectTo = window.encodeURIComponent(window.location.href)

  window.location.href = paywallUrl + redirectTo
}

export default function buildPaywall(window, document, lockAddress, blocker) {
  // If there is no lock, do nothing!
  if (!lockAddress) {
    return
  }

  try {
    // in the paywall, postMessage needs to know the origin of the parent window
    // This allows us to securely pass it in
    const originUrl = `?origin=${encodeURIComponent(window.origin)}`
    const paywallUrl =
      findPaywallUrl(document) + `/${lockAddress}/` + window.location.hash
    const paywallUrlWithOrigin =
      findPaywallUrl(document) +
      `/${lockAddress}/${originUrl}` +
      window.location.hash
    const iframe = getIframe(document, paywallUrlWithOrigin)
    add(document, iframe)

    const origin = new window.URL(paywallUrl).origin

    let locked = false
    let disableScrollPolling = () => {}
    window.addEventListener(
      'message',
      event => {
        try {
          if (event.data === POST_MESSAGE_LOCKED && !locked) {
            locked = true
            scrollPolling = true
            show(iframe, document)
            disableScrollPolling = scrollLoop(window, document, iframe, origin)
            blocker.remove()
          }
          if (event.data === POST_MESSAGE_UNLOCKED && locked) {
            locked = false
            disableScrollPolling()
            hide(iframe, document)
            blocker.remove()
          }
          if (event.data === POST_MESSAGE_REDIRECT) {
            redirect(window, paywallUrl)
          }
        } catch (e) {
          errorBlocker(document, blocker)
          throw e
        }
      },
      false
    )
  } catch (e) {
    errorBlocker(document, blocker)
    throw e
  }
}
