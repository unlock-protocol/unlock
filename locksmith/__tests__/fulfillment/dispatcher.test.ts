import { EventEmitter } from 'events'
import Dispatcher, { getGasSettings } from '../../src/fulfillment/dispatcher'

const lockAddress = '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267'
const recipient = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'

const standardLock = {
  asOf: 227,
  balance: '0.01',
  expirationDuration: 2592000,
  keyPrice: '0.01',
  maxNumberOfKeys: 10,
  outstandingKeys: 1,
  owner: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
}

const mockWeb3Service = {
  getLock: jest
    .fn()
    .mockResolvedValue(standardLock)
    .mockResolvedValueOnce(standardLock),
}

class MockWalletService extends EventEmitter {
  connect = jest.fn()

  purchaseKey = jest.fn(() => {
    this.emit(
      'transaction.new',
      'a transaction hash',
      'the sender',
      'the recipient',
      'some data'
    )
  })

  setUnlockAddress = jest.fn()

  grantKeys = jest.fn()
}

const mockWalletService = new MockWalletService()

jest.mock('@unlock-protocol/unlock-js', () => ({
  Web3Service: function Web3Service() {
    return mockWeb3Service
  },
  WalletService: function WalletService() {
    return mockWalletService
  },
}))

jest.mock('ethers', () => {
  const { ethers, BigNumber } = jest.requireActual('ethers')
  return {
    ethers: {
      ...ethers,
      providers: {
        JsonRpcProvider: jest.fn(() => ({
          getFeeData: jest.fn(() => ({
            maxFeePerGas: BigNumber.from(10),
            maxPriorityFeePerGas: BigNumber.from(20),
            catch: jest.fn(),
          })),
        })),
      },
      Wallet: jest.fn(),
    },
  }
})

jest.mock('isomorphic-fetch', () => async () => ({
  json: async () => ({
    data: { standard: { maxPriorityFee: 36.37, maxFee: 36.37 } },
  }),
}))

describe('Dispatcher', () => {
  describe('getGasSettings', () => {
    it('returns correct default value', async () => {
      expect.assertions(2)
      const { maxFeePerGas, maxPriorityFeePerGas } = await getGasSettings(1)
      expect(maxFeePerGas.toNumber()).toBe(10)
      expect(maxPriorityFeePerGas.toNumber()).toBe(20)
    })
    it('returns value from gas station on Polygon mainnet', async () => {
      expect.assertions(2)
      const { maxFeePerGas, maxPriorityFeePerGas } = await getGasSettings(137)
      expect(maxFeePerGas.toNumber()).toBe(37000000000)
      expect(maxPriorityFeePerGas.toNumber()).toBe(37000000000)
    })
  })

  describe('grantKey', () => {
    it('should call grant keys on the key granter', async () => {
      expect.assertions(1)

      const callback = jest.fn()
      await new Dispatcher().grantKeys(
        lockAddress,
        [recipient],
        31337,
        callback
      )
      expect(mockWalletService.grantKeys).toBeCalledWith(
        {
          lockAddress: '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267',
          recipients: ['0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'],
          transactionOptions: {},
        },
        callback
      )
    })
  })
})
