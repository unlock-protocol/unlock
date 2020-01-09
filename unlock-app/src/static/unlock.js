window.onload = function() {
  // Initialize source domain
  let src = window.unlock_url || 'http://localhost:3000'

  // Setting window.unlock_url hard sets the domain and URI scheme - if this is set, no need to auto-detect
  if (!window.unlock_url) {
    // Get the domain and URI scheme of host we're loading this script from
    const scripts = document.getElementsByTagName('script')
    for (let i = 0; i < scripts.length; i++) {
      const pattern = /static\/unlock/i
      if (pattern.test(scripts[i].getAttribute('src')))
        src = scripts[i].getAttribute('src').replace('/static/unlock.js', '')
    }
  }

  const lockedNode = document.querySelector('meta[name=lock]')

  // If there is no lock, do nothing!
  if (lockedNode) {
    const s = document.createElement('iframe')
    src += `/paywall/${lockedNode.getAttribute('content')}/`

    s.setAttribute(
      'style',
      'display:none; position:fixed; top:0; left:0; width:100%; height:100vh; border:0px; z-index: -2147483647;'
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
