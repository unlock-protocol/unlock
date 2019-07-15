// This file is used to probe the ganache server. It attempts to call
// balanceOf(0xaaadeed4...) to get the ERC20 token balance.
// when the standup script has finished, it will return 500 tokens,
// which is assumed if our call to balanceOf returns a non-zero value.
const http = require('http')
const url = require('./url')

const erc20ContractAddress = process.env.ERC20_CONTRACT_ADDRESS
const testingAddress = process.env.ETHEREUM_ADDRESS

// 0x70a08231 = encoded "balanceOf" signature
// aaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2 = the encoded testingAddress
// this is used in the params for eth_call
const balanceOfQuery =
  '0x70a08231000000000000000000000000aaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2'
let id = 1

function post(host, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload)

    const options = {
      hostname: host,
      port: 8545,
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
  let attempts = 1
  let lastResponse = undefined
  return new Promise((resolve, reject) => {
    function retrieveBalance() {
      post(
        url.provider,
        {
          jsonrpc: '2.0',
          id: id++,
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
        .then(response => {
          if (
            response.data.error ||
            response.data.result === '0x' || // contract not deployed
            response.data.result === // no erc20 coins minted yet
              '0x0000000000000000000000000000000000000000000000000000000000000000'
          ) {
            if (response.data.result) {
              if (lastResponse !== response.data.result) {
                lastResponse = response.data.result
                if (response.data.result === '0x') {
                  console.log('...ERC20 contract not deployed') // eslint-disable-line
                } else if (
                  response.data.result ===
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
        })
        .catch(error => {
          if (attempts < maxAttempts) {
            setTimeout(retrieveBalance, delay)
            return
          }
          return reject(error)
        })
    }
    retrieveBalance()
  })
}

module.exports = erc20IsUp
