import { EventEmitter } from 'events'
import { normalizeLockAddress } from '../utils/normalizeAddresses'

export enum Events {
  newAccount = 'newAccount',
  newNetwork = 'newNetwork',
  newTransaction = 'newTransaction',
  error = 'error',
}

/**
 * This class is a thin wrapper around WalletService, primarily here
 * for the purpose of transforming data to expected formats.
 */
export class BlockchainWriter extends EventEmitter {
  // TODO: types from unlock-js
  walletService: any

  constructor(walletService: any) {
    super()
    this.walletService = walletService
  }

  newAccount = (accountAddress: string) => {
    this.emit(Events.newAccount, accountAddress)
  }

  newNetwork = (networkId: number) => {
    this.emit(Events.newNetwork, networkId)
  }

  newTransaction = (
    hash: string,
    from: string,
    to: string,
    input: string,
    type: string,
    status: string
  ) => {
    const normalizedTo = normalizeLockAddress(to)
    const normalizedFrom = normalizeLockAddress(from)
    const newTransaction = {
      hash,
      from: normalizedFrom,
      for: normalizedFrom,
      to: normalizedTo,
      input,
      type,
      status,
      blockNumber: Number.MAX_SAFE_INTEGER,
    }

    this.emit(Events.newTransaction, newTransaction)
  }

  handleError = (error: any) => {
    // TODO: why do we wrap this instead of just emitting the error
    // from walletservice?
    if (error.message === 'FAILED_TO_PURCHASE_KEY') {
      this.emit(Events.error, new Error('purchase failed'))
    }
  }
}

export default BlockchainWriter
