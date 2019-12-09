import { BlockchainReader } from '../../data-iframe/BlockchainReader'
import { KeyResult } from '../../unlockTypes'
import { Web3ServiceType } from '../../data-iframe/blockchainHandler/blockChainTypes'
import { getWeb3Service } from '../test-helpers/setupBlockchainHelpers'
import * as locksmithHelpers from '../../data-iframe/locksmith-helpers'

const lockAddresses = ['0xALOCK', '0xANOTHERLOCK']
const accountAddress = '0xACCOUNTADDRESS'

const mock = (
  overrideLockAddresses: string[] = lockAddresses,
  overrideAccountAddress: string = accountAddress
) => {
  const web3Service = getWeb3Service({})
  const blockchainHandler = new BlockchainReader(
    web3Service,
    overrideLockAddresses,
    overrideAccountAddress
  )

  return {
    blockchainHandler,
    web3Service,
  }
}

describe('BlockchainReader', () => {
  describe('constructor', () => {
    let web3Service: Web3ServiceType
    let blockchainHandler: BlockchainReader

    beforeEach(() => {
      const mocks = mock()
      web3Service = mocks.web3Service
      blockchainHandler = mocks.blockchainHandler
    })

    it('should set lockAddresses and accountAddress', () => {
      expect.assertions(2)

      expect(blockchainHandler.lockAddresses).toEqual(lockAddresses)
      expect(blockchainHandler.accountAddress).toEqual(accountAddress)
    })

    it('should get locks from web3Service', () => {
      expect.assertions(2)

      expect(web3Service.getLock).toHaveBeenNthCalledWith(1, lockAddresses[0])
      expect(web3Service.getLock).toHaveBeenNthCalledWith(2, lockAddresses[1])
    })

    it('should get keys from web3Service', () => {
      expect.assertions(2)

      expect(web3Service.getKeyByLockForOwner).toHaveBeenNthCalledWith(
        1,
        lockAddresses[0],
        accountAddress
      )
      expect(web3Service.getKeyByLockForOwner).toHaveBeenNthCalledWith(
        2,
        lockAddresses[1],
        accountAddress
      )
    })
  })

  describe('updateLock', () => {
    let web3Service: Web3ServiceType
    let blockchainHandler: BlockchainReader
    beforeAll(() => {
      const mocks = mock()
      web3Service = mocks.web3Service
      blockchainHandler = mocks.blockchainHandler
    })

    it('starts with an empty locks object', () => {
      expect.assertions(1)

      expect(Object.keys(blockchainHandler.locks)).toHaveLength(0)
    })

    it('updates the lock state with a new lock', () => {
      expect.assertions(1)

      web3Service.emit('lock.updated', '0xLOCKADDRESS', { color: 'blue' })

      // note that the lock address has been normalized here
      expect(blockchainHandler.locks['0xlockaddress']).toEqual({
        color: 'blue',
        address: '0xlockaddress',
      })
    })

    it('merges new data for a given lock with old', () => {
      expect.assertions(1)

      web3Service.emit('lock.updated', '0xLOCKADDRESS', { animal: 'camel' })

      // note that the lock address has been normalized here
      expect(blockchainHandler.locks['0xlockaddress']).toEqual({
        color: 'blue',
        animal: 'camel',
        address: '0xlockaddress',
      })
    })

    it('keeps track of multiple locks', () => {
      expect.assertions(1)

      web3Service.emit('lock.updated', '0xAnOtHeRLOCK', { animal: 'kitten' })

      expect(blockchainHandler.locks).toEqual({
        '0xlockaddress': {
          color: 'blue',
          animal: 'camel',
          address: '0xlockaddress',
        },
        '0xanotherlock': {
          animal: 'kitten',
          address: '0xanotherlock',
        },
      })
    })
  })

  describe('updateKey', () => {
    let web3Service: Web3ServiceType
    let blockchainHandler: BlockchainReader
    beforeAll(() => {
      const mocks = mock()
      web3Service = mocks.web3Service
      blockchainHandler = mocks.blockchainHandler
    })

    it('starts with an empty keys object', () => {
      expect.assertions(1)

      expect(Object.keys(blockchainHandler.keys)).toHaveLength(0)
    })

    it('updates the key state with a new key', () => {
      expect.assertions(1)

      const update: KeyResult = {
        lock: '0xLOCKADDRESS',
        owner: '0xOWNERADDRESS',
        expiration: 1234567890,
      }

      web3Service.emit('key.updated', undefined, update)

      expect(blockchainHandler.keys).toEqual({
        '0xlockaddress': {
          expiration: 1234567890,
          lock: '0xlockaddress',
          owner: '0xowneraddress',
        },
      })
    })

    it('can track multiple keys', () => {
      expect.assertions(1)

      const update: KeyResult = {
        lock: '0xAnOtHeRLOCK',
        owner: '0xOWNERADDRESS',
        expiration: 1234567890,
      }

      web3Service.emit('key.updated', undefined, update)

      expect(blockchainHandler.keys).toEqual({
        '0xlockaddress': {
          expiration: 1234567890,
          lock: '0xlockaddress',
          owner: '0xowneraddress',
        },
        '0xanotherlock': {
          expiration: 1234567890,
          lock: '0xanotherlock',
          owner: '0xowneraddress',
        },
      })
    })
  })

  describe('updateTransaction', () => {
    let web3Service: Web3ServiceType
    let blockchainHandler: BlockchainReader
    beforeAll(() => {
      const mocks = mock()
      web3Service = mocks.web3Service
      blockchainHandler = mocks.blockchainHandler
    })

    it('starts with an empty transactions object', () => {
      expect.assertions(1)

      expect(Object.keys(blockchainHandler.transactions)).toHaveLength(0)
    })

    it('updates the transactions state with a transaction update', () => {
      expect.assertions(1)

      const update = {
        hash: '0xhash1',
        status: 'mined',
        blockNumber: 7,
        lock: '0xLOCKADDRESS',
        to: '0xTO',
      }

      web3Service.emit('transaction.updated', '0xhash1', update)

      expect(blockchainHandler.transactions).toEqual({
        '0xhash1': {
          hash: '0xhash1',
          status: 'mined',
          blockNumber: 7,
          lock: '0xlockaddress', // normalized!
          to: '0xto',
        },
      })
    })

    it('updates existing transactions in the state', () => {
      expect.assertions(1)

      const update = {
        blockNumber: 8,
      }

      web3Service.emit('transaction.updated', '0xhash1', update)

      expect(blockchainHandler.transactions).toEqual({
        '0xhash1': {
          hash: '0xhash1',
          status: 'mined',
          blockNumber: 8,
          lock: '0xlockaddress',
          to: '0xto',
        },
      })
    })

    it('can track multiple transactions', () => {
      expect.assertions(1)

      const update = { blockNumber: 12 }

      web3Service.emit('transaction.updated', '0xhash2', update)

      expect(blockchainHandler.transactions).toEqual({
        '0xhash1': {
          hash: '0xhash1',
          status: 'mined',
          blockNumber: 8,
          lock: '0xlockaddress',
          to: '0xto',
        },
        '0xhash2': {
          blockNumber: 12,
        },
      })
    })
  })

  describe('getTransactionsFromLocksmith', () => {
    let web3Service: Web3ServiceType
    let blockchainHandler: BlockchainReader

    beforeEach(() => {
      const getTransactionsForMock = jest.fn().mockResolvedValue(transactions)
      jest
        .spyOn(locksmithHelpers, 'getTransactionsFor')
        .mockImplementation(getTransactionsForMock)

      const mocks = mock()
      web3Service = mocks.web3Service
      blockchainHandler = mocks.blockchainHandler
    })

    const baseTransaction = {
      blockNumber: Number.MAX_SAFE_INTEGER,
      confirmations: 0,
      status: 'submitted',
      type: 'KEY_PURCHASE',
    }

    const transactions = [
      {
        ...baseTransaction,
        hash: '0xhash1',
        to: '0xrecipient1',
        from: '0xfrom1',
        for: '0xfor1',
        input: null,
      },
      {
        ...baseTransaction,
        hash: '0xhash2',
        to: '0xrecipient2',
        from: '0xfrom2',
        for: '0xfor2',
        input: 'some input',
      },
    ]

    it('should update state with each retrieved transaction', async () => {
      expect.assertions(1)

      await blockchainHandler.getTransactionsFromLocksmith()

      expect(blockchainHandler.transactions).toEqual({
        '0xhash1': {
          ...baseTransaction,
          hash: '0xhash1',
        },
        '0xhash2': {
          ...baseTransaction,
          hash: '0xhash2',
        },
      })
    })

    it("should call Web3Service's getTransaction for each retrieved transaction", async () => {
      expect.assertions(2)

      await blockchainHandler.getTransactionsFromLocksmith()

      expect(web3Service.getTransaction).toHaveBeenNthCalledWith(
        1,
        '0xhash1',
        undefined
      )
      expect(web3Service.getTransaction).toHaveBeenNthCalledWith(
        2,
        '0xhash2',
        transactions[1]
      )
    })

    it('should log an error if getTransaction fails', async () => {
      expect.assertions(2)

      web3Service.getTransaction = jest.fn().mockRejectedValue('an error')
      jest.spyOn(global.console, 'error')

      await blockchainHandler.getTransactionsFromLocksmith()

      expect(global.console.error).toHaveBeenNthCalledWith(
        1,
        'unable to retrieve saved transaction from blockchain: 0xhash1'
      )
      expect(global.console.error).toHaveBeenNthCalledWith(
        2,
        'unable to retrieve saved transaction from blockchain: 0xhash2'
      )
    })
  })
})
