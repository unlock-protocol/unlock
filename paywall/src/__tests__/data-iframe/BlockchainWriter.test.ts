import { BlockchainWriter } from '../../data-iframe/BlockchainWriter'
import { getWalletService } from '../test-helpers/setupBlockchainHelpers'

const mock = () => {
  const walletService = getWalletService({})
  const setAccount = jest.fn()
  const setNetwork = jest.fn()
  const addTransaction = jest.fn()
  const alertError = jest.fn()
  const writer = new BlockchainWriter(
    walletService,
    setAccount,
    setNetwork,
    addTransaction,
    alertError
  )

  return {
    walletService,
    setAccount,
    setNetwork,
    addTransaction,
    alertError,
    writer,
  }
}

describe('BlockchainWriter', () => {
  describe('setAccount', () => {
    it('emits an event with the new account address', () => {
      expect.assertions(1)
      const { walletService, setAccount } = mock()
      walletService.emit(
        'account.changed',
        '0xaFAEfc6dd3C9feF66f92BA838b132644451F0715'
      )
      expect(setAccount).toHaveBeenCalledWith(
        '0xaFAEfc6dd3C9feF66f92BA838b132644451F0715'
      )
    })
  })

  describe('setNetwork', () => {
    it('sets the network id to the new network id', () => {
      expect.assertions(1)
      const { walletService, setNetwork } = mock()
      walletService.emit('network.changed', 4)
      expect(setNetwork).toHaveBeenCalledWith(4)
    })
  })

  describe('addTransaction', () => {
    it('emits a formatted transaction', () => {
      expect.assertions(1)
      const { walletService, addTransaction } = mock()

      walletService.emit(
        'transaction.new',
        'aHash',
        '0xaFAEfc6dd3C9feF66f92BA838b132644451F0715',
        '0x84BCb1DFF32Ee9e7Bc7c6868954C3E6F346046b4',
        '',
        'KEY_PURCHASE',
        'pending'
      )

      expect(addTransaction).toHaveBeenCalledWith({
        blockNumber: 9007199254740991,
        for: '0xafaefc6dd3c9fef66f92ba838b132644451f0715',
        from: '0xafaefc6dd3c9fef66f92ba838b132644451f0715',
        hash: 'aHash',
        input: '',
        status: 'pending',
        to: '0x84bcb1dff32ee9e7bc7c6868954c3e6f346046b4',
        type: 'KEY_PURCHASE',
      })
    })
  })

  describe('alertError', () => {
    it('emits the error for a key purchase failure', () => {
      expect.assertions(1)
      const { walletService, alertError } = mock()

      walletService.emit('error', new Error('FAILED_TO_PURCHASE_KEY'))
      expect(alertError).toHaveBeenCalledWith(new Error('purchase failed'))
    })

    it('does not emit for any other error', () => {
      expect.assertions(1)
      const { walletService, alertError } = mock()

      walletService.emit('error', new Error('KILLER_BEES_RELEASED'))
      expect(alertError).not.toHaveBeenCalled()
    })
  })
})
