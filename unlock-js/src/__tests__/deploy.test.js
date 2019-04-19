import nock from 'nock'
import Web3 from 'web3'
import { Unlock } from 'unlock-abi-0'

import deploy from '../deploy'

const host = '127.0.0.1'
const port = 8545
const readOnlyProvider = `http://${host}:${port}`

const nockScope = nock(readOnlyProvider, { encodedQueryParams: true })

let rpcRequestId = 0

let debug = false // set to true to see more logging statements

function logNock(...args) {
  if (debug) {
    /* eslint-disable-next-line */
    console.log(...args)
  }
}

// Generic call
const jsonRpcRequest = (method, params, result, error) => {
  rpcRequestId += 1
  nockScope
    .post('/', { jsonrpc: '2.0', id: rpcRequestId, method, params })
    .reply(200, { id: rpcRequestId, jsonrpc: '2.0', result, error })
    .log(logNock)
}

// eth_accounts
const accountsAndYield = accounts => {
  return jsonRpcRequest('eth_accounts', [], accounts)
}

// eth_gasPrice
const ethGasPriceAndYield = () => {
  return jsonRpcRequest('eth_gasPrice', [], 8000000)
}

// eth_sendTransaction
const sendTransactionAndYield = (
  from,
  result,
  data = Unlock.bytecode,
  to = false,
  gas = '0x3d0900'
) => {
  return jsonRpcRequest(
    'eth_sendTransaction',
    [
      {
        ...(to ? { to } : {}),
        from,
        gas,
        data,
        gasPrice: 8000000,
      },
    ],
    result
  )
}

// eth_getTransactionReceipt
const ethGetTransactionReceiptAndYield = (hash, result) => {
  return jsonRpcRequest('eth_getTransactionReceipt', [hash], result)
}

// eth_getCode
const ethGetCodeAndYield = (address, tag) => {
  return jsonRpcRequest(
    'eth_getCode',
    [address, tag],
    '0x6000357c0100000000000000000000000000000000000000000000000000000000900480633284fd791461004557806370a0823114610059578063ccb767ae1461006e57005b610053600435602435610082565b60006000f35b6100646004356100f8565b8060005260206000f35b61007c600435602435610136565b60006000f35b60015473ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146100bc576100f3565b80600060008473ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000209081540190819060000155505b5b5050565b6000600060008373ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205463ffffffff169050610131565b919050565b8063ffffffff16600060003373ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205463ffffffff16106101775761017c565b6101e9565b80600060003373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002090815403908190600001555080600060008473ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000209081540190819060000155505b505056'
  )
}

nock.emitter.on('no match', function(clientRequestObject, options, body) {
  if (debug) {
    /* eslint-disable-next-line */
    console.log(`NO HTTP MOCK EXISTS FOR THAT REQUEST\n${body}`)
  }
})

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
    accountsAndYield(unlockAccountsOnNode)
    ethGasPriceAndYield()
    sendTransactionAndYield(unlockAccountsOnNode[0], transaction.hash)
    ethGetTransactionReceiptAndYield(transaction.hash, transactionReceipt)
    ethGetCodeAndYield('0xbbbdeed4c0b861cb36f4ce006a9c90ba2e43fdc2', 'latest')
    ethGasPriceAndYield()
    sendTransactionAndYield(
      unlockAccountsOnNode[0],
      transaction.hash,
      '0xc4d66de8000000000000000000000000aaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2', // data (no idea what this is, but there it is)
      '0xbbbdeed4c0b861cb36f4ce006a9c90ba2e43fdc2', // contract address
      '0xf4240' // gas
    )
    ethGetTransactionReceiptAndYield(transaction.hash, transactionReceipt)
  })
  it('retrieves accounts', async () => {
    expect.assertions(1)
    const web3 = new Web3(`http://${host}:${port}`)
    const getAccounts = web3.eth.getAccounts
    web3.eth.getAccounts = jest.fn(() => getAccounts())

    await deploy(host, port, Unlock, 4000000, () => {}, web3)
    expect(web3.eth.getAccounts).toHaveBeenCalled()
  })

  it('passes the new contract instance to onNewContractInstance', async () => {
    expect.assertions(1)
    const deployed = jest.fn()

    await deploy(host, port, Unlock, 4000000, deployed)

    expect(deployed.mock.calls[0][0].options.address).toBe(
      '0xBbBDeed4C0b861cb36f4Ce006A9c90bA2E43fDc2' // fancified by web3-utils
    )
  })

  it('calls initialize on the contract', async () => {
    expect.assertions(1)
    const web3 = new Web3(`http://${host}:${port}`)
    const sendTransaction = web3.eth.sendTransaction
    web3.eth.sendTransaction = jest.fn(t => sendTransaction(t))

    await deploy(host, port, Unlock, 4000000, () => {}, web3)
    expect(web3.eth.sendTransaction).toHaveBeenLastCalledWith(
      expect.objectContaining({
        to: '0xbbbdeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
        from: unlockAccountsOnNode[0],
        data: expect.any(String),
        gas: '0xf4240',
      })
    )
  })

  it('returns the result of the contract initialization transaction', async () => {
    expect.assertions(1)

    const returnValue = await deploy(host, port, Unlock, 4000000)

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
