import { mapStateToProps } from '../../../components/content/LogContent'
import * as UnlockTypes from '../../../unlock'

const transactions = {
  '0x12345678': {
    hash: '0x12345678',
    confirmations: 12,
    status: 'mined',
    lock: '0x12345678a',
    blockNumber: 1,
    type: UnlockTypes.TransactionType.LOCK_CREATION,
    name: 'Lock of Seagulls',
  },
  '0x56781234': {
    hash: '0x56781234',
    confirmations: 4,
    status: 'mined',
    lock: '0x56781234a',
    blockNumber: 2,
    type: UnlockTypes.TransactionType.LOCK_CREATION,
    name: 'Lock the Casbah',
  },
  '0x9abcdef0': {
    hash: '0x9abcdef0',
    confirmations: 2,
    status: 'mined',
    lock: '0x9abcdef0a',
    blockNumber: 3,
    type: UnlockTypes.TransactionType.LOCK_CREATION,
    name: 'Lock Robster',
  },
}

describe('Transaction Log', () => {
  describe('mapStateToProps', () => {
    const state = {
      account: {
        address: '0x123456',
        balance: '5',
      },
      network: {
        name: 1984,
      },
      transactions,
    }
    const config = {
      chainExplorerUrlBuilders: {
        etherScan: (address: string) => `https://blockchain.party/address/${address}/`
      },
    }
    const { transactionFeed, explorerLinks } = mapStateToProps(state, { config })
    it('Should provide a feed of transactions sorted by blockNumber, descending', () => {
      expect.assertions(4)
      expect(transactionFeed).toHaveLength(3)
      expect(transactionFeed[0].blockNumber).toEqual(3)
      expect(transactionFeed[1].blockNumber).toEqual(2)
      expect(transactionFeed[2].blockNumber).toEqual(1)
    })
    it('should include a separate feed of URLs to chain explorer for each transaction', () => {
      expect.assertions(2)
      expect(Object.keys(explorerLinks)).toHaveLength(3)
      expect(explorerLinks['0x9abcdef0']).toBe('https://blockchain.party/address/0x9abcdef0a/')
    })
  })
})
