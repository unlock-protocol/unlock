import { route, preview, list } from '../../route'
import logger from '../../../logger'

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export const handler = async (event, context, responseCallback) => {
  const callback = (err /** always null! */, response) => {
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

  // Handle favicon.ico requests to prevent 405 errors in logs
  if (event.path === '/favicon.ico') {
    return callback(null, {
      statusCode: 204,
      body: null,
    })
  }

  let match = event?.path?.match(/\/preview\/([a-zA-Z0-9-]+)?/)
  if (event.httpMethod === 'GET' && match && match[0]) {
    if (match[1]) {
      const body = await preview({
        template: match[1],
        params: event.queryStringParameters,
        json: !!event.headers.accept?.match('application/json'),
      })

      return callback(null, {
        statusCode: 200,
        body,
        headers: {
          'Content-Type': event.headers.accept?.match('application/json')
            ? 'application/json'
            : 'text/html; charset=utf-8',
        },
      })
    } else {
      return callback(null, {
        statusCode: 200,
        body: await list(),
      })
    }
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

    // Handle different error types with helpful messages
    const errorString = error.toString()

    if (errorString.includes('codeeval') || errorString.includes('security')) {
      return callback(null, {
        statusCode: 500,
        body: 'CloudFlare security restriction: Dynamic code generation not allowed in Workers',
        details: errorString,
      })
    }

    if (
      errorString.includes('Not implemented') ||
      errorString.includes('EDNS')
    ) {
      return callback(null, {
        statusCode: 500,
        body: 'CloudFlare Workers cannot use SMTP directly. Use HTTP APIs for email services instead.',
        details:
          'CloudFlare Workers do not support direct SMTP connections. The email was rendered correctly but cannot be sent using nodemailer. You must use an HTTP-based email API instead.',
      })
    }

    if (errorString.includes('not found in precompiled templates')) {
      return callback(null, {
        statusCode: 404,
        body: errorString,
        details:
          'Only precompiled templates are supported in CloudFlare Workers',
      })
    }

    return callback(null, {
      statusCode: 500,
      body: 'Server Error',
      details: errorString,
    })
  }
}
