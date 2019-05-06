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
   * @param {*} chain
   */
  storeTransaction(transactionHash, senderAddress, recipientAddress, chain) {
    const payload = {
      transactionHash,
      sender: senderAddress,
      recipient: recipientAddress,
      chain,
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
      return response.data.transactions.map(t => ({
        hash: t.transactionHash,
        network: t.chain,
        to: t.recipient,
        from: t.sender,
      }))
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
      // TODO: Token is no longer necessary here. Update this function and callsites.
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
