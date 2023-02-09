import { addMetadata } from '../../src/operations/userMetadataOperations'
import {
  sendEmail,
  notifyNewKeyToWedlocks,
  getCustomContent,
} from '../../src/operations/wedlocksOperations'
import { vi } from 'vitest'
import normalizer from '../../src/utils/normalizer'

vi.mock('@unlock-protocol/unlock-js', () => {
  return {
    LocksmithService: vi.fn().mockImplementation(() => {
      return {
        getCustomEmailContent: (_lockAddress, _network, _template) => {
          return {
            // mock MARKDOWN
            data: {
              content: '## Test custom content markdown',
            },
          }
        },
      }
    }),
  }
})
describe('Wedlocks operations', () => {
  afterEach(() => {
    vi.clearAllMocks()
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
        owner: ownerAddress,
      })
      const transferUrl = `${[
        process.env.UNLOCK_ENV !== 'prod'
          ? 'https://staging-app.unlock-protocol.com'
          : 'https://app.unlock-protocol.com',
      ]}/transfer?lockAddress=0x95de5F777A3e283bFf0c47374998E10D8A2183C7&keyId=&network=`

      expect(fetch).toHaveBeenCalledWith('http://localhost:1337', {
        body: `{"template":"keyMined0x95de5F777A3e283bFf0c47374998E10D8A2183C7","failoverTemplate":"keyMined","recipient":"julien@unlock-protocol.com","params":{"lockName":"Alice in Wonderland","keychainUrl":"https://app.unlock-protocol.com/keychain","keyId":"","network":"","transferUrl":"${transferUrl}"},"attachments":[]}`,
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
        owner: ownerAddress,
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
        owner: ownerAddress,
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

    it('Correctly converts Markdown to HTML', async () => {
      expect.assertions(1)
      const html = await getCustomContent('0x', 5, 'template')
      expect(html).toBe(
        '<h2 id="testcustomcontentmarkdown">Test custom content markdown</h2>'
      )
    })
  })
})
