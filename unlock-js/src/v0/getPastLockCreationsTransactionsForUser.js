import * as UnlockV0 from 'unlock-abi-0'

/**
 * This function is able to retrieve past transaction sent by a user to the Unlock smart contract
 * to create a new Lock.
 * @param {*} address
 */
export default function(address) {
  const unlock = new this.web3.eth.Contract(
    UnlockV0.Unlock.abi,
    this.unlockContractAddress
  )
  return this._getPastTransactionsForContract(unlock, 'NewLock', {
    lockOwner: address,
  })
}
