import utils from '../../utils'

/**
 * Triggers a transaction to withdraw funds from the lock and assign them to the owner.
 * By default (amount=0), this withdraws all funds.
 * @param {PropTypes.address} lockAddress
 * @param {string} beneficiary the address that will receive the withdrawn tokens
 * @param {string} tokenAddress the token address to withdraw from (zero address is ETH)
 * @param {string} amount
 * @param {number} decimals
 * TODO: get the decimal from the ERC20 contract
 * @param {function} callback invoked with the transaction hash
 */
export default async function (
  { lockAddress, beneficiary, amount = '0', decimals = 18 },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)
  const tokenAddress = await lockContract.tokenAddress()
  // use the signer as beneficiary
  if (!beneficiary) {
    beneficiary = await this.signer.getAddress()
  }
  const actualAmount = utils.toDecimal(amount, decimals)

  const transactionPromise = lockContract['withdraw(address,address,uint256)'](
    tokenAddress,
    beneficiary,
    actualAmount
  )
  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  // Let's now wait for the funds to have been withdrawn
  const receipt = await this.provider.waitForTransaction(hash)
  const parser = lockContract.interface
  const withdrawalEvent = receipt.logs
    .map((log) => {
      if (log.address !== lockAddress) return // Some events are triggered by the ERC20 contract
      return parser.parseLog(log)
    })
    .filter((event) => {
      return event && event.name === 'Withdrawal'
    })[0]
  if (withdrawalEvent) {
    return utils.fromWei(withdrawalEvent.args.amount.toString(), 'ether')
  }
  // There was no Withdrawal log (transaction failed?)
  return null
}
