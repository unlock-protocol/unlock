import { ethers } from 'ethers'
import { queryGraph } from './subgraph'

export const getAllAddresses = async ({ network }) => {
  const {
    unlockAddress,
    hooks,
    provider,
    keyManagerAddress,
    unlockDaoToken,
    unlockOwner,
    subgraph,
  } = network

  const { PublicLockPrevious, PublicLockLatest, lockVersion } =
    await getTemplateAddresses({ providerURL: provider, unlockAddress })

  // all contracts that needs to be verified
  const addresses = {
    PublicLockLatest,
    PublicLockPrevious,
    Unlock: unlockAddress,
  }

  // get latest lock proxy
  // TODO: fetch lock proxy status from previous versions
  const lockAddress = await getLockAddress(subgraph.endpoint, lockVersion)
  if (lockAddress) {
    addresses[`LockProxyV${lockVersion}`] = lockAddress
  }

  // add other addresses
  if (keyManagerAddress) {
    addresses[`KeyManager`] = keyManagerAddress
  }
  if (unlockDaoToken) {
    addresses[`UDTv3`] = unlockDaoToken.address
  }
  if (unlockOwner) {
    addresses[`UnlockOwner`] = unlockDaoToken.address
  }

  // TODO: get all hooks
  if (hooks) {
    if (hooks.onKeyPurchaseHook) {
      hooks.onKeyPurchaseHook.map(({ address, id }) => {
        addresses[`onKeyPurchaseHook_${id}`] = address
      })
    }
  }

  return addresses
}

export const getTemplateAddresses = async ({
  unlockAddress,
  providerURL,
}: {
  providerURL: string
  unlockAddress: string
}) => {
  const provider = new ethers.JsonRpcProvider(providerURL)
  const unlock = new ethers.Contract(
    unlockAddress,
    [
      `function publicLockAddress() view returns (address)`,
      `function publicLockLatestVersion() view returns (uint16)`,
      `function publicLockImpls(uint16) view returns (address)`,
    ],
    provider
  )

  const lockVersion = await unlock.publicLockLatestVersion()
  const previousLockVersion = lockVersion - 1n
  const PublicLockLatest = await unlock.publicLockImpls(lockVersion)
  const PublicLockPrevious = await unlock.publicLockImpls(previousLockVersion)
  return { PublicLockLatest, PublicLockPrevious, lockVersion }
}

export const getLockAddress = async (subgraphEndpoint, lockVersion) => {
  const query = `
    {
      locks(where:{
        version: "${lockVersion}"
      }, first: 1) {
        address
      }
    }
  `

  const { data, success } = await queryGraph({ query, subgraphEndpoint })

  if (success) {
    // get the first lock
    const [lock] = data.locks
    let lockAddress
    if (lock) {
      ;({ address: lockAddress } = lock)
    }
    return lockAddress
  }
}
