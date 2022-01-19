import { networks } from '@unlock-protocol/networks'
import request from 'supertest'
import { HookController } from '../../src/controllers/hookController'

const app = require('../../src/app')

describe('HookController', () => {
  const controller = new HookController({
    leaseSeconds: {
      limit: 864000 * 9,
      default: 864000,
    },
  })
  describe('Utilities in HookController', () => {
    it('getExpiration', () => {
      expect.assertions(3)

      const expiration = controller.getExpiration().getTime()
      const expectedExpiration = new Date(Date.now() + 864000 * 1000).getTime()
      expect(expiration).toBe(expectedExpiration)

      const expiration2 = controller
        .getExpiration(controller.options.leaseSeconds.limit)
        .getTime()

      const expectedExpiration2 = new Date(
        Date.now() + controller.options.leaseSeconds.limit * 1000
      ).getTime()

      expect(expiration2).toBe(expectedExpiration2)

      expect(() => {
        controller.getExpiration(controller.options.leaseSeconds.limit + 1)
      }).toBe(controller.options.leaseSeconds.limit)
    })

    it('getLeaseSeconds', () => {
      expect.assertions(2)

      const leaseSeconds = controller.getLeaseSeconds()
      expect(leaseSeconds).toBe(controller.options.leaseSeconds.default)

      const leaseSeconds2 = controller.getLeaseSeconds(
        controller.options.leaseSeconds.limit
      )
      expect(leaseSeconds2).toBe(controller.options.leaseSeconds.limit)
    })

    it('getNetwork', () => {
      expect.assertions(2)
      expect(controller.getNetwork('1')).toBe(networks['1'])
      expect(controller.getNetwork('24242')).toBe(undefined)
    })
  })

  describe('hookController Endpoints', () => {
    it('Subscribe endpoint', async () => {
      expect.assertions(4)
      const response = await request(app)
        .post('/api/hooks/4/locks')
        .set('Accept', 'json')
        .send({
          hub: {
            topic: 'http://localhost:4000/api/hooks/4/locks',
            callback: 'http://localhost:4000/callback',
            mode: 'subscribe',
          },
        })

      expect(response.text).toBe('Accepted')

      const response2 = await request(app)
        .post('/api/hooks/7424782/locks')
        .set('Accept', 'json')
        .send({
          hub: {
            topic: 'http://localhost:4000/api/hooks/4/locks',
            callback: 'http://localhost:4000/callback',
            mode: 'subscribe',
          },
        })

      expect(response2.status).toBe(404)
      expect(response2.text).toBe('Unsupported Network')

      const response3 = await request(app)
        .post('/api/hooks/4/locks')
        .set('Accept', 'json')
        .send({
          hub: {
            topic: 'http://localhost:4000/api/hooks/4/locks',
            // Missing fields
          },
        })
      expect(response3.status).toBe(400)
    })
  })
})
