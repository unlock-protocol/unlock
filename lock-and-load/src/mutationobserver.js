export function changeListener(callback, list) {
  list
    .filter(mutation => {
      if (!mutation.addedNodes.length || !mutation.addedNodes.length) return
      for (let entry of mutation.addedNodes.entries()) {
        if (entry[1].nodeName === 'META' && entry[1].attributes.name && entry[1].attributes.name.nodeValue === 'lock') return true
      }
    })
    .forEach(mutation => {
      for (let entry of mutation.addedNodes.entries()) {
        if (entry[1].nodeName !== 'META' || !entry[1].attributes.name || entry[1].attributes.name.nodeValue !== 'lock') continue
        callback(entry[1].attributes.content.nodeValue)
      }
    })
}

export function listenForNewLocks(callback, head) {
  const observer = new MutationObserver(changeListener.bind(null, callback))
  observer.observe(head, { childList: true, attributes: true })
}