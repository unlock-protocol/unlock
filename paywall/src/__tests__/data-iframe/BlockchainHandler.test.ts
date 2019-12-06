import { BlockchainHandler } from '../../data-iframe/BlockchainHandler'
import { KeyResult } from '../../unlockTypes'
import { Web3ServiceType } from '../../data-iframe/blockchainHandler/blockChainTypes'
import { getWeb3Service } from '../test-helpers/setupBlockchainHelpers'

const lockAddresses = ['0xALOCK', '0xANOTHERLOCK']
const accountAddress = '0xACCOUNTADDRESS'

const mock = (
  overrideLockAddresses: string[] = lockAddresses,
  overrideAccountAddress: string = accountAddress
) => {
  const web3Service = getWeb3Service({})
  const blockchainHandler = new BlockchainHandler(
    web3Service,
    overrideLockAddresses,
    overrideAccountAddress
  )

  return {
    blockchainHandler,
    web3Service,
  }
}

describe('Improved blockchain handler', () => {
  describe('constructor', () => {
    let web3Service: Web3ServiceType
    let blockchainHandler: BlockchainHandler

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
    let blockchainHandler: BlockchainHandler
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
    let blockchainHandler: BlockchainHandler
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
})
