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

  // make sure reccuring payments are supported
  if ((await lock.publicLockVersion()) < 10) {
    // eslint-disable-next-line prefer-promise-reject-errors
    return Promise.reject(
      `Renewal only supported for lock v10+ | [${network}, '${lockAddress}-${keyId}']`
    )
  }

  // We only renew keys for which we are getting a gas refund whose value cover the gas spent.
  const gasRefund = await lock.gasRefundValue()

  // estimate gas for the renewMembership function.
  const gasLimit = await lock.estimateGas.renewMembershipFor(
    keyId,
    constants.AddressZero
  )
  if (gasRefund.lte(gasLimit)) {
    // eslint-disable-next-line prefer-promise-reject-errors
    return Promise.reject(
      `GasRefundValue (${gasRefund.toString()}) does not cover gas cost  | [${network}, '${lockAddress}-${keyId}']`
    )
  }

  // send actual tx
  const tx = await lock.renewMembershipFor(keyId, constants.AddressZero, {
    gasLimit: gasRefund,
  })

  // record renewal in db
  const data = {
    network,
    lockAddress,
    keyId,
    initiatedBy: signer.address,
    tx: tx.hash,
  }
  await KeyRenewal.create(data)
  return data
}
