import { EventEmitter } from 'events'
import { ChainData } from '../../UIOS/chainData'

const mock = () => {
  const web3Service = new EventEmitter()
  const chainData = new ChainData([], web3Service)

  return {
    chainData,
    web3Service,
  }
}

describe('UIOS ChainData', () => {
  describe('event listeners', () => {
    it('calls updateLock for lock.updated event', () => {
      expect.assertions(2)
      const { web3Service, chainData } = mock()

      const lockAddress = '0xlockaddress'
      const update = { color: 'blue' }

      expect(chainData.locks[lockAddress]).toBeUndefined()

      web3Service.emit('lock.updated', lockAddress, update)

      expect(chainData.locks[lockAddress]).toBeDefined()
    })
  })

  describe('updateLock', () => {
    let web3Service: EventEmitter
    let chainData: ChainData
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
})
