import { ethers } from 'ethers'
import { getContractAddress } from 'ethers/utils'
import { Unlock } from 'unlock-abi-0'

import deploy from '../deploy'
import { GAS_AMOUNTS } from '../constants'
import NockHelper from './helpers/nockHelper'

const host = '127.0.0.1'
const port = 8545

const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, false /** debug */, true /** ethers */)
const gasPrice = `0x${(8000000).toString(16)}`

describe('contract deployer', () => {
  const unlockAccountsOnNode = ['0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2']
  const transaction = {
    hash: '0x83f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
    nonce: '0x0',
    blockHash:
      '0xdc7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
    blockNumber: `0x${(14).toString('16')}`,
    transactionIndex: '0x00',
    from: unlockAccountsOnNode[0],
    to: '0xbbbdeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
    value: '0x0',
    gas: '0x16e360',
    gasPrice: '0x04a817c800',
    input:
      '0x2bc888bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000278d00000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000a',
  }
  const contractAddress = getContractAddress(transaction)
  const transactionReceipt = {
    transactionHash:
      '0x83f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
    transactionIndex: '0x00',
    blockHash:
      '0xdc7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
    blockNumber: `0x${(14).toString('16')}`,
    gasUsed: '0x2ea84',
    cumulativeGasUsed: '0x3a525',
    contractAddress,
    logs: [],
    status: '0x1',
  }
  const transaction2 = {
    hash: '0x93f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
    nonce: '0x01',
    blockHash:
      '0xec7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
    blockNumber: `0x${(15).toString('16')}`,
    transactionIndex: '0x00',
    from: unlockAccountsOnNode[0],
    to: contractAddress,
    value: '0x0',
    gas: '0x16e360',
    gasPrice: '0x04a817c800',
    input:
      '0xc4d66de8000000000000000000000000aaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
  }
  const transaction2Receipt = {
    transactionHash:
      '0x93f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
    transactionIndex: '0x4',
    blockHash:
      '0xec7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
    blockNumber: `0x${(15).toString('16')}`,
    gasUsed: '0x2ea84',
    cumulativeGasUsed: '0x3a525',
    logs: [],
    status: '0x1',
  }
  beforeEach(() => {
    nock.cleanAll()
  })

  async function deployContract(Contract) {
    const unlock = new ethers.utils.Interface(Contract.abi)

    nock.cleanAll()
    nock.accountsAndYield(unlockAccountsOnNode)
    nock.netVersionAndYield(1984) // ethers.js-only call
    // nock.ethGasPriceAndYield(gasPrice) (web3-only call)
    nock.accountsAndYield(unlockAccountsOnNode) // ethers.js-only call

    // contract deploy call
    nock.ethSendTransactionAndYield(
      {
        from: unlockAccountsOnNode[0],
        data: Unlock.bytecode,
        gas: '0x' + GAS_AMOUNTS.deployContract.toString(16),
      },
      false, // ethers.js does not use gasPrice
      transaction.hash
    )
    nock.ethGetTransactionByHash(transaction.hash, transaction)
    nock.ethBlockNumber(`0x${(14).toString('16')}`)
    nock.ethGetTransactionReceipt(transaction.hash, transactionReceipt)
    nock.ethGetTransactionReceipt(transaction.hash, transactionReceipt)
    // get the contract bytecode (web3-only)
    /*nock.ethGetCodeAndYield(
      '0xbbbdeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
      'latest',
      Contract.deployedByteCode
    )*/

    // initialize call
    // nock.ethGasPriceAndYield(gasPrice) // web3-only
    nock.ethSendTransactionAndYield(
      {
        to: contractAddress,
        from: unlockAccountsOnNode[0],
        data: unlock.functions['initialize(address)'].encode([
          unlockAccountsOnNode[0],
        ]),
        gas: '0xf4240',
      },
      false, // gasPrice, // web3-only
      transaction2.hash
    )
    nock.ethGetTransactionByHash(transaction2.hash, transaction2)
    // nock.ethGetTransactionReceipt(transaction2.hash, transaction2Receipt) // web3-only
  }

  describe('all JSON-RPC calls happen in expected order', () => {
    it('does not throw exception (json-rpc calls are accurate)', async () => {
      expect.assertions(0)

      await deployContract(Unlock)

      await deploy(host, port, Unlock)
      nock.ensureAllNocksUsed()
    })
  })

  describe('failure is reported properly', () => {
    it('throws on failure', async () => {
      expect.assertions(1)
      nock.accountsAndYield(unlockAccountsOnNode)
      nock.ethGasPriceAndYield(gasPrice)

      // contract deploy call
      nock.ethSendTransactionAndYield(
        {
          from: unlockAccountsOnNode[0],
          data: Unlock.bytecode,
          gas: '0x' + GAS_AMOUNTS.deployContract.toString(16),
        },
        gasPrice,
        transaction.hash,
        new Error('ran out of gas, you miser')
      )

      try {
        await deploy(host, port, Unlock)
      } catch (e) {
        // this is intentionally vague, since the actual error content will change with other frameworks
        expect(e).toBeInstanceOf(Error)
      }
    })

    it('throws on yield of 0x in transactionReceipt', async () => {
      expect.assertions(1)
      nock.accountsAndYield(unlockAccountsOnNode)
      nock.ethGasPriceAndYield(gasPrice)

      // contract deploy call
      nock.ethSendTransactionAndYield(
        {
          from: unlockAccountsOnNode[0],
          data: Unlock.bytecode,
          gas: '0x' + GAS_AMOUNTS.deployContract.toString(16),
        },
        gasPrice,
        transaction.hash
      )
      nock.ethGetTransactionReceipt(
        transaction.hash,
        {
          ...transactionReceipt,
          status: '0x',
        },
        new Error('failed, ran out of gas?')
      )
      nock.ethGetTransactionReceipt(
        transaction.hash,
        {
          ...transactionReceipt,
          status: '0x',
        },
        new Error('failed, ran out of gas?')
      )

      try {
        await deploy(host, port, Unlock)
      } catch (e) {
        // this is intentionally vague, since the actual error content will change with other frameworks
        expect(e).toBeInstanceOf(Error)
      }
    })
  })

  describe('callback', () => {
    let deployed
    beforeEach(async () => {
      deployed = jest.fn()
      deployContract(Unlock)
      await deploy(host, port, Unlock, deployed)
    })

    it('passes the new contract instance to onNewContractInstance', async () => {
      expect.assertions(1)

      // const contractAddress = deployed.mock.calls[0][0].options.address // web3
      const sentAddress = deployed.mock.calls[0][0].address // ethers.js

      expect(sentAddress).toBe(contractAddress)
    })
  })

  describe('return value', () => {
    let returnValue
    beforeEach(async () => {
      deployContract(Unlock)
      returnValue = await deploy(host, port, Unlock)
    })

    it('returns the result of the contract initialization transaction', async () => {
      expect.assertions(1)

      expect(returnValue).toEqual(
        expect.objectContaining({
          blockHash: transaction2Receipt.blockHash,
          blockNumber: parseInt(transaction2Receipt.blockNumber, 16),
        })
      )
    })
  })
})
