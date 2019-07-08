import request from 'supertest'

const app = require('../../src/app')

describe('Metadata Controller', () => {
  describe('the data stub', () => {
    it('returns wellformed stub data', async () => {
      expect.assertions(2)

      let response = await request(app)
        .get('/api/key/0x5543625f4581af4754204e452e72a65708708bc2/1')
        .set('Accept', 'json')

      expect(response.status).toBe(200)

      expect(response.body).toEqual(
        expect.objectContaining({
          description: expect.any(String),
          image: expect.any(String),
          name: expect.any(String),
        })
      )
    })

    it('returns wellformed data for Week in Ethereum News', async () => {
      expect.assertions(2)

      let response = await request(app)
        .get('/api/key/0x95de5F777A3e283bFf0c47374998E10D8A2183C7/1')
        .set('Accept', 'json')

      expect(response.status).toBe(200)

      expect(response.body).toEqual(
        expect.objectContaining({
          description:
            "A Key to the 'Week in Ethereum News' lock. Unlock protocol for memberships. https://unlock-protocol.com/",
          image:
            'https://assets.unlock-protocol.com/unlock-default-key-image.png',
          name: 'Unlock Key to Week in Ethereum News',
        })
      )
    })
  })
})
