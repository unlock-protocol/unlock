import axios from 'axios'
import { EventEmitter } from 'events'

export const success = {
  storeTransaction: 'storeTransaction.success',
  getTransactionHashesSentBy: 'getTransactionHashesSentBy.success',
  lockLookUp: 'lockLookUp.success',
  storeLockDetails: 'storeLockDetails.success',
}

export const failure = {
  storeTransaction: 'storeTransaction.failure',
  getTransactionHashesSentBy: 'getTransactionHashesSentBy.failure',
  lockLookUp: 'lockLookUp.failure',
  storeLockDetails: 'storeLockDetails.failure',
}

export default class StorageService extends EventEmitter {
  constructor(host) {
    super()
    this.host = host
  }

  /**
   * Stores transaction hashes and the sender
   * @param {*} transactionHash
   * @param {*} senderAddress
   * @param {*} recipientAddress
   * @param {*} chain
   */
  async storeTransaction(
    transactionHash,
    senderAddress,
    recipientAddress,
    chain
  ) {
    const payload = {
      transactionHash,
      sender: senderAddress,
      recipient: recipientAddress,
      chain,
    }
    try {
      await axios.post(`${this.host}/transaction`, payload)
      this.emit(success.storeTransaction, transactionHash)
    } catch (error) {
      this.emit(failure.storeTransaction, error)
    }
  }

  /**
   * Gets all the transactions sent by a given address.
   * Returns an empty array by default
   * TODO: consider a more robust url building
   * @param {*} senderAddress
   */
  async getTransactionsHashesSentBy(senderAddress) {
    try {
      const response = await axios.get(
        `${this.host}/transactions?sender=${senderAddress}`
      )
      let hashes = []
      if (response.data && response.data.transactions) {
        hashes = response.data.transactions.map(t => ({
          hash: t.transactionHash,
          network: t.chain,
          to: t.recipient,
          from: t.sender,
        }))
      }
      this.emit(success.getTransactionHashesSentBy, { senderAddress, hashes })
    } catch (error) {
      this.emit(failure.getTransactionHashesSentBy, error)
    }
  }

  genAuthorizationHeader = token => {
    return { Authorization: ` Bearer ${token}` }
  }

  /**
   * Returns the name of the request Lock,
   * in a failure scenario a rejected promise is returned
   * to the caller.
   *
   * @param {*} address
   */
  async lockLookUp(address) {
    try {
      const result = await axios.get(`${this.host}/lock/${address}`)
      if (result.data && result.data.name) {
        const name = result.data.name
        this.emit(success.lockLookUp, { address, name })
      } else {
        this.emit(failure.lockLookUp, 'No name for this lock.')
      }
    } catch (error) {
      this.emit(failure.lockLookUp, error)
    }
  }

  /**
   * Store the details of the provide Lock. In the case of failure a rejected promise is
   * returned to the caller.
   *
   * @param {*} lockDetails
   * @param {*} token
   */
  async storeLockDetails(lockDetails, token) {
    const opts = {}
    if (token) {
      // TODO: Token is no longer necessary here. Update this function and callsites.
      opts.headers = this.genAuthorizationHeader(token)
    }
    try {
      await axios.post(`${this.host}/lock`, lockDetails, opts)
      this.emit(success.storeLockDetails, lockDetails.address)
    } catch (error) {
      this.emit(failure.storeLockDetails, {
        address: lockDetails.address,
        error,
      })
    }
  }

  /**
   *  Updates a lock with with details provided. In the case of failure a rejected promise is
   * returned to the caller.
   *
   * @param {*} address
   * @param {*} update
   * @param {*} token
   */
  async updateLockDetails(address, update, token) {
    const opts = {}
    if (token) {
      // TODO: Tokens aren't optional
      opts.headers = this.genAuthorizationHeader(token)
    }
    try {
      return await axios.put(`${this.host}/lock/${address}`, update, opts)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Creates a user. In the case of failure a rejected promise is returned to the caller.
   *
   * @param {*} user
   * @returns {Promise<*>}
   */
  async createUser(user) {
    const opts = {}
    try {
      return await axios.post(`${this.host}/users/`, user, opts)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Updates a user, using their email address as key. In the case of failure a rejected promise
   * is returned to the caller.
   *
   * @param {*} email
   * @param {*} user
   * @param {*} token
   * @returns {Promise<*>}
   */
  async updateUser(email, user, token) {
    const opts = {}
    if (token) {
      // TODO: tokens aren't optional
      opts.headers = this.genAuthorizationHeader(token)
    }
    try {
      return await axios.put(
        `${this.host}/users/${encodeURIComponent(email)}`,
        user,
        opts
      )
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Given a user's email address, retrieves their private key. In the case of failure a rejected promise
   * is returned to the caller.
   * @param {*} emailAddress
   * @param {*} token
   * @returns {Promise<*>}
   */
  async getUserPrivateKey(emailAddress) {
    const opts = {}
    try {
      const response = await axios.get(
        `${this.host}/users/${encodeURIComponent(emailAddress)}/privatekey`,
        null,
        opts
      )
      if (response.data && response.data.passwordEncryptedPrivateKey) {
        return response.data.passwordEncryptedPrivateKey
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Given a user's email address, retrieves their recovery phrase. In the case of failure a rejected promise
   * is returned to the caller.
   * @param {*} emailAddress
   * @param {*} token
   * @returns {Promise<*>}
   */
  async getUserRecoveryPhrase(emailAddress) {
    const opts = {}
    try {
      return await axios.get(
        `${this.host}/users/${encodeURIComponent(emailAddress)}/recoveryphrase`,
        null,
        opts
      )
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
