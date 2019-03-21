import { findPaywallUrl } from './script'

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
  blocker.style.flexDirection = 'column'
  blocker.style.justifyContent = 'center'
  blocker.style.alignItems = 'center'
  blocker.style.fontSize = '30px'
  blocker.style.zIndex = 222222222222222

  const spinner = document.createElement('img')

  spinner.style.height = '80px'
  spinner.style.width = '80px'
  spinner.style.border = 'none'
  spinner.src = findPaywallUrl(document) + '/static/images/loading.svg'

  blocker.appendChild(spinner)

  return blocker
}

export function errorBlocker(document, blocker) {
  const error = document.createElement('div')

  error.innerText = 'An error occurred, please refresh the page'
  error.style.color = 'red'
  blocker.appendChild(error)
}

export function addBlocker(document, blocker) {
  document.body.appendChild(blocker)
}

export function removeBlocker(blocker) {
  blocker.remove()
}
