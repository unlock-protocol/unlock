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
    const paylaod = {
      transactionHash,
      sender: senderAddress,
      recipient: recipientAddress,
    }
    return axios.post(`${this.host}/transaction`, paylaod)
  }

  /**
   * Gets all the transactions sent by a given address.
   * Returns an empty array by default
   * TODO: conider a more robust url building
   * @param {*} senderAddress
   */
  getTransactionsHashesSentBy(senderAddress) {
    return axios
      .get(`${this.host}/transactions?sender=${senderAddress}`)
      .then(response => {
        if (response.data && response.data.transactions) {
          return response.data.transactions.map(t => t.transactionHash)
        }
        return []
      })
  }

  genAuthorizationHeader = token => {
    return { Authorization: ` Bearer ${token}` }
  }

  /**
   * Returns the name of undefined
   * @param {*} address
   */
  lockLookUp(address) {
    return axios.get(`${this.host}/lock/${address}`).then(result => {
      if (result.data && result.data.name) {
        return result.data.name
      }
      return null
    })
  }

  storeLockDetails(lock, token) {
    if (token) {
      return axios.post(`${this.host}/lock`, lock, {
        headers: this.genAuthorizationHeader(token),
      })
    } else {
      return axios.post(`${this.host}/lock`, lock)
    }
  }

  updateLockDetails(address, update, token) {
    if (token) {
      return axios.put(`${this.host}/lock/${address}`, update, {
        headers: this.genAuthorizationHeader(token),
      })
    } else {
      return axios.put(`${this.host}/lock/${address}`, update)
    }
  }
}
