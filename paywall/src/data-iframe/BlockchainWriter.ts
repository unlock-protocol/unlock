import { normalizeLockAddress } from '../utils/normalizeAddresses'
import { TransactionDefaults } from './blockchainHandler/blockChainTypes'

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

/**
 * This class is a thin wrapper around WalletService, primarily here
 * for the purpose of transforming data to expected formats.
 */
export class BlockchainWriter {
  // TODO: types from unlock-js
  walletService: any

  constructor(
    walletService: any,
    setAccount: (accountAddress: string) => void,
    setNetwork: (networkId: string) => void,
    addTransaction: (tx: TransactionDefaults) => void,
    alertError: (error: Error) => void
  ) {
    this.walletService = walletService

    this.walletService.on('account.changed', setAccount)
    this.walletService.on('network.changed', setNetwork)
    this.walletService.on('transaction.new', (...args: NewTransactionArgs) => {
      addTransaction(formatTransaction(...args))
    })
    this.walletService.on('error', (error: Error) => {
      // TODO: why do we wrap this instead of just emitting the error
      // from walletservice?
      if (error.message === 'FAILED_TO_PURCHASE_KEY') {
        alertError(new Error('purchase failed'))
      }
    })
  }
}

export default BlockchainWriter
