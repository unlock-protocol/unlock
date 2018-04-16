const lockedNode = document.querySelector('[unlock-lock]')

if (lockedNode) {
  // If there is no lock, do nothing!
  var src = 'http://127.0.0.1:3000'
  var s = document.createElement('iframe')
  src += `/lock/${lockedNode.getAttribute('unlock-lock')}`

  // Style for the iframe: cover everything!
  s.setAttribute('style', 'display:block; position:fixed; top:30%; left:30%; width:50%; height:50%; border:0px; background: transparent; z-index: 2147483647;')
  s.setAttribute('src', src)

  // Append the iframe!
  document.getElementsByTagName('body')[0].appendChild(s)

  // Listens to message coming from iframe
  window.addEventListener('message', (event) => {
    if (event.data === 'unlocked') {
      // let's remove the iframe!
      document.getElementsByTagName('body')[0].removeChild(s)
    }
  }, false)
}
