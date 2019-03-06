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
  const width = '134px'
  const height = '160px'
  const collapsedMargin = '-104px'

  // general settings
  document.body.style.overflow = ''
  iframe.style.backgroundColor = 'transparent'
  iframe.style.backgroundImage = 'none'
  iframe.style['margin-right'] = collapsedMargin

  // so that there's no scroll when it goes off the edge
  iframe.style.overflow = 'hidden'

  // new dimensions
  iframe.style.width = width
  iframe.style.height = height

  // positioning
  iframe.style.left = null
  iframe.style.top = null
  iframe.style.right = '0'
  iframe.style.bottom = '105px'

  // Animation
  iframe.style.transition = 'margin-right 0.4s ease-in'

  iframe.addEventListener('mouseenter', () => {
    iframe.style['margin-right'] = '0'
  })
  iframe.addEventListener('mouseleave', () => {
    iframe.style['margin-right'] = collapsedMargin
  })
}
