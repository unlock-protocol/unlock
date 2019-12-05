import { EventEmitter } from 'events'
import { BlockchainHandler } from '../../data-iframe/BlockchainHandler'
import { KeyResult } from '../../unlockTypes'
import { getWeb3Service } from '../test-helpers/setupBlockchainHelpers'

const mock = () => {
  const web3Service = getWeb3Service({})
  const chainData = new BlockchainHandler(web3Service)

  return {
    chainData,
    web3Service,
  }
}

describe('Improved blockchain handler', () => {
  describe('updateLock', () => {
    let web3Service: EventEmitter
    let chainData: BlockchainHandler
    beforeAll(() => {
      const mocks = mock()
      web3Service = mocks.web3Service
      chainData = mocks.chainData
    })

    it('starts with an empty locks object', () => {
      expect.assertions(1)

      expect(Object.keys(chainData.locks)).toHaveLength(0)
    })

    it('updates the lock state with a new lock', () => {
      expect.assertions(1)

      web3Service.emit('lock.updated', '0xLOCKADDRESS', { color: 'blue' })

      // note that the lock address has been normalized here
      expect(chainData.locks['0xlockaddress']).toEqual({
        color: 'blue',
        address: '0xlockaddress',
      })
    })

    it('merges new data for a given lock with old', () => {
      expect.assertions(1)

      web3Service.emit('lock.updated', '0xLOCKADDRESS', { animal: 'camel' })

      // note that the lock address has been normalized here
      expect(chainData.locks['0xlockaddress']).toEqual({
        color: 'blue',
        animal: 'camel',
        address: '0xlockaddress',
      })
    })

    it('keeps track of multiple locks', () => {
      expect.assertions(1)

      web3Service.emit('lock.updated', '0xAnOtHeRLOCK', { animal: 'kitten' })

      expect(chainData.locks).toEqual({
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
    let web3Service: EventEmitter
    let chainData: BlockchainHandler
    beforeAll(() => {
      const mocks = mock()
      web3Service = mocks.web3Service
      chainData = mocks.chainData
    })

    it('starts with an empty keys object', () => {
      expect.assertions(1)

      expect(Object.keys(chainData.keys)).toHaveLength(0)
    })

    it('updates the key state with a new key', () => {
      expect.assertions(1)

      const update: KeyResult = {
        lock: '0xLOCKADDRESS',
        owner: '0xOWNERADDRESS',
        expiration: 1234567890,
      }

      web3Service.emit('key.updated', undefined, update)

      expect(chainData.keys).toEqual({
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

      expect(chainData.keys).toEqual({
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
