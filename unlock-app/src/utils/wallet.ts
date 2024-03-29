export const detectInjectedProvider = (provider: any) => {
  if (provider?.isBraveWallet) {
    return 'brave'
  }

  if (provider?.isFrame) {
    return 'frame'
  }

  if (provider?.isStatus) {
    return 'status'
  }

  if (provider?.isRainbow) {
    return 'rainbow'
  }

  if (provider?.isMetaMask) {
    return 'metamask'
  }

  return 'metamask'
}
