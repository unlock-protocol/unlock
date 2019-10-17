// This file is a no-extra-dependencies-required way of mimicking the API of axios.post
// It is used by both erc20IsUp.js and locksAreDeployed.js
const http = require('http')

const { httpProviderHost, httpProviderPort } = require('./vars.js')

function post(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload)

    const options = {
      hostname: httpProviderHost,
      port: httpProviderPort,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      body: body,
    }

    const request = new http.ClientRequest(options)

    request.on('response', res => {
      if (res.statusCode !== 200) {
        reject(new Error(`failed ${res.statusCode}`))
      }
      res.setEncoding('utf8')
      let result = ''
      res.on('data', chunk => {
        result += chunk
      })
      res.on('end', () => {
        try {
          const response = {
            data: JSON.parse(result),
          }
          resolve(response)
        } catch (e) {
          reject(e)
        }
      })
    })

    request.on('error', e => {
      reject(new Error(`problem with request: ${e.message}`))
    })

    request.end(body)
  })
}

module.exports = { post }
