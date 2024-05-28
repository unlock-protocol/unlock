const { ethers } = require('ethers')
const { networks } = require('@unlock-protocol/networks')
const isVerified = require('./check')
const { getProvider } = require('../../helpers/multisig')

const logError = ({
  name,
  chainId,
  contractName,
  contractAddress,
  result,
  message,
}) =>
  console.log(
    `[${name} (${chainId})]: ${contractName} at ${contractAddress}: ${result} (${message})`
  )

const queryLockAddress = async (subgraph, lockVersion) => {
  if (!subgraph || !subgraph.endpoint) {
    throw new Error(
      'Missing subGraphURI for this network. Can not fetch from The Graph'
    )
  }

  const query = `
    {
      locks(where:{
        version: "${lockVersion}"
      }, first: 1) {
        address
      }
    }
  `

  const q = await fetch(subgraph.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
    }),
  })

  const { data, errors } = await q.json()
  if (errors) {
    console.log('LOCK > Error while fetching the graph', errors)
    return []
  }
  const { locks } = data
  const [lock] = locks
  let lockAddress
  if (lock) {
    ;({ address: lockAddress } = lock)
  }
  return lockAddress
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function main() {
  for (let chainId in networks) {
    // TODO: support zkSync (324) and its custom verifier
    if (!['31337', '324'].includes(chainId)) {
      const {
        unlockAddress,
        name,
        hooks,
        keyManagerAddress,
        swapPurchaser,
        unlockDaoToken,
        unlockOwner,
        subgraph,
      } = networks[chainId]

      const toVerify = {
        Unlock: unlockAddress,
      }

      // get PublicLock address (need custom provider)
      try {
        const provider = await getProvider(chainId)
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
        const PublicLockPrevious =
          await unlock.publicLockImpls(previousLockVersion)
        toVerify.PublicLockLatest = PublicLockLatest
        // get latest lock proxy
        const lockAddress = await queryLockAddress(subgraph, lockVersion)
        if (lockAddress) {
          toVerify[`LockProxyV${lockVersion}`] = lockAddress
        }

        // fetch previous version
        if (PublicLockPrevious !== ethers.ZeroAddress) {
          toVerify.PublicLockPrevious = PublicLockPrevious
          const lockAddressPrevious = await queryLockAddress(
            subgraph,
            previousLockVersion
          )
          if (lockAddressPrevious) {
            toVerify[`LockProxyV${previousLockVersion}`] = lockAddressPrevious
          }
        }
      } catch (error) {
        logError({
          name,
          chainId,
          status: error.message,
        })
      }

      // get lock proxy
      if (keyManagerAddress) {
        toVerify.KeyManager = keyManagerAddress
      }
      if (swapPurchaser) {
        toVerify.SwapPurchaser = swapPurchaser
      }
      if (unlockDaoToken) {
        toVerify.UDT = unlockDaoToken.address
      }
      if (unlockOwner) {
        toVerify.UDT = unlockOwner.address
      }

      // TODO: get all hooks
      if (hooks) {
        if (hooks.onKeyPurchaseHook) {
          hooks.onKeyPurchaseHook.map(({ address, id }) => {
            toVerify[`onKeyPurchaseHook_${id}`] = address
          })
        }
      }

      // api calls
      for (let contractName in toVerify) {
        const contractAddress = toVerify[contractName]
        await wait(100)
        const verified = await isVerified({
          chainId,
          contractAddress,
        })

        // log results
        if (!verified.isVerified) {
          logError({
            name,
            chainId,
            contractName,
            contractAddress,
            ...verified,
          })
        }
      }
    }
  }
}

// execute as standalone
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
