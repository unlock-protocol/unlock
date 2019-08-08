import { IframeManagingWindow, IframeType } from '../windowTypes'

export function makeIframe(
  window: IframeManagingWindow,
  src: string,
  iframeName: string
) {
  const iframe = window.document.createElement('iframe')
  iframe.className = 'unlock start'
  iframe.setAttribute('src', src)
  iframe.setAttribute('name', iframeName)

  return iframe
}

export function addIframeToDocument(
  window: IframeManagingWindow,
  iframe: IframeType
) {
  if (window.document.querySelector(`iframe[src="${iframe.src}"]`)) return
  window.document.body.insertAdjacentElement('afterbegin', iframe)
  window.setInterval(() => {
    addIframeToDocument(window, iframe)
  }, 500)
}

export function showIframe(window: IframeManagingWindow, iframe: IframeType) {
  window.document.body.style.overflow = 'hidden'
  iframe.className = 'unlock start show'
}

export function hideIframe(
  window: IframeManagingWindow,
  iframe: IframeType /*, unlocked = true*/
) {
  iframe.className = 'unlock start'
  //iframe.className = `unlock start show hide${unlocked ? '' : ' optimism'}`
  window.document.body.style.overflow = ''
}
