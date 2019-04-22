import Web3 from 'web3'
import { Unlock } from 'unlock-abi-0'

import deploy from '../deploy'
import { GAS_AMOUNTS } from '../constants'
import NockHelper from './helpers/nockHelper'

const host = '127.0.0.1'
const port = 8545

const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, false /** debug */)
const gasPrice = `0x${(8000000).toString(16)}`

describe('contract deployer', () => {
  const unlockAccountsOnNode = ['0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2']
  const transaction = {
    hash: '0x83f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
    nonce: '0x04',
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
  const transactionReceipt = {
    transactionIndex: '0x3',
    blockHash:
      '0xdc7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
    blockNumber: `0x${(14).toString('16')}`,
    gasUsed: '0x2ea84',
    cumulativeGasUsed: '0x3a525',
    contractAddress: '0xbbbdeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
    logs: [],
    status: '0x1',
  }
  const transaction2 = {
    hash: '0x93f3e76db42dfd5ebba894e6ff462b3ae30b5f7bfb7a6fec3888e0ed88377f64',
    nonce: '0x05',
    blockHash:
      '0xec7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
    blockNumber: `0x${(15).toString('16')}`,
    transactionIndex: '0x00',
    from: unlockAccountsOnNode[0],
    to: '0xbbbdeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
    value: '0x0',
    gas: '0x16e360',
    gasPrice: '0x04a817c800',
    input:
      '0xc4d66de8000000000000000000000000aaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
  }
  const transaction2Receipt = {
    transactionIndex: '0x4',
    blockHash:
      '0xec7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
    blockNumber: `0x${(15).toString('16')}`,
    gasUsed: '0x2ea84',
    cumulativeGasUsed: '0x3a525',
    contractAddress: '0xbbbdeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
    logs: [],
    status: '0x1',
  }
  beforeEach(() => {
    nock.cleanAll()
  })

  async function deployContract(Contract) {
    const web3 = new Web3(`http://${host}:${port}`)
    const unlock = new web3.eth.Contract(Contract.abi)

    nock.cleanAll()
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
    nock.ethGetTransactionReceipt(transaction.hash, transactionReceipt)
    // get the contract bytecode
    nock.ethGetCodeAndYield(
      '0xbbbdeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
      'latest',
      Contract.deployedByteCode
    )

    // initialize call
    nock.ethGasPriceAndYield(gasPrice)
    nock.ethSendTransactionAndYield(
      {
        to: '0xbbbdeed4c0b861cb36f4ce006a9c90ba2e43fdc2', // contract address
        from: unlockAccountsOnNode[0],
        data: unlock.methods.initialize(unlockAccountsOnNode[0]).encodeABI(),
        gas: '0xf4240',
      },
      gasPrice,
      transaction2.hash
    )
    nock.ethGetTransactionReceipt(transaction2.hash, transaction2Receipt)
  }

  describe('all JSON-RPC calls happen in expected order', () => {
    it('does not throw exception (json-rpc calls are accurate)', async () => {
      expect.assertions(0)

      await deployContract(Unlock)

      await deploy(host, port, Unlock)
      nock.ensureAllNocksUsed()
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

      expect(deployed.mock.calls[0][0].options.address).toBe(
        '0xBbBDeed4C0b861cb36f4Ce006A9c90bA2E43fDc2' // fancified by web3-utils
      )
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

      expect(returnValue).toEqual({
        blockHash: transaction2Receipt.blockHash,
        blockNumber: parseInt(transaction2Receipt.blockNumber, 16),
        contractAddress: '0xBbBDeed4C0b861cb36f4Ce006A9c90bA2E43fDc2',
        cumulativeGasUsed: 238885,
        gasUsed: 191108,
        logs: [],
        status: true,
        transactionIndex: parseInt(transaction2Receipt.transactionIndex, 16),
      })
    })
  })
})
