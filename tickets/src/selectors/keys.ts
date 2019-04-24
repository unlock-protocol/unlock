import { Transaction, TransactionStatus } from '../unlockTypes'

interface Key {
  expiration: number
  transactions?: {
    [key: string]: Transaction
  }
}

export enum KeyStatus {
  NONE = 'none',
  CONFIRMING = 'confirming',
  CONFIRMED = 'confirmed',
  EXPIRED = 'expired',
  VALID = 'valid',
}

export default function keyStatus(
  id: string,
  keys: { [key: string]: Key },
  requiredConfirmations: number
): KeyStatus | TransactionStatus {
  const key = keys[id]

  if (!key) {
    return KeyStatus.NONE
  }
  if (!key.transactions) {
    if (key.expiration > new Date().getTime() / 1000) {
      return KeyStatus.VALID
    }
    return KeyStatus.NONE
  }
  const transactions = Object.values(key.transactions)
  transactions.sort((a, b) => (a.blockNumber > b.blockNumber ? -1 : 1))
  const lastTransaction = transactions[0]

  switch (lastTransaction.status) {
    case 'mined':
      if (lastTransaction.confirmations < requiredConfirmations) {
        return KeyStatus.CONFIRMING
      }
      if (key.expiration < new Date().getTime() / 1000 && key.expiration > 0) {
        return KeyStatus.EXPIRED
      }
      return KeyStatus.VALID
    default:
      return lastTransaction.status || KeyStatus.NONE
  }
}
