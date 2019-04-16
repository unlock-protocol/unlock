import Web3Service from '../../web3Service'
import _getPendingTransaction from '../../v0/_getPendingTransaction'
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
    web3Service._getPendingTransaction = _getPendingTransaction.bind(
      web3Service
    )
  })

  describe('_getPendingTransaction', () => {
    const input =
      '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a'

    const blockTransaction = {
      hash: transaction.hash,
      nonce: '0x04',
      blockHash: 'null',
      blockNumber: null, // Not mined
      from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
      to: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
      value: '0x0',
      gas: '0x16e360',
      gasPrice: '0x04a817c800',
      input,
    }

    beforeEach(() => {
      web3Service._watchTransaction = jest.fn()
      web3Service.getTransactionType = jest.fn(() => 'TRANSACTION_TYPE')
    })

    it('should watch the transaction', done => {
      expect.assertions(1)

      web3Service.parseTransactionFromInput = jest.fn(() => {
        expect(web3Service._watchTransaction).toHaveBeenCalledWith(
          transaction.hash
        )
        done()
      })

      web3Service._getPendingTransaction(blockTransaction)
    })

    it('should invoke parseTransactionFromInput', done => {
      expect.assertions(3)
      web3Service.parseTransactionFromInput = jest.fn(
        (transactionHash, contract, transactionInput, address) => {
          expect(transactionHash).toEqual(transaction.hash)
          expect(transactionInput).toEqual(input)
          expect(address).toEqual('0xcfeb869f69431e42cdb54a4f4f105c19c080a601')
          done()
        }
      )

      web3Service._getPendingTransaction(blockTransaction)
    })
  })
})
