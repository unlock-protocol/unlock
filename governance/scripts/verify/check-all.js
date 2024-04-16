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

const getLockAddress = async (subgraph, lockVersion) => {
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
  return locks
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function main() {
  for (let chainId in networks) {
    // TODO: support zkSync (324) and its custom verifier
    if (chainId === 31337 || chainId == 324) return
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

    // get PublicLock address (need custom provider)
    const provider = await getProvider(chainId)
    const unlock = new ethers.Contract(
      unlockAddress,
      [
        `function publicLockAddress() view returns (address)`,
        `function publicLockLatestVersion() view returns (uint16)`,
      ],
      provider
    )
    const PublicLock = await unlock.publicLockAddress()
    const lockVersion = await unlock.publicLockLatestVersion()

    const toVerify = {
      Unlock: unlockAddress,
      PublicLock,
    }

    // get lock proxy
    try {
      const [{ address: lockAddress }] = await getLockAddress(
        subgraph,
        lockVersion
      )
      toVerify.LockProxy = lockAddress
    } catch (error) {
      console.log({
        name,
        chainId,
        status: `No lock found for version ${lockVersion}`,
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
      await wait(200)
      const verified = await isVerified({
        chainId,
        contractAddress,
      })

      // log results
      if (!verified.isVerified) {
        logError({ name, chainId, contractName, contractAddress, ...verified })
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
