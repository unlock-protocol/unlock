import { ZERO } from '../../constants'
import preparePurchaseTx from './preparePurchaseKeysTx'
import approveAllowance from '../utils/approveAllowance'

/**
 * Purchase key function. This implementation requires the following
 * @param {object} params:
 * - {PropTypes.arrayOf(PropTypes.address)} lockAddress
 * - {PropTypes.arrayOf(PropTypes.address)} owners
 * - {PropTypes.arrayOf(string)} keyPrices
 * - {PropTypes.address} erc20Address
 * - {number} decimals
 * - {PropTypes.arrayOf(PropTypes.address)} referrers (address which will receive UDT - if applicable)
 * - {PropTypes.arrayOf(number)} recurringPayments the number of payments to allow for each keys. If the array is set, the keys are considered using recurring ERRC20 payments).
 * - {PropTypes.arrayOf(PropTypes.array[bytes])} _data (array of array of bytes, not used in transaction but can be used by hooks)
 * @param {function} callback invoked with the transaction hash
 */
export default async function (options, transactionOptions = {}, callback) {
  const { lockAddress } = options
  const lockContract = await this.getLockContract(lockAddress)

  // get the tx data
  const txRequests = await preparePurchaseTx.bind(this)(options, this.provider)

  let approvalTransactionRequest, purchaseTransactionRequest
  if (txRequests.length === 2) {
    // execute approval if necessary
    ;[approvalTransactionRequest, purchaseTransactionRequest] = txRequests
    await this.signer.sendTransaction(approvalTransactionRequest)
  } else {
    ;[purchaseTransactionRequest] = txRequests
  }

  // Estimate gas. Bump by 30% because estimates are wrong!
  if (!transactionOptions.gasLimit) {
    const preserveGasSettings =
      transactionOptions.maxFeePerGas || transactionOptions.gasPrice
    try {
      // To get good estimates we need the gas price, because it matters in the actual execution (UDT calculation takes it into account)
      // TODO remove once we move to use block.baseFee in UDT calculation
      if (!preserveGasSettings) {
        const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } =
          await this.provider.getFeeData()

        if (maxFeePerGas && maxPriorityFeePerGas) {
          transactionOptions.maxFeePerGas = maxFeePerGas
          transactionOptions.maxPriorityFeePerGas = maxPriorityFeePerGas
        } else {
          transactionOptions.gasPrice = gasPrice
        }
      }
      const gasLimit = await this.signer.estimateGas(purchaseTransactionRequest)
      transactionOptions.gasLimit = (gasLimit * 13n) / 10n
    } catch (error) {
      console.error(
        'We could not estimate gas ourselves. Let wallet do it.',
        error
      )
    }
    if (!preserveGasSettings) {
      delete transactionOptions.maxFeePerGas
      delete transactionOptions.maxPriorityFeePerGas
      delete transactionOptions.gasPrice
    }
  }

  if (transactionOptions.runEstimate) {
    const estimate = this.signer.estimateGas(purchaseTransactionRequest)
    return {
      purchaseTransactionRequest,
      estimate,
    }
  }

  const transactionPromise = this.signer.sendTransaction(
    purchaseTransactionRequest
  )

  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  // Let's now wait for the transaction to go thru to return the token id
  const receipt = await this.provider.waitForTransaction(hash)

  if (receipt.status === 0) {
    throw new Error('Transaction failed')
  }

  const transferEvents = receipt.logs
    .map((log) => {
      if (log.address.toLowerCase() !== lockAddress.toLowerCase()) return // Some events are triggered by the ERC20 contract
      return lockContract.interface.parseLog(log)
    })
    .filter((evt) => evt?.fragment && evt.fragment?.name === 'Transfer')

  if (transferEvents && transferEvents.length) {
    return transferEvents.map((v) => v.args.tokenId.toString())
  }
  // There was no Transfer log (transaction failed?)
  return null
}
