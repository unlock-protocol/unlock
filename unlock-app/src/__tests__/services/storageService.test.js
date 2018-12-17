import http from 'jest-mock-axios'
import StorageService from '../../services/storageService'

afterEach(() => http.reset())

describe('StorageService', () => {
  const storageService = new StorageService()
  const successFn = jest.fn(),
    failureFn = jest.fn()

  const serviceHost = 'http://localhost:4000'

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
          .updateLockDetails({ name: 'new_lock_name', address: 'lock_address' })
          .then(successFn)
        http.mockResponse()
        expect(http.put).toHaveBeenCalledWith(`${serviceHost}/lock`, {
          name: 'new_lock_name',
          address: 'lock_address',
        })
        expect(successFn).toHaveBeenCalled()
      })
    })

    describe('when a lock can not be updatd', () => {
      storageService.updateLockDetails().catch(failureFn)
      http.mockError()
      expect(http.put).toHaveBeenCalledWith(`${serviceHost}/lock`, undefined)
      expect(failureFn).toHaveBeenCalled()
    })
  })
})
