import * as UnlockV0 from 'unlock-abi-0'

/**
 * This function is able to retrieve the past transaction on a lock as long as these transactions
 * triggered events.
 * @param {*} lockAddress
 */
export default function(lockAddress) {
  const lockContract = new this.web3.eth.Contract(
    UnlockV0.PublicLock.abi,
    lockAddress
  )
  return this._getPastTransactionsForContract(lockContract, 'allevents')
}
