import Web3 from 'web3'
import * as UnlockV0 from 'unlock-abi-0'
import Web3Utils from 'web3-utils'
import updateKeyPrice from '../../v0/updateKeyPrice'
import Errors from '../../errors'
import { GAS_AMOUNTS } from '../../constants'
import TransactionTypes from '../../transactionTypes'
import NockHelper from '../helpers/nockHelper'
import { prepWalletService } from '../helpers/walletServiceHelper'

const { FAILED_TO_UPDATE_KEY_PRICE } = Errors
const endpoint = 'http://127.0.0.1:8545'
const provider = new Web3.providers.HttpProvider(endpoint)
const nock = new NockHelper(endpoint, false /** debug */)
let unlockAddress = '0xD8C88BE5e8EB88E38E6ff5cE186d764676012B0b'

let walletService

describe('v0', () => {
  beforeEach(done => {
    nock.cleanAll()
    prepWalletService(
      unlockAddress,
      UnlockV0.Unlock,
      provider,
      nock,
      _walletService => {
        walletService = _walletService
        // bind the updateKeyPrice into walletService
        walletService.updateKeyPrice = updateKeyPrice.bind(walletService)
        return done()
      }
    )
  })

  describe('updateKeyPrice', () => {
    let lock
    let account
    let price

    beforeEach(() => {
      lock = '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b'
      account = '0xdeadbeef'
      price = '100000000'
    })

    it('should invoke sendTransaction with the right params', () => {
      expect.assertions(4)
      const data = '' // mock abi data for purchaseKey

      walletService._sendTransaction = jest.fn()

      const ContractClass = class {
        constructor(abi, address) {
          expect(abi).toBe(UnlockV0.PublicLock.abi)
          expect(address).toBe(lock)
          this.methods = {
            updateKeyPrice: newPrice => {
              expect(newPrice).toEqual(Web3Utils.toWei(price, 'ether'))
              return this
            },
          }
          this.encodeABI = jest.fn(() => data)
        }
      }

      walletService.web3.eth.Contract = ContractClass

      walletService.updateKeyPrice(lock, account, price)

      expect(walletService._sendTransaction).toHaveBeenCalledWith(
        {
          to: lock,
          from: account,
          data,
          gas: GAS_AMOUNTS.updateKeyPrice,
          contract: UnlockV0.PublicLock,
        },
        TransactionTypes.UPDATE_KEY_PRICE,
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
        expect(error.message).toBe(FAILED_TO_UPDATE_KEY_PRICE)
        done()
      })

      walletService.updateKeyPrice(lock, account, price)
    })
  })
})
