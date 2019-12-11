import { BlockchainWriter, Events } from '../../data-iframe/BlockchainWriter'
import { getWalletService } from '../test-helpers/setupBlockchainHelpers'

describe('BlockchainWriter', () => {
  let writer: BlockchainWriter
  beforeEach(() => {
    const walletService = getWalletService({})
    writer = new BlockchainWriter(walletService)
  })

  describe('newAccount', () => {
    it('emits an event with the new account address', done => {
      expect.assertions(1)

      writer.on(Events.newAccount, accountAddress => {
        expect(accountAddress).toEqual(
          '0xaFAEfc6dd3C9feF66f92BA838b132644451F0715'
        )
        done()
      })
      writer.newAccount('0xaFAEfc6dd3C9feF66f92BA838b132644451F0715')
    })
  })

  describe('setNetwork', () => {
    it('sets the network id to the new network id', done => {
      expect.assertions(1)
      writer.on(Events.newNetwork, networkId => {
        expect(networkId).toEqual(4)
        done()
      })

      writer.newNetwork(4)
    })
  })

  describe('newTransaction', () => {
    it('emits a formatted transaction', done => {
      expect.assertions(1)
      writer.on(Events.newTransaction, tx => {
        expect(tx).toEqual({
          blockNumber: 9007199254740991,
          for: '0xafaefc6dd3c9fef66f92ba838b132644451f0715',
          from: '0xafaefc6dd3c9fef66f92ba838b132644451f0715',
          hash: 'aHash',
          input: '',
          status: 'pending',
          to: '0x84bcb1dff32ee9e7bc7c6868954c3e6f346046b4',
          type: 'KEY_PURCHASE',
        })
        done()
      })

      writer.newTransaction(
        'aHash',
        '0xaFAEfc6dd3C9feF66f92BA838b132644451F0715',
        '0x84BCb1DFF32Ee9e7Bc7c6868954C3E6F346046b4',
        '',
        'KEY_PURCHASE',
        'pending'
      )
    })
  })

  describe('handleError', () => {
    it('emits the error for a key purchase failure', done => {
      expect.assertions(1)
      writer.on(Events.error, (e: Error) => {
        expect(e.message).toEqual('purchase failed')
        done()
      })

      writer.handleError(new Error('FAILED_TO_PURCHASE_KEY'))
    })

    it('does not emit for any other error', () => {
      expect.assertions(1)
      writer.emit = jest.fn()
      writer.handleError(new Error('KILLER_BEES_RELEASED'))
      expect(writer.emit).not.toHaveBeenCalled()
    })
  })
})
