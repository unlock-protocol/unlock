import request from 'supertest'
import { loginRandomUser } from '../../test-helpers/utils'
import { KeyManager } from '@unlock-protocol/unlock-js'

import app from '../../app'
import { Rsvp } from '../../../src/models'
import { vi } from 'vitest'

const lockAddress = '0x62CcB13A72E6F991dE53b9B7AC42885151588Cd2'
const userAddress = '0x81Dd955D02D337DB81BA6c9C5F6213E647672052'
const network = 10

// eslint-disable-next-line
var mockWeb3Service = {
  isLockManager: vi.fn(() => Promise.resolve(false)),
}

vi.mock('@unlock-protocol/unlock-js', () => ({
  Web3Service: function Web3Service() {
    return mockWeb3Service
  },
  KeyManager: function KeyManager() {
    return {
      createTransferAddress: (params: any) =>
        '0x9d3ea9e9adde71141f4534dB3b9B80dF3D03Ee5f',
    }
  },
}))

describe('RSVP', () => {
  beforeEach(async () => {
    await Rsvp.truncate()
  })

  describe('rsvp', () => {
    it('stores the RSVP in the right table', async () => {
      expect.assertions(5)
      const response = await request(app)
        .post(`/v2/rsvp/${network}/${lockAddress}/`)
        .send({
          recipient: userAddress,
          data: {
            email: 'julien@unlock-protocol.com',
            fullname: 'Julien Genestoux',
          },
        })

      expect(response.status).toBe(200)
      expect(response.body.lockAddress).toEqual(lockAddress)
      expect(response.body.userAddress).toEqual(userAddress)
      expect(response.body.approval).toEqual('pending')
      expect(response.body.network).toEqual(10)
    })

    it('stores the RSVP in the right table even if there is no wallet', async () => {
      expect.assertions(3)
      const response = await request(app)
        .post(`/v2/rsvp/${network}/${lockAddress}/`)
        .send({
          data: {
            email: 'julien@unlock-protocol.com',
            fullname: 'Julien Genestoux',
          },
        })

      expect(response.status).toBe(200)
      expect(response.body.approval).toBe('pending')
      expect(response.body.userAddress).toEqual(
        '0x9d3ea9e9adde71141f4534dB3b9B80dF3D03Ee5f'
      )
    })

    it('does not override the state of an approved participant', async () => {
      expect.assertions(4)
      const response = await request(app)
        .post(`/v2/rsvp/${network}/${lockAddress}/`)
        .send({
          data: {
            email: 'ccarfi@unlock-protocol.com',
            fullname: 'Chris Carfi',
          },
        })

      expect(response.status).toBe(200)
      expect(response.body.approval).toEqual('pending')

      const rsvp = await Rsvp.findOne({
        where: {
          userAddress: response.body.userAddress,
          lockAddress: response.body.lockAddress,
          network: response.body.network,
        },
      })
      expect(rsvp!.approval).toEqual('pending')
      rsvp!.approval = 'approved'
      await rsvp?.save()
      const responseAfterUpdate = await request(app)
        .post(`/v2/rsvp/${network}/${lockAddress}/`)
        .send({
          data: {
            email: 'ccarfi@unlock-protocol.com',
            fullname: 'Chris Carfi',
          },
        })
      expect(responseAfterUpdate.body.approval).toEqual('approved')
    })
  })

  describe('approval/denials', () => {
    beforeEach(async () => {
      // CReate an RSVP
      await Rsvp.create({
        network,
        userAddress,
        lockAddress,
        approval: 'pending',
      })
    })

    it('should require the user to be authenticated', async () => {
      expect.assertions(1)
      const response = await request(app).post(
        `/v2/rsvp/${network}/${lockAddress}/approve/${userAddress}`
      )
      expect(response.status).toBe(401)
    })

    it('should require the user to be authenticated as a lock manager', async () => {
      expect.assertions(2)
      const { loginResponse } = await loginRandomUser(app)
      expect(loginResponse.status).toBe(200)

      const response = await request(app)
        .post(`/v2/rsvp/${network}/${lockAddress}/approve/${userAddress}`)
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

      expect(response.status).toBe(403)
    })

    it('should change the RSVP approval when approved by a lock manager', async () => {
      expect.assertions(3)
      const { loginResponse } = await loginRandomUser(app)
      expect(loginResponse.status).toBe(200)
      mockWeb3Service.isLockManager = vi.fn(() => Promise.resolve(true))

      const response = await request(app)
        .post(`/v2/rsvp/${network}/${lockAddress}/approve/${userAddress}`)
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body.approval).toEqual('approved')
    })

    it('should change the RSVP approval when denied by a lock manager', async () => {
      expect.assertions(3)
      const { loginResponse } = await loginRandomUser(app)
      expect(loginResponse.status).toBe(200)
      mockWeb3Service.isLockManager = vi.fn(() => Promise.resolve(true))

      const response = await request(app)
        .post(`/v2/rsvp/${network}/${lockAddress}/deny/${userAddress}`)
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body.approval).toEqual('denied')
    })
  })

  describe('bulk approval/denials', () => {
    const userAddress2 = '0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97'

    beforeEach(async () => {
      // Create an RSVP
      await Rsvp.create({
        network,
        userAddress,
        lockAddress,
        approval: 'pending',
      })
      // Create another RSVP
      await Rsvp.create({
        network,
        userAddress: userAddress2,
        lockAddress,
        approval: 'pending',
      })
    })

    it('should require the user to be authenticated', async () => {
      expect.assertions(1)
      const response = await request(app)
        .post(`/v2/rsvp/${network}/${lockAddress}/approve`)
        .type('json')
        .send({
          recipients: [userAddress, userAddress2],
        })
      expect(response.status).toBe(401)
    })

    it('should require the user to be authenticated as a lock manager', async () => {
      expect.assertions(2)
      const { loginResponse } = await loginRandomUser(app)
      expect(loginResponse.status).toBe(200)
      mockWeb3Service.isLockManager = vi.fn(() => Promise.resolve(false))

      const response = await request(app)
        .post(`/v2/rsvp/${network}/${lockAddress}/approve`)
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
        .type('json')
        .send({
          recipients: [userAddress, userAddress2],
        })

      expect(response.status).toBe(403)
    })

    it('should change the RSVP approval when approved by a lock manager', async () => {
      expect.assertions(4)
      const { loginResponse } = await loginRandomUser(app)
      expect(loginResponse.status).toBe(200)
      mockWeb3Service.isLockManager = vi.fn(() => Promise.resolve(true))

      const response = await request(app)
        .post(`/v2/rsvp/${network}/${lockAddress}/approve`)
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
        .type('json')
        .send({
          recipients: [userAddress, userAddress2],
        })

      expect(response.status).toBe(200)
      expect(response.body.results.length).toEqual(2)
      expect(response.body.results[0].approval).toEqual('approved')
    })

    it('should change the RSVP approval when denied by a lock manager', async () => {
      expect.assertions(4)
      const { loginResponse } = await loginRandomUser(app)
      expect(loginResponse.status).toBe(200)
      mockWeb3Service.isLockManager = vi.fn(() => Promise.resolve(true))

      const response = await request(app)
        .post(`/v2/rsvp/${network}/${lockAddress}/deny`)
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
        .type('json')
        .send({
          recipients: [userAddress, userAddress2],
        })

      expect(response.status).toBe(200)
      expect(response.body.results.length).toEqual(2)
      expect(response.body.results[0].approval).toEqual('denied')
    })
  })
})
