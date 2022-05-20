import isURL from 'validator/lib/isURL'
import isDataURI from 'validator/lib/isDataURI'
import isDecimal from 'validator/lib/isDecimal'
import configure from '../config'
import { ACCOUNT_REGEXP } from '../constants'

const { env } = configure()

export const log = (message) => {
  if (env !== 'test') {
    // eslint-disable-next-line no-console
    console.log(message)
  }
}

// tests whether a field's value was not entered by the user
export const isNotEmpty = (val) => val || val === 0

// tests whether a number is non-negative and not a decimal number
export const isPositiveInteger = (val) => {
  const parsedInt = parseInt(val)
  return !isNaN(parsedInt) && val == parsedInt && +val >= 0
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

export const isValidIcon = (icon) => {
  if (typeof icon !== 'string') {
    log('The paywall config\'s "icon" property is not a string.')
    return false
  }
  if (
    icon &&
    !isURL(icon, {
      allow_underscores: true,
      allow_protocol_relative_urls: true,
      disallow_auth: true,
    }) &&
    !isDataURI(icon)
  ) {
    log('The paywall config\'s "icon" property is not a valid URL.')
    // Icon failure is not a huge deal.
    return true
  }
  return true
}

export const isValidCTA = (callToAction) => {
  const callsToAction = [
    'default',
    'expired',
    'pending',
    'confirmed',
    'noWallet',
    'metadata',
  ]

  const ctaKeys = Object.keys(callToAction)

  if (ctaKeys.length > callsToAction.length) {
    log(
      'The paywall config\'s "callToAction" properties contain an unexpected entry.'
    )
    return false
  }
  if (ctaKeys.filter((key) => !callsToAction.includes(key)).length) {
    // TODO: log which key is bad, or remove this check
    log(
      'The paywall config\'s "callToAction" properties contain an unexpected entry.'
    )
    return false
  }
  if (ctaKeys.filter((key) => typeof callToAction[key] !== 'string').length) {
    log(
      'The paywall config\'s "callToAction" properties contain an entry whose value is not a string.'
    )
    return false
  }

  return true
}

export const isValidConfigLock = (lock, configLocks) => {
  if (!isAccount(lock)) {
    log(
      `The paywall config's "locks" field contains a key "${lock}" which has an invalid address.`
    )
    return false
  }
  const thisLock = configLocks[lock]
  if (!thisLock || typeof thisLock !== 'object') {
    log(
      `The paywall config's "locks" field contains a key "${lock}" which is not an object.`
    )
    return false
  }
  if (
    typeof thisLock.network !== 'undefined' &&
    typeof thisLock.network !== 'number'
  ) {
    log(
      `The paywall config's "locks" field contains a key "${lock}" which has an invalid network (it needs to be a number).`
    )
  }
  if (
    typeof thisLock.name !== 'undefined' &&
    typeof thisLock.name !== 'string'
  ) {
    log(
      `The paywall config's "locks" field contains a key "${lock}" which has an invalid name.`
    )
    return false
  }
  return true
}

export const isValidConfigLocks = (configLocks) => {
  if (typeof configLocks !== 'object') {
    log('The paywall configs\'s "locks" field is not an object.')
    return false
  }
  const locks = Object.keys(configLocks)
  if (!locks.length) {
    log('The paywall configs\'s "locks" is missing locks.')
    return false
  }
  if (
    locks.filter((lock) => isValidConfigLock(lock, configLocks)).length !==
    locks.length
  ) {
    log('The paywall configs\'s "locks" field is not valid.')
    // The logging of lock failures in `isValidConfigLock` should make
    // it clear which lock caused this to fail.
    return false
  }

  return true
}

/**
 * For now, this assumes this structure:
 *
 * var unlockProtocolConfig = {
 *   locks: {
 *     '0xabc...': {
 *   	   name: 'One Week',
 *      },
 *      '0xdef...': {
 *        name: 'One Month',
 *      },
 *      '0xghi...': {
 *        name: 'One Year',
 *      },
 *    },
 *    icon: 'https://...',
 *    callToAction: {
 *	    default:
 *        'Enjoy Forbes Online without any ads for as little as $2 a week. Pay with Ethereum in just two clicks.',
 *      expired:
 *        'your key has expired, please purchase a new one',
 *      pending: 'Purchase pending...',
 *      confirmed: 'Your content is unlocked!',
 *      noWallet: 'Please, get a wallet!',
 *      metadata: 'Fill this form!',
 *   },
 * }
 *
 * The fields in callToAction are all optional, and icon can be false for none
 */
export const isValidPaywallConfig = (config) => {
  if (!config) {
    log('No paywall config provided.')
    return false
  }
  if (!isValidObject(config, ['locks'])) {
    log(
      'The paywall config does not contain at least one of the required fields: "locks".'
    )
    return false
  }

  // Icon may not be specified
  if (config.icon) {
    if (!isValidIcon(config.icon)) {
      log('The paywall config\'s "icon" is not valid.')
      return false
    }
  }

  if (
    config.callToAction !== undefined &&
    (typeof config.callToAction !== 'object' ||
      !isValidCTA(config.callToAction))
  ) {
    log('The paywall config\'s "callToAction" is not valid.')
    return false
  }

  // TODO: !locks should have been checked already in the isValidObject check above?
  if (!config.locks) {
    log('The paywall config\'s "locks" fields is not set.')
    return false
  }
  if (!isValidConfigLocks(config.locks)) {
    return false
  }

  // persistentCheckout can be undefined (not set), a boolean, or "true" or "false".
  if (
    typeof config.persistentCheckout !== 'undefined' &&
    typeof config.persistentCheckout !== 'boolean' &&
    ['true', 'false'].indexOf(config.persistentCheckout) === -1
  ) {
    log(
      'The paywall config\'s "persistentCheckout" field has an invalid value.'
    )
    return false
  }

  if (config.metadataInputs) {
    if (!isValidMetadataArray(config.metadataInputs)) {
      return false
    }
  }

  return true
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
  if (
    ![
      'none',
      'confirming',
      'confirmed',
      'expired',
      'valid',
      'submitted',
      'pending',
      'failed',
      'stale',
    ].includes(status)
  ) {
    return false
  }
  return true
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
    !isPositiveInteger(key.expiration)
  ) {
    return false
  }
  if (!Array.isArray(key.transactions)) return false
  if (!isValidKeyStatus(key.status)) return false
  if (
    typeof key.confirmations !== 'number' ||
    !isPositiveInteger(key.confirmations)
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
    !isPositiveInteger(lock.expirationDuration)
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

/**
 * validate the list of keys returned from the data iframe
 * TODO: consider if validation is actually required
 */
export const isValidKeys = () => {
  return true
}

/**
 * validate the list of transactions returned from the data iframe
 * TODO: consider if validation is actually required
 */
export const isValidTransactions = () => {
  return true
}

/**
 * validate a balance as an object of currency: balance
 */
export const isValidBalance = (balance) => {
  if (!balance || typeof balance !== 'object' || Array.isArray(balance)) {
    return false
  }
  return Object.keys(balance).reduce((accumulator, currency) => {
    return (
      accumulator &&
      isPositiveNumber(balance[currency]) &&
      typeof balance[currency] === 'string'
    )
  }, true)
}

const allowedInputTypes = ['text', 'date', 'color', 'email', 'url']

/**
 * A valid metadata field looks like:
 * {
 *   name: 'field name', // any string
 *   type: 'date', // any valid html input type
 *   required: false, // a boolean
 * }
 */
export const isValidMetadataField = (field) => {
  const requiredKeys = ['name', 'type', 'required']
  const hasRequiredProperties = isValidObject(field, requiredKeys)

  if (!hasRequiredProperties) {
    // TODO: more specificity in error messages
    log(
      'A field in the metadata fields in the paywall config is missing a required property.'
    )
    return false
  }

  const { name, type, required } = field

  if (typeof name !== 'string') {
    log(`Paywall metadata field error: ${name} is not a string.`)
    return false
  }

  if (!allowedInputTypes.includes(type)) {
    log(`Paywall metadata field error: ${type} is not an allowed input type.`)
    return false
  }

  if (typeof required !== 'boolean') {
    log(`Paywall metadata field error: ${required} is not a boolean.`)
    return false
  }

  return true
}

export const isValidMetadataArray = (fields) => {
  if (!Array.isArray(fields)) {
    log('Paywall config metadata property is not an array.')
    return false
  }

  // TODO: disallow multiple fields with the same name?
  const validFields = fields.filter(isValidMetadataField)
  if (validFields.length !== fields.length) {
    log('Paywall config metadata contains an invalid field description.')
    return false
  }

  return true
}
