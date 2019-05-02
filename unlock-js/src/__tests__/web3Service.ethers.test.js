import { ethers } from 'ethers'
import http from 'http'

import NockHelper from './helpers/nockHelper'
import Web3Service from '../web3Service'
import utils from '../utils.ethers'

import v0 from '../v0'
import v01 from '../v01'
import v02 from '../v02'

const supportedVersions = [v0, v01, v02]

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

  describe('getAddressBalance', () => {
    it('should return the balance of the address', async () => {
      expect.assertions(1)
      await nockBeforeEach()
      const balance = '0xdeadbeef'
      const inWei = utils.hexToNumberString(balance)
      const expectedBalance = utils.fromWei(inWei, 'ether')
      const address = '0x1df62f291b2e969fb0849d99d9ce41e2f137006e'

      nock.getBalanceForAccountAndYieldBalance(address, '0xdeadbeef')

      let addressBalance = await web3Service.ethers_getAddressBalance(address)
      expect(addressBalance).toEqual(expectedBalance)
    })
  })

  describe('versions', () => {
    const versionSpecificLockMethods = ['getLock']

    it.each(versionSpecificLockMethods)(
      'should invoke the implementation of the corresponding version of %s',
      async method => {
        const args = []
        const result = {}
        const version = {
          [`ethers_${method}`]: function(_args) {
            // Needs to be a function because it is bound to web3Service
            expect(this).toBe(web3Service)
            expect(_args).toBe(...args)
            return result
          },
        }
        web3Service.ethers_lockContractAbiVersion = jest.fn(() => version)
        const r = await web3Service[method](...args)
        expect(r).toBe(result)
      }
    )

    // for each supported version, let's make sure it implements all methods
    it.each(supportedVersions)(
      'should implement all the required methods',
      version => {
        versionSpecificLockMethods.forEach(method => {
          expect(version[`ethers_${method}`]).toBeInstanceOf(Function)
        })
      }
    )
  })
})
