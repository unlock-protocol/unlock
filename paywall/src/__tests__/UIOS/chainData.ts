import { EventEmitter } from 'events'
import { ChainData } from '../../UIOS/chainData'
import { KeyResult } from '../../unlockTypes'
import { getWeb3Service } from '../test-helpers/setupBlockchainHelpers'

const mock = (lockAddresses: string[] = []) => {
  const web3Service = getWeb3Service({})
  const chainData = new ChainData(lockAddresses, web3Service)

  return {
    chainData,
    web3Service,
  }
}

describe('UIOS ChainData', () => {
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

  describe('updateKey', () => {
    let web3Service: EventEmitter
    let chainData: ChainData
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

  describe('fetchKeys', () => {
    it('does nothing if account has not been set', () => {
      expect.assertions(1)

      const mocks = mock(['0xlockaddress'])

      mocks.chainData.fetchKeys()

      expect(mocks.web3Service.getKeyByLockForOwner).not.toHaveBeenCalled()
    })

    it('does nothing if account is set but there are no lock addresses', () => {
      expect.assertions(1)

      const mocks = mock()

      // not using setAccountAddress so we can call fetchKeys separately
      mocks.chainData.accountAddress = '0xaccountaddress'
      mocks.chainData.fetchKeys()

      expect(mocks.web3Service.getKeyByLockForOwner).not.toHaveBeenCalled()
    })

    it('should call getKeyByLockForOwner for each lock address', () => {
      expect.assertions(3)

      const lockAddresses = ['0xlock1', '0xlock2', '0xlock3']
      const mocks = mock(lockAddresses)

      // not using setAccountAddress so we can call fetchKeys separately
      mocks.chainData.accountAddress = '0xaccountaddress'
      mocks.chainData.fetchKeys()

      lockAddresses.forEach((lockAddress, index) => {
        expect(mocks.web3Service.getKeyByLockForOwner).toHaveBeenNthCalledWith(
          index + 1,
          lockAddress,
          '0xaccountaddress'
        )
      })
    })
  })
})
