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

      const lockAddress = '0x95de5F777A3e283bFf0c47374998E10D8A2183C7'
      const ownerAddress = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
      const lockName = 'Alice in Wonderland'

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
          name: lockName,
        },
        owner: {
          address: ownerAddress,
        },
      })
      expect(fetch).toHaveBeenCalledWith('http://localhost:1337', {
        body: '{"template":"keyMined0x95de5F777A3e283bFf0c47374998E10D8A2183C7","failoverTemplate":"keyMined","recipient":"julien@unlock-protocol.com","params":{"lockName":"","keychainUrl":"https://app.unlock-protocol.com/keychain","keyId":"","network":""},"attachments":[]}',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
    })

    it('should not notify wedlocks if there is no metadata', async () => {
      expect.assertions(1)

      const lockAddress = '0xb0Feb7BA761A31548FF1cDbEc08affa8FFA3e691'
      const ownerAddress = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
      const lockName = 'Alice in Wonderland'

      await notifyNewKeyToWedlocks({
        lock: {
          address: lockAddress,
          name: lockName,
        },
        owner: {
          address: ownerAddress,
        },
      })
      expect(fetch).not.toHaveBeenCalled()
    })

    it('should not notify wedlocks if there is no email metadata', async () => {
      expect.assertions(1)

      const lockAddress = '0xb0Feb7BA761A31548FF1cDbEc08affa8FFA3e691'
      const ownerAddress = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
      const lockName = 'Alice in Wonderland'

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
          name: lockName,
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
        {
          hello: 'world',
          keyId: '1',
          keychainUrl: 'test',
          lockName: 'lockName',
          network: 'Test',
        },
        []
      )
      expect(fetch).toHaveBeenCalledWith('http://localhost:1337', {
        body: '{"template":"template","failoverTemplate":"failover","recipient":"julien@unlock-protocol.com","params":{"hello":"world","keyId":"1","keychainUrl":"test","lockName":"lockName","network":"Test"},"attachments":[]}',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
    })
  })
})
