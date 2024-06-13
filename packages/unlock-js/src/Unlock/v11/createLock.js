import { ethers } from 'ethers'
import abis from '../../abis'
import { _getKeyPrice } from '../utils'
import { ETHERS_MAX_UINT, UNLIMITED_KEYS_COUNT, ZERO } from '../../constants'

/**
 * Creates a lock at a specific version
 * @param {PropTypes.lock} lock
 * @param {function} callback invoked with the transaction hash
 */
export default async function (lock, transactionOptions = {}, callback) {
  const unlockContract = await this.getUnlockContract()

  const lockVersion =
    lock.publicLockVersion || (await unlockContract.publicLockLatestVersion())

  let { maxNumberOfKeys, expirationDuration } = lock
  if (
    typeof maxNumberOfKeys !== 'number' ||
    maxNumberOfKeys === UNLIMITED_KEYS_COUNT
  ) {
    maxNumberOfKeys = ETHERS_MAX_UINT
  }
  if (expirationDuration === -1) {
    expirationDuration = ETHERS_MAX_UINT
  }

  const decimalKeyPrice = await _getKeyPrice(lock, this.provider)

  const currencyContractAddress = lock.currencyContractAddress || ZERO

  const lockName = lock.name

  const signerAddress = await this.signer.getAddress()

  // get lock creator
  const lockCreator = lock.creator || signerAddress

  if (!lockCreator) {
    throw new Error('No lock creator passed or found.')
  }

  // parse interface
  const { abi: lockAbi } = abis.PublicLock[`v${lockVersion}`]
  const lockInterface = new ethers.Interface(lockAbi)

  // parse calldata
  const calldata = lockInterface.encodeFunctionData(
    'initialize(address,uint256,address,uint256,uint256,string)',
    [
      lockCreator,
      expirationDuration,
      currencyContractAddress,
      decimalKeyPrice,
      maxNumberOfKeys,
      lockName,
    ]
  )

  // pass calldata
  const transactionPromise = unlockContract.createUpgradeableLockAtVersion(
    calldata,
    lockVersion,
    transactionOptions
  )

  const hash = await this._handleMethodCall(transactionPromise)
  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  // Let's now wait for the lock to be deployed before we return its address
  const { logs } = await this.provider.waitForTransaction(hash)

  const parsedLogs = logs
    .map((log) => unlockContract.interface.parseLog(log))
    .map((log) => log || {})

  const newLockEvent = parsedLogs.find(
    ({ fragment }) => fragment && fragment.name === 'NewLock'
  )

  if (newLockEvent) {
    return newLockEvent.args.newLockAddress
  }
  // There was no NewEvent log (transaction failed?)
  return null
}
