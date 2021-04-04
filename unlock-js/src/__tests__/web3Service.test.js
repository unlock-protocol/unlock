import { ethers, utils as ethersUtils } from 'ethers'
import http from 'http'
import TransactionTypes from '../transactionTypes'
import NockHelper from './helpers/nockHelper'
import Web3Service from '../web3Service'
import utils from '../utils'
import erc20 from '../erc20'
import erc20Abi from '../erc20abi'

import v4 from '../v4'
import v6 from '../v6'
import v7 from '../v7'
import v8 from '../v8'

const supportedVersions = [v4, v6, v7, v8]

const account = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
const readOnlyProvider = 'http://127.0.0.1:8545'
const unlockAddress = '0xc43efE2C7116CB94d563b5A9D68F260CCc44256F'
const lockAddress = '0x5ED6a5BB0fDA25eaC3B5D03fa875cB60A4639d8E'
const erc20ContractAddress = '0x1234123456789012345678901234567890567890'

const nock = new NockHelper(readOnlyProvider, false /** debug */)
let web3Service

jest.mock('../erc20.js', () => {
  return {
    getErc20Decimals: jest.fn(() => Promise.resolve(18)),
    getErc20BalanceForAddress: jest.fn(() => Promise.resolve('0x0')),
  }
})

const LockVersion = {}
const UnlockVersion = {}

