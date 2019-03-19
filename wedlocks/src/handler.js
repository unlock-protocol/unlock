/* eslint no-console: 0 */
/* eslint import/prefer-default-export: 0 */
import { route } from './route'

export const handler = (event, context, callback) => {
  if (event.httpMethod != 'POST') {
    return callback(null, {
      statusCode: 405,
      body: 'Unsupported Method'
    })
  }

  if (!event.headers || event.headers['content-type'] !== 'application/json') {
    return callback(null, {
      statusCode: 415,
      body: 'Unsupported Media Type'
    })
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch (e) {
    return callback(null, {
      statusCode: 422,
      body: 'Malformed Body'
    })
  }

  try {
    route(body, (error, response) => {
      if (error) {
        return callback(null, {
          statusCode: 400,
          body: error
        })
      }
      return callback(null, {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(response)
      })
    })
  } catch (e) {
    return callback(null, {
      statusCode: 500,
      body: e.message
    })
  }
}
