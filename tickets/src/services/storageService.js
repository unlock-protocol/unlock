import axios from 'axios'
import { EventEmitter } from 'events'

// The goal of the success and failure objects is to act as a registry of events
// that StorageService will emit. Nothing should be emitted that isn't in one of
// these objects, and nothing that isn't emitted should be in one of these
// objects.
export const success = {
  getLockAddressesForUser: 'getLockAddressesForUser.success',
}

export const failure = {
  getLockAddressesForUser: 'getLockAddressesForUser.failure',
}

export class StorageService extends EventEmitter {
  constructor(host) {
    super()
    this.host = host
  }

  /**
   * Retrieves the list of known lock adresses for this user
   * [Note: locksmith may not know of all the locks by a user at a given point as the lock may not be deployed yet, or the lock might have been transfered]
   * @param {*} address
   */
  async getLockAddressesForUser(address) {
    try {
      const result = await axios.get(`${this.host}/${address}/locks`)
      if (result.data && result.data.locks) {
        this.emit(
          success.getLockAddressesForUser,
          result.data.locks.map(lock => lock.address)
        )
      } else {
        this.emit(
          failure.getLockAddressesForUser,
          'We could not retrieve lock addresses for that user'
        )
      }
    } catch (error) {
      this.emit(failure.getLockAddressesForUser, error)
    }
  }
}
