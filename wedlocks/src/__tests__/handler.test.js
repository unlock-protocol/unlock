import handler from '../handler'

describe('handler', () => {
  it('should yield hello world', done => {
    handler({}, {}, (error, message) => {
      expect(message).toBe('Hello World')
      done()
    })
  })
})
