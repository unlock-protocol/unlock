import { networks } from '@unlock-protocol/networks'
import request from 'supertest'

import {
  getExpiration,
  getSupportedNetwork,
  EXPIRATION_SECONDS_LIMIT,
} from '../../src/controllers/hookController'

const app = require('../../src/app')

describe('HookController', () => {
  describe('Utilities in HookController', () => {
    it('getExpiration', () => {
      expect.assertions(3)

      const expiration = getExpiration().getTime()
      const expectedExpiration = new Date(Date.now() + 864000 * 1000).getTime()
      expect(expiration).toBe(expectedExpiration)

      const expiration2 = getExpiration(EXPIRATION_SECONDS_LIMIT).getTime()
      const expectedExpiration2 = new Date(
        Date.now() + EXPIRATION_SECONDS_LIMIT * 1000
      ).getTime()

      expect(expiration2).toBe(expectedExpiration2)

      expect(() => {
        getExpiration(EXPIRATION_SECONDS_LIMIT + 1)
      }).toThrow("Lease seconds can't be greater than 90 days")
    })

    it('getSupportedNetwork', () => {
      expect.assertions(2)
      expect(getSupportedNetwork('1')).toBe(networks['1'])
      expect(getSupportedNetwork('24242')).toBe(undefined)
    })
  })

  describe('Hook publisher endpoints', () => {
    it('Check if returning the hubs in a head request', async () => {
      expect.assertions(2)
      const response = await request(app).head('/api/hooks/4/locks')
      expect(response.status).toBe(200)
      expect(response.headers.link.split(',').length).toBe(2)
    })

    it('Check if returning the hubs in a get request', async () => {
      expect.assertions(3)
      const response = await request(app).get('/api/hooks/4/locks')
      expect(response.status).toBe(200)
      expect(response.headers.link.split(',').length).toBe(2)
      expect(response.headers['content-type']).toBe('text/html; charset=utf-8')
    })
  })
})
