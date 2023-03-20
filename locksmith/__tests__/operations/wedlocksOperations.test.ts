import { addMetadata } from '../../src/operations/userMetadataOperations'
import {
  sendEmail,
  notifyNewKeyToWedlocks,
} from '../../src/operations/wedlocksOperations'
import { vi, describe, expect, it, afterEach } from 'vitest'
import app from '../app'
import request from 'supertest'
import { loginRandomUser } from '../test-helpers/utils'

const lockAddressMock = '0x8D33b257bce083eE0c7504C7635D1840b3858AFD'

vi.mock('@unlock-protocol/unlock-js', async () => {
  const actual: any = await vi.importActual('@unlock-protocol/unlock-js')
  return {
    ...actual,
    Web3Service: vi.fn().mockImplementation(() => {
      return {
        isLockManager: (lock: string) => lockAddressMock === lock,
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

    it('Correctly save and retrieve', async () => {
      expect.assertions(2)
      const network = 5
      const template = 'keyMined'

      const { loginResponse } = await loginRandomUser(app)
      expect(loginResponse.status).toBe(200)

      const url = `/v2/email/${network}/locks/${lockAddressMock}/custom/${template}`

      // save custom content
      const res = await request(app)
        .post(url)
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send({ content: '## Test custom content markdown' })

      // check that custom content exists
      const customContent = await request(app)
        .get(url)
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

      expect(customContent.body.content).toBe('## Test custom content markdown')
    })

    it('Custom content can not be retrieved when is not stored', async () => {
      expect.assertions(3)
      const network = 5
      const template = 'RandomTemplate'

      const { loginResponse } = await loginRandomUser(app)
      expect(loginResponse.status).toBe(200)

      const url = `/v2/email/${network}/locks/${lockAddressMock}/custom/${template}`

      // check that custom content exists
      const customContent = await request(app)
        .get(url)
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

      expect(customContent.status).toBe(404)
      expect(customContent.body.content).toBe(undefined)
    })
  })
})
