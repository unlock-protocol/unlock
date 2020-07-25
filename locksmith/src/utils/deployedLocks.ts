import { ethers } from 'ethers'
import { ParsedBlockForLockCreation } from '../models/parsedBlockForLockCreation'

const Unlock = require('unlock-abi-1-1')
const lockOperations = require('../operations/lockOperations')

// eslint-disable-next-line import/prefer-default-export
export async function deployedLocks(
  unlockContractAddress: string,
  network: string
) {
  const lastBlockFetched = await ParsedBlockForLockCreation.findByPk(1)
  /* 
  3530009 is the block holding the deployment of unlock on Rinkeby,its heavy handed for production but
  it works as bootstrap.
   */
  const startingBlock: number = lastBlockFetched
    ? lastBlockFetched.blockNumber
    : 3530009

  await fetchLocksExternally(unlockContractAddress, startingBlock, network)
  return await fetchPersistedLocks()
}

export async function fetchLocksExternally(
  unlockContractAddress: string,
  startingBlock: number,
  network: string
) {
  const etherscanProvider = new ethers.providers.EtherscanProvider(network)
  const lastBlock = await etherscanProvider.getBlockNumber()
  const logs = await etherscanProvider.getLogs({
    address: unlockContractAddress,
    fromBlock: startingBlock,
    toBlock: 'latest',
  })

  return await persistLocks(logs, lastBlock)
}

async function fetchPersistedLocks() {
  return await lockOperations.getLockAddresses()
}

async function persistLocks(logs: any[], lastBlock: number) {
  const { abi } = Unlock.Unlock
  const etherInterface = new ethers.utils.Interface(abi)
  const lockAddress: any = []

  logs.forEach((log) => {
    const parsedLog = etherInterface.parseLog(log)
    if (
      parsedLog &&
      parsedLog.name &&
      parsedLog.name.toLowerCase() == 'newlock'
    ) {
      lockAddress.push(parsedLog.values.newLockAddress)
      lockOperations.createLock({
        address: parsedLog.values.newLockAddress,
        owner: parsedLog.values.lockOwner,
      })
    }
  })

  await ParsedBlockForLockCreation.upsert({ id: 1, blockNumber: lastBlock })
  return lockAddress
}
