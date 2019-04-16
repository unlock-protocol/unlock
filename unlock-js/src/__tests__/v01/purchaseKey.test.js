import Web3 from 'web3'
import * as UnlockV0 from 'unlock-abi-0'
import purchaseKey from '../../v0/purchaseKey'
import Errors from '../../errors'
import { GAS_AMOUNTS } from '../../constants'
import TransactionTypes from '../../transactionTypes'
import NockHelper from '../helpers/nockHelper'
import { prepWalletService } from '../helpers/walletServiceHelper'

const { FAILED_TO_PURCHASE_KEY } = Errors
const endpoint = 'http://127.0.0.1:8545'
const provider = new Web3.providers.HttpProvider(endpoint)
const nock = new NockHelper(endpoint, true /** debug */)
let unlockAddress = '0xD8C88BE5e8EB88E38E6ff5cE186d764676012B0b'

let walletService

describe('v01', () => {
  beforeEach(done => {
    nock.cleanAll()
    prepWalletService(
      unlockAddress,
      UnlockV0.Unlock,
      provider,
      nock,
      _walletService => {
        walletService = _walletService
        // bind the purchaseKey into walletService
        walletService.purchaseKey = purchaseKey.bind(walletService)
        return done()
      }
    )
  })

  describe('purchaseKey', () => {
    let keyPrice
    let lock
    let owner
    let account
    let data

    beforeEach(() => {
      lock = '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e'
      owner = '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b'
      keyPrice = '100000000'
      account = '0xdeadbeef'
      data = 'key data'
    })

    it('should invoke sendTransaction with the right params', () => {
      expect.assertions(5)
      const data = '' // mock abi data for purchaseKey

      walletService._sendTransaction = jest.fn()

      const ContractClass = class {
        constructor(abi, address) {
          expect(abi).toBe(UnlockV0.PublicLock.abi)
          expect(address).toBe(lock)
          this.methods = {
            purchaseFor: (customer, data) => {
              expect(customer).toEqual(owner)
              expect(data).toEqual('0x') // Web3Utils.utf8ToHex(data || '')
              return this
            },
          }
          this.encodeABI = jest.fn(() => data)
        }
      }

      walletService.web3.eth.Contract = ContractClass

      walletService.purchaseKey(lock, owner, keyPrice, account, data)

      expect(walletService._sendTransaction).toHaveBeenCalledWith(
        {
          to: lock,
          from: account,
          data,
          gas: GAS_AMOUNTS.purchaseKey,
          contract: UnlockV0.PublicLock,
          value: '100000000000000000000000000', // Web3Utils.toWei(keyPrice, 'ether')
        },
        TransactionTypes.KEY_PURCHASE,
        expect.any(Function)
      )
    })

    it('should emit an error if the transaction could not be sent', done => {
      expect.assertions(1)
      const error = {}

      walletService._sendTransaction = jest.fn((args, type, cb) => {
        return cb(error)
      })

      walletService.on('error', error => {
        expect(error.message).toBe(FAILED_TO_PURCHASE_KEY)
        done()
      })

      walletService.purchaseKey(lock, owner, keyPrice, account, data)
    })
  })
})
