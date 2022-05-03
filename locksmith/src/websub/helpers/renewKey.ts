import { ethers, constants, BigNumber } from 'ethers'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'

import { KeyRenewal } from '../../models'
import GasPrice from '../../utils/gasPrice'
import Dispatcher from '../../fulfillment/dispatcher'

// multiply factor to increase precision for gas calculations
const BASE_POINT_ACCURACY = 1000

// Maximum price we're willing to pay to renew keys (1000 => 1ct)
const MAX_RENEWAL_COST_COVERED = 1000

interface RenewKeyParams {
  keyId: number
  lockAddress: string
  network: number
}

interface ShouldRenew {
  shouldRenew: boolean
  gasRefund?: string
  error?: string
}

// Calculate price of gas in USD
const getGasFee = async (network: number, gasCost: number) => {
  const gasPrice = new GasPrice()
  const gasCostUSD = await gasPrice.gasPriceUSD(network, gasCost)
  return gasCostUSD * BASE_POINT_ACCURACY
}

export const isWorthRenewing = async (
  network: number,
  lockAddress: string,
  keyId: number
): Promise<ShouldRenew> => {
  const web3Service = new Web3Service(networks)
  const provider = new ethers.providers.JsonRpcProvider(
    networks[network].publicProvider
  )

  try {
    const lock = await web3Service.getLockContract(lockAddress, provider)

    // estimate gas for the renewMembership function (check if reverts).
    const gasLimit = await lock.estimateGas.renewMembershipFor(
      keyId,
      constants.AddressZero
    )

    // find cost to renew in USD cents
    const costToRenew = await getGasFee(network, gasLimit.toNumber())

    // find gas refund in USD cents
    const gasRefund = await lock.gasRefundValue()
    const costRefunded = await getGasFee(network, gasRefund.toNumber())

    const shouldRenew =
      BigNumber.from(costToRenew).lte(costRefunded) ||
      BigNumber.from(costToRenew).lte(MAX_RENEWAL_COST_COVERED)

    return {
      shouldRenew,
      gasRefund: gasRefund.toNumber(),
    }
  } catch (error) {
    return {
      shouldRenew: false,
      error,
    }
  }
}

export async function renewKey({
  keyId,
  lockAddress,
  network,
}: RenewKeyParams) {
  const renewalInfo = {
    network,
    keyId,
    lockAddress,
  }

  const { shouldRenew, gasRefund, error } = await isWorthRenewing(
    network,
    lockAddress,
    keyId
  )

  if (!shouldRenew) {
    if (error) {
      return {
        network,
        keyId,
        lockAddress,
        msg: error,
      }
    }
    return {
      network,
      keyId,
      lockAddress,
      msg: `GasRefundValue (${gasRefund}) does not cover gas cost`,
    }
  }

  // send actual tx
  const fulfillmentDispatcher = new Dispatcher()
  try {
    const tx = await fulfillmentDispatcher.renewMembershipFor(
      network,
      lockAddress,
      keyId,
      constants.AddressZero,
      {
        gasLimit: gasRefund,
      }
    )

    // record renewal in db
    const recordedrenewalInfo = {
      ...renewalInfo,
      tx: tx.hash,
    }
    await KeyRenewal.create(recordedrenewalInfo)
    return recordedrenewalInfo
  } catch (error) {
    return {
      network,
      keyId,
      lockAddress,
      msg: error.message,
    }
  }
}
