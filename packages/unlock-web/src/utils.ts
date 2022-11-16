import { ethers } from 'ethers'
import { Buffer } from 'buffer'
import { PaywallConfig } from '@unlock-protocol/types'
import { networks } from '@unlock-protocol/networks'

/**
 * TODO: Replace it with the generated ABI from unlockjs so we don't have to maintain this.
 * A shortened ABI for the lock since we only care about a small number
 * of functions
 */
const abi = [
  {
    inputs: [{ internalType: 'address', name: '_keyOwner', type: 'address' }],
    name: 'totalKeys',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_keyOwner', type: 'address' },
      { internalType: 'uint256', name: '_index', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_tokenId', type: 'uint256' }],
    name: 'keyExpirationTimestampFor',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
]

interface GetMembershipOptions {
  network: number
  lockAddress: string
  user: string
  index: number
}

/**
 * Returns a single membership
 * @param {*} network
 * @param {*} lock
 * @param {*} user
 * @param {*} i
 * @returns
 */
const getMembership = async ({
  network,
  lockAddress,
  user,
  index,
}: GetMembershipOptions) => {
  const networkConfig = networks[network]
  const provider = new ethers.providers.JsonRpcProvider(networkConfig.provider)
  const contract = new ethers.Contract(lockAddress, abi, provider)
  const tokenId = await contract.tokenOfOwnerByIndex(user, index)
  const expiration = await contract.keyExpirationTimestampFor(tokenId)
  return {
    network,
    lockAddress,
    tokenId,
    owner: user,
    expiration,
  } as const
}

export interface Membership {
  network: number
  owner: string
  tokenId: any
  lockAddress: string
  expiration: any
}

/**
 * Returns all the memberships for a user based on a paywall config
 * @returns
 */
export const getMemberships = async (config: PaywallConfig, user: string) => {
  const _memberships: Membership[] = []
  await Promise.all(
    Object.keys(config.locks).map(async (lockAddress) => {
      const network = config.locks[lockAddress].network || config.network
      const provider = new ethers.providers.JsonRpcProvider(
        `https://rpc.unlock-protocol.com/${network}`
      )
      const contract = new ethers.Contract(lockAddress, abi, provider)
      const numberOfKeys = await contract.totalKeys(user)
      return Promise.all(
        new Array(numberOfKeys.toNumber()).fill(0).map(async (_, index) => {
          const membership = await getMembership({
            network,
            lockAddress,
            index,
            user,
          })
          return _memberships.push(membership)
        })
      )
    })
  )
  return _memberships
}

/**
 * From code, returns an object of digest, signature and user.
 * @param {*} _code
 * @returns
 */
export const authenticateFromCode = (_code: string) => {
  const code = JSON.parse(Buffer.from(_code, 'base64').toString())
  const digest = code.d
  const signature = code.s
  const user = ethers.utils.verifyMessage(digest, signature)
  return {
    digest,
    signature,
    user,
  }
}
