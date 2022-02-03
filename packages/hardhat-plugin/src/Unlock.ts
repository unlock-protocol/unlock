/* eslint-disable class-methods-use-this, import/no-cycle */
import networks from '@unlock-protocol/networks'
import { BigNumber } from 'ethers'
import type { providers, Contract } from 'ethers'

import { NetworkConfigs } from '@unlock-protocol/types'
import { Network, HardhatRuntimeEnvironment } from 'hardhat/types'
import type { HardhatUpgrades } from '@openzeppelin/hardhat-upgrades'

import { UNLOCK_LATEST_VERSION, PUBLIC_LOCK_LATEST_VERSION } from './constants'
import {
  getContractFactory,
  deployContract,
  deployUpgreadableContract,
} from './deploy'

export interface UnlockProtocolContracts {
  unlock: Contract
  publicLock: Contract
}

export class UnlockHRE {
  networks: NetworkConfigs

  network: Network

  upgrades: HardhatUpgrades

  provider: Network['provider']

  ethers: HardhatRuntimeEnvironment['ethers']

  run: HardhatRuntimeEnvironment['run']

  contractsFolder: string

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
            [chainId]: networks[chainId],
          }
        }
        return acc
      }, {})
  }

  public getChainId = async () => await this.provider.send('eth_chainId')

  public getNetworkInfo = async () => {
    const chainId = BigNumber.from(await this.getChainId()).toString()
    return networks[chainId]
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
    confirmations: number = 5,
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

    return unlock
  }

  public deployPublicLock = async (
    version = PUBLIC_LOCK_LATEST_VERSION,
    confirmations: number = 5,
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
    confirmations: number = 5,
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
}
