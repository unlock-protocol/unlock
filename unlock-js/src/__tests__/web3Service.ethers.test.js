import { ethers } from 'ethers'
import http from 'http'

import NockHelper from './helpers/nockHelper'
import Web3Service from '../web3Service'

const blockTime = 3
const readOnlyProvider = 'http://127.0.0.1:8545'
const requiredConfirmations = 12
const unlockAddress = '0xc43efE2C7116CB94d563b5A9D68F260CCc44256F'

const nock = new NockHelper(
  readOnlyProvider,
  false /** debug */,
  true /** ethers */
)
let web3Service

describe('Web3Service', () => {
  async function nockBeforeEach(endpoint = readOnlyProvider) {
    nock.cleanAll()
    nock.netVersionAndYield(1)
    web3Service = new Web3Service({
      readOnlyProvider: endpoint,
      unlockAddress,
      blockTime,
      requiredConfirmations,
      useEthers: true,
    })
    return nock.resolveWhenAllNocksUsed()
  }

  describe('ethers_setup', () => {
    it('should set up a JsonRpcProvider for a string end point', async () => {
      expect.assertions(1)

      await nockBeforeEach()

      expect(web3Service.provider).toBeInstanceOf(
        ethers.providers.JsonRpcProvider
      )
    })

    it('should set up a Web3Provider for a web3 provider end point', async () => {
      expect.assertions(1)

      await nockBeforeEach({
        send(params, callback) {
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
      expect(web3Service.provider).toBeInstanceOf(ethers.providers.Web3Provider)
    })
  })
})
