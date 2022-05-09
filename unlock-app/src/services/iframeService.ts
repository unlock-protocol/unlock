export const lockPage = () => {
  window.parent.postMessage('locked', '*')
}

export const unlockPage = () => {
  window.parent.postMessage('unlocked', '*')
}
