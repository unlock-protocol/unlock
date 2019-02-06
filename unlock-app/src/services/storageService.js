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

  genAuthorizationHeader = token => {
    return { Authorization: ` Bearer ${token}` }
  }

  lockLookUp(address) {
    return axios.get(`${this.host}/lock/${address}`)
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
