import Web3 from 'web3'
import * as UnlockV02 from 'unlock-abi-0-2'
import createLock from '../../v02/createLock'
import Errors from '../../errors'
import { GAS_AMOUNTS } from '../../constants'
import TransactionTypes from '../../transactionTypes'
import NockHelper from '../helpers/nockHelper'
import { prepWalletService } from '../helpers/walletServiceHelper'

const { FAILED_TO_CREATE_LOCK } = Errors
const endpoint = 'http://127.0.0.1:8545'
const provider = new Web3.providers.HttpProvider(endpoint)
const nock = new NockHelper(endpoint, true /** debug */)
let unlockAddress = '0xD8C88BE5e8EB88E38E6ff5cE186d764676012B0b'

let walletService

describe('v02', () => {
  beforeEach(done => {
    nock.cleanAll()
    prepWalletService(
      unlockAddress,
      UnlockV02.Unlock,
      provider,
      nock,
      _walletService => {
        walletService = _walletService
        // bind the createLock into walletService
        walletService.createLock = createLock.bind(walletService)
        return done()
      }
    )
  })

  describe('createLock', () => {
    let lock
    let owner

    beforeEach(() => {
      lock = {
        address: '0xadd',
        expirationDuration: 86400, // 1 day
        keyPrice: '0.1', // 0.1 Eth
        maxNumberOfKeys: 100,
      }
      owner = '0xdeadfeed'
    })

    it('should invoke sendTransaction with the right params', () => {
      expect.assertions(7)
      const data = '' // mock abi data for createLock

      walletService._sendTransaction = jest.fn()

      const ContractClass = class {
        constructor(abi, address) {
          expect(abi).toBe(UnlockV02.Unlock.abi)
          expect(address).toBe(walletService.unlockContractAddress)
          this.methods = {
            createLock: (duration, tokenAddress, price, numberOfKeys) => {
              expect(duration).toEqual(lock.expirationDuration)
              expect(tokenAddress).toEqual(
                '0x0000000000000000000000000000000000000000'
              ) // This is an Ethereum Lock
              expect(price).toEqual('100000000000000000') // Web3Utils.toWei(lock.keyPrice, 'ether')
              expect(numberOfKeys).toEqual(100)
              return this
            },
          }
          this.encodeABI = jest.fn(() => data)
        }
      }

      walletService.web3.eth.Contract = ContractClass

      walletService.createLock(lock, owner)

      expect(walletService._sendTransaction).toHaveBeenCalledWith(
        {
          to: walletService.unlockContractAddress,
          from: owner,
          data,
          gas: GAS_AMOUNTS.createLock,
          contract: UnlockV02.Unlock,
        },
        TransactionTypes.LOCK_CREATION,
        expect.any(Function)
      )
    })

    it('should emit lock.updated with the transaction', done => {
      expect.assertions(2)
      const hash = '0x1213'

      walletService._sendTransaction = jest.fn((args, type, cb) => {
        return cb(null, hash)
      })

      walletService.on('lock.updated', (lockAddress, update) => {
        expect(lockAddress).toBe(lock.address)
        expect(update).toEqual({
          transaction: hash,
          balance: '0',
          expirationDuration: lock.expirationDuration,
          keyPrice: lock.keyPrice,
          maxNumberOfKeys: lock.maxNumberOfKeys,
          outstandingKeys: 0,
          owner,
        })
        done()
      })

      walletService.createLock(lock, owner)
    })

    it('should emit an error if the transaction could not be sent', done => {
      expect.assertions(1)
      const error = {}

      walletService._sendTransaction = jest.fn((args, type, cb) => {
        return cb(error)
      })

      walletService.on('error', error => {
        expect(error.message).toBe(FAILED_TO_CREATE_LOCK)
        done()
      })

      walletService.createLock(lock, owner)
    })
  })
})
