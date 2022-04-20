import utils from '../../utils'
import { ZERO } from '../../constants'
import { approveTransfer, getAllowance } from '../../erc20'
import formatKeyPrice from '../utils/formatKeyPrice'

/**
 * Purchase key function. This implementation requires the following
 * @param {object} params:
 * - {PropTypes.arrayOf(PropTypes.address)} lockAddress
 * - {PropTypes.arrayOf(PropTypes.address)} owners
 * - {PropTypes.arrayOf(string)} keyPrices
 * - {PropTypes.address} erc20Address
 * - {number} decimals
 * - {PropTypes.arrayOf(PropTypes.address)} referrers (address which will receive UDT - if applicable)
 * - {PropTypes.arrayOf(PropTypes.array[bytes])} _data (array of array of bytes, not used in transaction but can be used by hooks)
 * @param {function} callback invoked with the transaction hash
 */
export default async function (
  {
    owners: _owners,
    keyManagers: _keyManagers,
    keyPrices: _keyPrices,
    referrers: _referrers,
    lockAddress,
    erc20Address,
    decimals,
    data: _data,
  },
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)

  // If erc20Address was not provided, get it
  if (!erc20Address) {
    erc20Address = await lockContract.tokenAddress()
  }

  // owners default to a single key for current signer
  const defaultOwner = await this.signer.getAddress()
  const owners = _owners || [defaultOwner]

  // we parse by default a length corresponding to the owners length
  const defaultArray = Array(owners.length).fill(null)

  const keyPrices = await Promise.all(
    (_keyPrices || defaultArray).map(async (kp) => {
      if (!kp) {
        // We might not have the keyPrice, in which case, we need to retrieve from the the lock!
        return await lockContract.keyPrice()
      }
      return formatKeyPrice(kp, erc20Address, decimals, this.provider)
    })
  )
  const keyManagers = (_keyManagers || defaultArray).map((km) => km || ZERO)
  const referrers = (_referrers || defaultArray).map((km) => km || ZERO)
  const data = (_data || defaultArray).map((d) => d || [])

  if (
    !(
      keyManagers.length === owners.length &&
      keyPrices.length === owners.length &&
      referrers.length === owners.length &&
      data.length === owners.length
    )
  ) {
    throw new Error(
      'Params mismatch. All purchaseKeys params array should have the same length'
    )
  }

  // calculate total price for all keys
  const totalPrice = keyPrices.reduce(
    (total, kp) => total.add(kp),
    utils.bigNumberify(0)
  )

  // fix ERC20 allowance
  if (erc20Address && erc20Address !== ZERO) {
    const approvedAmount = await getAllowance(
      erc20Address,
      lockAddress,
      this.provider,
      this.signer
    )

    if (!approvedAmount || approvedAmount.lt(totalPrice)) {
      await approveTransfer(
        erc20Address,
        lockAddress,
        totalPrice,
        this.provider,
        this.signer
      )
    }
  }

  // tx options
  const purchaseForOptions = {}
  if (erc20Address && erc20Address !== ZERO) {
    // Since we sent the approval transaction, we cannot rely on Ethers to do an estimate, because the computation would fail (since the approval might not have been mined yet)
    // purchaseForOptions.gasLimit = 400000
  } else {
    purchaseForOptions.value = totalPrice
  }

  // Estimate gas. Bump by 30% because estimates are wrong!
  if (!purchaseForOptions.gasLimit) {
    try {
      // To get good estimates we need the gas price, because it matters in the actual execution (UDT calculation takes it into account)
      // TODO remove once we move to use block.baseFee in UDT calculation
      const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } =
        await this.provider.getFeeData()

      if (maxFeePerGas && maxPriorityFeePerGas) {
        purchaseForOptions.maxFeePerGas = maxFeePerGas
        purchaseForOptions.maxPriorityFeePerGas = maxPriorityFeePerGas
      } else {
        purchaseForOptions.gasPrice = gasPrice
      }
      const gasLimit = await lockContract.estimateGas.purchase(
        keyPrices,
        owners,
        referrers,
        keyManagers,
        data,
        purchaseForOptions
      )
      // Remove the gas prices settings for the actual transaction (the wallet will set them)
      delete purchaseForOptions.maxFeePerGas
      delete purchaseForOptions.maxPriorityFeePerGas
      delete purchaseForOptions.gasPrice
      purchaseForOptions.gasLimit = gasLimit.mul(13).div(10).toNumber()
    } catch (error) {
      console.error(
        'We could not estimate gas ourselves. Let wallet do it.',
        error
      )
      delete purchaseForOptions.maxFeePerGas
      delete purchaseForOptions.maxPriorityFeePerGas
      delete purchaseForOptions.gasPrice
    }
  }
  const transactionPromise = lockContract.purchase(
    keyPrices,
    owners,
    referrers,
    keyManagers,
    data,
    purchaseForOptions
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
  const transferEvents = receipt.logs
    .map((log) => {
      if (log.address !== lockAddress) return // Some events are triggered by the ERC20 contract
      return parser.parseLog(log)
    })
    .filter((event) => {
      return event && event.name === 'Transfer'
    })

  if (transferEvents && transferEvents.length) {
    return transferEvents.map((v) => v.args.tokenId.toString())
  }
  // There was no Transfer log (transaction failed?)
  return null
}
