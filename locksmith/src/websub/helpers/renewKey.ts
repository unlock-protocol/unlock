import { ethers, Wallet, Contract, constants } from 'ethers'
import { networks } from '@unlock-protocol/networks'
import { NetworkConfig } from '@unlock-protocol/types'
import { KeyRenewal } from '../../models'
import { purchaserCredentials } from '../../../config/config'
import KeyPricer from '../../utils/keyPricer'

interface RenewKeyParams {
  keyId: number
  lockAddress: string
  network: number
}

interface ShouldRenew {
  shouldRenew: boolean
  gasRefund: string
}

const abi = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_referrer',
        type: 'address',
      },
    ],
    name: 'renewMembershipFor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'gasRefundValue',
    outputs: [
      {
        internalType: 'uint256',
        name: '_refundValue',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'publicLockVersion',
    outputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
]

// precision base for gas calculations
const BASE = 1000000

const getGasFee = async (network: number) => {
  const pricer = new KeyPricer()
  const gasPrice = await pricer.gasFee(network, BASE)
  return gasPrice
}

export const isWorthRenewing = async (
  network: number,
  lock: any,
  keyId: number
): Promise<ShouldRenew> => {
  // max cost covered by Unlock Inc for renew keys (in USD cents base 1000)
  const MAX_RENEWAL_COST_COVERED = ethers.BigNumber.from(100000).mul(BASE)

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

export const renewMembershipFor = async (
  network: number,
  lock: any,
  keyId: number,
  signer?: any
) => {
  const renewalInfo = {
    network,
    keyId,
    lockAddress: lock.address,
  }

  // make sure reccuring payments are supported
  if ((await lock.publicLockVersion()) < 10) {
    return {
      ...renewalInfo,
      msg: 'Renewal only supported for lock v10+',
    }
  }

  const { shouldRenew, gasRefund } = await isWorthRenewing(network, lock, keyId)

  if (!shouldRenew) {
    return {
      network,
      keyId,
      lockAddress: lock.address,
      msg: `GasRefundValue (${gasRefund}) does not cover gas cost`,
    }
  }

  // send actual tx
  const tx = await lock.renewMembershipFor(keyId, constants.AddressZero, {
    gasLimit: gasRefund,
  })

  // record renewal in db
  const recordedrenewalInfo = {
    ...renewalInfo,
    initiatedBy: signer?.address,
    tx: tx.hash,
  }
  await KeyRenewal.create(recordedrenewalInfo)
  return recordedrenewalInfo
}

export async function renewKey({
  keyId,
  lockAddress,
  network,
}: RenewKeyParams) {
  // super complicated parsing to make ts happy ;-)
  const [, networkConfig]: [string, NetworkConfig] = Object.entries(
    networks
  ).find(([, n]) => n.id === network) as [string, NetworkConfig]

  // get RPC connection and signer
  const { provider } = networkConfig
  const rpc = new ethers.providers.JsonRpcProvider(provider)
  const signer = new Wallet(purchaserCredentials, rpc)

  // parse lock
  const lock = new Contract(lockAddress, abi, signer)

  const renewalInfo = await renewMembershipFor(network, lock, keyId, signer)
  return renewalInfo
}
