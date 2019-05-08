import isURL from 'validator/lib/isURL'

import { ACCOUNT_REGEXP } from '../constants'

// tests whether a field's value was not entered by the user
export const isNotEmpty = val => val || val === 0

// tests whether a number is non-negative and not a decimal number
export const isPositiveInteger = val => {
  const parsedInt = parseInt(val)
  return !isNaN(parsedInt) && val == parsedInt && +val >= 0
}

// tests whether a number is a non-negative real number (decimals allowed)
export const isPositiveNumber = val => {
  const parsedFloat = parseFloat(val)
  return !isNaN(parsedFloat) && +parsedFloat >= 0
}

export const isAccount = val => {
  return val.match(ACCOUNT_REGEXP)
}

// TODO: use npm package "validator" to validate the icon URL
// https://www.npmjs.com/package/validator
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
 *   },
 * }
 *
 * The fields in callToAction are all optional, and icon can be false for none
 */
export const isValidPaywallConfig = config => {
  if (!config) return false
  if (typeof config !== 'object') return false
  const keys = Object.keys(config)
  if (keys.length !== 3) return false
  keys.sort()
  const testKeys = ['callToAction', 'icon', 'locks']
  if (keys.filter((key, index) => testKeys[index] !== key).length) return false
  // allow false for icon
  if (config.icon) {
    if (typeof config.icon !== 'string') return false
    if (
      config.icon &&
      !isURL(config.icon, {
        allow_underscores: true,
        allow_protocol_relative_urls: true,
        disallow_auth: true,
      })
    ) {
      return false
    }
  }
  if (!config.callToAction || typeof config.callToAction !== 'object')
    return false
  const callsToAction = ['default', 'expired', 'pending', 'confirmed']
  const ctaKeys = Object.keys(config.callToAction)
  if (ctaKeys.length > callsToAction.length) return false
  if (ctaKeys.filter(key => !callsToAction.includes(key)).length) return false
  if (
    ctaKeys.filter(key => typeof config.callToAction[key] !== 'string').length
  ) {
    return false
  }
  if (!config.locks) return false
  if (typeof config.locks !== 'object') return false
  const locks = Object.keys(config.locks)
  if (!locks.length) return false
  if (
    locks.filter(lock => {
      if (!isAccount(lock)) return false
      const thisLock = config.locks[lock]
      if (!thisLock || typeof thisLock !== 'object') return false
      if (Object.keys(thisLock).length !== 1) return false
      if (!thisLock.name || typeof thisLock.name !== 'string') return false
      return true
    }).length !== locks.length
  ) {
    return false
  }
  return true
}
