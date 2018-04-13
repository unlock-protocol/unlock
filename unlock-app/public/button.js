const lockedNode = document.querySelector('[unlock-lock]')

if (lockedNode) {
  // If there is no lock, do nothing!
  var src = 'http://127.0.0.1:3000'
  var s = document.createElement('iframe')
  src += `/lock/${lockedNode.getAttribute('unlock-lock')}`

  // Style for the iframe: cover everything!
  s.setAttribute('style', 'display:block; position:fixed; top:30%; left:30%; width:50%; height:50%; border:0px; background: transparent; z-index: 2147483647; border: 3px solid red')
  s.setAttribute('src', src)
  var loaded = false

  // Append the iframe!
  document.getElementsByTagName('body')[0].appendChild(s)

  // Listens to message coming from iframe
  window.addEventListener('message', (event) => {
    console.log(event)
    if (event.data === 'unlocked') {
      // let's remove the iframe!
      console.log('Content has been unlocked!')
      document.getElementsByTagName('body')[0].removeChild(s)
      if (parentArticleNode) {
        parentArticleNode.appendChild(unlockedArticleNode)
      }
    } else {
      lock()
    }
  }, false)
}
