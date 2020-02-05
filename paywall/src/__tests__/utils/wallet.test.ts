import {
  hasWallet,
  walletIsMetamask,
  shouldUseUserAccounts,
} from '../../utils/wallet'

const web3WithProvider: any = {
  web3: {
    currentProvider: {},
  },
}

const userConfig: any = {
  unlockUserAccounts: true,
}

describe('wallet utilities', () => {
  describe('hasWallet', () => {
    it('should be true when window.web3.currentProvider exists', () => {
      expect.assertions(1)

      expect(hasWallet(web3WithProvider)).toBeTruthy()
    })

    it('should be false when window.web3 has no currentProvider', () => {
      expect.assertions(1)

      const web3Only: any = {
        web3: {},
      }

      expect(hasWallet(web3Only)).toBeFalsy()
    })

    it('should be false when window.web3 does not exist', () => {
      expect.assertions(1)

      expect(hasWallet({} as any)).toBeFalsy()
    })
  })

  describe('walletIsMetamask', () => {
    it('should be true when window.web3.currentProvider.isMetaMask is true', () => {
      expect.assertions(1)

      const window: any = {
        web3: {
          currentProvider: {
            isMetaMask: true,
          },
        },
      }

      expect(walletIsMetamask(window)).toBeTruthy()
    })

    it('should be false if hasWallet is false', () => {
      expect.assertions(1)

      const window: any = {}

      expect(walletIsMetamask(window)).toBeFalsy()
    })
  })

  describe('shouldUseUserAccounts', () => {
    it('should be false if hasWallet is true', () => {
      expect.assertions(1)

      expect(shouldUseUserAccounts(web3WithProvider, userConfig)).toBeFalsy()
    })

    it('should be false if unlock user accounts are not allowed', () => {
      expect.assertions(1)

      // a window with no "web3", and a paywall config with no "unlockUserAccounts = true"
      expect(shouldUseUserAccounts({} as any, {} as any)).toBeFalsy()
    })

    it('should be true if there is no wallet and user accounts are allowed', () => {
      expect.assertions(1)

      expect(shouldUseUserAccounts({} as any, userConfig)).toBeTruthy()
    })
  })
})
