import { handler } from '../functions/handler/handler'
import { route } from '../route'
import { vi } from 'vitest'

vi.mock('../route')
vi.mock('handler')

describe('handler', () => {
  it('should render 204 if the method is OPTIONS', () => {
    expect.assertions(1)
    handler(
      {
        httpMethod: 'OPTIONS',
      },
      {},
      (error, response) => {
        if (error) {
          throw error
        }
        expect(response.statusCode).toBe(204)
        new Promise((done) => {
          done()
        })
      }
    )
  })

  it('should render 405 if the method is not a POST', () => {
    expect.assertions(2)
    handler(
      {
        httpMethod: 'GET',
      },
      {},
      (error, response) => {
        if (error) {
          throw error
        }
        expect(response.statusCode).toBe(405)
        expect(response.body).toBe('Unsupported Method')
        new Promise((done) => {
          done()
        })
      }
    )
  })

  it('should render 415 if there are no headers', () => {
    expect.assertions(2)
    handler(
      {
        httpMethod: 'POST',
      },
      {},
      (error, response) => {
        if (error) {
          throw error
        }
        expect(response.statusCode).toBe(415)
        expect(response.body).toBe('Unsupported Media Type')
        new Promise((done) => {
          done()
        })
      }
    )
  })

  it('should render 415 if the content type is not json', () => {
    expect.assertions(2)
    handler(
      {
        httpMethod: 'POST',
        headers: {
          'content-type': 'text/html',
        },
      },
      {},
      (error, response) => {
        if (error) {
          throw error
        }
        expect(response.statusCode).toBe(415)
        expect(response.body).toBe('Unsupported Media Type')
        new Promise((done) => {
          done()
        })
      }
    )
  })

  it('should render 422 if the body is malformed JSON', () => {
    expect.assertions(2)
    handler(
      {
        httpMethod: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: 'hello world',
      },
      {},
      (error, response) => {
        if (error) {
          throw error
        }
        expect(response.statusCode).toBe(422)
        expect(response.body).toBe('Malformed Body')
        new Promise((done) => {
          done()
        })
      }
    )
  })

  it('should route the request and yields its response', async () => {
    expect.assertions(4)
    const body = {
      hello: 'world',
    }
    const responseBody = {
      lorem: 'ipsum',
    }
    route.mockImplementationOnce((_body) => {
      expect(_body).toEqual(body)
      return Promise.resolve(responseBody)
    })

    await handler(
      {
        httpMethod: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      },
      {},
      (error, response) => {
        if (error) {
          throw error
        }
        expect(response.headers).toEqual(
          expect.objectContaining({
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
          })
        )
        expect(response.statusCode).toBe(204)
        expect(response.body).toBe(undefined)
      }
    )
  })

  it('should route the request and yields its response when it is an error', async () => {
    expect.assertions(3)
    const body = {
      hello: 'world',
    }
    const error = 'Could not send email'
    route.mockImplementationOnce((_body) => {
      expect(_body).toEqual(body)
      return Promise.reject(error)
    })

    await handler(
      {
        httpMethod: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      },
      {},
      (_error, response) => {
        expect(response.statusCode).toBe(500)
        expect(response.body).toBe('Server Error')
        new Promise((done) => {
          done()
        })
      }
    )
  })

  it('should route the request and catch errors in response processing', () => {
    expect.assertions(3)
    const body = {
      hello: 'world',
    }

    const error = new Error('Processing error')

    route.mockImplementationOnce((_body) => {
      expect(_body).toEqual(body)
      throw error
    })

    handler(
      {
        httpMethod: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      },
      {},
      (_error, response) => {
        expect(response.statusCode).toBe(500)
        expect(response.body).toBe('Server Error') // We do not show the actual error to users
        new Promise((done) => {
          done()
        })
      }
    )
  })
})