describe('Web3Service', () => {
  async function nockBeforeEach({ endpoint = readOnlyProvider, network } = {}) {
    nock.cleanAll()
    // Ethers will only get the network id if none is passed
    if (!network) {
      nock.netVersionAndYield(1)
    }
    web3Service = new Web3Service({
      readOnlyProvider: endpoint,
      unlockAddress,
      network,
    })
    return nock.resolveWhenAllNocksUsed()
  }

  describe('setup', () => {
    it('should set up a JsonRpcProvider for a string endpoint', async () => {
      expect.assertions(1)

      await nockBeforeEach({})

      expect(web3Service.provider).toBeInstanceOf(
        ethers.providers.JsonRpcProvider
      )
    })

    it('should set up a JsonRpcProvider for a string endpoint with a network', async () => {
      expect.assertions(2)

      await nockBeforeEach({ network: 1337 })
      expect(web3Service.provider).toBeInstanceOf(
        ethers.providers.JsonRpcProvider
      )
      expect(web3Service.provider._network.chainId).toEqual(1337)
    })

    it('should set up a Web3Provider for a web3 provider endpoint', async () => {
      expect.assertions(1)
      // Endpoint is a web3 provider
      const endpoint = {
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
          const req = http.request(options, (res) => {
            let responseString = ''

            res.on('data', (data) => {
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
      }
      await nockBeforeEach({ endpoint })
      expect(web3Service.provider).toBeInstanceOf(ethers.providers.Web3Provider)
    })
  })

  describe('getAddressBalance', () => {
    it('should return the balance of the address', async () => {
      expect.assertions(1)
      await nockBeforeEach({})
      const balance = '0xdeadbeef'
      const inWei = utils.hexToNumberString(balance)
      const expectedBalance = utils.fromWei(inWei, 'ether')
      const address = '0x1df62f291b2e969fb0849d99d9ce41e2f137006e'

      nock.getBalanceForAccountAndYieldBalance(address, '0xdeadbeef')

      const addressBalance = await web3Service.getAddressBalance(address)
      expect(addressBalance).toEqual(expectedBalance)
    })

    it('should emit an error on error', async (done) => {
      expect.assertions(1)
      await nockBeforeEach({})
      const address = '0x1df62f291b2e969fb0849d99d9ce41e2f137006e'

      nock.getBalanceForAccountAndYieldBalance(address, '0xdeadbeef', {
        code: 404,
      })

      web3Service.on('error', (e) => {
        expect(e).toBeInstanceOf(Error)
        done()
      })
      await web3Service.getAddressBalance(address)
    })
  })

  describe('refreshAccountBalance', () => {
    it("refreshes balance and emits 'account.updated'", async () => {
      expect.assertions(3)
      await nockBeforeEach({})
      const balance = '0xdeadbeef'
      const inWei = utils.hexToNumberString(balance)
      const expectedBalance = utils.fromWei(inWei, 'ether')
      const address = '0x1df62f291b2e969fb0849d99d9ce41e2f137006e'
      const account = {
        address,
        fromLocalStorage: true,
      }

      nock.getBalanceForAccountAndYieldBalance(address, '0xdeadbeef')

      web3Service.on('account.updated', (sentAccount, info) => {
        expect(sentAccount).toBe(account)
        expect(info).toEqual({
          balance: expectedBalance,
        })
      })

      web3Service.on('error', (err) => {
        throw err // this is the only way we will see test failures!
      })

      const addressBalance = await web3Service.refreshAccountBalance(account)
      expect(addressBalance).toEqual(expectedBalance)
    })
  })

  describe('generateLockAddress', () => {
    describe('_create2Address', () => {
      it('should compute the correct address', async () => {
        expect.assertions(1)
        await nockBeforeEach({})
        const unlockAddress = '0xBe6ed9A686D288f23C721697e828480E13d138F2'
        const templateAddress = '0x842207a6a95A0455415db073352d18eB54C728a8'
        const account = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
        const lockSalt = '1d24dcf6d1c86a947c0e9563'
        expect(
          web3Service._create2Address(
            unlockAddress,
            templateAddress,
            account,
            lockSalt
          )
        ).toEqual('0x1c3c3E32878905490eDDFa7c98C47E6EBb003541')
      })
    })

    describe('when deploying an older lock', () => {
      // TODO: remove this once upgrade to v5 is done
      it('generates the correct address from nonce and contract address', async () => {
        expect.assertions(3)
        await nockBeforeEach({})
        web3Service.unlockContractAbiVersion = jest.fn(() => {
          return {
            version: 'v4',
          }
        })
        nock.getTransactionCount(unlockAddress.toLowerCase(), 0)
        expect(await web3Service.generateLockAddress()).toBe(
          '0x0e518e6FD65557Ad4B289bF37786C0c0CE2A5DBE'
        )
        nock.getTransactionCount(unlockAddress.toLowerCase(), 1)
        expect(await web3Service.generateLockAddress()).toBe(
          '0xe564352cbD6a8c09feeD8EE62e1672EC6794B83a'
        )
        nock.getTransactionCount(unlockAddress.toLowerCase(), 2)
        expect(await web3Service.generateLockAddress()).toBe(
          '0xd3F4Df04bBE21E12e706eCc2b2A3bDEf0327d2bD'
        )
      })
    })
  })

  describe('_getTransactionType', () => {
    function getEncoder(abi, method) {
      const contractInterface = new ethersUtils.Interface(abi)
      return contractInterface.functions[method].encode.bind(
        contractInterface.functions[method]
      )
    }

    it('should return null for unknown contracts', async () => {
      expect.assertions(1)
      await nockBeforeEach({})

      const Contract = {
        contractName: 'WhoDat',
        abi: ['hi() uint256'],
      }
      const hi = getEncoder(Contract.abi, 'hi')
      expect(web3Service._getTransactionType(Contract, hi([]))).toBe(null)
    })

    it('should return null for unknown Unlock method', async () => {
      expect.assertions(1)
      await nockBeforeEach({})
      const Contract = {
        contractName: 'Unlock',
        abi: ['hi() uint256'],
      }
      const hi = getEncoder(Contract.abi, 'hi')

      expect(web3Service._getTransactionType(Contract, hi([]))).toBe(null)
    })

    it('should return null for invalid data', async () => {
      expect.assertions(1)
      await nockBeforeEach({})
      const Contract = {
        contractName: 'Unlock',
        abi: ['hi() uint256'],
      }

      expect(
        web3Service._getTransactionType(Contract, 'this will not go over well')
      ).toBe(null)
    })

    it('should return null for unknown PublicLock method', async () => {
      expect.assertions(1)
      await nockBeforeEach({})
      const Contract = {
        contractName: 'PublicLock',
        abi: ['hi() uint256'],
      }
      const hi = getEncoder(Contract.abi, 'hi')

      expect(web3Service._getTransactionType(Contract, hi([]))).toBe(null)
    })
  })

  describe('_getKeyByLockForOwner (non-version specific tests)', () => {
    it('should yield the expiration date for the user key on the lock', async () => {
      expect.assertions(2)
      await nockBeforeEach({})
      const contract = {
        keyExpirationTimestampFor: jest.fn(() => {
          return Promise.resolve('123')
        }),
      }
      const account = '0xabc'
      const expiration = await web3Service._getKeyByLockForOwner(
        contract,
        account
      )
      expect(expiration).toEqual(123)
      expect(contract.keyExpirationTimestampFor).toHaveBeenCalledWith(account)
    })

    it('should return 0 if the value returned by the contract is 3963877391197344453575983046348115674221700746820753546331534351508065746944', async () => {
      expect.assertions(2)
      await nockBeforeEach({})
      const contract = {
        keyExpirationTimestampFor: jest.fn(() => {
          return Promise.resolve(
            '3963877391197344453575983046348115674221700746820753546331534351508065746944'
          )
        }),
      }
      const account = '0xabc'
      const expiration = await web3Service._getKeyByLockForOwner(
        contract,
        account
      )
      expect(expiration).toEqual(0)
      expect(contract.keyExpirationTimestampFor).toHaveBeenCalledWith(account)
    })

    it('should return 0 if there was an exception', async () => {
      expect.assertions(2)
      await nockBeforeEach({})
      const contract = {
        keyExpirationTimestampFor: jest.fn(() => {
          return Promise.reject('Error')
        }),
      }
      const account = '0xabc'
      const expiration = await web3Service._getKeyByLockForOwner(
        contract,
        account
      )
      expect(expiration).toEqual(0)
      expect(contract.keyExpirationTimestampFor).toHaveBeenCalledWith(account)
    })
  })

  describe('versions', () => {
    const versionSpecificLockMethods = ['getLock']

    it.each(versionSpecificLockMethods)(
      'should invoke the implementation of the corresponding version of %s',
      async (method) => {
        expect.assertions(3)
        await nockBeforeEach({})
        const args = []
        const result = {}
        const version = {
          [method](_args) {
            // Needs to be a function because it is bound to web3Service
            expect(this).toBe(web3Service)
            expect(_args).toBe(...args)
            return result
          },
        }
        web3Service.lockContractAbiVersion = jest.fn(() => version)
        const r = await web3Service[method](...args)
        expect(r).toBe(result)
      }
    )

    // for each supported version, let's make sure it implements all methods
    it.each(supportedVersions)(
      'should implement all the required methods',
      (version) => {
        expect.assertions(1)
        versionSpecificLockMethods.forEach((method) => {
          expect(version[method]).toBeInstanceOf(Function)
        })
      }
    )
  })

  describe('recoverAccountFromSignedData', () => {
    it('returns the signing address', async () => {
      expect.hasAssertions()

      const data = 'hello world'
      const account = '0x14791697260E4c9A71f18484C9f997B308e59325'
      const signature =
        '0xddd0a7290af9526056b4e35a077b9a11b513aa0028ec6c9880948544508f3c63' +
        '265e99e47ad31bb2cab9646c504576b3abc6939a1710afc08cbf3034d73214b8' +
        '1c'

      const returnedAddress = await web3Service.recoverAccountFromSignedData(
        data,
        signature
      )

      expect(returnedAddress).toBe(account)
    })
  })

  describe('getTokenBalance', () => {
    it('should yield the token balance based on the decimals number', async () => {
      expect.assertions(3)

      erc20.getErc20BalanceForAddress = jest.fn(() => {
        return Promise.resolve('36042555786755496657')
      })
      erc20.getErc20Decimals = jest.fn(() => {
        return Promise.resolve(7)
      })
      const user = '0x123'
      const erc20Contract = '0xabc'
      const balance = await web3Service.getTokenBalance(erc20Contract, user)

      expect(balance).toBe('3604255578675.5496657')
      expect(erc20.getErc20BalanceForAddress).toHaveBeenCalledWith(
        erc20Contract,
        user,
        web3Service.provider
      )
      expect(erc20.getErc20Decimals).toHaveBeenCalledWith(
        erc20Contract,
        web3Service.provider
      )
    })
  })

  describe('getTransaction', () => {
    const blockTransaction = {
      to: lockAddress,
    }
    const blockNumber = 1337
    const hash = 'hash'

    beforeEach(() => {
      web3Service.provider = {
        getBlockNumber: jest.fn(() => Promise.resolve(blockNumber)),
        getTransaction: jest.fn(() => Promise.resolve(null)),
      }
      web3Service.lockContractAbiVersion = jest.fn(() =>
        Promise.resolve(LockVersion)
      )
      web3Service.unlockContractAbiVersion = jest.fn(() =>
        Promise.resolve(UnlockVersion)
      )
    })

    it('should get the block number', async () => {
      expect.assertions(1)
      await web3Service.getTransaction(hash)
      expect(web3Service.provider.getBlockNumber).toHaveBeenCalledWith()
    })

    it('should get the transaction from the provider', async () => {
      expect.assertions(1)
      await web3Service.getTransaction(hash)
      expect(web3Service.provider.getTransaction).toHaveBeenCalledWith(hash)
    })

    describe('when the transaction has not been mined', () => {
      describe('when the transaction is not in the mempool', () => {
        it('should yield the bare info about the transaction if no default has been provided', async () => {
          expect.assertions(1)
          const transaction = await web3Service.getTransaction(hash)
          expect(transaction).toEqual({
            hash,
            blockNumber,
            confirmations: 0,
            status: 'submitted',
          })
        })

        it('should yield the transaction with its default', async () => {
          expect.assertions(2)
          const defaults = {
            input: '',
            to: lockAddress,
            from: account,
          }

          web3Service._getSubmittedTransaction = jest.fn((transaction) => {
            transaction.status = 'submitted'
            return transaction
          })

          const transaction = await web3Service.getTransaction(hash, defaults)
          expect(transaction).toEqual({
            hash,
            blockNumber,
            status: 'submitted',
            confirmations: 0,
          })
          expect(web3Service._getSubmittedTransaction).toHaveBeenCalledWith(
            transaction,
            LockVersion,
            defaults
          )
        })
      })

      describe('when the transaction is in the mempool', () => {
        beforeEach(() => {
          web3Service.provider.getTransaction = jest.fn(() =>
            Promise.resolve(blockTransaction)
          )
        })

        it('should return the transaction parsed from its submitted data', async () => {
          expect.assertions(2)

          web3Service._getPendingTransaction = jest.fn((transaction) => {
            transaction.status = 'pending'
            return transaction
          })

          const transaction = await web3Service.getTransaction(hash)
          expect(transaction).toEqual({
            hash,
            blockNumber,
            status: 'pending',
          })
          expect(web3Service._getPendingTransaction).toHaveBeenCalledWith(
            transaction,
            LockVersion,
            blockTransaction
          )
        })
      })
    })

    describe('when the transaction has been mined', () => {
      beforeEach(() => {
        web3Service.provider.getTransaction = jest.fn(() =>
          Promise.resolve({
            ...blockTransaction,
            blockNumber: blockNumber - 1, // Mined in the previous block!
          })
        )
        web3Service._getTransactionType = jest.fn(() => {
          return TransactionTypes.KEY_PURCHASE
        })
      })

      describe('when there is no transaction receipt', () => {
        beforeEach(() => {
          web3Service.provider.getTransactionReceipt = jest.fn(() =>
            Promise.resolve(null)
          )
        })

        it('should yield the right transaction object', async () => {
          expect.assertions(1)
          const transaction = await web3Service.getTransaction(hash)
          expect(transaction).toEqual({
            hash,
            blockNumber: blockNumber - 1,
            confirmations: 1,
            status: 'mined',
            type: TransactionTypes.KEY_PURCHASE,
          })
        })
      })
      describe('when there is a transaction receipt', () => {
        const transactionReceipt = {
          status: 'mined',
        }

        beforeEach(() => {
          web3Service.provider.getTransactionReceipt = jest.fn(() =>
            Promise.resolve(transactionReceipt)
          )
        })

        it('should yield the right transaction object', async () => {
          expect.assertions(2)

          web3Service._parseTransactionLogsFromReceipt = jest.fn(() =>
            Promise.resolve()
          )

          const transaction = await web3Service.getTransaction(hash)

          expect(
            web3Service._parseTransactionLogsFromReceipt
          ).toHaveBeenCalledWith(
            transaction,
            LockVersion.PublicLock,
            transactionReceipt,
            lockAddress
          )
          expect(transaction).toEqual({
            hash,
            blockNumber: blockNumber - 1,
            confirmations: 1,
            status: 'mined',
            type: TransactionTypes.KEY_PURCHASE,
          })
        })

        describe('when the transaction failed', () => {
          beforeEach(() => {
            web3Service.provider.getTransactionReceipt = jest.fn(() =>
              Promise.resolve({
                transactionReceipt,
                status: '0x0',
              })
            )
          })

          it('should yield the right transaction object', async () => {
            expect.assertions(1)
            const transaction = await web3Service.getTransaction(hash)
            expect(transaction).toEqual({
              hash,
              blockNumber: blockNumber - 1,
              confirmations: 1,
              status: 'failed',
              type: TransactionTypes.KEY_PURCHASE,
            })
          })
        })
      })
    })
  })

  describe('_parseTransactionFromInput', () => {
    const input =
      '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a'

    beforeEach(() => {
      web3Service = new Web3Service({
        readOnlyProvider,
        unlockAddress,
      })
    })

    it('should update the transaction marked as pending', async () => {
      expect.assertions(1)
      web3Service._getTransactionType = jest.fn(() => 'TRANSACTION_TYPE')
      const hash = 'hash'
      const transaction = {
        hash,
      }

      const FakeContract = { abi: [] }

      await web3Service._parseTransactionFromInput(
        transaction,
        FakeContract,
        input,
        web3Service.unlockContractAddress,
        'pending'
      )
      expect(transaction).toEqual({
        hash,
        status: 'pending',
        type: 'TRANSACTION_TYPE',
        confirmations: 0,
      })
    })

    it('should call the handler if the transaction input can be parsed', async (done) => {
      expect.assertions(4)
      web3Service._getTransactionType = jest.fn(() => 'TRANSACTION_TYPE')
      const input =
        '0x8c952a42000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000002686900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000057468657265000000000000000000000000000000000000000000000000000000'

      const hash = 'hash'
      const transaction = {
        hash,
      }

      // Fake method
      const method = {
        signature: '0x8c952a42',
        name: 'myMethod',
      }

      // Fake abi
      const FakeContract = {
        abi: ['myMethod(string hi,string there)'],
      }

      // fake params
      const params = {
        hi: 'hi',
        there: 'there',
      }
      // keeping track of it so we can clean it up (web3 has a singleton class down below)

      // Creating a fake handler
      web3Service.inputsHandlers[method.name] = (
        _transaction,
        contractAddress,
        sender,
        args
      ) => {
        expect(_transaction.hash).toEqual(transaction.hash)
        expect(contractAddress).toEqual(web3Service.unlockContractAddress)
        expect(sender).toEqual(transaction.from)
        expect(args).toEqual(params)
        done()
      }

      await web3Service._parseTransactionFromInput(
        transaction,
        FakeContract,
        input,
        web3Service.unlockContractAddress,
        transaction.from
      )
    })
  })

  describe('_getSubmittedTransaction', () => {
    const defaults = null
    const web3Service = new Web3Service({
      readOnlyProvider,
      unlockAddress,
    })

    it('should update the transaction with the right values', async () => {
      expect.assertions(1)
      const hash = 'hash'
      const transaction = {
        hash,
      }
      await web3Service._getSubmittedTransaction(
        transaction,
        LockVersion,
        defaults
      )
      expect(transaction).toEqual({
        hash,
      })
    })

    it('should invoke parseTransactionFromInput if the defaults include an input value', async () => {
      expect.assertions(3)

      const defaults = {
        input:
          '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a',
        to: '0xcfeb869f69431e42cdb54a4f4f105c19c080a601',
      }

      const hash = 'hash'
      const transaction = {
        hash,
      }
      web3Service._parseTransactionFromInput = jest.fn(
        (_transaction, contract, transactionInput, address) => {
          expect(_transaction.hash).toEqual(transaction.hash)
          expect(transactionInput).toEqual(defaults.input)
          expect(address).toEqual('0xcfeb869f69431e42cdb54a4f4f105c19c080a601')
        }
      )

      await web3Service._getSubmittedTransaction(
        transaction,
        LockVersion,
        defaults
      )
    })
  })

  describe('_getPendingTransaction', () => {
    const input =
      '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a'

    const transaction = {
      hash:
        '0x83f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
    }

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
      data: input,
    }

    beforeEach(() => {
      web3Service = new Web3Service({
        readOnlyProvider,
        unlockAddress,
      })
    })

    it('should invoke parseTransactionFromInput', async () => {
      expect.assertions(5)
      web3Service._getTransactionType = jest.fn(() => 'TRANSACTION_TYPE')

      web3Service._parseTransactionFromInput = jest.fn(
        (_transaction, contract, transactionInput, address, sender, status) => {
          expect(_transaction.hash).toEqual(transaction.hash)
          expect(transactionInput).toEqual(input)
          expect(address).toEqual('0xcfeb869f69431e42cdb54a4f4f105c19c080a601')
          expect(sender).toEqual('0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1')
          expect(status).toEqual('pending')
        }
      )

      await web3Service._getPendingTransaction(
        transaction,
        LockVersion,
        blockTransaction
      )
    })
  })

  describe('_parseTransactionLogsFromReceipt', () => {
    const encoder = ethers.utils.defaultAbiCoder

    describe('events', () => {
      it('ignores events from outside our contract', async () => {
        expect.assertions(2)
        const EventInfo = new ethers.utils.Interface(erc20Abi)
        const receipt = {
          blockNumber: 123,
          logs: [
            {
              address: erc20ContractAddress,
              data: encoder.encode(['uint'], [2]),
              topics: [
                EventInfo.events['Transfer(address,address,uint256)'].topic,
                encoder.encode(['address'], [unlockAddress]),
                encoder.encode(['address'], [lockAddress]),
                encoder.encode(['uint'], [2]),
              ],
            },
          ],
        }

        const hash = 'hash'
        const transaction = {
          hash,
        }

        web3Service.emitContractEvent = jest.fn()

        await web3Service._parseTransactionLogsFromReceipt(
          hash,
          { abi: [] },
          receipt,
          lockAddress
        )
        expect(transaction).toEqual({
          hash,
        })

        expect(web3Service.emitContractEvent).not.toHaveBeenCalled()
      })
    })
  })
})
