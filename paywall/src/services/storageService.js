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
  storeTransaction(
    transactionHash,
    senderAddress,
    recipientAddress,
    chain,
    data
  ) {
    const payload = {
      transactionHash,
      sender: senderAddress,
      recipient: recipientAddress,
      data,
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
        input: t.data,
        from: t.sender,
      }))
    }
    return []
  }
}
