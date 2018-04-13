
export const sendMessage = ({key}) => {
  const now = new Date().getTime() / 1000
  if (key.expiration > now) {
    window.parent.postMessage('unlocked', '*')
  }
}
