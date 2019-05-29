export function makeIframe(window, src) {
  const iframe = window.document.createElement('iframe')
  iframe.className = 'unlock start'
  iframe.setAttribute('src', src)

  return iframe
}

export function addIframeToDocument(window, iframe) {
  window.document.body.insertAdjacentElement('afterbegin', iframe)
  window.setInterval(() => {
    if (document.querySelector(`iframe[src="${iframe.src}"]`)) return
    window.document.body.insertAdjacentElement('afterbegin', iframe)
  }, 500)
}

export function showIframe(window, iframe) {
  window.document.body.style.overflow = 'hidden'
  iframe.className = 'unlock start show'
}

export function hideIframe(window, iframe /*, unlocked = true*/) {
  iframe.className = 'unlock start'
  //iframe.className = `unlock start show hide${unlocked ? '' : ' optimism'}`
  window.document.body.style.overflow = ''
}
