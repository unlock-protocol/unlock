import { ethers } from 'ethers'

// These interfaces patch over the sort of incomplete definition of
// RawLock in unlockTypes. TODO: we should really tighten up our lock
// type so that it at least includes as optional all possible
// properties on a lock. These are all compatible with RawLock insofar
// as they only extend it with properties that may be undefined.
interface LockKeysAvailableLock {
  unlimitedKeys?: boolean
  maxNumberOfKeys?: number
  outstandingKeys?: number
}

interface LockFiatPricing {
  [currency: string]: any
}
interface LockTickerSymbolLock {
  keyPrice?: string
  currencyContractAddress: string | null
  currencySymbol?: string
  fiatPricing?: LockFiatPricing
}

interface LockPriceLock {
  currencyContractAddress: string | null
  keyPrice: string
}

export const numberOfAvailableKeys = ({
  unlimitedKeys,
  maxNumberOfKeys,
  outstandingKeys,
}: LockKeysAvailableLock) => {
  if (unlimitedKeys || maxNumberOfKeys! < 0) {
    return Infinity
  }

  // maxNumberOfKeys and outstandingKeys are assumed to be defined
  // if they are ever not, a runtime error can occur
  return maxNumberOfKeys! - outstandingKeys!
}

export const lockKeysAvailable = ({
  maxNumberOfKeys,
  outstandingKeys,
}: LockKeysAvailableLock) => {
  if (maxNumberOfKeys === -1) {
    return 'Unlimited'
  }

  // maxNumberOfKeys and outstandingKeys are assumed to be defined
  // if they are ever not, a runtime error can occur
  return (maxNumberOfKeys! - outstandingKeys!).toLocaleString()
}

export const lockTickerSymbol = (
  lock: LockTickerSymbolLock,
  baseCurrencySymbol: string
) => {
  if (lock.currencyContractAddress) {
    return ((lock as any).currencySymbol || 'ERC20').toUpperCase()
  }
  return baseCurrencySymbol.toUpperCase()
}

export const userCanAffordKey = (
  lock: LockPriceLock,
  balance: string
): boolean => {
  const keyPrice = parseFloat(lock.keyPrice)
  const _balance = parseFloat(balance)
  // For eth/base currency need some gas so if the balance is exactly the same as key price this would fail
  if (!lock.currencyContractAddress) {
    return keyPrice < _balance
  }

  // TODO: take balance of eth into account for gas (it's tricky!)
  return keyPrice <= _balance
}

export const convertedKeyPrice = (
  lock: LockTickerSymbolLock,
  numberOfRecipients = 1
) => {
  const keyPrice = lock?.fiatPricing?.usd?.keyPrice

  if (!keyPrice) {
    return ''
  }
  return `~$${((parseFloat(keyPrice) * numberOfRecipients) / 100).toFixed(2)}`
}

export const formattedKeyPrice = (
  lock: LockTickerSymbolLock,
  baseCurrencySymbol: string,
  numberOfRecipients = 1
) => {
  const { keyPrice } = lock ?? {}
  if (lock.keyPrice === '0') {
    return 'FREE'
  }
  const price = keyPrice ? parseFloat(keyPrice) * numberOfRecipients : null
  return `${price?.toString().substring(0, 9)} ${lockTickerSymbol(
    lock,
    baseCurrencySymbol
  )}`
}

/**
 * Basic helper to skip the claim list
 * @param address
 * @returns
 */
export const inClaimDisallowList = (address: string) => {
  const claimDisallowList: Array<string> = [
    '0xb7958434e812C9D1a76560d43b2CfAAfe093eC08', // En Direckto
    '0x926FBA2B47916Fcf58d165d44D6d9714d31Ee397', // Stable Show
    '0x89e975EA43E0Cfe338205e016BFFaeFeFdbc3511', // BCN Auction
    '0xBB19b9E39cB06402bf17886708506dba0B8Eb2f2', // Defi Arena
  ]
  return claimDisallowList.indexOf(address) > -1
}

/**
 * Generates a private key from a secret and signs the purchaser address with it
 * This shall be used in conjunction with a purchase hook that would fail purchase transactions
 * when the transaction does not include a valid signature
 * @param secret
 * @param recipient
 * @returns
 */
export const generateDataForPurchaseHook = async (
  secret?: string,
  recipient?: string
) => {
  if (!secret || !recipient) {
    return null
  }
  const wallet = new ethers.Wallet(ethers.utils.id(secret))
  const messageHash = ethers.utils.solidityKeccak256(
    ['string'],
    [recipient.toLowerCase()]
  )
  return wallet.signMessage(ethers.utils.arrayify(messageHash))
}
