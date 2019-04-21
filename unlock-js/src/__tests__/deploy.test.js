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
  beforeEach(() => {
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
      Unlock.bytecode
    )
    nock.ethGasPriceAndYield(gasPrice)
    // initialize call
    nock.ethSendTransactionAndYield(
      {
        to: '0xbbbdeed4c0b861cb36f4ce006a9c90ba2e43fdc2', // contract address
        from: unlockAccountsOnNode[0],
        data:
          '0xc4d66de8000000000000000000000000aaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2', // data (no idea what this is, but there it is)
        gas: '0xf4240',
      },
      gasPrice,
      transaction.hash
    )
    nock.ethGetTransactionReceipt(transaction.hash, transactionReceipt)
  })

  it('does not throw exception (json-rpc calls are accurate)', async () => {
    // beforeEach fails if this is untrue
    expect.assertions(0)

    await deploy(host, port, Unlock)
  })

  it('passes the new contract instance to onNewContractInstance', async () => {
    expect.assertions(1)
    const deployed = jest.fn()

    await deploy(host, port, Unlock, deployed)

    expect(deployed.mock.calls[0][0].options.address).toBe(
      '0xBbBDeed4C0b861cb36f4Ce006A9c90bA2E43fDc2' // fancified by web3-utils
    )
  })

  it('returns the result of the contract initialization transaction', async () => {
    expect.assertions(1)

    const returnValue = await deploy(host, port, Unlock)

    expect(returnValue).toEqual({
      blockHash:
        '0xdc7c95899e030f3104871a597866767ec296e948a24e99b12e0b251011d11c36',
      blockNumber: 14,
      contractAddress: '0xBbBDeed4C0b861cb36f4Ce006A9c90bA2E43fDc2',
      cumulativeGasUsed: 238885,
      gasUsed: 191108,
      logs: [],
      status: true,
      transactionIndex: 3,
    })
  })
})
