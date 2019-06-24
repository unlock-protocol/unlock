import { ethers } from 'ethers'

export default class Backfiller {
  emitter
  network

  constructor(network, emitter) {
    this.emitter = emitter
    this.network = network
  }
  backfill = async address => {
    let etherscanProvider = new ethers.providers.EtherscanProvider(this.network)
    let history = await etherscanProvider.getHistory(address)

    history.forEach(tx => {
      this.emitter.emit('transaction', tx.hash)
    })
  }
}
