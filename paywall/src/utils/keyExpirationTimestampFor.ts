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
  return parseInt(result, 16) || 0
}

export default keyExpirationTimestampFor
