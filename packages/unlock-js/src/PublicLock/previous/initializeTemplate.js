import { ZERO } from '../../constants'

/**
 * Initialize a lock (will be called on the template only)
 * @param {PropTypes.contract} contract
 */
export default async function (
  { templateAddress },
  transactionOptions = {},
  callback
) {
  const owner = await this.signer.getAddress()
  const expirationDuration = 0
  const tokenAddress = ZERO
  const keyPrice = 0
  const maxNumberOfKeys = 0
  const lockName = 'Public Lock Template'

  const contract = await this.getLockContract(templateAddress)

  const initializeTransaction = await contract.initialize(
    owner,
    expirationDuration,
    tokenAddress,
    keyPrice,
    maxNumberOfKeys,
    lockName
  )
  if (callback) {
    callback(null, initializeTransaction.hash)
  }
  await this.provider.waitForTransaction(initializeTransaction.hash)
}
