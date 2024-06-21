import {
  LocksmithService,
  LocksmithServiceConfiguration,
} from '@unlock-protocol/unlock-js'

import { EventEmitter } from 'events'

// The goal of the success and failure objects is to act as a registry of events
// that StorageService will emit. Nothing should be emitted that isn't in one of
// these objects, and nothing that isn't emitted should be in one of these
// objects.
export const success = {
  createUser: 'createUser.success',
  updateUser: 'updateUser.success',
  getUserPrivateKey: 'getUserPrivateKey.success',
  getUserRecoveryPhrase: 'getUserRecoveryPhrase.success',
  ejectUser: 'ejectUser.success',
}

export const failure = {
  createUser: 'createUser.failure',
  updateUser: 'updateUser.failure',
  getUserPrivateKey: 'getUserPrivateKey.failure',
  getUserRecoveryPhrase: 'getUserRecoveryPhrase.failure',
  ejectUser: 'ejectUser.failure',
}

// This approach is deprecated and we should move to using '~/config/storage'
export class StorageService extends EventEmitter {
  public host: string

  public locksmith: LocksmithService

  constructor(host: string) {
    super()
    this.host = host
    this.locksmith = new LocksmithService(
      new LocksmithServiceConfiguration({
        basePath: host,
      })
    )
  }

  genAuthorizationHeader(token: string) {
    return { Authorization: ` Bearer ${token}` }
  }

  /**
   * Creates a user. In the case of failure a rejected promise is returned to
   * the caller.  On success, the encrypted key payload and the credentials are
   * emitted so that the user can automatically be signed in.
   *
   * @param {*} user
   * @param {string} emailAddress (do not send to locksmith)
   * @param {string} password (do not send to locksmith)
   * @returns {Promise<*>}
   */

  async createUser(user: any): Promise<any> {
    return fetch(`${this.host}/users/`, {
      method: 'POST',
      body: JSON.stringify(user),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  // TODO: Depracate after NextAuth is fully implemented
  async userExist(emailAddress: string) {
    try {
      const endpoint = `${this.host}/users/${emailAddress}`

      const response = await fetch(endpoint, {
        method: 'GET',
      })
      return response.status === 200
    } catch (error) {
      return false
    }
  }
}
