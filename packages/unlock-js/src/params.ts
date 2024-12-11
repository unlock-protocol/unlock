export interface CreateLockOptions {
  publicLockVersion?: number | string
  name: string
  expirationDuration?: number | string
  maxNumberOfKeys?: number | string
  currencyContractAddress?: string | null
  keyPrice?: string | number
  creator?: string
}

export interface PurchaseKeyParams {
  lockAddress: string
  owner?: string
  keyPrice?: string
  data?: string | null
  erc20Address?: string
  decimals?: number
  recurringPayments?: number
  referrer?: string
  protocolReferrer?: string
  additionalPeriods?: number
  totalApproval?: string
  keyManager?: string
}

export interface PurchaseKeysParams {
  lockAddress: string
  owners: string[]
  keyPrices?: string[]
  data?: string[] | null
  erc20Address?: string
  decimals?: number
  referrers?: (string | null)[]
  protocolReferrers?: (string | null)[]
  additionalPeriods?: number[]
  recurringPayments?: number[]
  totalApproval?: string
  keyManagers?: string[]
}

export interface ExtendKeyParams {
  lockAddress: string
  tokenId?: string
  owner?: string
  referrer?: string
  data?: string
  decimals?: number
  erc20Address?: string
  keyPrice?: string
  recurringPayment?: string | number
  totalApproval?: string
}

export interface GetAndSignAuthorizationsForTransferAndPurchaseParams {
  amount: string // this is in cents
  lockAddress: string
  network: number
}

export interface PurchaseWithCardPurchaserParams {
  transfer: any
  purchase: any
  callData: string
}
