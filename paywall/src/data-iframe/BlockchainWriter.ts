import { normalizeLockAddress } from '../utils/normalizeAddresses'
import { TransactionDefaults } from './blockchainHandler/blockChainTypes'
import { POLLING_INTERVAL } from '../constants'

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
  accountAddress: string | null = null
  networkId: number = 1

  constructor(
    walletService: any,
    addTransaction: (tx: TransactionDefaults) => void
  ) {
    this.walletService = walletService

    this.walletService.on('account.changed', (accountAddress: string) => {
      this.accountAddress = accountAddress
    })

    this.walletService.on('network.changed', (networkId: number) => {
      this.networkId = networkId
    })

    this.walletService.on('transaction.new', (...args: NewTransactionArgs) => {
      addTransaction(formatTransaction(...args))
    })

    // poll for account changes
    const retrieveAccount = () => {
      if (!this.walletService.provider) return
      this.walletService.getAccount()
    }
    const pollForAccountChanges = () => {
      retrieveAccount()
      window.setTimeout(pollForAccountChanges, POLLING_INTERVAL)
    }
    pollForAccountChanges()
  }
}

export default BlockchainWriter
