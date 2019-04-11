import axios from 'axios'

export default class StorageService {
  constructor(host) {
    this.host = host
  }

  /**
   * Stores transaction hashes and the sender
   * @param {*} transactionHash
   * @param {*} senderAddress
   * @param {*} recipientAddress
   */
  storeTransaction(transactionHash, senderAddress, recipientAddress) {
    const payload = {
      transactionHash,
      sender: senderAddress,
      recipient: recipientAddress,
    }
    return axios.post(`${this.host}/transaction`, payload)
  }

  /**
   * Gets all the transactions sent by a given address.
   * Returns an empty array by default
   * TODO: consider a more robust url building
   * @param {*} senderAddress
   */
  async getTransactionsHashesSentBy(senderAddress) {
    const response = await axios.get(
      `${this.host}/transactions?sender=${senderAddress}`
    )
    if (response.data && response.data.transactions) {
      return response.data.transactions.map(t => t.transactionHash)
    }
    return []
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
        return result.data.name
      }
      return Promise.reject(null)
    } catch (error) {
      return Promise.reject(error)
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
      opts.headers = this.genAuthorizationHeader(token)
    }
    try {
      return await axios.post(`${this.host}/lock`, lockDetails, opts)
    } catch (error) {
      return Promise.reject(error)
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
    try {
      return await axios.post(`${this.host}/users/`, user, {})
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
  async getUserPrivateKey(emailAddress, token) {
    const opts = {}
    if (token) {
      opts.headers = this.genAuthorizationHeader(token)
    }
    try {
      return await axios.get(
        `${this.host}/users/${encodeURIComponent(emailAddress)}/privatekey`,
        null,
        opts
      )
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
  async getUserRecoveryPhrase(emailAddress, token) {
    const opts = {}
    if (token) {
      opts.headers = this.genAuthorizationHeader(token)
    }
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
