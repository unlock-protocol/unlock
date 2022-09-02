import { HardhatRuntimeEnvironment } from 'hardhat/types'

export interface GetLockVersionFunction {
  (hre: HardhatRuntimeEnvironment, lockAddress: string): Promise<number>
}

export async function getLockVersion(
  hre: HardhatRuntimeEnvironment,
  lockAddress: string
): Promise<number> {
  const contract = await hre.ethers.getContractAt(
    ['function publicLockVersion() view returns (uint8)'],
    lockAddress
  )
  let version = 0
  try {
    const contractVersion = await contract.publicLockVersion()
    version = parseInt(contractVersion, 10) || 0
  } catch (error) {
    console.error(
      `We could not retrieve the version of the Unlock contract ${lockAddress} on this network.`
    )
  }
  return version
}
