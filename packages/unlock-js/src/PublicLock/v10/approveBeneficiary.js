import utils from '../../utils'
import { ZERO, MAX_UINT } from '../../constants'
import { getErc20Decimals } from '../../erc20'

export default async function (
  { lockAddress, spender, amount = '0', decimals, erc20Address },
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)
  if (!erc20Address || erc20Address !== ZERO) {
    erc20Address = await lockContract.tokenAddress()
  }

  if (erc20Address === ZERO) {
    throw new Error('Lock can only set approval for ERC20')
  }

  let actualAmount
  if (amount !== MAX_UINT) {
    // decimals could be 0!
    if (decimals == null) {
      decimals = await getErc20Decimals(erc20Address, this.provider)
    }

    actualAmount = utils.toDecimal(amount, decimals)
  } else {
    actualAmount = amount
  }

  const transactionPromise = lockContract.approveBeneficiary(
    spender,
    actualAmount
  )

  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash)
  }

  await this.provider.waitForTransaction(hash)

  return null
}
