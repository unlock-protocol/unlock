import { Balance } from '../unlockTypes'
import { DEFAULT_STABLECOIN_BALANCE, STABLECOINS_ADDRESSES } from '../constants'

export const injectDefaultBalance = (oldBalance: Balance): Balance => {
  const newBalance: Balance = {}
  const tokens = Object.keys(oldBalance)
  tokens.forEach(token => {
    if (STABLECOINS_ADDRESSES.indexOf(token.toLowerCase()) > -1) {
      // If the token is the one we allow, we give the user a default
      // balance. TODO: only do this if the corresponding lock is approved.
      newBalance[token] = DEFAULT_STABLECOIN_BALANCE
    } else {
      // the "null account" 0x0000000... has an enormous balance of eth and other tokens. We zero
      // them out here so that we don't enable purchasing on the wrong locks for user
      // account users.
      newBalance[token] = '0'
    }
  })

  return newBalance
}

export default injectDefaultBalance
