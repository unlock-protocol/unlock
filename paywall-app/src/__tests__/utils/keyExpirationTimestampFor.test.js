import keyExpirationTimestampFor from '../../utils/keyExpirationTimestampFor'

export const NO_SUCH_KEY =
  '0x08c379a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000134841535f4e455645525f4f574e45445f4b4559000000000000000000'

const jsonRpcEndpoint = 'https://eth-mainnet.alchemyapi.io/jsonrpc/'
const lockAddress = '0x75fa3aa7e999b9899010c5f05e52cd0543dab465'
const userAddress = 'c0f32eba9a4192d93209e83e03b95be7f81036d7'

describe('keyExpirationTimestampFor', () => {
  it('should make the right request', async () => {
    expect.assertions(7)
    fetch.mockResponseOnce(
      JSON.stringify({
        jsonrpc: '2.0',
        result:
          '0x000000000000000000000000000000000000000000000000000000005dc1d37f',
        id: 1773,
      })
    )
    const expiration = await keyExpirationTimestampFor(
      jsonRpcEndpoint,
      lockAddress,
      userAddress
    )
    expect(expiration).toEqual(1572983679)
    expect(fetch.mock.calls.length).toEqual(1)
    expect(fetch.mock.calls[0][0]).toEqual(jsonRpcEndpoint)
    expect(fetch.mock.calls[0][1].method).toEqual('POST')
    const body = JSON.parse(fetch.mock.calls[0][1].body)
    expect(body).toMatchObject({
      jsonrpc: '2.0',
      method: 'eth_call',
    })
    const params = body.params
    expect(params[0]).toEqual({
      data: `0xabdf82ce000000000000000000000000${userAddress.substring(2)}`,
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
    const expiration = await keyExpirationTimestampFor(
      'https://eth-mainnet.alchemyapi.io/jsonrpc/DazqAi1xewCexIggwLSZVkXdnztC-w0u',
      '0x75fa3aa7e999b9899010c5f05e52cd0543dab465',
      'c0f32eba9a4192d93209e83e03b95be7f81036d7'
    )
    expect(expiration).toEqual(0)
  })

  it('should return zero when result is NO_SUCH_KEY', async () => {
    expect.assertions(1)
    fetch.mockResponseOnce(
      JSON.stringify({
        jsonrpc: '2.0',
        result: NO_SUCH_KEY,
        id: 1773,
      })
    )
    const expiration = await keyExpirationTimestampFor(
      'https://eth-mainnet.alchemyapi.io/jsonrpc/DazqAi1xewCexIggwLSZVkXdnztC-w0u',
      '0x75fa3aa7e999b9899010c5f05e52cd0543dab465',
      'c0f32eba9a4192d93209e83e03b95be7f81036d7'
    )
    expect(expiration).toEqual(0)
  })
})
