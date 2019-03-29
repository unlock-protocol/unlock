import { POST_MESSAGE_SCROLL_POSITION } from './constants'

let scrollPolling = false

export function disableScrollPolling() {
  scrollPolling = false
}

export function enableScrollPolling() {
  scrollPolling = true
}

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
// iOS allows the page to scroll even when the paywall is up. Our
// solution to this is to make the paywall grow to obscure the page
// content as the user scrolls down the page. We register the
// scroll-handling function here to preserve the context of the actual
// page, not the iframe.
export const scrollLoop = (window, document, iframe, origin) => {
  if (!scrollPolling) return // the page is unlocked
  const pageTop = window.pageYOffset
  const viewportHeight = window.innerHeight
  const pageHeight = document.documentElement.scrollHeight
  const maximumScroll = pageHeight - viewportHeight
  // Avoiding a divide-by-zero error when the page does not scroll!
  if (maximumScroll === 0) {
    return
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
  return
}
