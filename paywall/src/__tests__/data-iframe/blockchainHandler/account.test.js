import pollForChanges from '../../../data-iframe/blockchainHandler/pollForChanges'
import {
  pollForAccountChange,
  getAccount,
  getAccountBalance,
} from '../../../data-iframe/blockchainHandler/account'
import { POLLING_INTERVAL } from '../../../constants'

let mockPoll
jest.mock('../../../data-iframe/blockchainHandler/pollForChanges', () => {
  mockPoll = jest.fn()
  return mockPoll
})
describe('blockchainHandler account handling', () => {
  describe('pollForAccountChange', () => {
    let fakeWalletService
    let fakeWeb3Service
    let onAccountChange

    beforeEach(() => {
      pollForChanges.mockReset()
      fakeWalletService = {
        getAccount: jest.fn(() => 'account'),
      }
      fakeWeb3Service = {
        getAddressBalance: jest.fn(() => '123'),
      }
    })

    it('polls for account changes', async () => {
      expect.assertions(1)
      await pollForAccountChange(
        fakeWalletService,
        fakeWeb3Service,
        onAccountChange
      )

      expect(pollForChanges).toHaveBeenCalledWith(
        expect.any(Function) /* getFunc */,
        expect.any(Function) /* hasValueChanged */,
        expect.any(Function) /* continuePolling */,
        expect.any(Function) /*changeListener */,
        POLLING_INTERVAL /* delay */
      )
    })

    it('getFunc retrieves the current account', async () => {
      expect.assertions(2)
      await pollForAccountChange(
        fakeWalletService,
        fakeWeb3Service,
        onAccountChange
      )

      const value = await pollForChanges.mock.calls[0][0]()
      expect(fakeWalletService.getAccount).toHaveBeenCalled()
      expect(value).toBe('account')
    })

    it('hasValueChanged compares the old to the new account', async () => {
      expect.assertions(2)
      await pollForAccountChange(
        fakeWalletService,
        fakeWeb3Service,
        onAccountChange
      )

      expect(
        await pollForChanges.mock.calls[0][1]('account', 'account')
      ).toBeFalsy() // false = unchanged
      expect(
        await pollForChanges.mock.calls[0][1]('account', 'different account')
      ).toBeTruthy()
    })

    describe('changeListener', () => {
      beforeEach(() => {
        pollForChanges.mockReset()
        fakeWalletService = {
          getAccount: jest.fn(() => 'account'),
        }
        fakeWeb3Service = {
          getAddressBalance: jest.fn(() => '123'),
        }
      })

      it('should retrieve account balance and send account and balance to the callback', async done => {
        expect.assertions(4)
        onAccountChange = (account, balance) => {
          expect(account).toBe('new account')
          expect(balance).toBe('123')
          expect(getAccount()).toBe('new account')
          expect(getAccountBalance()).toBe('123')
          onAccountChange = () => {} // ensure stray calls don't trigger the expect calls for other tests
          done()
        }
        await pollForAccountChange(
          fakeWalletService,
          fakeWeb3Service,
          onAccountChange
        )

        await pollForChanges.mock.calls[0][3]('new account')
      })

      it('should immediately set the account, then retrieve balance', async done => {
        expect.assertions(1)

        fakeWeb3Service.getAddressBalance = () => {
          expect(getAccount()).toBe('new account')
          done()
        }

        await pollForAccountChange(
          fakeWalletService,
          fakeWeb3Service,
          onAccountChange
        )

        await pollForChanges.mock.calls[0][3]('new account')
      })

      it('should handle no account correctly', async done => {
        expect.assertions(4)
        fakeWeb3Service = {
          getAddressBalance: jest.fn(() => null),
        }
        onAccountChange = (account, balance) => {
          expect(account).toBe(null)
          expect(balance).toBe('0')
          expect(getAccount()).toBe(null)
          expect(getAccountBalance()).toBe('0')
          onAccountChange = () => {} // ensure stray calls don't trigger the expect calls for other tests
          done()
        }
        await pollForAccountChange(
          fakeWalletService,
          fakeWeb3Service,
          onAccountChange
        )

        await pollForChanges.mock.calls[0][3](false)
      })
    })
  })
})
