import { ethers, Wallet, Contract, constants } from 'ethers'
import { networks } from '@unlock-protocol/networks'
import { NetworkConfig } from '@unlock-protocol/types'
import { KeyRenewal } from '../../models'
import { purchaserCredentials } from '../../../config/config'

interface RenewKeyParams {
  keyId: number
  lockAddress: string
  network: number
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

  // We only renew keys for which we are getting a gas refund whose value cover the gas spent.
  const gasRefund = await lock.gasRefundValue()

  // estimate gas for the renewMembership function.
  const gasLimit = await lock.estimateGas.renewMembershipFor(
    keyId,
    constants.AddressZero
  )
  if (gasRefund.lte(gasLimit)) {
    return {
      ...renewalInfo,
      msg: `GasRefundValue (${gasRefund.toString()}) does not cover gas cost`,
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
