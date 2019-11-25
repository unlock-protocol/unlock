import { Web3Window, CryptoWalletWindow } from '../windowTypes'
import { PaywallConfig } from '../unlockTypes'

export function hasWallet(window: Web3Window): boolean {
  // eslint-disable-next-line no-console
  console.log({
    location: 'hasWallet',
    web3: window.web3,
  })
  return !!(window.web3 && window.web3.currentProvider)
}

export function walletIsMetamask(window: Web3Window): boolean {
  if (hasWallet(window)) {
    // Since hasWallet returned true, we know web3.currentProvider is
    // on the window
    return !!(window as CryptoWalletWindow).web3.currentProvider.isMetamask
  }

  return false
}

export function shouldUseUserAccounts(
  window: Web3Window,
  config: PaywallConfig
) {
  // We do not enable use of managed user accounts if there is a wallet present
  if (hasWallet(window)) {
    return false
  }

  return (
    config.unlockUserAccounts === 'true' || config.unlockUserAccounts === true
  )
}

export interface WalletStatus {
  hasWallet: boolean
  isMetamask: boolean
  shouldUseUserAccounts: boolean
}

export function walletStatus(
  window: Web3Window,
  config: PaywallConfig
): WalletStatus {
  return {
    hasWallet: hasWallet(window),
    isMetamask: walletIsMetamask(window),
    shouldUseUserAccounts: shouldUseUserAccounts(window, config),
  }
}
