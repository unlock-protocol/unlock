import utils from '../../utils'
import { ZERO } from '../../constants'
import { approveTransfer, getErc20Decimals, getAllowance } from '../../erc20'

const getKeyPrice = async (keyPrice, erc20Address, decimals) => {
  let actualAmount
  if (decimals !== undefined && decimals !== null) {
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
  return actualAmount
}

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
    _owners,
    _keyManagers,
    _keyPrices,
    _referrers,
    lockAddress,
    erc20Address,
    decimals,
    _data,
  },
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)

  // If erc20Address was not provided, get it
  if (!erc20Address) {
    erc20Address = await lockContract.tokenAddress()
  }

  // parse params
  const defaultOwner = await this.signer.getAddress()
  const owners = _owners.map((owner) =>
    !owner || owner === ZERO ? defaultOwner : owner
  )
  const keyPrices = await Promise.all(
    _keyPrices.map((kp) =>
      kp
        ? // We might not have the keyPrice, in which case, we need to retrieve from the the lock!
          await lockContract.keyPrice()
        : getKeyPrice(kp, erc20Address, decimals)
    )
  )
  const keyManagers = _keyManagers.map((km) => km || ZERO)
  const referrers = _referrers.map((km) => km || ZERO)
  const data = _data.map((d) => d || [])

  // calculate total price for all keys
  const totalPrice = keyPrices.reduce((total, p) => total + p, 0)

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
    purchaseForOptions.gasLimit = 400000
  } else {
    purchaseForOptions.value = totalPrice
  }

  // Estimate gas. Bump by 30% because estimates are wrong!
  if (!purchaseForOptions.gasLimit) {
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
      _data,
      purchaseForOptions
    )
    // Remove the gas prices settings for the actual transaction (the wallet will set them)
    delete purchaseForOptions.maxFeePerGas
    delete purchaseForOptions.maxPriorityFeePerGas
    delete purchaseForOptions.gasPrice
    purchaseForOptions.gasLimit = gasLimit.mul(13).div(10).toNumber()
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
