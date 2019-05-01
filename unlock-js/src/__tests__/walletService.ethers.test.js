import { ethers } from 'ethers'
import http from 'http'
import NockHelper from './helpers/nockHelper'

import WalletService from '../walletService'

const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, false /** debug */, true /** ethers */)

let walletService

let unlockAddress = '0xD8C88BE5e8EB88E38E6ff5cE186d764676012B0b'
describe('WalletService (ethers)', () => {
  function resetTests() {
    nock.cleanAll()
    walletService = new WalletService({
      unlockAddress,
    })
  }
  const netVersion = Math.floor(Math.random() * 100000)
  async function resetTestsAndConnect(provider = endpoint) {
    nock.cleanAll()
    walletService = new WalletService({
      unlockAddress,
    })
    nock.netVersionAndYield(netVersion)

    await walletService.ethers_connect(provider)
    await nock.resolveWhenAllNocksUsed()
  }

  describe('ethers_connect', () => {
    beforeEach(() => {
      resetTests()
    })

    it('properly connects to the ethers jsonRpcProvider', async () => {
      expect.assertions(1)

      await resetTestsAndConnect()
      expect(walletService.provider).toBeInstanceOf(
        ethers.providers.JsonRpcProvider
      )
    })

    it('properly connects to the ethers Web3Provider', async () => {
      expect.assertions(1)

      await resetTestsAndConnect({
        sendAsync(params, callback) {
          const data = JSON.stringify(params)
          const options = {
            host: '127.0.0.1',
            port: 8545,
            method: 'POST',
            path: '/',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': data.length,
            },
          }
          const req = http.request(options, res => {
            var responseString = ''

            res.on('data', data => {
              responseString += data
              // save all the data from response
            })
            res.on('end', () => {
              callback(null, JSON.parse(responseString))
              // print to console when response ends
            })
          })
          req.write(JSON.stringify(params))
          req.end()
        }, // a web3 provider must have sendAsync as a minimum
      })
      expect(walletService.provider).toBeInstanceOf(
        ethers.providers.Web3Provider
      )
    })
  })
})
