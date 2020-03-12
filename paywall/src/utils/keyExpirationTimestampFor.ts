export const NO_SUCH_KEY =
  '0x08c379a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000134841535f4e455645525f4f574e45445f4b455900000000000000000000000000'

export const keyExpirationTimestampFor = async (
  provider: string,
  lock: string,
  userAddress: string
) => {
  const rpcRequest = {
    method: 'eth_call',
    params: [
      {
        to: lock,
        data: `0xabdf82ce000000000000000000000000${userAddress.substring(2)}`,
      },
      'latest',
    ],
    id: 1337, // Not used here
    jsonrpc: '2.0',
  }

  const response = await fetch(provider, {
    method: 'POST',
    body: JSON.stringify(rpcRequest),
  })

  const body = await response.json()
  const result = body.result

  if (result === NO_SUCH_KEY) {
    return 0
  }
  return parseInt(result, 16) || 0
}

export default keyExpirationTimestampFor
