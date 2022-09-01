import { Network, HardhatRuntimeEnvironment } from 'hardhat/types'
import {
  UnlockNetworkConfigs,
  UnlockProtocolContracts,
  LockArgs,
  UnlockConfigArgs,
} from './types'

import { BigNumber, Contract } from 'ethers'
import { UNLOCK_LATEST_VERSION, PUBLIC_LOCK_LATEST_VERSION } from './constants'
import { getContractFactory, deployUpgreadableContract } from './deploy'
import { getContractAbi } from './utils'

export class UnlockHRE {
  networks: UnlockNetworkConfigs

  provider: Network['provider']

  ethers: HardhatRuntimeEnvironment['ethers']

  unlock?: Contract

  constructor({ network, config, ethers }: HardhatRuntimeEnvironment) {
    // store HRE
    this.provider = network.provider
    this.ethers = ethers

    // parse network info
    this.networks = Object.keys(config.networks)
      .map((netName) => config.networks[netName])
      .filter(({ chainId }) => chainId)
      .reduce((acc, { chainId }) => {
        if (chainId !== undefined) {
          return {
            ...acc,
            [chainId]: config.unlock[chainId],
          }
        }
        return acc
      }, {})
  }

  public getChainId = async () => {
    const hexChainId = await this.provider.send('eth_chainId')
    return BigNumber.from(hexChainId).toNumber()
  }

  public getNetworkInfo = async () => {
    const chainId = BigNumber.from(await this.getChainId()).toString()
    return this.networks[chainId]
  }

  public getSigner = async () => {
    const [defaultSigner] = await this.ethers.getSigners()
    return defaultSigner
  }

  public deployUnlock = async (
    version = UNLOCK_LATEST_VERSION,
    confirmations = 5
  ) => {
    const signer = await this.getSigner()
    const unlock: Contract = await deployUpgreadableContract(
      this,
      'Unlock',
      version,
      'initialize(address)',
      [signer.address],
      signer,
      confirmations
    )

    console.log(`UNLOCK > deployed to : ${unlock.address}`)

    // set unlock in class
    this.unlock = unlock
    return unlock
  }

  public deployPublicLock = async (
    version = PUBLIC_LOCK_LATEST_VERSION,
    confirmations = 5
  ) => {
    const signer = await this.getSigner()
    const PublicLock = await getContractFactory(
      this,
      'PublicLock',
      version,
      signer
    )

    const publicLock: Contract = await PublicLock.deploy()
    await publicLock.deployTransaction.wait(confirmations)

    console.log(`PUBLICLOCK > deployed to : ${publicLock.address}`)
    return publicLock
  }

  public deployProtocol = async (
    unlockVersion = UNLOCK_LATEST_VERSION,
    lockVersion = PUBLIC_LOCK_LATEST_VERSION,
    confirmations = 1 // default to 1, as this is mostly for use on local dev
  ): Promise<UnlockProtocolContracts> => {
    const signer = await this.getSigner()

    // 1. deploy Unlock
    const unlock = await this.deployUnlock(unlockVersion, confirmations)

    // 2. deploy PublicLock template
    const publicLock = await this.deployPublicLock(lockVersion, confirmations)

    // 3. setting lock template
    const version = await publicLock.publicLockVersion()
    await unlock.connect(signer).addLockTemplate(publicLock.address, version)
    await unlock.connect(signer).setLockTemplate(publicLock.address)

    return {
      unlock,
      publicLock,
    }
  }

  public configUnlock = async ({
    udtAddress,
    wethAddress,
    locksmithURI,
    chainId,
    estimatedGasForPurchase,
    symbol,
  }: UnlockConfigArgs): Promise<UnlockConfigArgs> => {
    const unlock = await this.getUnlock()
    if (!udtAddress) udtAddress = await unlock.udt()
    if (!wethAddress) wethAddress = await unlock.weth()
    if (!chainId) chainId = await this.getChainId()
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

  public setUnlock = async (
    unlockAddress: string | undefined,
    versionNumber = UNLOCK_LATEST_VERSION
  ) => {
    if (!unlockAddress) throw new Error('Missing Unlock contract address')

    const { abi } = getContractAbi('Unlock', versionNumber)
    const unlock = await this.ethers.getContractAt(abi, unlockAddress)
    this.unlock = unlock
    return unlock
  }

  public getUnlock = async (versionNumber = UNLOCK_LATEST_VERSION) => {
    if (this.unlock) return this.unlock
    const chainId = await this.getChainId()
    const { unlockAddress } = this.networks[chainId]
    if (!unlockAddress) throw new Error('Could not fetch the Unlock contract')
    const unlock = await this.setUnlock(unlockAddress, versionNumber)
    return unlock
  }

  public getLock = async (
    lockAddress: string,
    versionNumber = PUBLIC_LOCK_LATEST_VERSION
  ) => {
    if (!lockAddress) {
      throw new Error('Missing lock address')
    }
    const { abi } = getContractAbi('PublicLock', versionNumber)
    const lock = await this.ethers.getContractAt(abi, lockAddress)
    return lock
  }

  public createLock = async ({
    name,
    keyPrice,
    expirationDuration,
    currencyContractAddress,
    maxNumberOfKeys,
  }: LockArgs): Promise<{
    lock: Contract
    lockAddress: string
    transactionHash: string
  }> => {
    const unlock = await this.getUnlock()

    // create2 legacy, currently unused but required
    const salt = '0x000000000000000000000001'

    const args = [
      expirationDuration,
      currencyContractAddress || this.ethers.constants.AddressZero,
      keyPrice,
      maxNumberOfKeys,
      name,
      salt,
    ]

    const tx = await unlock.createLock(...args)
    const { events, transactionHash } = await tx.wait()
    const {
      args: { newLockAddress },
    } = events.find(({ event }: any) => event === 'NewLock')

    const lock = await this.getLock(newLockAddress)
    return {
      lock,
      lockAddress: newLockAddress,
      transactionHash,
    }
  }
}
