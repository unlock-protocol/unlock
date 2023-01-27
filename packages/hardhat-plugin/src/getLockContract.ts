import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { getContractAbi } from './utils'
import { Contract } from 'ethers'

import { getLockVersion } from './getLockVersion'

export interface GetLockContractFunction {
  (lockAddress: string): Promise<Contract>
}

export async function getLockContract(
  hre: HardhatRuntimeEnvironment,
  lockAddress: string
): Promise<Contract> {
  if (!lockAddress) {
    throw new Error('Missing lock address')
  }

  // fetch version if missing
  const versionNumber = await getLockVersion(hre, lockAddress)
  const { abi } = getContractAbi('PublicLock', versionNumber)
  const lock = await hre.ethers.getContractAt(abi, lockAddress)
  return lock
}
