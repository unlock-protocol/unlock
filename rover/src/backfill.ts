import { ethers } from "ethers";

export default class Backfiller {
  emitter;

  constructor(emitter) {
    this.emitter = emitter;
  }
  backfill = address => {
    let etherscanProvider = new ethers.providers.EtherscanProvider();
    etherscanProvider.getHistory(address).then(history => {
      history.forEach(tx => {
        this.emitter.emit("transaction", tx.hash);
      });
    });
  };
}
