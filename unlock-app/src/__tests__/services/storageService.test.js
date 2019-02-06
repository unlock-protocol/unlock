import http from 'jest-mock-axios'
import StorageService from '../../services/storageService'

afterEach(() => http.reset())

describe('StorageService', () => {
  const serviceHost = 'http://127.0.0.1:8080'
  const storageService = new StorageService(serviceHost)
  const successFn = jest.fn(),
    failureFn = jest.fn()

  describe('lockLookUp', () => {
    describe('when the requested lock exists', () => {
      it('returns the details', () => {
        storageService.lockLookUp('0x42').then(successFn)
        http.mockResponse()
        expect(successFn).toHaveBeenCalled()
        expect(http.get).toHaveBeenCalledWith(`${serviceHost}/lock/0x42`)
      })
    })

    describe('when the requested lock doesnt exist', () => {
      it('raises an appropriate error', () => {
        storageService.lockLookUp('0x1234243').catch(failureFn)
        http.mockError()
        expect(http.get).toHaveBeenCalledWith(`${serviceHost}/lock/0x1234243`)
        expect(failureFn).toHaveBeenCalled()
      })
    })
  })

  describe('storeLockDetails', () => {
    describe('when storing a new lock', () => {
      it('returns a successful promise', () => {
        storageService
          .storeLockDetails({ name: 'lock_name', address: 'lock_address' })
          .then(successFn)
        http.mockResponse()
        expect(http.post).toHaveBeenCalledWith(`${serviceHost}/lock`, {
          name: 'lock_name',
          address: 'lock_address',
        })
        expect(successFn).toHaveBeenCalled()
      })
    })

    describe('when attempting to store an existing lock', () => {
      it('returns a failure promise', () => {
        storageService
          .storeLockDetails({ name: 'lock_name', address: 'existing_address' })
          .then(failureFn)
        http.mockError()
        expect(http.post).toHaveBeenCalledWith(`${serviceHost}/lock`, {
          name: 'lock_name',
          address: 'existing_address',
        })
        expect(failureFn).toHaveBeenCalled()
      })
    })
  })

  describe('updateLockDetails', () => {
    describe('when a lock can be updated', () => {
      it('returns a successful promise', () => {
        storageService
          .updateLockDetails('lock_address', {
            name: 'new_lock_name',
            address: 'lock_address',
          })
          .then(successFn)
        http.mockResponse()
        expect(http.put).toHaveBeenCalledWith(
          `${serviceHost}/lock/lock_address`,
          {
            name: 'new_lock_name',
            address: 'lock_address',
          }
        )
        expect(successFn).toHaveBeenCalled()
      })
    })

    describe('when a lock can not be updated', () => {
      storageService.updateLockDetails('lock_address').catch(failureFn)
      http.mockError()
      expect(http.put).toHaveBeenCalledWith(
        `${serviceHost}/lock/lock_address`,
        undefined
      )
      expect(failureFn).toHaveBeenCalled()
    })
  })

  describe('storeTransaction', () => {
    describe('when storing a transaction', () => {
      it('returns a successful promise', () => {
        const transactionHash = ' 0xhash'
        const senderAddress = ' 0xsender'
        const recipientAddress = ' 0xrecipient'
        storageService
          .storeTransaction(transactionHash, senderAddress, recipientAddress)
          .then(successFn)
        http.mockResponse()
        expect(http.post).toHaveBeenCalledWith(`${serviceHost}/transaction`, {
          transactionHash,
          sender: senderAddress,
          recipient: recipientAddress,
        })
        expect(successFn).toHaveBeenCalled()
      })
    })
  })
})
