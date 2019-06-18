import startup from './startup'
import '../paywall-builder/iframe.css'

let started = false
if (document.readyState !== 'loading') {
  // in most cases, we will start up after the document is interactive
  // so listening for the DOMContentLoaded or load events is superfluous
  startup(window)
  started = true
} else {
  const begin = () => {
    if (!started) startup(window)
    started = true
  }
  // if we reach here, the page is sitll loading
  window.addEventListener('DOMContentLoaded', begin)
  window.addEventListener('load', begin)
}
