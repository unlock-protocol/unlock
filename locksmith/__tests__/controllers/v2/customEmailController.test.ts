import request from 'supertest'
import { loginRandomUser } from '../../test-helpers/utils'
import app from '../../app'
import { vi } from 'vitest'
import { saveEvent } from '../../../src/operations/eventOperations'

let lockAddress = '0x62CcB13A72E6F991dE53b9B7AC42885151588Cd2'
const template = 'keyMinded'

const network = 10
const customEmailContent = `Custom Email Content`

vi.mock('@unlock-protocol/unlock-js', () => {
  return {
    Web3Service: vi.fn().mockImplementation(() => {
      return {
        isLockManager: (lock: string, manager: string) => {
          return lockAddress.toLowerCase() === lock.toLowerCase()
        },
      }
    }),
  }
})

describe('Email Controller v2', () => {
  it('Save custom email throws an error when is not authenticated', async () => {
    expect.assertions(2)
    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const response = await request(app).post(
      `/v2/email/${network}/locks/${lockAddress}/custom/${template}`
    )

    expect(response.status).toBe(401)
  })

  it('Get custom email throws an error when is not authenticated', async () => {
    expect.assertions(2)
    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const response = await request(app).get(
      `/v2/email/${network}/locks/${lockAddress}/custom/${template}`
    )

    expect(response.status).toBe(401)
  })

  it('Correctly save email custom content when user is lock manager', async () => {
    expect.assertions(3)
    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .post(`/v2/email/${network}/locks/${lockAddress}/custom/${template}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({
        content: customEmailContent,
      })

    expect(response.status).toBe(200)
    expect(response.body.content).toContain('Custom Email Content')
  })

  it('Get saved details from not lock manager fails', async () => {
    expect.assertions(2)
    const { loginResponse, address } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    // save custom email content
    await request(app)
      .post(`/v2/email/${network}/locks/${lockAddress}/custom/${template}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({
        content: customEmailContent,
      })

    // get for non-lock manager should fail
    lockAddress = address
    const response = await request(app)
      .get(`/v2/email/${network}/locks/${lockAddress}/custom/${template}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(response.status).toBe(404)
  })

  it('Correctly save and get custom email content saved for lock manager', async () => {
    expect.assertions(3)
    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    // save custom content for a specific template
    await request(app)
      .post(`/v2/email/${network}/locks/${lockAddress}/custom/${template}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({
        content: customEmailContent,
      })

    // check if the custom content saved is present
    const response = await request(app)
      .get(`/v2/email/${network}/locks/${lockAddress}/custom/${template}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(response.status).toBe(200)
    expect(response.body.content).toContain('Custom Email Content')
  })

  describe('sendEventInvite', async () => {
    it('should return 404 if the event does not exist', async () => {
      expect.assertions(3)
      const { loginResponse } = await loginRandomUser(app)
      expect(loginResponse.status).toBe(200)

      // save custom content for a specific template
      const response = await request(app)
        .post(`/v2/email/party/invite`)
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send({
          recipients: ['hello@unlock-protocol.com', 'hi@unlock-protocol.com'],
        })
      expect(response.status).toBe(404)
      expect(response.body.message).to.equal('No such event')
    })

    it.only('should return 401 if the user is not an event organizer', async () => {
      const { loginResponse } = await loginRandomUser(app)
      expect(loginResponse.status).toBe(200)

      const eventParams = {
        data: {
          name: 'An Event',
          image: 'https://host.tld/image.jpg',
          attributes: [
            { trait_type: 'event_start_date', value: '2024-05-22' },
            { trait_type: 'event_start_time', value: '08:30' },
            { trait_type: 'event_end_date', value: '2024-05-22' },
            { trait_type: 'event_end_time', value: '14:00' },
            { trait_type: 'event_timezone', value: 'America/New_York' },
            {
              trait_type: 'event_address',
              value: '29 Little W 12th St, New York, NY 10014, USA',
            },
          ],
          description: 'An Event',
          ticket: {
            event_start_date: '2024-05-22',
            event_start_time: '08:30',
            event_end_date: '2024-05-22',
            event_end_time: '14:00',
            event_timezone: 'America/New_York',
            event_address: '29 Little W 12th St, New York, NY 10014, USA',
          },
          requiresApproval: false,
          emailSender: 'Julien Genestoux',
          replyTo: 'julien@unlock-protocol.com',
        },
        checkoutConfig: {
          config: {
            locks: {
              [lockAddress]: {
                network,
              },
            },
          },
        },
      }
      const [{ slug }] = await saveEvent(
        eventParams,
        loginResponse.body.walletAddress
      )

      const response = await request(app)
        .post(`/v2/email/${slug}/invite`)
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send({
          recipients: ['hello@unlock-protocol.com', 'hi@unlock-protocol.com'],
        })

      console.log(response)
    })

    it('should send an event invite to all recipients passed as an array', async () => {})
  })
})
