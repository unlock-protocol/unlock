import { handler } from '../handler'

describe('handler', () => {
  it('should yield hello world', done => {
    handler({}, {}, (error, response) => {
      expect.assertions(2)
      expect(response.statusCode).toBe(200)
      expect(response.body).toBe('Hello, World')
      done()
    })
  })
})
