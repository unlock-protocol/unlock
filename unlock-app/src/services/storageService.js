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
  getLockAddressesForUser: 'getLockAddressesForUser.success',
  storeLockDetails: 'storeLockDetails.success',
  createUser: 'createUser.success',
  updateUser: 'updateUser.success',
  getUserPrivateKey: 'getUserPrivateKey.success',
  getUserRecoveryPhrase: 'getUserRecoveryPhrase.success',
  getCards: 'getCards.success',
  keyPurchase: 'keyPurchase.success',
  ejectUser: 'ejectUser.success',
  getMetadataFor: 'getMetadataFor.success',
  getBulkMetadataFor: 'getBulkMetadataFor.success',
}

export const failure = {
  addPaymentMethod: 'addPaymentMethod.failure',
  storeTransaction: 'storeTransaction.failure',
  getTransactionHashesSentBy: 'getTransactionHashesSentBy.failure',
  getLockAddressesForUser: 'getLockAddressesForUser.failure',
  storeLockDetails: 'storeLockDetails.failure',
  createUser: 'createUser.failure',
  updateUser: 'updateUser.failure',
  getUserPrivateKey: 'getUserPrivateKey.failure',
  getUserRecoveryPhrase: 'getUserRecoveryPhrase.failure',
  getCards: 'getCards.failure',
  keyPurchase: 'keyPurchase.failure',
  ejectUser: 'ejectUser.failure',
  getMetadataFor: 'getMetadataFor.failure',
  getBulkMetadataFor: 'getBulkMetadataFor.failure',
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
   * @paran {*} data (input of transaction, optional)
   */
  async storeTransaction(
    transactionHash,
    senderAddress,
    recipientAddress,
    chain,
    beneficiaryAddress /** Used in the context of key purchase *for* */,
    data
  ) {
    const payload = {
      transactionHash,
      sender: senderAddress,
      for: beneficiaryAddress || senderAddress,
      recipient: recipientAddress,
      data,
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
   * Gets all the transactions sent by a given address, in the last 24 hours
   * Returns an empty array by default
   * TODO: consider a more robust url building
   * @param {*} senderAddress
   */
  async getRecentTransactionsHashesSentBy(senderAddress) {
    let hashes = [] // TODO This is badly named! this returns full transactions
    try {
      const oneDayAgo = new Date().getTime() - 1000 * 60 * 60 * 24
      const response = await axios.get(
        `${this.host}/transactions?sender=${senderAddress}&createdAfter=${oneDayAgo}`
      )
      if (response.data && response.data.transactions) {
        hashes = response.data.transactions.map((t) => ({
          hash: t.transactionHash,
          network: t.chain,
          to: t.recipient,
          from: t.sender,
        }))
      }
      this.emit(success.getTransactionHashesSentBy, { senderAddress, hashes })
      return { senderAddress, hashes }
    } catch (error) {
      this.emit(failure.getTransactionHashesSentBy, error)
      return { senderAddress, hashes } // TODO: consider if thos should be an error
    }
  }

  genAuthorizationHeader = (token) => {
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
  async createUser(user, emailAddress, password) {
    const opts = {}
    return axios.post(`${this.host}/users/`, user, opts)
    // return {
    //   passwordEncryptedPrivateKey:
    //     user.message.user.passwordEncryptedPrivateKey,
    //   emailAddress,
    //   password,
    //   recoveryPhrase: response.data.recoveryPhrase,
    // }
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
    opts.headers = this.genAuthorizationHeader(token)
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
        const { recoveryPhrase } = response.data
        this.emit(success.getUserRecoveryPhrase, {
          emailAddress,
          recoveryPhrase,
        })
        return {
          emailAddress,
          recoveryPhrase,
        }
      }
    } catch (error) {
      this.emit(failure.getUserRecoveryPhrase, { emailAddress, error })
      return {}
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
      const response = await axios.post(
        `${this.host}/purchase`,
        purchaseRequest,
        opts
      )
      this.emit(
        success.keyPurchase,
        purchaseRequest.message.purchaseRequest.lock
      )
      return response.data.transactionHash
    } catch (error) {
      this.emit(failure.keyPurchase, error)
    }
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
          result.data.locks.map((lock) => lock.address)
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

  /**
   * Ejects a user
   *
   * @param {*} publicKey
   * @param {*} data structured_data used to generate signature
   * @param {*} token
   */
  async ejectUser(publicKey, data, token) {
    const opts = {}
    opts.headers = this.genAuthorizationHeader(btoa(token))
    try {
      await axios.post(`${this.host}/users/${publicKey}/eject`, data, opts)
      this.emit(success.ejectUser, { publicKey })
    } catch (error) {
      this.emit(failure.ejectUser, { publicKey })
    }
  }

  /**
   * Given a lock address and a typed data signature, get the metadata
   * (public and protected) associated with each key on that lock.
   * @param {string} lockAddress
   * @param {string} signature
   * @param {*} data
   */
  async getBulkMetadataFor(lockAddress, signature, data, network) {
    const stringData = JSON.stringify(data)
    const opts = {
      headers: {
        Authorization: `Bearer-Simple ${Buffer.from(signature).toString(
          'base64'
        )}`,
        'Content-Type': 'application/json',
      },
      // No body allowed in GET, so these are passed as query params for this
      // call.
      params: {
        data: stringData,
        signature,
      },
    }
    try {
      const result = await axios.get(
        `${this.host}/api/key/${lockAddress}/keyHolderMetadata?chain=${network}`,
        opts
      )

      this.emit(success.getBulkMetadataFor, lockAddress, result.data)
      return result.data
    } catch (error) {
      this.emit(failure.getBulkMetadataFor, error)
    }
  }

  /**
   * Given a lock address and a typed data signature, connect to stripe
   * @param {string} lockAddress
   * @param {string} signature
   * @param {*} data
   */
  async getStripeConnect(lockAddress, signature, data) {
    const opts = {
      headers: {
        Authorization: `Bearer-Simple ${Buffer.from(signature).toString(
          'base64'
        )}`,
        'Content-Type': 'application/json',
      },
      params: {
        data: JSON.stringify(data),
        signature,
      },
    }
    const result = await axios.get(
      `${this.host}/lock/${lockAddress}/stripe`,
      opts
    )

    return result?.data
  }

  async updateLockIcon(lockAddress, signature, data, icon) {
    const opts = {
      headers: {
        Authorization: `Bearer-Simple ${Buffer.from(signature).toString(
          'base64'
        )}`,
        'Content-Type': 'application/json',
      },
    }

    const result = await axios.post(
      `${this.host}/lock/${lockAddress}/icon`,
      { ...data, icon },
      opts
    )

    return result?.data
  }

  /**
   * Saves a user metadata for a lock
   * @param {*} lockAddress
   * @param {*} userAddress
   * @param {*} payload
   * @param {*} signature
   * @param {*} network
   * @returns
   */
  async setUserMetadataData(
    lockAddress,
    userAddress,
    payload,
    signature,
    network
  ) {
    let url = `${this.host}/api/key/${lockAddress}/user/${userAddress}`
    if (network) {
      url = `${url}?chain=${network}`
    }

    return fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer-Simple ${Buffer.from(signature).toString(
          'base64'
        )}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  }

  /**
   * Saves a key metadata for a lock
   * @param {*} lockAddress
   * @param {*} userAddress
   * @param {*} payload
   * @param {*} signature
   * @param {*} network
   * @returns
   */
  async setKeyMetadata(lockAddress, keyId, payload, signature, network) {
    let url = `${this.host}/api/key/${lockAddress}/${keyId}`
    if (network) {
      url = `${url}?chain=${network}`
    }

    return fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${Buffer.from(signature).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  }

  /**
   *
   * @param {*} lockAddress
   * @param {*} keyId
   * @param {*} payload
   * @param {*} signature
   * @param {*} network
   * @returns
   */
  async getKeyMetadata(lockAddress, keyId, payload, signature, network) {
    try {
      let url = `${this.host}/api/key/${lockAddress}/${keyId}`
      if (network) {
        url = `${url}?chain=${network}`
      }

      const options = {
        headers: {
          'Content-Type': 'application/json',
        },
      }
      if (signature) {
        options.headers.Authorization = `Bearer ${Buffer.from(
          signature
        ).toString('base64')}`
      }

      const response = await axios.get(url, options)
      return response?.data
    } catch (error) {
      console.error(error)
      return {}
    }
  }

  async getDataForUserAndCaptcha(account, captchaValue) {
    try {
      const url = `${this.host}/api/captcha`

      const options = {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          account,
          captchaValue,
        },
      }

      const response = await axios.get(url, options)
      return response?.data
    } catch (error) {
      console.error(error)
      return {}
    }
  }

  async getKeyGranter(network) {
    try {
      const url = `${this.host}/purchase`

      const options = {
        headers: {
          'Content-Type': 'application/json',
        },
      }

      const response = await axios.get(url, options)
      return response?.data[network].address
    } catch (error) {
      console.error(error)
      return ''
    }
  }
}
