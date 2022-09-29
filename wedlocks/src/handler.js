import { route, preview } from './route'
import logger from '../logger'

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export const handler = async (event, context, responseCallback) => {
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

  let match = event?.url?.pathname?.match(/\/preview\/([a-zA-Z0-9]+)/)
  if (event.httpMethod === 'GET' && match && match[0]) {
    const body = await preview({
      template: match[1],
      params: Object.fromEntries(event?.url?.searchParams)
    })
    return callback(null, {
      statusCode: 200,
      body,
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
    const response = await route(body)

    return callback(null, {
      statusCode: 204,
      details: response,
    })
  } catch (error) {
    logger.error({
      event,
      error,
    })
    return callback(null, {
      statusCode: 500,
      body: 'Server Error',
      details: error.toString(),
    })
  }
}
