import { findLocks } from './script'

export function changeListener(callback, list) {
  list.forEach(mutation => {
    if (!mutation.addedNodes || !mutation.addedNodes.length) return
    for (let info of mutation.addedNodes.entries()) {
      const entry = info[1]
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
