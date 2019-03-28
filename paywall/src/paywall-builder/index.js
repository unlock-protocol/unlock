import listenForNewLocks from './mutationObserver'
import { getBlocker, addBlocker, removeBlocker } from './blocker'
import buildPaywall from './build'

window.onload = () => {
  const blocker = getBlocker(document)
  addBlocker(document, blocker)
  listenForNewLocks(
    lock => buildPaywall(window, document, lock, blocker),
    () => removeBlocker(blocker),
    document.head
  )
}
