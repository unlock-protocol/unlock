import { getIframe, add, show, hide } from './iframe'
import { findPaywallUrl } from './script'

const baseBannerHeight = () => {
  const viewportHeight = window.innerHeight
  const minHeight = 375
  const minHeightPct = 100 * (minHeight / viewportHeight)

  return minHeightPct > 30 ? minHeightPct : 30
}

export default function buildPaywall(window, document, lockAddress) {
  // If there is no lock, do nothing!
  if (!lockAddress) {
    return
  }

  const paywallUrl = findPaywallUrl(document) + `/paywall/${lockAddress}/`
  const iframe = getIframe(document, paywallUrl)
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

    if (maximumScroll === 0) {
      return
    }

    const scrollPosition = baseBannerHeight() + 100 * (pageTop / maximumScroll)
    debugger
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
      }
      if (event.data === 'unlocked' && locked) {
        locked = false
        hide(iframe, document)
      }
    },
    false
  )
}
