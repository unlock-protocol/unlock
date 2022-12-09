import request from 'supertest'
import app from '../server'

describe('HubPublisherController', () => {
  describe('Hook publisher endpoints', () => {
    it('Check if returning the hubs in a head request', async () => {
      expect.assertions(2)
      const response = await request(app).head('/api/hooks/1/locks')
      expect(response.status).toBe(200)
      expect(response.headers.link.split(',').length).toBe(2)
    })

    it('Check if returning the hubs in a get request', async () => {
      expect.assertions(3)
      const response = await request(app).get('/api/hooks/1/locks')
      expect(response.status).toBe(200)
      expect(response.headers.link.split(',').length).toBe(2)
      expect(response.headers['content-type']).toBe('text/html; charset=utf-8')
    })

    it('Should error if not found network', async () => {
      expect.assertions(1)
      const response = await request(app).get('/api/hooks/2435/locks')
      expect(response.status).toBe(404)
    })
  })
})
