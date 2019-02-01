export function getBlocker(document) {
  const blocker = document.createElement('div')

  blocker.id = '_unlock_blocker'

  blocker.style.height = '100vh'
  blocker.style.width = '100vw'
  blocker.style.position = 'fixed'
  blocker.style.top = 0
  blocker.style.left = 0
  blocker.style.background = 'white'
  blocker.style.display = 'flex'
  blocker.style.justifyContent = 'center'
  blocker.style.alignItems = 'center'
  blocker.style.fontSize = '30px'
  blocker.style.zIndex = 222222222222222

  const text = document.createElement('div')

  text.innerText = 'Loading access rights...'
  blocker.appendChild(text)

  return blocker
}

export function addBlocker(document, blocker) {
  document.body.appendChild(blocker)
}

export function removeBlocker(blocker) {
  blocker.remove()
}
