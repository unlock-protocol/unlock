import { SHOW_FLAG_FOR } from '../constants'

export const iframeStyles = [
  'display:none',
  'position:fixed',
  'top:0',
  'left:0',
  'width:100%',
  'height:100vh',
  'border:0px',
  'z-index: -2147483647',
]

export function getIframe(document, src) {
  var s = document.createElement('iframe')

  s.setAttribute('style', iframeStyles.join('; '))
  s.setAttribute('src', src)
  s.setAttribute('data-unlock', 'yes')
  return s
}

export function add(document, iframe) {
  if (document.querySelector('iframe[data-unlock]')) return false
  document.body.insertAdjacentElement('afterbegin', iframe)

  return iframe
}

export function show(iframe, document) {
  document.body.style.overflow = 'hidden'
  iframe.style.display = 'block'
  iframe.style['z-index'] = '2147483647'
}

export function hide(iframe, document) {
  const expandedWidth = '256px'
  const collapsedWidth = '30px'
  const height = '80px'

  // general settings
  document.body.style.overflow = ''
  iframe.style.backgroundColor = 'transparent'
  iframe.style.backgroundImage = 'none'
  iframe.contentDocument.body.style.margin = '0'
  iframe.contentDocument.body.style.height = height

  // so that there's no scroll when it goes off the edge
  iframe.style.overflow = 'hidden'
  iframe.contentDocument.body.style.overflow = 'hidden'

  // new dimensions
  iframe.style.width = expandedWidth
  iframe.style.height = height

  // positioning
  iframe.style.left = null
  iframe.style.top = null
  iframe.style.right = '0'
  iframe.style.bottom = '105px'

  // Animation
  iframe.style.transition = 'width 0.4s ease-in'

  setTimeout(() => {
    iframe.style.width = collapsedWidth
  }, SHOW_FLAG_FOR)
  iframe.addEventListener('mouseenter', () => {
    iframe.style.width = expandedWidth
  })
  iframe.addEventListener('mouseleave', () => {
    iframe.style.width = collapsedWidth
  })
}
