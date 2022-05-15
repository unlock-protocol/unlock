import fetch from 'cross-fetch'
import { addMetadata } from '../../src/operations/userMetadataOperations'
import {
  sendEmail,
  notifyNewKeyToWedlocks,
} from '../../src/operations/wedlocksOperations'

jest.mock('cross-fetch')

describe('Wedlocks operations', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  describe('notifyNewKeyToWedlocks', () => {
    it('should notify wedlocks if there is an email metadata', async () => {
      expect.assertions(1)

      const lockAddress = '0xlock'
      const ownerAddress = '0xowner'
      await addMetadata({
        chain: 1,
        tokenAddress: lockAddress,
        userAddress: ownerAddress,
        data: {
          protected: {
            email: 'julien@unlock-protocol.com',
          },
        },
      })
      await notifyNewKeyToWedlocks({
        lock: {
          address: lockAddress,
        },
        owner: {
          address: ownerAddress,
        },
      })
      expect(fetch).toHaveBeenCalledWith('http://localhost:1337', {
        body: '{"template":"keyMined0xlock","failoverTemplate":"keyMined","recipient":"julien@unlock-protocol.com","params":{"keychainUrl":"https://app.unlock-protocol.com/keychain"},"attachments":[]}',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
    })

    it('should not notify wedlocks if there is no metadata', async () => {
      expect.assertions(1)

      const lockAddress = '0xanotherlock'
      const ownerAddress = '0xanotherowner'

      await notifyNewKeyToWedlocks({
        lock: {
          address: lockAddress,
        },
        owner: {
          address: ownerAddress,
        },
      })
      expect(fetch).not.toHaveBeenCalled()
    })

    it('should not notify wedlocks if there is no email metadata', async () => {
      expect.assertions(1)

      const lockAddress = '0xanotherlock'
      const ownerAddress = '0xanotherowner'

      await addMetadata({
        chain: 1,
        tokenAddress: lockAddress,
        userAddress: ownerAddress,
        data: {
          protected: {
            name: 'Julien',
          },
        },
      })

      await notifyNewKeyToWedlocks({
        lock: {
          address: lockAddress,
        },
        owner: {
          address: ownerAddress,
        },
      })
      expect(fetch).not.toHaveBeenCalled()
    })
  })

  describe('sendEmail', () => {
    it('should call the API with the right values', async () => {
      expect.assertions(1)
      await sendEmail(
        'template',
        'failover',
        'julien@unlock-protocol.com',
        { hello: 'world' },
        []
      )
      expect(fetch).toHaveBeenCalledWith('http://localhost:1337', {
        body: '{"template":"template","failoverTemplate":"failover","recipient":"julien@unlock-protocol.com","params":{"hello":"world"},"attachments":[]}',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
    })
  })
})
