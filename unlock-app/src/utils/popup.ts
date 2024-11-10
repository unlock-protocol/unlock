// Used for NextAuth google sign in
export const popupCenter = (url: string, title: string) => {
  const dualScreenLeft = window.screenLeft ?? window.screenX
  const dualScreenTop = window.screenTop ?? window.screenY

  const width =
    window.innerWidth ?? document.documentElement.clientWidth ?? screen.width

  const systemZoom = width / window.screen.availWidth

  const popupWidth = 300
  const popupHeight = 300

  // Position popup at a fixed offset from top-left
  const left = dualScreenLeft + 50
  const top = dualScreenTop + 50

  const newWindow = window.open(
    url,
    title,
    `width=${popupWidth / systemZoom},height=${
      popupHeight / systemZoom
    },top=${top},left=${left}`
  )

  newWindow?.focus()
  return newWindow
}
