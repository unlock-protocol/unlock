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
    id: 31337, // Not used here
    jsonrpc: '2.0',
  }

  const response = await fetch(provider, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(rpcRequest),
  })

  const body = await response.json()
  const result = body.result
  if (parseInt(result, 16) > Number.MAX_SAFE_INTEGER) {
    // This will cover cases of locks returning NO_SUCH_KEY or `HAS_NEVER_OWNED_KEY` which are strings and much larger than Number.MAX_SAFE_INTEGER
    return 0
  }
  return parseInt(result, 16) || 0
}

export default keyExpirationTimestampFor
