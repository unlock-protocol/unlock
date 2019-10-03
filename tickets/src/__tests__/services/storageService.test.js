import axios from 'axios'
import { StorageService, success, failure } from '../../services/storageService'

jest.mock('axios')

describe('StorageService', () => {
  const serviceHost = 'http://127.0.0.1:8080'
  let storageService

  beforeEach(() => {
    jest.clearAllMocks()
    storageService = new StorageService(serviceHost)
  })

  describe('getLockAddressesForUser', () => {
    it('should retrieve the list of locks for a user and emit emit success.getLockAddressesForUser', done => {
      expect.assertions(2)
      const user = '0xabc'
      const locks = [
        {
          name: 'The named lock',
          address: '0xAB4723090f6ea6bE32A1aDF4933EC901d315Ff0b',
          owner: '0x3CA206264762Caf81a8F0A843bbB850987B41e16',
          createdAt: '2019-02-06T23:16:16.505Z',
          updatedAt: '2019-02-06T23:16:16.505Z',
        },
        {
          name: 'A lock with a name',
          address: '0xFa8b435a51E074Dd5FBCa54679d32c960C3CBDFb',
          owner: '0x3CA206264762Caf81a8F0A843bbB850987B41e16',
          createdAt: '2019-03-05T01:23:13.545Z',
          updatedAt: '2019-03-05T01:23:13.545Z',
        },
      ]
      axios.get.mockReturnValue({
        data: {
          locks,
        },
      })

      storageService.on(success.getLockAddressesForUser, addresses => {
        expect(addresses).toEqual(locks.map(lock => lock.address))
        done()
      })

      storageService.getLockAddressesForUser(user)

      expect(axios.get).toHaveBeenCalledWith(`${serviceHost}/${user}/locks`)
    })

    it('should emit failure.getLockAddressesForUser if the data does not have the expected format', done => {
      expect.assertions(2)
      const user = '0xabc'
      axios.get.mockReturnValue({
        data: {},
      })

      storageService.getLockAddressesForUser(user)

      storageService.on(failure.getLockAddressesForUser, error => {
        expect(error).toBe('We could not retrieve lock addresses for that user')
        done()
      })

      expect(axios.get).toHaveBeenCalledWith(`${serviceHost}/${user}/locks`)
    })

    it('should emit failure.getLockAddressesForUser if there was an error', done => {
      expect.assertions(2)
      const user = '0xabc'
      const httpError = 'An Error'
      axios.get.mockRejectedValue(httpError)

      storageService.getLockAddressesForUser(user)

      storageService.on(failure.getLockAddressesForUser, error => {
        expect(error).toBe(httpError)
        done()
      })

      expect(axios.get).toHaveBeenCalledWith(`${serviceHost}/${user}/locks`)
    })
  })
})
