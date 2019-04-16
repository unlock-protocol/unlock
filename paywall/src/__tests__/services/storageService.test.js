import axios from 'axios'
import StorageService from '../../services/storageService'

jest.mock('axios')

describe('StorageService', () => {
  const serviceHost = 'http://127.0.0.1:8080'
  const storageService = new StorageService(serviceHost)

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
