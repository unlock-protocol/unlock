import { EventEmitter } from 'events'
import Dispatcher from '../../src/fulfillment/dispatcher'

jest.mock('../../src/operations/transactionOperations')

let dispatcher: Dispatcher
const lockAddress = '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267'
const recipient = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
const unlockAddress = '0x885EF47c3439ADE0CB9b33a4D3c534C99964Db93'
const credential =
  '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
const host = 'http://localhost:8545'
const buyer = '0xpurchasingEthereumAddress'

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
}
const mockWalletService = new MockWalletService()

jest.mock('@unlock-protocol/unlock-js', () => ({
  Web3Service: function() {
    return mockWeb3Service
  },
  WalletService: function() {
    return mockWalletService
  },
}))

describe('Dispatcher', () => {
  beforeAll(() => {
    dispatcher = new Dispatcher(unlockAddress, credential, host, buyer)
  })

  describe('retrieveLock', () => {
    describe('when the lock is retrievable', () => {
      it('returns the Lock details', async () => {
        expect.assertions(1)

        const lockInformation = await dispatcher.retrieveLock(lockAddress)
        expect(lockInformation).toEqual(expect.objectContaining(standardLock))
      })
    })

    describe('when the lock is not retrievable', () => {
      it('raises and error', async () => {
        expect.assertions(1)
        mockWeb3Service.getLock = jest.fn().mockRejectedValue('foo')

        try {
          await dispatcher.retrieveLock('0x222')
        } catch (error) {
          expect(error).toEqual(
            new Error('Unable to retrieve Lock information')
          )
        }
      })
    })
  })

  describe('purchase', () => {
    describe('when the key is purchasable', () => {
      it("purchases a key on the recipient's behalf and returns the transaction hash", async () => {
        expect.assertions(2)
        dispatcher.retrieveLock = jest.fn().mockResolvedValue(standardLock)

        const result = await dispatcher.purchase(lockAddress, recipient)
        expect(mockWalletService.purchaseKey).toHaveBeenCalledWith({
          lockAddress,
          keyPrice: '0.01',
          owner: recipient,
        })
        expect(result).toEqual('a transaction hash')
      })
    })

    describe('when the key is not purchasable', () => {
      it("will not purchase the key on the recipient's behalf", async () => {
        expect.assertions(1)
        dispatcher.retrieveLock = jest.fn().mockResolvedValueOnce({
          asOf: 227,
          balance: '0.01',
          expirationDuration: 2592000,
          keyPrice: '0.01',
          maxNumberOfKeys: 10,
          outstandingKeys: 10,
          owner: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
        })
        expect(dispatcher.purchase(lockAddress, recipient)).rejects.toThrow(
          'No Available Keys.'
        )
      })
    })
  })
})
