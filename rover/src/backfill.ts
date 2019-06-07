import { ethers } from 'ethers'

export default class Backfiller {
  emitter

  constructor(emitter) {
    this.emitter = emitter
  }
  backfill = async address => {
    let etherscanProvider = new ethers.providers.EtherscanProvider()
    let history = await etherscanProvider.getHistory(address)

    history.forEach(tx => {
      this.emitter.emit('transaction', tx.hash)
    })
  }
}
