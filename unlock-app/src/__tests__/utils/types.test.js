import { transactionTypeMapping } from '../../utils/types'
import { TransactionType } from '../../unlockTypes'

describe('transactionTypeMapping', () => {
  it('should map the types from unlock-js', () => {
    expect.assertions(4)
    expect(transactionTypeMapping('LOCK_CREATION')).toEqual(
      TransactionType.LOCK_CREATION
    )
    expect(transactionTypeMapping('KEY_PURCHASE')).toEqual(
      TransactionType.KEY_PURCHASE
    )
    expect(transactionTypeMapping('WITHDRAWAL')).toEqual(
      TransactionType.WITHDRAWAL
    )
    expect(transactionTypeMapping('UPDATE_KEY_PRICE')).toEqual(
      TransactionType.UPDATE_KEY_PRICE
    )
  })
})
