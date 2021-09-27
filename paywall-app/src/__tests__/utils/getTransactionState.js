import { getTransaction } from '../../utils/getTransaction'

const jsonRpcEndpoint = 'https://eth-mainnet.alchemyapi.io/jsonrpc/'
const transactionHash =
  '0x85425ab32389a05426ca92934305b500f6a97aa102be99f9b7a65e65853773aa'
const rpcTransaction = {
  blockNumber: '0x5e7300',
}

describe('getTransaction', () => {
  it('should make the right request', async () => {
    expect.assertions(6)
    fetch.mockResponseOnce(
      JSON.stringify({
        jsonrpc: '2.0',
        result: rpcTransaction,
        id: 1773,
      })
    )
    const expiration = await getTransaction(jsonRpcEndpoint, transactionHash)
    expect(expiration).toEqual(rpcTransaction)
    expect(fetch.mock.calls.length).toEqual(1)
    expect(fetch.mock.calls[0][0]).toEqual(jsonRpcEndpoint)
    expect(fetch.mock.calls[0][1].method).toEqual('POST')
    const body = JSON.parse(fetch.mock.calls[0][1].body)
    expect(body).toMatchObject({
      jsonrpc: '2.0',
      method: 'eth_getTransactionByHash',
    })
    const params = body.params
    expect(params[0]).toEqual(transactionHash)
  })

  it('should return null if the transaction does not exist', async () => {
    expect.assertions(1)
    fetch.mockResponseOnce(
      JSON.stringify({
        jsonrpc: '2.0',
        result: null,
        id: 1773,
      })
    )
    const expiration = await getTransaction(jsonRpcEndpoint, transactionHash)
    expect(expiration).toEqual(null)
  })
})
