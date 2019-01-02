const iframeStyles = [
  'display:none',
  'position:fixed',
  'top:0',
  'left:0',
  'width:100%',
  'height:100vh',
  'border:0px',
  'background: linear-gradient(to bottom, rgba(255,255,255,0) 18%, rgba(255,255,255,0) 29%, rgba(255,255,255,1) 48%, rgba(255,255,255,1) 100%)',
  'z-index: -2147483647'
]

export function getIframe(document, src) {
  var s = document.createElement('iframe')

  s.setAttribute(
    'style',
    iframeStyles.join(' ')
  )
  s.setAttribute('src', src)
  return s
}

export function add(document, iframe) {
  document.body.appendChild(iframe)
}

export function show(iframe) {
  iframe.style.display = 'block'
  iframe.style['z-index'] = '2147483647'
}

export function hide(iframe) {
  document.body.removeChild(iframe)
}
