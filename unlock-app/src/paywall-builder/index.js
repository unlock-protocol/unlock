import { listenForNewLocks } from './mutationobserver'
import buildPaywall from './build'

window.onload = () =>
  listenForNewLocks(lock => buildPaywall(window, document, lock), document.head)
