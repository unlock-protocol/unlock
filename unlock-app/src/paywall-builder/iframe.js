export const iframeStyles = [
  'display:none',
  'position:fixed',
  'top:0',
  'left:0',
  'width:100%',
  'height:100vh',
  'border:0px',
  'background: linear-gradient(rgba(255,255,255,0) 18%, rgba(255,255,255,0) 29%, rgb(255,255,255) 48%)',
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
  document.body.appendChild(iframe)
  return iframe
}

export function show(iframe) {
  iframe.style.display = 'block'
  iframe.style['z-index'] = '2147483647'
}

export function hide(iframe) {
  iframe.style.backgroundColor = 'transparent'
  iframe.style.backgroundImage = 'none'
}
