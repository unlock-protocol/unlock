/**
 * This file is the core of the paywall script. It listens for changes to the <head></head> component
 * and looks for a <meta name="lock" content="..." /> and pulls the lock address out of the content.
 */
import { findLocks } from './script'

export function changeListener(callback, list) {
  list.forEach(mutation => {
    if (!mutation.addedNodes || !mutation.addedNodes.length) return
    const entries = mutation.addedNodes.entries()
    while (true) {
      const info = entries.next()
      if (info.done) break
      const entry = info.value[1]
      if (entry.nodeName !== 'META' || entry.name !== 'lock') continue
      callback(entry.content)
    }
  })
}

export function listenForNewLocks(callback, head) {
  const existingLock = findLocks(head)
  if (existingLock) {
    return callback(existingLock)
  }
  const observer = new MutationObserver(changeListener.bind(null, callback))
  observer.observe(head, { childList: true, attributes: true })
}
