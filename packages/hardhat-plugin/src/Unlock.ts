import { BigNumber } from 'ethers'
import type { providers, Contract } from 'ethers'

import { Network, HardhatRuntimeEnvironment } from 'hardhat/types'
import type { HardhatUpgrades } from '@openzeppelin/hardhat-upgrades'
import { NetworkConfig } from '@unlock-protocol/types'

import { UNLOCK_LATEST_VERSION, PUBLIC_LOCK_LATEST_VERSION } from './constants'
import {
  getContractFactory,
  deployContract,
  deployUpgreadableContract,
} from './deploy'
import { getContractAbi } from './utils'

// used to make type optional
type PartialPick<T, K extends keyof T> = {
  [P in K]?: T[P]
}

// make network info optional
export type UnlockNetworkConfig = PartialPick<
  NetworkConfig,
  | 'id'
  | 'name'
  | 'subgraphURI'
  | 'locksmithUri'
  | 'unlockAddress'
  | 'serializerAddress'
>

export interface UnlockNetworkConfigs {
  [networkId: string]: UnlockNetworkConfig
}

export interface UnlockProtocolContracts {
  unlock: Contract
  publicLock: Contract
}

export interface LockArgs {
  name: string
  keyPrice: string | number | BigNumber
  expirationDuration: number
  currencyContractAddress: string | null
  maxNumberOfKeys?: number
}

export interface UnlockConfigArgs {
  udtAddress?: string | null
  wethAddress?: string | null
  locksmithURI?: string
  chainId?: number
  estimatedGasForPurchase?: number
  symbol?: string
}

export class UnlockHRE {
  networks: UnlockNetworkConfigs

  network: Network

  upgrades: HardhatUpgrades

  provider: Network['provider']

  ethers: HardhatRuntimeEnvironment['ethers']

  run: HardhatRuntimeEnvironment['run']

  contractsFolder: string

  unlock?: Contract

  constructor({
    ethers,
    network,
    config,
    upgrades,
    run,
  }: HardhatRuntimeEnvironment) {
    // store HRE
    this.provider = network.provider
    this.network = network
    this.ethers = ethers
    this.upgrades = upgrades
    this.run = run

    this.contractsFolder = config.paths.sources

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
    if (process.env.WALLET_PRIVATE_KEY !== undefined) {
      return new this.ethers.Wallet(
        process.env.WALLET_PRIVATE_KEY,
        this.ethers.provider
      )
    }

    const [defaultSigner] = await this.ethers.getSigners()
    return defaultSigner
  }

  public deployUnlock = async (
    version = UNLOCK_LATEST_VERSION,
    confirmations = 5,
    deploymentOptions: providers.TransactionRequest = {}
  ) => {
    const signer = await this.getSigner()
    const unlock: Contract = await deployUpgreadableContract(
      this,
      'Unlock',
      version,
      'initialize(address)',
      [signer.address],
      signer,
      confirmations,
      deploymentOptions
    )

    // eslint-disable-next-line no-console
    console.log(`UNLOCK > deployed to : ${unlock.address}`)

    // set unlock in class
    this.unlock = unlock
    return unlock
  }

  public deployPublicLock = async (
    version = PUBLIC_LOCK_LATEST_VERSION,
    confirmations = 5,
    deploymentOptions: providers.TransactionRequest = {}
  ) => {
    const signer = await this.getSigner()
    const PublicLock = await getContractFactory(
      this,
      'PublicLock',
      version,
      signer
    )

    const publicLock: Contract = await deployContract(
      this,
      PublicLock,
      [],
      confirmations,
      deploymentOptions
    )

    // eslint-disable-next-line no-console
    console.log(`PUBLICLOCK > deployed to : ${publicLock.address}`)

    return publicLock
  }

  public deployProtocol = async (
    unlockVersion = UNLOCK_LATEST_VERSION,
    lockVersion = PUBLIC_LOCK_LATEST_VERSION,
    confirmations = 1, // default to 1, as this is mostly for use on local dev
    deploymentOptions: providers.TransactionRequest = {}
  ): Promise<UnlockProtocolContracts> => {
    const signer = await this.getSigner()

    // 1. deploy Unlock
    const unlock = await this.deployUnlock(
      unlockVersion,
      confirmations,
      deploymentOptions
    )

    // 2. deploy PublicLock template
    const publicLock = await this.deployPublicLock(
      lockVersion,
      confirmations,
      deploymentOptions
    )

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
