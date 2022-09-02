import type { Contract, BigNumber } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

import { NetworkConfig } from '@unlock-protocol/types'

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

export interface Unlock {
  networks: UnlockNetworkConfigs
  unlock?: Contract
  getChainId: {
    (): Promise<number>
  }
  getNetworkInfo: {
    (): Promise<UnlockNetworkConfig>
  }
  createLock: {
    (args: LockArgs): Promise<{
      lock: Contract
      lockAddress: string
      transactionHash: string
    }>
  }
  getLock: {
    (lockAddress: string, versionNumber?: number): Promise<Contract>
  }
  getUnlock: {
    (versionNumber?: number): Promise<Contract>
  }
  getSigner: {
    (): Promise<SignerWithAddress>
  }
  configUnlock: {
    (args: UnlockConfigArgs): Promise<UnlockConfigArgs>
  }
  setUnlock: {
    (
      unlockAddress: string | undefined,
      versionNumber?: number
    ): Promise<Contract>
  }
  deployPublicLock: {
    (version?: number, confirmations?: number): Promise<Contract>
  }
  deployUnlock: {
    (version?: number, confirmations?: number): Promise<Contract>
  }
  deployProtocol: {
    (
      unlockVersion?: number,
      lockVersion?: number,
      confirmations?: number
    ): Promise<UnlockProtocolContracts>
  }
}
