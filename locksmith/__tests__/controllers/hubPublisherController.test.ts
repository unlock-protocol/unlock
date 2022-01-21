import request from 'supertest'
// import { HubPublisherController } from '../../src/controllers/hubPublisherController'

const app = require('../../src/app')

describe('HubPublisherController', () => {
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

  // describe('HubPublisherController Methods', () => {
  //   const controller = new HubPublisherController()
  //   it('template function working', () => {
  //     expect.assertions(1)
  //     const value = controller.template({
  //       links: [{ rel: 'self', href: 'http://localhost:5000' }],
  //     })

  //     expect(typeof value).toBe('string')
  //   })
  // })
})
