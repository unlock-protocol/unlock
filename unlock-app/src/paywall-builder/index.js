import { listenForNewLocks } from './mutationobserver'
import buildPaywall from './build'

listenForNewLocks(lock => buildPaywall(window, document, lock), document.head)
