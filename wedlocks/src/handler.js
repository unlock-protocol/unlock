/* eslint no-console: 0 */
/* eslint import/prefer-default-export: 0 */
import { route } from './route'
import logger from '../logger'

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export const handler = (event, context, responseCallback) => {
  const callback = (err /** alway null! */, response) => {
    if (response.statusCode >= 400) {
      logger.error({
        event,
        response,
      })
    } else {
      logger.info({
        event,
        response,
      })
    }
    return responseCallback(err, {
      ...response,
      headers: {
        ...headers,
        ...response.headers,
      },
    })
  }

  if (event.httpMethod === 'OPTIONS') {
    return callback(null, {
      statusCode: 204,
    })
  }

  if (event.httpMethod !== 'POST') {
    return callback(null, {
      statusCode: 405,
      body: 'Unsupported Method',
    })
  }

  if (!event.headers || event.headers['content-type'] !== 'application/json') {
    return callback(null, {
      statusCode: 415,
      body: 'Unsupported Media Type',
    })
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch (e) {
    return callback(null, {
      statusCode: 422,
      body: 'Malformed Body',
    })
  }

  try {
    route(body, (error, response) => {
      if (error) {
        return callback(null, {
          statusCode: 400,
          body: 'Client Error',
          details: error.toString(),
        })
      }

      return callback(null, {
        statusCode: 204,
        details: response,
      })
    })
  } catch (error) {
    return callback(null, {
      statusCode: 500,
      body: 'Server Error',
      details: error.toString(),
    })
  }
}
