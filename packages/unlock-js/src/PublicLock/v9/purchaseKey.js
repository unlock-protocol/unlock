import { ZERO } from '../../constants'
import preparePurchaseKeyTx from './preparePurchaseKeyTx'

/**
 * Purchase key function. This implementation requires the following
 * @param {object} params:
 * - {PropTypes.address} lockAddress
 * - {PropTypes.address} owner
 * - {string} keyPrice
 * - {PropTypes.address} erc20Address
 * - {number} decimals
 * - {PropTypes.address} referrer (address which will receive UDT - if applicable)
 * - {PropTypes.array[bytes]} data (array of bytes, not used in transaction but can be used by hooks)
 * @param {function} callback invoked with the transaction hash
 */
export default async function (
  {
    lockAddress,
    owner,
    keyManager,
    keyPrice,
    erc20Address,
    decimals,
    referrer,
    data,
  },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)

  // get the tx data
  const txRequests = await preparePurchaseKeyTx.bind(this)(
    {
      lockAddress,
      owner,
      keyManager,
      keyPrice,
      erc20Address,
      decimals,
      referrer,
      data,
    },
    this.provider
  )

  // Only ask for approval if the lock is priced in ERC20
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

  if (transferEvent) {
    return transferEvent.args.tokenId.toString()
  }
  // There was no Transfer log (transaction failed?)
  return null
}
