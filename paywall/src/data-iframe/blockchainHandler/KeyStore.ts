import { EventEmitter } from 'events'
import { KeyResult } from './blockChainTypes'

/**
 * KeyStore holds the keys corresponding to the locks on the
 * page. When it has been filled up (i.e., `addKey()` has been called
 * `numLocks` times), it emits an event containing all the currently
 * valid keys.
 */
export default class KeyStore extends EventEmitter {
  keys: { [lockAddress: string]: KeyResult | null }

  constructor(lockAddresses: string[]) {
    super()
    this.keys = {}
    lockAddresses.forEach(lockAddress => {
      this.keys[lockAddress] = null
    })
  }

  hasAllKeys(): boolean {
    return Object.values(this.keys).every(value => value !== null)
  }

  addKey(key: KeyResult) {
    const lockAddress = key.lock
    this.keys[lockAddress] = key

    // Once we've received all the keys we expect, we should emit the valid ones.
    if (this.hasAllKeys()) {
      this.emitValidKeys()
    }
  }

  emitValidKeys() {
    this.emit('keyStore.validKeys', this.keys)
  }
}
