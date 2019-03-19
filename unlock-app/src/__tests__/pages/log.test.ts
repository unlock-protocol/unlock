import { mapStateToProps, humanize } from '../../pages/log'
import * as UnlockTypes from '../../unlock'

const TransactionType = UnlockTypes.TransactionType

const transactions: UnlockTypes.Transactions = {
  '0x12345678': {
    hash: '0x12345678',
    confirmations: 12,
    status: 'mined',
    lock: '0x12345678a',
    blockNumber: 1,
    type: TransactionType.LOCK_CREATION,
    name: 'my first lock',
  },
  '0x56781234': {
    hash: '0x56781234',
    confirmations: 4,
    status: 'mined',
    lock: '0x56781234a',
    blockNumber: 2,
    type: TransactionType.LOCK_CREATION,
    name: 'my second lock',
  },
  '0x9abcdef0': {
    hash: '0x9abcdef0',
    confirmations: 2,
    status: 'mined',
    lock: '0x9abcdef0a',
    blockNumber: 3,
    type: TransactionType.LOCK_CREATION,
    name: 'Lock Robster',
  },
}

describe('Transaction Log', () => {
  describe('humanize - make transaction types more readable', () => {
    it('should correctly handle transaction types of various lengths', () => {
      expect.assertions(3)
      expect(humanize(TransactionType.LOCK_CREATION)).toEqual('Lock Creation')
      expect(humanize(TransactionType.WITHDRAWAL)).toEqual('Withdrawal')
      expect(humanize(TransactionType.UPDATE_KEY_PRICE)).toEqual(
        'Update Key Price'
      )
    })
  })

  describe('mapStateToProps', () => {
    const state = {
      account: {
        address: '0x123',
        balance: '0.9744',
      },
      network: {
        name: 1984,
      },
      transactions,
    }
    const config = {
      chainExplorerUrlBuilders: {
        etherScan: (address: string) => `This is a test ${address}`,
      },
    }
    const { transactionFeed, transactionMetadata } = mapStateToProps(state, { config })
    it('Should provide a feed of transactions sorted by blockNumber, descending', () => {
      expect.assertions(4)
      expect(transactionFeed).toHaveLength(3)
      expect(transactionFeed[0].blockNumber).toEqual(3)
      expect(transactionFeed[1].blockNumber).toEqual(2)
      expect(transactionFeed[2].blockNumber).toEqual(1)
    })
    it('Should provide a feed of metadata about the transactions', () => {
      expect.assertions(3)
      expect(Object.keys(transactionMetadata)).toHaveLength(3)
      const md = transactionMetadata['0x9abcdef0']
      expect(md.readableName).toBe('Lock Creation')
      expect(md.href).toBe('This is a test 0x9abcdef0a')
    })
  })
})
