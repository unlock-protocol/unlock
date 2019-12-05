import { RawLocks, Keys } from '../unlockTypes'
import { normalizeLockAddress } from '../utils/normalizeAddresses'

export class ChainData {
  locks: RawLocks = {}
  keys: Keys = {}

  // The list of lock addresses from the paywall configuration
  lockAddresses: string[] = []
  // TODO: provide types from unlock-js
  web3Service: any

  constructor(lockAddresses: string[], web3Service: any) {
    this.lockAddresses = lockAddresses
    this.web3Service = web3Service

    // Add web3service event listeners
    this.web3Service.on('lock.updated', this.updateLock)

    // Start the process
    // TODO: error handling?
    this.lockAddresses.forEach(address => this.web3Service.getLock(address))
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
}
