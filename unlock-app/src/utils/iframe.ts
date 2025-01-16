export const isInIframe = () => {
  if (typeof window === 'undefined') return false
  return window !== window.parent || window.top !== window
}
