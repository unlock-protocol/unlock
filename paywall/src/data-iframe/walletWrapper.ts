import { WalletService } from '@unlock-protocol/unlock-js'
import {
  WalletServiceType,
  TransactionDefaults,
} from './blockchainHandler/blockChainTypes'
import { normalizeLockAddress } from '../utils/normalizeAddresses'
import { POLLING_INTERVAL } from '../constants'

// There are slight differences between what WalletService emits and
// what our other code expects, this piece massages the data so that
// they match.
export const formatTransaction = (
  hash: string,
  from: string,
  to: string,
  input: string,
  type: string,
  status: string
): TransactionDefaults => {
  const normalizedTo = normalizeLockAddress(to)
  const normalizedFrom = normalizeLockAddress(from)
  return {
    hash,
    from: normalizedFrom,
    for: normalizedFrom,
    to: normalizedTo,
    input,
    type,
    status,
    blockNumber: Number.MAX_SAFE_INTEGER,
  }
}

// hideous
type NewTransactionArgs = [string, string, string, string, string, string]

export const retrieveAccount = (walletService: WalletServiceType) => {
  if (!walletService.provider) {
    return
  }
  walletService.getAccount()
}

export const pollForAccountChanges = (walletService: WalletServiceType) => {
  retrieveAccount(walletService)
  window.setTimeout(pollForAccountChanges, POLLING_INTERVAL)
}

// Messages with one argument that are passed from the wrapper to the
// main window unchanged
const passThroughMessages = ['account.changed', 'network.changed']

export const walletWrapper = (
  unlockAddress: string,
  emitter: (name: string, data?: any) => void
) => {
  const walletService: WalletServiceType = new WalletService({ unlockAddress })

  passThroughMessages.forEach((msg: string) => {
    walletService.on(msg, (arg: any) => emitter(msg, arg))
  })

  walletService.on('transaction.new', (...args: NewTransactionArgs) => {
    emitter('transaction.new', formatTransaction(...args))
  })

  pollForAccountChanges(walletService)
}
