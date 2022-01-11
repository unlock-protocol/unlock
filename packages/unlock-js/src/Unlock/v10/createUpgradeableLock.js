import ethersUtils from '../../utils'
import { ETHERS_MAX_UINT, UNLIMITED_KEYS_COUNT, ZERO } from '../../constants'

import { getErc20Decimals } from '../../erc20'

/**
 * Returns the key price in its currency, rather than its decimal representation (Ether vs. Wei for example)
 * @param {*} currencyContractAddress
 * @param {*} lock
 * @param {*} provider
 */
async function _getKeyPrice(lock, provider) {
  const currencyContractAddress = lock.currencyContractAddress || ZERO

  if (currencyContractAddress !== ZERO) {
    // We need to get the decimal value
    const erc20Decimals = await getErc20Decimals(
      currencyContractAddress,
      provider
    )
    return ethersUtils.toDecimal(lock.keyPrice, erc20Decimals)
  }
  return ethersUtils.toWei(lock.keyPrice, 'ether')
}

/**
 * Create the calldata (in bytes) describing the params required to call `createLock`
 * @param {number} expirationDuration expiration duration of the lock (in seconds). Use 0 for
 * infinite duration
 * @param {string} currencyContractAddress the ERC20 token to be used for this lock. Leave blank or use
 * zero address for ETH
 * @param {number} keyPrice the price of each key (using max decimals for the token)
 * @param {number} maxNumberOfKeys the limit number of keys to be issued on this lock
 * @param {string} lockName the name of the lock
 * @param {string} lockCreator the address to assign the lock to
 */
async function _getCreateLockCalldata({
  expirationDuration,
  currencyContractAddress,
  keyPrice,
  maxNumberOfKeys,
  lockName,
  lockCreator,
}) {
  const unlock = await this.getUnlockContract()
  const calldata = await unlock.interface.encodeFunctionData(
    'initialize(address,uint256,address,uint256,uint256,string)',
    [
      lockCreator, // creator
      expirationDuration,
      currencyContractAddress,
      keyPrice,
      maxNumberOfKeys,
      lockName,
    ]
  )
  return calldata
}

/**
 * Creates a lock on behalf of the user, using version v17
 * @param {PropTypes.lock} lock
 * @param {string} lockCreator the address of the creator of the lock
 * @param {function} callback invoked with the transaction hash
 */
export default async function (lock, lockCreator, callback) {
  const unlockContract = await this.getUnlockContract()
  let { maxNumberOfKeys, expirationDuration } = lock
  if (maxNumberOfKeys === UNLIMITED_KEYS_COUNT) {
    maxNumberOfKeys = ETHERS_MAX_UINT
  }

  const decimalKeyPrice = await _getKeyPrice(lock, this.provider)
  const currencyContractAddress = lock.currencyContractAddress || ZERO
  const lockName = lock.name

  // parse calldata bytes
  const calldata = await _getCreateLockCalldata({
    expirationDuration,
    currencyContractAddress,
    decimalKeyPrice,
    maxNumberOfKeys,
    lockName,
    lockCreator,
  })

  // send the create tx
  const transactionPromise = unlockContract.createUpgradeableLock(calldata)

  const hash = await this._handleMethodCall(transactionPromise)
  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  // Let's now wait for the lock to be deployed before we return its address
  const receipt = await this.provider.waitForTransaction(hash)
  const parser = unlockContract.interface
  const newLockEvent = receipt.logs
    .map((log) => {
      return parser.parseLog(log)
    })
    .filter((event) => event.name === 'NewLock')[0]

  if (newLockEvent) {
    return newLockEvent.args.newLockAddress
  }
  // There was no NewEvent log (transaction failed?)
  return null
}
