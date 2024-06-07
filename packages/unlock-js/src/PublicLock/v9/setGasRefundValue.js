import { networks } from '@unlock-protocol/networks'
import { ethers } from 'ethers'
import { getErc20Decimals } from '../../erc20'

export async function setMaxNumberOfKeys(
  { lockAddress, gasRefundValue },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)
  const { chainId: network } = await this.provider.getNetwork()
  let decimals = this.networks[network].nativeCurrency.decimals
  const erc20Address = await lockContract.tokenAddress()

  if (erc20Address !== ethers.ZeroAddress) {
    decimals = await getErc20Decimals(erc20Address, this.provider)
  }

  const refundValue = ethers.parseUnits(gasRefundValue, decimals)

  const transactionPromise = lockContract.setGasRefundValue(refundValue)
  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  await this.provider.waitForTransaction(hash)
}

export default setMaxNumberOfKeys
