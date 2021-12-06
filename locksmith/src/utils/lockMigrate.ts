import { ethers, Wallet } from 'ethers'
import * as contracts from '@unlock-protocol/contracts'
import { NetworkConfig } from '@unlock-protocol/types'
import { networks } from '@unlock-protocol/networks'
import EventEmitter from 'events'
import listManagers from './lockManagers'

interface LockClonerProps {
  lockAddress: string
  unlockVersion: Number
  chainId: number
  recordId: number
}

class MigrateLogEventEmitter extends EventEmitter {}

export const migrateLogEvent = new MigrateLogEventEmitter()

// TODO: how to pass this safely?
const mnemonic =
  process.env.WALLET_MNEMONIC ||
  'test test test test test test test test test test test junk'

export default async function lockMigrate({
  lockAddress,
  unlockVersion,
  chainId,
  recordId,
}: LockClonerProps) {
  // super complicated parsing to make ts happy ;-)
  const [, network]: [string, NetworkConfig] = Object.entries(networks).find(
    ([, n]) => n.id === chainId
  ) as [string, NetworkConfig]

  let unlockAddress
  let serializerAddress
  let provider
  let subgraphURI
  if (chainId === 31337) {
    serializerAddress = process.env.SERIALIZER_ADDRESS
    unlockAddress = process.env.UNLOCK_ADDRESS
    provider = 'http://eth-node:8545'
    subgraphURI = 'http://graph-node:8000'
  } else {
    ;({ unlockAddress, serializerAddress, provider, subgraphURI } = network)
  }

  if (!serializerAddress) {
    throw new Error(`Missing LockSerializer address for this chain: ${chainId}`)
  }
  if (!unlockAddress) {
    throw new Error(`Missing Unlock address for this chain: ${chainId}`)
  }
  const rpc = new ethers.providers.JsonRpcProvider(provider)
  migrateLogEvent.emit('migrateLock', {
    recordId,
    msg: `CLONE LOCK > cloning ${lockAddress} on ${network.name}...`,
  })

  const signer = Wallet.fromMnemonic(mnemonic).connect(rpc)

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
  const { abi: unlockAbi } = contracts[`UnlockV${unlockVersion}` as keyof {}]
  const unlock = new ethers.Contract(unlockAddress, unlockAbi, signer)

  // create the new lock
  let txLockCreate
  if (unlockVersion < 10) {
    const salt = ethers.utils.hexZeroPad(ethers.utils.randomBytes(12), 12)
    txLockCreate = await unlock.createLock(...lockArgs, salt)
  } else {
    // @ts-ignore
    const calldata = await unlockAbi.encodeFunctionData(
      'initialize(address,uint256,address,uint256,uint256,string)',
      [signer.address, ...lockArgs]
    )
    txLockCreate = await unlock.createLock(calldata)
  }
  // gbet new lock address
  const { events, transactionHash } = await txLockCreate.wait()
  const { args } = events.find(({ event }: any) => event === 'NewLock')
  const { newLockAddress } = args

  migrateLogEvent.emit('migrateLock', {
    recordId,
    msg: `CLONE LOCK > deployed to : ${newLockAddress} (tx: ${transactionHash})`,
  })

  migrateLogEvent.emit('migrateLock', {
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
  const transfers = keyEvents.filter(({ event }: any) => event === 'Transfer')
  const keyManagersChanges = keyEvents.filter(
    ({ event }: any) => event === 'KeyManagerChanged'
  )
  migrateLogEvent.emit('migrateLock', {
    recordId,
    msg: `CLONE LOCK > ${transfers.length} keys transferred, ${keyManagersChanges.length} key managers changed`,
  })

  migrateLogEvent.emit('migrateLock', {
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
    } catch (error: any) {
      migrateLogEvent.emit('migrateLock', {
        recordId,
        msg: error.message,
      })
      managers = []
    }
    if (managers.length) {
      migrateLogEvent.emit('migrateLock', {
        recordId,
        msg: `LOCK > managers for the lock '${await newLock.name()}':`,
      })
      managers.forEach((account: string, i: number) => {
        migrateLogEvent.emit('migrateLock', {
          recordId,
          msg: `[${i}]: ${account}`,
        })
      })

      const txs = await Promise.all(
        managers.map((manager: string) => newLock.addLockManager(manager))
      )
      const waits = await Promise.all(txs.map((tx: any) => tx.wait()))
      waits.forEach(({ events }) => {
        const evt = events.find((evt: any) => evt.event === 'LockManagerAdded')
        migrateLogEvent.emit('migrateLock', {
          recordId,
          msg: `LOCK CLONE > ${evt.args.account} added as lock manager.`,
        })
      })
    }
  } else {
    migrateLogEvent.emit('migrateLock', {
      recordId,
      msg: 'Missing SubgraphURI. Can not fetch from The Graph on this network, sorry.',
    })
  }

  // update the beneficiary
  const txBenef = await newLock.updateBeneficiary(beneficiary)
  await txBenef.wait()
  migrateLogEvent.emit('migrateLock', {
    recordId,
    msg: `LOCK CLONE > ${beneficiary} set as beneficiary.`,
  })

  // update metadata
  if (symbol != 'UDT') {
    const txSymbol = await newLock.updateLockSymbol(symbol)
    await txSymbol.wait()
    migrateLogEvent.emit('migrateLock', {
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
      migrateLogEvent.emit('migrateLock', {
        recordId,
        msg: `LOCK CLONE > baseTokenURI updated to '${baseTokenURI}'.`,
      })
    }
  } catch (error) {
    migrateLogEvent.emit('migrateLock', {
      recordId,
      msg: `LOCK CLONE > baseTokenURI not set, using default. (ex. '${tokenURISample}').`,
    })
  }

  if (symbol != 'UDT') {
    const txSymbol = await newLock.updateLockSymbol(symbol)
    await txSymbol.wait()
    migrateLogEvent.emit('migrateLock', {
      recordId,
      msg: `LOCK CLONE > Symbol updated to '${symbol}'.`,
    })
  }

  // disable lock
  const txDisable = await newLock.disableLock()
  await txDisable.wait()
  migrateLogEvent.emit('migrateLock', {
    recordId,
    msg: 'LOCK CLONE > Origin lock has been disabled.',
  })

  // remove ourselves as lockManagers
  const txRemoveUs = await newLock.renounceLockManager()
  await txRemoveUs.wait()
  migrateLogEvent.emit('migrateLock', {
    recordId,
    msg: 'LOCK CLONE > Removed Unlock as lock manager.',
  })

  return {
    newLockAddress,
  }
}
