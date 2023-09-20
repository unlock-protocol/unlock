import type { HardhatRuntimeEnvironment } from 'hardhat/types'
import type { BigNumber } from 'ethers'
import { Contract, constants } from 'ethers'
import { PUBLIC_LOCK_LATEST_VERSION } from './constants'

import { getUnlockContract } from './getUnlockContract'
import { getLockContract } from './getLockContract'
import { getContractAbi } from './utils'

export interface CreateLockArgs {
  name: string
  keyPrice: string | number | BigNumber
  expirationDuration: number
  currencyContractAddress: string | null
  maxNumberOfKeys?: number
  beneficiary?: string
  version?: number
  unlockAddress?: string
}

export interface CreateLockFunction {
  (args: CreateLockArgs): Promise<{
    lock: Contract
    lockAddress: string
    transactionHash: string
  }>
}

export async function createLock(
  hre: HardhatRuntimeEnvironment,
  {
    name,
    keyPrice,
    expirationDuration,
    currencyContractAddress,
    maxNumberOfKeys,
    beneficiary,
    version = PUBLIC_LOCK_LATEST_VERSION,
    unlockAddress,
  }: CreateLockArgs
): Promise<{
  lock: Contract
  lockAddress: string
  transactionHash: string
}> {
  console.log(`Creating lock ${version}...`)

  // send tx
  const [signer] = await hre.ethers.getSigners()
  if (!beneficiary) beneficiary = signer.address

  // create call data
  const { abi } = getContractAbi('PublicLock', version)
  const iface = new hre.ethers.utils.Interface(abi)

  // encode initializer data
  const fragment = iface.getFunction(
    'initialize(address,uint256,address,uint256,uint256,string)'
  )
  const calldata = iface.encodeFunctionData(fragment, [
    beneficiary,
    expirationDuration,
    currencyContractAddress || constants.AddressZero,
    keyPrice,
    maxNumberOfKeys,
    name,
  ])

  // create the lock
  const unlock = await getUnlockContract(hre, unlockAddress)
  const tx = await unlock.createUpgradeableLockAtVersion(calldata, version)
  const { events, transactionHash } = await tx.wait()
  const { args } = events.find(({ event }: any) => event === 'NewLock')
  const { newLockAddress } = args

  const lock = await getLockContract(hre, newLockAddress)
  return {
    lock,
    lockAddress: newLockAddress,
    transactionHash,
  }
}
