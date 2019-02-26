import { mapStateToProps, humanize } from '../../pages/log'
import { TRANSACTION_TYPES } from '../../constants'
import configure from '../../config'

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
  '0x31337': {
    hash: '0x73313',
    confirmations: 5,
    status: 'mined',
    type: TRANSACTION_TYPES.KEY_PURCHASE,
    key: '0x12345678a-0xfeeded',
    blockNumber: 5,
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
    const config = configure()
    const { transactionFeed, metadata } = mapStateToProps(state, { config })
    it('Should provide a feed of transactions sorted by blockNumber, descending', () => {
      expect.assertions(5)
      expect(transactionFeed).toHaveLength(4)
      expect(transactionFeed[0].blockNumber).toEqual(5)
      expect(transactionFeed[1].blockNumber).toEqual(3)
      expect(transactionFeed[2].blockNumber).toEqual(2)
      expect(transactionFeed[3].blockNumber).toEqual(1)
    })
    it('should include href to explorer, lock address, and readable name in the metadata', () => {
      expect.assertions(3)
      const md = metadata['0x9abcdef0']
      expect(md).toHaveProperty('href')
      expect(md).toHaveProperty('readableName')
      expect(md).toHaveProperty('lock')
    })
    it('should grab the lock address for the key creation transaction', () => {
      expect.assertions(1)
      const md = metadata['0x73313']
      expect(md.lock).toEqual('0x12345678a')
    })
  })
})
