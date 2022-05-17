import { ethers, constants } from 'ethers'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'

import { KeyRenewal } from '../../models'
import GasPrice from '../../utils/gasPrice'
import Dispatcher from '../../fulfillment/dispatcher'

// multiply factor to increase precision for gas calculations
const BASE_POINT_ACCURACY = 1000

// Maximum price we're willing to pay to renew keys (1000 => 1ct)
const MAX_RENEWAL_COST_COVERED = 1 * BASE_POINT_ACCURACY

interface RenewKeyParams {
  keyId: number
  lockAddress: string
  network: number
}
interface RenewKeyReturned {
  keyId: number
  lockAddress: string
  network: number
  tx?: string
  error?: string
}

interface ShouldRenew {
  shouldRenew: boolean
  gasLimit?: ethers.BigNumber
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
    // we bump by 20%, just to cover temporary changes
    const gasLimit = (
      await lock.estimateGas.renewMembershipFor(keyId, constants.AddressZero)
    )
      .mul(10)
      .div(8)

    // find cost to renew in USD cents
    const costToRenew = await getGasFee(network, gasLimit.toNumber())

    // find gas refund in USD cents
    const gasRefund = await lock.gasRefundValue()
    const costRefunded = await getGasFee(network, gasRefund.toNumber())

    const shouldRenew =
      costToRenew < costRefunded || costToRenew < MAX_RENEWAL_COST_COVERED

    return {
      shouldRenew,
      gasLimit,
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
}: RenewKeyParams): Promise<RenewKeyReturned> {
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
        error,
      }
    }
    return {
      network,
      keyId,
      lockAddress,
      error: `GasRefundValue (${gasRefund}) does not cover gas cost`,
    }
  }

  // send actual tx
  const fulfillmentDispatcher = new Dispatcher()
  try {
    const tx = await fulfillmentDispatcher.renewMembershipFor(
      network,
      lockAddress,
      keyId
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
      error: error.message,
    }
  }
}
