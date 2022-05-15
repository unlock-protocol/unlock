export const hasValidKey = async (
  provider: string,
  lock: string,
  userAddress: string
) => {
  const rpcRequest = {
    method: 'eth_call',
    params: [
      {
        to: lock,
        data: `0x6d8ea5b4000000000000000000000000${userAddress.substring(2)}`,
      },
      'latest',
    ],
    id: 31337, // Not used here
    jsonrpc: '2.0',
  }

  try {
    const response = await fetch(provider, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rpcRequest),
    })

    if (!response) {
      return 0
    }
    const { result } = await response.json()

    return parseInt(result, 16) === 1
  } catch (error: any) {
    console.error(
      `Error fetching hasValidKey for ${userAddress} on ${lock}: ${error}`
    )
    return false
  }
}

export default hasValidKey
