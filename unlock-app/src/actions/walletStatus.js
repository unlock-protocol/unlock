export const WAIT_FOR_WALLET = 'walletStatus/WAIT_FOR_WALLET'
export const GOT_WALLET = 'walletStatus/GOT_WALLET'
export const DISMISS_CHECK = 'walletStatus/DISMISS_CHECK'

export const waitForWallet = () => ({ type: WAIT_FOR_WALLET })

export const gotWallet = () => ({ type: GOT_WALLET })

export const dismissWalletCheck = () => ({ type: DISMISS_CHECK })
