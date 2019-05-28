import makePurchaseCallback from '../../../data-iframe/start/makePurchaseCallback'
import connectToBlockchain from '../../../data-iframe/start/connectToBlockchain'
import {
  setupWalletService,
  setupWeb3Service,
  listenForAccountNetworkChanges,
  retrieveChainData,
} from '../../../data-iframe/blockchainHandler'

let mockWeb3ProxyProvider
jest.mock('../../../providers/Web3ProxyProvider', () => () => {
  mockWeb3ProxyProvider = {}
  return mockWeb3ProxyProvider
})
jest.mock('../../../data-iframe/blockchainHandler', () =>
  jest.genMockFromModule('../../../data-iframe/blockchainHandler')
)
jest.mock('../../../data-iframe/start/makePurchaseCallback')

describe('connectToBlockchain', () => {
  const unlockAddress = 'address'
  const config = {
    locks: {
      '0x123': {
        name: 'lock1',
      },
      '0x456': {
        name: 'lock2',
      },
    },
  }
  const window = 'window'
  const readOnlyProvider = 'readOnlyProvider'
  const blockTime = 8000
  const requiredConfirmations = 2
  const locksmithHost = 'http://example.com'
  const onChange = 'onChange'

  describe('connectToBlockchain', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })

    it('should set up the walletService', async () => {
      expect.assertions(1)

      await connectToBlockchain({
        unlockAddress,
        config,
        window,
        readOnlyProvider,
        blockTime,
        requiredConfirmations,
        locksmithHost,
        onChange,
      })

      expect(setupWalletService).toHaveBeenCalledWith(
        expect.objectContaining({
          unlockAddress,
          provider: mockWeb3ProxyProvider,
        })
      )
    })

    it('should set up the web3Service', async () => {
      expect.assertions(1)

      await connectToBlockchain({
        unlockAddress,
        config,
        window,
        readOnlyProvider,
        blockTime,
        requiredConfirmations,
        locksmithHost,
        onChange,
      })

      expect(setupWeb3Service).toHaveBeenCalledWith(
        expect.objectContaining({
          unlockAddress,
          readOnlyProvider,
          blockTime,
          requiredConfirmations,
        })
      )
    })

    it('should create a purchase callback', async () => {
      expect.assertions(1)

      const walletService = 'walletService'
      const web3Service = 'web3Service'
      setupWalletService.mockImplementationOnce(() => walletService)
      setupWeb3Service.mockImplementationOnce(() => web3Service)

      await connectToBlockchain({
        unlockAddress,
        config,
        window,
        readOnlyProvider,
        blockTime,
        requiredConfirmations,
        locksmithHost,
        onChange,
      })

      expect(makePurchaseCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          walletService,
          web3Service,
          requiredConfirmations,
          update: onChange,
          window,
        })
      )
    })

    it('should listen for account and network changes', async () => {
      expect.assertions(1)

      const walletService = 'walletService'
      const web3Service = 'web3Service'
      setupWalletService.mockImplementationOnce(() => walletService)
      setupWeb3Service.mockImplementationOnce(() => web3Service)

      await connectToBlockchain({
        unlockAddress,
        config,
        window,
        readOnlyProvider,
        blockTime,
        requiredConfirmations,
        locksmithHost,
        onChange,
      })

      expect(listenForAccountNetworkChanges).toHaveBeenCalledWith(
        expect.objectContaining({
          walletService,
          web3Service,
          onChange,
        })
      )
    })

    it('should retrieve chain data', async () => {
      expect.assertions(1)

      const walletService = 'walletService'
      const web3Service = 'web3Service'
      setupWalletService.mockImplementationOnce(() => walletService)
      setupWeb3Service.mockImplementationOnce(() => web3Service)

      await connectToBlockchain({
        unlockAddress,
        config,
        window,
        readOnlyProvider,
        blockTime,
        requiredConfirmations,
        locksmithHost,
        onChange,
      })

      expect(retrieveChainData).toHaveBeenCalledWith(
        expect.objectContaining({
          locksToRetrieve: ['0x123', '0x456'],
          walletService,
          web3Service,
          window,
          locksmithHost,
          requiredConfirmations,
          onChange,
        })
      )
    })

    it('should return the retrieved chain data', async () => {
      expect.assertions(1)

      const walletService = 'walletService'
      const web3Service = 'web3Service'
      setupWalletService.mockImplementationOnce(() => walletService)
      setupWeb3Service.mockImplementationOnce(() => web3Service)
      retrieveChainData.mockImplementationOnce(() =>
        Promise.resolve('chain data')
      )

      const result = await connectToBlockchain({
        unlockAddress,
        config,
        window,
        readOnlyProvider,
        blockTime,
        requiredConfirmations,
        locksmithHost,
        onChange,
      })

      expect(result).toBe('chain data')
    })
  })
})
