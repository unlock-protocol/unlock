/* eslint-disable */
import { EventEmitter } from 'events'
import { providers, Wallet } from 'ethers'

interface Web3ServiceParams {
  readOnlyProvider: string
  unlockAddress: string
  blockTime: number
  requiredConfirmations: number
}

export interface PurchaseKeyParams {
  lockAddress: string
  owner: string
  keyPrice: string
  erc20Address: string | null
}

export interface TransactionDefaults {
  hash: string
  to: string
  from: string
  input: string | null
  [key: string]: any
}

export interface RawLock {
  name: string
  address: string
  keyPrice: string
  expirationDuration: number
  currencyContractAddress: string | null
  asOf?: number
  maxNumberOfKeys?: number
  outstandingKeys?: number
  balance?: string
  owner?: string
}

export interface KeyResult {
  lock: string
  owner: string | null
  expiration: number
}

interface UnlockProviderConnectParams {
  key: string
  password: string
  emailAddress: string
}

export class UnlockProvider extends providers.JsonRpcProvider {
  constructor({ readOnlyProvider }: { readOnlyProvider: string });
  connect: (params: UnlockProviderConnectParams) => Promise<boolean>;
  // TODO: better types for these
  eth_accounts: () => string[];
  send: (method: string, params: any[]) => any;
  personal_sign: (params: any[]) => any;
  signData: (data: any) => any;
  signPaymentData: (stripeTokenId: string) => any;
  signKeyPurchaseRequestData: (input: any) => any;
  generateSignedEjectionRequest: () => any;
}

type Web3Provider = string | UnlockProvider | providers.Web3Provider

export class Web3Service extends EventEmitter {
  constructor(params: Web3ServiceParams);
  refreshAccountBalance: ({ address }: { address: string }) => Promise<string>;
  getTransaction: (
    transactionHash: string,
    defaults?: TransactionDefaults
  ) => Promise<void>;
  getLock: (address: string) => Promise<RawLock>;
  getKeyByLockForOwner: (lock: string, owner: string) => Promise<KeyResult>;
  getTokenBalance: (
    tokenAddress: string,
    accountAddress: string
  ) => Promise<string>;
}

export class WalletService extends EventEmitter {
  constructor({ unlockAddress }: { unlockAddress: string })
  ready: boolean
  provider?: any
  connect: (provider: Web3Provider) => Promise<void>
  getAccount: () => Promise<string | false>
  purchaseKey: (params: PurchaseKeyParams) => Promise<string>
}

interface AddressAndKey {
  address: string
  passwordEncryptedPrivateKey: any
}

export function createAccountAndPasswordEncryptKey(password: string): Promise<AddressAndKey>
export function getAccountFromPrivateKey(encryptedPrivateKey: any, password: string): Promise<Wallet>
export function reEncryptPrivateKey(encryptedPrivateKey: any, password: string, newPassword: string): Promise<any>
