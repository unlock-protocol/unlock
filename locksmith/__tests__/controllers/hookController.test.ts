import { networks } from '@unlock-protocol/networks'
import request from 'supertest'
import { Hook } from '../../src/models'
import {
  HookController,
  SubscribeRequest,
} from '../../src/controllers/hookController'

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

      const expiration3 = controller
        .getExpiration(controller.options.leaseSeconds.limit + 1)
        .getTime()

      const expectedExpiration3 = controller
        .getExpiration(controller.options.leaseSeconds.limit)
        .getTime()

      expect(expiration3).toBe(expectedExpiration3)
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

  describe('createHook', () => {
    it('should create a hook', async () => {
      expect.assertions(2)
      const spyOn = jest.spyOn(controller, 'createHook')
      spyOn.mockReturnValue(Promise.resolve(new Hook()))
      const value = await controller.createHook({} as any)
      expect(value).toBeInstanceOf(Hook)
      expect(spyOn).toHaveBeenCalled()
    })
  })

  describe('updateHook', () => {
    it("should update or create a hook if it doesn't exit", async () => {
      expect.assertions(9)

      const spyOn = jest
        .spyOn(controller, 'updateHook')
        .mockImplementation((req: SubscribeRequest) => {
          const hook = new Hook()
          const { network, lock } = req.params
          const { mode, topic, callback, lease_seconds } = req.body.hub
          hook.mode = mode
          hook.topic = topic
          hook.callback = callback
          hook.network = network
          hook.lock = lock
          hook.expiration = controller.getExpiration(lease_seconds)
          return Promise.resolve(hook)
        })

      const value = await controller.updateHook({
        params: {
          network: '1',
          lock: '424asd',
        },
        body: {
          hub: {
            mode: 'unsubscribe',
            topic: 'http://localhost:5000',
            callback: 'http://localhost:5000',
          },
        },
      } as SubscribeRequest)

      expect(value).toBeInstanceOf(Hook)
      expect(value.mode).toBe('unsubscribe')
      expect(value.topic).toBe('http://localhost:5000')
      expect(value.callback).toBe('http://localhost:5000')
      const expiration1 = value.expiration.getTime()
      const expiration2 = controller
        .getExpiration(controller.options.leaseSeconds.default)
        .getTime()
      expect(expiration1).toBeLessThanOrEqual(expiration2)

      expect(spyOn).toHaveBeenCalled()

      const value2 = await controller.updateHook({
        params: {
          network: '1',
          lock: '424asd',
        },
        body: {
          hub: {
            mode: 'subscribe',
            topic: 'http://localhost:5000',
            callback: 'http://localhost:5000',
            lease_seconds: 45000,
          },
        },
      } as SubscribeRequest)
      const expiration3 = value.expiration.getTime()
      const expiration4 = controller.getExpiration(45000).getTime()
      expect(value2).toBeInstanceOf(Hook)
      expect(value2.mode).toBe('subscribe')
      expect(expiration3).toBe(expiration4)
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
