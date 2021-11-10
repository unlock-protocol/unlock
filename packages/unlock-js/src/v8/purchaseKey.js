import utils from '../utils'
import { ZERO } from '../constants'
import { approveTransfer, getErc20Decimals, getAllowance } from '../erc20'

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
  { lockAddress, owner, keyPrice, erc20Address, decimals, referrer, data },
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)

  if (!owner) {
    owner = await this.signer.getAddress()
  }

  if (!referrer) {
    referrer = ZERO
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
  } else if (decimals !== undefined && decimals !== null) {
    // We have have a keyPrice and decinals, we just use them.
    actualAmount = utils.toDecimal(keyPrice, decimals)
  } else {
    // get the decimals from the ERC20 contract or default to 18
    if (erc20Address && erc20Address !== ZERO) {
      decimals = await getErc20Decimals(erc20Address, this.provider)
    } else {
      decimals = 18
    }
    actualAmount = utils.toDecimal(keyPrice, decimals)
  }

  const purchaseForOptions = {}
  if (erc20Address && erc20Address !== ZERO) {
    const approvedAmount = await getAllowance(
      erc20Address,
      lockAddress,
      this.provider,
      this.signer
    )
    if (!approvedAmount || approvedAmount.lt(actualAmount)) {
      await approveTransfer(
        erc20Address,
        lockAddress,
        actualAmount,
        this.provider,
        this.signer
      )
      // Since we sent the approval transaction, we cannot rely on Ethers to do an estimate, because the computation would fail (since the approval might not have been mined yet)
      purchaseForOptions.gasLimit = 400000
    }
  } else {
    purchaseForOptions.value = actualAmount
  }

  // To get good estimates we need the gas price, because it matters in the actual execution
  const gasPrice = await this.provider.getGasPrice()
  purchaseForOptions.gasPrice = gasPrice
  // Estimate gas. Bump by 30% because estimates are wrong
  if (!purchaseForOptions.gasLimit) {
    const gasLimit = await lockContract.estimateGas.purchase(
      actualAmount,
      owner,
      referrer,
      data,
      purchaseForOptions
    )
    purchaseForOptions.gasLimit = gasLimit.mul(13).div(10).toNumber()
  }
  const transactionPromise = lockContract.purchase(
    actualAmount,
    owner,
    referrer,
    data,
    purchaseForOptions
  )

  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  // Let's now wait for the transaction to go thru to return the token id
  const receipt = await this.provider.waitForTransaction(hash)
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
