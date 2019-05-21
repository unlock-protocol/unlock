import getLocksAndKeys from '../../../data-iframe/blockchainHandler/getLocks'
import { setAccount } from '../../../data-iframe/blockchainHandler/account'

describe('getLocks', () => {
  let fakeWeb3Service
  const fakeWalletService = {}
  beforeEach(() => {
    fakeWeb3Service = {
      getLock: jest.fn(address => Promise.resolve({ address })),
    }
  })

  it('calls web3Service.getLock for all the locks', async () => {
    expect.assertions(4)

    await getLocksAndKeys({
      walletService: fakeWalletService,
      locksToRetrieve: [1, 2, 3],
      existingKeys: {},
      web3Service: fakeWeb3Service,
    })

    expect(fakeWeb3Service.getLock).toHaveBeenCalledTimes(3)
    expect(fakeWeb3Service.getLock).toHaveBeenNthCalledWith(1, 1)
    expect(fakeWeb3Service.getLock).toHaveBeenNthCalledWith(2, 2)
    expect(fakeWeb3Service.getLock).toHaveBeenNthCalledWith(3, 3)
  })

  it("creates default keys for locks that don't have one", async () => {
    expect.assertions(1)

    setAccount('account')
    const result = await getLocksAndKeys({
      walletService: fakeWalletService,
      locksToRetrieve: [1, 2, 3],
      existingKeys: { '2-account': 'hi' },
      web3Service: fakeWeb3Service,
    })

    expect(result).toEqual({
      locks: {
        1: { address: 1 },
        2: { address: 2 },
        3: { address: 3 },
      },
      keys: {
        '1-account': {
          lock: 1,
          owner: 'account',
          expiration: 0,
          confirmations: 0,
          status: 'none',
          transactions: [],
        },
        '2-account': 'hi',
        '3-account': {
          lock: 3,
          owner: 'account',
          expiration: 0,
          confirmations: 0,
          status: 'none',
          transactions: [],
        },
      },
    })
  })

  it('does not make keys if there is no account', async () => {
    expect.assertions(1)

    setAccount(null)
    const result = await getLocksAndKeys({
      walletService: fakeWalletService,
      locksToRetrieve: [1, 2, 3],
      existingKeys: { '2-account': 'hi' },
      web3Service: fakeWeb3Service,
    })

    expect(result).toEqual({
      locks: {
        1: { address: 1 },
        2: { address: 2 },
        3: { address: 3 },
      },
      keys: {
        '2-account': 'hi',
      },
    })
  })
})
