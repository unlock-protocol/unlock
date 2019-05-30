import { makeIframe, addIframeToDocument } from './iframeManager'
import setupPostOffices from './setupPostOffices'
import '../paywall-builder/iframe.css'

window.onload = () => {
  const origin = '?origin=' + encodeURIComponent(window.origin)

  const dataIframe = makeIframe(
    window,
    process.env.PAYWALL_URL + '/static/dataIframe.html' + origin
  )
  addIframeToDocument(window, dataIframe)
  const checkoutIframe = makeIframe(
    window,
    process.env.PAYWALL_URL + '/checkout' + origin
  )
  addIframeToDocument(window, checkoutIframe)

  setupPostOffices(window, dataIframe, checkoutIframe)
}
