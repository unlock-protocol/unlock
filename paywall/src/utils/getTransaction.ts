/**
 * Gets a transaction from the RPC endpoint
 * @param provider
 * @param transactionHash
 */
export const getTransaction = async (
  provider: string,
  transactionHash: string
) => {
  const rpcRequest = {
    method: 'eth_getTransactionByHash',
    params: [transactionHash],
    id: 1337, // Not used here
    jsonrpc: '2.0',
  }

  const response = await fetch(provider, {
    method: 'POST',
    body: JSON.stringify(rpcRequest),
  })

  const body = await response.json()
  return body.result
}

export default getTransaction
