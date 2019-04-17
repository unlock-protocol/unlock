import * as UnlockV01 from 'unlock-abi-0-1'
import Web3Service from '../../web3Service'
import getTransaction from '../../v01/getTransaction'
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
    web3Service.getTransaction = getTransaction.bind(web3Service)
  })

  describe('getTransaction', () => {
    describe('when the transaction was submitted', () => {
      beforeEach(() => {
        nock.ethBlockNumber(`0x${(29).toString('16')}`)
        nock.ethGetTransactionByHash(transaction.hash, null)
        web3Service._watchTransaction = jest.fn()
      })

      it('should call _getSubmittedTransaction', done => {
        expect.assertions(3)

        const defaultTransactionValues = {
          to: 'julien',
        }
        web3Service._getSubmittedTransaction = jest.fn(
          (hash, number, defaults) => {
            expect(hash).toBe(transaction.hash)
            expect(number).toBe(29)
            expect(defaults).toMatchObject(defaultTransactionValues)
            done()
          }
        )

        web3Service.getTransaction(transaction.hash, defaultTransactionValues)
      })
    })

    describe('when the transaction is pending/waiting to be mined', () => {
      const input =
        '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a'
      beforeEach(() => {
        nock.ethBlockNumber(`0x${(29).toString('16')}`)
        nock.ethGetTransactionByHash(transaction.hash, {
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
        })
      })

      it('should call _getPendingTransaction', done => {
        expect.assertions(2)

        web3Service._getPendingTransaction = jest.fn(blockTransaction => {
          expect(blockTransaction.hash).toBe(transaction.hash)
          expect(blockTransaction.input).toBe(input)
          done()
        })

        web3Service.getTransaction(transaction.hash)
      })
    })

    describe('when the transaction has been mined in the next block', () => {
      beforeEach(() => {
        nock.ethBlockNumber(`0x${(17).toString('16')}`)
        nock.ethGetTransactionByHash(transaction.hash, {
          hash:
            '0x83f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
          nonce: '0x04',
          blockHash:
            '0xdc7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
          blockNumber: `0x${(18).toString('16')}`,
          transactionIndex: '0x0d',
          from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
          to: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
          value: '0x0',
          gas: '0x16e360',
          gasPrice: '0x04a817c800',
          input:
            '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a',
        })
        web3Service.web3.eth.getTransactionReceipt = jest.fn(
          () => new Promise(() => {})
        )
        web3Service._watchTransaction = jest.fn()
        web3Service.getTransactionType = jest.fn(() => 'TRANSACTION_TYPE')
      })

      it('should emit a transaction.updated event with 0 confirmations', done => {
        expect.assertions(1)
        web3Service.on('transaction.updated', (hash, update) => {
          expect(update.confirmations).toEqual(0) // 0 > -1 [17-18]
          done()
        })

        web3Service.getTransaction(transaction.hash)
      })
    })

    describe('when the transaction has been mined but not fully confirmed', () => {
      beforeEach(() => {
        nock.ethBlockNumber(`0x${(17).toString('16')}`)
        nock.ethGetTransactionByHash(transaction.hash, {
          hash:
            '0x83f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
          nonce: '0x04',
          blockHash:
            '0xdc7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
          blockNumber: `0x${(14).toString('16')}`,
          transactionIndex: '0x0d',
          from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
          to: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
          value: '0x0',
          gas: '0x16e360',
          gasPrice: '0x04a817c800',
          input:
            '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a',
        })
        web3Service.web3.eth.getTransactionReceipt = jest.fn(
          () => new Promise(() => {})
        )
        web3Service._watchTransaction = jest.fn()
        web3Service.getTransactionType = jest.fn(() => 'TRANSACTION_TYPE')
      })

      it('should watch the transaction', done => {
        expect.assertions(1)
        web3Service.on('transaction.updated', () => {
          expect(web3Service._watchTransaction).toHaveBeenCalledWith(
            transaction.hash
          )
          done()
        })

        web3Service.getTransaction(transaction.hash)
      })

      it('should emit a transaction.updated event with the right values', done => {
        expect.assertions(5)
        web3Service.on('transaction.updated', (hash, update) => {
          expect(hash).toBe(transaction.hash)
          expect(update.status).toEqual('mined')
          expect(update.confirmations).toEqual(3) //17-14
          expect(update.blockNumber).toEqual(14)
          expect(update.type).toEqual('TRANSACTION_TYPE')
          done()
        })

        web3Service.getTransaction(transaction.hash)
      })
    })

    describe('when the transaction was mined', () => {
      const blockTransaction = {
        hash:
          '0x83f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
        nonce: '0x04',
        blockHash:
          '0xdc7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
        blockNumber: `0x${(14).toString('16')}`,
        transactionIndex: '0x00',
        from: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
        to: '0xCfEB869F69431e42cdB54A4F4f105C19C080A601',
        value: '0x0',
        gas: '0x16e360',
        gasPrice: '0x04a817c800',
        input:
          '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a',
      }

      beforeEach(() => {
        nock.ethBlockNumber(`0x${(29).toString('16')}`)

        nock.ethGetTransactionByHash(transaction.hash, blockTransaction)
      })

      it('should mark the transaction as failed if the transaction receipt status is false', done => {
        expect.assertions(6)
        nock.ethGetTransactionReceipt(transaction.hash, {
          transactionIndex: '0x3',
          blockHash:
            '0x01b3cd21ace224e17cc1d5a8af18c01a4e6c2c99b83b28a711f6ea76c31e62f9',
          blockNumber: '0x158',
          gasUsed: '0x2ea84',
          cumulativeGasUsed: '0x3a525',
          logs: [],
          status: '0x0',
        })
        web3Service.getTransactionType = jest.fn(() => 'TYPE')

        web3Service.once('transaction.updated', (transactionHash, update) => {
          expect(transactionHash).toEqual(transaction.hash)
          expect(update.confirmations).toEqual(15) //29-14
          expect(update.type).toEqual('TYPE')
          expect(update.blockNumber).toEqual(14)
          web3Service.once('transaction.updated', (transactionHash, update) => {
            expect(transactionHash).toEqual(transaction.hash)
            expect(update.status).toBe('failed')
            done()
          })
        })

        return web3Service.getTransaction(transaction.hash)
      })

      it('should parseTransactionLogsFromReceipt with the Unlock abi if the address is one of the Unlock contract', done => {
        expect.assertions(5)
        const transactionReceipt = {
          transactionIndex: '0x3',
          blockHash:
            '0x01b3cd21ace224e17cc1d5a8af18c01a4e6c2c99b83b28a711f6ea76c31e62f9',
          blockNumber: '0x158',
          gasUsed: '0x2ea84',
          cumulativeGasUsed: '0x3a525',
          logs: [],
          status: '0x1',
        }
        nock.ethGetTransactionReceipt(transaction.hash, transactionReceipt)
        const previousAddress = web3Service.unlockContractAddress

        web3Service.getTransactionType = jest.fn(() => 'TYPE')

        web3Service.parseTransactionLogsFromReceipt = (
          transactionHash,
          contract,
          receipt
        ) => {
          expect(transactionHash).toEqual(transaction.hash)
          expect(contract).toEqual(UnlockV01.Unlock)
          expect(receipt.blockNumber).toEqual(344)
          expect(receipt.logs).toEqual([])
          web3Service.unlockContractAddress = previousAddress
          expect(web3Service.getTransactionType).toHaveBeenCalledWith(
            UnlockV01.Unlock,
            blockTransaction.input
          )
          done()
        }
        web3Service.unlockContractAddress = blockTransaction.to
        web3Service.getTransaction(transaction.hash)
      })

      it('should parseTransactionLogsFromReceipt with the Lock abi otherwise', done => {
        expect.assertions(5)
        const transactionReceipt = {
          transactionIndex: '0x3',
          blockHash:
            '0x01b3cd21ace224e17cc1d5a8af18c01a4e6c2c99b83b28a711f6ea76c31e62f9',
          blockNumber: '0x158',
          gasUsed: '0x2ea84',
          cumulativeGasUsed: '0x3a525',
          logs: [],
          status: '0x1',
        }
        nock.ethGetTransactionReceipt(transaction.hash, transactionReceipt)

        web3Service.getTransactionType = jest.fn(() => 'TYPE')

        web3Service.parseTransactionLogsFromReceipt = (
          transactionHash,
          contract,
          receipt
        ) => {
          expect(transactionHash).toEqual(transaction.hash)
          expect(contract).toEqual(UnlockV01.PublicLock)
          expect(receipt.blockNumber).toEqual(344)
          expect(receipt.logs).toEqual([])
          expect(web3Service.getTransactionType).toHaveBeenCalledWith(
            UnlockV01.PublicLock,
            blockTransaction.input
          )
          done()
        }

        web3Service.getTransaction(transaction.hash)
      })
    })
  })
})
