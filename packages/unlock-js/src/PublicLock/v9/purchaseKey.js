import { ZERO } from '../../constants'
import { approveTransfer, getAllowance } from '../../erc20'
import formatKeyPrice from '../utils/formatKeyPrice'
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

  if (!owner) {
    owner = await this.signer.getAddress()
  }

  if (!referrer) {
    referrer = ZERO
  }

  if (!keyManager) {
    keyManager = ZERO
  }

  if (!data) {
    data = []
  }

  // If erc20Address was not provided, get it
  if (!erc20Address) {
    erc20Address = await lockContract.tokenAddress()
  }
  let actualAmount
  if (!keyPrice) {
    // We might not have the keyPrice, in which case, we need to retrieve from the the lock!
    actualAmount = await lockContract.keyPrice()
  } else {
    actualAmount = await formatKeyPrice(
      keyPrice,
      erc20Address,
      decimals,
      this.provider
    )
  }

  if (erc20Address && erc20Address !== ZERO) {
    const approvedAmount = await getAllowance(
      erc20Address,
      lockAddress,
      this.provider,
      this.signer.address
    )
    if (!approvedAmount || approvedAmount.lt(actualAmount)) {
      await (
        await approveTransfer(
          erc20Address,
          lockAddress,
          actualAmount,
          this.provider,
          this.signer
        )
      ).wait()
    }
  } else {
    transactionOptions.value = actualAmount
  }

  // Estimate gas. Bump by 30% because estimates are wrong!
  if (!transactionOptions.gasLimit) {
    try {
      // To get good estimates we need the gas price, because it matters in the actual execution (UDT calculation takes it into account)
      // TODO remove once we move to use block.baseFee in UDT calculation
      const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } =
        await this.provider.getFeeData()

      if (maxFeePerGas && maxPriorityFeePerGas) {
        transactionOptions.maxFeePerGas = maxFeePerGas
        transactionOptions.maxPriorityFeePerGas = maxPriorityFeePerGas
      } else {
        transactionOptions.gasPrice = gasPrice
      }
      const gasLimit = await lockContract.estimateGas.purchase(
        actualAmount,
        owner,
        referrer,
        keyManager,
        data,
        transactionOptions
      )
      // Remove the gas prices settings for the actual transaction (the wallet will set them)
      delete transactionOptions.maxFeePerGas
      delete transactionOptions.maxPriorityFeePerGas
      delete transactionOptions.gasPrice
      transactionOptions.gasLimit = gasLimit.mul(13).div(10).toNumber()
    } catch (error) {
      console.error(
        'We could not estimate gas ourselves. Let wallet do it.',
        error
      )
      delete transactionOptions.maxFeePerGas
      delete transactionOptions.maxPriorityFeePerGas
      delete transactionOptions.gasPrice
    }
  }

  const transactionPromise = lockContract.purchase(
    actualAmount,
    owner,
    referrer,
    keyManager,
    data,
    transactionOptions
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

  const parser = lockContract.interface
  const transferEvent = receipt.logs
    .map((log) => {
      if (log.address !== lockAddress) return // Some events are triggered by the ERC20 contract
      return parser.parseLog(log)
    })
    .filter((event) => {
      return event && event.name === 'Transfer'
    })[0]

  if (transferEvent) {
    return transferEvent.args.tokenId.toString()
  }
  // There was no Transfer log (transaction failed?)
  return null
}
