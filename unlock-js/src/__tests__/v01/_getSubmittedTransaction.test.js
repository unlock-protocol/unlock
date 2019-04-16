import Web3Service from '../../web3Service'
import _getSubmittedTransaction from '../../v0/_getSubmittedTransaction'
import NockHelper from '../helpers/nockHelper'

const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, true /** debug */)
let unlockAddress = '0xD8C88BE5e8EB88E38E6ff5cE186d764676012B0b'

let web3Service
const blockTime = 3
const readOnlyProvider = 'http://127.0.0.1:8545'
const requiredConfirmations = 12

const transaction = {
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
    web3Service._getSubmittedTransaction = _getSubmittedTransaction.bind(
      web3Service
    )
  })

  describe('_getSubmittedTransaction', () => {
    const blockNumber = 29
    const defaults = null

    beforeEach(() => {
      web3Service._watchTransaction = jest.fn()
    })

    it('should watch the transaction', done => {
      expect.assertions(1)
      web3Service.on('transaction.updated', () => {
        expect(web3Service._watchTransaction).toHaveBeenCalledWith(
          transaction.hash
        )
        done()
      })

      web3Service._getSubmittedTransaction(
        transaction.hash,
        blockNumber,
        defaults
      )
    })

    it('should emit a transaction.updated event with the right values', done => {
      expect.assertions(4)
      web3Service.on('transaction.updated', (hash, update) => {
        expect(hash).toBe(transaction.hash)
        expect(update.status).toEqual('submitted')
        expect(update.confirmations).toEqual(0)
        expect(update.blockNumber).toEqual(Number.MAX_SAFE_INTEGER)
        done()
      })
      web3Service._getSubmittedTransaction(
        transaction.hash,
        blockNumber,
        defaults
      )
    })

    it('should invoke parseTransactionFromInput if the defaults include an input value', done => {
      expect.assertions(3)

      const defaults = {
        input:
          '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a',
        to: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
      }

      web3Service.parseTransactionFromInput = jest.fn(
        (transactionHash, contract, transactionInput, address) => {
          expect(transactionHash).toEqual(transaction.hash)
          expect(transactionInput).toEqual(defaults.input)
          expect(address).toEqual('0xcfeb869f69431e42cdb54a4f4f105c19c080a601')
          done()
        }
      )

      web3Service._getSubmittedTransaction(
        transaction.hash,
        blockNumber,
        defaults
      )
    })
  })
})
