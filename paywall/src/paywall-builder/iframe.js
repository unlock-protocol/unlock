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

  s.className = 'unlock start'
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
  iframe.className = 'unlock start show'
}

export function hide(iframe, document, unlocked = true) {
  iframe.className = `unlock start show hide${unlocked ? '' : ' optimism'}`
  document.body.style.overflow = ''
}
