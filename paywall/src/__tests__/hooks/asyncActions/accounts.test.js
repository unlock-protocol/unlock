import { getAccounts, getBalance } from '../../../hooks/asyncActions/accounts'

describe('useAccount async account actions', () => {
  describe('getAccounts', () => {
    it('succeeds', done => {
      expect.assertions(1)
      const web3 = {
        eth: {
          getAccounts: () => Promise.resolve(['account']),
        },
      }
      const handler = account => {
        expect(account).toBe('account')
        done()
      }

      getAccounts(handler, web3)
    })
    it('fails on error', done => {
      expect.assertions(1)
      const web3 = {
        eth: {
          getAccounts: () => Promise.reject('account'),
        },
      }
      const handler = account => {
        expect(account).toBe(null)
        done()
      }

      getAccounts(handler, web3)
    })
    it('fails on no accounts', done => {
      expect.assertions(1)
      const web3 = {
        eth: {
          getAccounts: () => Promise.resolve([]),
        },
      }
      const handler = account => {
        expect(account).toBe(null)
        done()
      }

      getAccounts(handler, web3)
    })
  })
  describe('getBalance', () => {
    it('succeeds', done => {
      expect.assertions(1)
      const web3 = {
        eth: {
          getBalance: () => Promise.resolve('123'),
        },
      }
      const handler = balance => {
        expect(balance).toBe('123')
        done()
      }

      getBalance(handler, web3, 'account')
    })
    it('fails on error', done => {
      expect.assertions(1)
      const web3 = {
        eth: {
          getBalance: () => Promise.reject('account'),
        },
      }
      const handler = balance => {
        expect(balance).toBe('0')
        done()
      }

      getBalance(handler, web3, 'account')
    })
    it('fails on no account', done => {
      expect.assertions(1)
      const web3 = {
        eth: {
          getBalance: () => Promise.resolve('123'),
        },
      }
      const handler = balance => {
        expect(balance).toBe('0')
        done()
      }

      getBalance(handler, web3)
    })
  })
})
