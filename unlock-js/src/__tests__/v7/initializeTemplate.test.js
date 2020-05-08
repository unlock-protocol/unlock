import WalletService from '../../walletService'
import v7 from '../../v7'
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
const signer = {
  getAddress: jest.fn(() => Promise.resolve(accountAddress)),
}
const provider = {
  getSigner: () => signer,
  waitForTransaction: jest.fn(() => Promise.resolve()),
}

describe('v7', () => {
  beforeEach(() => {
    walletService = new WalletService({
      unlockAddress: '0x559247Ec8A8771E8C97cDd39b96b9255651E39C5',
    })
    walletService.provider = provider
    walletService.signer = signer
    walletService.lockContractAbiVersion = jest.fn(() => {
      return v7
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
