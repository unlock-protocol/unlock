/* eslint no-console: 0 */

import http from 'http'
import handler from './handler'

http
  .createServer((req, res) => {
    handler({}, {}, response => {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end(response)
    })
  })
  .listen(1337, '127.0.0.1')

console.log('Server running at http://127.0.0.1:1337/')
