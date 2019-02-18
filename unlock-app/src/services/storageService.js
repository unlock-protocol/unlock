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
   * Returns the name of undefined
   * Note that we swallow errors here for now...
   * @param {*} address
   */
  async lockLookUp(address) {
    try {
      const result = await axios.get(`${this.host}/lock/${address}`)
      if (result.data && result.data.name) {
        return result.data.name
      }
      return null
    } catch (err) {
      return null
    }
  }

  /**
   * Note that we swallow errors here for now...
   * @param {*} lock
   * @param {*} token
   */
  async storeLockDetails(lock, token) {
    const opts = {}
    if (token) {
      opts.headers = this.genAuthorizationHeader(token)
    }

    try {
      return await axios.post(`${this.host}/lock`, lock, opts)
    } catch (err) {
      return null
    }
  }

  /**
   * Note that we swallow errors here for now...
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
    } catch (err) {
      return null
    }
  }
}
