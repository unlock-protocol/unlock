import { TransactionType } from '../unlockTypes'

/**
 * Mapping function to change the types received from unlock-js into types
 * used by unlock-app
 * TODO: use the actual types exported by unlock-js rather than a list of strings!
 */
export const transactionTypeMapping = (type: string) => {
  if (type === 'LOCK_CREATION') {
    return TransactionType.LOCK_CREATION
  }
  if (type === 'KEY_PURCHASE') {
    return TransactionType.KEY_PURCHASE
  }
  if (type === 'WITHDRAWAL') {
    return TransactionType.WITHDRAWAL
  }
  if (type === 'UPDATE_KEY_PRICE') {
    return TransactionType.UPDATE_KEY_PRICE
  }
  // Not sure but that should not happen
}

export default {
  transactionTypeMapping,
}
