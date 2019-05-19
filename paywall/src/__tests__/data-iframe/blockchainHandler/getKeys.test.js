import getKeys from '../../../data-iframe/blockchainHandler/getKeys'
import ensureWalletReady from '../../../data-iframe/blockchainHandler/ensureWalletReady'
import { setAccount } from '../../../data-iframe/blockchainHandler/account'

jest.mock('../../../data-iframe/blockchainHandler/ensureWalletReady', () =>
  jest.fn().mockResolvedValue()
)

describe('getKeys', () => {
  let fakeWalletService
  let fakeWeb3Service

  beforeEach(() => {
    fakeWalletService = {}
    fakeWeb3Service = {
      getKeysByLockForOwner: jest.fn((lock, owner) =>
        Promise.resolve({ id: `${lock}-${owner}`, lock, owner, expiration: 0 })
      ),
    }
  })

  it('ensure the wallet is ready first', async () => {
    expect.assertions(1)

    await getKeys({
      walletService: fakeWalletService,
      locks: [1, 2],
      web3Service: fakeWeb3Service,
      requiredConfirmations: 12,
    })

    expect(ensureWalletReady).toHaveBeenCalledWith(fakeWalletService)
  })

  it('web3Service.getKeysByLockForOwner is called', async () => {
    expect.assertions(3)

    setAccount('account')
    await getKeys({
      walletService: fakeWalletService,
      locks: [1, 2],
      web3Service: fakeWeb3Service,
      requiredConfirmations: 12,
    })

    expect(fakeWeb3Service.getKeysByLockForOwner).toHaveBeenCalledTimes(2)
    expect(fakeWeb3Service.getKeysByLockForOwner).toHaveBeenNthCalledWith(
      1,
      1,
      'account'
    )
    expect(fakeWeb3Service.getKeysByLockForOwner).toHaveBeenNthCalledWith(
      2,
      2,
      'account'
    )
  })

  it('returns the new keys', async () => {
    expect.assertions(1)

    setAccount('account')
    let counter = 0
    const expiration = new Date().getTime() + 10000
    fakeWeb3Service.getKeysByLockForOwner = jest.fn((lock, owner) => {
      if (!counter++) {
        return Promise.resolve({
          id: `${lock}-${owner}`,
          lock,
          owner,
          expiration: 0,
        })
      }
      return Promise.resolve({
        id: `${lock}-${owner}`,
        lock,
        owner,
        expiration,
      })
    })
    const keys = await getKeys({
      walletService: fakeWalletService,
      locks: [1, 2],
      web3Service: fakeWeb3Service,
      requiredConfirmations: 12,
    })

    expect(keys).toEqual({
      '1-account': {
        id: '1-account',
        lock: 1,
        owner: 'account',
        expiration: 0,
        status: 'none',
        confirmations: 0,
        transactions: [],
      },
      '2-account': {
        id: '2-account',
        lock: 2,
        owner: 'account',
        expiration,
        status: 'valid',
        confirmations: 0,
        transactions: [],
      },
    })
  })
})
