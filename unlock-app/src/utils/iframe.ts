export const isInIframe = () => {
  return window !== window.parent || window.top !== window
}
