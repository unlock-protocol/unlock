import { route, preview, list } from '../../route'
import logger from '../../../logger'

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const getHeader = (eventHeaders = {}, headerName) => {
  const normalizedHeaderName = headerName.toLowerCase()
  const matchingHeader = Object.keys(eventHeaders).find(
    (key) => key.toLowerCase() === normalizedHeaderName
  )
  return matchingHeader ? eventHeaders[matchingHeader] : undefined
}

const isTemplateNotFoundError = (error) =>
  error?.name === 'TemplateNotFoundError' ||
  error?.message === 'Missing template'

const isWorkerCodeEvalError = (error) => {
  const code = error?.code || error?.cause?.code
  const message = error?.message || String(error)
  return (
    code === 'ERR_WORKER_UNSUPPORTED_CODE_EVAL' ||
    /codeeval|code generation from strings|dynamic code generation/i.test(
      message
    )
  )
}

const isSmtpRuntimeError = (error) => {
  const code = error?.code || error?.cause?.code
  const message = error?.message || String(error)
  return (
    code === 'ERR_WORKER_UNSUPPORTED_SOCKET' ||
    /not implemented.*(dns|socket|connect)|edns|cloudflare:sockets/i.test(
      message
    )
  )
}

export const handler = async (event, env, responseCallback) => {
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

  // Handle favicon.ico requests
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
        senderAddress: env.SMTP_FROM_ADDRESS,
        json: !!getHeader(event.headers, 'accept')?.match('application/json'),
      })

      return callback(null, {
        statusCode: 200,
        body,
        headers: {
          'Content-Type': getHeader(event.headers, 'accept')?.match(
            'application/json'
          )
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

  const contentType = getHeader(event.headers, 'content-type')
  if (!contentType || !contentType.includes('application/json')) {
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
    const smtpPort = Number(env.SMTP_PORT ?? 587)
    if (!Number.isFinite(smtpPort)) {
      throw new Error('Invalid SMTP port')
    }

    const response = await route(
      body,
      {
        host: env.SMTP_HOST,
        authType: 'plain',
        port: smtpPort,
        secure: false,
        credentials: {
          username: env.SMTP_USERNAME,
          password: env.SMTP_PASSWORD,
        },
      },
      {
        senderAddress: env.SMTP_FROM_ADDRESS,
      }
    )

    return callback(null, {
      statusCode: 204,
    })
  } catch (error) {
    logger.error({
      event,
      error,
    })

    if (isWorkerCodeEvalError(error)) {
      return callback(null, {
        statusCode: 500,
        body: 'Security restriction: Dynamic code generation not allowed',
      })
    }

    if (isSmtpRuntimeError(error)) {
      return callback(null, {
        statusCode: 500,
        body: 'SMTP connections are not supported. Please use HTTP APIs for email services.',
      })
    }

    if (isTemplateNotFoundError(error)) {
      return callback(null, {
        statusCode: 404,
        body: 'Template not found',
      })
    }

    return callback(null, {
      statusCode: 500,
      body: 'Server Error',
    })
  }
}
