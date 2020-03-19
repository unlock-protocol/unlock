import WalletService from '../../walletService'
import v13 from '../../v13'
import { ZERO } from '../../constants'

let walletService

const transaction = {
  hash: '0xtransactionHash',
}

// Mock the lockContract (can we use the abi here?)
const lockContract = {
  initialize: jest.fn(() => Promise.resolve(transaction)),
}
const templateAddress = '0xtemplate'
const accountAddress = '0xaccount'
const provider = {
  getSigner: () => ({
    getAddress: jest.fn(() => Promise.resolve(accountAddress)),
  }),
  waitForTransaction: jest.fn(() => Promise.resolve()),
}

describe('v13', () => {
  beforeEach(() => {
    walletService = new WalletService({
      unlockAddress: '0xunlockAddress',
    })
    walletService.provider = provider
    walletService.lockContractAbiVersion = jest.fn(() => {
      return v13
    })
  })

  describe('initialize', () => {
    it('should get the lock contract based on its address', async () => {
      expect.assertions(1)
      walletService.getLockContract = jest.fn(() => lockContract)
      await walletService.initializeTemplate({ templateAddress })
      expect(walletService.getLockContract).toHaveBeenCalledWith(
        templateAddress
      )
    })

    it('should send a transaction to initialize the template with the right values', async () => {
      expect.assertions(1)
      walletService.getLockContract = jest.fn(() => lockContract)
      await walletService.initializeTemplate({ templateAddress })
      expect(lockContract.initialize).toHaveBeenCalledWith(
        accountAddress,
        0,
        ZERO,
        0,
        0,
        'Public Lock Template'
      )
    })

    it('should wait for the transacion to be mined', async () => {
      expect.assertions(1)
      walletService.getLockContract = jest.fn(() => lockContract)
      await walletService.initializeTemplate({ templateAddress })
      expect(provider.waitForTransaction).toHaveBeenCalledWith(transaction.hash)
    })
  })
})
