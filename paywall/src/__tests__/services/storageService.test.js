import axios from 'axios'
import StorageService from '../../services/storageService'

jest.mock('axios')

describe('StorageService', () => {
  const serviceHost = 'http://127.0.0.1:8080'
  const storageService = new StorageService(serviceHost)

  describe('getTransactionsHashesSentBy', () => {
    it('should expect a list of transactions', async () => {
      expect.assertions(2)
      const sender = '0x123'
      axios.get.mockReturnValue({
        data: {
          transactions: [
            {
              transactionHash: '0x123',
              sender: '0xabc',
              recipient: '0xcde',
              chain: 1984,
            },
            {
              transactionHash: '0x456',
              sender: '0xabc',
              recipient: '0xfgh',
              data: 'data',
              chain: 1984,
            },
          ],
        },
      })
      const hashes = await storageService.getTransactionsHashesSentBy(sender)
      expect(hashes).toEqual([
        { hash: '0x123', from: '0xabc', to: '0xcde', network: 1984 },
        {
          hash: '0x456',
          from: '0xabc',
          to: '0xfgh',
          network: 1984,
          input: 'data',
        },
      ])
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
      const chain = 1984
      const data = 'data'
      axios.post.mockReturnValue({})

      await storageService.storeTransaction(
        transactionHash,
        senderAddress,
        recipientAddress,
        chain,
        data
      )
      expect(axios.post).toHaveBeenCalledWith(`${serviceHost}/transaction`, {
        transactionHash,
        sender: senderAddress,
        recipient: recipientAddress,
        chain,
        data,
      })
    })
  })
})
