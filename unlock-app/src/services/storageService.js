import axios from 'axios'
import { EventEmitter } from 'events'

// The goal of the success and failure objects is to act as a registry of events
// that StorageService will emit. Nothing should be emitted that isn't in one of
// these objects, and nothing that isn't emitted should be in one of these
// objects.
export const success = {
  addPaymentMethod: 'addPaymentMethod.success',
  storeTransaction: 'storeTransaction.success',
  getTransactionHashesSentBy: 'getTransactionHashesSentBy.success',
  lockLookUp: 'lockLookUp.success',
  storeLockDetails: 'storeLockDetails.success',
  createUser: 'createUser.success',
  updateUser: 'updateUser.success',
  getUserPrivateKey: 'getUserPrivateKey.success',
  getUserRecoveryPhrase: 'getUserRecoveryPhrase.success',
  getCards: 'getCards.success',
  keyPurchase: 'keyPurchase.success',
}

export const failure = {
  addPaymentMethod: 'addPaymentMethod.failure',
  storeTransaction: 'storeTransaction.failure',
  getTransactionHashesSentBy: 'getTransactionHashesSentBy.failure',
  lockLookUp: 'lockLookUp.failure',
  storeLockDetails: 'storeLockDetails.failure',
  createUser: 'createUser.failure',
  updateUser: 'updateUser.failure',
  getUserPrivateKey: 'getUserPrivateKey.failure',
  getUserRecoveryPhrase: 'getUserRecoveryPhrase.failure',
  getCards: 'getCards.failure',
  keyPurchase: 'keyPurchase.failure',
}

export class StorageService extends EventEmitter {
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
      this.emit(success.storeLockDetails, lockDetails.message.lock.address)
    } catch (error) {
      this.emit(failure.storeLockDetails, {
        address: lockDetails.message.lock.address,
        error,
      })
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
      await axios.post(`${this.host}/users/`, user, opts)
      this.emit(success.createUser, user.message.user.publicKey)
    } catch (error) {
      this.emit(failure.createUser, error)
    }
  }

  /**
   * Updates a user's private key, using their email address as key. In the case
   * of failure a rejected promise is returned to the caller.
   *
   * @param {*} email
   * @param {*} user
   * @param {*} token
   * @returns {Promise<*>}
   */
  async updateUserEncryptedPrivateKey(emailAddress, user, token) {
    const opts = {}
    if (token) {
      // TODO: tokens aren't optional
      opts.headers = this.genAuthorizationHeader(token)
    }
    try {
      await axios.put(
        `${this.host}/users/${encodeURIComponent(
          emailAddress
        )}/passwordEncryptedPrivateKey`,
        user,
        opts
      )
      this.emit(success.updateUser, { emailAddress, user })
    } catch (error) {
      this.emit(failure.updateUser, { emailAddress, error })
    }
  }

  /**
   * Adds a payment method to a user's account, using their email address as key.
   *
   * @param {*} emailAddress
   * @param {*} paymentDetails structured_data used to generate signature
   * @param {*} token
   */
  async addPaymentMethod(emailAddress, stripeTokenId, token) {
    const opts = {}
    if (token) {
      // TODO: tokens aren't optional
      opts.headers = this.genAuthorizationHeader(token)
    }
    try {
      await axios.put(
        `${this.host}/users/${encodeURIComponent(emailAddress)}/paymentdetails`,
        stripeTokenId,
        opts
      )
      this.emit(success.addPaymentMethod, { emailAddress, stripeTokenId })
    } catch (error) {
      this.emit(failure.addPaymentMethod, { emailAddress, error })
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
        this.emit(success.getUserPrivateKey, {
          emailAddress,
          passwordEncryptedPrivateKey:
            response.data.passwordEncryptedPrivateKey,
        })
        // We also return from this one so that we can use the value directly to
        // avoid passing the password around too much.
        return response.data.passwordEncryptedPrivateKey
      }
    } catch (error) {
      this.emit(failure.getUserPrivateKey, { emailAddress, error })
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
      const response = await axios.get(
        `${this.host}/users/${encodeURIComponent(emailAddress)}/recoveryphrase`,
        null,
        opts
      )
      if (response.data && response.data.recoveryPhrase) {
        const recoveryPhrase = response.data.recoveryPhrase
        this.emit(success.getUserRecoveryPhrase, {
          emailAddress,
          recoveryPhrase,
        })
      }
    } catch (error) {
      this.emit(failure.getUserRecoveryPhrase, { emailAddress, error })
    }
  }

  /**
   * Given a user's email address, retrieves the payment methods associated with
   * their account. Except in event of error, will always respond with an array
   * of 0 or more elements.
   */
  async getCards(emailAddress) {
    try {
      const response = await axios.get(
        `${this.host}/users/${encodeURIComponent(emailAddress)}/cards`
      )
      this.emit(success.getCards, response.data)
    } catch (error) {
      this.emit(failure.getCards, { error })
    }
  }

  async purchaseKey(purchaseRequest, token) {
    const opts = {
      headers: this.genAuthorizationHeader(token),
    }
    try {
      await axios.post(`${this.host}/purchase`, purchaseRequest, opts)
      this.emit(
        success.keyPurchase,
        purchaseRequest.message.purchaseRequest.lock
      )
    } catch (error) {
      this.emit(failure.keyPurchase, error)
    }
  }
}
