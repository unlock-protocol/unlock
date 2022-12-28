import { handler } from '../functions/handler/handler'
import { route } from '../route'
import { vi } from 'vitest'

vi.mock('../route')
vi.mock('handler')

describe('handler', () => {
  it('should render 204 if the method is OPTIONS', async () => {
    expect.assertions(1)
    const statusCode = await handler(
      {
        httpMethod: 'OPTIONS',
      },
      {},
      (error, response) => {
        if (error) {
          return Promise.reject(error)
        }
        return Promise.resolve(response.statusCode)
      }
    )
    expect(statusCode).toBe(204)
  })

  it('should render 405 if the method is not a POST', async () => {
    expect.assertions(2)
    const response = await handler(
      {
        httpMethod: 'GET',
      },
      {},
      (error, response) => {
        if (error) {
          return Promise.reject(error)
        }

        return Promise.resolve(response)
      }
    )
    expect(response.statusCode).toBe(405)
    expect(response.body).toBe('Unsupported Method')
  })

  it('should render 415 if there are no headers', async () => {
    expect.assertions(2)
    const response = await handler(
      {
        httpMethod: 'POST',
      },
      {},
      (error, response) => {
        if (error) {
          return Promise.reject(error)
        }
        return Promise.resolve(response)
      }
    )
    expect(response.statusCode).toBe(415)
    expect(response.body).toBe('Unsupported Media Type')
  })

  it('should render 415 if the content type is not json', async () => {
    expect.assertions(2)
    const response = await handler(
      {
        httpMethod: 'POST',
        headers: {
          'content-type': 'text/html',
        },
      },
      {},
      (error, response) => {
        if (error) {
          return Promise.reject(error)
        }
        return Promise.resolve(response)
      }
    )
    expect(response.statusCode).toBe(415)
    expect(response.body).toBe('Unsupported Media Type')
  })

  it('should render 422 if the body is malformed JSON', async () => {
    expect.assertions(2)
    const response = await handler(
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
          return Promise.reject(error)
        }
        return Promise.resolve(response)
      }
    )
    expect(response.statusCode).toBe(422)
    expect(response.body).toBe('Malformed Body')
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
          return Promise.reject(error)
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

    const response = await handler(
      {
        httpMethod: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      },
      {},
      (_error, response) => {
        return Promise.resolve(response)
      }
    )
    expect(response.statusCode).toBe(500)
    expect(response.body).toBe('Server Error')
  })

  it('should route the request and catch errors in response processing', async () => {
    expect.assertions(3)
    const body = {
      hello: 'world',
    }

    const error = new Error('Processing error')

    route.mockImplementationOnce((_body) => {
      expect(_body).toEqual(body)
      return Promise.reject(error)
    })

    const response = await handler(
      {
        httpMethod: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      },
      {},
      (_error, response) => {
        return Promise.resolve(response)
      }
    )
    expect(response.statusCode).toBe(500)
    expect(response.body).toBe('Server Error') // We do not show the actual error to users
  })
})
