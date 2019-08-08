/* eslint-disable no-console */
// This file is used to probe the ganache server. It attempts to call
// eth_getCode to ensure each of the locks needed for testing have been deployed
const post = require('./http').post

const {
  paywallETHLockAddress,
  paywallERC20LockAddress,
  adblockETHLockAddresses,
  adblockERC20LockAddresses,
} = require('./vars')

let id = 1

function resolveWhenDeployed(address, delay, maxAttempts) {
  let attempts = 1
  return new Promise((resolve, reject) => {
    function retrieveCode() {
      post(
        {
          jsonrpc: '2.0',
          id: id++,
          method: 'eth_getCode',
          params: [address, 'latest'],
        },
        {
          'content-type': 'application/json',
        }
      )
        .then(response => {
          if (
            response.data.error ||
            response.data.result === '0x' // lock is not deployed
          ) {
            if (response.data.result) {
              if (response.data.result === '0x') {
                console.log(`...Lock ${address} not deployed yet`) // eslint-disable-line
              }
            }
            if (attempts < maxAttempts) {
              setTimeout(retrieveCode, delay)
              return
            }
          }
          // any other response shows that the contract has been successfully deployed
          resolve()
        })
        .catch(error => {
          if (attempts < maxAttempts) {
            setTimeout(retrieveCode, delay)
            return
          }
          return reject(error)
        })
    }
    retrieveCode()
  })
}

const locksAreDeployed = ({ delay, maxAttempts }) => {
  // return a promise that resolves when every lock has been deployed
  console.log('Will wait for the following lock addresses to deploy:')
  console.log(paywallETHLockAddress)
  console.log(paywallERC20LockAddress)
  adblockETHLockAddresses.forEach(address => console.log(address))
  adblockERC20LockAddresses.forEach(address => console.log(address))
  console.log(
    'If any are incorrect, integration tests will fail. Change to correct values in tests/helpers/vars.js'
  )
  console.log(
    'Get new values by running the dev standup in docker/development (see the README.md in the root directory)'
  )
  return Promise.all([
    resolveWhenDeployed(paywallETHLockAddress, delay, maxAttempts),
    resolveWhenDeployed(paywallERC20LockAddress, delay, maxAttempts),
    ...adblockETHLockAddresses.map(address =>
      resolveWhenDeployed(address, delay, maxAttempts)
    ),
    ...adblockERC20LockAddresses.map(address =>
      resolveWhenDeployed(address, delay, maxAttempts)
    ),
  ])
}

module.exports = locksAreDeployed
