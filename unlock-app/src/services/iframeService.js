export const lockUnlessKeyIsValid = ({ key }) => {
  const now = new Date().getTime() / 1000
  if (key.expiration < now) {
    window.parent.postMessage('locked', '*')
  }
}

export const unlockIfKeyIsValid = ({ key }) => {
  const now = new Date().getTime() / 1000
  if (key.expiration >= now) {
    window.parent.postMessage('unlocked', '*')
  }
}
