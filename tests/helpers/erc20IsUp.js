// This file is used to probe the ganache server. It attempts to call
// balanceOf(0xaaadeed4...) to get the ERC20 token balance.
// when the standup script has finished, it will return 500 tokens,
// which is assumed if our call to balanceOf returns a non-zero value.
const http = require('http')

const {
  erc20ContractAddress,
  testingAddress,
  httpProviderHost,
  httpProviderPort,
} = require('./vars.js')

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

const erc20IsUp = ({ delay, maxAttempts }) => {
  let attempts = 0
  let lastResponse = undefined
  return new Promise((resolve, reject) => {
    const retrieveBalance = async () => {
      try {
        // 0x70a08231 = encoded "balanceOf" signature
        // ${testingAddress} = the encoded testingAddress
        // this is used in the params for eth_call
        const balanceOfQuery = `0x70a08231000000000000000000000000${testingAddress
          .toLowerCase()
          .substring(2)}`
        const response = await post(
          {
            jsonrpc: '2.0',
            id: attempts++,
            method: 'eth_call',
            params: [
              {
                to: erc20ContractAddress,
                from: testingAddress,
                data: balanceOfQuery,
              },
            ],
          },
          {
            'content-type': 'application/json',
          }
        )
        if (
          response.data.error ||
          response.data.result === '0x' || // contract not deployed
          response.data.result === // no erc20 coins minted yet
            '0x0000000000000000000000000000000000000000000000000000000000000000'
        ) {
          if (response.data.result) {
            if (lastResponse !== response.data.result) {
              lastResponse = response.data.result
              if (lastResponse === '0x') {
                console.log('...ERC20 contract not deployed') // eslint-disable-line
              } else if (
                lastResponse ===
                '0x0000000000000000000000000000000000000000000000000000000000000000'
              ) {
                console.log('...ERC20 contract deployed') // eslint-disable-line
              } else {
                console.log(`...${lastResponse} coins minted`) // eslint-disable-line
              }
            }
          }
          if (attempts < maxAttempts) {
            setTimeout(retrieveBalance, delay)
            return
          }
        }
        resolve()
      } catch (error) {
        if (attempts < maxAttempts) {
          setTimeout(retrieveBalance, delay)
          return
        }
        return reject(error)
      }
    }
    retrieveBalance()
  })
}

module.exports = erc20IsUp
