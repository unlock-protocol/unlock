/* eslint no-console: 0 */

import http from 'http'
import { handler } from './handler'

http
  .createServer((req, res) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk.toString() // convert Buffer to string
    })
    req.on('end', () => {
      handler(
        {
          httpMethod: req.method,
          headers: req.headers,
          body,
        },
        {},
        (error, response) => {
          if (error) {
            res.writeHead(500, {})
            return res.end(error.message)
          }
          res.writeHead(response.statusCode, response.headers)
          res.end(response.body)
        }
      )
    })
  })
  .listen(1337, '127.0.0.1')

console.log('Server running at http://127.0.0.1:1337/')
