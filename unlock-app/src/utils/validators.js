import isDecimal from 'validator/lib/isDecimal'
import { ACCOUNT_REGEXP } from '../constants'

// tests whether a field's value was not entered by the user
export const isNotEmpty = (val) => val || val === 0

// tests whether a number is positive and not a decimal number
export const isPositiveInteger = (val) => {
  const parsedInt = parseInt(val)
  return !isNaN(parsedInt) && val == parsedInt && +val > 0
}
// tests whether a number is positive and not a decimal number
export const isPositiveIntegerOrZero = (val) => {
  const parsedInt = parseInt(val)
  return !isNaN(parsedInt) && val == parsedInt && +val >= 0
}

export const isLTE = (limit) => {
  return (val) => {
    const parsedInt = parseInt(val)
    return parsedInt <= limit
  }
}

// tests whether a number is a non-negative real number (decimals allowed)
export const isPositiveNumber = (val) => {
  const parsedFloat = parseFloat(val)
  return !isNaN(parsedFloat) && +parsedFloat >= 0
}

export const isAccount = (val) => {
  return val && typeof val === 'string' && val.match(ACCOUNT_REGEXP)
}

export const isAccountOrNull = (val) => {
  return val === null || isAccount(val)
}

/**
 * helper function to assert on a thing being an
 * object with required and optional keys
 *
 * No assertion on the types of the values is done here
 */
function isValidObject(obj, validKeys) {
  if (!obj || typeof obj !== 'object') return false
  const keys = Object.keys(obj)

  if (keys.length < validKeys.length) return false
  if (validKeys.filter((key) => !keys.includes(key)).length) return false
  return true
}

function isValidKeyStatus(status) {
  if (typeof status !== 'string') return false
  return [
    'none',
    'confirming',
    'confirmed',
    'expired',
    'valid',
    'submitted',
    'pending',
    'failed',
  ].includes(status)
}

/**
 * validate a single key. This should match the type in unlockTypes.ts
 */
export const isValidKey = (key) => {
  if (
    !isValidObject(key, [
      'expiration',
      'transactions',
      'status',
      'confirmations',
      'owner',
      'lock',
    ])
  ) {
    return false
  }

  if (
    typeof key.expiration !== 'number' ||
    !isPositiveIntegerOrZero(key.expiration)
  ) {
    return false
  }
  if (!Array.isArray(key.transactions)) return false

  if (!isValidKeyStatus(key.status)) return false
  if (
    typeof key.confirmations !== 'number' ||
    !isPositiveIntegerOrZero(key.confirmations)
  ) {
    return false
  }
  if (!isAccount(key.owner)) return false
  if (!isAccount(key.lock)) return false
  // NOTE: transactions are not used in the UI, and may be removed, so
  // for now we do not validate them. If this ever changes, they must
  // be validated
  /*
  if (
    key.transactions.filter(transaction => !isValidTransaction(transaction))
      .length
  ) {
    return false
  }
  */
  return true
}

/**
 * validate a single lock. This should match the type in unlockTypes.ts
 */
export const isValidLock = (lock) => {
  if (
    !isValidObject(lock, ['address', 'keyPrice', 'expirationDuration', 'key'])
  ) {
    return false
  }

  if (lock.name && typeof lock.name !== 'string') return false
  if (
    lock.currencyContractAddress &&
    !isAccountOrNull(lock.currencyContractAddress)
  ) {
    return false
  }
  if (!isAccount(lock.address)) return false
  if (typeof lock.keyPrice !== 'string' || !isDecimal(lock.keyPrice)) {
    return false
  }
  if (
    typeof lock.expirationDuration !== 'number' ||
    !isPositiveIntegerOrZero(lock.expirationDuration)
  ) {
    return false
  }
  if (!isValidKey(lock.key)) return false
  return true
}

/**
 * validate the list of locks returned from the data iframe
 */
export const isValidLocks = (locks) => {
  if (!locks || typeof locks !== 'object' || Array.isArray(locks)) return false
  const keys = Object.keys(locks)
  if (keys.filter((key) => !isAccount(key)).length) return false
  const lockValues = Object.values(locks)
  if (lockValues.filter((lock) => !isValidLock(lock)).length) return false
  return true
}
