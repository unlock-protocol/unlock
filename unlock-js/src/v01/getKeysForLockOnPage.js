import * as UnlockV01 from 'unlock-abi-0-1'

/**
 * This loads and returns the keys for a lock per page
 * we fetch byPage number of keyOwners and dispatch for futher details.
 *
 * This method will attempt to retrieve keyholders directly from the smart contract, if this
 * raises and exception the code will attempt to iteratively retrieve the keyholders.
 * (Relevant to issue #1116)
 * @param {PropTypes.string}
 * @param {PropTypes.integer}
 * @param {PropTypes.integer}
 */
export default function(lock, page, byPage) {
  const lockContract = new this.web3.eth.Contract(
    UnlockV01.PublicLock.abi,
    lock
  )

  this._genKeyOwnersFromLockContract(lock, lockContract, page, byPage).then(
    keyPromises => {
      if (keyPromises.length == 0) {
        this._genKeyOwnersFromLockContractIterative(
          lock,
          lockContract,
          page,
          byPage
        ).then(keyPromises => this._emitKeyOwners(lock, page, keyPromises))
      } else {
        this._emitKeyOwners(lock, page, keyPromises)
      }
    }
  )
}
