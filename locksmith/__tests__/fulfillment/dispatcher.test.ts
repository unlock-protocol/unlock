// eslint-disable-next-line max-classes-per-file
import { EventEmitter } from 'events'
import { BigNumber, Wallet } from 'ethers'
import Dispatcher from '../../src/fulfillment/dispatcher'

const config = require('../../config/config')

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

class MockLockContract extends EventEmitter {
  renewMembershipFor = jest.fn()
}

const mockLockContract = new MockLockContract()
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

  getLockContract = jest.fn(async () => mockLockContract)

  renewMembershipFor = jest.fn(async () => ({ hash: 'txhash' }))
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

jest.mock('../../src/utils/gasSettings', () => ({
  getGasSettings: jest.fn(() => {
    return {
      maxFeePerGas: BigNumber.from(40000000000),
      maxPriorityFeePerGas: BigNumber.from(40000000000),
    }
  }),
}))

describe('Dispatcher', () => {
  describe('grantKey', () => {
    it('should call grant keys on the key granter', async () => {
      expect.assertions(1)

      const callback = jest.fn()
      await new Dispatcher().grantKeys(
        lockAddress,
        [{ recipient }],
        31337,
        callback
      )
      expect(mockWalletService.grantKeys).toBeCalledWith(
        {
          lockAddress: '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267',
          expirations: [],
          keyManagers: [],
          recipients: ['0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'],
        },
        {
          maxFeePerGas: BigNumber.from(40000000000),
          maxPriorityFeePerGas: BigNumber.from(40000000000),
        },
        callback
      )
    })
  })
  describe('renewMembershipFor', () => {
    it('should call the function from walletService', async () => {
      expect.assertions(1)
      const keyId = '1'

      await new Dispatcher().renewMembershipFor(31337, lockAddress, keyId)
      const referrerWallet = new Wallet(config.purchaserCredentials)

      expect(mockWalletService.renewMembershipFor).toBeCalledWith(
        {
          lockAddress,
          referrer: referrerWallet.address,
          tokenId: keyId,
        },
        {
          maxFeePerGas: BigNumber.from(40000000000),
          maxPriorityFeePerGas: BigNumber.from(40000000000),
        }
      )
    })
  })
})
