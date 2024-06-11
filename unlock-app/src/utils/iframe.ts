export const isInIframe = () => {
  console.log('isInIframe')
  return window !== window.parent || window.top !== window
}
