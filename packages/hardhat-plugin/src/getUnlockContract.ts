import { HardhatRuntimeEnvironment } from 'hardhat/types'
import type { Contract } from 'ethers'

import { getContractAbi } from './utils'

export interface GetUnlockContractFunction {
  (hre: HardhatRuntimeEnvironment, unlockAddress: string): Promise<Contract>
}

export async function getUnlockVersion(
  hre: HardhatRuntimeEnvironment,
  unlockAddress: string
): Promise<number> {
  const contract = await hre.ethers.getContractAt(
    ['function unlockVersion() view returns (uint8)'],
    unlockAddress
  )
  let version = 0
  try {
    const contractVersion = await contract.unlockVersion()
    version = parseInt(contractVersion, 10) || 0
  } catch (error) {
    console.error(
      `We could not retrieve the version of the Unlock contract ${unlockAddress} on this network.`
    )
  }
  return version
}

export async function getUnlockContract(
  hre: HardhatRuntimeEnvironment,
  unlockAddress?: string
): Promise<Contract> {
  if (!unlockAddress) {
    const { chainId } = await hre.ethers.provider.getNetwork()
    ;({ unlockAddress } = hre.unlock.networks[chainId])
    if (!unlockAddress) {
      throw new Error(`No Unlock contract for this network: ${chainId}`)
    }
  }

  // get version
  const version = await getUnlockVersion(hre, unlockAddress)
  const { abi } = getContractAbi('Unlock', version)

  // get unlock instance
  const unlock = await hre.ethers.getContractAt(abi, unlockAddress)
  return unlock
}
