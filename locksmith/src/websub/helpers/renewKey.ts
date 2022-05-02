import { ethers, constants } from 'ethers'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'

import { KeyRenewal } from '../../models'
import KeyPricer from '../../utils/keyPricer'
import Dispatcher from '../../fulfillment/dispatcher'

interface RenewKeyParams {
  keyId: number
  lockAddress: string
  network: number
}

interface ShouldRenew {
  shouldRenew: boolean
  gasRefund: string
}

// precision base for gas calculations
const BASE = 1000000

const getGasFee = async (network: number) => {
  const pricer = new KeyPricer()
  const gasPrice = await pricer.gasFee(network, BASE)
  return gasPrice
}

export const isWorthRenewing = async (
  network: number,
  lockAddress: string,
  keyId: number
): Promise<ShouldRenew> => {
  // max cost covered by Unlock Inc for renew keys (in USD cents base 1000)
  const MAX_RENEWAL_COST_COVERED = ethers.BigNumber.from(100000).mul(BASE)

  const web3Service = new Web3Service(networks)
  const lock = await web3Service.getLock(lockAddress, network)

  // estimate gas for the renewMembership function (check if reverts).
  const gasLimit = await lock.estimateGas.renewMembershipFor(
    keyId,
    constants.AddressZero
  )
  // find cost to renew in USD cents
  const gasFeeInCents = await getGasFee(network)
  const costToRenew = await gasLimit.mul(gasFeeInCents)

  // find gas refund in USD cents
  const gasRefund = await lock.gasRefundValue()
  const costRefunded = gasRefund.mul(gasFeeInCents)

  const shouldRenew =
    costToRenew.lte(costRefunded) ||
    ethers.BigNumber.from(costToRenew).lte(MAX_RENEWAL_COST_COVERED)

  return {
    shouldRenew,
    gasRefund: gasRefund.toNumber(),
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

  const { shouldRenew, gasRefund } = await isWorthRenewing(
    network,
    lockAddress,
    keyId
  )

  if (!shouldRenew) {
    return {
      network,
      keyId,
      lockAddress,
      msg: `GasRefundValue (${gasRefund}) does not cover gas cost`,
    }
  }

  // send actual tx
  const fulfillmentDispatcher = new Dispatcher()
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
}
