const https = require('https')
/**
 * Wrapper around keyExpirationFor
 * @param {*} provider
 * @param {*} lock
 * @param {*} userAddress
 * @returns
 */
async function keyExpirationFor(provider, lock, userAddress) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      method: 'eth_call',
      params: [
        {
          to: lock,
          data: `0xabdf82ce000000000000000000000000${userAddress.substring(2)}`,
        },
        'latest',
      ],
      id: 31337, // Not used here
      jsonrpc: '2.0',
    })

    try {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
        },
      }

      const req = https.request(provider, options, (res) => {
        let body = ''
        res.on('data', (d) => {
          body += d
        })

        res.on('end', () => {
          const { result } = JSON.parse(body)
          if (parseInt(result, 16) > Number.MAX_SAFE_INTEGER) {
            // This will cover cases of locks returning NO_SUCH_KEY or `HAS_NEVER_OWNED_KEY` which are strings and much larger than Number.MAX_SAFE_INTEGER
            return resolve(0)
          }
          return resolve(parseInt(result, 16) || 0)
        })
      })

      req.on('error', (error) => {
        reject(error)
      })

      req.write(data)
      req.end()
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = keyExpirationFor
