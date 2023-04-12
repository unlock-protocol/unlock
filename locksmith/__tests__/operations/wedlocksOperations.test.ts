import { addMetadata } from '../../src/operations/userMetadataOperations'
import {
  sendEmail,
  notifyNewKeyToWedlocks,
  getCustomTemplate,
  getTemplates,
} from '../../src/operations/wedlocksOperations'
import { vi, expect } from 'vitest'
import app from '../app'
import request from 'supertest'
import { loginRandomUser } from '../test-helpers/utils'

const lockAddressMock = '0x8D33b257bce083eE0c7504C7635D1840b3858AFD'
const network = 80001

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

vi.mock('../../src/operations/userMetadataOperations.ts', async () => {
  const actual: any = await vi.importActual(
    '../../src/operations/userMetadataOperations.ts'
  )
  return {
    ...actual,
    getLockMetadata: async () =>
      Promise.resolve({
        chain: network,
        data: {},
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
        chain: network,
        tokenAddress: lockAddress,
        userAddress: ownerAddress,
        data: {
          protected: {
            email: 'julien@unlock-protocol.com',
          },
        },
      })
      await notifyNewKeyToWedlocks(
        {
          lock: {
            address: lockAddress,
            name: lockName,
          },
          owner: ownerAddress,
          manager: ownerAddress,
        },
        network
      )
      const transferUrl = `${[
        process.env.UNLOCK_ENV !== 'prod'
          ? 'https://staging-app.unlock-protocol.com'
          : 'https://app.unlock-protocol.com',
      ]}/transfer?lockAddress=0x95de5F777A3e283bFf0c47374998E10D8A2183C7&keyId=&network=${network}`

      expect(fetch).toHaveBeenCalledWith('http://localhost:1337', {
        body: `{"template":"keyMined0x95de5F777A3e283bFf0c47374998E10D8A2183C7","failoverTemplate":"keyMined","recipient":"julien@unlock-protocol.com","params":{"lockAddress":"0x95de5F777A3e283bFf0c47374998E10D8A2183C7","lockName":"Alice in Wonderland","keychainUrl":"https://app.unlock-protocol.com/keychain","keyId":"","network":"Mumbai (Polygon)","transferUrl":"${transferUrl}"},"attachments":[]}`,
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
    })

    it('should not notify wedlocks if there is no metadata', async () => {
      expect.assertions(1)

      const lockAddress = '0xb0Feb7BA761A31548FF1cDbEc08affa8FFA3e691'
      const ownerAddress = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
      const lockName = 'Alice in Wonderland'

      await notifyNewKeyToWedlocks(
        {
          lock: {
            address: lockAddress,
            name: lockName,
          },
          manager: ownerAddress,
          owner: ownerAddress,
        },
        network
      )
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

      await notifyNewKeyToWedlocks(
        {
          lock: {
            address: lockAddress,
            name: lockName,
          },
          owner: ownerAddress,
          manager: ownerAddress,
        },
        network
      )
      expect(fetch).not.toHaveBeenCalled()
    })
  })

  describe('sendEmail', () => {
    it('should call the API with the right values', async () => {
      expect.assertions(1)
      await sendEmail({
        network: 4,
        template: 'template',
        failoverTemplate: 'failover',
        recipient: 'julien@unlock-protocol.com',
        params: {
          hello: 'world',
          keyId: '1',
          keychainUrl: 'test',
          lockName: 'lockName',
          network: 'Test',
          lockAddress: lockAddressMock,
        },
        attachments: [],
      })

      expect(fetch).toHaveBeenCalledWith('http://localhost:1337', {
        body: '{"template":"template","failoverTemplate":"failover","recipient":"julien@unlock-protocol.com","params":{"hello":"world","keyId":"1","keychainUrl":"test","lockName":"lockName","network":"Test","lockAddress":"0x8D33b257bce083eE0c7504C7635D1840b3858AFD"},"attachments":[]}',
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

    it('Correctly get default email templates', () => {
      expect.assertions(6)

      const defaultTemplate = {
        types: {
          isEvent: false,
          isCertification: false,
          isStamp: false,
        },
        isAirdropped: false,
      }

      const defaultTemplateAirdropped = {
        types: {
          isEvent: false,
          isCertification: false,
          isStamp: false,
        },
        isAirdropped: true,
      }

      expect(getCustomTemplate(defaultTemplate)).toBe('keyMined')
      expect(getCustomTemplate(defaultTemplateAirdropped)).toBe('keyAirdropped')

      expect(getTemplates(defaultTemplate)).toStrictEqual([
        'keyMined',
        'keyMined',
      ])

      expect(getTemplates(defaultTemplateAirdropped)).toStrictEqual([
        'keyAirdropped',
        'keyAirdropped',
      ])

      expect(
        getTemplates({
          ...defaultTemplate,
          lockAddress: '0x123',
        })
      ).toStrictEqual(['keyMined0x123', 'keyMined'])

      expect(
        getTemplates({
          ...defaultTemplateAirdropped,
          lockAddress: '0x123',
        })
      ).toStrictEqual(['keyAirdropped0x123', 'keyAirdropped'])
    })

    it('Correctly get event email templates', () => {
      expect.assertions(6)

      const eventTemplate = {
        types: {
          isEvent: true,
          isCertification: false,
          isStamp: false,
        },
        isAirdropped: false,
      }

      const eventTemplateAirdropped = {
        types: {
          isEvent: true,
          isCertification: false,
          isStamp: false,
        },
        isAirdropped: true,
      }

      expect(getCustomTemplate(eventTemplate)).toBe('eventKeyMined')
      expect(getCustomTemplate(eventTemplateAirdropped)).toBe(
        'eventKeyAirdropped'
      )

      expect(getTemplates(eventTemplate)).toStrictEqual([
        'eventKeyMined',
        'eventKeyMined',
      ])

      expect(getTemplates(eventTemplateAirdropped)).toStrictEqual([
        'eventKeyAirdropped',
        'eventKeyAirdropped',
      ])

      expect(
        getTemplates({
          ...eventTemplate,
          lockAddress: '0x123',
        })
      ).toStrictEqual(['eventKeyMined0x123', 'eventKeyMined'])

      expect(
        getTemplates({
          ...eventTemplateAirdropped,
          lockAddress: '0x123',
        })
      ).toStrictEqual(['eventKeyAirdropped0x123', 'eventKeyAirdropped'])
    })

    it('Correctly get certification email templates', () => {
      expect.assertions(6)
      const certificationTemplate = {
        types: {
          isEvent: false,
          isCertification: true,
          isStamp: false,
        },
        isAirdropped: false,
      }

      const certificationAirdropped = {
        types: {
          isEvent: false,
          isCertification: true,
          isStamp: false,
        },
        isAirdropped: true,
      }

      expect(getCustomTemplate(certificationTemplate)).toBe(
        'certificationKeyMined'
      )
      expect(getCustomTemplate(certificationAirdropped)).toBe(
        'certificationKeyAirdropped'
      )

      expect(getTemplates(certificationTemplate)).toStrictEqual([
        'certificationKeyMined',
        'certificationKeyMined',
      ])

      expect(getTemplates(certificationAirdropped)).toStrictEqual([
        'certificationKeyAirdropped',
        'certificationKeyAirdropped',
      ])

      expect(
        getTemplates({
          ...certificationTemplate,
          lockAddress: '0x123',
        })
      ).toStrictEqual(['certificationKeyMined0x123', 'certificationKeyMined'])

      expect(
        getTemplates({
          ...certificationAirdropped,
          lockAddress: '0x123',
        })
      ).toStrictEqual([
        'certificationKeyAirdropped0x123',
        'certificationKeyAirdropped',
      ])
    })
  })
})
