/**
 * This file is a thinner, leaner iteration on the data-iframe portion
 * of the paywall application. When completed, it will deprecate the
 * Mailbox.ts file and the blockchainHandler/ directory
 */

import { RawLocks, KeyResults, KeyResult } from '../unlockTypes'
import { normalizeLockAddress } from '../utils/normalizeAddresses'

export class BlockchainHandler {
  locks: RawLocks = {}
  keys: KeyResults = {}
  accountAddress: string | null = null

  // The list of lock addresses from the paywall configuration
  lockAddresses: string[] = []
  // TODO: provide types from unlock-js
  web3Service: any

  constructor(lockAddresses: string[], web3Service: any) {
    this.lockAddresses = lockAddresses
    this.web3Service = web3Service

    // Add web3service event listeners
    this.web3Service.on('lock.updated', this.updateLock)
    this.web3Service.on('key.updated', this.updateKey)

    // Start the process
    // TODO: error handling?
    this.lockAddresses.forEach(lockAddress =>
      this.web3Service.getLock(lockAddress)
    )
  }

  fetchKeys = () => {
    if (this.accountAddress) {
      this.lockAddresses.forEach(lockAddress => {
        this.web3Service.getKeyByLockForOwner(lockAddress, this.accountAddress)
      })
    }
  }

  setAccountAddress = (accountAddress: string) => {
    const normalizedAddress = accountAddress
    if (normalizedAddress !== this.accountAddress) {
      this.accountAddress = normalizedAddress
      // account changed, any keys currently in state belong to
      // someone else
      this.keys = {}
      this.fetchKeys()
    }
  }

  updateLock = (lockAddress: string, update: any) => {
    const normalizedAddress = normalizeLockAddress(lockAddress)

    const currentLock = this.locks[normalizedAddress] || {}

    this.locks[normalizedAddress] = {
      ...currentLock,
      ...update,
      // `update` may contain the lock address -- this way we always
      // use the normalized address instead of accidentally
      // overwriting.
      address: normalizedAddress,
    }
  }

  updateKey = (_: any, key: KeyResult) => {
    const normalizedAddress = normalizeLockAddress(key.lock)
    // note the `!`; that's an artifact of the old blockchain handler.
    // TODO: remove the possibility of a null key owner
    const normalizedOwnerAddress = normalizeLockAddress(key.owner!)

    this.keys[normalizedAddress] = {
      expiration: key.expiration,
      owner: normalizedOwnerAddress,
      lock: normalizedAddress,
    }
  }
}
