// NB: keeping this file as JS (instead of TS) so it can be used as a node worker
import { ethers, Wallet } from 'ethers'
import * as contracts from '@unlock-protocol/contracts'
import { networks } from '@unlock-protocol/networks'
import listManagers from './lockManagers'
import { purchaserCredentials } from '../../config/config'

export async function migrateLock(
  { lockAddress, unlockVersion, chainId, recordId },
  callback
) {
  const [, network] = Object.entries(networks).find(([, n]) => n.id === chainId)

  let unlockAddress
  let serializerAddress
  let provider
  let subgraphURI
  if (chainId === 100 || chainId === 137 || chainId === 31337) {
    ;({ unlockAddress, serializerAddress, provider, subgraphURI } = network)
  } else {
    throw new Error(
      `Chain with id ${chainId} not supported (only Polygon & xDai)`
    )
  }

  if (!serializerAddress) {
    throw new Error(`Missing LockSerializer address for this chain: ${chainId}`)
  }
  if (!unlockAddress) {
    throw new Error(`Missing Unlock address for this chain: ${chainId}`)
  }
  const rpc = new ethers.providers.JsonRpcProvider(provider)
  callback(null, {
    recordId,
    msg: `CLONE LOCK > cloning ${lockAddress} on ${network.name}...`,
  })

  const signer = new Wallet(purchaserCredentials, rpc)

  // serialize
  const serializer = new ethers.Contract(
    serializerAddress,
    contracts.LockSerializer.abi,
    signer
  )
  const serialized = await serializer.serialize(lockAddress)
  const {
    expirationDuration,
    tokenAddress,
    beneficiary,
    keyPrice,
    maxNumberOfKeys,
    name,
    symbol,
    keyOwners,
    expirationTimestamps,
    keyManagers,
    tokenURISample,
  } = serialized

  const lockArgs = [
    expirationDuration,
    tokenAddress,
    keyPrice,
    maxNumberOfKeys,
    name,
  ]

  // get proper unlock
  const { abi } = contracts[`UnlockV${unlockVersion}`]
  const unlock = new ethers.Contract(unlockAddress, abi, signer)

  // create the new lock
  let txLockCreate
  if (unlockVersion < 10) {
    const salt = ethers.utils.hexZeroPad(ethers.utils.randomBytes(12), 12)
    txLockCreate = await unlock.createLock(...lockArgs, salt)
  } else {
    // @ts-ignore
    const calldata = await abi.encodeFunctionData(
      'initialize(address,uint256,address,uint256,uint256,string)',
      [signer.address, ...lockArgs]
    )
    txLockCreate = await unlock.createLock(calldata)
  }
  // gbet new lock address
  const { events, transactionHash } = await txLockCreate.wait()
  const { args } = events.find(({ event }) => event === 'NewLock')
  const { newLockAddress } = args

  callback(null, {
    recordId,
    msg: `CLONE LOCK > deployed to : ${newLockAddress} (tx: ${transactionHash})`,
  })

  callback(null, {
    recordId,
    msg: 'CLONE LOCK > add key owners...',
  })
  const newLock = new ethers.Contract(
    newLockAddress,
    contracts.PublicLockV8.abi,
    signer
  )

  const keyTx = await newLock.grantKeys(
    keyOwners,
    expirationTimestamps,
    keyManagers
  )
  const { events: keyEvents } = await keyTx.wait()
  const transfers = keyEvents.filter(({ event }) => event === 'Transfer')
  const keyManagersChanges = keyEvents.filter(
    ({ event }) => event === 'KeyManagerChanged'
  )
  callback(null, {
    recordId,
    msg: `CLONE LOCK > ${transfers.length} keys transferred, ${keyManagersChanges.length} key managers changed`,
  })

  callback(null, {
    recordId,
    msg: 'CLONE LOCK > fetching managers...',
  })

  // fetch managers from graph
  if (subgraphURI) {
    let managers
    try {
      managers = await listManagers({
        lockAddress: newLockAddress,
        subgraphURI,
      })
    } catch (error) {
      callback(null, {
        recordId,
        msg: error.message,
      })
      managers = []
    }
    if (managers.length) {
      callback(null, {
        recordId,
        msg: `LOCK > managers for the lock '${await newLock.name()}':`,
      })
      let msg = ''
      managers.forEach((account, i) => {
        msg = `${msg}\n[${i}]: ${account}`
      })
      callback(null, {
        recordId,
        msg,
      })

      const txs = await Promise.all(
        managers.map((manager) => newLock.addLockManager(manager))
      )
      const waits = await Promise.all(txs.map((tx) => tx.wait()))
      msg = ''
      waits.forEach(({ events }) => {
        const evt = events.find((evt) => evt.event === 'LockManagerAdded')
        msg = `${msg}\n LOCK CLONE > ${evt.args.account} added as lock manager.`
      })
      callback(null, {
        recordId,
        msg,
      })
    }
  } else {
    callback(null, {
      recordId,
      msg: 'Missing SubgraphURI. Can not fetch from The Graph on this network, sorry.',
    })
  }

  // update the beneficiary
  const txBenef = await newLock.updateBeneficiary(beneficiary)
  await txBenef.wait()
  callback(null, {
    recordId,
    msg: `LOCK CLONE > ${beneficiary} set as beneficiary.`,
  })

  // update metadata
  if (symbol != 'KEY') {
    const txSymbol = await newLock.updateLockSymbol(symbol)
    await txSymbol.wait()
    callback(null, {
      recordId,
      msg: `LOCK CLONE > Symbol updated to '${symbol}'.`,
    })
  }

  // tokenURI
  try {
    // check if is set to default or not
    const tokenURI = new URL(tokenURISample)
    if (!tokenURI.host.includes('unlock-protocol.com')) {
      const totalSupply = keyOwners.length
      const baseTokenURI = tokenURISample.slice(0, -`${totalSupply}`.length)
      await newLock.setBaseTokenURI(baseTokenURI)
      callback(null, {
        recordId,
        msg: `LOCK CLONE > baseTokenURI updated to '${baseTokenURI}'.`,
      })
    }
  } catch (error) {
    callback(null, {
      recordId,
      msg: `LOCK CLONE > baseTokenURI not set, using default. (ex. '${tokenURISample}').`,
    })
  }

  if (symbol != 'KEY') {
    const txSymbol = await newLock.updateLockSymbol(symbol)
    await txSymbol.wait()
    callback(null, {
      recordId,
      msg: `LOCK CLONE > Symbol updated to '${symbol}'.`,
    })
  }

  // disable lock
  // This will fail because we are not lock managers on the "old lock"
  // TODO: prompt user to disable their old lock?
  // const txDisable = await newLock.disableLock()
  // await txDisable.wait()
  // callback(null, {
  //   recordId,
  //   msg: 'LOCK CLONE > Origin lock has been disabled.',
  // })

  // remove ourselves as lockManagers
  const txRemoveUs = await newLock.renounceLockManager()
  await txRemoveUs.wait()
  callback(null, {
    recordId,
    msg: 'LOCK CLONE > Removed Unlock as lock manager.',
  })

  callback(null, {
    recordId,
    msg: 'LOCK CLONE > Lock cloned successfully.',
  })

  return newLockAddress
}
