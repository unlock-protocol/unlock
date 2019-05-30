import getLocks from '../../../data-iframe/blockchainHandler/getLocks'
import { setAccount } from '../../../data-iframe/blockchainHandler/account'

jest.mock('../../../data-iframe/blockchainHandler/ensureWalletReady')

describe('Locks retrieval', () => {
  describe('getLocks', () => {
    let fakeWeb3Service
    beforeEach(() => {
      fakeWeb3Service = {
        // locks returned from getLock do not have "address" set for some reason
        getLock: jest.fn(address => Promise.resolve({ thing: address })),
      }
    })

    it('calls web3Service.getLock for all the locks', async () => {
      expect.assertions(4)

      await getLocks({
        locksToRetrieve: [1, 2, 3],
        web3Service: fakeWeb3Service,
      })

      expect(fakeWeb3Service.getLock).toHaveBeenCalledTimes(3)
      expect(fakeWeb3Service.getLock).toHaveBeenNthCalledWith(1, 1)
      expect(fakeWeb3Service.getLock).toHaveBeenNthCalledWith(2, 2)
      expect(fakeWeb3Service.getLock).toHaveBeenNthCalledWith(3, 3)
    })

    it('returns the locks indexed by address', async () => {
      expect.assertions(1)

      setAccount('account')
      const result = await getLocks({
        locksToRetrieve: [1, 2, 3],
        web3Service: fakeWeb3Service,
      })

      expect(result).toEqual({
        1: { address: 1, thing: 1 },
        2: { address: 2, thing: 2 },
        3: { address: 3, thing: 3 },
      })
    })
  })
})
