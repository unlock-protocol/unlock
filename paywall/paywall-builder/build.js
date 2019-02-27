import { getIframe, add, show, hide } from './iframe'
import { findPaywallUrl } from './script'

// Currently, the constraint on the banner is that it starts out at
// 30% of height, but at least 375px
const baseBannerHeight = () => {
  const viewportHeight = window.innerHeight
  const minHeight = 375
  const minHeightPct = 100 * (minHeight / viewportHeight)
  // So here we determine which of the 2 options is the larger, so we
  // can use it as the basis to scroll from
  return minHeightPct > 30 ? minHeightPct : 30
}

export function redirect(window, paywallUrl) {
  const redirectTo = encodeURIComponent(window.location.href)

  window.location.href = paywallUrl + redirectTo
}

export default function buildPaywall(window, document, lockAddress, blocker) {
  // If there is no lock, do nothing!
  if (!lockAddress) {
    return
  }

  const originUrl = `?origin=${encodeURIComponent(window.origin)}`
  const paywallUrl =
    findPaywallUrl(document) + `/${lockAddress}/` + window.location.hash
  const paywallUrlWithOrigin =
    findPaywallUrl(document) +
    `/${lockAddress}/${originUrl}` +
    window.location.hash
  const iframe = getIframe(document, paywallUrlWithOrigin)
  add(document, iframe)

  // iOS allows the page to scroll even when the paywall is up. Our
  // solution to this is to make the paywall grow to obscure the page
  // content as the user scrolls down the page. We register the
  // scroll-handling function here to preserve the context of the actual
  // page, not the iframe.
  const scrollLoop = () => {
    const pageTop = window.pageYOffset
    const viewportHeight = window.innerHeight
    const pageHeight = document.documentElement.scrollHeight
    const maximumScroll = pageHeight - viewportHeight
    // Avoiding a divide-by-zero error when the page does not scroll!
    if (maximumScroll === 0) {
      return
    }

    const scrollPosition = baseBannerHeight() + 100 * (pageTop / maximumScroll)
    iframe.contentWindow.postMessage({ scrollPosition }, '*')

    window.requestAnimationFrame(scrollLoop)
  }
  scrollLoop()

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
      if (event.data === 'redirect') {
        redirect(window, paywallUrl)
      }
    },
    false
  )
}
