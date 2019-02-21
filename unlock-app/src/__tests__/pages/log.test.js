import { mapStateToProps, humanize } from '../../pages/log'
import { TRANSACTION_TYPES } from '../../constants'

const transactions = {
  '0x1234': {
    hash: '0x12345678',
    confirmations: 12,
    status: 'mined',
    lock: '0x12345678a',
    blockNumber: 1,
    type: TRANSACTION_TYPES.LOCK_CREATION,
  },
  '0x5678': {
    hash: '0x56781234',
    confirmations: 4,
    status: 'mined',
    lock: '0x56781234a',
    blockNumber: 2,
    type: TRANSACTION_TYPES.LOCK_CREATION,
  },
  '0x89ab': {
    hash: '0x9abcdef0',
    confirmations: 2,
    status: 'mined',
    lock: '0x9abcdef0a',
    blockNumber: 3,
    type: TRANSACTION_TYPES.LOCK_CREATION,
  },
}

describe('Transaction Log', () => {
  describe('humanize - make transaction types more readable', () => {
    it('should correctly handle transaction types of various lengths', () => {
      expect.assertions(3)
      expect(humanize(TRANSACTION_TYPES.LOCK_CREATION)).toEqual('Lock Creation')
      expect(humanize(TRANSACTION_TYPES.WITHDRAWAL)).toEqual('Withdrawal')
      expect(humanize(TRANSACTION_TYPES.UPDATE_KEY_PRICE)).toEqual(
        'Update Key Price'
      )
    })
  })

  describe('mapStateToProps', () => {
    const state = {
      account: {},
      network: {},
      transactions,
    }
    it('Should provide a feed of transactions sorted by blockNumber, descending', () => {
      expect.assertions(4)
      const { transactionFeed } = mapStateToProps(state)
      expect(transactionFeed).toHaveLength(3)
      expect(transactionFeed[0].blockNumber).toEqual(3)
      expect(transactionFeed[1].blockNumber).toEqual(2)
      expect(transactionFeed[2].blockNumber).toEqual(1)
    })
    it('should include href to explorer and readable name in the feed', () => {
      expect.assertions(2)
      const { transactionFeed } = mapStateToProps(state)
      const tx = transactionFeed[0]
      expect(tx).toHaveProperty('href')
      expect(tx).toHaveProperty('readableName')
    })
  })
})
