import * as UnlockV0 from 'unlock-abi-0'
import Web3Service from '../../web3Service'
import parseTransactionFromInput from '../../v0/parseTransactionFromInput'
import NockHelper from '../helpers/nockHelper'

import { KEY_ID } from '../../constants'

const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, true /** debug */)
let unlockAddress = '0xD8C88BE5e8EB88E38E6ff5cE186d764676012B0b'

let web3Service
const blockTime = 3
const readOnlyProvider = 'http://127.0.0.1:8545'
const requiredConfirmations = 12

const transaction = {
  status: 'mined',
  createdAt: new Date().getTime(),
  hash: '0x83f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
}

describe('v01', () => {
  beforeEach(() => {
    nock.cleanAll()
    web3Service = new Web3Service({
      readOnlyProvider,
      unlockAddress,
      blockTime,
      requiredConfirmations,
    })
    web3Service.parseTransactionFromInput = parseTransactionFromInput.bind(
      web3Service
    )
  })

  describe('parseTransactionFromInput', () => {
    beforeEach(() => {
      web3Service.getTransactionType = jest.fn(() => 'TRANSACTION_TYPE')
    })

    it('should emit transaction.updated with the transaction marked as pending', done => {
      expect.assertions(2)
      const input =
        '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a'
      web3Service.on('transaction.updated', (hash, update) => {
        expect(hash).toEqual(transaction.hash)
        expect(update).toEqual({
          status: 'pending',
          type: 'TRANSACTION_TYPE',
          confirmations: 0,
          blockNumber: Number.MAX_SAFE_INTEGER,
        })
        done()
      })
      web3Service.parseTransactionFromInput(
        transaction.hash,
        UnlockV0.Unlock,
        input,
        web3Service.unlockContractAddress
      )
    })

    it('should call the handler if the transaction input can be parsed', done => {
      expect.assertions(4)
      const input =
        '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a'

      // Fake method
      const method = {
        signature: '0x2bc888bf',
        name: 'myMethod',
      }

      // Fake abi
      const FakeContract = {
        abi: [method],
      }

      // fake params
      const params = {}
      // keeping track of it so we can clean it up (web3 has a singleton class down below)
      const decodeParams = web3Service.web3.eth.abi.decodeParameters
      web3Service.web3.eth.abi.decodeParameters = jest.fn(() => {
        return params
      })

      // Creating a fake handler
      web3Service.inputsHandlers[method.name] = (
        transactionHash,
        contractAddress,
        args
      ) => {
        expect(web3Service.web3.eth.abi.decodeParameters).toHaveBeenCalledWith(
          method.inputs,
          input
        )
        expect(transactionHash).toEqual(transaction.hash)
        expect(contractAddress).toEqual(web3Service.unlockContractAddress)
        expect(args).toEqual(params)
        // Clean up!
        web3Service.web3.eth.abi.decodeParameters = decodeParams
        done()
      }

      web3Service.parseTransactionFromInput(
        transaction.hash,
        FakeContract,
        `${method.signature}${input}`,
        web3Service.unlockContractAddress
      )
    })

    describe('inputsHandlers', () => {
      it('createLock', async () => {
        expect.assertions(4)
        let resolveLockUpdater
        let resolveTransactionUpdater
        const fakeLockAddress = '0x123'
        const fakeParams = {
          _keyPrice: '100000000000000000',
          _expirationDuration: '123',
          _maxNumberOfKeys: '-1',
        }
        const fakeHash = '0x12345'

        const lockUpdater = new Promise(resolve => {
          resolveLockUpdater = resolve
        })
        const transactionUpdater = new Promise(resolve => {
          resolveTransactionUpdater = resolve
        })
        web3Service.generateLockAddress = () => Promise.resolve(fakeLockAddress)

        web3Service.once('lock.updated', (lockAddress, params) => {
          expect(lockAddress).toBe(fakeLockAddress)
          expect(params).toEqual({
            transaction: fakeHash,
            address: fakeLockAddress,
            expirationDuration: 123,
            keyPrice: '0.1',
            maxNumberOfKeys: -1,
            outstandingKeys: 0,
            balance: '0',
          })
          resolveLockUpdater()
        })

        web3Service.once('transaction.updated', (transactionHash, params) => {
          expect(transactionHash).toBe(fakeHash)
          expect(params).toEqual({
            lock: fakeLockAddress,
          })
          resolveTransactionUpdater()
        })

        web3Service.inputsHandlers.createLock(
          fakeHash,
          web3Service.unlockContractAddress,
          fakeParams
        )
        await Promise.all([lockUpdater, transactionUpdater])
      })

      it('purchaseFor', async () => {
        expect.assertions(4)
        let resolveKeySaver
        let resolveTransactionUpdater
        const owner = '0x9876'
        const fakeParams = {
          _recipient: owner,
        }
        const fakeContractAddress = '0xabc'
        const fakeHash = '0x12345'

        const keySaver = new Promise(resolve => {
          resolveKeySaver = resolve
        })
        const transactionUpdater = new Promise(resolve => {
          resolveTransactionUpdater = resolve
        })

        web3Service.once('transaction.updated', (transactionHash, params) => {
          expect(transactionHash).toBe(fakeHash)
          expect(params).toEqual({
            key: KEY_ID(fakeContractAddress, owner),
            lock: fakeContractAddress,
          })
          resolveTransactionUpdater()
        })

        web3Service.once('key.saved', (id, params) => {
          expect(id).toBe(KEY_ID(fakeContractAddress, owner))
          expect(params).toEqual({
            owner,
            lock: fakeContractAddress,
          })
          resolveKeySaver()
        })

        web3Service.inputsHandlers.purchaseFor(
          fakeHash,
          fakeContractAddress,
          fakeParams
        )
        await Promise.all([keySaver, transactionUpdater])
      })
    })
  })
})
