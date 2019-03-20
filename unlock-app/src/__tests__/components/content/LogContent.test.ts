import {
  mapStateToProps,
  readable,
} from '../../../components/content/LogContent'
import * as UnlockTypes from '../../../unlock'

const { LOCK_CREATION, WITHDRAWAL, UPDATE_KEY_PRICE } = UnlockTypes.TransactionType
const transactions: UnlockTypes.Transactions = {
  '0x12345678': {
    hash: '0x12345678',
    confirmations: 12,
    status: 'mined',
    lock: '0x12345678a',
    blockNumber: 1,
    type: LOCK_CREATION,
    name: 'Lock of Seagulls',
  },
  '0x56781234': {
    hash: '0x56781234',
    confirmations: 4,
    status: 'mined',
    lock: '0x56781234a',
    blockNumber: 2,
    type: LOCK_CREATION,
    name: 'Lock The Cashbah',
  },
  '0x9abcdef0': {
    hash: '0x9abcdef0',
    confirmations: 2,
    status: 'mined',
    lock: '0x9abcdef0a',
    blockNumber: 3,
    type: LOCK_CREATION,
    name: 'Lock Robster',
  },
}

describe('Transaction Log', () => {
  describe('readable - make transaction types more readable', () => {
    it('should correctly handle transaction types of various lengths', () => {
      expect.assertions(3)
      expect(readable(LOCK_CREATION)).toEqual('Lock Creation')
      expect(readable(WITHDRAWAL)).toEqual('Withdrawal')
      expect(readable(UPDATE_KEY_PRICE)).toEqual(
        'Update Key Price'
      )
    })
  })

  describe('mapStateToProps', () => {
    const state = {
      account: {
        address: '0x123',
        balance: '0.571',
      },
      network: {
        name: 1984,
      },
      transactions,
    }
    const config = {
      chainExplorerUrlBuilders: {
        etherScan: (address: string) => `https://explore.chainlink.io/${address}/`,
      },
    }
    const { transactionFeed, transactionMetadataMap } = mapStateToProps(state, { config })
    it('Should provide a feed of transactions sorted by blockNumber, descending', () => {
      expect.assertions(4)
      expect(transactionFeed).toHaveLength(3)
      expect(transactionFeed[0].blockNumber).toEqual(3)
      expect(transactionFeed[1].blockNumber).toEqual(2)
      expect(transactionFeed[2].blockNumber).toEqual(1)
    })
    it('Should provide a map of metadata collected by transaction hash', () => {
      expect.assertions(2)
      const md = transactionMetadataMap['0x12345678']
      expect(md.readableName).toBe('Lock Creation')
      expect(md.href).toBe('https://explore.chainlink.io/0x12345678a/')
    })
  })
})
