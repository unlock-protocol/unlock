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

  /**
   * BlockchainHandler can be constructed immediately when there is an
   * available web3Service, but it doesn't do anything until
   * initialized with lock addresses from the configuration and the
   * user's account address.
   *
   * The state cannot be reset. If any condition occurs (e.g. account
   * address changed) which invalidates data, this object should be
   * destroyed and replaced with a new one.
   */
  constructor(web3Service: any) {
    this.web3Service = web3Service

    // Add web3service event listeners
    this.web3Service.on('lock.updated', this.updateLock)
    this.web3Service.on('key.updated', this.updateKey)
  }

  init = (lockAddresses: string[], accountAddress: string) => {
    this.lockAddresses = lockAddresses
    this.accountAddress = accountAddress

    this.lockAddresses.forEach(lockAddress => {
      this.web3Service.getLock(lockAddress)
      this.web3Service.getKeyByLockForOwner(lockAddress, this.accountAddress)
    })
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
