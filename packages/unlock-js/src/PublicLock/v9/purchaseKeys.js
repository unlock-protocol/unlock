import preparePurchaseKeys from './preparePurchaseKeysTx'
import { ZERO } from '../../constants'

/**
 * Purchase key function. This implementation requires the followin
 * @param {object} params:
 * - {PropTypes.arrayOf(PropTypes.address)} lockAddress
 * - {PropTypes.arrayOf(PropTypes.address)} owners
 * - {PropTypes.arrayOf(string)} keyPrices
 * - {PropTypes.address} erc20Address
 * - {number} decimals
 * - {PropTypes.arrayOf(PropTypes.address)} referrers (address which will receive UDT - if applicable)
 * - {PropTypes.arrayOf(PropTypes.array[bytes])} _data (array of array of bytes, not used in transaction but can be used by hooks)
 * @param {function} callback invoked with the transaction hash
 * */

export default async function (params, transactionOptions = {}, callback) {
  const { lockAddress } = params
  const lockContract = await this.getLockContract(lockAddress)

  // get tx requests
  const txRequests = await preparePurchaseKeys.bind(this)(params, this.provider)

  // Only ask for approval if the lock is priced in ERC20
  let approvalTransactionRequest, purchaseTransactionRequests
  if ((await lockContract.tokenAddress()) !== ZERO) {
    // execute approval if necessary
    ;[approvalTransactionRequest, ...purchaseTransactionRequests] = txRequests
    await this.signer.sendTransaction(approvalTransactionRequest)
  } else {
    purchaseTransactionRequests = txRequests
  }

  // execute all purchases requests
  return await Promise.all(
    purchaseTransactionRequests.map(async (purchaseTransactionRequest) => {
      const transactionRequestPromise = this.signer.sendTransaction(
        purchaseTransactionRequest
      )
      const hash = await this._handleMethodCall(transactionRequestPromise)

      if (callback) {
        callback(null, hash, await transactionRequestPromise)
      }

      // Let's now wait for the transaction to go thru to return the token id
      const receipt = await this.provider.waitForTransaction(hash)

      if (receipt.status === 0) {
        throw new Error('Transaction failed')
      }

      const parser = lockContract.interface
      const transferEvent = receipt.logs
        .map((log) => {
          if (log.address.toLowerCase() !== lockAddress.toLowerCase()) return // Some events are triggered by the ERC20 contract
          return parser.parseLog(log)
        })
        .find((evt) => evt && evt?.fragment?.name === 'Transfer')
    })
  )
}
