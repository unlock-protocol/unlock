import axios from 'axios'
import StorageService from '../../services/storageService'

jest.mock('axios')

describe('StorageService', () => {
  const serviceHost = 'http://127.0.0.1:8080'
  const storageService = new StorageService(serviceHost)

  describe('lockLookUp', () => {
    describe('when the requested lock exists', () => {
      it('returns the details', async () => {
        expect.assertions(2)
        axios.get.mockReturnValue({
          data: {
            name: 'hello',
          },
        })
        const result = await storageService.lockLookUp('0x42')
        expect(result).toEqual('hello')
        expect(axios.get).toHaveBeenCalledWith(`${serviceHost}/lock/0x42`)
      })
    })

    describe('when the requested lock doesnt exist', () => {
      it('raises an appropriate error', async () => {
        expect.assertions(2)
        axios.get.mockRejectedValue()
        const result = await storageService.lockLookUp('0x1234243')
        expect(result).toEqual(null)
        expect(axios.get).toHaveBeenCalledWith(`${serviceHost}/lock/0x1234243`)
      })
    })
  })

  describe('storeLockDetails', () => {
    describe('when storing a new lock', () => {
      it('returns a successful promise', async () => {
        expect.assertions(1)
        axios.post.mockReturnValue()
        await storageService.storeLockDetails({
          name: 'lock_name',
          address: 'lock_address',
        })
        expect(axios.post).toHaveBeenCalledWith(
          `${serviceHost}/lock`,
          {
            name: 'lock_name',
            address: 'lock_address',
          },
          {}
        )
      })
    })

    describe('when attempting to store an existing lock', () => {
      it('returns a failure promise', async () => {
        expect.assertions(1)
        axios.post.mockRejectedValue()
        await storageService.storeLockDetails({
          name: 'lock_name',
          address: 'existing_address',
        })
        expect(axios.post).toHaveBeenCalledWith(
          `${serviceHost}/lock`,
          {
            name: 'lock_name',
            address: 'existing_address',
          },
          {}
        )
      })
    })
  })

  describe('updateLockDetails', () => {
    describe('when a lock can be updated', () => {
      it('returns a successful promise', async () => {
        expect.assertions(1)
        axios.put.mockReturnValue()
        await storageService.updateLockDetails('lock_address', {
          name: 'new_lock_name',
          address: 'lock_address',
        })
        expect(axios.put).toHaveBeenCalledWith(
          `${serviceHost}/lock/lock_address`,
          {
            name: 'new_lock_name',
            address: 'lock_address',
          },
          {}
        )
      })
    })

    describe('when a lock can not be updated', () => {
      it('should not fail', async () => {
        expect.assertions(1)
        axios.put.mockRejectedValue()
        await storageService.updateLockDetails('lock_address')
        expect(axios.put).toHaveBeenCalledWith(
          `${serviceHost}/lock/lock_address`,
          undefined,
          {}
        )
      })
    })
  })

  describe('getTransactionsHashesSentBy', () => {
    it('should expect a list of transactions hashes', async () => {
      expect.assertions(2)
      const sender = '0x123'
      axios.get.mockReturnValue({
        data: {
          transactions: [
            { transactionHash: '0x123', sender: '0xabc', recipient: '0xcde' },
            { transactionHash: '0x456', sender: '0xabc', recipient: '0xfgh' },
          ],
        },
      })
      const hashes = await storageService.getTransactionsHashesSentBy(sender)
      expect(hashes).toEqual(['0x123', '0x456'])
      expect(axios.get).toHaveBeenCalledWith(
        `${serviceHost}/transactions?sender=${sender}`
      )
    })
  })

  describe('storeTransaction', () => {
    it('returns a successful promise', async () => {
      expect.assertions(1)
      const transactionHash = ' 0xhash'
      const senderAddress = ' 0xsender'
      const recipientAddress = ' 0xrecipient'
      axios.post.mockReturnValue({})

      await storageService.storeTransaction(
        transactionHash,
        senderAddress,
        recipientAddress
      )
      expect(axios.post).toHaveBeenCalledWith(`${serviceHost}/transaction`, {
        transactionHash,
        sender: senderAddress,
        recipient: recipientAddress,
      })
    })
  })
})
