import hasValidKey from '../../utils/hasValidKey'

const jsonRpcEndpoint = 'https://eth-mainnet.alchemyapi.io/jsonrpc/'
const lockAddress = '0x75fa3aa7e999b9899010c5f05e52cd0543dab465'
const userAddress = 'c0f32eba9a4192d93209e83e03b95be7f81036d7'

describe('hasValidKey', () => {
  it('should make the right request', async () => {
    expect.assertions(7)
    fetch.mockResponseOnce(
      JSON.stringify({
        jsonrpc: '2.0',
        result:
          '0x0000000000000000000000000000000000000000000000000000000000000001',
        id: 1773,
      })
    )
    const expiration = await hasValidKey(
      jsonRpcEndpoint,
      lockAddress,
      userAddress
    )
    expect(expiration).toEqual(true)
    expect(fetch.mock.calls.length).toEqual(1)
    expect(fetch.mock.calls[0][0]).toEqual(jsonRpcEndpoint)
    expect(fetch.mock.calls[0][1].method).toEqual('POST')
    const body = JSON.parse(fetch.mock.calls[0][1].body)
    expect(body).toMatchObject({
      jsonrpc: '2.0',
      method: 'eth_call',
    })
    const { params } = body
    expect(params[0]).toEqual({
      data: `0x6d8ea5b4000000000000000000000000${userAddress.substring(2)}`,
      to: lockAddress,
    })
    expect(params[1]).toEqual('latest')
  })

  it('should not fail if the result is 0x', async () => {
    expect.assertions(1)
    fetch.mockResponseOnce(
      JSON.stringify({
        jsonrpc: '2.0',
        result: '0x',
        id: 1773,
      })
    )
    const expiration = await hasValidKey(
      'https://eth-mainnet.alchemyapi.io/jsonrpc/DazqAi1xewCexIggwLSZVkXdnztC-w0u',
      '0x75fa3aa7e999b9899010c5f05e52cd0543dab465',
      'c0f32eba9a4192d93209e83e03b95be7f81036d7'
    )
    expect(expiration).toEqual(false)
  })
})
