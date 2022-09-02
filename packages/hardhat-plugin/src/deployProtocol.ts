import { HardhatRuntimeEnvironment } from 'hardhat/types'
import type { Contract } from 'ethers'

import { getContractFactory, deployUpgreadableContract } from './utils'
import { UNLOCK_LATEST_VERSION, PUBLIC_LOCK_LATEST_VERSION } from './constants'
import { getUnlockContract } from './getUnlockContract'

export interface DeployProtocolFunction {
  (
    hre: HardhatRuntimeEnvironment,
    unlockVersion?: number,
    lockVersion?: number,
    confirmations?: number
  ): Promise<{
    unlock: Contract
    publicLock: Contract
  }>
}

export interface UnlockConfigArgs {
  udtAddress?: string | null
  wethAddress?: string | null
  locksmithURI?: string
  chainId?: number
  estimatedGasForPurchase?: number
  symbol?: string
}

export async function deployUnlock(
  hre: HardhatRuntimeEnvironment,
  version = UNLOCK_LATEST_VERSION,
  confirmations = 5
) {
  const [signer] = await hre.ethers.getSigners()
  const unlock: Contract = await deployUpgreadableContract(
    hre,
    'Unlock',
    version,
    'initialize(address)',
    [signer.address],
    signer,
    confirmations
  )

  console.log(`UNLOCK > deployed to : ${unlock.address}`)

  return unlock
}

export async function deployPublicLock(
  hre: HardhatRuntimeEnvironment,
  version = PUBLIC_LOCK_LATEST_VERSION,
  confirmations = 5
) {
  const [signer] = await hre.ethers.getSigners()
  const PublicLock = await getContractFactory(
    hre,
    'PublicLock',
    version,
    signer
  )

  const publicLock: Contract = await PublicLock.deploy()
  await publicLock.deployTransaction.wait(confirmations)

  console.log(`PUBLICLOCK > deployed to : ${publicLock.address}`)
  return publicLock
}

export async function deployProtocol(
  hre: HardhatRuntimeEnvironment,
  unlockVersion = UNLOCK_LATEST_VERSION,
  lockVersion = PUBLIC_LOCK_LATEST_VERSION,
  confirmations = 1 // default to 1, as this is mostly for use on local dev
): Promise<{
  unlock: Contract
  publicLock: Contract
}> {
  const [signer] = await hre.ethers.getSigners()

  // 1. deploy Unlock
  const unlock = await deployUnlock(hre, unlockVersion, confirmations)

  // 2. deploy PublicLock template
  const publicLock = await deployPublicLock(hre, lockVersion, confirmations)

  // 3. setting lock template
  const version = await publicLock.publicLockVersion()
  await unlock.connect(signer).addLockTemplate(publicLock.address, version)
  await unlock.connect(signer).setLockTemplate(publicLock.address)

  return {
    unlock,
    publicLock,
  }
}

export async function configUnlock(
  hre: HardhatRuntimeEnvironment,
  unlockAddress: string,
  {
    udtAddress,
    wethAddress,
    locksmithURI,
    chainId,
    estimatedGasForPurchase,
    symbol,
  }: UnlockConfigArgs
): Promise<UnlockConfigArgs> {
  const unlock = await getUnlockContract(hre, unlockAddress)

  if (!udtAddress) udtAddress = await unlock.udt()
  if (!wethAddress) wethAddress = await unlock.weth()
  if (!chainId) {
    ;({ chainId } = await hre.ethers.provider.getNetwork())
  }
  if (!estimatedGasForPurchase)
    estimatedGasForPurchase = await unlock.estimatedGasForPurchase()
  if (!symbol) symbol = 'KEY'
  if (!locksmithURI) locksmithURI = await unlock.globalBaseTokenURI()

  await unlock.configUnlock(
    udtAddress,
    wethAddress,
    estimatedGasForPurchase,
    symbol,
    locksmithURI,
    chainId
  )
  return {
    udtAddress,
    wethAddress,
    estimatedGasForPurchase,
    symbol,
    locksmithURI,
    chainId,
  }
}
