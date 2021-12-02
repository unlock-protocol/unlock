import { ethers, Wallet } from 'ethers'
import * as contracts from '@unlock-protocol/contracts'
import { NetworkConfig } from '@unlock-protocol/types'
import { networks } from '@unlock-protocol/networks'
import listManagers from './lockManagers'

interface LockClonerProps {
  lockAddress: string
  unlockVersion: Number
  chainId: number
}

// TODO: how to pass this safely?
const mnemonic =
  process.env.WALLET_MNEMONIC ||
  'test test test test test test test test test test test junk'

export default async function lockMigrate({
  lockAddress,
  unlockVersion,
  chainId,
}: LockClonerProps) {
  // super complicated parsing to make ts happy ;-)
  const [, network]: [string, NetworkConfig] = Object.entries(networks).find(
    ([, n]) => n.id === chainId
  ) as [string, NetworkConfig]

  const rpc = new ethers.providers.JsonRpcProvider(network.provider)
  console.log(`CLONE LOCK > cloning ${lockAddress} on ${network.name}...`)

  const signer = Wallet.fromMnemonic(mnemonic).connect(rpc)

  const { unlockAddress, serializerAddress } = network
  if (!serializerAddress) {
    throw new Error(`Missing LockSerializer address for this chain: ${chainId}`)
  }
  if (!unlockAddress) {
    throw new Error(`Missing Unlock address for this chain: ${chainId}`)
  }

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
    console.log(
      expirationDuration,
      tokenAddress,
      keyPrice,
      maxNumberOfKeys,
      name,
      salt
    )
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

  // eslint-disable-next-line no-console
  console.log(
    `CLONE LOCK > deployed to : ${newLockAddress} (tx: ${transactionHash})`
  )

  // eslint-disable-next-line no-console
  console.log('CLONE LOCK > add key owners...')
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
  // eslint-disable-next-line no-console
  console.log(
    `CLONE LOCK > ${transfers.length} keys transferred, ${keyManagersChanges.length} key managers changed`
  )

  // eslint-disable-next-line no-console
  console.log('CLONE LOCK > fetching managers...')

  // fetch managers from graph
  if (network.subgraphURI) {
    const managers = await listManagers({
      lockAddress: newLockAddress,
      subgraphURI: network.subgraphURI,
    })
    if (managers.length) {
      // eslint-disable-next-line no-console
      console.log(`LOCK > managers for the lock '${await newLock.name()}':`)
      managers.forEach((account: string, i: number) => {
        // eslint-disable-next-line no-console
        console.log(`[${i}]: ${account}`)
      })

      const txs = await Promise.all(
        managers.map((manager: string) => newLock.addLockManager(manager))
      )
      const waits = await Promise.all(txs.map((tx: any) => tx.wait()))
      waits.forEach(({ events }) => {
        const evt = events.find((evt: any) => evt.event === 'LockManagerAdded')
        // eslint-disable-next-line no-console
        console.log(`LOCK CLONE > ${evt.args.account} added as lock manager.`)
      })
    } else {
      console.log(
        'Missing SubgraphURI. Can not fetch from The Graph on this network, sorry.'
      )
    }
  }

  // update the beneficiary
  const txBenef = await newLock.updateBeneficiary(beneficiary)
  await txBenef.wait()
  console.log(`LOCK CLONE > ${beneficiary} set as beneficiary.`)

  // update metadata
  if (symbol != 'UDT') {
    const txSymbol = await newLock.updateLockSymbol(symbol)
    await txSymbol.wait()
    console.log(`LOCK CLONE > Symbol updated to '${symbol}'.`)
  }

  // TODO: tokenURI

  // remove ourselves as lockManagers
  const txRemoveUs = await newLock.renounceLockManager()
  await txRemoveUs.wait()
  console.log('LOCK CLONE > Removed outselves as lock manager.')

  return {
    newLockAddress,
  }
}
