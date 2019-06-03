import startup from './startup'
import '../paywall-builder/iframe.css'

if (document.readyState !== 'loading') {
  // in most cases, we will start up after the document is interactive
  // so listening for the DOMContentLoaded or load events is superfluous
  startup(window)
} else {
  // if we reach here, the page is sitll loading
  window.addEventListener('DOMContentLoaded', () => startup(window))
  window.addEventListener('load', () => startup(window))
}
