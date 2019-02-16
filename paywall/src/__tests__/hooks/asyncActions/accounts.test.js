import {
  makeGetAccount,
  makePollForAccountChange,
} from '../../../hooks/asyncActions/accounts'

describe('useAccount async account actions', () => {
  describe('makeGetAccount', () => {
    let setAccount
    let setBalance
    let saveLocalStorageAccount
    let localStorageAccount
    let isInIframe
    let web3
    let fakeWindow = {
      location: {
        pathname:
          '/demo/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54/http%3a%2f%2fhithere',
        hash: '#0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb54',
      },
    }

    // this helper function allows us to easily create a mock getAccount
    // to test the code works as expected
    function testMockGetAccount() {
      return makeGetAccount({
        window: fakeWindow,
        web3,
        isInIframe,
        localStorageAccount,
        saveLocalStorageAccount,
        setAccount,
        setBalance,
      })
    }
    beforeEach(() => {
      setAccount = jest.fn()
      setBalance = jest.fn()
      saveLocalStorageAccount = jest.fn()
      isInIframe = true
      localStorageAccount = undefined
      web3 = undefined
    })
    it('does nothing if web3 is not defined', async () => {
      web3 = false
      const getAccount = testMockGetAccount()

      await getAccount()

      expect(setAccount).not.toHaveBeenCalled()
    })
    describe('web3 is set', () => {
      let accounts = ['account']
      let balance = '1000000000000000'
      beforeEach(() => {
        web3 = {
          eth: {
            getAccounts() {
              return Promise.resolve(accounts)
            },
            getBalance() {
              return Promise.resolve(balance)
            },
          },
        }
      })
      describe('paywall in iframe', () => {
        describe('account does not exist (like in coinbase wallet)', () => {
          beforeEach(() => {
            accounts = []
          })
          it('sets the account from localStorage if possible', async () => {
            localStorageAccount = 'local'

            const getAccount = testMockGetAccount()

            await getAccount()

            expect(setAccount).toHaveBeenCalledWith('local')
          })
          it('sets the account from the URL if no localStorage account exists', async () => {
            const getAccount = testMockGetAccount()

            await getAccount()

            expect(setAccount).toHaveBeenCalledWith(
              '0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb54'
            )
          })
          it('saves the account in localStorage if provided in the URL', async () => {
            const getAccount = testMockGetAccount()

            await getAccount()

            expect(saveLocalStorageAccount).toHaveBeenCalledWith(
              '0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb54'
            )
          })
        })
      })
      describe('normal account flow', () => {
        let getAccount
        beforeEach(() => {
          getAccount = testMockGetAccount()
          accounts = ['account']
        })
        it('sets the account', async () => {
          await getAccount()

          expect(setAccount).toHaveBeenCalledWith('account')
        })
        it('retrieves and sets the balance', async () => {
          await getAccount()

          expect(setBalance).toHaveBeenCalledWith('0.001')
        })
      })
    })
  })
  describe('makePollForAccount', () => {
    let web3
    let isInIframe
    let localStorageAccount
    let account
    let nextAccount
    let balance
    let setAccount
    let setBalance

    // easy mock pollForAccountChange creator for testing
    function testMockPollForAccount() {
      return makePollForAccountChange({
        web3,
        isInIframe,
        localStorageAccount,
        account,
        setAccount,
        setBalance,
      })
    }

    beforeEach(() => {
      account = 'account'
      nextAccount = 'next'
      balance = '10000000000000'
      web3 = {
        eth: {
          getAccounts: jest.fn(() => {
            return Promise.resolve([nextAccount])
          }),
          getBalance: jest.fn(() => {
            return Promise.resolve(balance)
          }),
        },
      }
      isInIframe = true
      localStorageAccount = undefined
      setAccount = jest.fn()
      setBalance = jest.fn()
    })
    describe('in iframe', () => {
      it('does nothing if in the iframe and account was set via localStorage', async () => {
        localStorageAccount = 'local'

        const pollForAccountChange = testMockPollForAccount()

        await pollForAccountChange()

        expect(web3.eth.getAccounts).not.toHaveBeenCalled()
      })
      it('retrieves account if account was not retrieved from localStorage', async () => {
        const pollForAccountChange = testMockPollForAccount()

        await pollForAccountChange()

        expect(web3.eth.getAccounts).toHaveBeenCalled()
      })
    })
    describe('normal polling', () => {
      it('does nothing if the new account matches the old', async () => {
        expect.assertions(2)
        nextAccount = account

        const pollForAccountChange = testMockPollForAccount()

        await pollForAccountChange()

        expect(web3.eth.getAccounts).toHaveBeenCalled()
        expect(setAccount).not.toHaveBeenCalled()
      })
      it('does nothing if the user was logged out and is still logged out', async () => {
        expect.assertions(2)
        nextAccount = account = null

        const pollForAccountChange = testMockPollForAccount()

        await pollForAccountChange()

        expect(web3.eth.getAccounts).toHaveBeenCalled()
        expect(setAccount).not.toHaveBeenCalled()
      })
      it('swallows exceptions', async () => {
        web3.eth.getAccounts = () => Promise.reject(new Error('nope'))

        const pollForAccountChange = testMockPollForAccount()

        await pollForAccountChange()

        expect(setAccount).not.toHaveBeenCalled()
      })
      describe('account change', () => {
        beforeEach(() => {
          balance = '3000000000000000'
        })
        it('sets the account if it is different', async () => {
          const pollForAccountChange = testMockPollForAccount()

          await pollForAccountChange()

          expect(setAccount).toHaveBeenCalledWith('next')
        })
        it('retrieves and sets the balance if the account exists', async () => {
          const pollForAccountChange = testMockPollForAccount()

          await pollForAccountChange()

          expect(setBalance).toHaveBeenCalledWith('0.003')
        })
        it('resets balance to 0 if the account was logged out', async () => {
          nextAccount = null

          const pollForAccountChange = testMockPollForAccount()

          await pollForAccountChange()

          expect(setBalance).toHaveBeenCalledWith('0')
        })
      })
    })
  })
})
