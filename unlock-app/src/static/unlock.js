window.onload = function() {
  const lockedNode = document.querySelector('meta[name=lock]')

  // If there is no lock, do nothing!
  if (lockedNode) {
    var src = window.unlock_url || 'http://localhost:3000'

    var s = document.createElement('iframe')
    src += `/paywall/${lockedNode.getAttribute('content')}/`

    s.setAttribute(
      'style',
      'display:none; position:fixed; top:0; left:0; width:100%; height:100vh; border:0px; background: linear-gradient(to bottom, rgba(255,255,255,0) 18%, rgba(255,255,255,0) 29%, rgba(255,255,255,1) 48%, rgba(255,255,255,1) 100%); z-index: -2147483647;'
    )
    s.setAttribute('src', src)
    document.getElementsByTagName('body')[0].appendChild(s)

    let locked = false
    window.addEventListener(
      'message',
      event => {
        if (event.data === 'locked' && !locked) {
          locked = true
          s.style.display = 'block'
          s.style['z-index'] = '2147483647'
        }
        if (event.data === 'unlocked') {
          locked = false
          document.getElementsByTagName('body')[0].removeChild(s)
        }
      },
      false
    )
  }
}
