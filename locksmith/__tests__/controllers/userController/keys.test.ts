import request from 'supertest'

import app = require('../../../src/app')

jest.mock('../../../src/utils/ownedKeys', () => {
  return {
    keys: jest
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(['0x1234'])
      .mockResolvedValueOnce(['0x1234']),
  }
})

describe("requesting a user's keys", () => {
  describe('when the address owns 0 keys', () => {
    it('returns 200', async () => {
      expect.assertions(1)
      let response = await request(app).get(
        '/users/0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2/keys'
      )
      expect(response.status).toBe(200)
    })

    it('returns []', async () => {
      expect.assertions(1)
      let response = await request(app).get(
        '/users/0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2/keys'
      )
      expect(response.body).toEqual([])
    })
  })

  describe('when the address owns key(s)', () => {
    it('returns 200', async () => {
      expect.assertions(1)
      let response = await request(app).get(
        '/users/0xc66ef2e0d0edcce723b3fdd4307db6c5f0dda1b8/keys'
      )
      expect(response.status).toBe(200)
    })

    it('returns the keys', async () => {
      expect.assertions(1)
      let response = await request(app).get(
        '/users/0xc66ef2e0d0edcce723b3fdd4307db6c5f0dda1b8/keys'
      )
      expect(response.body).toEqual(['0x1234'])
    })
  })
})
