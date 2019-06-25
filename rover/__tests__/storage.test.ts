import { Storage } from '../src/storage'

describe('Storage', () => {
  let connectionManager
  let storage
  beforeAll(() => {
    connectionManager = {
      save: jest.fn(),
    }
    storage = new Storage(connectionManager)
  })

  describe('storeBlock', () => {
    it('persists the passed block', () => {
      storage.storeBlock({ miner: 'minerid' })
      expect(connectionManager.save).toHaveBeenCalledWith({
        difficulty: undefined,
        extraData: undefined,
        gasLimit: 'undefined',
        gasUsed: 'undefined',
        hash: undefined,
        miner: 'minerid',
        nonce: undefined,
        number: undefined,
        parentHash: undefined,
        timestamp: undefined,
      })
    })
  })

  describe('storeTransaction', () => {
    it('perists the passed transaction', () => {
      storage.storeTransaction({ r: 37 })
      expect(connectionManager.save).toHaveBeenCalledWith({
        blockHash: undefined,
        blockNumber: undefined,
        confirmations: undefined,
        creates: undefined,
        data: undefined,
        from: undefined,
        gasLimit: undefined,
        gasPrice: undefined,
        hash: undefined,
        networkId: undefined,
        nonce: undefined,
        r: 37,
        raw: undefined,
        s: undefined,
        to: undefined,
        transactionIndex: undefined,
        v: undefined,
        value: undefined,
      })
    })
  })

  describe('storeRegistree', () => {
    it('persists the passed registree', () => {
      storage.storeRegistree({address: '0x4ceF00d'})
      expect(connectionManager.save).toHaveBeenCalledWith({
        address: '0x4ceF00d',
      })
    })
  })
})
