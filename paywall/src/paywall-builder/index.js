import '../static/iframe.css'
import listenForNewLocks from './mutationObserver'
import { getBlocker, addBlocker, removeBlocker } from './blocker'
import buildPaywall from './build'

window.onload = () => {
  const blocker = getBlocker(document)
  addBlocker(document, blocker)
  listenForNewLocks(
    lock => buildPaywall(window, document, lock, blocker),
    // our fail callback removes the blocker, since the paywall is useless without a lock to display
    () => removeBlocker(blocker),
    document.head
  )
}
