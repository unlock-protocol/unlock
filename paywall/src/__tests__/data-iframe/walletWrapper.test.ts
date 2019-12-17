import { walletWrapper } from '../../data-iframe/walletWrapper'
import { getWalletService } from '../test-helpers/setupBlockchainHelpers'
import { WalletServiceType } from '../../data-iframe/blockchainHandler/blockChainTypes'

let mockWalletService: WalletServiceType

jest.mock('@unlock-protocol/unlock-js', () => ({
  WalletService: function() {
    mockWalletService = getWalletService({})
    mockWalletService.provider = 'unlock'
    return mockWalletService
  },
}))

describe('walletWrapper', () => {
  let emitter = jest.fn()
  beforeEach(() => {
    emitter = jest.fn()
    walletWrapper('the unlock address', emitter)
  })

  it('should try to retrieve account from walletService', () => {
    expect.assertions(1)

    expect(mockWalletService.getAccount).toHaveBeenCalled()
  })

  it('should pass through `account.changed` events', () => {
    expect.assertions(1)

    const message = 'account.changed'
    const value = '0xmyaccount'

    mockWalletService.emit(message, value)
    expect(emitter).toHaveBeenCalledWith(message, value)
  })

  it('should pass through `network.changed` events', () => {
    expect.assertions(1)

    const message = 'network.changed'
    const value = 7

    mockWalletService.emit(message, value)
    expect(emitter).toHaveBeenCalledWith(message, value)
  })

  it('should emit a formatted transaction on `transaction.new` events', () => {
    expect.assertions(1)

    mockWalletService.emit(
      'transaction.new',
      'aHash',
      '0xaFAEfc6dd3C9feF66f92BA838b132644451F0715',
      '0x84BCb1DFF32Ee9e7Bc7c6868954C3E6F346046b4',
      '',
      'KEY_PURCHASE',
      'pending'
    )

    expect(emitter).toHaveBeenCalledWith('transaction.new', {
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
